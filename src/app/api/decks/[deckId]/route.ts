import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentSessionUser } from '@/lib/auth/session';

// GET /api/decks/[deckId] - Get a specific deck
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ deckId: string }> }
) {
  try {
    const { deckId } = await params;

    const sessionUser = await getCurrentSessionUser();

    if (!sessionUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const dbUser = await prisma.user.findUnique({
      where: { email: sessionUser.email! },
    });

    if (!dbUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const deck = await prisma.deck.findUnique({
      where: { id: deckId },
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        flashcards: {
          where: { isActive: true },
          orderBy: { position: 'asc' },
        },
        _count: {
          select: {
            flashcards: true,
            studySessions: true,
          },
        },
      },
    });

    if (!deck) {
      return NextResponse.json({ error: 'Deck not found' }, { status: 404 });
    }

    // Check permissions: owner, admin, or public deck
    if (deck.createdBy !== dbUser.id && !dbUser.isAdmin && !deck.isPublic) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Add isOwner flag for frontend
    const isOwner = deck.createdBy === dbUser.id || dbUser.isAdmin;

    return NextResponse.json({
      ...deck,
      isOwner,
      totalCards: deck._count.flashcards,
    });
  } catch (error) {
    console.error('Error fetching deck:', error);
    return NextResponse.json({ error: 'Failed to fetch deck' }, { status: 500 });
  }
}

// PUT /api/decks/[deckId] - Update a deck
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ deckId: string }> }
) {
  try {
    const { deckId } = await params;

    const sessionUser = await getCurrentSessionUser();

    if (!sessionUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const dbUser = await prisma.user.findUnique({
      where: { email: sessionUser.email! },
    });

    if (!dbUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const deck = await prisma.deck.findUnique({
      where: { id: deckId },
    });

    if (!deck) {
      return NextResponse.json({ error: 'Deck not found' }, { status: 404 });
    }

    // Check permissions: owner or admin
    if (deck.createdBy !== dbUser.id && !dbUser.isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();

    // Update deck
    const updatedDeck = await prisma.deck.update({
      where: { id: deckId },
      data: {
        name: body.name ?? deck.name,
        description: body.description !== undefined ? body.description : deck.description,
        isPublic: body.isPublic ?? deck.isPublic,
        category: body.category !== undefined ? body.category : deck.category,
        difficulty: body.difficulty !== undefined ? body.difficulty : deck.difficulty,
        isActive: body.isActive ?? deck.isActive,
      },
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    // Log admin action if user is admin
    if (dbUser.isAdmin) {
      await prisma.adminLog.create({
        data: {
          adminId: dbUser.id,
          actionType: 'update_deck',
          entityType: 'deck',
          entityId: deckId,
          details: {
            changes: body,
          },
        },
      });
    }

    return NextResponse.json(updatedDeck);
  } catch (error) {
    console.error('Error updating deck:', error);
    return NextResponse.json({ error: 'Failed to update deck' }, { status: 500 });
  }
}

// DELETE /api/decks/[deckId] - Delete a deck
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ deckId: string }> }
) {
  try {
    const { deckId } = await params;

    const sessionUser = await getCurrentSessionUser();

    if (!sessionUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const dbUser = await prisma.user.findUnique({
      where: { email: sessionUser.email! },
    });

    if (!dbUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const deck = await prisma.deck.findUnique({
      where: { id: deckId },
    });

    if (!deck) {
      return NextResponse.json({ error: 'Deck not found' }, { status: 404 });
    }

    // Check permissions: owner or admin
    if (deck.createdBy !== dbUser.id && !dbUser.isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Delete deck (cascade will delete flashcards and sessions)
    await prisma.deck.delete({
      where: { id: deckId },
    });

    // Log admin action if user is admin
    if (dbUser.isAdmin) {
      await prisma.adminLog.create({
        data: {
          adminId: dbUser.id,
          actionType: 'delete_deck',
          entityType: 'deck',
          entityId: deckId,
          details: {
            deckName: deck.name,
          },
        },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting deck:', error);
    return NextResponse.json({ error: 'Failed to delete deck' }, { status: 500 });
  }
}
