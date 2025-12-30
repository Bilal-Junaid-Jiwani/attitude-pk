import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db/connect';
import Setting from '@/lib/models/Settings';

// Simple in-memory cache
const cachedSettingsMap = new Map<string, any>();
const globalCache = { data: null as any, time: 0 };
const CACHE_DURATION = 60 * 1000 * 5; // 5 minutes

const getDefaults = () => ({
    subscribeConfig: {
        value: {
            enabled: false,
            discountType: 'percentage',
            discountValue: 10,
            newUsersOnly: false
        }
    },
    shippingConfig: {
        value: {
            standardRate: 200,
            freeShippingThreshold: 5000
        }
    },
    taxConfig: {
        value: {
            enabled: false,
            rate: 0
        }
    }
});

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const key = searchParams.get('key');
    const now = Date.now();

    try {
        // Check cache
        if (key) {
            if (cachedSettingsMap.has(key)) {
                const cached = cachedSettingsMap.get(key);
                if (now - cached.time < CACHE_DURATION) {
                    return NextResponse.json(cached.data);
                }
            }
        } else {
            if (globalCache.data && now - globalCache.time < CACHE_DURATION) {
                return NextResponse.json(globalCache.data);
            }
        }

        await dbConnect();

        if (key) {
            const setting = await Setting.findOne({ key });
            const defaults: any = getDefaults();

            if (!setting) {
                // Return default config if not found (for subscribe function)
                if (defaults[key]) {
                    cachedSettingsMap.set(key, { time: now, data: defaults[key] });
                    return NextResponse.json(defaults[key]);
                }
                return NextResponse.json({ error: 'Setting not found' }, { status: 404 });
            }
            cachedSettingsMap.set(key, { time: now, data: setting });
            return NextResponse.json(setting);
        } else {
            const settings = await Setting.find({});
            globalCache.data = settings;
            globalCache.time = now;
            return NextResponse.json(settings);
        }
    } catch (error) {
        console.error('Failed to fetch settings:', error);

        // Fallback to defaults on error
        if (key) {
            const defaults: any = getDefaults();
            if (defaults[key]) {
                return NextResponse.json(defaults[key]);
            }
        }

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

        // Invalidate cache
        cachedSettingsMap.delete(key);
        globalCache.time = 0;

        return NextResponse.json(setting);
    } catch (error) {
        console.error('Failed to save setting:', error);
        return NextResponse.json({ error: 'Failed to save setting' }, { status: 500 });
    }
}
