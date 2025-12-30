import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt, { JwtPayload } from 'jsonwebtoken';
import dbConnect from '@/lib/db/connect';
import User from '@/lib/models/User';

// Helper to get user ID from token
async function getUserIdFromToken() {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;

    if (!token) return null;

    try {
        const secret = process.env.JWT_SECRET || 'fallback_secret_key_change_me';
        // Verify returns string | JwtPayload; we assume payload with ID
        const decoded = jwt.verify(token, secret) as JwtPayload;
        return decoded.id;
    } catch (error) {
        return null;
    }
}

export async function GET() {
    try {
        await dbConnect();

        const userId = await getUserIdFromToken();
        if (!userId) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const user = await User.findById(userId).setOptions({ bufferCommands: false }); // Password excluded by default in schema
        if (!user) {
            return NextResponse.json(
                { error: 'User not found' },
                { status: 404 }
            );
        }

        return NextResponse.json(user, { status: 200 });

    } catch (error: unknown) {
        console.error('Profile GET Error:', error);
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}

export async function PUT(req: Request) {
    try {
        await dbConnect();

        const userId = await getUserIdFromToken();
        if (!userId) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const body = await req.json();
        const { name, address, postcode, phone, addressTag } = body;

        // Basic validation
        if (!name) {
            return NextResponse.json(
                { error: 'Name is required' },
                { status: 400 }
            );
        }

        // Update user
        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { name, address, postcode, phone, addressTag },
            { new: true, runValidators: true }
        );

        if (!updatedUser) {
            return NextResponse.json(
                { error: 'User not found' },
                { status: 404 }
            );
        }

        return NextResponse.json(updatedUser, { status: 200 });

    } catch (error: unknown) {
        console.error('Profile PUT Error:', error);
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}
