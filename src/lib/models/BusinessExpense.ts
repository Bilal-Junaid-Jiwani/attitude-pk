import mongoose from 'mongoose';

const BusinessExpenseSchema = new mongoose.Schema({
    month: {
        type: String, // Format: 'YYYY-MM'
        required: true,
        unique: true,
        index: true,
    },
    advertising: {
        type: Number,
        default: 0,
    },
    packaging: {
        type: Number,
        default: 0,
    },
    returnShipping: {
        type: Number,
        default: 0,
    },
    staffSalary: {
        type: Number,
        default: 0,
    },
    rent: {
        type: Number,
        default: 0,
    },
    utilities: {
        type: Number,
        default: 0,
    },
    other: {
        type: Number,
        default: 0,
    },
    // Per-order fixed rates
    packagingPerOrder: {
        type: Number,
        default: 0, // Fixed packaging cost per order
    },
    shippingPerOrder: {
        type: Number,
        default: 0, // Fixed shipping cost per order (for free shipping orders)
    },
    notes: {
        type: String,
    }
}, { timestamps: true });

export default mongoose.models.BusinessExpense || mongoose.model('BusinessExpense', BusinessExpenseSchema);
