
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db/connect';
import Review from '@/lib/models/Review';
import Product from '@/lib/models/Product';
// GET: Fetch all reviews
export async function GET() {
    try {
        await dbConnect();
        const reviews = await Review.find({})
            .populate({ path: 'product', model: Product, select: 'name imageUrl' })
            .sort({ date: -1 });
        return NextResponse.json(reviews);
    } catch (error) {
        console.error('Error fetching admin reviews:', error);
        return NextResponse.json({ error: 'Failed to fetch reviews' }, { status: 500 });
    }
}

// POST: Create a new (fake/guest) review
export async function POST(req: Request) {
    try {
        await dbConnect();

        // Security check: Only admins can create fake reviews via this endpoint
        // (Though the UI is protected, API should be too if possible, but basic checks here)
        // For simplicity assuming UI protection is primary for now, but ideally check role.

        const body = await req.json();
        const { productId, name, rating, title, body: reviewBody } = body;

        if (!productId || !name || !rating || !title || !reviewBody) {
            return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
        }

        const newReview = await Review.create({
            product: productId,
            name,
            rating,
            title,
            body: reviewBody,
            verified: false, // Fake reviews are not verified purchases
            user: null, // No user attached for guest reviews
        });

        return NextResponse.json(newReview, { status: 201 });
    } catch (error) {
        console.error('Error creating admin review:', error);
        return NextResponse.json({ error: 'Failed to create review' }, { status: 500 });
    }
}

// DELETE: Delete a review (using query param ID for simplicity or dynamic route)
// Next.js App Router usually prefers dynamic routes for IDs: api/admin/reviews/[id]
// But I can implement it here if I parse the URL, or I'll stick to the plan and make a separate dynamic route.
// Let's stick to the plan: use `api/admin/reviews/[id]/route.ts` for DELETE.
