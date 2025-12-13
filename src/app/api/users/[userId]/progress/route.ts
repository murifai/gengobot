import { NextRequest, NextResponse } from 'next/server';
import { getCurrentSessionUser } from '@/lib/auth/session';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const sessionUser = await getCurrentSessionUser();

    if (!sessionUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { userId } = await params;

    // Verify user can access this data
    const dbUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { email: true },
    });

    if (!dbUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check if requesting user is an admin by looking up in Admin table
    const isRequestingAdmin = await prisma.admin.findUnique({
      where: { email: sessionUser.email! },
    });

    if (!isRequestingAdmin && dbUser.email !== sessionUser.email) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Get task attempts statistics
    const attempts = await prisma.taskAttempt.findMany({
      where: { userId },
      include: {
        task: {
          select: {
            title: true,
          },
        },
      },
      orderBy: {
        startTime: 'desc',
      },
    });

    const completedAttempts = attempts.filter(a => a.isCompleted);
    const totalAttempts = attempts.length;
    const completedTasks = completedAttempts.length;

    // Calculate average completion rate (Phase 6 - Simplified Assessment)
    const completionRates = completedAttempts.map(attempt => {
      try {
        if (attempt.feedback) {
          const assessment = JSON.parse(attempt.feedback);
          return assessment?.statistics?.completionRate || 0;
        }
      } catch {
        // Ignore parse errors
      }
      return 0;
    });

    const averageCompletionRate =
      completionRates.length > 0
        ? completionRates.reduce((sum, rate) => sum + rate, 0) / completionRates.length
        : 0;

    // Get recent attempts (last 10) with completion rates
    const recentAttempts = completedAttempts.slice(0, 10).map(attempt => {
      let completionRate = 0;
      try {
        if (attempt.feedback) {
          const assessment = JSON.parse(attempt.feedback);
          completionRate = assessment?.statistics?.completionRate || 0;
        }
      } catch {
        // Ignore parse errors
      }

      return {
        id: attempt.id,
        taskTitle: attempt.task.title,
        completionRate,
        completedAt: attempt.endTime?.toISOString() || attempt.startTime.toISOString(),
      };
    });

    return NextResponse.json({
      totalAttempts,
      completedTasks,
      averageCompletionRate: Math.round(averageCompletionRate * 10) / 10,
      recentAttempts,
    });
  } catch (error) {
    console.error('Error fetching user progress:', error);
    return NextResponse.json({ error: 'Failed to fetch progress' }, { status: 500 });
  }
}
