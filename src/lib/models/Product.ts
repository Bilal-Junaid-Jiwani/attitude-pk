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
        index: true,
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
    compareAtPrice: {
        type: Number,
        default: 0,
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
        default: true,
        index: true,
    },
    isArchived: {
        type: Boolean,
        default: false
    },

    // Variants System (e.g. for different Fragrances with different Images)
    variants: [{
        fragrance: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Fragrance'
        },
        format: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Format'
        },
        price: Number,
        stock: Number,
        sku: String,
        imageUrl: String,
        images: [String] // Multiple images for this specific variant
    }]
}, { timestamps: true });

// Indexes for filtering
ProductSchema.index({ category: 1 });
ProductSchema.index({ price: 1 });
ProductSchema.index({ subCategory: 1 });

// Better Slugify with Uniqueness Check
ProductSchema.pre('save', async function (next) {
    if (this.isModified('name')) {
        let slug = this.name.toLowerCase()
            .replace(/ /g, '-')
            .replace(/[^\w-]+/g, '')
            .replace(/--+/g, '-') // Replace multiple hyphens with single
            .replace(/^-+/, '') // Trim leading hyphens
            .replace(/-+$/, ''); // Trim trailing hyphens

        // Check for uniqueness
        const existingProduct = await mongoose.models.Product.findOne({ slug: slug });
        if (existingProduct) {
            // If exists, append random string
            const random = Math.floor(Math.random() * 1000);
            slug = `${slug}-${random}`;
        }
        this.slug = slug;
    }
    next();
});

export default mongoose.models.Product || mongoose.model('Product', ProductSchema);
