import { NextResponse, type NextRequest } from 'next/server';
import { auth } from '@/lib/auth/auth';

// CORS configuration for browser extension
const EXTENSION_ORIGINS = [
  'chrome-extension://', // Chrome extensions (any ID in dev, specific in prod)
  'moz-extension://', // Firefox extensions
];

function isExtensionRequest(request: NextRequest): boolean {
  const origin = request.headers.get('origin') || '';
  return EXTENSION_ORIGINS.some(prefix => origin.startsWith(prefix));
}

function addCorsHeaders(response: NextResponse, request: NextRequest): NextResponse {
  const origin = request.headers.get('origin') || '';

  // Allow extension origins
  if (isExtensionRequest(request)) {
    response.headers.set('Access-Control-Allow-Origin', origin);
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    response.headers.set(
      'Access-Control-Allow-Headers',
      'Content-Type, Authorization, X-Extension-Token'
    );
    response.headers.set('Access-Control-Allow-Credentials', 'true');
    response.headers.set('Access-Control-Max-Age', '86400');
  }

  return response;
}

// Protected routes that require authentication (new structure without /app prefix)
const PROTECTED_ROUTES = [
  '/drill',
  '/kaiwa',
  '/ujian',
  '/profile',
  '/onboarding',
  '/settings',
  '/payment',
  '/choose-plan',
  '/billing',
  '/subscription',
  '/upgrade',
];

// Public routes that don't require authentication
const PUBLIC_ROUTES = [
  '/login',
  '/auth',
  '/api/auth',
  '/api/v1/auth/login',
  '/api/v1/auth/register',
  '/api/webhooks',
  '/extension',
  '/admin/auth', // Admin auth pages (login, forgot-password, etc.)
  '/api/admin/auth', // Admin auth API endpoints
];

// Legacy route redirects for backward compatibility
// Now redirects old /app/* routes to new /* routes
const LEGACY_REDIRECTS: Record<string, string> = {
  // Old dashboard routes
  '/dashboard/tasks': '/kaiwa/roleplay',
  '/dashboard/chat': '/kaiwa/bebas',
  '/chat-webrtc': '/kaiwa/bebas',
  '/dashboard/characters': '/profile/characters',
  '/dashboard/progress': '/profile/progress',
  '/dashboard/settings': '/profile/settings',
  '/dashboard': '/',
  // Old /app/* routes (backwards compatibility)
  '/app': '/',
  '/app/drill': '/drill',
  '/app/kaiwa': '/kaiwa',
  '/app/ujian': '/ujian',
  '/app/profile': '/profile',
  '/app/onboarding': '/onboarding',
  '/app/settings': '/settings',
  '/app/payment': '/payment',
  '/app/choose-plan': '/choose-plan',
  '/app/billing': '/billing',
  '/app/subscription': '/subscription',
  '/app/upgrade': '/upgrade',
};

// Pattern-based redirects (for paths with dynamic segments)
const PATTERN_REDIRECTS = [
  { from: /^\/dashboard\/tasks\/(.+)$/, to: '/kaiwa/roleplay/$1' },
  { from: /^\/dashboard\/characters\/(.+)$/, to: '/profile/characters/$1' },
  { from: /^\/study(.*)$/, to: '/drill$1' },
  // Legacy /app/* pattern redirects
  { from: /^\/app\/drill\/(.+)$/, to: '/drill/$1' },
  { from: /^\/app\/kaiwa\/(.+)$/, to: '/kaiwa/$1' },
  { from: /^\/app\/ujian\/(.+)$/, to: '/ujian/$1' },
  { from: /^\/app\/profile\/(.+)$/, to: '/profile/$1' },
  { from: /^\/app\/payment\/(.+)$/, to: '/payment/$1' },
  { from: /^\/app\/(.+)$/, to: '/$1' }, // Catch-all for any other /app/* routes
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Handle CORS preflight requests for API routes from extensions
  if (request.method === 'OPTIONS' && pathname.startsWith('/api/') && isExtensionRequest(request)) {
    const response = new NextResponse(null, { status: 204 });
    return addCorsHeaders(response, request);
  }

  // Add CORS headers to API responses for extension requests
  if (pathname.startsWith('/api/extension/') && isExtensionRequest(request)) {
    const response = NextResponse.next();
    return addCorsHeaders(response, request);
  }

  // Allow public routes without auth check
  if (PUBLIC_ROUTES.some(route => pathname.startsWith(route))) {
    return NextResponse.next();
  }

  // Allow static files
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/images') ||
    pathname.startsWith('/fonts')
  ) {
    return NextResponse.next();
  }

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
      url.pathname = to.replace('$1', match[1] || '');
      return NextResponse.redirect(url, 301); // Permanent redirect
    }
  }

  // API v1 routes: auth handled in route handlers (JWT support)
  if (pathname.startsWith('/api/v1/')) {
    return NextResponse.next();
  }

  // Admin routes - use separate admin auth system (not NextAuth)
  // IMPORTANT: This must be BEFORE auth() call to avoid NextAuth redirect
  // Auth is handled by admin layout via getAdminSession()
  if (pathname.startsWith('/admin') && !pathname.startsWith('/api/admin/')) {
    return NextResponse.next();
  }

  // API admin routes - auth handled in route handlers
  if (pathname.startsWith('/api/admin/')) {
    return NextResponse.next();
  }

  const session = await auth();

  // Protected routes - require authentication
  const isProtectedRoute = PROTECTED_ROUTES.some(route => pathname.startsWith(route));
  if (isProtectedRoute && !session) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    url.searchParams.set('returnTo', pathname);
    return NextResponse.redirect(url);
  }

  // Root path - require authentication (dashboard)
  if (pathname === '/' && !session) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    return NextResponse.redirect(url);
  }

  // Add pathname to headers for layout to use
  const response = NextResponse.next();
  response.headers.set('x-pathname', pathname);
  return response;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
};
