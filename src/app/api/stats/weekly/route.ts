import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    // Get task attempts for weekly chart
    const taskAttempts = await prisma.taskAttempt.findMany({
      where: {
        userId,
        isCompleted: true,
        endTime: {
          gte: sevenDaysAgo,
        },
      },
      select: {
        endTime: true,
        startTime: true,
      },
    });

    // Get total unique mastered cards across all decks
    // This counts unique cards that the user has marked as "hafal" based on their latest review
    const uniqueMasteredCards = await prisma.$queryRaw<Array<{ count: bigint }>>`
      SELECT COUNT(*) as count
      FROM (
        SELECT DISTINCT ON (fr."flashcardId") fr."flashcardId", fr."rating"
        FROM "FlashcardReview" fr
        INNER JOIN "StudySession" ss ON fr."sessionId" = ss."id"
        WHERE ss."userId" = ${userId}
        ORDER BY fr."flashcardId", fr."reviewedAt" DESC
      ) latest_reviews
      WHERE latest_reviews."rating" = 'hafal'
    `;

    const totalMasteredCards = Number(uniqueMasteredCards[0]?.count || 0);

    // Get unique cards reviewed per day by card type for weekly chart
    const flashcardReviewsByType = await prisma.$queryRaw<
      Array<{ reviewDate: Date; cardType: string; uniqueCards: bigint }>
    >`
      SELECT
        DATE(fr."reviewedAt") as "reviewDate",
        f."cardType",
        COUNT(DISTINCT fr."flashcardId") as "uniqueCards"
      FROM "FlashcardReview" fr
      INNER JOIN "StudySession" ss ON fr."sessionId" = ss."id"
      INNER JOIN "Flashcard" f ON fr."flashcardId" = f."id"
      WHERE ss."userId" = ${userId}
        AND fr."reviewedAt" >= ${sevenDaysAgo}
      GROUP BY DATE(fr."reviewedAt"), f."cardType"
    `;

    // Create maps for quick lookup by date and card type
    const kanjiByDate = new Map<string, number>();
    const vocabularyByDate = new Map<string, number>();
    const grammarByDate = new Map<string, number>();

    flashcardReviewsByType.forEach(review => {
      const dateStr = new Date(review.reviewDate).toISOString().split('T')[0];
      const count = Number(review.uniqueCards);

      switch (review.cardType) {
        case 'kanji':
          kanjiByDate.set(dateStr, (kanjiByDate.get(dateStr) || 0) + count);
          break;
        case 'vocabulary':
          vocabularyByDate.set(dateStr, (vocabularyByDate.get(dateStr) || 0) + count);
          break;
        case 'grammar':
          grammarByDate.set(dateStr, (grammarByDate.get(dateStr) || 0) + count);
          break;
      }
    });

    // Build weekly breakdown
    const dates: string[] = [];
    const kaiwaMinutes: number[] = [];
    const kanjiCards: number[] = [];
    const vocabularyCards: number[] = [];
    const grammarCards: number[] = [];

    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);

      const nextDay = new Date(date);
      nextDay.setDate(nextDay.getDate() + 1);

      const dateStr = date.toISOString().split('T')[0];
      dates.push(dateStr);

      // Calculate kaiwa minutes for this day
      const attemptsForDay = taskAttempts.filter(attempt => {
        const attemptDate = new Date(attempt.endTime || attempt.startTime);
        return attemptDate >= date && attemptDate < nextDay;
      });

      let minutesForDay = 0;
      attemptsForDay.forEach(attempt => {
        if (attempt.endTime && attempt.startTime) {
          const duration = attempt.endTime.getTime() - attempt.startTime.getTime();
          minutesForDay += Math.floor(duration / 1000 / 60);
        }
      });

      kaiwaMinutes.push(minutesForDay);

      // Get unique cards learned for this day by type
      kanjiCards.push(kanjiByDate.get(dateStr) || 0);
      vocabularyCards.push(vocabularyByDate.get(dateStr) || 0);
      grammarCards.push(grammarByDate.get(dateStr) || 0);
    }

    // Calculate total for backwards compatibility
    const cardsLearned = dates.map((_, i) => kanjiCards[i] + vocabularyCards[i] + grammarCards[i]);

    return NextResponse.json({
      dates,
      kaiwaMinutes,
      cardsLearned, // Total for backwards compatibility
      // Card type breakdown
      kanjiCards,
      vocabularyCards,
      grammarCards,
      totalMasteredCards, // Total unique cards mastered across all decks
    });
  } catch (error) {
    console.error('Error fetching weekly stats:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
