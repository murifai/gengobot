import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth';
import { prisma } from '@/lib/prisma';

// GET - List decks user is currently studying (has study sessions)
export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;

    // Get decks that user has studied (from UserStudyingDeck or StudySession)
    // First try UserStudyingDeck model
    const studyingDecks = await prisma.userStudyingDeck.findMany({
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
      orderBy: { lastStudied: 'desc' },
    });

    // Get user's favorites for marking
    const favoriteIds = await prisma.userFavorite.findMany({
      where: { userId },
      select: { deckId: true },
    });
    const favoriteSet = new Set(favoriteIds.map((f: { deckId: string }) => f.deckId));

    // If no UserStudyingDeck records, fall back to StudySession
    if (studyingDecks.length === 0) {
      // Get unique decks from study sessions
      const sessions = await prisma.studySession.findMany({
        where: { userId },
        select: {
          id: true,
          deckId: true,
          startTime: true,
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
        orderBy: { startTime: 'desc' },
        distinct: ['deckId'],
      });

      const decks = await Promise.all(
        sessions.map(async studySession => {
          const deck = studySession.deck;

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
            lastStudied: studySession.startTime.toISOString(),
            isFavorite: favoriteSet.has(deck.id),
            creatorName: deck.creator?.name || 'Unknown',
          };
        })
      );

      return NextResponse.json({ decks });
    }

    // Process UserStudyingDeck records
    const decks = await Promise.all(
      studyingDecks.map(async (studying: (typeof studyingDecks)[0]) => {
        const deck = studying.deck;

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
          lastStudied: studying.lastStudied.toISOString(),
          isFavorite: favoriteSet.has(deck.id),
          creatorName: deck.creator?.name || 'Unknown',
        };
      })
    );

    return NextResponse.json({ decks });
  } catch (error) {
    console.error('Error fetching studying decks:', error);
    return NextResponse.json({ error: 'Failed to fetch studying decks' }, { status: 500 });
  }
}
