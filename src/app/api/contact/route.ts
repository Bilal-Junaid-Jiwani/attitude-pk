import { NextResponse } from 'next/server';
import { sendContactInquiryEmail } from '@/lib/email/sendEmail';

export async function POST(req: Request) {
    console.error('🔥 POST /api/contact HIT 🔥'); // Debug log
    try {
        const body = await req.json();
        const { name, email, phone, subject, message } = body;

        // Validation
        if (!name || !email || !subject || !message) {
            return NextResponse.json(
                { message: 'Missing required fields: Name, Email, Subject, Message' },
                { status: 400 }
            );
        }

        // Send Email
        console.error('📧 Sending Contact Email to Admin...');
        await sendContactInquiryEmail({ name, email, phone, subject, message });
        console.error('✅ Contact Email Sent Successfully');

        return NextResponse.json(
            { success: true, message: 'Message sent successfully' },
            { status: 200 }
        );

    } catch (error) {
        console.error('❌ Contact API Error:', error);
        return NextResponse.json(
            { message: 'Internal Server Error', error: String(error) },
            { status: 500 }
        );
    }
}
