import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { NextRequestWithAuth } from 'next-auth/middleware';

export default auth((req: NextRequestWithAuth) => {
  const { pathname } = req.nextUrl;
  const isLoggedIn = !!req.nextauth?.token;

  // Protect all routes under /admin except the login page itself
  if (pathname.startsWith('/admin') && !pathname.startsWith('/admin/login') && !isLoggedIn) {
    const loginUrl = new URL('/admin/login', req.url);
    return NextResponse.redirect(loginUrl);
  }

  // If logged in and trying to access login page, redirect to admin dashboard
  if (pathname.startsWith('/admin/login') && isLoggedIn) {
    const adminUrl = new URL('/admin', req.url);
    return NextResponse.redirect(adminUrl);
  }

  return NextResponse.next();
});

// Define which paths the middleware should run on
export const config = {
  matcher: ['/admin/:path*', '/admin/login'],
}; 