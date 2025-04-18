import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });

  try {
    // Check if we have a session
    const { data: { session } } = await supabase.auth.getSession();
    const path = req.nextUrl.pathname;

    // If user is not authenticated and trying to access protected routes
    if (!session) {
      if (path.startsWith('/admin') || path.startsWith('/student')) {
        return NextResponse.redirect(new URL('/auth/login', req.url));
      }
      return res;
    }

    // Get user role
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('role')
      .eq('id', session.user.id)
      .single();

    if (userError || !userData) {
      // Clear session and redirect to login if user data is invalid
      await supabase.auth.signOut();
      return NextResponse.redirect(new URL('/auth/login', req.url));
    }

    // Prevent accessing auth pages when logged in
    if (path.startsWith('/auth/')) {
      const redirectUrl = new URL(
        userData.role === 'admin' ? '/admin/dashboard' : '/student/dashboard',
        req.url
      );
      return NextResponse.redirect(redirectUrl);
    }

    // Role-based access control
    if (userData.role === 'admin' && path.startsWith('/student')) {
      return NextResponse.redirect(new URL('/admin/dashboard', req.url));
    }

    if (userData.role === 'student' && path.startsWith('/admin')) {
      return NextResponse.redirect(new URL('/student/dashboard', req.url));
    }

    return res;
  } catch (error) {
    console.error('Middleware error:', error);
    return NextResponse.redirect(new URL('/auth/login', req.url));
  }
}

export const config = {
  matcher: ['/admin/:path*', '/student/:path*', '/auth/:path*'],
};