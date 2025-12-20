import mongoose from 'mongoose';

const FragranceSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please provide a fragrance name'],
        unique: true,
        trim: true,
    },
    description: String, // e.g., "Sweet and fruity"
    isActive: {
        type: Boolean,
        default: true
    }
}, { timestamps: true });

export default mongoose.models.Fragrance || mongoose.model('Fragrance', FragranceSchema);
