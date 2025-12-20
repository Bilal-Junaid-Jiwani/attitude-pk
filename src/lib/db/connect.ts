import mongoose from 'mongoose';

async function dbConnect() {
    console.log('🔌 dbConnect called - Simple Mode');
    const uri = process.env.MONGO_URI;

    if (!uri) {
        throw new Error('MONGO_URI missing');
    }

    if (mongoose.connection.readyState >= 1) {
        console.log('✅ already connected');
        return mongoose.connection;
    }

    try {
        console.log('🔄 Connecting to Mongo...');
        const conn = await mongoose.connect(uri);
        console.log('✅ Connected');
        return conn;
    } catch (e) {
        console.error('❌ Connection failed:', e);
        throw e;
    }
}

export default dbConnect;
