import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config({ path: '.env' }); // Load env vars

async function main() {
    console.log('📧 Testing Email Connection...');
    console.log('User:', process.env.EMAIL_USER);
    // Verify Gmail Hypothesis

    const transporter = nodemailer.createTransport({
        service: 'gmail', // Built-in gmail service
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASSWORD,
        },
        debug: true,
        logger: true
    });

    try {
        console.log('Verifying transporter...');
        await transporter.verify();
        console.log('✅ Connection Successful!');

        console.log('Sending test email...');
        const info = await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: process.env.ADMIN_NOTIFICATION_EMAIL || process.env.EMAIL_USER,
            subject: "Test Email from Attitude PK Debugger",
            text: "If you receive this, the email configuration is working!",
        });
        console.log('✅ Message sent: %s', info.messageId);

    } catch (error) {
        console.error('❌ Error:', error);
    }
}

main();
