import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { prisma } from '@/lib/prisma';

/**
 * POST /api/study-sessions
 * Start a new study session
 */
export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user from database
    const dbUser = await prisma.user.findUnique({
      where: { email: user.email },
      select: { id: true },
    });

    if (!dbUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const body = await request.json();
    const { deckId } = body;

    if (!deckId) {
      return NextResponse.json({ error: 'Deck ID is required' }, { status: 400 });
    }

    // Verify deck exists and user has access
    const deck = await prisma.deck.findUnique({
      where: { id: deckId },
      include: {
        flashcards: {
          orderBy: { position: 'asc' },
        },
      },
    });

    if (!deck) {
      return NextResponse.json({ error: 'Deck not found' }, { status: 404 });
    }

    // Check access (public decks or owned decks)
    if (!deck.isPublic && deck.creatorId !== dbUser.id) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Create study session
    const studySession = await prisma.studySession.create({
      data: {
        userId: dbUser.id,
        deckId,
        startTime: new Date(),
        isCompleted: false,
        cardsReviewed: 0,
        cardsCorrect: 0,
        averageResponseTime: 0,
        againCount: 0,
        hardCount: 0,
        goodCount: 0,
        easyCount: 0,
      },
    });

    return NextResponse.json({
      sessionId: studySession.id,
      deck,
    });
  } catch (error) {
    console.error('Error starting study session:', error);
    return NextResponse.json({ error: 'Failed to start study session' }, { status: 500 });
  }
}
