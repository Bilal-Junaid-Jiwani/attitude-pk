import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST() {
    try {
        const cookieStore = await cookies();

        // Delete the ADMIN token cookie
        cookieStore.delete('admin_token');

        return NextResponse.json(
            { message: 'Admin logged out successfully' },
            { status: 200 }
        );
    } catch (error: unknown) {
        console.error('Admin Logout Error:', error);
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}
