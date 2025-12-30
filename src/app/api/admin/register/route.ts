import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db/connect';
import User from '@/lib/models/User';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';

export async function POST(req: Request) {
    try {
        await dbConnect();
        const { name, email, password, adminCode } = await req.json();

        // 1. Verify Secret Code
        // 1. Verify Secret Code
        const submittedCode = adminCode?.trim();
        const correctCode = process.env.ADMIN_SECURITY_CODE?.trim();

        if (submittedCode !== correctCode) {
            console.error(`Register Failed: Invalid Code. Received: '${submittedCode}', Expected: '${correctCode ? 'SET' : 'NOT_SET'}'`);
            return NextResponse.json(
                { error: `Invalid Access Code. Debug: Rec='${submittedCode}', Exp='${correctCode ? 'SET' : 'NOT_SET'}'` },
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
            role: 'admin', // Force Admin Role (Everyone is Admin request)
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

        const cookieStore = await cookies();
        cookieStore.set('admin_token', token, {
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
