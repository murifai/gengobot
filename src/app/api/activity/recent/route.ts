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
        isCompleted: true,
      },
      orderBy: {
        endTime: 'desc',
      },
      take: 5,
      include: {
        task: {
          select: {
            title: true,
            difficulty: true,
          },
        },
      },
    });

    // Get recent study sessions
    const recentSessions = await prisma.studySession.findMany({
      where: {
        userId,
      },
      orderBy: {
        startTime: 'desc',
      },
      take: 5,
      include: {
        deck: {
          select: {
            name: true,
          },
        },
      },
    });

    // Get recent free conversation sessions
    const recentFreeChats = await prisma.freeConversation.findMany({
      where: {
        userId,
      },
      orderBy: {
        updatedAt: 'desc',
      },
      take: 5,
      include: {
        character: {
          select: {
            name: true,
          },
        },
      },
    });

    // Combine and sort activities
    const activities = [
      ...recentTasks.map(attempt => ({
        type: 'roleplay' as const,
        data: {
          title: attempt.task.title,
          jlptLevel: attempt.task.difficulty,
          score: null,
        },
        timestamp: attempt.endTime || attempt.startTime,
      })),
      ...recentSessions.map(session => ({
        type: 'drill' as const,
        data: {
          deckName: session.deck.name,
          cardsReviewed: session.cardsReviewed || 0,
        },
        timestamp: session.startTime,
      })),
      ...recentFreeChats.map(chat => ({
        type: 'kaiwa_bebas' as const,
        data: {
          characterName: chat.character?.name || 'Karakter',
        },
        timestamp: chat.updatedAt,
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
