import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    const path = request.nextUrl.pathname;

    // Define public paths that shouldn't be protected
    const isPublicPath = path === '/login' || path === '/register' || path === '/' || path === '/admin/login' || path === '/admin/register';

    // paths starting with /admin are protected (except login and register)
    const isProtectedAdminPath = path.startsWith('/admin') && path !== '/admin/login' && path !== '/admin/register';

    const token = request.cookies.get('token')?.value || '';

    if (isProtectedAdminPath && !token) {
        return NextResponse.redirect(new URL('/admin/login', request.nextUrl));
    }

    // Optional: Redirect logged-in users away from login page?
    // if (isPublicPath && token) {
    //   return NextResponse.redirect(new URL('/', request.nextUrl));
    // }

    return NextResponse.next();
}

export const config = {
    matcher: [
        '/admin/:path*',
        '/login',
        '/register'
    ],
};
