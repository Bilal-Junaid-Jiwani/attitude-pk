import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt, { JwtPayload } from 'jsonwebtoken';
import dbConnect from '@/lib/db/connect';
import User from '@/lib/models/User';

// Helper to get user ID from ADMIN token
async function getAdminIdFromToken() {
    const cookieStore = await cookies();
    const token = cookieStore.get('admin_token')?.value;

    if (!token) return null;

    try {
        const secret = process.env.JWT_SECRET || 'fallback_secret_key_change_me';
        const decoded = jwt.verify(token, secret) as JwtPayload;
        return decoded.id; // Return ID from payload
    } catch (error) {
        return null;
    }
}

export async function GET() {
    try {
        await dbConnect();

        const userId = await getAdminIdFromToken();
        if (!userId) {
            return NextResponse.json(
                { error: 'Unauthorized: Admin Token Missing' },
                { status: 401 }
            );
        }

        const user = await User.findById(userId).setOptions({ bufferCommands: false });
        if (!user) {
            return NextResponse.json(
                { error: 'Admin User not found' },
                { status: 404 }
            );
        }

        if (user.role !== 'admin' && user.role !== 'staff') {
            return NextResponse.json(
                { error: 'Forbidden: Insufficient Permissions' },
                { status: 403 }
            );
        }

        // Return user data
        return NextResponse.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            // Include other fields if needed by dashboard
        }, { status: 200 });

    } catch (error: unknown) {
        console.error('Admin Profile GET Error:', error);
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}
