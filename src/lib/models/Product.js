"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const ProductSchema = new mongoose_1.default.Schema({
    name: {
        type: String,
        required: [true, 'Please provide a product name'],
        trim: true,
        maxlength: [100, 'Name cannot be more than 100 characters'],
    },
    description: {
        type: String,
        required: [true, 'Please provide a description'],
    },
    price: {
        type: Number,
        required: [true, 'Please provide a price'],
        min: [0, 'Price must be positive'],
    },
    stock: {
        type: Number,
        required: [true, 'Please provide stock number'],
        min: [0, 'Stock must be non-negative'],
        default: 0,
    },
    category: {
        type: String,
        required: [true, 'Please provide a category'],
        enum: {
            values: ['Baby', 'Kids', 'Home'],
            message: '{VALUE} is not a supported category',
        },
    },
    subCategory: {
        type: String,
        required: [true, 'Please provide a sub-category'],
    },
    imageUrl: {
        type: String,
        required: [true, 'Please provide an image URL'],
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});
exports.default = mongoose_1.default.models.Product || mongoose_1.default.model('Product', ProductSchema);
