import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db/connect';
import Review from '@/lib/models/Review';
import User from '@/lib/models/User';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';

// GET: Fetch all reviews
export async function GET() {
    try {
        await dbConnect();

        // Fetch reviews and sort by date descending
        const reviews = await Review.find({}).sort({ date: -1 });

        return NextResponse.json(reviews);
    } catch (error: any) {
        console.error('Fetch Reviews Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// POST: Create a new review
export async function POST(req: Request) {
    try {
        await dbConnect();

        // 1. Authenticate User
        const cookieStore = await cookies();
        const token = cookieStore.get('token');

        if (!token) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const secret = process.env.JWT_SECRET || 'fallback_secret_key_change_me';
        let decoded: any;

        try {
            decoded = jwt.verify(token.value, secret);
        } catch (err) {
            return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
        }

        // 2. Get User Details
        const user = await User.findById(decoded.id);
        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        // 3. Parse Body
        const body = await req.json();
        const { rating, title, review: reviewBody } = body;

        // 4. Create Review
        const newReview = await Review.create({
            user: user._id,
            name: user.name,
            rating,
            title,
            body: reviewBody,
            verified: true // Marking logged-in users as verified for now
        });

        return NextResponse.json({ message: 'Review submitted successfully', review: newReview }, { status: 201 });

    } catch (error: any) {
        console.error('Create Review Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
