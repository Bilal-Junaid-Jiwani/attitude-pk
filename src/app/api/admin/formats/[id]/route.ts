import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db/connect';
import Format from '@/lib/models/Format';

// PUT: Update format
export async function PUT(req: Request, props: { params: Promise<{ id: string }> }) {
    await dbConnect();
    try {
        const params = await props.params;
        const body = await req.json();
        const format = await Format.findByIdAndUpdate(params.id, body, {
            new: true,
            runValidators: true,
        });
        if (!format) {
            return NextResponse.json({ error: 'Format not found' }, { status: 404 });
        }
        return NextResponse.json(format);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 400 });
    }
}

// DELETE: Delete format
export async function DELETE(req: Request, props: { params: Promise<{ id: string }> }) {
    await dbConnect();
    try {
        const params = await props.params;
        const format = await Format.findByIdAndDelete(params.id);
        if (!format) {
            return NextResponse.json({ error: 'Format not found' }, { status: 404 });
        }
        return NextResponse.json({ message: 'Format deleted successfully' });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
