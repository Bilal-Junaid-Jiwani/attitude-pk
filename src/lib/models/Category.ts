import mongoose from 'mongoose';

const CategorySchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please provide a category name'],
        unique: true,
        trim: true,
    },
    slug: {
        type: String,
        unique: true,
        lowercase: true,
    },
    description: String,
    subCategories: [
        {
            name: { type: String, required: true },
            slug: { type: String, lowercase: true }
        }
    ],
    isActive: {
        type: Boolean,
        default: true
    }
}, { timestamps: true });

// Pre-save hook to generate slug if not provided
CategorySchema.pre('save', function (next) {
    if (this.isModified('name')) {
        this.slug = this.name.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');
    }
    // Generate slugs for subcategories if missing
    if (this.subCategories && this.subCategories.length > 0) {
        this.subCategories.forEach(sub => {
            if (!sub.slug && sub.name) {
                sub.slug = sub.name.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');
            }
        });
    }
    next();
});

export default mongoose.models.Category || mongoose.model('Category', CategorySchema);
