import { NextResponse, type NextRequest } from 'next/server';
import { auth } from '@/lib/auth/auth';

export async function middleware(request: NextRequest) {
  const session = await auth();
  const { pathname } = request.nextUrl;

  // Protected routes - require authentication
  // Instead of redirecting to login page, we'll redirect to home with a query param
  // The home page will detect this and show the login modal
  if (pathname.startsWith('/dashboard') && !session) {
    const url = request.nextUrl.clone();
    url.pathname = '/';
    url.searchParams.set('login', 'required');
    url.searchParams.set('returnTo', pathname);
    return NextResponse.redirect(url);
  }

  // Admin routes - require authentication
  if (pathname.startsWith('/admin') && !session) {
    const url = request.nextUrl.clone();
    url.pathname = '/';
    url.searchParams.set('login', 'required');
    url.searchParams.set('returnTo', pathname);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
};
