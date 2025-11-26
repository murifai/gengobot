import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth';
import { prisma } from '@/lib/prisma';

// GET - List user's favorite decks
export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;

    // Get user's favorite decks with deck details
    const favorites = await prisma.userFavorite.findMany({
      where: { userId },
      include: {
        deck: {
          include: {
            creator: {
              select: { name: true },
            },
            flashcards: {
              where: { isActive: true },
              select: { id: true },
            },
            _count: {
              select: {
                studySessions: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Get due cards count for each deck
    const decks = await Promise.all(
      favorites.map(async (fav: (typeof favorites)[0]) => {
        const deck = fav.deck;

        // Get cards due for review
        const dueCards = await prisma.flashcard.count({
          where: {
            deckId: deck.id,
            isActive: true,
            nextReviewDate: {
              lte: new Date(),
            },
          },
        });

        // Get new cards (never reviewed)
        const reviewedCardIds = await prisma.flashcardReview.findMany({
          where: {
            flashcard: { deckId: deck.id },
            session: { userId },
          },
          select: { flashcardId: true },
          distinct: ['flashcardId'],
        });

        const newCards = deck.flashcards.length - reviewedCardIds.length;

        return {
          id: deck.id,
          name: deck.name,
          description: deck.description,
          category: deck.category,
          difficulty: deck.difficulty,
          isPublic: deck.isPublic,
          totalCards: deck.flashcards.length,
          dueCards,
          newCards: Math.max(0, newCards),
          studyCount: deck._count.studySessions,
          createdAt: deck.createdAt.toISOString(),
          updatedAt: deck.updatedAt.toISOString(),
          isFavorite: true,
          creatorName: deck.creator?.name || 'Unknown',
        };
      })
    );

    return NextResponse.json({ decks });
  } catch (error) {
    console.error('Error fetching favorite decks:', error);
    return NextResponse.json({ error: 'Failed to fetch favorites' }, { status: 500 });
  }
}
