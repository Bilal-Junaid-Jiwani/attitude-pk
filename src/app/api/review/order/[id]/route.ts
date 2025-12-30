import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db/connect';
import Order from '@/lib/models/Order';

export async function GET(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await dbConnect();
        const { id } = await params;

        // Fetch order with just items populated (or items are embedded). checks for validity.
        // We are NOT populating sensitive user info to keep this safe for sharing.
        const order = await Order.findById(id).select('items status createdAt');

        if (!order) {
            return NextResponse.json({ error: 'Order not found' }, { status: 404 });
        }

        return NextResponse.json({
            items: order.items,
            status: order.status,
            createdAt: order.createdAt
        });

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
