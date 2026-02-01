import { NextResponse } from 'next/server';

export function proxy(request) {
  const token = request.cookies.get('auth_token')?.value;
  const role = request.cookies.get('user_role')?.value; // Seedha role mil gaya
  const { pathname } = request.nextUrl;

  const isAuthPage = pathname.startsWith('/auth/login') || pathname.startsWith('/auth/signup');

  // 1. Agar login nahi hai
  if (!token && !isAuthPage && pathname !== '/') {
    return NextResponse.redirect(new URL('/auth/login', request.url));
  }

  // 2. Role based Protection
  if (token && role === 'teacher') {
    const adminOnlyPaths = ['/teachers', '/saved-papers'];
    const isTryingToAccessAdmin = adminOnlyPaths.some(path => pathname.startsWith(path));

    if (isTryingToAccessAdmin) {
      // Teacher ko wapis dashboard bhej do
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  }

  // 3. Agar already login hai aur login page par jana chahay
  if (token && isAuthPage) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/dashboard/:path*', 
    '/generate-paper/:path*',
    '/teachers/:path*',
    '/saved-papers/:path*',
    '/auth/:path*'
  ],
};