import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt, { JwtPayload } from 'jsonwebtoken';
import dbConnect from '@/lib/db/connect';
import Order from '@/lib/models/Order';
import User from '@/lib/models/User';
import { sendOrderShippedEmail } from '@/lib/email/sendEmail';

async function getUserIdFromToken() {
    const cookieStore = await cookies();
    const token = cookieStore.get('admin_token')?.value || cookieStore.get('token')?.value;
    if (!token) return null;
    try {
        const secret = process.env.JWT_SECRET || 'fallback_secret_key_change_me';
        const decoded = jwt.verify(token, secret) as JwtPayload;
        return decoded.id;
    } catch (error) {
        return null;
    }
}

export async function GET(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await dbConnect();
        const { id } = await params;

        // Auth Check
        const userId = await getUserIdFromToken();
        if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        const user = await User.findById(userId);
        if (!user || user.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

        const order = await Order.findById(id).populate('user', 'name email');

        if (!order) {
            return NextResponse.json({ error: 'Order not found' }, { status: 404 });
        }

        return NextResponse.json(order);

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function PUT(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await dbConnect();
        const { id } = await params;
        const body = await req.json();

        // Auth Check
        const userId = await getUserIdFromToken();
        if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        const admin = await User.findById(userId);
        if (!admin || admin.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

        const order = await Order.findById(id);
        if (!order) {
            return NextResponse.json({ error: 'Order not found' }, { status: 404 });
        }

        // Update logic
        if (body.status) {
            // Check if status is changing to 'Delivered'
            if (body.status === 'Delivered' && order.status !== 'Delivered') {
                const recipientEmail = order.shippingAddress?.email;
                if (recipientEmail) {
                    // Send email asynchronously without blocking the response
                    console.log(`📧 Triggering delivery email for order ${order._id}...`);
                    import('@/lib/email/sendEmail').then(({ sendOrderDeliveredEmail }) => {
                        sendOrderDeliveredEmail(recipientEmail, order)
                            .then(() => console.log('✅ Delivery email sent'))
                            .catch(err => console.error('❌ Failed to send delivery email:', err));
                    });
                }
            }
            order.status = body.status;
        }

        if (typeof body.isPaid === 'boolean') {
            order.isPaid = body.isPaid;
            if (body.isPaid) order.paidAt = Date.now();
            else order.paidAt = undefined;
        }

        if (typeof body.isArchived === 'boolean') {
            order.isArchived = body.isArchived;
        }

        if (body.shippingAddress) {
            order.shippingAddress = {
                ...order.shippingAddress,
                ...body.shippingAddress
            };
        }

        if (body.trackingId !== undefined) {
            order.trackingId = body.trackingId;
        }

        if (body.courierCompany !== undefined) {
            order.courierCompany = body.courierCompany;
        }

        const updatedOrder = await order.save();


        // Manual trigger for shipment email
        if (body.sendTrackingEmail) {
            console.log(`📧 Manual trigger: Sending shipment email for order ${updatedOrder._id}...`);
            const recipientEmail = updatedOrder.shippingAddress?.email;

            if (updatedOrder.trackingId && recipientEmail) {
                try {
                    await sendOrderShippedEmail(recipientEmail, updatedOrder);
                    console.log('✅ Shipment email sent successfully');
                    return NextResponse.json({ ...updatedOrder.toObject(), message: 'Email sent successfully' });
                } catch (emailError) {
                    console.error('❌ Failed to send shipment email:', emailError);
                    return NextResponse.json({ ...updatedOrder.toObject(), message: 'Failed to send email' }, { status: 500 });
                }
            } else {
                return NextResponse.json({ ...updatedOrder.toObject(), message: 'Missing tracking ID or customer email' }, { status: 400 });
            }
        }

        return NextResponse.json(updatedOrder);

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function DELETE(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await dbConnect();
        const { id } = await params;

        // Auth Check
        const userId = await getUserIdFromToken();
        if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        const admin = await User.findById(userId);
        if (!admin || admin.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

        const order = await Order.findByIdAndDelete(id);

        if (!order) {
            return NextResponse.json({ error: 'Order not found' }, { status: 404 });
        }

        return NextResponse.json({ message: 'Order deleted successfully' });

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
