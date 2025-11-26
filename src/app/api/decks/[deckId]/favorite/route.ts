import { NextResponse } from 'next/server';
import { getCurrentSessionUser } from '@/lib/auth/session';
import { prisma } from '@/lib/prisma';

interface RouteParams {
  params: Promise<{
    deckId: string;
  }>;
}

/**
 * GET /api/decks/[deckId]/favorite
 * Check if current user has favorited this deck
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

    const favorite = await prisma.userFavorite.findUnique({
      where: {
        userId_deckId: {
          userId: dbUser.id,
          deckId: deckId,
        },
      },
    });

    return NextResponse.json({
      isFavorite: !!favorite,
    });
  } catch (error) {
    console.error('Error checking favorite status:', error);
    return NextResponse.json({ error: 'Failed to check favorite status' }, { status: 500 });
  }
}

/**
 * POST /api/decks/[deckId]/favorite
 * Add deck to favorites
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

    // Verify deck exists
    const deck = await prisma.deck.findUnique({
      where: { id: deckId },
      select: { id: true, isPublic: true, createdBy: true },
    });

    if (!deck) {
      return NextResponse.json({ error: 'Deck not found' }, { status: 404 });
    }

    // Check if deck is accessible (public or owned by user)
    if (!deck.isPublic && deck.createdBy !== dbUser.id) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Create favorite (upsert to avoid duplicates)
    const favorite = await prisma.userFavorite.upsert({
      where: {
        userId_deckId: {
          userId: dbUser.id,
          deckId: deckId,
        },
      },
      update: {},
      create: {
        userId: dbUser.id,
        deckId: deckId,
      },
    });

    return NextResponse.json({
      success: true,
      favorite: favorite,
    });
  } catch (error) {
    console.error('Error adding favorite:', error);
    return NextResponse.json({ error: 'Failed to add favorite' }, { status: 500 });
  }
}

/**
 * DELETE /api/decks/[deckId]/favorite
 * Remove deck from favorites
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

    // Delete favorite if exists
    await prisma.userFavorite.deleteMany({
      where: {
        userId: dbUser.id,
        deckId: deckId,
      },
    });

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error('Error removing favorite:', error);
    return NextResponse.json({ error: 'Failed to remove favorite' }, { status: 500 });
  }
}
