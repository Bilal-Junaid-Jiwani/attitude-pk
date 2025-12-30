import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db/connect';
import Fragrance from '@/lib/models/Fragrance';

// GET: List all fragrances
export async function GET() {
    await dbConnect();
    try {
        const fragrances = await Fragrance.find({})
            .setOptions({ bufferCommands: false })
            .sort({ createdAt: -1 });
        return NextResponse.json(fragrances);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// POST: Create a new fragrance
export async function POST(req: Request) {
    await dbConnect();
    try {
        const body = await req.json();
        const fragrance = await Fragrance.create(body);
        return NextResponse.json(fragrance, { status: 201 });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 400 });
    }
}
