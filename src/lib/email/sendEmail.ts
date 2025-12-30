import nodemailer from 'nodemailer';

interface EmailOptions {
    to: string;
    subject: string;
    text?: string;
    html: string;
}

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER || process.env.GMAIL_USER,
        pass: process.env.EMAIL_PASSWORD || process.env.GMAIL_APP_PASSWORD,
    },
});

export const sendEmail = async ({ to, subject, text, html }: EmailOptions) => {
    // Only verify connection in dev, or skip to save time.
    // await transporter.verify(); 

    const mailOptions = {
        from: `"Attitude.pk" <${process.env.EMAIL_USER}>`,
        to,
        subject,
        text,
        html,
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        console.log('Message sent: %s', info.messageId);
        return info;
    } catch (error) {
        console.error('Error sending email:', error);
        throw error;
    }
};

export const sendOTPEmail = async (to: string, otp: string) => {
    const subject = 'Verify Your Email - Attitude.pk';
    const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #eee; border-radius: 10px; overflow: hidden;">
        <div style="background-color: #1c524f; color: white; padding: 20px; text-align: center;">
            <h1 style="margin: 0;">Attitude.pk</h1>
        </div>
        <div style="padding: 30px; text-align: center;">
            <h2 style="color: #333;">Email Verification</h2>
            <p style="color: #666; font-size: 16px;">Use the following OTP to complete your sign up procedure. This OTP is valid for 10 minutes.</p>
            <div style="margin: 30px 0;">
                <span style="background-color: #f5f5f5; border: 2px dashed #1c524f; padding: 15px 30px; font-size: 24px; font-weight: bold; color: #1c524f; letter-spacing: 5px; border-radius: 5px;">${otp}</span>
            </div>
            <p style="color: #999; font-size: 14px;">If you didn't request this, please ignore this email.</p>
        </div>
        <div style="background-color: #f9f9f9; padding: 15px; text-align: center; color: #aaa; font-size: 12px;">
            &copy; ${new Date().getFullYear()} Attitude.pk. All rights reserved.
        </div>
    </div>
    `;
    return sendEmail({ to, subject, html });
};

export const sendOrderConfirmationEmail = async (to: string, order: any) => {
    const subject = `Order Confirmation #${order._id.toString().toUpperCase()} - Attitude.pk`;

    // Calculate totals for email
    const subtotal = order.items.reduce((acc: number, item: any) => acc + (item.price * item.quantity), 0);

    const itemsHtml = order.items.map((item: any) => `
        <tr style="border-bottom: 1px solid #eee;">
            <td style="padding: 10px; color: #333;">${item.name} <span style="color:#999; font-size:12px;">x${item.quantity}</span></td>
            <td style="padding: 10px; text-align: right; color: #333;">Rs. ${item.price.toLocaleString()}</td>
        </tr>
    `).join('');

    const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #eee; border-radius: 10px; overflow: hidden;">
        <div style="background-color: #1c524f; color: white; padding: 20px; text-align: center;">
            <h1 style="margin: 0;">Thanks for your order!</h1>
        </div>
        <div style="padding: 30px;">
            <p style="color: #666; font-size: 16px;">Hi <strong>${order.shippingAddress.fullName}</strong>,</p>
            <p style="color: #666; Line-height: 1.5;">Your order <strong>#${order._id.toString().toUpperCase()}</strong> has been placed successfully. We will notify you once it ships.</p>
            
            <h3 style="color: #333; margin-top: 30px; border-bottom: 2px solid #1c524f; padding-bottom: 10px;">Order Summary</h3>
            <table style="width: 100%; border-collapse: collapse; margin-top: 10px;">
                ${itemsHtml}
                <tr>
                    <td style="padding: 10px; font-weight: bold; border-top: 2px solid #eee;">Total Amount</td>
                    <td style="padding: 10px; text-align: right; font-weight: bold; border-top: 2px solid #eee; color: #1c524f;">Rs. ${order.totalAmount.toLocaleString()}</td>
                </tr>
            </table>

            <div style="background-color: #f9f9f9; padding: 20px; margin-top: 30px; border-radius: 5px;">
                <h4 style="margin: 0 0 10px 0; color: #333;">Shipping Address</h4>
                <p style="margin: 0; color: #666; font-size: 14px; line-height: 1.6;">
                    ${order.shippingAddress.address}<br>
                    ${order.shippingAddress.city}, ${order.shippingAddress.postalCode}<br>
                    Phone: ${order.shippingAddress.phone}
                </p>
            </div>

            <div style="text-align: center; margin-top: 30px;">
                <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/orders/${order._id}/invoice" style="display: inline-block; padding: 12px 24px; background-color: #1c524f; color: white; text-decoration: none; border-radius: 5px; font-weight: bold; font-size: 16px;">View Invoice</a>
            </div>
        </div>
        <div style="background-color: #f5f5f5; padding: 15px; text-align: center; color: #aaa; font-size: 12px;">
            <p>Need help? Reply to this email or contact support.</p>
        </div>
    </div>
    `;
    return sendEmail({ to, subject, html });
};

export const sendAdminNewOrderEmail = async (order: any) => {
    const adminEmail = process.env.ADMIN_NOTIFICATION_EMAIL || process.env.EMAIL_USER; // Fallback
    if (!adminEmail) return;

    const subject = `[NEW ORDER] #${order._id.toString().toUpperCase()} - Rs. ${order.totalAmount.toLocaleString()}`;
    const html = `
    <div style="font-family: Arial, sans-serif;">
        <h2 style="color: #1c524f;">New Order Received!</h2>
        <p><strong>Order ID:</strong> ${order._id}</p>
        <p><strong>Customer:</strong> ${order.shippingAddress.fullName} (${order.user ? 'Registered' : 'Guest'})</p>
        <p><strong>Amount:</strong> Rs. ${order.totalAmount.toLocaleString()}</p>
        <p><strong>Status:</strong> ${order.status}</p>
        <a href="http://localhost:3000/admin/orders" style="display: inline-block; padding: 10px 20px; background-color: #1c524f; color: white; text-decoration: none; border-radius: 5px; margin-top: 20px;">View in Admin Panel</a>
    </div>
    `;

    return sendEmail({ to: adminEmail, subject, html });
};

export const sendContactInquiryEmail = async (data: { name: string; email: string; phone?: string; subject: string; message: string }) => {
    const adminEmail = process.env.ADMIN_NOTIFICATION_EMAIL || process.env.EMAIL_USER;
    if (!adminEmail) return;

    const emailSubject = `[CONTACT FORM] ${data.subject} - ${data.name}`;
    const html = `
    <div style="font-family: Arial, sans-serif; border: 1px solid #eee; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #1c524f; color: white; padding: 20px;">
            <h2 style="margin: 0;">New Contact Inquiry</h2>
        </div>
        <div style="padding: 30px;">
            <p><strong>Name:</strong> ${data.name}</p>
            <p><strong>Email:</strong> <a href="mailto:${data.email}">${data.email}</a></p>
            <p><strong>Phone:</strong> ${data.phone || 'N/A'}</p>
            <p><strong>Subject:</strong> ${data.subject}</p>
            <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
            <p><strong>Message:</strong></p>
            <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; color: #333; line-height: 1.6;">
                ${data.message.replace(/\n/g, '<br>')}
            </div>
        </div>
    </div>
    `;


    return sendEmail({ to: adminEmail, subject: emailSubject, html, text: data.message });
};

export const sendOrderShippedEmail = async (to: string, order: any) => {
    const subject = `Your Order #${order._id.toString().toUpperCase()} has Shipped! - Attitude.pk`;

    // Formatting tracking info
    const trackingInfo = order.trackingId
        ? `<p style="font-size: 16px; color: #333;"><strong>Courier:</strong> ${order.courierCompany || 'Unknown'}<br><strong>Tracking ID:</strong> ${order.trackingId}</p>`
        : '';

    const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #eee; border-radius: 10px; overflow: hidden;">
        <div style="background-color: #1c524f; color: white; padding: 20px; text-align: center;">
            <h1 style="margin: 0;">Order Shipped! 🚚</h1>
        </div>
        <div style="padding: 30px;">
            <p style="color: #666; font-size: 16px;">Hi <strong>${order.shippingAddress.fullName}</strong>,</p>
            <p style="color: #666; line-height: 1.5;">Great news! Your order <strong>#${order._id.toString().toUpperCase()}</strong> has been dispatched and is on its way to you.</p>
            
            <div style="background-color: #f9f9f9; padding: 20px; margin: 20px 0; border-left: 4px solid #1c524f; border-radius: 4px;">
                <h3 style="margin: 0 0 10px 0; color: #1c524f;">Tracking Information</h3>
                ${trackingInfo}
                <p style="margin: 10px 0 0 0; font-size: 13px; color: #777;">Please allow some time for the tracking status to update on the courier's website.</p>
            </div>

            <p style="text-align: center; color: #555; font-size: 14px; margin: 20px 0;">
                Your order will be delivered to your address within <strong>3 to 5 business days</strong>.
            </p>

            <div style="text-align: center; margin-top: 30px;">
                <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/orders/${order._id}/invoice" style="display: inline-block; padding: 12px 24px; background-color: #1c524f; color: white; text-decoration: none; border-radius: 5px; font-weight: bold; font-size: 16px;">View Order Invoice</a>
            </div>
        </div>
        <div style="background-color: #f5f5f5; padding: 15px; text-align: center; color: #aaa; font-size: 12px;">
            <p>Thank you for shopping with Attitude.pk!</p>
        </div>
    </div>
    `;

    return sendEmail({ to, subject, html });
};

export const sendOrderDeliveredEmail = async (to: string, order: any) => {
    const subject = `Your Order #${order._id.toString().toUpperCase()} has been Delivered! - Attitude.pk`;

    const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #eee; border-radius: 10px; overflow: hidden;">
        <div style="background-color: #1c524f; color: white; padding: 20px; text-align: center;">
            <h1 style="margin: 0;">Order Delivered! 🎉</h1>
        </div>
        <div style="padding: 30px;">
            <p style="color: #666; font-size: 16px;">Hi <strong>${order.shippingAddress.fullName}</strong>,</p>
            <p style="color: #666; line-height: 1.5;">Your order <strong>#${order._id.toString().toUpperCase()}</strong> has been successfully delivered. We hope you love your purchase!</p>
            
            <div style="text-align: center; margin: 30px 0;">
                <p style="margin-bottom: 20px; color: #555;">How was your experience? We'd love to hear your feedback.</p>
                <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/review/${order._id}" style="display: inline-block; padding: 12px 24px; background-color: #1c524f; color: white; text-decoration: none; border-radius: 5px; font-weight: bold; font-size: 16px;">Write a Review</a>
            </div>

            <div style="background-color: #f9f9f9; padding: 20px; margin-top: 30px; border-radius: 5px; text-align: center;">
                 <p style="margin: 0; color: #777; font-size: 14px;"><strong>Thank you for shopping with Attitude.pk!</strong></p>
            </div>
        </div>
    </div>
    `;

    return sendEmail({ to, subject, html });
};
