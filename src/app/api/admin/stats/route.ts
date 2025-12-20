import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db/connect';
import Order from '@/lib/models/Order';
import Product from '@/lib/models/Product';
// Ensure models are registered
import '@/lib/models/User';

export async function GET() {
    try {
        await dbConnect();
        console.log('Admin Stats API Called');

        // 1. Total Revenue
        const revenueStats = await Order.aggregate([
            { $match: { status: { $ne: 'Cancelled' } } },
            { $group: { _id: null, total: { $sum: '$totalAmount' } } }
        ]);
        const revenue = revenueStats[0]?.total || 0;

        // 2. Total Orders
        const orders = await Order.countDocuments();

        // 3. Inventory Count
        const inventoryStats = await Product.aggregate([
            { $group: { _id: null, totalStock: { $sum: '$stock' } } }
        ]);
        const inventory = inventoryStats[0]?.totalStock || 0;

        // 4. Sales Revenue Chart (Last 30 Days)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const salesChart = await Order.aggregate([
            {
                $match: {
                    createdAt: { $gte: thirtyDaysAgo },
                    status: { $ne: 'Cancelled' }
                }
            },
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                    sales: { $sum: "$totalAmount" }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        return NextResponse.json({
            revenue,
            orders,
            inventory,
            salesChart
        });

    } catch (error) {
        console.error('Stats API Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
