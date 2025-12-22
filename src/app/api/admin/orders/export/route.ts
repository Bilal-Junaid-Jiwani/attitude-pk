import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt, { JwtPayload } from 'jsonwebtoken';
import dbConnect from '@/lib/db/connect';
import Order from '@/lib/models/Order';
import User from '@/lib/models/User';

async function getUserIdFromToken() {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;

    if (!token) return null;

    try {
        const secret = process.env.JWT_SECRET || 'fallback_secret_key_change_me';
        const decoded = jwt.verify(token, secret) as JwtPayload;
        return decoded.id;
    } catch (error) {
        return null;
    }
}

export async function POST(req: Request) {
    try {
        await dbConnect();

        // 1. Verify Admin
        const userId = await getUserIdFromToken();
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const user = await User.findById(userId);
        if (!user || user.role !== 'admin') {
            return NextResponse.json({ error: 'Forbidden: Admins only' }, { status: 403 });
        }

        const { ids, all, filter } = await req.json();

        let query: any = {};

        if (all) {
            // Apply similar filters as the main list if exporting "All" (filtered)
            // Note: Implementing full replication of client-side filters on server-side is complex.
            // Simplified approach: If 'all' is true, exporting ALL orders from DB or basic status filter if passed.
            // For now, let's assume 'all' means export everything or we rely on client sending IDs if they want specific filter.
            // Better approach: Client always sends IDs for "Export Selected" or "Export Filtered" (if filtered list < ~1000).
            // If the user has thousands of orders, passing thousands of IDs is okay for POST body (limit is usually high enough).
            // So we will expect 'ids' to be populated even for "Export Filtered".
        }

        if (ids && ids.length > 0) {
            query._id = { $in: ids };
        }

        const orders = await Order.find(query).sort({ createdAt: -1 });

        return NextResponse.json({ orders });

    } catch (error: any) {
        console.error('Export error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
