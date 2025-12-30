
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
        await mongoose.connect(MONGO_URI!);
        const products = await Product.find({}, 'name isActive isArchived');
        console.table(products.map(p => ({
            id: p._id,
            name: p.name,
            isActive: p.isActive,
            isArchived: p.isArchived,
            // Check if isArchived is actually undefined
            hasIsArchived: p.toObject().hasOwnProperty('isArchived')
        })));
    } catch (error) {
        console.error('Error:', error);
    } finally {
        await mongoose.disconnect();
    }
}

check();
