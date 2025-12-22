import { NextResponse } from 'next/server';
import axios from 'axios';

export async function POST(req: Request) {
    try {
        const { amount, currency = 'PKR', orderId } = await req.json();

        if (!amount) {
            return NextResponse.json({ error: 'Amount is required' }, { status: 400 });
        }

        const env = process.env.NEXT_PUBLIC_SAFEPAY_ENVIRONMENT || 'sandbox';
        const baseUrl = env === 'production'
            ? 'https://api.getsafepay.com'
            : 'https://sandbox.api.getsafepay.com';

        // 1. Initialize Payment (Create Order/Tracker)
        // Safepay functionality: We create a tracker or order token. 
        // Docs vary, but typically flow is: POST /order/v1/init or similar.
        // Let's use the standard tracked order flow.

        // Note: Safepay API Key/Secret usage depends on version. 
        // Often 'client' key is enough for checkout link if secret not enforcing strict auth.
        // But for server-side init, we usually need the API Key.

        const response = await axios.post(
            `${baseUrl}/order/v1/init`,
            {
                amount: amount,
                currency: currency,
                environment: env,
                client: process.env.SAFEPAY_API_KEY, // api_key
                redirect_url: `http://localhost:3000/checkout/success?orderId=${orderId}`,
                cancel_url: 'http://localhost:3000/checkout'
            },
            {
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );

        const { token, tracker } = response.data.data;

        // Construct Redirect URL
        // Sandbox: https://sandbox.api.getsafepay.com/checkout/pay?tracker=...
        // Production: https://api.getsafepay.com/checkout/pay?tracker=...

        // Actually, the checkout URL might be different.
        // Standard checkout link: https://sandbox.getsafepay.com/checkout/pay?tracker=... (Note: subdomain might default to 'sandbox.getsafepay.com' not 'api')
        // Let's confirm tracking URL construction.
        // Usually Safepay returns a formatted link or we build it.

        // Creating the hosted checkout URL:
        const checkoutBase = env === 'production'
            ? 'https://getsafepay.com/components'
            : 'https://sandbox.api.getsafepay.com/components';

        const redirectUrl = `${checkoutBase}?beacon=${token}&env=${env}&source=custom`;

        return NextResponse.json({
            url: redirectUrl,
            tracker: token
        });

    } catch (error: any) {
        console.error('Safepay init error:', error.response?.data || error.message);
        return NextResponse.json({
            error: error.response?.data?.message || 'Failed to initialize Safepay payment'
        }, { status: 500 });
    }
}
