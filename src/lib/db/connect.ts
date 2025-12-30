import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGO_URI;

if (!MONGODB_URI) {
    throw new Error('Please define the MONGO_URI environment variable inside .env.local');
}

/**
 * Global is used here to maintain a cached connection across hot reloads
 * in development. This prevents connections growing exponentially
 * during API Route usage.
 */
let cached = (global as any).mongoose;

if (!cached) {
    cached = (global as any).mongoose = { conn: null, promise: null };
}

async function dbConnect() {
    if (cached.conn) {
        // Check if connection is actually ready (readyState 1 = connected)
        if (mongoose.connection.readyState === 1) {
            console.log('✅ Use existing connection');
            return cached.conn;
        }
        console.log('⚠️ Cached connection exists but readyState is', mongoose.connection.readyState, '- Reconnecting...');
        cached.promise = null; // Force reconnection if not ready
    }

    if (!cached.promise) {
        console.log('🔄 Creating new DB connection...');
        // mongoose.set('bufferCommands', false); // Stop buffering effectively

        const opts = {
            bufferCommands: true,
            serverSelectionTimeoutMS: 30000,
            connectTimeoutMS: 30000,
            socketTimeoutMS: 30000,
        };

        cached.promise = mongoose.connect(MONGODB_URI!, opts).then((mongoose) => {
            console.log('✅ New DB connection established');
            return mongoose;
        }).catch(err => {
            console.error('❌ DB Connection Error:', err);
            cached.promise = null; // Reset promise on failure
            throw err;
        });
    }

    try {
        cached.conn = await cached.promise;
    } catch (e) {
        cached.promise = null;
        throw e;
    }

    return cached.conn;
}

export default dbConnect;
