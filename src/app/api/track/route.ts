import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db/connect';
import Visitor from '@/lib/models/Visitor';

export async function POST(req: Request) {
    try {
        await dbConnect();
        const body = await req.json();
        const { visitorId, page, device } = body;

        if (!visitorId) {
            return NextResponse.json({ error: 'Missing visitorId' }, { status: 400 });
        }

        // Upsert: Update if exists (refresh TTL), Create if new
        await Visitor.findOneAndUpdate(
            { visitorId },
            {
                $set: {
                    lastActive: new Date(),
                    page,
                    device
                }
            },
            { upsert: true, new: true }
        );

        return NextResponse.json({ ok: true });
    } catch (error) {
        console.error('Tracking Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
