import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db/connect';
import User from '@/lib/models/User';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';

// Helper to verify boss access
const verifyBossAccess = (req: Request) => {
    const code = req.headers.get('x-admin-code')?.trim();
    const envCode = process.env.ADMIN_SECURITY_CODE?.trim();

    const isValid = code === envCode;

    if (!isValid) {
        console.error(`Security Code Mismatch: Header '${code}' vs Env '${envCode}'`);
    }

    return { isValid, debugMsg: `Received: '${code}', Expected: '${envCode ? 'SET' : 'NOT_SET'}'` }; // Don't expose the actual code in prod
};

// GET: List all staff
export async function GET(req: Request) {
    try {
        await dbConnect();

        // 1. Security Check
        const { isValid, debugMsg } = verifyBossAccess(req);
        if (!isValid) {
            return NextResponse.json({ error: `Unauthorized: Invalid Security Code. ${debugMsg}` }, { status: 403 });
        }

        // 2. Fetch Staff
        const staff = await User.find({
            role: { $in: ['admin', 'staff'] }
        })
            .select('name email role lastLogin createdAt isVerified')
            .sort({ createdAt: -1 });

        return NextResponse.json({ staff });

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// DELETE: Remove a staff member
export async function DELETE(req: Request) {
    try {
        await dbConnect();

        // 1. Security Check
        const { isValid, debugMsg } = verifyBossAccess(req);
        if (!isValid) {
            return NextResponse.json({ error: `Unauthorized: Invalid Security Code. ${debugMsg}` }, { status: 403 });
        }

        const { id } = await req.json();
        if (!id) {
            return NextResponse.json({ error: 'User ID required' }, { status: 400 });
        }

        // 2. Prevent Self-Deletion
        const cookieStore = await cookies();
        const token = cookieStore.get('token')?.value;
        if (token) {
            const secret = process.env.JWT_SECRET || 'fallback_secret_key_change_me';
            const decoded: any = jwt.verify(token, secret);
            if (decoded.id === id) {
                return NextResponse.json({ error: 'You cannot delete your own account' }, { status: 400 });
            }
        }

        // 3. Delete User
        const deletedUser = await User.findByIdAndDelete(id);
        if (!deletedUser) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        return NextResponse.json({ message: 'Staff member removed successfully' });

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
