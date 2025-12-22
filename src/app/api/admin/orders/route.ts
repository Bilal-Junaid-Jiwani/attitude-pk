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

export async function GET(req: Request) {
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

        // 2. Parse Date Filter
        const { searchParams } = new URL(req.url);
        const startParam = searchParams.get('startDate');
        const endParam = searchParams.get('endDate');

        let query: any = {};

        if (startParam && endParam) {
            const startDate = new Date(startParam);
            const endDate = new Date(endParam);
            // Ensure end of day for the end date
            endDate.setUTCHours(23, 59, 59, 999);

            if (!isNaN(startDate.getTime()) && !isNaN(endDate.getTime())) {
                query.createdAt = {
                    $gte: startDate,
                    $lte: endDate
                };
            }
        }

        // 3. Fetch Orders (Filtered)
        const orders = await Order.find(query)
            .sort({ createdAt: -1 })
            .populate('user', 'name email');

        // 4. Transform Data for Dashboard
        const formattedOrders = orders.map(order => {
            // Logic to determine statuses
            const isPaid = order.paymentMethod === 'Card' || order.paymentMethod === 'Safepay' || order.status === 'Delivered';
            const paymentStatus = isPaid ? 'Paid' : 'Pending';

            const isFulfilled = order.status === 'Shipped' || order.status === 'Delivered';
            const fulfillmentStatus = isFulfilled ? 'Fulfilled' : 'Unfulfilled';

            // Customer Name priority: User acct name -> Shipping name
            const customerName = order.user?.name || order.shippingAddress?.fullName || 'Guest';

            return {
                _id: order._id,
                orderNumber: `#${order._id.toString().slice(-4).toUpperCase()}`,
                date: order.createdAt,
                customer: customerName,
                total: order.totalAmount,
                paymentStatus,
                fulfillmentStatus,
                fullStatus: order.status, // Original status
                itemsCount: order.items.reduce((acc: number, item: any) => acc + item.quantity, 0),
                paymentMethod: order.paymentMethod
            };
        });

        // 5. Calculate Stats (Based on the filtered set)
        // If query is present, these stats reflect the filtered range.
        // If query is empty, they reflect All Time.

        const stats = {
            totalOrders: orders.length,
            // We map 'today' to 'period' in our mental model, but keep key 'today' to avoid breaking frontend immediately
            // or we'll update frontend to interpret it as "Selected Period"
            today: {
                count: orders.length,
                items: orders.reduce((acc: number, o: any) => acc + o.items.reduce((sum: number, i: any) => sum + i.quantity, 0), 0),
                returns: orders.filter((o: any) => o.status === 'Returned').length,
                fulfilled: orders.filter((o: any) => o.status === 'Shipped' || o.status === 'Delivered').length,
                delivered: orders.filter((o: any) => o.status === 'Delivered').length,
                cancelled: orders.filter((o: any) => o.status === 'Cancelled').length
            }
        };

        return NextResponse.json({
            success: true,
            orders: formattedOrders,
            stats
        }, { status: 200 });

    } catch (error) {
        console.error('Admin orders fetch error:', error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}

// POST: Create a new order (Manual)
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

        // 2. Create Order
        const body = await req.json();

        const orderData = {
            ...body,
            user: body.user || null
        };

        const newOrder = await Order.create(orderData);

        return NextResponse.json(newOrder, { status: 201 });

    } catch (error: any) {
        console.error('Create order error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
