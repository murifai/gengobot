import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAdminSession } from '@/lib/auth/admin-auth';

export async function GET() {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const [taskStats, freeConversationStats, deckStats, totalAttempts, completedAttempts] =
      await Promise.all([
        // Task statistics with aggregated metrics
        prisma.task.findMany({
          select: {
            id: true,
            title: true,
            category: true,
            difficulty: true,
            usageCount: true,
            averageScore: true,
            _count: {
              select: {
                taskAttempts: true,
              },
            },
            taskAttempts: {
              select: {
                isCompleted: true,
                completionDuration: true,
              },
            },
          },
          orderBy: { usageCount: 'desc' },
          take: 100,
        }),

        // Free conversation statistics
        prisma.freeConversation.count(),

        // Deck statistics
        prisma.deck.findMany({
          select: {
            id: true,
            name: true,
            isPublic: true,
            createdBy: true,
            totalCards: true,
            _count: {
              select: {
                flashcards: true,
                studySessions: true,
              },
            },
          },
          orderBy: {
            studySessions: {
              _count: 'desc',
            },
          },
          take: 100,
        }),

        // Total task attempts
        prisma.taskAttempt.count(),

        // Completed task attempts
        prisma.taskAttempt.count({
          where: { isCompleted: true },
        }),
      ]);

    // Transform task stats
    const roleplayStats = taskStats.map(task => {
      const completions = task.taskAttempts.filter(a => a.isCompleted).length;
      const durations = task.taskAttempts
        .filter(a => a.completionDuration)
        .map(a => a.completionDuration!);
      const avgDuration =
        durations.length > 0
          ? Math.round(durations.reduce((a, b) => a + b, 0) / durations.length / 60)
          : 0;

      return {
        taskId: task.id,
        taskTitle: task.title,
        category: task.category,
        difficulty: task.difficulty,
        totalAttempts: task._count.taskAttempts,
        completions,
        completionRate:
          task._count.taskAttempts > 0
            ? ((completions / task._count.taskAttempts) * 100).toFixed(1)
            : '0',
        avgDuration,
        avgScore: task.averageScore?.toFixed(1) || '0',
      };
    });

    // Transform deck stats
    const deckStatsFormatted = deckStats.map(deck => ({
      deckId: deck.id,
      deckName: deck.name,
      creatorType: deck.createdBy ? 'User' : 'Admin',
      isPublic: deck.isPublic,
      cardCount: deck.totalCards || deck._count.flashcards,
      studySessions: deck._count.studySessions,
    }));

    // Separate admin and user decks
    const adminDecks = deckStatsFormatted.filter(d => d.creatorType === 'Admin');
    const userDecks = deckStatsFormatted.filter(d => d.creatorType === 'User');

    return NextResponse.json({
      roleplay: {
        tasks: roleplayStats,
        summary: {
          totalTasks: taskStats.length,
          totalAttempts,
          completedAttempts,
          completionRate:
            totalAttempts > 0 ? ((completedAttempts / totalAttempts) * 100).toFixed(1) : '0',
        },
      },
      freeChat: {
        totalConversations: freeConversationStats,
        avgMessages: '0', // FreeConversation stores messages in JSON, would need to calculate separately
      },
      decks: {
        all: deckStatsFormatted,
        admin: adminDecks,
        user: userDecks,
        summary: {
          totalDecks: deckStats.length,
          adminDecks: adminDecks.length,
          userDecks: userDecks.length,
          totalSessions: deckStatsFormatted.reduce((sum, d) => sum + d.studySessions, 0),
        },
      },
    });
  } catch (error) {
    console.error('Practice analytics error:', error);
    return NextResponse.json({ error: 'Failed to fetch practice analytics' }, { status: 500 });
  }
}
