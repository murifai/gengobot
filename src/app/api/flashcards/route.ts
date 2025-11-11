import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentSessionUser } from '@/lib/auth/session';
import { CardType } from '@/types/deck';

// GET /api/flashcards - List flashcards with pagination and filters
export async function GET(request: NextRequest) {
  try {
    const sessionUser = await getCurrentSessionUser();

    if (!sessionUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const deckId = searchParams.get('deckId');
    const cardType = searchParams.get('cardType') as CardType | null;
    const search = searchParams.get('search');
    const dueForReview = searchParams.get('dueForReview') === 'true';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');

    if (!deckId) {
      return NextResponse.json({ error: 'deckId is required' }, { status: 400 });
    }

    // Build filter conditions
    const where: Record<string, unknown> = {
      deckId,
      isActive: true,
    };

    if (cardType) {
      where.cardType = cardType;
    }

    if (search) {
      where.OR = [
        { kanji: { contains: search, mode: 'insensitive' } },
        { kanjiMeaning: { contains: search, mode: 'insensitive' } },
        { word: { contains: search, mode: 'insensitive' } },
        { wordMeaning: { contains: search, mode: 'insensitive' } },
        { reading: { contains: search, mode: 'insensitive' } },
        { grammarPoint: { contains: search, mode: 'insensitive' } },
        { grammarMeaning: { contains: search, mode: 'insensitive' } },
        { exampleSentence: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (dueForReview) {
      where.OR = [{ nextReviewDate: null }, { nextReviewDate: { lte: new Date() } }];
    }

    // Fetch flashcards with pagination
    const [flashcards, total] = await Promise.all([
      prisma.flashcard.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { position: 'asc' },
      }),
      prisma.flashcard.count({ where }),
    ]);

    return NextResponse.json({
      flashcards,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching flashcards:', error);
    return NextResponse.json({ error: 'Failed to fetch flashcards' }, { status: 500 });
  }
}

// POST /api/flashcards - Create a new flashcard
export async function POST(request: NextRequest) {
  try {
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

    const body = await request.json();

    // Validate required fields
    if (!body.deckId || !body.cardType) {
      return NextResponse.json({ error: 'deckId and cardType are required' }, { status: 400 });
    }

    // Verify deck exists and user has permission
    const deck = await prisma.deck.findUnique({
      where: { id: body.deckId },
    });

    if (!deck) {
      return NextResponse.json({ error: 'Deck not found' }, { status: 404 });
    }

    if (deck.createdBy !== dbUser.id && !dbUser.isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Validate card type specific fields
    const cardType = body.cardType as CardType;

    // Base card data
    const baseCardData = {
      deckId: body.deckId,
      cardType: body.cardType,
      position: body.position ?? 0,
      exampleSentence: body.exampleSentence || null,
      exampleTranslation: body.exampleTranslation || null,
      notes: body.notes || null,
      tags: body.tags ?? undefined,
    };

    let cardData;

    switch (cardType) {
      case 'kanji':
        if (!body.kanji || !body.kanjiMeaning) {
          return NextResponse.json(
            { error: 'Kanji and meaning are required for kanji cards' },
            { status: 400 }
          );
        }
        cardData = {
          ...baseCardData,
          kanji: body.kanji,
          kanjiMeaning: body.kanjiMeaning,
          onyomi: body.onyomi || null,
          kunyomi: body.kunyomi || null,
        };
        break;

      case 'vocabulary':
        if (!body.word || !body.wordMeaning || !body.reading) {
          return NextResponse.json(
            { error: 'Word, meaning, and reading are required for vocabulary cards' },
            { status: 400 }
          );
        }
        cardData = {
          ...baseCardData,
          word: body.word,
          wordMeaning: body.wordMeaning,
          reading: body.reading,
          partOfSpeech: body.partOfSpeech || null,
        };
        break;

      case 'grammar':
        if (!body.grammarPoint || !body.grammarMeaning) {
          return NextResponse.json(
            { error: 'Grammar point and meaning are required for grammar cards' },
            { status: 400 }
          );
        }
        cardData = {
          ...baseCardData,
          grammarPoint: body.grammarPoint,
          grammarMeaning: body.grammarMeaning,
          usageNote: body.usageNote || null,
        };
        break;

      default:
        return NextResponse.json({ error: 'Invalid card type' }, { status: 400 });
    }

    // Create flashcard and update deck totalCards in a transaction
    const result = await prisma.$transaction(async tx => {
      const flashcard = await tx.flashcard.create({
        data: cardData,
      });

      await tx.deck.update({
        where: { id: body.deckId },
        data: {
          totalCards: { increment: 1 },
        },
      });

      return flashcard;
    });

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error('Error creating flashcard:', error);
    return NextResponse.json({ error: 'Failed to create flashcard' }, { status: 500 });
  }
}
