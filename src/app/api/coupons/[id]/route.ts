import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db/connect';
import Coupon from '@/lib/models/Coupon';
import { use } from 'react';

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
    await dbConnect();
    try {
        const { id } = await params;
        const coupon = await Coupon.findByIdAndDelete(id);
        if (!coupon) {
            return NextResponse.json({ error: 'Coupon not found' }, { status: 404 });
        }
        return NextResponse.json({ message: 'Coupon deleted successfully' });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to delete coupon' }, { status: 500 });
    }
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
    await dbConnect();
    try {
        const { id } = await params;
        const body = await req.json();
        const coupon = await Coupon.findByIdAndUpdate(id, body, { new: true });
        if (!coupon) {
            return NextResponse.json({ error: 'Coupon not found' }, { status: 404 });
        }
        return NextResponse.json(coupon);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to update coupon' }, { status: 500 });
    }
}
