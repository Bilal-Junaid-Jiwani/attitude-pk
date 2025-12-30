import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db/connect';
import Category from '@/lib/models/Category';

// GET: List all categories
export async function GET() {
    await dbConnect();
    try {
        const categories = await Category.find({})
            .setOptions({ bufferCommands: false })
            .sort({ createdAt: -1 });
        return NextResponse.json(categories);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// POST: Create a new category
export async function POST(req: Request) {
    await dbConnect();
    try {
        const body = await req.json();
        const category = await Category.create(body);
        return NextResponse.json(category, { status: 201 });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 400 });
    }
}
