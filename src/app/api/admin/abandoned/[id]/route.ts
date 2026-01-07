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
        const cart = await AbandonedCheckout.findById(id);

        if (!cart) {
            return NextResponse.json({ error: 'Abandoned cart not found' }, { status: 404 });
        }

        return NextResponse.json(cart);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
