import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db/connect';
import AbandonedCheckout from '@/lib/models/AbandonedCheckout';
import { sendAbandonedCartEmail } from '@/lib/email/sendEmail';

// This endpoint should be called by a Cron job (e.g., Vercel Cron, GitHub Actions, or external service)
// Recommended frequency: Every 30-60 minutes
export const maxDuration = 60; // Set timeout to 60 seconds to allow email sending
export async function GET(req: Request) {
    try {
        // Optional: Add simple security check (e.g., a query param secret) to prevent public abuse
        const { searchParams } = new URL(req.url);
        const key = searchParams.get('key');

        // You should set a CRON_SECRET env var and check it here
        // if (key !== process.env.CRON_SECRET) {
        //    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        // }

        await dbConnect();

        // Rules for Automation:
        // 1. Created more than 1 hour ago (give them time to complete)
        // 2. Created less than 24 hours ago (don't spam old carts)
        // 3. Has Email
        // 4. Not Recovered (order not placed)
        // 5. Recovery Not Sent Yet (recoverySentAt is null/undefined)

        const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
        const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

        const carts = await AbandonedCheckout.find({
            updatedAt: { $lt: oneHourAgo, $gt: twentyFourHoursAgo },
            email: { $exists: true, $ne: '' },
            isRecovered: false,
            recoverySentAt: { $exists: false }
        }).limit(20); // Limit to 20 per run to avoid timeout

        console.log(`[Cron] Found ${carts.length} abandoned carts to notify.`);

        const results = await Promise.allSettled(carts.map(async (cart) => {
            try {
                await sendAbandonedCartEmail(cart.email, cart);

                cart.recoverySentAt = new Date();
                cart.recoveryCount = 1;
                await cart.save();
                return { id: cart._id, status: 'sent' };
            } catch (err: any) {
                console.error(`[Cron] Failed for ${cart._id}:`, err);
                return { id: cart._id, status: 'failed', error: err.message };
            }
        }));

        const sentCount = results.filter(r => r.status === 'fulfilled').length;

        return NextResponse.json({
            success: true,
            processed: carts.length,
            sent: sentCount,
            results
        });

    } catch (error: any) {
        console.error('[Cron] Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
