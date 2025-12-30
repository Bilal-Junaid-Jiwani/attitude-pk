import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db/connect';
import User from '@/lib/models/User';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export async function POST(req: Request) {
    await dbConnect();

    try {
        const { email, password } = await req.json();

        // 1. Validation
        if (!email || !password || typeof email !== 'string' || typeof password !== 'string') {
            return NextResponse.json(
                { error: 'Please provide valid email and password' },
                { status: 400 }
            );
        }

        // 2. Check for user
        const user = await User.findOne({ email })
            .setOptions({ bufferCommands: false }) // Fail fast if no connection
            .select('+password');
        if (!user) {
            return NextResponse.json(
                { error: 'Invalid credentials' },
                { status: 401 }
            );
        }

        // 3. Check password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return NextResponse.json(
                { error: 'Invalid credentials' },
                { status: 401 }
            );
        }

        // Update lastLogin
        user.lastLogin = new Date();
        await user.save();

        // 4. Generate Token (24 Hours Expiry)
        const secret = process.env.JWT_SECRET || 'fallback_secret_key_change_me';
        const token = jwt.sign({ id: user._id, role: user.role }, secret, {
            expiresIn: '24h',
        });

        // 5. Response
        const response = NextResponse.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            token,
        });

        response.cookies.set('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 24 * 60 * 60, // 24 hours
            path: '/',
        });

        return response;

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
