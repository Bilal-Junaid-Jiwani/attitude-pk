import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db/connect';
import Product from '@/lib/models/Product';

// GET: Single product
export async function GET(req: Request, props: { params: Promise<{ id: string }> }) {
    await dbConnect();
    try {
        const params = await props.params;
        const product = await Product.findById(params.id)
            .populate('category')
            .populate('fragrance')
            .populate('format');
        if (!product) return NextResponse.json({ error: 'Product not found' }, { status: 404 });
        return NextResponse.json(product);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// PUT: Update product
export async function PUT(req: Request, props: { params: Promise<{ id: string }> }) {
    await dbConnect();
    try {
        const params = await props.params;
        const body = await req.json();

        // Sync imageUrl with the first image if exists
        if (body.images && body.images.length > 0) {
            body.imageUrl = body.images[0];
        }

        const product = await Product.findByIdAndUpdate(params.id, body, {
            new: true,
            runValidators: true,
        });
        if (!product) {
            return NextResponse.json({ error: 'Product not found' }, { status: 404 });
        }
        return NextResponse.json(product);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 400 });
    }
}

// DELETE: Delete product
export async function DELETE(req: Request, props: { params: Promise<{ id: string }> }) {
    await dbConnect();
    try {
        const params = await props.params;
        const product = await Product.findByIdAndDelete(params.id);
        if (!product) {
            return NextResponse.json({ error: 'Product not found' }, { status: 404 });
        }
        return NextResponse.json({ message: 'Product deleted successfully' });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
