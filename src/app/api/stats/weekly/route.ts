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

    // Get flashcard reviews for weekly chart
    const flashcardReviews = await prisma.flashcardReview.findMany({
      where: {
        session: {
          userId,
        },
        reviewedAt: {
          gte: sevenDaysAgo,
        },
      },
      select: {
        reviewedAt: true,
      },
    });

    // Build weekly breakdown
    const dates: string[] = [];
    const kaiwaMinutes: number[] = [];
    const cardsLearned: number[] = [];

    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);

      const nextDay = new Date(date);
      nextDay.setDate(nextDay.getDate() + 1);

      dates.push(date.toISOString().split('T')[0]);

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

      // Calculate cards learned for this day
      const reviewsForDay = flashcardReviews.filter(review => {
        const reviewDate = new Date(review.reviewedAt);
        return reviewDate >= date && reviewDate < nextDay;
      });

      cardsLearned.push(reviewsForDay.length);
    }

    return NextResponse.json({
      dates,
      kaiwaMinutes,
      cardsLearned,
    });
  } catch (error) {
    console.error('Error fetching weekly stats:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
