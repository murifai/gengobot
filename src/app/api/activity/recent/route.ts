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

    // Get recent task completions
    const recentTasks = await prisma.taskAttempt.findMany({
      where: {
        userId,
        status: 'completed',
      },
      orderBy: {
        completedAt: 'desc',
      },
      take: 5,
      include: {
        task: {
          select: {
            title: true,
            jlptLevel: true,
          },
        },
      },
    });

    // Get recent card reviews
    const recentReviews = await prisma.cardReview.findMany({
      where: {
        userId,
      },
      orderBy: {
        reviewedAt: 'desc',
      },
      take: 5,
      include: {
        card: {
          select: {
            front: true,
            deck: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    });

    // Combine and sort activities
    const activities = [
      ...recentTasks.map(attempt => ({
        type: 'task_complete' as const,
        data: {
          title: attempt.task.title,
          jlptLevel: attempt.task.jlptLevel,
          score: attempt.score,
        },
        timestamp: attempt.completedAt || attempt.createdAt,
      })),
      ...recentReviews.map(review => ({
        type: 'cards_learned' as const,
        data: {
          word: review.card.front,
          deckName: review.card.deck.name,
          quality: review.quality,
        },
        timestamp: review.reviewedAt,
      })),
    ]
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, 10);

    return NextResponse.json(activities);
  } catch (error) {
    console.error('Error fetching recent activity:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
