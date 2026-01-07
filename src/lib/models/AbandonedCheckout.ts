import mongoose from 'mongoose';

const AbandonedCheckoutSchema = new mongoose.Schema({
    email: { type: String },
    phone: { type: String },
    name: { type: String },
    cartItems: [{
        product_id: String,
        name: String,
        price: Number,
        quantity: Number,
        imageUrl: String
    }],
    totalAmount: Number,
    recovered: { type: Boolean, default: false }, // If order placed
    notified: { type: Boolean, default: false }, // If email/sms sent (or manual)
}, { timestamps: true });

// Prevent duplicates by email within 24 hours? 
// Or just update existing entry?
// We will use email/phone as key in API upsert.

export default mongoose.models.AbandonedCheckout || mongoose.model('AbandonedCheckout', AbandonedCheckoutSchema);
