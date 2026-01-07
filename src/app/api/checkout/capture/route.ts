import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db/connect';
import AbandonedCheckout from '@/lib/models/AbandonedCheckout';

export async function POST(req: Request) {
    try {
        await dbConnect();
        const body = await req.json();
        const { email, phone, name, cartItems, totalAmount } = body;

        // Need at least one contact method
        if (!email && !phone) {
            return NextResponse.json({ error: 'Missing contact info' }, { status: 400 });
        }

        const filter = email ? { email } : { phone };

        // Upsert: Create or Update
        await AbandonedCheckout.findOneAndUpdate(
            filter,
            {
                email,
                phone,
                name,
                cartItems,
                totalAmount,
                recovered: false, // Reset recovered status if they come back
            },
            { upsert: true, new: true, setDefaultsOnInsert: true }
        );

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Abandoned Cart Capture Error:', error);
        return NextResponse.json({ error: 'Internal Error' }, { status: 500 });
    }
}
