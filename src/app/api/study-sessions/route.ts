import { NextResponse } from 'next/server';
import { getCurrentSessionUser } from '@/lib/auth/session';
import { prisma } from '@/lib/prisma';

/**
 * POST /api/study-sessions
 * Start a new study session
 */
export async function POST(request: Request) {
  try {
    const sessionUser = await getCurrentSessionUser();

    if (!sessionUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const dbUser = await prisma.user.findUnique({
      where: { email: sessionUser.email! },
      select: { id: true, email: true, name: true },
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

    // Weighted shuffle for new cards - prioritize cards with lower ease factor (harder cards)
    // Cards with lower easeFactor get higher weight in the shuffle
    const weightedShuffleNewCards = (cards: typeof newCards) => {
      if (cards.length === 0) return cards;

      // Create weighted array based on inverse ease factor
      // Lower ease factor = higher priority (appears more in weighted array)
      const weighted: typeof cards = [];
      cards.forEach(card => {
        // Weight = inverse of ease factor (harder cards get more weight)
        // Minimum weight of 1, cards with ease < 2.5 get extra weight
        const weight = Math.max(1, Math.ceil((2.5 - card.easeFactor) * 3));
        for (let i = 0; i < weight; i++) {
          weighted.push(card);
        }
      });

      // Shuffle the weighted array
      weighted.sort(() => Math.random() - 0.5);

      // Remove duplicates while preserving weighted order
      const seen = new Set<string>();
      const result: typeof cards = [];
      for (const card of weighted) {
        if (!seen.has(card.id)) {
          seen.add(card.id);
          result.push(card);
        }
      }

      return result;
    };

    // Apply weighted shuffle to new cards
    const shuffledNewCards = weightedShuffleNewCards(newCards);

    // Weighted shuffle for future cards - also prioritize harder cards
    const weightedShuffleFutureCards = (cards: typeof futureCards) => {
      if (cards.length === 0) return cards;

      // First sort by review date to maintain some temporal order
      cards.sort((a, b) => {
        if (!a.nextReviewDate || !b.nextReviewDate) return 0;
        return a.nextReviewDate.getTime() - b.nextReviewDate.getTime();
      });

      // Then apply weighted shuffle within date groups
      // Group cards by review date (same day)
      const groups: Map<string, typeof cards> = new Map();
      cards.forEach(card => {
        if (!card.nextReviewDate) return;
        const dateKey = card.nextReviewDate.toISOString().split('T')[0];
        if (!groups.has(dateKey)) {
          groups.set(dateKey, []);
        }
        groups.get(dateKey)!.push(card);
      });

      // Weighted shuffle within each date group
      const result: typeof cards = [];
      for (const [, groupCards] of groups) {
        const weighted: typeof groupCards = [];
        groupCards.forEach(card => {
          const weight = Math.max(1, Math.ceil((2.5 - card.easeFactor) * 2));
          for (let i = 0; i < weight; i++) {
            weighted.push(card);
          }
        });

        weighted.sort(() => Math.random() - 0.5);

        const seen = new Set<string>();
        for (const card of weighted) {
          if (!seen.has(card.id)) {
            seen.add(card.id);
            result.push(card);
          }
        }
      }

      return result;
    };

    // Apply weighted shuffle to future cards
    const shuffledFutureCards = weightedShuffleFutureCards(futureCards);

    // Combine: due cards → shuffled new cards → shuffled future cards
    const orderedFlashcards = [...dueCards, ...shuffledNewCards, ...shuffledFutureCards];

    // Prevent starting with the same card as the last session
    // Get the last completed session for this deck
    const lastSession = await prisma.studySession.findFirst({
      where: {
        userId: dbUser.id,
        deckId,
        isCompleted: true,
      },
      orderBy: {
        endTime: 'desc',
      },
      include: {
        reviews: {
          orderBy: {
            reviewedAt: 'asc',
          },
          take: 1,
        },
      },
    });

    // If there was a previous session and it has reviews, avoid starting with the same card
    if (lastSession && lastSession.reviews.length > 0 && orderedFlashcards.length > 1) {
      const lastFirstCardId = lastSession.reviews[0].flashcardId;
      const firstCardIndex = orderedFlashcards.findIndex(card => card.id === lastFirstCardId);

      if (firstCardIndex === 0) {
        // Swap first card with second card to avoid repetition
        [orderedFlashcards[0], orderedFlashcards[1]] = [orderedFlashcards[1], orderedFlashcards[0]];
      }
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
        belumHafalCount: 0,
        hafalCount: 0,
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
