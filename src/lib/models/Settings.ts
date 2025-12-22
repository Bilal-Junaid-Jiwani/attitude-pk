import mongoose from 'mongoose';

const CouponSchema = new mongoose.Schema({
    code: { type: String, required: true, uppercase: true },
    discountType: { type: String, enum: ['percentage', 'fixed'], default: 'percentage' },
    discountValue: { type: Number, required: true },
    isActive: { type: Boolean, default: true }
});

const SettingsSchema = new mongoose.Schema({
    taxRate: { type: Number, default: 0 },
    shippingCost: { type: Number, default: 200 },
    coupons: [CouponSchema]
}, { timestamps: true });

// Singleton pattern: We'll mostly read/write to the first document
export default mongoose.models.Settings || mongoose.model('Settings', SettingsSchema);
