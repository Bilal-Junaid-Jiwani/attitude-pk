import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

export async function middleware(request: NextRequest) {
    const path = request.nextUrl.pathname;
    const isProtectedAdminPath = path.startsWith('/admin') && path !== '/admin/login' && path !== '/admin/register';

    // Get Tokens (Separate cookies for Admin vs User)
    const userToken = request.cookies.get('token')?.value;
    const adminToken = request.cookies.get('admin_token')?.value;

    const secret = new TextEncoder().encode(
        process.env.JWT_SECRET || 'fallback_secret_key_change_me'
    );

    // ==========================================
    // ADMIN DASHBOARD PROTECTION
    // ==========================================
    if (path.startsWith('/admin')) {
        // Allow public admin routes
        if (path === '/admin/login' || path === '/admin/register') {
            // Logic: If already logged in as Admin, redirect to Dashboard
            if (adminToken) {
                try {
                    await jwtVerify(adminToken, secret);
                    return NextResponse.redirect(new URL('/admin', request.nextUrl));
                } catch (e) {
                    // Invalid token, allow access to login page
                }
            }
            return NextResponse.next();
        }

        // Protected Admin Routes
        if (!adminToken) {
            return NextResponse.redirect(new URL('/admin/login', request.nextUrl));
        }

        try {
            const { payload } = await jwtVerify(adminToken, secret);
            const role = payload.role as string;

            // Allow Admin/Staff
            if (role !== 'admin' && role !== 'staff') {
                return NextResponse.redirect(new URL('/admin/login', request.nextUrl));
            }
        } catch (error) {
            // Token invalid
            return NextResponse.redirect(new URL('/admin/login', request.nextUrl));
        }
    }

    // ==========================================
    // CUSTOMER STORE PROTECTION (Profile, Checkout)
    // ==========================================
    // We only create `token` for customers.
    // If an Admin logs in via /admin/login, they get `admin_token`.
    // So if they visit /profile, they won't have `token` and will appear as Guest. (DESIRED BEHAVIOR)

    /* 
       Add protections for /profile or /checkout here if you have them.
       For now, usually handled by checking `if (!user)` in the page or client-side.
       But if you have strict routes:
    */
    // Example:
    // if (path.startsWith('/profile')) {
    //    if (!userToken) return NextResponse.redirect(new URL('/login', request.nextUrl));
    // }

    return NextResponse.next();
}

export const config = {
    matcher: [
        '/admin/:path*',
        '/login',
        '/register',
        // '/profile/:path*' // Uncomment if you want middleware protection for profile
    ],
};
