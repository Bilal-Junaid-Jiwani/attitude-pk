import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db/connect';
import User from '@/lib/models/User';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';

export async function POST(req: Request) {
    try {
        await dbConnect();
        const cookieStore = await cookies();
        const token = cookieStore.get('admin_token')?.value;

        if (!token) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const secret = process.env.JWT_SECRET || 'fallback_secret_key_change_me';
        const decoded: any = jwt.verify(token, secret);

        // Update lastLogin (acting as Last Active timestamp)
        await User.findByIdAndUpdate(decoded.id, { lastLogin: new Date() });

        return NextResponse.json({ status: 'ok' });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to beat' }, { status: 500 });
    }
}
