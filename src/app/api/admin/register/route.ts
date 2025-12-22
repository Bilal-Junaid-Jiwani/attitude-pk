import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db/connect';
import User from '@/lib/models/User';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export async function POST(req: Request) {
    try {
        await dbConnect();
        const { name, email, password, adminCode } = await req.json();

        // 1. Verify Secret Code
        if (adminCode !== '0308') {
            return NextResponse.json(
                { error: 'Invalid Access Code. Ask a manager for the code.' },
                { status: 403 }
            );
        }

        // 2. Validation
        if (!name || !email || !password) {
            return NextResponse.json(
                { error: 'Please provide all fields' },
                { status: 400 }
            );
        }

        // 3. User Existence Check
        const userExists = await User.findOne({ email });
        if (userExists) {
            return NextResponse.json(
                { error: 'User already exists' },
                { status: 400 }
            );
        }

        // 4. Create Admin User
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const user = await User.create({
            name,
            email,
            password: hashedPassword,
            role: 'admin', // Force Admin Role
        });

        // 5. Generate Token
        const secret = process.env.JWT_SECRET || 'fallback_secret_key_change_me';
        const token = jwt.sign({ id: user._id, role: user.role }, secret, {
            expiresIn: '30d',
        });

        const response = NextResponse.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            token,
        }, { status: 201 });

        response.cookies.set('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 30 * 24 * 60 * 60,
            path: '/',
        });

        return response;

    } catch (error: any) {
        console.error('Admin Register Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
