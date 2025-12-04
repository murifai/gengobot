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

  const session = await auth();

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

  // Admin routes - require authentication
  if (pathname.startsWith('/admin') && !session) {
    const url = request.nextUrl.clone();
    url.pathname = '/';
    url.searchParams.set('login', 'required');
    url.searchParams.set('returnTo', pathname);
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
