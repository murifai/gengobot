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

        // Get unique mastered cards (based on latest review rating)
        const masteredCards = await prisma.$queryRaw<Array<{ count: bigint }>>`
          SELECT COUNT(*) as count
          FROM (
            SELECT DISTINCT ON (fr."flashcardId") fr."flashcardId", fr."rating"
            FROM "FlashcardReview" fr
            INNER JOIN "StudySession" ss ON fr."sessionId" = ss."id"
            INNER JOIN "Flashcard" f ON fr."flashcardId" = f."id"
            WHERE ss."userId" = ${userId} AND f."deckId" = ${deck.id}
            ORDER BY fr."flashcardId", fr."reviewedAt" DESC
          ) latest_reviews
          WHERE latest_reviews."rating" = 'hafal'
        `;

        // Get unique not mastered cards (based on latest review rating)
        const notMasteredCards = await prisma.$queryRaw<Array<{ count: bigint }>>`
          SELECT COUNT(*) as count
          FROM (
            SELECT DISTINCT ON (fr."flashcardId") fr."flashcardId", fr."rating"
            FROM "FlashcardReview" fr
            INNER JOIN "StudySession" ss ON fr."sessionId" = ss."id"
            INNER JOIN "Flashcard" f ON fr."flashcardId" = f."id"
            WHERE ss."userId" = ${userId} AND f."deckId" = ${deck.id}
            ORDER BY fr."flashcardId", fr."reviewedAt" DESC
          ) latest_reviews
          WHERE latest_reviews."rating" = 'belum_hafal'
        `;

        const uniqueHafal = Number(masteredCards[0]?.count || 0);
        const uniqueBelumHafal = Number(notMasteredCards[0]?.count || 0);

        return {
          id: deck.id,
          name: deck.name,
          description: deck.description,
          category: deck.category,
          difficulty: deck.difficulty,
          isPublic: deck.isPublic,
          totalCards: deck.flashcards.length,
          dueCards,
          uniqueHafal,
          uniqueBelumHafal,
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
