import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db/connect';
import Product from '@/lib/models/Product';
import Category from '@/lib/models/Category';
import Fragrance from '@/lib/models/Fragrance';
import Format from '@/lib/models/Format';

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> } // Fix for Next.js 15
) {
    try {
        await dbConnect();

        // Ensure models are registered (prevent populated model missing error)
        console.log('Models registered for Detail:', [Category.modelName, Fragrance.modelName, Format.modelName]);

        const { id } = await params;

        const product = await Product.findById(id)
            .populate('category', 'name')
            .populate('fragrance', 'name')
            .populate('format', 'name')
            .populate({
                path: 'variants.fragrance',
                model: 'Fragrance',
                select: 'name'
            });

        if (!product) {
            return NextResponse.json({ error: 'Product not found' }, { status: 404 });
        }

        return NextResponse.json(product);
    } catch (error) {
        console.error('Failed to fetch product details:', error);
        return NextResponse.json({ error: 'Failed to fetch product' }, { status: 500 });
    }
}
