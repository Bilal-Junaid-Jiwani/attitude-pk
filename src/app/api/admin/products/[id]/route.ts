import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db/connect';
import Product from '@/lib/models/Product';
import Category from '@/lib/models/Category';
import Fragrance from '@/lib/models/Fragrance';
import Format from '@/lib/models/Format';

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
    await dbConnect();
    const { id } = await params;
    try {
        const product = await Product.findById(id)
            .setOptions({ bufferCommands: false, strictPopulate: false })
            .populate({ path: 'category', select: 'name', model: Category, strictPopulate: false })
            .populate({ path: 'fragrance', select: 'name', model: Fragrance, strictPopulate: false })
            .populate({ path: 'format', select: 'name', model: Format, strictPopulate: false });

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
