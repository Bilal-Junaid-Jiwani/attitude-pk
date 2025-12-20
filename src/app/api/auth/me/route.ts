import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
import dbConnect from '@/lib/db/connect';
import User from '@/lib/models/User';

export async function GET() {
    await dbConnect();

    try {
        const cookieStore = await cookies();
        const token = cookieStore.get('token')?.value;

        if (!token) {
            return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
        }

        const secret = process.env.JWT_SECRET || 'fallback_secret_key_change_me';
        const decoded = jwt.verify(token, secret) as any;

        const user = await User.findById(decoded.id).select('-password');
        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 401 });
        }

        return NextResponse.json({ user });
    } catch (error: any) {
        return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }
}
