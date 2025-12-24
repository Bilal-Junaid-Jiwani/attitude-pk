import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db/connect';
import User from '@/lib/models/User';
import jwt from 'jsonwebtoken';

export async function POST(req: Request) {
    try {
        await dbConnect();
        const { email, otp } = await req.json();

        if (!email || !otp) {
            return NextResponse.json({ error: 'Please provide email and OTP' }, { status: 400 });
        }

        // Find user by email AND verify OTP matches and hasn't expired
        // Note: we need to select otp and otpExpires since they are hidden by default
        const user = await User.findOne({ email }).select('+otp +otpExpires');

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        if (user.isVerified) {
            return NextResponse.json({ message: 'User already verified' }, { status: 200 });
        }

        if (!user.otp || user.otp !== otp) {
            return NextResponse.json({ error: 'Invalid OTP' }, { status: 400 });
        }

        if (user.otpExpires < new Date()) {
            return NextResponse.json({ error: 'OTP has expired' }, { status: 400 });
        }

        // OTP Valid - Verify User
        user.isVerified = true;
        user.otp = undefined;
        user.otpExpires = undefined;
        await user.save();

        // Generate Token (Log them in automatically)
        const secret = process.env.JWT_SECRET || 'fallback_secret_key_change_me';
        const token = jwt.sign({ id: user._id, role: user.role }, secret, {
            expiresIn: '30d',
        });

        const response = NextResponse.json({
            message: 'Email verified successfully',
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
            },
            token,
        }, { status: 200 });

        response.cookies.set('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 30 * 24 * 60 * 60, // 30 days
            path: '/',
        });

        return response;

    } catch (error: any) {
        console.error('Verify OTP Error:', error);
        return NextResponse.json({ error: 'Verification failed' }, { status: 500 });
    }
}
