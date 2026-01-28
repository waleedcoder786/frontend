import { NextResponse } from 'next/server';

export function proxy(request) {
  const token = request.cookies.get('auth_token')?.value;
  const { pathname } = request.nextUrl;

  // Optimized Check: Routes ko array mein rakhne ke bajaye seedha matcher par depend karein
  const isAuthPage = pathname.startsWith('/auth/login') || pathname.startsWith('/auth/signup');
  const isProtectedPage = !isAuthPage && pathname !== '/'; // Base logic

  // Case 1: Token nahi hai aur Protected Page par hai
  if (!token && !isAuthPage) {
    // URL redirect mein original destination save karein taaki login ke baad wahi wapis le jaye
    const loginUrl = new URL('/auth/login', request.url);
    loginUrl.searchParams.set('from', pathname); 
    return NextResponse.redirect(loginUrl);
  }

  // Case 2: Token hai aur Auth (Login/Signup) pages par jane ki koshish
  if (token && isAuthPage) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/dashboard/:path*', 
    '/paper-preview/:path*', 
    '/create-test/:path*',
    '/auth/:path*' // Ab ye sare auth routes cover karega
  ],
};