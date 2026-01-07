import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db/connect';
import Order from '@/lib/models/Order';
import User from '@/lib/models/User';
import BusinessExpense from '@/lib/models/BusinessExpense';
import Visitor from '@/lib/models/Visitor';
import Product from '@/lib/models/Product';

// Helper: Calculate percentage change
const calculateChange = (current: number, previous: number) => {
    if (previous === 0) return current > 0 ? 100 : 0;
    return Math.round(((current - previous) / previous) * 100);
};

// Helper: Get Aggregated Data for a date range
const getMetrics = async (startDate: Date, endDate: Date) => {
    const validOrdersQuery = {
        status: 'Delivered', // STRICTLY Realized Sales Only
        createdAt: { $gte: startDate, $lte: endDate }
    };

    const count = await Order.countDocuments(validOrdersQuery);

    // 1. Order-Level Metrics (Revenue, Shipping, Tax, Discount)
    // No $unwind here to avoid duplicating order totals
    const orderMetricsAgg = await Order.aggregate([
        { $match: validOrdersQuery },
        {
            $group: {
                _id: null,
                grossRevenue: { $sum: { $toDouble: "$totalAmount" } },
                subtotal: { $sum: { $toDouble: "$subtotal" } },
                shippingCollected: { $sum: { $toDouble: "$shippingCost" } },
                taxCollected: { $sum: { $toDouble: "$tax" } },
                discountGiven: { $sum: { $toDouble: "$discount" } }
            }
        }
    ]);

    // 2. Item-Level Metrics (COGS, Units Sold)
    // Unwind + Lookup for Cost
    const itemMetricsAgg = await Order.aggregate([
        { $match: validOrdersQuery },
        { $unwind: "$items" },
        // Fix: Lookup current product cost if missing in order item (for old orders)
        {
            $addFields: {
                productObjId: {
                    $convert: {
                        input: "$items.product_id",
                        to: "objectId",
                        onError: null,
                        onNull: null
                    }
                }
            }
        },
        {
            $lookup: {
                from: "products",
                localField: "productObjId",
                foreignField: "_id",
                as: "productData"
            }
        },
        { $unwind: { path: "$productData", preserveNullAndEmptyArrays: true } },
        {
            $addFields: {
                // Priority: 1. Stored Cost > 0, 2. Current Product Cost, 3. Default 0
                resolvedCost: {
                    $cond: {
                        if: { $gt: [{ $toDouble: "$items.costPerItem" }, 0] },
                        then: { $toDouble: "$items.costPerItem" },
                        else: { $ifNull: ["$productData.costPerItem", 0] }
                    }
                }
            }
        },
        {
            $group: {
                _id: null,
                cogs: { $sum: { $multiply: [{ $toDouble: "$resolvedCost" }, { $toDouble: "$items.quantity" }] } },
                unitsSold: { $sum: { $toDouble: "$items.quantity" } }
            }
        }
    ]);

    // Shipping breakdown
    const shippingBreakdown = await Order.aggregate([
        { $match: validOrdersQuery },
        {
            $group: {
                _id: null,
                freeShippingOrders: { $sum: { $cond: [{ $eq: [{ $toDouble: "$shippingCost" }, 0] }, 1, 0] } },
                paidShippingOrders: { $sum: { $cond: [{ $gt: [{ $toDouble: "$shippingCost" }, 0] }, 1, 0] } },
                totalShippingCollected: { $sum: { $toDouble: "$shippingCost" } }
            }
        }
    ]);

    // Coupon breakdown
    const couponBreakdown = await Order.aggregate([
        { $match: { ...validOrdersQuery, couponCode: { $exists: true, $ne: '' } } },
        {
            $group: {
                _id: "$couponCode",
                usageCount: { $sum: 1 },
                totalDiscountValue: { $sum: { $toDouble: "$discount" } }
            }
        },
        { $sort: { usageCount: -1 } },
        { $limit: 5 }
    ]);

    // Daily Sales History for Chart
    const salesHistory = await Order.aggregate([
        { $match: validOrdersQuery },
        {
            $group: {
                _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                sales: { $sum: { $toDouble: "$totalAmount" } },
                orders: { $sum: 1 }
            }
        },
        { $sort: { _id: 1 } }
    ]);

    const orderMetrics = orderMetricsAgg.length > 0 ? orderMetricsAgg[0] : {
        grossRevenue: 0, subtotal: 0, shippingCollected: 0, taxCollected: 0, discountGiven: 0
    };

    const itemMetrics = itemMetricsAgg.length > 0 ? itemMetricsAgg[0] : {
        cogs: 0, unitsSold: 0
    };

    const shippingData = shippingBreakdown.length > 0 ? shippingBreakdown[0] : {
        freeShippingOrders: 0, paidShippingOrders: 0, totalShippingCollected: 0
    };

    const netRevenue = orderMetrics.grossRevenue - orderMetrics.discountGiven;
    const grossProfit = netRevenue - itemMetrics.cogs;
    const grossMargin = netRevenue > 0 ? (grossProfit / netRevenue) * 100 : 0;
    const aov = count > 0 ? orderMetrics.grossRevenue / count : 0;

    return {
        count,
        grossRevenue: orderMetrics.grossRevenue,
        netRevenue,
        subtotal: orderMetrics.subtotal,
        shippingCollected: orderMetrics.shippingCollected,
        taxCollected: orderMetrics.taxCollected,
        discountGiven: orderMetrics.discountGiven,
        cogs: itemMetrics.cogs,
        grossProfit,
        grossMargin,
        aov,
        unitsSold: itemMetrics.unitsSold,
        freeShippingOrders: shippingData.freeShippingOrders,
        paidShippingOrders: shippingData.paidShippingOrders,
        couponUsage: couponBreakdown,
        salesHistory
    };
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
                value: current.grossRevenue,
                previous: previous.grossRevenue,
                change: calculateChange(current.grossRevenue, previous.grossRevenue)
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

        // Profit Metrics
        const profitMetrics = {
            grossRevenue: current.grossRevenue,
            netRevenue: current.netRevenue,
            subtotal: current.subtotal,
            shippingCollected: current.shippingCollected,
            taxCollected: current.taxCollected,
            discountGiven: current.discountGiven,
            cogs: current.cogs,
            grossProfit: current.grossProfit,
            grossMargin: Math.round(current.grossMargin * 10) / 10,
            unitsSold: current.unitsSold,
            freeShippingOrders: current.freeShippingOrders,
            paidShippingOrders: current.paidShippingOrders,
            couponUsage: current.couponUsage || [],
            salesHistory: current.salesHistory || [],
            freeShippingCost: 0, // Will be calculated after expenses fetch
            totalPackagingCost: 0, // Will be calculated after expenses fetch
            advertisingCost: 0, // Will be fetched from expenses
            packagingPerOrder: 0,
            shippingPerOrder: 0
        };

        // Return Losses Calculation
        const returnLossesAgg = await Order.aggregate([
            {
                $match: {
                    status: 'Returned',
                    createdAt: { $gte: startDate, $lte: endDate }
                }
            },
            {
                $group: {
                    _id: null,
                    totalRefunds: { $sum: { $toDouble: "$returnDetails.refundAmount" } },
                    totalReturnShipping: { $sum: { $toDouble: "$returnDetails.returnShippingCost" } },
                    returnCount: { $sum: 1 }
                }
            }
        ]);

        const returnLosses = returnLossesAgg.length > 0 ? {
            totalRefunds: returnLossesAgg[0].totalRefunds || 0,
            totalReturnShipping: returnLossesAgg[0].totalReturnShipping || 0,
            returnCount: returnLossesAgg[0].returnCount || 0
        } : { totalRefunds: 0, totalReturnShipping: 0, returnCount: 0 };

        // Business Expenses (Monthly) - Use endDate month and aggregate all months in range
        const startMonth = startDate.toISOString().substring(0, 7);
        const endMonth = endDate.toISOString().substring(0, 7);

        // Get all expense records within the date range
        const expenseQuery = startMonth === endMonth
            ? { month: endMonth }
            : { month: { $gte: startMonth, $lte: endMonth } };

        const expenseDocs = await BusinessExpense.find(expenseQuery).lean() as any[];

        // Aggregate expenses across all months in range
        const expenses = {
            advertising: 0, packaging: 0, returnShipping: 0,
            staffSalary: 0, rent: 0, utilities: 0, other: 0,
            packagingPerOrder: 0, shippingPerOrder: 0
        };

        expenseDocs.forEach((doc: any) => {
            expenses.advertising += Number(doc.advertising || 0);
            expenses.packaging += Number(doc.packaging || 0);
            expenses.returnShipping += Number(doc.returnShipping || 0);
            expenses.staffSalary += Number(doc.staffSalary || 0);
            expenses.rent += Number(doc.rent || 0);
            expenses.utilities += Number(doc.utilities || 0);
            expenses.other += Number(doc.other || 0);
            // Use last record's per-order rates (most recent)
            if (doc.packagingPerOrder) expenses.packagingPerOrder = Number(doc.packagingPerOrder);
            if (doc.shippingPerOrder) expenses.shippingPerOrder = Number(doc.shippingPerOrder);
        });

        // Calculate free shipping cost (for informational purposes)
        const freeShippingCost = (current.freeShippingOrders || 0) * expenses.shippingPerOrder;

        // Calculate total packaging cost = (Total Orders - Returned Orders) * packagingPerOrder
        // (We separate returned packaging cost to add it to Return Loss)
        const validOrderCount = (current.count || 0) - returnLosses.returnCount;
        const totalPackagingCost = Math.max(0, validOrderCount) * expenses.packagingPerOrder;

        // Calculate Total Delivery Expense (for ALL valid orders, whether free or paid shipping)
        const deliveryCost = Math.max(0, validOrderCount) * expenses.shippingPerOrder;

        // Calculate Comprehensive Return Loss
        // 1. Manual Return Shipping (Courier return charges)
        // 2. Wasted Forward Shipping (ShippingPerOrder * ReturnCount) - Cost of sending it out
        // 3. Wasted Packaging (PackagingPerOrder * ReturnCount) - Box/Flyer wasted
        const wastedForwardShipping = returnLosses.returnCount * expenses.shippingPerOrder;
        const wastedPackaging = returnLosses.returnCount * expenses.packagingPerOrder;

        // Update totalReturnShipping to be comprehensive
        returnLosses.totalReturnShipping += wastedForwardShipping + wastedPackaging;

        const totalExpenses = (
            expenses.advertising +
            expenses.packaging +
            expenses.returnShipping +
            expenses.staffSalary +
            expenses.rent +
            expenses.utilities +
            expenses.other
        );

        // Update profitMetrics with calculated per-order costs
        profitMetrics.freeShippingCost = freeShippingCost;
        profitMetrics.totalPackagingCost = totalPackagingCost;
        profitMetrics.advertisingCost = expenses.advertising;
        // @ts-ignore
        profitMetrics.deliveryCost = deliveryCost;
        profitMetrics.packagingPerOrder = expenses.packagingPerOrder;
        profitMetrics.shippingPerOrder = expenses.shippingPerOrder;

        // Net Profit = Gross Profit - Expenses - Return Losses (inclusive) - Delivery Cost (ALL outgoing) - Packaging Cost (valid orders)
        // Note: we remove freeShippingCost from formula because deliveryCost covers ALL orders.
        const netProfit = current.grossProfit - totalExpenses - returnLosses.totalReturnShipping - deliveryCost - totalPackagingCost;
        const netMargin = current.netRevenue > 0 ? (netProfit / current.netRevenue) * 100 : 0;

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

        // 7. Active Visitors (Realtime)
        const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
        const activeVisitors = await Visitor.countDocuments({ lastActive: { $gte: fiveMinutesAgo } });

        // 8. Low Stock Alerts
        const lowStockProducts = await Product.find({ stock: { $lte: 5 } })
            .select('name stock price images slug')
            .limit(5);

        return NextResponse.json({
            activeVisitors,
            lowStockProducts,
            metrics,
            profitMetrics: {
                ...profitMetrics,
                netProfit,
                netMargin: Math.round(netMargin * 10) / 10,
                totalExpenses
            },
            returnLosses,
            expenses: {
                advertising: Number(expenses.advertising || 0),
                packaging: Number(expenses.packaging || 0),
                returnShipping: Number(expenses.returnShipping || 0),
                staffSalary: Number(expenses.staffSalary || 0),
                rent: Number(expenses.rent || 0),
                utilities: Number(expenses.utilities || 0),
                other: Number(expenses.other || 0)
            },
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
