const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/attitude-pk';

// Mini Schemas for script
const ProductSchema = new mongoose.Schema({
    name: String, description: String, price: Number, stock: Number, category: String, subCategory: String, imageUrl: String
});
const OrderSchema = new mongoose.Schema({
    user: mongoose.Schema.Types.ObjectId,
    items: Array,
    totalAmount: Number,
    status: String,
    createdAt: Date
});
const UserSchema = new mongoose.Schema({ email: String });

const Product = mongoose.models.Product || mongoose.model('Product', ProductSchema);
const Order = mongoose.models.Order || mongoose.model('Order', OrderSchema);
const User = mongoose.models.User || mongoose.model('User', UserSchema);

const sampleProducts = [
    { name: 'Baby Leaves Shampoo', description: 'Gentle', price: 2500, stock: 50, category: 'Baby', subCategory: 'Hair Care', imageUrl: 'https://images.unsplash.com/photo-1596462502278-27bfdd403348?q=80&w=600' },
    { name: 'Little Leaves Body Haze', description: 'Soft', price: 1800, stock: 5, category: 'Kids', subCategory: 'Body Care', imageUrl: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?q=80&w=600' },
    { name: 'Nature Clean Spray', description: 'Effective', price: 1200, stock: 100, category: 'Home', subCategory: 'Cleaning', imageUrl: 'https://images.unsplash.com/photo-1585421514738-01798e348b17?q=80&w=600' },
    { name: 'Super Berry Body Wash', description: 'Fruity', price: 2200, stock: 8, category: 'Kids', subCategory: 'Body Care', imageUrl: 'https://images.unsplash.com/photo-1556228720-1957be982260?q=80&w=600' },
    { name: 'Blooming Belly Cream', description: 'For Moms', price: 3500, stock: 20, category: 'Baby', subCategory: 'Mom Care', imageUrl: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?q=80&w=600' },
];

const seedData = async () => {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('📦 Database Connected for Data Seeding');

        // Clear existing
        await Product.deleteMany({});
        await Order.deleteMany({});
        console.log('🧹 Cleared old data');

        // Insert Products
        const createdProducts = await Product.insertMany(sampleProducts);
        console.log(`✨ Created ${createdProducts.length} Products`);

        // Get Admin User for Order ownership
        const adminUser = await User.findOne({ email: 'admin@attitude.pk' });
        if (!adminUser) {
            console.log('❌ Admin user not found. Run seed.js first.');
            process.exit(1);
        }

        // Create Orders
        const orders = [];
        const statuses = ['Pending', 'Processing', 'On the Way', 'Delivered', 'Cancelled'];

        // Generate last 30 days orders
        for (let i = 0; i < 50; i++) {
            const randomDays = Math.floor(Math.random() * 30);
            const date = new Date();
            date.setDate(date.getDate() - randomDays);

            const randomProduct = createdProducts[Math.floor(Math.random() * createdProducts.length)];
            const quantity = Math.floor(Math.random() * 3) + 1;
            const total = randomProduct.price * quantity;

            orders.push({
                user: adminUser._id,
                items: [{
                    product: randomProduct._id,
                    name: randomProduct.name,
                    price: randomProduct.price,
                    quantity: quantity,
                    image: randomProduct.imageUrl
                }],
                totalAmount: total,
                status: statuses[Math.floor(Math.random() * statuses.length)],
                createdAt: date
            });
        }

        await Order.insertMany(orders);
        console.log(`✨ Created ${orders.length} Orders`);

        process.exit();
    } catch (error) {
        console.error('❌ Error Seeding Data:', error);
        process.exit(1);
    }
};

seedData();
