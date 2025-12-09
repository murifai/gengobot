import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';

// Fisher-Yates shuffle algorithm
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

// Helper function to get deck with ordered flashcards
async function getDeckWithOrderedCards(deckId: string, userId: string, cardOrder?: string[]) {
  // Fetch deck with flashcards
  const deck = await prisma.deck.findUnique({
    where: { id: deckId },
    include: {
      flashcards: {
        where: { isActive: true },
        orderBy: { position: 'asc' },
      },
    },
  });

  if (!deck) {
    return null;
  }

  // If we have a saved card order, use it to maintain session continuity
  if (cardOrder && cardOrder.length > 0) {
    const cardMap = new Map(deck.flashcards.map(card => [card.id, card]));
    const orderedFlashcards = cardOrder
      .map(id => cardMap.get(id))
      .filter((card): card is NonNullable<typeof card> => card !== undefined);

    return {
      deck,
      orderedFlashcards,
    };
  }

  // Otherwise, create new order based on review status
  const latestReviews = await prisma.$queryRaw<Array<{ flashcardId: string; rating: string }>>`
    SELECT DISTINCT ON (fr."flashcardId")
      fr."flashcardId",
      fr."rating"
    FROM "FlashcardReview" fr
    INNER JOIN "StudySession" ss ON fr."sessionId" = ss."id"
    INNER JOIN "Flashcard" f ON fr."flashcardId" = f."id"
    WHERE ss."userId" = ${userId}
      AND f."deckId" = ${deckId}
      AND f."isActive" = true
    ORDER BY fr."flashcardId", fr."reviewedAt" DESC
  `;

  // Create a map of card ID to latest rating
  const cardRatings = new Map<string, string>();
  latestReviews.forEach(review => {
    cardRatings.set(review.flashcardId, review.rating);
  });

  // Separate cards into categories
  const newCards = deck.flashcards.filter(card => !cardRatings.has(card.id));
  const belumHafalCards = deck.flashcards.filter(
    card => cardRatings.get(card.id) === 'belum_hafal'
  );
  const hafalCards = deck.flashcards.filter(card => cardRatings.get(card.id) === 'hafal');

  // Shuffle each category
  const shuffledNewCards = shuffleArray(newCards);
  const shuffledBelumHafalCards = shuffleArray(belumHafalCards);
  const shuffledHafalCards = shuffleArray(hafalCards);

  // Combine: new cards first, then belum_hafal, then hafal
  const orderedFlashcards = [
    ...shuffledNewCards,
    ...shuffledBelumHafalCards,
    ...shuffledHafalCards,
  ];

  return {
    deck,
    orderedFlashcards,
  };
}

// Helper to format flashcard for response
function formatFlashcard(card: {
  id: string;
  cardType: string;
  character?: string | null;
  romaji?: string | null;
  strokeSvg?: string | null;
  kanji?: string | null;
  kanjiMeaning?: string | null;
  onyomi?: string | null;
  kunyomi?: string | null;
  word?: string | null;
  wordMeaning?: string | null;
  reading?: string | null;
  partOfSpeech?: string | null;
  grammarPoint?: string | null;
  grammarMeaning?: string | null;
  usageNote?: string | null;
  exampleSentence?: string | null;
  exampleTranslation?: string | null;
  notes?: string | null;
  nextReviewDate?: Date | null;
  easeFactor: number;
  interval: number;
  repetitions: number;
}) {
  return {
    id: card.id,
    cardType: card.cardType,
    character: card.character,
    romaji: card.romaji,
    strokeSvg: card.strokeSvg,
    kanji: card.kanji,
    kanjiMeaning: card.kanjiMeaning,
    onyomi: card.onyomi,
    kunyomi: card.kunyomi,
    word: card.word,
    wordMeaning: card.wordMeaning,
    reading: card.reading,
    partOfSpeech: card.partOfSpeech,
    grammarPoint: card.grammarPoint,
    grammarMeaning: card.grammarMeaning,
    usageNote: card.usageNote,
    exampleSentence: card.exampleSentence,
    exampleTranslation: card.exampleTranslation,
    notes: card.notes,
    nextReviewDate: card.nextReviewDate,
    easeFactor: card.easeFactor,
    interval: card.interval,
    repetitions: card.repetitions,
  };
}

// GET /api/app/drill-sessions - Get in-progress session for a deck
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const deckId = searchParams.get('deckId');

    if (!deckId) {
      return NextResponse.json({ error: 'Deck ID is required' }, { status: 400 });
    }

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check for existing in-progress session for this deck
    const existingSession = await prisma.studySession.findFirst({
      where: {
        userId: user.id,
        deckId: deckId,
        isCompleted: false,
      },
      orderBy: { startTime: 'desc' },
    });

    if (!existingSession) {
      return NextResponse.json({ session: null });
    }

    // Get deck with cards in the saved order
    const cardOrder = existingSession.cardOrder as string[] | null;
    const result = await getDeckWithOrderedCards(deckId, user.id, cardOrder || undefined);

    if (!result) {
      return NextResponse.json({ error: 'Deck not found' }, { status: 404 });
    }

    return NextResponse.json({
      session: {
        id: existingSession.id,
        currentCardIndex: existingSession.currentCardIndex,
        reviewedCardIds: existingSession.reviewedCardIds || [],
        cardsReviewed: existingSession.cardsReviewed,
        startTime: existingSession.startTime,
      },
      deck: {
        id: result.deck.id,
        name: result.deck.name,
        description: result.deck.description,
        category: result.deck.category,
        difficulty: result.deck.difficulty,
        flashcards: result.orderedFlashcards.map(formatFlashcard),
      },
    });
  } catch (error) {
    console.error('Error getting study session:', error);
    return NextResponse.json(
      {
        error: 'Failed to get study session',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// POST /api/app/drill-sessions - Create a new study session
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { deckId, forceNew = false } = await request.json();

    if (!deckId) {
      return NextResponse.json({ error: 'Deck ID is required' }, { status: 400 });
    }

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check for existing in-progress session (unless forceNew is true)
    if (!forceNew) {
      const existingSession = await prisma.studySession.findFirst({
        where: {
          userId: user.id,
          deckId: deckId,
          isCompleted: false,
        },
        orderBy: { startTime: 'desc' },
      });

      if (existingSession) {
        // Resume existing session with saved card order
        const cardOrder = existingSession.cardOrder as string[] | null;
        const result = await getDeckWithOrderedCards(deckId, user.id, cardOrder || undefined);

        if (!result) {
          return NextResponse.json({ error: 'Deck not found' }, { status: 404 });
        }

        return NextResponse.json({
          sessionId: existingSession.id,
          isResumed: true,
          currentCardIndex: existingSession.currentCardIndex,
          reviewedCardIds: existingSession.reviewedCardIds || [],
          hafalCount: existingSession.hafalCount,
          belumHafalCount: existingSession.belumHafalCount,
          deck: {
            id: result.deck.id,
            name: result.deck.name,
            description: result.deck.description,
            category: result.deck.category,
            difficulty: result.deck.difficulty,
            flashcards: result.orderedFlashcards.map(formatFlashcard),
          },
        });
      }
    } else {
      // Mark any existing in-progress sessions as completed
      await prisma.studySession.updateMany({
        where: {
          userId: user.id,
          deckId: deckId,
          isCompleted: false,
        },
        data: {
          isCompleted: true,
          endTime: new Date(),
        },
      });
    }

    // Get deck with new card order
    const result = await getDeckWithOrderedCards(deckId, user.id);

    if (!result) {
      return NextResponse.json({ error: 'Deck not found' }, { status: 404 });
    }

    const { deck, orderedFlashcards } = result;

    // Create study session with card order saved
    const studySession = await prisma.studySession.create({
      data: {
        userId: user.id,
        deckId: deck.id,
        cardsReviewed: 0,
        cardsCorrect: 0,
        belumHafalCount: 0,
        hafalCount: 0,
        currentCardIndex: 0,
        cardOrder: orderedFlashcards.map(card => card.id),
        reviewedCardIds: [],
      },
    });

    console.log('Created study session:', studySession.id, 'for deck:', deck.name);

    return NextResponse.json({
      sessionId: studySession.id,
      isResumed: false,
      currentCardIndex: 0,
      reviewedCardIds: [],
      deck: {
        id: deck.id,
        name: deck.name,
        description: deck.description,
        category: deck.category,
        difficulty: deck.difficulty,
        flashcards: orderedFlashcards.map(formatFlashcard),
      },
    });
  } catch (error) {
    console.error('Error creating study session:', error);
    return NextResponse.json(
      {
        error: 'Failed to create study session',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
