import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db/connect';
import Coupon from '@/lib/models/Coupon';

export async function GET() {
    await dbConnect();
    try {
        const coupons = await Coupon.find({}).sort({ createdAt: -1 });
        return NextResponse.json(coupons);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch coupons' }, { status: 500 });
    }
}

export async function POST(req: Request) {
    await dbConnect();
    try {
        const body = await req.json();

        // Basic validation
        if (!body.code || !body.discountValue) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const existing = await Coupon.findOne({ code: body.code.toUpperCase() });
        if (existing) {
            return NextResponse.json({ error: 'Coupon code already exists' }, { status: 400 });
        }

        const coupon = await Coupon.create(body);
        return NextResponse.json(coupon, { status: 201 });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to create coupon' }, { status: 500 });
    }
}
