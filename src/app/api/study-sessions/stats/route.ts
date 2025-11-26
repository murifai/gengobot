import { NextResponse } from 'next/server';
import { getCurrentSessionUser } from '@/lib/auth/session';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/study-sessions/stats
 * Get user's study statistics
 */
export async function GET() {
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

    // Get all completed sessions
    const sessions = await prisma.studySession.findMany({
      where: {
        userId: dbUser.id,
        isCompleted: true,
      },
      include: {
        deck: {
          select: {
            id: true,
            name: true,
            category: true,
            difficulty: true,
          },
        },
      },
      orderBy: {
        endTime: 'desc',
      },
    });

    // Calculate overall statistics
    const totalSessions = sessions.length;
    const totalCardsReviewed = sessions.reduce((sum, s) => sum + s.cardsReviewed, 0);
    const totalCardsCorrect = sessions.reduce((sum, s) => sum + s.cardsCorrect, 0);
    const overallAccuracy =
      totalCardsReviewed > 0 ? (totalCardsCorrect / totalCardsReviewed) * 100 : 0;

    // Calculate total study time (in minutes)
    const totalStudyTime = sessions.reduce((sum, s) => {
      if (s.startTime && s.endTime) {
        const duration = s.endTime.getTime() - s.startTime.getTime();
        return sum + duration / 1000 / 60; // Convert to minutes
      }
      return sum;
    }, 0);

    // Get rating distribution based on UNIQUE cards (latest review only)
    // This prevents double counting when reviewing the same card multiple times
    const latestReviews = await prisma.$queryRaw<Array<{ flashcardId: string; rating: string }>>`
      SELECT DISTINCT ON (fr."flashcardId")
        fr."flashcardId",
        fr."rating"
      FROM "FlashcardReview" fr
      INNER JOIN "StudySession" ss ON fr."sessionId" = ss."id"
      WHERE ss."userId" = ${dbUser.id}
      ORDER BY fr."flashcardId", fr."reviewedAt" DESC
    `;

    const uniqueHafal = latestReviews.filter(r => r.rating === 'hafal').length;
    const uniqueBelumHafal = latestReviews.filter(r => r.rating === 'belum_hafal').length;

    const ratingDistribution = {
      belumHafal: uniqueBelumHafal,
      hafal: uniqueHafal,
      // Also include cumulative for reference
      totalReviews: sessions.reduce((sum, s) => sum + s.hafalCount + s.belumHafalCount, 0),
    };

    // Get cards due for review today
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const cardsDueToday = await prisma.flashcard.count({
      where: {
        deck: {
          OR: [{ isPublic: true }, { createdBy: dbUser.id }],
        },
        nextReviewDate: {
          lte: new Date(),
        },
      },
    });

    // Get study streak (consecutive days)
    const studyStreak = await calculateStudyStreak(dbUser.id);

    // Get recent sessions (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const recentSessions = sessions.filter(s => s.endTime && s.endTime >= sevenDaysAgo);

    // Get deck-wise statistics
    interface DeckStat {
      deckName: string;
      category: string | null;
      difficulty: string | null;
      sessions: number;
      cardsReviewed: number;
      cardsCorrect: number;
      accuracy: number;
    }

    const deckStats = sessions.reduce(
      (acc, s) => {
        const deckId = s.deck.id;
        if (!acc[deckId]) {
          acc[deckId] = {
            deckName: s.deck.name,
            category: s.deck.category,
            difficulty: s.deck.difficulty,
            sessions: 0,
            cardsReviewed: 0,
            cardsCorrect: 0,
            accuracy: 0,
          };
        }
        acc[deckId].sessions += 1;
        acc[deckId].cardsReviewed += s.cardsReviewed;
        acc[deckId].cardsCorrect += s.cardsCorrect;
        acc[deckId].accuracy =
          acc[deckId].cardsReviewed > 0
            ? (acc[deckId].cardsCorrect / acc[deckId].cardsReviewed) * 100
            : 0;
        return acc;
      },
      {} as Record<string, DeckStat>
    );

    return NextResponse.json({
      overview: {
        totalSessions,
        totalCardsReviewed,
        totalCardsCorrect,
        overallAccuracy: Math.round(overallAccuracy),
        totalStudyTime: Math.round(totalStudyTime),
        cardsDueToday,
        studyStreak,
      },
      ratingDistribution,
      recentSessions: recentSessions.map(s => ({
        id: s.id,
        deckName: s.deck.name,
        startTime: s.startTime,
        endTime: s.endTime,
        cardsReviewed: s.cardsReviewed,
        cardsCorrect: s.cardsCorrect,
        accuracy: s.cardsReviewed > 0 ? Math.round((s.cardsCorrect / s.cardsReviewed) * 100) : 0,
      })),
      deckStats: Object.values(deckStats),
    });
  } catch (error) {
    console.error('Error fetching study stats:', error);
    return NextResponse.json({ error: 'Failed to fetch study stats' }, { status: 500 });
  }
}

/**
 * Calculate study streak (consecutive days with at least one session)
 */
async function calculateStudyStreak(userId: string): Promise<number> {
  const sessions = await prisma.studySession.findMany({
    where: {
      userId,
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
