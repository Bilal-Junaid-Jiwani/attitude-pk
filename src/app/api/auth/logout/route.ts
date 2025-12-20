import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST() {
    try {
        const cookieStore = await cookies();

        // Delete the token cookie
        cookieStore.delete('token');

        return NextResponse.json(
            { message: 'Logged out successfully' },
            { status: 200 }
        );
    } catch (error: unknown) {
        console.error('Logout Error:', error);
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}
