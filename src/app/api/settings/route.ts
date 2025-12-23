import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db/connect';
import Setting from '@/lib/models/Settings';

export async function GET(request: Request) {
    try {
        await dbConnect();
        const { searchParams } = new URL(request.url);
        const key = searchParams.get('key');

        if (key) {
            const setting = await Setting.findOne({ key });
            if (!setting) {
                // Return default config if not found (for subscribe function)
                if (key === 'subscribeConfig') {
                    return NextResponse.json({
                        value: {
                            enabled: false,
                            discountType: 'percentage',
                            discountValue: 10,
                            newUsersOnly: false
                        }
                    });
                }
                return NextResponse.json({ error: 'Setting not found' }, { status: 404 });
            }
            return NextResponse.json(setting);
        } else {
            const settings = await Setting.find({});
            return NextResponse.json(settings);
        }
    } catch (error) {
        console.error('Failed to fetch settings:', error);
        return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        await dbConnect();
        const body = await request.json();
        const { key, value } = body;

        if (!key || value === undefined) {
            return NextResponse.json({ error: 'Key and Value are required' }, { status: 400 });
        }

        const setting = await Setting.findOneAndUpdate(
            { key },
            { value },
            { new: true, upsert: true, setDefaultsOnInsert: true }
        );

        return NextResponse.json(setting);
    } catch (error) {
        console.error('Failed to save setting:', error);
        return NextResponse.json({ error: 'Failed to save setting' }, { status: 500 });
    }
}
