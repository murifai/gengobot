import { NextResponse } from 'next/server';
import { getCurrentSessionUser } from '@/lib/auth/session';
import { prisma } from '@/lib/prisma';
import { nanoid } from 'nanoid';

interface RouteParams {
  params: Promise<{
    deckId: string;
  }>;
}

/**
 * GET /api/decks/[deckId]/share
 * Get share token for a deck (only owner can access)
 */
export async function GET(request: Request, { params }: RouteParams) {
  try {
    const sessionUser = await getCurrentSessionUser();

    if (!sessionUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const dbUser = await prisma.user.findUnique({
      where: { email: sessionUser.email! },
      select: { id: true },
    });

    if (!dbUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const { deckId } = await params;

    const deck = await prisma.deck.findUnique({
      where: { id: deckId },
      select: { id: true, shareToken: true, createdBy: true, name: true },
    });

    if (!deck) {
      return NextResponse.json({ error: 'Deck not found' }, { status: 404 });
    }

    // Only owner can get share link
    if (deck.createdBy !== dbUser.id) {
      return NextResponse.json({ error: 'Only deck owner can share' }, { status: 403 });
    }

    return NextResponse.json({
      shareToken: deck.shareToken,
      shareUrl: deck.shareToken ? `/app/drill/decks/share/${deck.shareToken}` : null,
    });
  } catch (error) {
    console.error('Error getting share token:', error);
    return NextResponse.json({ error: 'Failed to get share token' }, { status: 500 });
  }
}

/**
 * POST /api/decks/[deckId]/share
 * Generate or get share token for a deck
 * - Owner can always generate/regenerate share token
 * - Anyone can get share URL for public decks (uses existing token or generates one)
 */
export async function POST(request: Request, { params }: RouteParams) {
  try {
    const sessionUser = await getCurrentSessionUser();

    if (!sessionUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const dbUser = await prisma.user.findUnique({
      where: { email: sessionUser.email! },
      select: { id: true },
    });

    if (!dbUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const { deckId } = await params;

    const deck = await prisma.deck.findUnique({
      where: { id: deckId },
      select: { id: true, createdBy: true, isPublic: true, shareToken: true },
    });

    if (!deck) {
      return NextResponse.json({ error: 'Deck not found' }, { status: 404 });
    }

    const isOwner = deck.createdBy === dbUser.id;

    // For non-owners, only allow sharing public decks
    if (!isOwner && !deck.isPublic) {
      return NextResponse.json(
        { error: 'Only deck owner can share private decks' },
        { status: 403 }
      );
    }

    // If deck already has a share token, return it (don't regenerate for non-owners)
    if (deck.shareToken && !isOwner) {
      return NextResponse.json({
        success: true,
        shareToken: deck.shareToken,
        shareUrl: `/app/drill/decks/share/${deck.shareToken}`,
      });
    }

    // Generate unique share token (owner can always regenerate, non-owner gets new one if none exists)
    const shareToken = nanoid(12);

    const updatedDeck = await prisma.deck.update({
      where: { id: deckId },
      data: { shareToken },
      select: { shareToken: true },
    });

    return NextResponse.json({
      success: true,
      shareToken: updatedDeck.shareToken,
      shareUrl: `/app/drill/decks/share/${updatedDeck.shareToken}`,
    });
  } catch (error) {
    console.error('Error generating share token:', error);
    return NextResponse.json({ error: 'Failed to generate share token' }, { status: 500 });
  }
}

/**
 * DELETE /api/decks/[deckId]/share
 * Remove share token (make deck unshared)
 */
export async function DELETE(request: Request, { params }: RouteParams) {
  try {
    const sessionUser = await getCurrentSessionUser();

    if (!sessionUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const dbUser = await prisma.user.findUnique({
      where: { email: sessionUser.email! },
      select: { id: true },
    });

    if (!dbUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const { deckId } = await params;

    const deck = await prisma.deck.findUnique({
      where: { id: deckId },
      select: { id: true, createdBy: true },
    });

    if (!deck) {
      return NextResponse.json({ error: 'Deck not found' }, { status: 404 });
    }

    // Only owner can remove share link
    if (deck.createdBy !== dbUser.id) {
      return NextResponse.json({ error: 'Only deck owner can manage sharing' }, { status: 403 });
    }

    await prisma.deck.update({
      where: { id: deckId },
      data: { shareToken: null },
    });

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error('Error removing share token:', error);
    return NextResponse.json({ error: 'Failed to remove share token' }, { status: 500 });
  }
}
