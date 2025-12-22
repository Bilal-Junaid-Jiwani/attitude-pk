require('dotenv').config();
const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGO_URI;

if (!MONGODB_URI) {
    console.error('❌ MONGO_URI is not defined in .env file');
    process.exit(1);
}

// Review Schema (matching src/lib/models/Review.ts)
const ReviewSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    title: { type: String, required: true, maxlength: 100 },
    body: { type: String, required: true },
    verified: { type: Boolean, default: false },
    date: { type: Date, default: Date.now }
}, { timestamps: true });

// User Schema (Basic for finding a user)
const UserSchema = new mongoose.Schema({
    name: String,
    email: String
});

const Review = mongoose.models.Review || mongoose.model('Review', ReviewSchema);
const User = mongoose.models.User || mongoose.model('User', UserSchema);

const FAKE_REVIEWS = [
    {
        name: 'Ahmed Ali',
        rating: 5,
        title: 'Amazing quality',
        body: 'Really impressed with the packaging and quality. Delivered to Karachi in 2 days.',
        verified: true,
        date: new Date('2025-12-10')
    },
    {
        name: 'Fatima Noor',
        rating: 5,
        title: 'Highly Recommended',
        body: 'Best body wash I have used. Very gentle on skin. JazakAllah.',
        verified: true,
        date: new Date('2025-12-12')
    },
    {
        name: 'Bilal Khan',
        rating: 4,
        title: 'Good but delivery late',
        body: 'Product is 10/10 but TCS took 5 days to deliver to Peshawar.',
        verified: true,
        date: new Date('2025-12-15')
    },
    {
        name: 'Sana Mir',
        rating: 5,
        title: 'Perfect for kids',
        body: 'My kids love the smell. Natural ingredients, so I am satisfied.',
        verified: true,
        date: new Date('2025-12-18')
    },
    {
        name: 'Usman Ghani',
        rating: 5,
        title: 'Halal and Pure',
        body: 'Love that it is verified Halal. Peace of mind.',
        verified: true,
        date: new Date('2025-12-05')
    },
    {
        name: 'Hira Mani',
        rating: 4,
        title: 'Nice fragrance',
        body: 'Smell is good, not too strong. Will buy again.',
        verified: true,
        date: new Date('2025-12-20')
    },
    {
        name: 'Omer Sheikh',
        rating: 5,
        title: 'Value for money',
        body: 'Big bottle, lasts long. Worth the price.',
        verified: true,
        date: new Date('2025-12-11')
    },
    {
        name: 'Zainab Bibi',
        rating: 5,
        title: 'Customer Service is great',
        body: 'Had an issue with order, they fixed it immediately. Thank you!',
        verified: true,
        date: new Date('2025-12-08')
    }
];

async function seedReviews() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        // Find a user to assign reviews to regarding constraints
        let user = await User.findOne({});
        if (!user) {
            console.log('⚠️ No users found. Creating a dummy user...');
            user = await User.create({
                name: 'System Seeder',
                email: 'seeder@attitude.pk',
                password: 'dummy_hash_password' // won't be used for login really
            });
        }
        console.log(`👤 Assigning reviews to user: ${user.name} (${user._id})`);

        // Prepare reviews with user ID
        const reviewsToInsert = FAKE_REVIEWS.map(r => ({
            ...r,
            user: user._id
        }));

        // Insert
        await Review.insertMany(reviewsToInsert);
        console.log(`🎉 Successfully inserted ${reviewsToInsert.length} reviews!`);

        process.exit(0);
    } catch (error) {
        console.error('❌ Error seeding reviews:', error);
        process.exit(1);
    }
}

seedReviews();
