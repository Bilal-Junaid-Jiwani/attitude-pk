import mongoose from 'mongoose';



const OrderSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: false, // Allow guest checkout
    },
    items: [
        {
            product_id: { type: String, required: true },
            name: { type: String, required: true },
            price: { type: Number, required: true },
            quantity: { type: Number, required: true, min: 1 },
            subCategory: { type: String },
            imageUrl: { type: String, required: true },
        }
    ],
    totalAmount: {
        type: Number,
        required: true,
    },
    subtotal: { type: Number, default: 0 },
    shippingCost: { type: Number, default: 0 },
    tax: { type: Number, default: 0 },
    discount: { type: Number, default: 0 },
    couponCode: { type: String },
    shippingAddress: {
        fullName: { type: String, required: true },
        email: { type: String, required: true },
        phone: { type: String, required: true },
        address: { type: String, required: true },
        city: { type: String, required: true },
        postalCode: { type: String, required: false },
    },
    paymentMethod: {
        type: String,
        default: 'COD',
        enum: ['COD', 'Card', 'Safepay', 'Online Payment'],
    },
    status: {
        type: String,
        enum: ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled', 'Returned'],
        default: 'Pending',
    },
    paymentResult: {
        id: String,
        status: String,
        update_time: String,
        email_address: String,
    },
    isPaid: {
        type: Boolean,
        required: true,
        default: false,
    },
    paidAt: {
        type: Date,
    },
    isArchived: {
        type: Boolean,
        default: false,
    },
}, { timestamps: true });

export default mongoose.models.Order || mongoose.model('Order', OrderSchema);
