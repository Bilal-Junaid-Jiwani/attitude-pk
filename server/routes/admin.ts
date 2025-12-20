import express from 'express';
const router = express.Router();
import Order from '../../src/lib/models/Order';
import Product from '../../src/lib/models/Product';

// GET /api/admin/stats
router.get('/stats', async (req, res) => {
    try {
        // 1. Total Revenue
        const revenue = await Order.aggregate([
            { $match: { status: { $ne: 'Cancelled' } } },
            { $group: { _id: null, total: { $sum: '$totalAmount' } } }
        ]);

        // 2. Total Orders
        const totalOrders = await Order.countDocuments();

        // 3. Inventory Count
        const inventory = await Product.aggregate([
            { $group: { _id: null, totalStock: { $sum: '$stock' } } }
        ]);

        // 4. Sales Revenue over last 30 days for Chart
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

        res.json({
            revenue: revenue[0]?.total || 0,
            orders: totalOrders,
            inventory: inventory[0]?.totalStock || 0,
            salesChart
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: 'Server Error' });
    }
});

// GET /api/admin/orders (Recent Orders)
router.get('/orders', async (req, res) => {
    try {
        const orders = await Order.find()
            .sort({ createdAt: -1 })
            .limit(10)
            .populate('user', 'name email');
        res.json(orders);
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: 'Server Error' });
    }
});

export default router;
