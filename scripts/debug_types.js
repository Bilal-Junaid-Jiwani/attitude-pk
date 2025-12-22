const mongoose = require('mongoose');
const path = require('path');

// Load environment variables manually since we are running a script
require('dotenv').config({ path: path.resolve(process.cwd(), '.env') });
require('dotenv').config({ path: path.resolve(process.cwd(), '.env.local') });

// Define minimal schema to read data
const OrderSchema = new mongoose.Schema({
    totalAmount: mongoose.Schema.Types.Mixed,
    items: [
        {
            price: mongoose.Schema.Types.Mixed,
            quantity: mongoose.Schema.Types.Mixed
        }
    ]
}, { strict: false });

const Order = mongoose.models.Order || mongoose.model('Order', OrderSchema);

async function checkTypes() {
    if (!process.env.MONGODB_URI) {
        console.error('MONGODB_URI is not defined');
        process.exit(1);
    }

    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to DB');

        const orders = await Order.find({}).limit(10).lean();

        orders.forEach((order, idx) => {
            console.log(`Order ${idx + 1} ID: ${order._id}`);
            console.log(`  totalAmount: ${order.totalAmount} (Type: ${typeof order.totalAmount})`);
            if (order.items && order.items.length > 0) {
                order.items.forEach((item, i) => {
                    console.log(`    Item ${i}: Price=${item.price} (${typeof item.price}), Qty=${item.quantity} (${typeof item.quantity})`);
                });
            }
        });

        // Check if any order has string totalAmount
        const stringOrders = await Order.countDocuments({ totalAmount: { $type: "string" } });
        console.log(`\nOrders with totalAmount as String: ${stringOrders}`);

    } catch (e) {
        console.error(e);
    } finally {
        await mongoose.disconnect();
    }
}

checkTypes();
