import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

interface RouteParams {
  params: Promise<{
    token: string;
  }>;
}

/**
 * GET /api/decks/shared/[token]
 * Get deck details by share token (public access)
 */
export async function GET(request: Request, { params }: RouteParams) {
  try {
    const { token } = await params;

    if (!token) {
      return NextResponse.json({ error: 'Token required' }, { status: 400 });
    }

    const deck = await prisma.deck.findUnique({
      where: { shareToken: token },
      select: {
        id: true,
        name: true,
        description: true,
        category: true,
        difficulty: true,
        totalCards: true,
        studyCount: true,
        averageScore: true,
        createdAt: true,
        creator: {
          select: {
            name: true,
            nickname: true,
          },
        },
        flashcards: {
          where: { isActive: true },
          select: {
            id: true,
            cardType: true,
            // Return appropriate preview fields based on card type
            character: true,
            romaji: true,
            kanji: true,
            kanjiMeaning: true,
            word: true,
            wordMeaning: true,
            reading: true,
            grammarPoint: true,
            grammarMeaning: true,
          },
          orderBy: { position: 'asc' },
          take: 10, // Only show first 10 cards as preview
        },
        _count: {
          select: {
            flashcards: {
              where: { isActive: true },
            },
          },
        },
      },
    });

    if (!deck) {
      return NextResponse.json({ error: 'Deck not found or sharing disabled' }, { status: 404 });
    }

    return NextResponse.json({
      deck: {
        id: deck.id,
        name: deck.name,
        description: deck.description,
        category: deck.category,
        difficulty: deck.difficulty,
        totalCards: deck._count.flashcards,
        studyCount: deck.studyCount,
        averageScore: deck.averageScore,
        createdAt: deck.createdAt,
        creatorName: deck.creator?.nickname || deck.creator?.name || 'Anonymous',
        previewCards: deck.flashcards,
      },
    });
  } catch (error) {
    console.error('Error fetching shared deck:', error);
    return NextResponse.json({ error: 'Failed to fetch deck' }, { status: 500 });
  }
}
