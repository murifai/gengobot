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

    if (!user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user from database - support both authId (UUID) and id (CUID) formats
    let dbUser = await prisma.user.findUnique({
      where: { authId: user.id },
      select: { id: true, email: true, name: true },
    });

    // Fallback to email lookup if authId lookup fails
    if (!dbUser && user.email) {
      dbUser = await prisma.user.findUnique({
        where: { email: user.email },
        select: { id: true, email: true, name: true },
      });
    }

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
          where: {
            isActive: true,
          },
        },
      },
    });

    if (!deck) {
      return NextResponse.json({ error: 'Deck not found' }, { status: 404 });
    }

    // Check access (public decks or owned decks)
    if (!deck.isPublic && deck.createdBy !== dbUser.id) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Implement Anki-like card ordering based on spaced repetition
    const now = new Date();

    // Separate cards into categories
    const dueCards = deck.flashcards.filter(
      card => card.nextReviewDate && card.nextReviewDate <= now
    );
    const newCards = deck.flashcards.filter(card => !card.nextReviewDate && card.repetitions === 0);
    const futureCards = deck.flashcards.filter(
      card => card.nextReviewDate && card.nextReviewDate > now
    );

    // Sort due cards by priority (overdue cards with lower ease factor first)
    dueCards.sort((a, b) => {
      const aDaysOverdue = a.nextReviewDate
        ? Math.floor((now.getTime() - a.nextReviewDate.getTime()) / (1000 * 60 * 60 * 24))
        : 0;
      const bDaysOverdue = b.nextReviewDate
        ? Math.floor((now.getTime() - b.nextReviewDate.getTime()) / (1000 * 60 * 60 * 24))
        : 0;

      // Prioritize by days overdue, then by ease factor (harder cards first)
      if (aDaysOverdue !== bDaysOverdue) {
        return bDaysOverdue - aDaysOverdue; // More overdue first
      }
      return a.easeFactor - b.easeFactor; // Lower ease factor (harder) first
    });

    // Shuffle new cards to add variety
    newCards.sort(() => Math.random() - 0.5);

    // Sort future cards by nextReviewDate (closest first)
    futureCards.sort((a, b) => {
      if (!a.nextReviewDate || !b.nextReviewDate) return 0;
      return a.nextReviewDate.getTime() - b.nextReviewDate.getTime();
    });

    // Combine: due cards → new cards → future cards
    const orderedFlashcards = [...dueCards, ...newCards, ...futureCards];

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

    // Increment deck studyCount
    await prisma.deck.update({
      where: { id: deckId },
      data: {
        studyCount: {
          increment: 1,
        },
      },
    });

    return NextResponse.json({
      sessionId: studySession.id,
      deck: {
        ...deck,
        flashcards: orderedFlashcards,
      },
      dueCount: dueCards.length,
      newCount: newCards.length,
      reviewStats: {
        totalCards: orderedFlashcards.length,
        dueToday: dueCards.length,
        newCards: newCards.length,
      },
    });
  } catch (error) {
    console.error('Error starting study session:', error);
    return NextResponse.json({ error: 'Failed to start study session' }, { status: 500 });
  }
}
