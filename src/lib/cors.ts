import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const allowedOrigins = [
  'https://app.gengobot.com',
  'https://admin.gengobot.com',
  // Mobile apps will use capacitor/native - no origin needed
  // Add development origins
  ...(process.env.NODE_ENV === 'development'
    ? ['http://localhost:3000', 'http://localhost:8100']
    : []),
];

export function corsHeaders(request: NextRequest) {
  const origin = request.headers.get('origin');
  const headers: HeadersInit = {
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Max-Age': '86400',
  };

  // Allow specific origins or mobile apps (no origin)
  if (origin && allowedOrigins.includes(origin)) {
    headers['Access-Control-Allow-Origin'] = origin;
    headers['Access-Control-Allow-Credentials'] = 'true';
  }

  return headers;
}

export function handleCorsPreflightRequest(request: NextRequest) {
  return new NextResponse(null, {
    status: 204,
    headers: corsHeaders(request),
  });
}
