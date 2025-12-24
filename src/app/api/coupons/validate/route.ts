import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db/connect';
import Coupon from '@/lib/models/Coupon';
import Order from '@/lib/models/Order';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET!;

export async function POST(req: Request) {
    await dbConnect();
    try {
        const { code, cartTotal } = await req.json();

        if (!code) {
            return NextResponse.json({ valid: false, message: 'Coupon code is required' }, { status: 400 });
        }

        const coupon = await Coupon.findOne({ code: code.toUpperCase() });

        if (!coupon) {
            return NextResponse.json({ valid: false, message: 'Invalid coupon code' }, { status: 404 });
        }

        if (!coupon.isActive) {
            return NextResponse.json({ valid: false, message: 'This coupon is no longer active' }, { status: 400 });
        }

        if (coupon.startDate && new Date() < new Date(coupon.startDate)) {
            return NextResponse.json({ valid: false, message: 'This coupon is not active yet' }, { status: 400 });
        }

        if (coupon.expiryDate && new Date() > new Date(coupon.expiryDate)) {
            return NextResponse.json({ valid: false, message: 'This coupon has expired' }, { status: 400 });
        }

        if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
            return NextResponse.json({ valid: false, message: 'This coupon usage limit has been reached' }, { status: 400 });
        }

        if (coupon.minPurchaseAmount && cartTotal < coupon.minPurchaseAmount) {
            return NextResponse.json({ valid: false, message: `Minimum purchase amount of Rs. ${coupon.minPurchaseAmount} required` }, { status: 400 });
        }

        // Check Per-User Usage Limit
        const cookieStore = await cookies();
        const token = cookieStore.get('token');

        if (token && coupon.maxUsesPerUser) {
            try {
                const decoded: any = jwt.verify(token.value, JWT_SECRET);
                const userId = decoded.userId || decoded.id; // Support both id formats

                // Count how many times this user has used this specific coupon code
                // EXCLUDING Cancelled or Returned orders
                const userUsageCount = await Order.countDocuments({
                    user: userId,
                    couponCode: coupon.code,
                    status: { $nin: ['Cancelled', 'Returned'] }
                });

                if (userUsageCount >= coupon.maxUsesPerUser) {
                    return NextResponse.json({ valid: false, message: `You have already used this coupon maximum ${coupon.maxUsesPerUser} times.` }, { status: 400 });
                }
            } catch (err) {
                // Token invalid or guest user, proceed with caution or just allow if we don't strictly enforce generic limits for guests, 
                // BUT usually guests can't be tracked easily. 
                // For now, if guest, we skip user-check or maybe enforce only consistent login? 
                // Let's assume guest can use it once per session/email but email check is post-order. 
                // For strict limit, we might need email from body if known, but here we check logged in user.
            }
        }

        // Calculate Discount
        let discountAmount = 0;
        if (coupon.discountType === 'percentage') {
            discountAmount = (cartTotal * coupon.discountValue) / 100;
        } else {
            discountAmount = coupon.discountValue;
        }

        // Ensure discount doesn't exceed total
        if (discountAmount > cartTotal) discountAmount = cartTotal;

        return NextResponse.json({
            valid: true,
            discountAmount,
            discountType: coupon.discountType,
            code: coupon.code,
            message: 'Coupon applied successfully!'
        });

    } catch (error) {
        console.error('Coupon validation error:', error);
        return NextResponse.json({ valid: false, message: 'Failed to validate coupon' }, { status: 500 });
    }
}
