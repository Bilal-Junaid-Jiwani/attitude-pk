import mongoose from 'mongoose';

const FormatSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please provide a format name'],
        unique: true, // e.g., "473 ml / 16 fl. oz."
        trim: true,
    },
    slug: {
        type: String,
        unique: true,
        lowercase: true,
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, { timestamps: true });

// Basic Slugify
FormatSchema.pre('save', function (next) {
    if (this.isModified('name')) {
        this.slug = this.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    }
    next();
});

export default mongoose.models.Format || mongoose.model('Format', FormatSchema);
