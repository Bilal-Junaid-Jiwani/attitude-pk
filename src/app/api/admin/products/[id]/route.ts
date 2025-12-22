import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db/connect';
import Product from '@/lib/models/Product';
import '@/lib/models/Category';
import '@/lib/models/Fragrance';
import '@/lib/models/Format';

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
    await dbConnect();
    const { id } = await params;
    try {
        const product = await Product.findById(id)
            .populate('category')
            .populate('fragrance')
            .populate('format');

        if (!product) {
            return NextResponse.json({ error: 'Product not found' }, { status: 404 });
        }
        return NextResponse.json(product);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
    await dbConnect();
    const { id } = await params;
    try {
        const body = await req.json();

        if (body.images && body.images.length > 0 && !body.imageUrl) {
            body.imageUrl = body.images[0];
        }

        const product = await Product.findByIdAndUpdate(
            id,
            { ...body },
            { new: true, runValidators: true }
        );

        if (!product) {
            return NextResponse.json({ error: 'Product not found' }, { status: 404 });
        }
        return NextResponse.json(product);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 400 });
    }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
    await dbConnect();
    const { id } = await params;
    try {
        const product = await Product.findByIdAndDelete(id);
        if (!product) {
            return NextResponse.json({ error: 'Product not found' }, { status: 404 });
        }
        return NextResponse.json({ message: 'Product deleted successfully' });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
