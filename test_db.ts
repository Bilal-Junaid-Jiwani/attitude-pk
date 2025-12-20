import dbConnect from './src/lib/db/connect';
import dotenv from 'dotenv';
dotenv.config();

async function test() {
    console.log('Testing DB Connect...');
    try {
        await dbConnect();
        console.log('Success!');
        process.exit(0);
    } catch (e) {
        console.error('Failed:', e);
        process.exit(1);
    }
}

test();
