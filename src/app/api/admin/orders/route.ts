import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db/connect';
import Order from '@/lib/models/Order';
import '@/lib/models/User';

export async function GET() {
    try {
        await dbConnect();

        const orders = await Order.find()
            .sort({ createdAt: -1 })
            .limit(10)
            .populate('user', 'name email');

        return NextResponse.json(orders);

    } catch (error) {
        console.error('Orders API Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
