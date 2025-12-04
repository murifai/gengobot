import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createHash } from 'crypto';
import { CardType } from '@/types/deck';

/**
 * Validate extension token and get user
 */
async function getExtensionUser(request: NextRequest) {
  const token = request.headers.get('X-Extension-Token');

  if (!token) {
    return null;
  }

  const hashedToken = createHash('sha256').update(token).digest('hex');

  const extensionToken = await prisma.extensionToken.findUnique({
    where: { token: hashedToken },
    include: {
      user: {
        select: { id: true, email: true, name: true, image: true },
      },
    },
  });

  if (!extensionToken || extensionToken.expiresAt < new Date()) {
    return null;
  }

  return extensionToken.user;
}

/**
 * POST /api/extension/flashcards
 * Add a new flashcard from extension (vocabulary or kanji)
 */
export async function POST(request: NextRequest) {
  try {
    const user = await getExtensionUser(request);

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
    });

    if (!dbUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const body = await request.json();
    const { deckId, cardType, ...cardData } = body;

    // Validate required fields
    if (!deckId || !cardType) {
      return NextResponse.json({ error: 'deckId and cardType are required' }, { status: 400 });
    }

    // Verify deck exists and user has permission
    const deck = await prisma.deck.findUnique({
      where: { id: deckId },
    });

    if (!deck) {
      return NextResponse.json({ error: 'Deck not found' }, { status: 404 });
    }

    if (deck.createdBy !== dbUser.id) {
      return NextResponse.json({ error: 'Cannot add cards to this deck' }, { status: 403 });
    }

    // Validate card type specific fields
    const validCardType = cardType as CardType;

    // Get next position
    const lastCard = await prisma.flashcard.findFirst({
      where: { deckId },
      orderBy: { position: 'desc' },
      select: { position: true },
    });
    const nextPosition = (lastCard?.position ?? -1) + 1;

    // Base card data
    const baseCardData = {
      deckId,
      cardType: validCardType,
      position: nextPosition,
      exampleSentence: cardData.exampleSentence || null,
      exampleTranslation: cardData.exampleTranslation || null,
      notes: cardData.notes || null,
      tags: cardData.tags || undefined,
    };

    let flashcardData;

    switch (validCardType) {
      case 'kanji':
        if (!cardData.kanji || !cardData.kanjiMeaning) {
          return NextResponse.json(
            { error: 'Kanji and meaning are required for kanji cards' },
            { status: 400 }
          );
        }
        flashcardData = {
          ...baseCardData,
          kanji: cardData.kanji,
          kanjiMeaning: cardData.kanjiMeaning,
          onyomi: cardData.onyomi || null,
          kunyomi: cardData.kunyomi || null,
        };
        break;

      case 'vocabulary':
        if (!cardData.word || !cardData.wordMeaning || !cardData.reading) {
          return NextResponse.json(
            { error: 'Word, meaning, and reading are required for vocabulary cards' },
            { status: 400 }
          );
        }
        flashcardData = {
          ...baseCardData,
          word: cardData.word,
          wordMeaning: cardData.wordMeaning,
          reading: cardData.reading,
          partOfSpeech: cardData.partOfSpeech || null,
        };
        break;

      case 'grammar':
        if (!cardData.grammarPoint || !cardData.grammarMeaning) {
          return NextResponse.json(
            { error: 'Grammar point and meaning are required for grammar cards' },
            { status: 400 }
          );
        }
        flashcardData = {
          ...baseCardData,
          grammarPoint: cardData.grammarPoint,
          grammarMeaning: cardData.grammarMeaning,
          usageNote: cardData.usageNote || null,
        };
        break;

      default:
        return NextResponse.json({ error: 'Invalid card type' }, { status: 400 });
    }

    // Create flashcard and update deck totalCards in a transaction
    const result = await prisma.$transaction(async tx => {
      const flashcard = await tx.flashcard.create({
        data: flashcardData,
      });

      await tx.deck.update({
        where: { id: deckId },
        data: {
          totalCards: { increment: 1 },
        },
      });

      return flashcard;
    });

    return NextResponse.json(
      {
        success: true,
        flashcard: {
          id: result.id,
          cardType: result.cardType,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('[Extension Flashcards] Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
