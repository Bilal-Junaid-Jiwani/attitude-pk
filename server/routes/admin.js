"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const router = express_1.default.Router();
const Order_1 = __importDefault(require("../../src/lib/models/Order"));
const Product_1 = __importDefault(require("../../src/lib/models/Product"));
// GET /api/admin/stats
router.get('/stats', async (req, res) => {
    var _a, _b;
    try {
        // 1. Total Revenue
        const revenue = await Order_1.default.aggregate([
            { $match: { status: { $ne: 'Cancelled' } } },
            { $group: { _id: null, total: { $sum: '$totalAmount' } } }
        ]);
        // 2. Total Orders
        const totalOrders = await Order_1.default.countDocuments();
        // 3. Inventory Count
        const inventory = await Product_1.default.aggregate([
            { $group: { _id: null, totalStock: { $sum: '$stock' } } }
        ]);
        // 4. Sales Revenue over last 30 days for Chart
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const salesChart = await Order_1.default.aggregate([
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
            revenue: ((_a = revenue[0]) === null || _a === void 0 ? void 0 : _a.total) || 0,
            orders: totalOrders,
            inventory: ((_b = inventory[0]) === null || _b === void 0 ? void 0 : _b.totalStock) || 0,
            salesChart
        });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ msg: 'Server Error' });
    }
});
// GET /api/admin/orders (Recent Orders)
router.get('/orders', async (req, res) => {
    try {
        const orders = await Order_1.default.find()
            .sort({ createdAt: -1 })
            .limit(10)
            .populate('user', 'name email');
        res.json(orders);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ msg: 'Server Error' });
    }
});
exports.default = router;
