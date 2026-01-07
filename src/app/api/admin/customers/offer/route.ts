import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db/connect';
import User from '@/lib/models/User';
import Coupon from '@/lib/models/Coupon';
import { sendDiscountOfferEmail } from '@/lib/email/sendEmail';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { customerId, couponCode, email, type } = body; // type='Guest'|'Registered'

        await dbConnect();

        // 1. Get Coupon Details
        const coupon = await Coupon.findOne({ code: couponCode });
        if (!coupon) {
            return NextResponse.json({ error: 'Invalid coupon code' }, { status: 400 });
        }

        const discountText = coupon.discountType === 'percentage'
            ? `${coupon.discountValue}%`
            : `Rs. ${coupon.discountValue}`;

        // 2. Get Customer Name (if not provided in body)
        let name = 'Valued Customer';

        // If it's a registered user, fetch Name
        if (type !== 'Guest') {
            const user = await User.findById(customerId);
            if (user) name = user.name;
        }
        // If guest, maybe pass name from frontend body

        if (body.name) name = body.name;

        // 3. Send Email
        await sendDiscountOfferEmail(email, {
            name,
            code: couponCode,
            discount: discountText
        });

        return NextResponse.json({ success: true, message: 'Offer sent successfully' });

    } catch (error: any) {
        console.error('Offer send error:', error);
        return NextResponse.json({ error: 'Failed to send offer' }, { status: 500 });
    }
}
