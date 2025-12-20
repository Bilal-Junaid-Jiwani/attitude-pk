import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db/connect';
import User from '@/lib/models/User';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export async function POST(req: Request) {
    console.log('📝 Signup API called');
    try {
        await dbConnect();
        console.log('✅ DB Connected');

        const body = await req.json();
        console.log('📦 Request body received:', body);
        const { name, email, password } = body;

        // 1. Validation
        if (!name || !email || !password) {
            console.log('❌ Validation failed');
            return NextResponse.json(
                { error: 'Please can provide all fields' },
                { status: 400 }
            );
        }

        // 2. Check if user exists
        const userExists = await User.findOne({ email });
        console.log('🔍 User exists check:', !!userExists);
        if (userExists) {
            return NextResponse.json(
                { error: 'User already exists' },
                { status: 400 }
            );
        }

        // 3. Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        console.log('🔐 Password hashed');

        // 4. Create user
        const user = await User.create({
            name,
            email,
            password: hashedPassword,
        });
        console.log('✅ User created:', user._id);

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
            maxAge: 30 * 24 * 60 * 60, // 30 days
            path: '/',
        });

        return response;

    } catch (error: any) {
        console.error('❌ Signup API Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

