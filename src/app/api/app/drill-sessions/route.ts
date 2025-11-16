import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';

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
          orderBy: { position: 'asc' },
        },
      },
    });

    if (!deck) {
      return NextResponse.json({ error: 'Deck not found' }, { status: 404 });
    }

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

    return NextResponse.json({
      sessionId: studySession.id,
      deck: {
        id: deck.id,
        name: deck.name,
        description: deck.description,
        category: deck.category,
        difficulty: deck.difficulty,
        flashcards: deck.flashcards.map(card => ({
          id: card.id,
          cardType: card.cardType,
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
