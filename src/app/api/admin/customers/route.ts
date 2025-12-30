import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db/connect';
import User from '@/lib/models/User';
import Order from '@/lib/models/Order';

export async function GET(req: Request) {
    await dbConnect();
    try {
        const { searchParams } = new URL(req.url);
        const query = searchParams.get('search');

        // 1. Fetch Registered Users
        const userMatchStage: any = { role: 'user' };
        if (query) {
            const regex = new RegExp(query, 'i');
            userMatchStage.$or = [
                { name: regex },
                { email: regex },
                { phone: regex }
            ];
        }

        const registeredUsersPromise = User.aggregate([
            { $match: userMatchStage },
            {
                $lookup: {
                    from: 'orders',
                    localField: '_id',
                    foreignField: 'user',
                    as: 'orders'
                }
            },
            {
                $addFields: {
                    ordersCount: { $size: '$orders' },
                    totalSpent: { $sum: '$orders.totalAmount' },
                    lastOrderDate: { $max: '$orders.createdAt' },
                    type: 'Registered'
                }
            },
            { $project: { orders: 0, password: 0 } }
        ]);

        // 2. Fetch Guest Customers (Aggregated from Orders)
        const guestMatchStage: any = {
            $or: [
                { user: { $exists: false } },
                { user: null }
            ]
        };

        if (query) {
            const regex = new RegExp(query, 'i');
            guestMatchStage.$and = [
                { $or: [{ user: { $exists: false } }, { user: null }] },
                {
                    $or: [
                        { 'shippingAddress.fullName': regex },
                        { 'shippingAddress.email': regex },
                        { 'shippingAddress.phone': regex }
                    ]
                }
            ];
        }

        const guestUsersPromise = Order.aggregate([
            { $match: guestMatchStage },
            {
                $group: {
                    _id: '$shippingAddress.email',
                    name: { $first: '$shippingAddress.fullName' },
                    email: { $first: '$shippingAddress.email' },
                    phone: { $first: '$shippingAddress.phone' },
                    address: { $first: '$shippingAddress.address' },
                    postcode: { $first: '$shippingAddress.postalCode' },
                    ordersCount: { $sum: 1 },
                    totalSpent: { $sum: '$totalAmount' },
                    lastOrderDate: { $max: '$createdAt' }
                }
            },
            {
                $addFields: {
                    type: 'Guest',
                    // Use email as ID or a prefixed string to avoid collisions and allow routing
                    originalId: '$_id',
                    _id: { $concat: ['guest_', '$_id'] }
                }
            }
        ]);

        const [registeredUsers, guestUsers] = await Promise.all([registeredUsersPromise, guestUsersPromise]);

        // 3. Merge and Sort by Last Order descending
        const allCustomers = [...registeredUsers, ...guestUsers].sort((a, b) => {
            const dateA = new Date(a.lastOrderDate || 0).getTime();
            const dateB = new Date(b.lastOrderDate || 0).getTime();
            return dateB - dateA;
        });

        return NextResponse.json(allCustomers);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(req: Request) {
    await dbConnect();
    try {
        const body = await req.json();
        const { name, email, phone, address, city, postcode, role } = body;

        // Basic validation
        if (!name || !email) {
            return NextResponse.json({ error: 'Name and email are required' }, { status: 400 });
        }

        // Check if user exists
        const userExists = await User.findOne({ email });
        if (userExists) {
            return NextResponse.json({ error: 'Customer already exists' }, { status: 400 });
        }

        const customer = await User.create({
            name,
            email,
            phone,

            city, // Note: User model might not have city field explicitly defined in schemas shown earlier, 
            // but MongoDB is flexible. If User schema is strict, we might need to update Schema again 
            // or map city to address string. User schema has 'address' and 'postcode'.
            // Let's concat city to address if schema doesn't support it, or assume schema is flexible.
            // Looking at step 3932, UserSchema has address, postcode, phone. No city.
            // Best to append City to address for now to be safe.
            address: city ? `${address}, ${city}` : address,
            postcode,
            role: role || 'guest',
            password: Math.random().toString(36).slice(-8) // Random password for guests/manual creation
        });

        return NextResponse.json({ success: true, customer }, { status: 201 });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

