
import dotenv from 'dotenv';
import mongoose from 'mongoose';

dotenv.config({ path: '.env.local' });
dotenv.config({ path: '.env' });

const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
    console.error('MONGO_URI is not defined');
    process.exit(1);
}

// Define Schemas inline to avoid import issues
const ReviewSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Optional now
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    name: { type: String, required: true },
    rating: { type: Number, required: true },
    title: { type: String, required: true },
    body: { type: String, required: true },
    verified: { type: Boolean, default: false },
    date: { type: Date, default: Date.now }
}, { timestamps: true });

const ProductSchema = new mongoose.Schema({}, { strict: false });

const Review = mongoose.models.Review || mongoose.model('Review', ReviewSchema);
const Product = mongoose.models.Product || mongoose.model('Product', ProductSchema);

async function test() {
    try {
        console.log('Connecting to DB...');
        await mongoose.connect(MONGO_URI!);
        console.log('Connected.');

        console.log('Fetching reviews with populate...');
        const reviews = await Review.find({})
            .populate({ path: 'product', model: Product, select: 'name imageUrl' })
            .sort({ date: -1 });

        console.log(`Found ${reviews.length} reviews.`);

        if (reviews.length > 0) {
            console.log('Sample Review:', JSON.stringify(reviews[0], null, 2));
            if (!reviews[0].product) {
                console.warn('WARNING: Product field is null! Populate failed or product deleted.');
                // Check raw product ID
                const rawReview = await Review.findById(reviews[0]._id);
                console.log('Raw Review Product ID:', rawReview.product);
            }
        } else {
            const count = await Review.countDocuments();
            console.log(`Raw Review Count (no populate): ${count}`);
        }

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await mongoose.disconnect();
    }
}

test();
