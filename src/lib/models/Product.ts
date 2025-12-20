import mongoose from 'mongoose';

const ProductSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please provide a product name'],
        trim: true,
        maxlength: [100, 'Name cannot be more than 100 characters'],
    },
    slug: {
        type: String,
        unique: true,
        lowercase: true,
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
    // References
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        required: [true, 'Please select a category'],
    },
    subCategory: {
        type: String, // Storing Name or Slug of subcategory for now as it's embedded in Category
    },
    fragrance: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Fragrance',
    },

    // Detailed Info
    benefits: [String], // Array of benefits
    ingredients: String,
    howToUse: String,
    format: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Format',
    }, // e.g., 'Liquid', 'Spray'

    imageUrl: {
        type: String,
        required: [true, 'Please provide an image URL'],
    },
    // Support for multiple images
    images: {
        type: [String],
        default: []
    },

    isActive: {
        type: Boolean,
        default: true
    }
}, { timestamps: true });

// Basic Slugify
ProductSchema.pre('save', function (next) {
    if (this.isModified('name')) {
        this.slug = this.name.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');
    }
    next();
});

export default mongoose.models.Product || mongoose.model('Product', ProductSchema);
