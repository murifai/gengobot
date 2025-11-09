// API route for task retry functionality
// Phase 3.2: Task-Based Chat Development

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * POST /api/task-attempts/[attemptId]/retry
 * Create a new attempt for the same task (retry)
 * Increments retry count and preserves learning history
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ attemptId: string }> }
) {
  try {
    const { attemptId } = await params;

    // Get the original attempt
    const originalAttempt = await prisma.taskAttempt.findUnique({
      where: { id: attemptId },
      include: {
        task: true,
        user: true,
      },
    });

    if (!originalAttempt) {
      return NextResponse.json({ error: 'Original task attempt not found' }, { status: 404 });
    }

    // Only allow retry of completed attempts
    if (!originalAttempt.isCompleted) {
      return NextResponse.json(
        { error: 'Can only retry completed attempts. Resume incomplete attempts instead.' },
        { status: 400 }
      );
    }

    // Check if task is still active
    if (!originalAttempt.task.isActive) {
      return NextResponse.json({ error: 'Task is no longer active' }, { status: 400 });
    }

    // Calculate retry count (count all attempts for this user/task combination)
    const previousAttempts = await prisma.taskAttempt.count({
      where: {
        userId: originalAttempt.userId,
        taskId: originalAttempt.taskId,
      },
    });

    // Create new retry attempt
    const retryAttempt = await prisma.taskAttempt.create({
      data: {
        userId: originalAttempt.userId,
        taskId: originalAttempt.taskId,
        retryCount: previousAttempts, // Total number of previous attempts
        conversationHistory: {
          messages: [],
          startedAt: new Date().toISOString(),
          isRetry: true,
          previousAttemptId: attemptId,
          previousScore: originalAttempt.overallScore,
        },
      },
      include: {
        task: {
          select: {
            id: true,
            title: true,
            description: true,
            category: true,
            difficulty: true,
            scenario: true,
            learningObjectives: true,
            conversationExample: true,
            estimatedDuration: true,
            character: true,
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            proficiency: true,
          },
        },
      },
    });

    // Update user's current task
    await prisma.user.update({
      where: { id: originalAttempt.userId },
      data: {
        currentTaskId: originalAttempt.taskId,
      },
    });

    // Calculate improvement potential
    const improvementAreas: string[] = [];
    if (originalAttempt.taskAchievement && originalAttempt.taskAchievement < 80) {
      improvementAreas.push('Task Achievement');
    }
    if (originalAttempt.fluency && originalAttempt.fluency < 80) {
      improvementAreas.push('Fluency');
    }
    if (
      originalAttempt.vocabularyGrammarAccuracy &&
      originalAttempt.vocabularyGrammarAccuracy < 80
    ) {
      improvementAreas.push('Vocabulary & Grammar');
    }
    if (originalAttempt.politeness && originalAttempt.politeness < 80) {
      improvementAreas.push('Politeness');
    }

    return NextResponse.json({
      attempt: retryAttempt,
      retryContext: {
        attemptNumber: previousAttempts + 1,
        previousScore: originalAttempt.overallScore,
        previousFeedback: originalAttempt.feedback,
        improvementAreas,
        targetScore: Math.min(100, (originalAttempt.overallScore || 0) + 15),
      },
      message: `Starting retry attempt #${previousAttempts + 1}`,
    });
  } catch (error) {
    console.error('Error creating retry attempt:', error);
    return NextResponse.json({ error: 'Failed to create retry attempt' }, { status: 500 });
  }
}

/**
 * GET /api/task-attempts/[attemptId]/retry
 * Get retry statistics and suggestions for a completed attempt
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ attemptId: string }> }
) {
  try {
    const { attemptId } = await params;

    const attempt = await prisma.taskAttempt.findUnique({
      where: { id: attemptId },
      include: {
        task: true,
      },
    });

    if (!attempt) {
      return NextResponse.json({ error: 'Task attempt not found' }, { status: 404 });
    }

    if (!attempt.isCompleted) {
      return NextResponse.json({ error: 'Task attempt not completed yet' }, { status: 400 });
    }

    // Get all attempts for this task by this user
    const allAttempts = await prisma.taskAttempt.findMany({
      where: {
        userId: attempt.userId,
        taskId: attempt.taskId,
      },
      orderBy: { startTime: 'asc' },
    });

    // Calculate retry statistics
    const completedAttempts = allAttempts.filter(a => a.isCompleted);
    const retryCount = allAttempts.length - 1; // Exclude first attempt

    // Calculate score progression
    const scoreProgression = completedAttempts.map((a, index) => ({
      attemptNumber: index + 1,
      overallScore: a.overallScore || 0,
      taskAchievement: a.taskAchievement || 0,
      fluency: a.fluency || 0,
      vocabularyGrammarAccuracy: a.vocabularyGrammarAccuracy || 0,
      politeness: a.politeness || 0,
      date: a.endTime,
    }));

    // Calculate improvement trends
    const firstScore = completedAttempts[0]?.overallScore || 0;
    const lastScore = completedAttempts[completedAttempts.length - 1]?.overallScore || 0;
    const totalImprovement = lastScore - firstScore;

    // Determine retry recommendation
    const shouldRetry =
      attempt.overallScore !== null && attempt.overallScore < 85 && retryCount < 3;

    const retryRecommendation = shouldRetry
      ? {
          recommended: true,
          reason:
            attempt.overallScore! < 70
              ? 'Significant room for improvement. Retry recommended to master the material.'
              : 'Good progress! One more attempt could help you achieve mastery.',
          focusAreas: getFocusAreas(attempt),
        }
      : {
          recommended: false,
          reason:
            attempt.overallScore! >= 85
              ? "Excellent performance! You've mastered this task."
              : retryCount >= 3
                ? "You've practiced this task multiple times. Consider trying a different task."
                : 'Task completed successfully.',
          focusAreas: [],
        };

    return NextResponse.json({
      statistics: {
        totalAttempts: allAttempts.length,
        completedAttempts: completedAttempts.length,
        retryCount,
        currentScore: attempt.overallScore,
        firstScore,
        bestScore: Math.max(...completedAttempts.map(a => a.overallScore || 0)),
        averageScore:
          completedAttempts.reduce((sum, a) => sum + (a.overallScore || 0), 0) /
          completedAttempts.length,
        totalImprovement,
      },
      progression: scoreProgression,
      recommendation: retryRecommendation,
      insights: {
        strengthAreas: getStrengthAreas(attempt),
        improvementNeeded: getFocusAreas(attempt),
        progressTrend:
          totalImprovement > 10
            ? 'Improving'
            : totalImprovement > 0
              ? 'Slight improvement'
              : 'Stable',
      },
    });
  } catch (error) {
    console.error('Error getting retry statistics:', error);
    return NextResponse.json({ error: 'Failed to get retry statistics' }, { status: 500 });
  }
}

// Helper: Identify focus areas for improvement
function getFocusAreas(attempt: {
  taskAchievement: number | null;
  fluency: number | null;
  vocabularyGrammarAccuracy: number | null;
  politeness: number | null;
}): string[] {
  const areas: string[] = [];
  if (attempt.taskAchievement !== null && attempt.taskAchievement < 75) {
    areas.push('Task Achievement - Focus on completing all objectives');
  }
  if (attempt.fluency !== null && attempt.fluency < 75) {
    areas.push('Fluency - Practice speaking more naturally');
  }
  if (attempt.vocabularyGrammarAccuracy !== null && attempt.vocabularyGrammarAccuracy < 75) {
    areas.push('Vocabulary & Grammar - Review grammar patterns and vocabulary');
  }
  if (attempt.politeness !== null && attempt.politeness < 75) {
    areas.push('Politeness - Use more appropriate politeness levels');
  }
  return areas;
}

// Helper: Identify strength areas
function getStrengthAreas(attempt: {
  taskAchievement: number | null;
  fluency: number | null;
  vocabularyGrammarAccuracy: number | null;
  politeness: number | null;
}): string[] {
  const areas: string[] = [];
  if (attempt.taskAchievement !== null && attempt.taskAchievement >= 85) {
    areas.push('Task Achievement');
  }
  if (attempt.fluency !== null && attempt.fluency >= 85) {
    areas.push('Fluency');
  }
  if (attempt.vocabularyGrammarAccuracy !== null && attempt.vocabularyGrammarAccuracy >= 85) {
    areas.push('Vocabulary & Grammar');
  }
  if (attempt.politeness !== null && attempt.politeness >= 85) {
    areas.push('Politeness');
  }
  return areas;
}
