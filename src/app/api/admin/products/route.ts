import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db/connect';
import Product from '@/lib/models/Product';
import '@/lib/models/Category'; // Ensure model is registered
import '@/lib/models/Fragrance'; // Ensure model is registered
import '@/lib/models/Format'; // Ensure model is registered

// GET: List all products
export async function GET() {
    await dbConnect();
    try {
        const products = await Product.find({})
            .populate('category', 'name')
            .populate('fragrance', 'name')
            .populate('format', 'name')
            .sort({ createdAt: -1 });
        return NextResponse.json(products);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// POST: Create a new product
export async function POST(req: Request) {
    await dbConnect();
    try {
        const body = await req.json();

        // Ensure imageUrl is set from the first image if multiple are provided but imageUrl is missing
        if (body.images && body.images.length > 0 && !body.imageUrl) {
            body.imageUrl = body.images[0];
        }

        const product = await Product.create(body);
        return NextResponse.json(product, { status: 201 });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 400 });
    }
}
