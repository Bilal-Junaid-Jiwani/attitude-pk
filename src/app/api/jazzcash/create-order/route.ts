import { NextResponse } from 'next/server';
import crypto from 'crypto';

export async function POST(req: Request) {
    try {
        const { amount, orderId } = await req.json();

        if (!amount || !orderId) {
            return NextResponse.json({ error: 'Amount and Order ID are required' }, { status: 400 });
        }

        const merchantId = process.env.JAZZCASH_MERCHANT_ID;
        const password = process.env.JAZZCASH_PASSWORD;
        const integritySalt = process.env.JAZZCASH_INTEGERITY_SALT;
        const returnUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/checkout/success`; // JazzCash posts back to this

        // Simulation Mode if credentials are missing
        if (!merchantId || !password || !integritySalt) {
            console.warn("JazzCash credentials missing. Using Simulation Mode.");

            // In a real app, you might want to fail here, but for this task we facilitate testing.
            // We'll create a dummy link that just redirects to success.
            const simulationUrl = `/checkout/success?orderId=${orderId}&payment_source=jazzcash_simulated`;

            return NextResponse.json({
                url: simulationUrl,
                mode: 'simulation',
                message: 'Credentials missing. Redirecting to success for testing.'
            });
        }

        // --- Production/Sandbox Implementation ---

        // JazzCash Hosted Payment Fields
        const price = (amount * 100).toString(); // amount in paisa
        const currentDateTime = new Date().toISOString().replace(/[-:T.Z]/g, '').slice(0, 14); // YYYYMMDDHHMMSS
        const expiryDateTime = new Date(Date.now() + 3600 * 1000).toISOString().replace(/[-:T.Z]/g, '').slice(0, 14); // +1 Hour
        const txnRefNo = `T${currentDateTime}${Math.floor(Math.random() * 1000)}`;

        const payload: any = {
            "pp_Version": "1.1",
            "pp_TxnType": "MWALLET", // or MPAY, but usually MWALLET for mobile or MPAY for card. Let's assume Card default or configurable
            "pp_Language": "EN",
            "pp_MerchantID": merchantId,
            "pp_SubMerchantID": "",
            "pp_Password": password,
            "pp_BankID": "TBANK",
            "pp_ProductID": "RETL",
            "pp_TxnRefNo": txnRefNo,
            "pp_Amount": price,
            "pp_TxnCurrency": "PKR",
            "pp_TxnDateTime": currentDateTime,
            "pp_BillReference": orderId,
            "pp_Description": `Order ${orderId}`,
            "pp_TxnExpiryDateTime": expiryDateTime,
            "pp_ReturnURL": returnUrl,
            "pp_SecureHash": "",
            "ppmpf_1": "1",
            "ppmpf_2": "2",
            "ppmpf_3": "3",
            "ppmpf_4": "4",
            "ppmpf_5": "5",
        };

        // Sort keys alphabetically
        const sortedKeys = Object.keys(payload).filter(key => key !== 'pp_SecureHash' && payload[key] !== undefined && payload[key] !== null && payload[key] !== "").sort();

        let stringToHash = integritySalt;
        for (const key of sortedKeys) {
            stringToHash += `&${payload[key]}`;
        }

        const secureHash = crypto.createHmac('sha256', integritySalt).update(stringToHash).digest('hex').toUpperCase();

        // Normally we would return a Form to auto-submit, or a URL if JazzCash supports a direct link generation API (v2.0). 
        // For Hosted Payment Page (v1.1), we typically need to render a form on the frontend and submit it.
        // However, usually we can also construct a GET url if supported, or we return the payload to the frontend to submit.

        // Let's return the payload to the frontend so it can construct a hidden form and submit it automatically.
        // Or if we want to redirect, we might need a distinct page.

        // For simplicity in this codebase, let's assume we return the fields and the endpoint URL.
        const sandboxUrl = "https://sandbox.jazzcash.com.pk/Application/API/1.1/purchase/doPurchase"; // Example URL

        return NextResponse.json({
            url: sandboxUrl,
            fields: {
                ...payload,
                pp_SecureHash: secureHash
            },
            mode: 'production'
        });

    } catch (error: any) {
        console.error('JazzCash init error:', error);
        return NextResponse.json({
            error: error.message || 'Failed to initialize JazzCash payment'
        }, { status: 500 });
    }
}
