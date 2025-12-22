import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db/connect';
import Settings from '@/lib/models/Settings';

export async function GET() {
    await dbConnect();
    try {
        let settings = await Settings.findOne();
        if (!settings) {
            settings = await Settings.create({});
        }
        return NextResponse.json(settings);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(req: Request) {
    await dbConnect();
    try {
        const body = await req.json();
        // Upsert settings (update if exists, create if not)
        const settings = await Settings.findOneAndUpdate({}, body, {
            new: true,
            upsert: true,
            setDefaultsOnInsert: true
        });
        return NextResponse.json(settings);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
