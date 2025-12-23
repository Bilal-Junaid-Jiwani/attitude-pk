import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
import dbConnect from '@/lib/db/connect';
import Order from '@/lib/models/Order';

export async function GET() {
    await dbConnect();

    try {
        const cookieStore = await cookies();
        const token = cookieStore.get('token')?.value;

        if (!token) {
            return NextResponse.json({ isLoggedIn: false, isNewUser: false });
        }

        const secret = process.env.JWT_SECRET || 'fallback_secret_key_change_me';
        let decoded: any;

        try {
            decoded = jwt.verify(token, secret);
        } catch (err) {
            return NextResponse.json({ isLoggedIn: false, isNewUser: false });
        }

        if (!decoded || !decoded.id) {
            return NextResponse.json({ isLoggedIn: false, isNewUser: false });
        }

        // Count orders for this user
        const ordersCount = await Order.countDocuments({ user: decoded.id });

        return NextResponse.json({
            isLoggedIn: true,
            isNewUser: ordersCount === 0,
            ordersCount
        });

    } catch (error) {
        console.error('Eligibility Check Failed:', error);
        return NextResponse.json({ error: 'Failed' }, { status: 500 });
    }
}
