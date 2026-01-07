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
    isRecovered: { type: Boolean, default: false },
    recoverySentAt: { type: Date }, // Date when email/msg was sent
    clickedAt: { type: Date }, // Date when user clicked link
    recoveryCount: { type: Number, default: 0 }, // How many times notified
}, { timestamps: true });

// Prevent duplicates by email within 24 hours? 
// Or just update existing entry?
// We will use email/phone as key in API upsert.

export default mongoose.models.AbandonedCheckout || mongoose.model('AbandonedCheckout', AbandonedCheckoutSchema);
