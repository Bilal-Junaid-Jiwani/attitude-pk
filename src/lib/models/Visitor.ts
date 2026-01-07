import mongoose from 'mongoose';

const VisitorSchema = new mongoose.Schema({
    visitorId: {
        type: String,
        required: true,
        unique: true,
        index: true
    },
    lastActive: {
        type: Date,
        default: Date.now,
        index: { expires: '5m' } // TTL Index: Auto-delete after 5 minutes of inactivity
    },
    page: {
        type: String,
        default: '/'
    },
    device: {
        type: String,
        default: 'desktop'
    }
}, { timestamps: true });

// Prevent recompilation error in dev mode
const Visitor = mongoose.models.Visitor || mongoose.model('Visitor', VisitorSchema);

export default Visitor;
