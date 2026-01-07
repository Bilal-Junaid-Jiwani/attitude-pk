import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db/connect';
import AbandonedCheckout from '@/lib/models/AbandonedCheckout';
import { sendAbandonedCartEmail } from '@/lib/email/sendEmail';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { cartId } = body;

        if (!cartId) {
            return NextResponse.json({ error: 'Cart ID is required' }, { status: 400 });
        }

        await dbConnect();

        const cart = await AbandonedCheckout.findById(cartId);

        if (!cart) {
            return NextResponse.json({ error: 'Cart not found' }, { status: 404 });
        }

        if (!cart.email) {
            return NextResponse.json({ error: 'Cart has no email address' }, { status: 400 });
        }

        console.log(`Sending abandoned cart email to ${cart.email} for cart ${cartId}`);
        await sendAbandonedCartEmail(cart.email, cart);

        // Mark as sent
        cart.recoverySentAt = new Date();
        cart.recoveryCount = (cart.recoveryCount || 0) + 1;
        await cart.save();

        return NextResponse.json({ success: true, message: 'Recovery email sent successfully' });

    } catch (error) {
        console.error('Failed to send abandoned cart email:', error);
        return NextResponse.json({ error: 'Failed to send email' }, { status: 500 });
    }
}
