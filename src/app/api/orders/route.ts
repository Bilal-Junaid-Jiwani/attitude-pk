import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db/connect';
import Order from '@/lib/models/Order';
import User from '@/lib/models/User';

export async function POST(req: Request) {
    try {
        await dbConnect();
        const body = await req.json();
        const { user, items, totalAmount, shippingAddress, paymentMethod } = body;

        // Basic validation
        if (!items || items.length === 0) {
            return NextResponse.json({ message: 'No items in order' }, { status: 400 });
        }

        if (!shippingAddress || !shippingAddress.fullName || !shippingAddress.address || !shippingAddress.city || !shippingAddress.phone) {
            return NextResponse.json({ message: 'Missing shipping information' }, { status: 400 });
        }

        // Create Order
        const order = await Order.create({
            user: user || null,
            items,
            totalAmount,
            shippingAddress,
            paymentMethod: paymentMethod || 'COD',
            status: 'Pending',
        });

        // If user logged in, optional: update their default address if empty? 
        // For now, let's strictly process the order.

        return NextResponse.json({ success: true, orderId: order._id, message: 'Order placed successfully' }, { status: 201 });

    } catch (error) {
        console.error('Order processing error:', error);
        return NextResponse.json({ message: 'Internal Server Error', error: String(error) }, { status: 500 });
    }
}
