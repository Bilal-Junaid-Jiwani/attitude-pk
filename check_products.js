const mongoose = require('mongoose');

// Adjust path as needed to your .env file
require('dotenv').config({ path: '.env' });

const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
    console.error('MONGO_URI is not active in .env');
    process.exit(1);
}

const productSchema = new mongoose.Schema({
    name: String,
    isActive: Boolean,
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
    subCategory: String,
}, { strict: false });

const Product = mongoose.models.Product || mongoose.model('Product', productSchema);
const Category = mongoose.models.Category || mongoose.model('Category', new mongoose.Schema({ name: String }));

async function testFetch() {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('Connected to DB');

        const total = await Product.countDocuments({});
        const active = await Product.countDocuments({ isActive: true });

        console.log(`Total Products: ${total}`);
        console.log(`Active Products: ${active}`);

        if (active > 0) {
            const products = await Product.find({ isActive: true }).populate('category').limit(3);
            console.log('Sample Products:', JSON.stringify(products, null, 2));
        } else {
            console.log('No active products found. This is likely why they are not showing.');
        }

    } catch (error) {
        console.error('Error fetching products:', error);
    } finally {
        await mongoose.disconnect();
    }
}

testFetch();
