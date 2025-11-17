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

    // Get total minutes from task attempts and chat sessions
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    // Get task attempt data
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

    // Calculate total minutes and session count
    let totalMinutes = 0;
    const sessionsCount = taskAttempts.length;

    taskAttempts.forEach(attempt => {
      if (attempt.endTime && attempt.startTime) {
        const duration = attempt.endTime.getTime() - attempt.startTime.getTime();
        totalMinutes += Math.floor(duration / 1000 / 60);
      }
    });

    // Get weekly breakdown (last 7 days)
    const weeklyBreakdown = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);

      const nextDay = new Date(date);
      nextDay.setDate(nextDay.getDate() + 1);

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

      return {
        date: date.toISOString().split('T')[0],
        minutes: minutesForDay,
      };
    }).reverse();

    return NextResponse.json({
      totalMinutes,
      sessionsCount,
      weeklyBreakdown,
    });
  } catch (error) {
    console.error('Error fetching Kaiwa stats:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
