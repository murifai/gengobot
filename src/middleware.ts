import { NextResponse, type NextRequest } from 'next/server';
import { auth } from '@/lib/auth/auth';

export async function middleware(request: NextRequest) {
  const session = await auth();
  const { pathname } = request.nextUrl;

  // Protected routes - require authentication
  if (pathname.startsWith('/dashboard') && !session) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    url.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(url);
  }

  // Admin routes - require authentication (admin check happens in layout with Prisma)
  if (pathname.startsWith('/admin') && !session) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    url.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(url);
  }

  // Redirect to dashboard if already logged in
  if (pathname === '/login' && session) {
    const callbackUrl = request.nextUrl.searchParams.get('callbackUrl');
    const url = request.nextUrl.clone();
    url.pathname = callbackUrl || '/dashboard';
    url.search = '';
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
};
