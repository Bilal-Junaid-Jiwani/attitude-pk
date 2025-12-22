import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please provide a name'],
        maxlength: [60, 'Name cannot be more than 60 characters'],
    },
    email: {
        type: String,
        required: [true, 'Please provide an email'],
        unique: true,
        match: [
            /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
            'Please add a valid email',
        ],
    },
    password: {
        type: String,
        required: [true, 'Please provide a password'],
        minlength: [6, 'Password must be at least 6 characters'],
        select: false, // Don't return password by default
    },
    role: {
        type: String,
        enum: ['user', 'admin', 'guest'],
        default: 'user',
    },
    address: {
        type: String,
        maxlength: [200, 'Address cannot be more than 200 characters'],
    },
    postcode: {
        type: String,
        maxlength: [20, 'Postcode cannot be more than 20 characters'],
    },
    phone: {
        type: String,
        maxlength: [20, 'Phone number cannot be more than 20 characters'],
    },
    addressTag: {
        type: String,
        enum: ['Home', 'Work', 'School', 'Other'],
        default: 'Home',
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

export default mongoose.models.User || mongoose.model('User', UserSchema);
