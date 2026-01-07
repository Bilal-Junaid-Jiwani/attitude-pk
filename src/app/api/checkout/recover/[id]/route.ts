import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db/connect';
import AbandonedCheckout from '@/lib/models/AbandonedCheckout';

export async function GET(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    await dbConnect();
    try {
        const { id } = await params;
        const cart = await AbandonedCheckout.findById(id).select('cartItems totalAmount clickedAt');

        if (!cart) {
            return NextResponse.json({ error: 'Cart not found' }, { status: 404 });
        }

        // Track Click
        if (!cart.clickedAt) {
            cart.clickedAt = new Date();
            await cart.save();
        }

        return NextResponse.json(cart);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
