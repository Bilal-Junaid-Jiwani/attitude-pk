import mongoose from 'mongoose';

const SettingSchema = new mongoose.Schema({
    key: {
        type: String,
        required: [true, 'Setting key is required'],
        unique: true,
        trim: true,
    },
    value: {
        type: mongoose.Schema.Types.Mixed, // Allows storing any object/value
        required: [true, 'Setting value is required'],
    },
}, { timestamps: true });

export default mongoose.models.Setting || mongoose.model('Setting', SettingSchema);
