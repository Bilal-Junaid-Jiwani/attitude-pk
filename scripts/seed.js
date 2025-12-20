const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/attitude-pk';

// Define User Schema inline to avoid TS compilation issues for this script
// or use simple require if we compiled, but inline is safer for raw node script
const userSchema = new mongoose.Schema({
    name: String,
    email: { type: String, unique: true },
    password: { type: String, select: false },
    role: { type: String, default: 'user' },
});

const User = mongoose.models.User || mongoose.model('User', userSchema);

const seedUsers = async () => {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('📦 Database Connected for Seeding');

        // Check if admin exists
        const adminExists = await User.findOne({ email: 'admin@attitude.pk' });

        if (adminExists) {
            console.log('⚠️ Admin user already exists. Skipping...');
            process.exit();
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('admin123', salt);

        const adminUser = await User.create({
            name: 'Attitude Admin',
            email: 'admin@attitude.pk',
            password: hashedPassword,
            role: 'admin'
        });

        console.log(`✅ Admin User Created: ${adminUser.email}`);
        process.exit();

    } catch (error) {
        console.error(`❌ Error: ${error.message}`);
        process.exit(1);
    }
};

seedUsers();
