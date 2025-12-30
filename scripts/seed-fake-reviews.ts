
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

import dbConnect from '../src/lib/db/connect';
import Product from '../src/lib/models/Product';
import Review from '../src/lib/models/Review';
import User from '../src/lib/models/User';

const REVIEWS_TEXT = [
    { title: "Absolutely Love It!", body: "This product exceeded my expectations. The quality is top-notch and it works exactly as described. Highly recommended!" },
    { title: "Great Value", body: "For the price, you can't beat this. I've tried more expensive brands but this one performs just as well, if not better." },
    { title: "A Household Staple", body: "We use this every day now. It's gentle, effective, and smells wonderful. Will definitely be buying again." },
    { title: "Perfect for Kids", body: "My kids have sensitive skin and this has been a lifesaver. No irritation whatsoever. Ver happy with this purchase." },
    { title: "Smells Amazing", body: "The scent is light and refreshing, not overpowering at all. Leaves a great feeling after use." },
    { title: "Fast Shipping", body: "Arrived quickly and well-packaged. The product itself is fantastic. 5 stars!" },
    { title: "Highly Recommend", body: "If you're on the fence, just get it. You won't regret it. Great quality and safe ingredients." },
    { title: "Excellent Quality", body: "You can tell they use good ingredients. Feels premium but affordable. Love it." }
];

const NAMES = [
    "Ayesha K.", "Sarah M.", "Fatima Z.", "Zainab R.", "Hira S.", "Amna B.", "Mariam Y.",
    "Bilal A.", "Omar K.", "Ali H.", "Usman G.", "Ahmed F.", "Saad T.", "Hamza N."
];

async function seedReviews() {
    try {
        console.log('Connecting to DB...');
        await dbConnect();

        console.log('Fetching Products...');
        const products = await Product.find({ isActive: true });
        console.log(`Found ${products.length} active products.`);

        // Get a dummy user for the reviews (or create one)
        let user = await User.findOne({ email: 'review_bot@attitudepk.com' });
        if (!user) {
            user = await User.create({
                name: "Verified Customer",
                email: "review_bot@attitudepk.com",
                password: "securehashplaceholder",
                role: "user"
            });
            console.log('Created dummy user for reviews.');
        }

        let totalReviewsAdded = 0;

        for (const product of products) {
            // Check existing reviews
            const existingCount = await Review.countDocuments({ product: product._id });
            if (existingCount >= 3) {
                console.log(`Skipping ${product.name} (already has ${existingCount} reviews)`);
                continue;
            }

            const reviewsNeeded = Math.floor(Math.random() * 3) + 3; // 3 to 5 reviews
            console.log(`Adding ${reviewsNeeded} reviews for: ${product.name}`);

            for (let i = 0; i < reviewsNeeded; i++) {
                const randomText = REVIEWS_TEXT[Math.floor(Math.random() * REVIEWS_TEXT.length)];
                const randomName = NAMES[Math.floor(Math.random() * NAMES.length)];
                const randomRating = Math.random() > 0.3 ? 5 : 4; // Mostly 5 stars, some 4

                await Review.create({
                    user: user._id,
                    product: product._id,
                    name: randomName,
                    rating: randomRating,
                    title: randomText.title,
                    body: randomText.body,
                    verified: true,
                    date: new Date(Date.now() - Math.floor(Math.random() * 10000000000)) // Random date in past
                });
                totalReviewsAdded++;
            }
        }

        console.log(`\nSUCCESS: Added ${totalReviewsAdded} new reviews!`);
        process.exit(0);

    } catch (error) {
        console.error('Seeding Error:', error);
        process.exit(1);
    }
}

seedReviews();
