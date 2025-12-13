import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentSessionUser } from '@/lib/auth/session';
import { getAdminSession } from '@/lib/auth/admin-auth';

// GET /api/decks/[deckId] - Get a specific deck
export async function GET(
  _request: NextRequest,
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

    // Check permissions: owner or public deck
    // Note: Admin operations use admin session, not user session
    if (deck.createdBy !== dbUser.id && !deck.isPublic) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Add isOwner flag for frontend
    const isOwner = deck.createdBy === dbUser.id;

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

// Helper function to handle deck update logic
async function handleDeckUpdate(deckId: string, body: Record<string, unknown>) {
  // Check for admin session FIRST (admin panel takes priority)
  const adminSession = await getAdminSession();
  const sessionUser = await getCurrentSessionUser();

  let dbUser = null;
  const isAdminPanelRequest = !!adminSession;

  // Admin session takes priority for permission checking
  if (adminSession) {
    // Admin doesn't need a User record - they operate directly
  } else if (sessionUser) {
    dbUser = await prisma.user.findUnique({
      where: { email: sessionUser.email! },
    });
  }

  if (!sessionUser && !adminSession) {
    return { error: 'Unauthorized', status: 401 };
  }

  // For user operations, we need the user record
  if (!isAdminPanelRequest && !dbUser) {
    return { error: 'User not found', status: 404 };
  }

  const deck = await prisma.deck.findUnique({
    where: { id: deckId },
  });

  if (!deck) {
    return { error: 'Deck not found', status: 404 };
  }

  // Check permissions:
  // - Admin panel can edit any deck
  // - Users can only edit their own decks
  if (!isAdminPanelRequest && deck.createdBy !== dbUser?.id) {
    return { error: 'Forbidden', status: 403 };
  }

  // Build update data
  const updateData: Record<string, unknown> = {};
  if (body.name !== undefined) updateData.name = body.name as string;
  if (body.description !== undefined) updateData.description = body.description as string | null;
  if (body.isPublic !== undefined) updateData.isPublic = body.isPublic as boolean;
  if (body.category !== undefined) updateData.category = body.category as string | null;
  if (body.difficulty !== undefined) updateData.difficulty = body.difficulty as string | null;
  if (body.isActive !== undefined) updateData.isActive = body.isActive as boolean;
  if (body.isTaskDeck !== undefined) updateData.isTaskDeck = body.isTaskDeck as boolean;

  // Update deck
  const updatedDeck = await prisma.deck.update({
    where: { id: deckId },
    data: updateData,
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

  // Log admin action if admin panel request
  if (isAdminPanelRequest && adminSession) {
    await prisma.adminLog.create({
      data: {
        adminId: adminSession.id,
        actionType: 'update_deck',
        entityType: 'deck',
        entityId: deckId,
        details: JSON.parse(
          JSON.stringify({
            changes: body,
            adminEmail: adminSession.email,
          })
        ),
      },
    });
  }

  return { data: updatedDeck };
}

// PUT /api/decks/[deckId] - Update a deck (full update)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ deckId: string }> }
) {
  try {
    const { deckId } = await params;
    const body = await request.json();

    const result = await handleDeckUpdate(deckId, body);

    if ('error' in result) {
      return NextResponse.json({ error: result.error }, { status: result.status });
    }

    return NextResponse.json(result.data);
  } catch (error) {
    console.error('Error updating deck:', error);
    return NextResponse.json({ error: 'Failed to update deck' }, { status: 500 });
  }
}

// PATCH /api/decks/[deckId] - Partial update a deck
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ deckId: string }> }
) {
  try {
    const { deckId } = await params;
    const body = await request.json();

    const result = await handleDeckUpdate(deckId, body);

    if ('error' in result) {
      return NextResponse.json({ error: result.error }, { status: result.status });
    }

    return NextResponse.json(result.data);
  } catch (error) {
    console.error('Error updating deck:', error);
    return NextResponse.json({ error: 'Failed to update deck' }, { status: 500 });
  }
}

// DELETE /api/decks/[deckId] - Delete a deck
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ deckId: string }> }
) {
  try {
    const { deckId } = await params;

    // Check for admin session FIRST (admin panel takes priority)
    const adminSession = await getAdminSession();
    // Then check for user session
    const sessionUser = await getCurrentSessionUser();

    let dbUser = null;
    const isAdminPanelRequest = !!adminSession;

    // Admin session takes priority for permission checking
    if (adminSession) {
      // Admin doesn't need a User record - they operate directly
    } else if (sessionUser) {
      dbUser = await prisma.user.findUnique({
        where: { email: sessionUser.email! },
      });
    }

    if (!sessionUser && !adminSession) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // For user operations, we need the user record
    if (!isAdminPanelRequest && !dbUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const deck = await prisma.deck.findUnique({
      where: { id: deckId },
    });

    if (!deck) {
      return NextResponse.json({ error: 'Deck not found' }, { status: 404 });
    }

    // Check permissions:
    // - Admin panel can delete any deck
    // - Users can only delete their own decks
    if (!isAdminPanelRequest && deck.createdBy !== dbUser?.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Delete deck (cascade will delete flashcards and sessions)
    await prisma.deck.delete({
      where: { id: deckId },
    });

    // Log admin action if admin panel request
    if (isAdminPanelRequest && adminSession) {
      await prisma.adminLog.create({
        data: {
          adminId: adminSession.id,
          actionType: 'delete_deck',
          entityType: 'deck',
          entityId: deckId,
          details: {
            deckName: deck.name,
            adminEmail: adminSession.email,
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
