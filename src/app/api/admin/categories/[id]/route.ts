import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db/connect';
import Category from '@/lib/models/Category';

// PUT: Update category
export async function PUT(req: Request, props: { params: Promise<{ id: string }> }) {
    await dbConnect();
    try {
        const params = await props.params;
        const body = await req.json();
        const category = await Category.findByIdAndUpdate(params.id, body, {
            new: true,
            runValidators: true,
        });
        if (!category) {
            return NextResponse.json({ error: 'Category not found' }, { status: 404 });
        }
        return NextResponse.json(category);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 400 });
    }
}

// DELETE: Delete category
export async function DELETE(req: Request, props: { params: Promise<{ id: string }> }) {
    await dbConnect();
    try {
        const params = await props.params;
        const category = await Category.findByIdAndDelete(params.id);
        if (!category) {
            return NextResponse.json({ error: 'Category not found' }, { status: 404 });
        }
        return NextResponse.json({ message: 'Category deleted successfully' });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
