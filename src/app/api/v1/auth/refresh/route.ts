import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, signAccessToken, signRefreshToken } from '@/lib/auth/jwt';
import { corsHeaders, handleCorsPreflightRequest } from '@/lib/cors';

export async function OPTIONS(request: NextRequest) {
  return handleCorsPreflightRequest(request);
}

export async function POST(request: NextRequest) {
  try {
    const { refreshToken } = await request.json();

    if (!refreshToken) {
      return NextResponse.json(
        { error: 'Refresh token required' },
        { status: 400, headers: corsHeaders(request) }
      );
    }

    const payload = verifyToken(refreshToken);
    if (!payload) {
      return NextResponse.json(
        { error: 'Invalid or expired refresh token' },
        { status: 401, headers: corsHeaders(request) }
      );
    }

    const newPayload = {
      userId: payload.userId,
      email: payload.email,
      role: payload.role,
    };

    return NextResponse.json(
      {
        accessToken: signAccessToken(newPayload),
        refreshToken: signRefreshToken(newPayload),
      },
      { headers: corsHeaders(request) }
    );
  } catch (error) {
    console.error('[API v1] Refresh error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500, headers: corsHeaders(request) }
    );
  }
}
