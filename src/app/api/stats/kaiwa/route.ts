import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth';
import { prisma } from '@/lib/prisma';
import {
  calculateActiveMinutes,
  calculateFreeConversationActiveMinutes,
  type ConversationHistory,
} from '@/lib/utils/active-time';

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

    // Get roleplay task attempts (TaskAttempt)
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
        conversationHistory: true,
      },
    });

    // Get free conversation sessions (Kaiwa Bebas)
    const freeConversations = await prisma.freeConversation.findMany({
      where: {
        userId,
        createdAt: {
          gte: sevenDaysAgo,
        },
      },
      select: {
        createdAt: true,
        conversationHistory: true,
        endTime: true,
      },
    });

    // Calculate roleplay stats with active minutes
    let roleplayTotalMinutes = 0;
    const roleplaySessionsCount = taskAttempts.length;

    taskAttempts.forEach(attempt => {
      // Calculate active minutes from conversation history
      const history = attempt.conversationHistory as ConversationHistory;
      roleplayTotalMinutes += calculateActiveMinutes(history);
    });

    // Calculate kaiwa bebas stats with active minutes
    let kaiwaBetasTotalMinutes = 0;
    const kaiwaBetasConversationsCount = freeConversations.length;
    let kaiwaBetasMessagesCount = 0;

    freeConversations.forEach(conv => {
      // Calculate active minutes from conversation history
      const history = conv.conversationHistory as { messages?: unknown[] };
      kaiwaBetasTotalMinutes += calculateFreeConversationActiveMinutes(
        history as { messages?: { role: string; content: string; timestamp: string }[] }
      );

      // Count messages
      kaiwaBetasMessagesCount += history?.messages?.length || 0;
    });

    // Get weekly breakdown for both types
    const weeklyBreakdown = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);

      const nextDay = new Date(date);
      nextDay.setDate(nextDay.getDate() + 1);

      // Roleplay attempts for this day
      const attemptsForDay = taskAttempts.filter(attempt => {
        const attemptDate = new Date(attempt.endTime || attempt.startTime);
        return attemptDate >= date && attemptDate < nextDay;
      });

      let roleplayMinutesForDay = 0;
      attemptsForDay.forEach(attempt => {
        const history = attempt.conversationHistory as ConversationHistory;
        roleplayMinutesForDay += calculateActiveMinutes(history);
      });

      // Free conversations for this day
      const freeConvsForDay = freeConversations.filter(conv => {
        const convDate = new Date(conv.createdAt);
        return convDate >= date && convDate < nextDay;
      });

      let kaiwaBetasMinutesForDay = 0;
      freeConvsForDay.forEach(conv => {
        const history = conv.conversationHistory as { messages?: unknown[] };
        kaiwaBetasMinutesForDay += calculateFreeConversationActiveMinutes(
          history as { messages?: { role: string; content: string; timestamp: string }[] }
        );
      });

      return {
        date: date.toISOString().split('T')[0],
        roleplayMinutes: roleplayMinutesForDay,
        kaiwaBetasMinutes: kaiwaBetasMinutesForDay,
        totalMinutes: roleplayMinutesForDay + kaiwaBetasMinutesForDay,
      };
    }).reverse();

    // Return separated stats for roleplay and kaiwa bebas
    return NextResponse.json({
      // Combined totals (for backwards compatibility)
      totalMinutes: roleplayTotalMinutes + kaiwaBetasTotalMinutes,
      sessionsCount: roleplaySessionsCount + kaiwaBetasConversationsCount,

      // Separated stats
      roleplay: {
        totalMinutes: roleplayTotalMinutes,
        sessionsCount: roleplaySessionsCount,
      },
      kaiwaBebas: {
        totalMinutes: kaiwaBetasTotalMinutes,
        conversationsCount: kaiwaBetasConversationsCount,
        messagesCount: kaiwaBetasMessagesCount,
      },

      // Weekly breakdown with both types
      weeklyBreakdown,
    });
  } catch (error) {
    console.error('Error fetching Kaiwa stats:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
