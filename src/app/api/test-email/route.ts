import { NextResponse } from 'next/server';
import { sendEmail } from '@/lib/email/sendEmail';

export async function GET(req: Request) {
    console.log('🚀 TEST EMAIL ROUTE HIT');
    try {
        console.log('📧 Env User:', process.env.EMAIL_USER);

        const result = await sendEmail({
            to: 'bilaljunaidjiwani@gmail.com', // Sending to admin/dev for verification
            subject: 'Test Email from Next.js Server Route',
            text: 'If you see this, the Next.js server can send emails.',
            html: '<h1>Server Email Test</h1><p>Success!</p>'
        });

        return NextResponse.json({ success: true, message: 'Email sent successfully via Server Route', result });
    } catch (error: any) {
        console.error('❌ Server Route Email Failed:', error);
        return NextResponse.json({ success: false, error: error.message, stack: error.stack }, { status: 500 });
    }
}
