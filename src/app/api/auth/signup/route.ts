import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db/connect';
import User from '@/lib/models/User';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// ... imports
import { sendOTPEmail } from '@/lib/email/sendEmail';
import crypto from 'crypto';

export async function POST(req: Request) {
    console.log('📝 Signup API called');
    try {
        await dbConnect();

        const body = await req.json();
        const { name, email, password, securityCode } = body;

        // 1. Validation
        if (!name || !email || !password) {
            return NextResponse.json({ error: 'Please provide all fields' }, { status: 400 });
        }

        // 2. Check if user exists
        const userExists = await User.findOne({ email });
        if (userExists) {
            return NextResponse.json({ error: 'User already exists' }, { status: 400 });
        }

        // 3. Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // 4. Generate OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

        // 5. Determine Role based on Security Code
        let role = 'user';
        if (securityCode && securityCode === process.env.ADMIN_SECURITY_CODE) {
            role = 'admin'; // Or 'staff'
            console.log('🛡️ Creating Admin/Staff User via Security Code');
        }

        // 6. Create user (Unverified)
        const user = await User.create({
            name,
            email,
            password: hashedPassword,
            role, // Set role here
            otp,
            otpExpires,
            isVerified: false,
        });

        // 6. Send OTP Email
        try {
            await sendOTPEmail(email, otp);
        } catch (emailError) {
            console.error('Failed to send OTP email:', emailError);
            // Optional: delete user if email fails? Or let them retry?
            // For now, we return success but warn log.
        }

        // 7. Return Pending Response (No Token yet)
        return NextResponse.json({
            message: 'OTP sent successfully',
            email: user.email,
            userId: user._id, // Helpful for verification step if needed
            requiresOtp: true
        }, { status: 201 });

    } catch (error: any) {
        console.error('❌ Signup API Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

