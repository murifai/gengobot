import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, getTokenFromHeader, JWTPayload } from './jwt';
import { auth } from './auth';

export type AuthResult =
  | { success: true; user: JWTPayload; authType: 'jwt' | 'session' }
  | { success: false; error: string };

export async function authenticateRequest(request: NextRequest): Promise<AuthResult> {
  // Try JWT first (mobile/API clients)
  const authHeader = request.headers.get('authorization');
  const token = getTokenFromHeader(authHeader);

  if (token) {
    const payload = verifyToken(token);
    if (payload) {
      return { success: true, user: payload, authType: 'jwt' };
    }
    return { success: false, error: 'Invalid or expired token' };
  }

  // Fall back to session auth (web client)
  const session = await auth();
  if (session?.user) {
    return {
      success: true,
      user: {
        userId: session.user.id!,
        email: session.user.email!,
        role: (session.user as { role?: string }).role || 'USER',
      },
      authType: 'session',
    };
  }

  return { success: false, error: 'Authentication required' };
}

export function unauthorizedResponse(message: string = 'Unauthorized') {
  return NextResponse.json({ error: message }, { status: 401 });
}
