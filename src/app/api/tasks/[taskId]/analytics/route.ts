import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

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

    // Calculate average scores for each criterion
    const completedAttemptsWithScores = attempts.filter(
      a => a.isCompleted && a.overallScore !== null
    );

    const averageScores = {
      taskAchievement: 0,
      fluency: 0,
      vocabularyGrammarAccuracy: 0,
      politeness: 0,
      overall: 0,
    };

    if (completedAttemptsWithScores.length > 0) {
      const sums = completedAttemptsWithScores.reduce(
        (acc, attempt) => ({
          taskAchievement: acc.taskAchievement + (attempt.taskAchievement || 0),
          fluency: acc.fluency + (attempt.fluency || 0),
          vocabularyGrammarAccuracy:
            acc.vocabularyGrammarAccuracy + (attempt.vocabularyGrammarAccuracy || 0),
          politeness: acc.politeness + (attempt.politeness || 0),
          overall: acc.overall + (attempt.overallScore || 0),
        }),
        {
          taskAchievement: 0,
          fluency: 0,
          vocabularyGrammarAccuracy: 0,
          politeness: 0,
          overall: 0,
        }
      );

      const count = completedAttemptsWithScores.length;
      averageScores.taskAchievement = Math.round((sums.taskAchievement / count) * 10) / 10;
      averageScores.fluency = Math.round((sums.fluency / count) * 10) / 10;
      averageScores.vocabularyGrammarAccuracy =
        Math.round((sums.vocabularyGrammarAccuracy / count) * 10) / 10;
      averageScores.politeness = Math.round((sums.politeness / count) * 10) / 10;
      averageScores.overall = Math.round((sums.overall / count) * 10) / 10;
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

    // Get recent attempts
    const recentAttempts = attempts.slice(0, 10).map(attempt => ({
      id: attempt.id,
      userId: attempt.userId,
      userName: attempt.user.name,
      userProficiency: attempt.user.proficiency,
      startTime: attempt.startTime,
      endTime: attempt.endTime,
      isCompleted: attempt.isCompleted,
      overallScore: attempt.overallScore,
      retryCount: attempt.retryCount,
    }));

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
      },
      averageScores,
      attemptsByProficiency,
      recentAttempts,
      performanceTrend,
    });
  } catch (error) {
    console.error('Error fetching task analytics:', error);
    return NextResponse.json({ error: 'Failed to fetch task analytics' }, { status: 500 });
  }
}

// Helper function to calculate performance trend
function calculatePerformanceTrend(attempts: { startTime: Date; overallScore: number | null }[]) {
  if (attempts.length === 0) return [];

  // Group by week
  const weeklyData: Record<string, { scores: number[]; count: number; week: string }> = {};

  attempts.forEach(attempt => {
    if (attempt.overallScore === null) return;

    const date = new Date(attempt.startTime);
    const weekStart = new Date(date);
    weekStart.setDate(date.getDate() - date.getDay()); // Start of week (Sunday)
    const weekKey = weekStart.toISOString().split('T')[0];

    if (!weeklyData[weekKey]) {
      weeklyData[weekKey] = {
        scores: [],
        count: 0,
        week: weekKey,
      };
    }

    weeklyData[weekKey].scores.push(attempt.overallScore);
    weeklyData[weekKey].count++;
  });

  // Calculate weekly averages
  return Object.values(weeklyData)
    .map(week => ({
      week: week.week,
      averageScore: Math.round((week.scores.reduce((a, b) => a + b, 0) / week.count) * 10) / 10,
      attemptCount: week.count,
    }))
    .sort((a, b) => a.week.localeCompare(b.week));
}
