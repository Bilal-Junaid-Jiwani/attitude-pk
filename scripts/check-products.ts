
import dotenv from 'dotenv';
import mongoose from 'mongoose';

dotenv.config({ path: '.env.local' });
dotenv.config({ path: '.env' });

const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
    console.error('MONGO_URI is not defined');
    process.exit(1);
}

const ProductSchema = new mongoose.Schema({}, { strict: false });
const Product = mongoose.models.Product || mongoose.model('Product', ProductSchema);

async function check() {
    try {
        console.log('Connecting to DB...');
        await mongoose.connect(MONGO_URI!);
        console.log('Connected.');

        const count = await Product.countDocuments();
        console.log(`Total Products: ${count}`);

        const activeCount = await Product.countDocuments({ isActive: true });
        console.log(`Active Products: ${activeCount}`);

        if (activeCount > 0) {
            const sample = await Product.findOne({ isActive: true });
            console.log('Sample Product:', JSON.stringify(sample, null, 2));
        }

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await mongoose.disconnect();
    }
}

check();
