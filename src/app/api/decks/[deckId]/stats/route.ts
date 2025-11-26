import { NextResponse } from 'next/server';
import { getCurrentSessionUser } from '@/lib/auth/session';
import { prisma } from '@/lib/prisma';

interface RouteParams {
  params: Promise<{
    deckId: string;
  }>;
}

/**
 * GET /api/decks/[deckId]/stats
 * Get statistics for a specific deck
 */
export async function GET(request: Request, { params }: RouteParams) {
  try {
    const sessionUser = await getCurrentSessionUser();

    if (!sessionUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const dbUser = await prisma.user.findUnique({
      where: { email: sessionUser.email! },
      select: { id: true },
    });

    if (!dbUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const { deckId } = await params;

    // Verify deck exists
    const deck = await prisma.deck.findUnique({
      where: { id: deckId },
      select: {
        id: true,
        name: true,
      },
    });

    if (!deck) {
      return NextResponse.json({ error: 'Deck not found' }, { status: 404 });
    }

    // Get all completed sessions for this deck
    const sessions = await prisma.studySession.findMany({
      where: {
        userId: dbUser.id,
        deckId: deckId,
        isCompleted: true,
      },
      orderBy: {
        endTime: 'desc',
      },
    });

    // Get total cards in deck
    const totalCardsInDeck = await prisma.flashcard.count({
      where: {
        deckId: deckId,
        isActive: true,
      },
    });

    // Get unique cards mastery status based on LATEST review for each card
    // This prevents duplicate counting when reviewing the same card multiple times
    const latestReviews = await prisma.$queryRaw<Array<{ flashcardId: string; rating: string }>>`
      SELECT DISTINCT ON (fr."flashcardId")
        fr."flashcardId",
        fr."rating"
      FROM "FlashcardReview" fr
      INNER JOIN "StudySession" ss ON fr."sessionId" = ss."id"
      INNER JOIN "Flashcard" f ON fr."flashcardId" = f."id"
      WHERE ss."userId" = ${dbUser.id}
        AND f."deckId" = ${deckId}
        AND f."isActive" = true
      ORDER BY fr."flashcardId", fr."reviewedAt" DESC
    `;

    // Count unique hafal and belum hafal
    const uniqueHafal = latestReviews.filter(r => r.rating === 'hafal').length;
    const uniqueBelumHafal = latestReviews.filter(r => r.rating === 'belum_hafal').length;
    const uniqueReviewedCards = latestReviews.length;
    const notReviewedCards = totalCardsInDeck - uniqueReviewedCards;

    // Calculate overall statistics
    const totalSessions = sessions.length;
    const totalCardsReviewed = sessions.reduce((sum, s) => sum + s.cardsReviewed, 0);

    // Calculate total study time (in minutes)
    const totalStudyTime = sessions.reduce((sum, s) => {
      if (s.startTime && s.endTime) {
        const duration = s.endTime.getTime() - s.startTime.getTime();
        return sum + duration / 1000 / 60; // Convert to minutes
      }
      return sum;
    }, 0);

    // Calculate mastery percentage based on unique cards vs total cards in deck
    const masteredPercentage =
      totalCardsInDeck > 0 ? Math.round((uniqueHafal / totalCardsInDeck) * 100) : 0;
    const notMasteredPercentage =
      totalCardsInDeck > 0 ? Math.round((uniqueBelumHafal / totalCardsInDeck) * 100) : 0;

    // Calculate study streak (consecutive days with sessions for this deck)
    const studyStreak = await calculateDeckStudyStreak(dbUser.id, deckId);

    // Get recent sessions (last 10)
    const recentSessions = sessions.slice(0, 10).map(s => {
      // Calculate accuracy: hafal / (hafal + belumHafal) * 100
      const totalRated = s.hafalCount + s.belumHafalCount;
      const accuracy = totalRated > 0 ? Math.round((s.hafalCount / totalRated) * 100) : 0;

      return {
        id: s.id,
        startTime: s.startTime,
        endTime: s.endTime,
        cardsReviewed: s.cardsReviewed,
        hafalCount: s.hafalCount,
        belumHafalCount: s.belumHafalCount,
        accuracy,
      };
    });

    return NextResponse.json({
      deckId: deck.id,
      deckName: deck.name,
      overall: {
        totalSessions,
        totalCardsReviewed,
        totalStudyTime: Math.round(totalStudyTime),
        studyStreak,
        masteredPercentage,
        notMasteredPercentage,
        // New unique card stats
        totalCardsInDeck,
        uniqueHafal,
        uniqueBelumHafal,
        uniqueReviewedCards,
        notReviewedCards,
      },
      recentSessions,
    });
  } catch (error) {
    console.error('Error fetching deck stats:', error);
    return NextResponse.json({ error: 'Failed to fetch deck stats' }, { status: 500 });
  }
}

/**
 * Calculate study streak for a specific deck (consecutive days with at least one session)
 */
async function calculateDeckStudyStreak(userId: string, deckId: string): Promise<number> {
  const sessions = await prisma.studySession.findMany({
    where: {
      userId,
      deckId,
      isCompleted: true,
      endTime: { not: null },
    },
    orderBy: {
      endTime: 'desc',
    },
    select: {
      endTime: true,
    },
  });

  if (sessions.length === 0) return 0;

  // Group sessions by date
  const studyDates = new Set<string>();
  sessions.forEach(s => {
    if (s.endTime) {
      const dateStr = s.endTime.toISOString().split('T')[0];
      studyDates.add(dateStr);
    }
  });

  const sortedDates = Array.from(studyDates).sort().reverse();

  // Check if user studied today or yesterday
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayStr = today.toISOString().split('T')[0];

  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split('T')[0];

  if (sortedDates[0] !== todayStr && sortedDates[0] !== yesterdayStr) {
    return 0; // Streak broken
  }

  // Count consecutive days
  let streak = 0;
  const currentDate = new Date(sortedDates[0]);

  for (const dateStr of sortedDates) {
    const sessionDate = new Date(dateStr);
    const diffDays = Math.floor(
      (currentDate.getTime() - sessionDate.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (diffDays === streak) {
      streak++;
    } else {
      break;
    }
  }

  return streak;
}
