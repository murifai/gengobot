import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentSessionUser } from '@/lib/auth/session';

// POST /api/decks/[deckId]/duplicate - Duplicate a deck with all its cards
export async function POST(
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

    // Fetch the original deck with all cards
    const originalDeck = await prisma.deck.findUnique({
      where: { id: deckId },
      include: {
        flashcards: {
          where: { isActive: true },
        },
      },
    });

    if (!originalDeck) {
      return NextResponse.json({ error: 'Deck not found' }, { status: 404 });
    }

    // Check permissions: owner or public deck
    // Note: Admin operations use admin session via admin panel
    if (originalDeck.createdBy !== dbUser.id && !originalDeck.isPublic) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const newName = body.name || `${originalDeck.name} (Copy)`;

    // Create new deck with flashcards in a transaction
    const newDeck = await prisma.$transaction(async tx => {
      // Create the deck
      const deck = await tx.deck.create({
        data: {
          name: newName,
          description: originalDeck.description,
          isPublic: false, // Copies are private by default
          category: originalDeck.category,
          difficulty: originalDeck.difficulty,
          totalCards: originalDeck.totalCards,
          createdBy: dbUser.id,
        },
      });

      // Create all flashcards
      if (originalDeck.flashcards.length > 0) {
        await tx.flashcard.createMany({
          data: originalDeck.flashcards.map(card => ({
            deckId: deck.id,
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
            tags: card.tags ?? undefined,
            position: card.position,
            // Reset spaced repetition data for new deck
            easeFactor: 2.5,
            interval: 0,
            repetitions: 0,
          })),
        });
      }

      return deck;
    });

    // Note: Admin logging is handled via admin panel with admin session

    // Fetch the complete new deck with cards
    const completeDeck = await prisma.deck.findUnique({
      where: { id: newDeck.id },
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        flashcards: true,
      },
    });

    return NextResponse.json(completeDeck, { status: 201 });
  } catch (error) {
    console.error('Error duplicating deck:', error);
    return NextResponse.json({ error: 'Failed to duplicate deck' }, { status: 500 });
  }
}
