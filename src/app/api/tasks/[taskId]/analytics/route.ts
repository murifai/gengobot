import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/tasks/[taskId]/analytics - Get analytics for a specific task
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ taskId: string }> }
) {
  try {
    const { taskId } = await params;

    // Check if task exists
    const task = await prisma.task.findUnique({
      where: { id: taskId },
      select: {
        id: true,
        title: true,
        category: true,
        difficulty: true,
        usageCount: true,
        averageScore: true,
      },
    });

    if (!task) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    // Get all task attempts
    const attempts = await prisma.taskAttempt.findMany({
      where: {
        taskId: taskId,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            proficiency: true,
          },
        },
      },
      orderBy: {
        startTime: 'desc',
      },
    });

    // Calculate statistics
    const totalAttempts = attempts.length;
    const completedAttempts = attempts.filter(a => a.isCompleted).length;
    const completionRate = totalAttempts > 0 ? (completedAttempts / totalAttempts) * 100 : 0;

    // Calculate average completion rates (Phase 6 - Simplified Assessment)
    const completedAttemptsWithAssessments = attempts.filter(a => a.isCompleted && a.feedback);

    let averageCompletionRate = 0;
    let averageObjectivesAchieved = 0;
    let totalObjectives = 0;

    if (completedAttemptsWithAssessments.length > 0) {
      const assessmentData = completedAttemptsWithAssessments.map(attempt => {
        try {
          const assessment = JSON.parse(attempt.feedback || '{}');
          return {
            completionRate: assessment?.statistics?.completionRate || 0,
            objectivesAchieved: assessment?.objectivesAchieved || 0,
            totalObjectives: assessment?.totalObjectives || 0,
          };
        } catch {
          return { completionRate: 0, objectivesAchieved: 0, totalObjectives: 0 };
        }
      });

      averageCompletionRate =
        assessmentData.reduce((sum, data) => sum + data.completionRate, 0) / assessmentData.length;
      averageObjectivesAchieved =
        assessmentData.reduce((sum, data) => sum + data.objectivesAchieved, 0) /
        assessmentData.length;
      totalObjectives = assessmentData[0]?.totalObjectives || 0;
    }

    // Calculate average completion time
    const completedAttemptsWithTime = attempts.filter(a => a.isCompleted && a.endTime !== null);

    let averageCompletionTime = 0;
    if (completedAttemptsWithTime.length > 0) {
      const totalTime = completedAttemptsWithTime.reduce((acc, attempt) => {
        const duration =
          new Date(attempt.endTime!).getTime() - new Date(attempt.startTime).getTime();
        return acc + duration;
      }, 0);

      averageCompletionTime = Math.round(totalTime / completedAttemptsWithTime.length / 60000); // Convert to minutes
    }

    // Calculate retry statistics
    const uniqueUsers = new Set(attempts.map(a => a.userId)).size;
    const attemptsWithRetries = attempts.filter(a => a.retryCount > 0).length;
    const averageRetries =
      attempts.reduce((acc, a) => acc + a.retryCount, 0) / (totalAttempts || 1);

    // Group attempts by user proficiency level
    const attemptsByProficiency: Record<string, number> = {};
    attempts.forEach(attempt => {
      const level = attempt.user.proficiency;
      attemptsByProficiency[level] = (attemptsByProficiency[level] || 0) + 1;
    });

    // Get recent attempts (Phase 6 - Simplified Assessment)
    const recentAttempts = attempts.slice(0, 10).map(attempt => {
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
        userId: attempt.userId,
        userName: attempt.user.name,
        userProficiency: attempt.user.proficiency,
        startTime: attempt.startTime,
        endTime: attempt.endTime,
        isCompleted: attempt.isCompleted,
        completionRate,
        retryCount: attempt.retryCount,
      };
    });

    // Calculate performance trend (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentCompletedAttempts = attempts.filter(
      a => a.isCompleted && new Date(a.startTime) >= thirtyDaysAgo
    );

    const performanceTrend = calculatePerformanceTrend(recentCompletedAttempts);

    return NextResponse.json({
      task,
      statistics: {
        totalAttempts,
        completedAttempts,
        completionRate: Math.round(completionRate * 10) / 10,
        uniqueUsers,
        averageCompletionTime,
        attemptsWithRetries,
        averageRetries: Math.round(averageRetries * 10) / 10,
        // Phase 6 - Simplified metrics
        averageCompletionRate: Math.round(averageCompletionRate * 10) / 10,
        averageObjectivesAchieved: Math.round(averageObjectivesAchieved * 10) / 10,
        totalObjectives,
      },
      attemptsByProficiency,
      recentAttempts,
      performanceTrend,
    });
  } catch (error) {
    console.error('Error fetching task analytics:', error);
    return NextResponse.json({ error: 'Failed to fetch task analytics' }, { status: 500 });
  }
}

// Helper function to calculate performance trend (Phase 6 - Simplified Assessment)
function calculatePerformanceTrend(attempts: { startTime: Date; feedback: string | null }[]) {
  if (attempts.length === 0) return [];

  // Group by week
  const weeklyData: Record<string, { completionRates: number[]; count: number; week: string }> = {};

  attempts.forEach(attempt => {
    let completionRate = 0;
    try {
      if (attempt.feedback) {
        const assessment = JSON.parse(attempt.feedback);
        completionRate = assessment?.statistics?.completionRate || 0;
      }
    } catch {
      return;
    }

    const date = new Date(attempt.startTime);
    const weekStart = new Date(date);
    weekStart.setDate(date.getDate() - date.getDay()); // Start of week (Sunday)
    const weekKey = weekStart.toISOString().split('T')[0];

    if (!weeklyData[weekKey]) {
      weeklyData[weekKey] = {
        completionRates: [],
        count: 0,
        week: weekKey,
      };
    }

    weeklyData[weekKey].completionRates.push(completionRate);
    weeklyData[weekKey].count++;
  });

  // Calculate weekly averages
  return Object.values(weeklyData)
    .map(week => ({
      week: week.week,
      averageCompletionRate:
        Math.round((week.completionRates.reduce((a, b) => a + b, 0) / week.count) * 10) / 10,
      attemptCount: week.count,
    }))
    .sort((a, b) => a.week.localeCompare(b.week));
}
