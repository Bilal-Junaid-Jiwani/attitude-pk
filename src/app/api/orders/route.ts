import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt, { JwtPayload } from 'jsonwebtoken';
import dbConnect from '@/lib/db/connect';
import Order from '@/lib/models/Order';
import User from '@/lib/models/User';
import Product from '@/lib/models/Product';
import { sendOrderConfirmationEmail, sendAdminNewOrderEmail } from '@/lib/email/sendEmail';

// Helper to get user ID from token
async function getUserIdFromToken() {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;

    if (!token) return null;

    try {
        const secret = process.env.JWT_SECRET || 'fallback_secret_key_change_me';
        const decoded = jwt.verify(token, secret) as JwtPayload;
        return decoded.id;
    } catch (error) {
        return null;
    }
}

export async function GET(req: Request) {
    try {
        await dbConnect();
        const userId = await getUserIdFromToken();
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        const orders = await Order.find({ user: userId }).sort({ createdAt: -1 });
        return NextResponse.json({ orders }, { status: 200 });
    } catch (error) {
        console.error('Order fetching error:', error);
        return NextResponse.json({ message: 'Internal Server Error', error: String(error) }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        await dbConnect();
        const body = await req.json();
        const { user, items, totalAmount, shippingAddress, paymentMethod, subtotal, shippingCost, tax, discount, couponCode } = body;

        console.log('📦 New Order Received:', { totalAmount, itemCount: items?.length });
        items?.forEach((item: any, idx: number) => {
            console.log(`   Item ${idx + 1}: ${item.name} | VariantID: ${item.variantId} | Qty: ${item.quantity}`);
        });


        // Basic validation
        if (!items || items.length === 0) {
            return NextResponse.json({ message: 'No items in order' }, { status: 400 });
        }

        if (!shippingAddress || !shippingAddress.fullName || !shippingAddress.address || !shippingAddress.city || !shippingAddress.phone) {
            return NextResponse.json({ message: 'Missing shipping information' }, { status: 400 });
        }

        // Enrich items with cost and SKU from product database for profit tracking
        const enrichedItems = await Promise.all(items.map(async (item: any) => {
            try {
                const product = await Product.findById(item.product_id).lean() as any;
                if (product) {
                    // Check if variant
                    if (item.variantId && product.variants) {
                        const variant = product.variants.find((v: any) => v._id?.toString() === item.variantId);
                        if (variant) {
                            return {
                                ...item,
                                costPerItem: variant.costPerItem || product.costPerItem || 0,
                                sku: variant.sku || product.sku || ''
                            };
                        }
                    }
                    // Main product
                    return {
                        ...item,
                        costPerItem: product.costPerItem || 0,
                        sku: product.sku || ''
                    };
                }
            } catch (e) {
                console.error('Failed to fetch product cost:', e);
            }
            return { ...item, costPerItem: 0, sku: '' };
        }));

        // Create Order
        const order = await Order.create({
            user: user || null,
            items: enrichedItems,
            totalAmount,
            subtotal,
            shippingCost,
            tax,
            discount,
            couponCode,
            shippingAddress,
            paymentMethod: paymentMethod || 'COD',
            status: 'Pending',
        });

        // Update Stock Levels
        try {
            await Promise.all(items.map(async (item: any) => {
                if (item.variantId) {
                    await Product.findOneAndUpdate(
                        { _id: item.product_id, "variants._id": item.variantId },
                        { $inc: { "variants.$.stock": -item.quantity } }
                    );
                } else {
                    await Product.findByIdAndUpdate(item.product_id, { $inc: { stock: -item.quantity } });
                }
            }));
        } catch (stockError) {
            console.error('Failed to update stock levels:', stockError);
        }

        // Auto-update profile
        if (user) {
            try {
                const userProfile = await User.findById(user);
                if (userProfile) {
                    const updates: any = {};
                    if (!userProfile.phone && shippingAddress.phone) updates.phone = shippingAddress.phone;
                    if (!userProfile.address && shippingAddress.address) {
                        updates.address = shippingAddress.address;
                        updates.city = shippingAddress.city;
                    }
                    if (!userProfile.postcode && shippingAddress.postalCode) updates.postcode = shippingAddress.postalCode;

                    if (Object.keys(updates).length > 0) {
                        await User.findByIdAndUpdate(user, updates);
                    }
                }
            } catch (err) {
                console.error('Failed to auto-update user profile:', err);
            }
        }

        // Send Email Notifications
        // 1. Customer Email
        try {
            let customerEmail: string | null = null;
            if (shippingAddress.email) {
                customerEmail = shippingAddress.email;
            } else if (user) {
                try {
                    const userProfile = await User.findById(user);
                    customerEmail = userProfile?.email || null;
                } catch (uErr) {
                    console.error('⚠️ Failed to fetch user profile for email:', uErr);
                }
            }

            if (customerEmail) {
                console.log(`📧 Sending Invoice to: ${customerEmail}`);
                await sendOrderConfirmationEmail(customerEmail, order);
            }
        } catch (customerErr) {
            console.error('❌ Failed to send Customer Invoice:', customerErr);
        }

        // 2. Admin Email
        try {
            await sendAdminNewOrderEmail(order);
        } catch (adminErr) {
            console.error('❌ Failed to send Admin Notification:', adminErr);
        }

        return NextResponse.json({ success: true, orderId: order._id, message: 'Order placed successfully' }, { status: 201 });

    } catch (error) {
        console.error('❌ Order processing error:', error);
        return NextResponse.json({ message: 'Internal Server Error', error: String(error) }, { status: 500 });
    }
}
