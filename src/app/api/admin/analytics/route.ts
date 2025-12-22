import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db/connect';
import Order from '@/lib/models/Order';
import User from '@/lib/models/User'; // Critical import to ensure Schema is registered

// Helper: Calculate percentage change
const calculateChange = (current: number, previous: number) => {
    if (previous === 0) return current > 0 ? 100 : 0;
    return Math.round(((current - previous) / previous) * 100);
};

// Helper: Get Aggregated Data for a date range
const getMetrics = async (startDate: Date, endDate: Date) => {
    const validOrdersQuery = {
        status: { $nin: ['Cancelled', 'Returned'] },
        createdAt: { $gte: startDate, $lte: endDate }
    };

    const count = await Order.countDocuments(validOrdersQuery);

    const salesAgg = await Order.aggregate([
        { $match: validOrdersQuery },
        {
            $group: {
                _id: null,
                total: { $sum: { $toDouble: "$totalAmount" } }
            }
        }
    ]);
    const sales = salesAgg.length > 0 ? salesAgg[0].total : 0;
    const aov = count > 0 ? sales / count : 0;

    return { count, sales, aov };
};

// Helper: Get Status Counts
const getOperationalMetrics = async (startDate: Date, endDate: Date) => {
    const rangeQuery = { createdAt: { $gte: startDate, $lte: endDate } };

    const pending = await Order.countDocuments({ ...rangeQuery, status: { $in: ['Processing', 'Confirmed', 'Pending'] } });
    const cancelled = await Order.countDocuments({ ...rangeQuery, status: 'Cancelled' });
    const returned = await Order.countDocuments({ ...rangeQuery, status: 'Returned' });

    return { pending, cancelled, returned };
};

// Helper: Get Recent Orders
const getRecentOrders = async (startDate: Date, endDate: Date) => {
    // Ensure User model is loaded
    await dbConnect();

    // Check if User model is registered to avoid "Schema hasn't been registered" error
    // (Importing it at the top usually suffices, but being explicit helps in dev HMR)
    if (!User) {
        console.log("User model not loaded via import?");
    }

    return await Order.find({
        createdAt: { $gte: startDate, $lte: endDate }
    })
        .sort({ createdAt: -1 })
        .limit(10)
        .populate('user', 'name email')
        .select('_id totalAmount status createdAt items')
        .lean();
};

export async function GET(req: Request) {
    await dbConnect();
    try {
        const { searchParams } = new URL(req.url);
        const startParam = searchParams.get('startDate');
        const endParam = searchParams.get('endDate');

        let startDate: Date, endDate: Date;

        if (startParam && endParam) {
            startDate = new Date(startParam);
            endDate = new Date(endParam);
            // Fix: Set end date to end of day if it's just a date string (YYYY-MM-DD)
            // If the dates are passed as ISO strings, this might be redundant but safe.
            // If specific time is not passed, default to 23:59:59.999
            if (endParam.length <= 10) {
                endDate.setUTCHours(23, 59, 59, 999);
            }
        } else {
            const now = new Date();
            endDate = new Date(now);
            startDate = new Date(now);
            startDate.setDate(now.getDate() - 30);
        }

        if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
            return NextResponse.json({ error: 'Invalid dates' }, { status: 400 });
        }

        // Previous Period Calculation
        const durationMs = endDate.getTime() - startDate.getTime();
        const previousEndDate = new Date(startDate.getTime() - 1);
        const previousStartDate = new Date(previousEndDate.getTime() - durationMs);

        // 1. Core Metrics
        const current = await getMetrics(startDate, endDate);
        const previous = await getMetrics(previousStartDate, previousEndDate);

        // 2. Operational Metrics
        const currentOps = await getOperationalMetrics(startDate, endDate);
        const previousOps = await getOperationalMetrics(previousStartDate, previousEndDate);

        const metrics = {
            totalSales: {
                value: current.sales,
                previous: previous.sales,
                change: calculateChange(current.sales, previous.sales)
            },
            totalOrders: {
                value: current.count,
                previous: previous.count,
                change: calculateChange(current.count, previous.count)
            },
            averageOrderValue: {
                value: current.aov,
                previous: previous.aov,
                change: calculateChange(current.aov, previous.aov)
            },
            pendingOrders: {
                value: currentOps.pending,
                previous: previousOps.pending,
                change: calculateChange(currentOps.pending, previousOps.pending)
            },
            cancelledOrders: {
                value: currentOps.cancelled,
                previous: previousOps.cancelled,
                change: calculateChange(currentOps.cancelled, previousOps.cancelled)
            },
            returnedOrders: {
                value: currentOps.returned,
                previous: previousOps.returned,
                change: calculateChange(currentOps.returned, previousOps.returned)
            }
        };

        // 3. History (Daily)
        const dailies = await Order.aggregate([
            {
                $match: {
                    status: { $nin: ['Cancelled', 'Returned'] },
                    createdAt: { $gte: startDate, $lte: endDate }
                }
            },
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                    sales: { $sum: { $toDouble: "$totalAmount" } },
                    orders: { $sum: 1 }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        const history = [];
        const iterDate = new Date(startDate);
        // Safety Break: Don't loop forever if dates are crazy
        let loopCount = 0;
        while (iterDate <= endDate && loopCount < 366) {
            const dateStr = iterDate.toISOString().split('T')[0];
            const dayData = dailies.find(d => d._id === dateStr);
            history.push({
                date: dateStr,
                sales: dayData?.sales || 0,
                orders: dayData?.orders || 0
            });
            iterDate.setDate(iterDate.getDate() + 1);
            loopCount++;
        }

        // 4. Returning Rate
        const periodOrders = await Order.find({
            status: { $nin: ['Cancelled', 'Returned'] },
            createdAt: { $gte: startDate, $lte: endDate }
        }).select('shippingAddress.email');

        const uniqueEmails = [...new Set(periodOrders.map((o: any) => o.shippingAddress?.email || ''))].filter(e => e);

        // Simplified Logic: Just utilize what we have. 
        // Optimization: Single aggregate query for returning customers is better, but stick to functional logic for now.
        let returningCount = 0;
        // Limit this check to avoid timeout on large datasets
        const emailsToCheck = uniqueEmails.slice(0, 50);
        for (const email of emailsToCheck) {
            const count = await Order.countDocuments({ 'shippingAddress.email': email });
            if (count > 1) returningCount++;
        }

        // Extrapolate if we limited
        let returningRate = 0;
        if (emailsToCheck.length > 0) {
            returningRate = Math.round((returningCount / emailsToCheck.length) * 100);
        }

        // 5. Top Products
        const topProducts = await Order.aggregate([
            {
                $match: {
                    status: { $nin: ['Cancelled', 'Returned'] },
                    createdAt: { $gte: startDate, $lte: endDate }
                }
            },
            { $unwind: "$items" },
            {
                $project: {
                    product_id: "$items.product_id",
                    name: "$items.name",
                    price: { $toDouble: "$items.price" },
                    quantity: { $toDouble: "$items.quantity" }
                }
            },
            {
                $group: {
                    _id: "$product_id",
                    name: { $first: "$name" },
                    price: { $first: "$price" },
                    totalSold: { $sum: "$quantity" },
                    revenue: { $sum: { $multiply: ["$price", "$quantity"] } }
                }
            },
            { $sort: { totalSold: -1 } },
            { $limit: 5 }
        ]);

        // 6. Recent Orders
        const recentOrders = await getRecentOrders(startDate, endDate);

        return NextResponse.json({
            metrics,
            history,
            returningRate,
            topProducts,
            recentOrders
        });

    } catch (error: any) {
        console.error('Analytics Error Details:', error);
        return NextResponse.json({
            error: 'Failed to fetch analytics',
            details: error.message
        }, { status: 500 });
    }
}
