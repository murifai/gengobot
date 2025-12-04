import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { randomBytes, createHash } from 'crypto';

// Extension token expiration: 30 days
const TOKEN_EXPIRATION_DAYS = 30;

/**
 * POST /api/extension/auth
 * Generate or validate extension token
 *
 * Body: { action: 'generate' | 'validate', email?: string, token?: string }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, email, token } = body;

    if (action === 'generate') {
      // Generate a new extension token for authenticated user
      if (!email) {
        return NextResponse.json({ error: 'Email is required' }, { status: 400 });
      }

      const user = await prisma.user.findUnique({
        where: { email },
        select: { id: true, email: true, name: true, image: true },
      });

      if (!user) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
      }

      // Generate secure token
      const rawToken = randomBytes(32).toString('hex');
      const hashedToken = createHash('sha256').update(rawToken).digest('hex');
      const expiresAt = new Date(Date.now() + TOKEN_EXPIRATION_DAYS * 24 * 60 * 60 * 1000);

      // Store or update extension token
      await prisma.extensionToken.upsert({
        where: { userId: user.id },
        update: {
          token: hashedToken,
          expiresAt,
        },
        create: {
          userId: user.id,
          token: hashedToken,
          expiresAt,
        },
      });

      return NextResponse.json({
        success: true,
        token: rawToken,
        expiresAt,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
        },
      });
    }

    if (action === 'validate') {
      // Validate existing token
      if (!token) {
        return NextResponse.json({ error: 'Token is required' }, { status: 400 });
      }

      const hashedToken = createHash('sha256').update(token).digest('hex');

      const extensionToken = await prisma.extensionToken.findUnique({
        where: { token: hashedToken },
        include: {
          user: {
            select: { id: true, email: true, name: true, image: true },
          },
        },
      });

      if (!extensionToken) {
        return NextResponse.json({ valid: false, error: 'Invalid token' }, { status: 401 });
      }

      if (extensionToken.expiresAt < new Date()) {
        return NextResponse.json({ valid: false, error: 'Token expired' }, { status: 401 });
      }

      return NextResponse.json({
        valid: true,
        user: extensionToken.user,
      });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('[Extension Auth] Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * GET /api/extension/auth
 * Check authentication status with token from header
 */
export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get('X-Extension-Token');

    if (!token) {
      return NextResponse.json({ authenticated: false }, { status: 401 });
    }

    const hashedToken = createHash('sha256').update(token).digest('hex');

    const extensionToken = await prisma.extensionToken.findUnique({
      where: { token: hashedToken },
      include: {
        user: {
          select: { id: true, email: true, name: true, image: true },
        },
      },
    });

    if (!extensionToken || extensionToken.expiresAt < new Date()) {
      return NextResponse.json({ authenticated: false }, { status: 401 });
    }

    return NextResponse.json({
      authenticated: true,
      user: extensionToken.user,
    });
  } catch (error) {
    console.error('[Extension Auth] Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
