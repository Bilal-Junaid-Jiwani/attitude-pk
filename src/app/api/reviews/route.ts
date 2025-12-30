import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db/connect';
import Review from '@/lib/models/Review';
import User from '@/lib/models/User';
import Product from '@/lib/models/Product'; // Ensure Model is registered
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';

// GET: Fetch all reviews
export async function GET(req: Request) {
    try {
        await dbConnect();

        const { searchParams } = new URL(req.url);
        const productId = searchParams.get('productId');

        const filter = productId ? { product: productId } : {};

        // Fetch reviews and sort by date descending
        const reviews = await Review.find(filter)
            .sort({ date: -1 })
            .populate({ path: 'product', select: 'name imageUrl images', model: 'Product', strictPopulate: false });

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

        // 1. Authenticate User (Optional)
        const cookieStore = await cookies();
        const token = cookieStore.get('token');
        let user;

        if (token) {
            try {
                const secret = process.env.JWT_SECRET || 'fallback_secret_key_change_me';
                const decoded: any = jwt.verify(token.value, secret);
                user = await User.findById(decoded.id);
            } catch (err) {
                // Invalid token, treat as guest
            }
        }

        // 3. Parse Body
        const body = await req.json();
        const { rating, title, body: reviewBody, productId, name } = body;

        if (!productId) {
            return NextResponse.json({ error: 'Product ID is required' }, { status: 400 });
        }

        // Name validation for guests
        if (!user && !name) {
            return NextResponse.json({ error: 'Name is required for guest reviews' }, { status: 400 });
        }

        // 4. Create Review
        const newReview = await Review.create({
            user: user ? user._id : undefined, // Optional user reference
            product: productId,
            name: user ? user.name : name, // Use user name or provided name
            rating,
            title,
            body: reviewBody,
            verified: !!user // Only logged-in users are verified automatically
        });

        return NextResponse.json({ message: 'Review submitted successfully', review: newReview }, { status: 201 });

    } catch (error: any) {
        console.error('Create Review Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
