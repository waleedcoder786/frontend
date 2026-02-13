import { NextResponse } from 'next/server';

export function proxy(request) {
  const token = request.cookies.get('auth_token')?.value;
  const role = request.cookies.get('user_role')?.value; // Role: 'superadmin', 'admin', 'teacher'
  const { pathname } = request.nextUrl;

  const isAuthPage = pathname.startsWith('/auth/login') || pathname.startsWith('/auth/signup');

  // 1. Agar login nahi hai aur kisi protected page par ja raha hai
  if (!token && !isAuthPage && pathname !== '/') {
    return NextResponse.redirect(new URL('/auth/login', request.url));
  }

  // 2. Role based Protection
  if (token) {
    // --- TEACHER PROTECTION ---
    if (role === 'teacher') {
      const adminPaths = ['/teachers', '/super-admin-dashboard', '/add-data'];
      if (adminPaths.some(path => pathname.startsWith(path))) {
        return NextResponse.redirect(new URL('/dashboard', request.url));
      }
    }

    // --- ADMIN PROTECTION ---
    if (role === 'admin') {
      const superAdminPaths = ['/super-admin-dashboard', '/status-center'];
      if (superAdminPaths.some(path => pathname.startsWith(path))) {
        return NextResponse.redirect(new URL('/dashboard', request.url));
      }
    }

    // --- SUPER ADMIN PROTECTION ---
    // Super admin aksar sab kuch dekh sakta hai, lekin agar aap chahte hain 
    // ke woh Paper Generate na kare, toh yahan restricted paths daal dein.
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
    '/auth/:path*',
    '/super-admin-dashboard/:path*' // Super admin ka route bhi add kiya
  ],
};