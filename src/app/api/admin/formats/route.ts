import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db/connect';
import Format from '@/lib/models/Format';

// GET: List all formats
export async function GET() {
    await dbConnect();
    try {
        const formats = await Format.find({})
            .setOptions({ bufferCommands: false })
            .sort({ createdAt: -1 });
        return NextResponse.json(formats);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// POST: Create a new format
export async function POST(req: Request) {
    await dbConnect();
    try {
        const body = await req.json();
        const format = await Format.create(body);
        return NextResponse.json(format, { status: 201 });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 400 });
    }
}
