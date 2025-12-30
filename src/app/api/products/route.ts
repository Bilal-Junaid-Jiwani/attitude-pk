import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db/connect';
import Product from '@/lib/models/Product';
import Category from '@/lib/models/Category';
import Fragrance from '@/lib/models/Fragrance';
import Format from '@/lib/models/Format';

// Simple in-memory cache for products
let cachedProducts: { time: number; data: any } | null = null;
const CACHE_DURATION = 60 * 1000 * 5; // 5 minutes

export async function GET() {
    try {
        // Check cache
        if (cachedProducts && (Date.now() - cachedProducts.time < CACHE_DURATION)) {
            return NextResponse.json(cachedProducts.data);
        }

        await dbConnect();

        // Ensure models are registered
        const _models = [Category, Fragrance, Format]; // Access to force registration
        console.log('Models registered:', [Category.modelName, Fragrance.modelName, Format.modelName]);

        const products = await Product.find({ isActive: true })
            .setOptions({ strictPopulate: false })
            .populate({ path: 'category', select: 'name', model: Category, strictPopulate: false })
            .populate({ path: 'fragrance', select: 'name', model: Fragrance, strictPopulate: false })
            .populate({ path: 'format', select: 'name', model: Format, strictPopulate: false })
            .sort({ createdAt: -1 });

        console.log(`API check: Found ${products.length} active products`);
        if (products.length > 0) {
            console.log('Sample product category:', JSON.stringify(products[0].category));
            console.log('Sample product subCategory:', products[0].subCategory);
            console.log('Sample product full:', JSON.stringify(products[0]));
        }

        // Update cache
        cachedProducts = { time: Date.now(), data: products };

        return NextResponse.json(products);
    } catch (error: any) {
        console.error('Failed to fetch products:', error);

        // Return stale cache if available on error
        if (cachedProducts) {
            console.log('Returning stale cache due to error');
            return NextResponse.json(cachedProducts.data);
        }

        return NextResponse.json([], { status: 200 });
    }
}
