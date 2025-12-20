import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db/connect';
import Product from '@/lib/models/Product';
import Category from '@/lib/models/Category';
import Fragrance from '@/lib/models/Fragrance';
import Format from '@/lib/models/Format';

export async function GET() {
    try {
        await dbConnect();

        // Ensure models are registered
        // const _models = [Category, Fragrance, Format]; // Kept as comment or just access them to force registration if needed
        console.log('Models registered:', [Category.modelName, Fragrance.modelName, Format.modelName]);

        const products = await Product.find({ isActive: true })
            .populate('category', 'name')
            .populate('fragrance', 'name')
            .populate('format', 'name')
            .sort({ createdAt: -1 });

        console.log(`API check: Found ${products.length} active products`);
        if (products.length > 0) {
            console.log('Sample product category:', JSON.stringify(products[0].category));
            console.log('Sample product subCategory:', products[0].subCategory);
            console.log('Sample product full:', JSON.stringify(products[0]));
        }

        return NextResponse.json(products);
    } catch (error) {
        console.error('Failed to fetch products:', error);
        return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
    }
}
