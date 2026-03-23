import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Define public paths that don't require authentication
const publicPaths = ['/login', '/forgot'];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Get the access token from the cookies
  const token = request.cookies.get('access_token')?.value;

  const isPublicPath = publicPaths.some(path => pathname.startsWith(path));

  // 1. If user is logged in and trying to access a public path (like /login), redirect to dashboard
  if (isPublicPath && token) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // 2. If user is NOT logged in and trying to access a protected path, redirect to login
  if (!isPublicPath && !token) {
    // We can also store the original URL to redirect back after login if desired,
    // but a simple redirect to /login is sufficient for now.
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Allow the request to proceed if valid
  return NextResponse.next();
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|vercel.svg|turborepo-dark.svg|turborepo-light.svg|window.svg|globe.svg|fonts).*)',
  ],
};
