import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db/connect';
import Order from '@/lib/models/Order';

export async function POST(req: Request) {
    try {
        await dbConnect();
        const { orderId } = await req.json();

        if (!orderId) {
            return NextResponse.json({ message: 'Order ID is required' }, { status: 400 });
        }

        // Find order by ID
        const order = await Order.findById(orderId).select('status totalAmount items createdAt paymentMethod shippingAddress.city');

        if (!order) {
            return NextResponse.json({ message: 'Order not found' }, { status: 404 });
        }

        return NextResponse.json({ success: true, order }, { status: 200 });

    } catch (error) {
        console.error('Track order error:', error);
        return NextResponse.json({ message: 'Invalid Order ID or System Error' }, { status: 500 });
    }
}
