import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db/connect';
import Fragrance from '@/lib/models/Fragrance';

// PUT: Update fragrance
export async function PUT(req: Request, props: { params: Promise<{ id: string }> }) {
    await dbConnect();
    try {
        const params = await props.params;
        const body = await req.json();
        const fragrance = await Fragrance.findByIdAndUpdate(params.id, body, {
            new: true,
            runValidators: true,
        });
        if (!fragrance) {
            return NextResponse.json({ error: 'Fragrance not found' }, { status: 404 });
        }
        return NextResponse.json(fragrance);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 400 });
    }
}

// DELETE: Delete fragrance
export async function DELETE(req: Request, props: { params: Promise<{ id: string }> }) {
    await dbConnect();
    try {
        const params = await props.params;
        const fragrance = await Fragrance.findByIdAndDelete(params.id);
        if (!fragrance) {
            return NextResponse.json({ error: 'Fragrance not found' }, { status: 404 });
        }
        return NextResponse.json({ message: 'Fragrance deleted successfully' });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
