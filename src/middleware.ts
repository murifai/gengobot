import { NextResponse, type NextRequest } from 'next/server';
import { auth } from '@/lib/auth/auth';

// Legacy route redirects for backward compatibility
const LEGACY_REDIRECTS: Record<string, string> = {
  '/dashboard/tasks': '/app/kaiwa/roleplay',
  '/dashboard/chat': '/app/kaiwa/bebas',
  '/chat-webrtc': '/app/kaiwa/bebas',
  '/dashboard/characters': '/app/profile/characters',
  '/dashboard/progress': '/app/profile/progress',
  '/dashboard/settings': '/app/profile/settings',
  '/dashboard': '/app',
};

// Pattern-based redirects (for paths with dynamic segments)
const PATTERN_REDIRECTS = [
  { from: /^\/dashboard\/tasks\/(.+)$/, to: '/app/kaiwa/roleplay/$1' },
  { from: /^\/dashboard\/characters\/(.+)$/, to: '/app/profile/characters/$1' },
  { from: /^\/study(.*)$/, to: '/app/drill$1' },
];

export async function middleware(request: NextRequest) {
  const session = await auth();
  const { pathname } = request.nextUrl;

  // Check for exact legacy route matches first
  if (LEGACY_REDIRECTS[pathname]) {
    const url = request.nextUrl.clone();
    url.pathname = LEGACY_REDIRECTS[pathname];
    return NextResponse.redirect(url, 301); // Permanent redirect
  }

  // Check for pattern-based redirects
  for (const { from, to } of PATTERN_REDIRECTS) {
    const match = pathname.match(from);
    if (match) {
      const url = request.nextUrl.clone();
      url.pathname = to.replace('$1', match[1]);
      return NextResponse.redirect(url, 301); // Permanent redirect
    }
  }

  // Protected routes - require authentication
  // /app routes - require authentication
  if (pathname.startsWith('/app') && !session) {
    const url = request.nextUrl.clone();
    url.pathname = '/';
    url.searchParams.set('login', 'required');
    url.searchParams.set('returnTo', pathname);
    return NextResponse.redirect(url);
  }

  // Note: Onboarding check should be done at the page level (not middleware)
  // since we need to query the database for onboardingCompleted status.
  // See: src/app/app/page.tsx - check onboardingCompleted and redirect to /app/onboarding if needed

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
