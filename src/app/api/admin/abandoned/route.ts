import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db/connect';
import AbandonedCheckout from '@/lib/models/AbandonedCheckout';

export async function GET() {
    try {
        await dbConnect();

        // Fetch last 100 abandoned carts
        const checkouts = await AbandonedCheckout.find({})
            .sort({ updatedAt: -1 })
            .limit(100);

        return NextResponse.json(checkouts);
    } catch (error) {
        console.error('Failed to fetch abandoned carts:', error);
        return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 });
    }
}
