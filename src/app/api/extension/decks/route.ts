import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createHash } from 'crypto';

/**
 * Validate extension token and get user
 */
async function getExtensionUser(request: NextRequest) {
  const token = request.headers.get('X-Extension-Token');

  if (!token) {
    return null;
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
    return null;
  }

  return extensionToken.user;
}

/**
 * GET /api/extension/decks
 * List user's decks for the extension
 */
export async function GET(request: NextRequest) {
  try {
    const user = await getExtensionUser(request);

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
    });

    if (!dbUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Fetch user's decks (both owned and public)
    const decks = await prisma.deck.findMany({
      where: {
        isActive: true,
        OR: [{ createdBy: dbUser.id }, { isPublic: true }],
      },
      select: {
        id: true,
        name: true,
        description: true,
        category: true,
        difficulty: true,
        totalCards: true,
        isPublic: true,
        createdBy: true,
      },
      orderBy: { updatedAt: 'desc' },
      take: 50, // Limit for extension popup
    });

    // Mark which decks belong to the user
    const decksWithOwnership = decks.map(deck => ({
      ...deck,
      isOwned: deck.createdBy === dbUser.id,
    }));

    return NextResponse.json({
      decks: decksWithOwnership,
    });
  } catch (error) {
    console.error('[Extension Decks] Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
