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

// POST /api/app/drill-sessions - Create a new study session
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { deckId } = await request.json();

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
      return NextResponse.json({ error: 'Deck not found' }, { status: 404 });
    }

    // Get user's latest review status for each card in this deck
    const latestReviews = await prisma.$queryRaw<Array<{ flashcardId: string; rating: string }>>`
      SELECT DISTINCT ON (fr."flashcardId")
        fr."flashcardId",
        fr."rating"
      FROM "FlashcardReview" fr
      INNER JOIN "StudySession" ss ON fr."sessionId" = ss."id"
      INNER JOIN "Flashcard" f ON fr."flashcardId" = f."id"
      WHERE ss."userId" = ${user.id}
        AND f."deckId" = ${deckId}
        AND f."isActive" = true
      ORDER BY fr."flashcardId", fr."reviewedAt" DESC
    `;

    // Create a map of card ID to latest rating
    const cardRatings = new Map<string, string>();
    latestReviews.forEach(review => {
      cardRatings.set(review.flashcardId, review.rating);
    });

    // Separate cards into categories:
    // 1. New cards (never reviewed)
    // 2. Cards marked as "belum_hafal" (not memorized)
    // 3. Cards marked as "hafal" (memorized)
    const newCards = deck.flashcards.filter(card => !cardRatings.has(card.id));
    const belumHafalCards = deck.flashcards.filter(
      card => cardRatings.get(card.id) === 'belum_hafal'
    );
    const hafalCards = deck.flashcards.filter(card => cardRatings.get(card.id) === 'hafal');

    // Shuffle each category
    const shuffledNewCards = shuffleArray(newCards);
    const shuffledBelumHafalCards = shuffleArray(belumHafalCards);
    const shuffledHafalCards = shuffleArray(hafalCards);

    // Combine: new cards first, then belum_hafal, then hafal (known cards last)
    const orderedFlashcards = [
      ...shuffledNewCards,
      ...shuffledBelumHafalCards,
      ...shuffledHafalCards,
    ];

    // Create study session
    const studySession = await prisma.studySession.create({
      data: {
        userId: user.id,
        deckId: deck.id,
        cardsReviewed: 0,
        cardsCorrect: 0,
        belumHafalCount: 0,
        hafalCount: 0,
      },
    });

    console.log('Created study session:', studySession.id, 'for deck:', deck.name);
    console.log(
      `Card order: ${newCards.length} new, ${belumHafalCards.length} belum hafal, ${hafalCards.length} hafal`
    );

    return NextResponse.json({
      sessionId: studySession.id,
      deck: {
        id: deck.id,
        name: deck.name,
        description: deck.description,
        category: deck.category,
        difficulty: deck.difficulty,
        flashcards: orderedFlashcards.map(card => ({
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
        })),
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
