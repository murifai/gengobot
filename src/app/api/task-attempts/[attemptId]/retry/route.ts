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
          // Note: Phase 6 removed overallScore field, calculate from feedback if needed
          previousScore: null,
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

    // Parse previous feedback (Phase 6 - Simplified Assessment)
    let previousAssessment = null;
    let improvementAreas: string[] = [];
    let completionRate = 0;

    try {
      if (originalAttempt.feedback) {
        previousAssessment = JSON.parse(originalAttempt.feedback);
        completionRate = previousAssessment.statistics?.completionRate || 0;

        // Extract improvement areas from previous feedback
        if (previousAssessment.conversationFeedback?.areasToImprove) {
          improvementAreas = previousAssessment.conversationFeedback.areasToImprove.slice(0, 3);
        }
      }
    } catch (e) {
      console.error('Error parsing previous feedback:', e);
    }

    return NextResponse.json({
      attempt: retryAttempt,
      retryContext: {
        attemptNumber: previousAttempts + 1,
        previousCompletionRate: completionRate,
        previousFeedback: originalAttempt.feedback,
        improvementAreas,
        previousObjectivesAchieved: previousAssessment?.objectivesAchieved || 0,
        totalObjectives: previousAssessment?.totalObjectives || 0,
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

    // Calculate retry statistics (Phase 6 - Simplified Assessment)
    const completedAttempts = allAttempts.filter(a => a.isCompleted);
    const retryCount = allAttempts.length - 1; // Exclude first attempt

    // Parse assessment data for each completed attempt
    const assessmentData = completedAttempts.map((a, index) => {
      let assessment = null;
      try {
        if (a.feedback) {
          assessment = JSON.parse(a.feedback);
        }
      } catch (e) {
        console.error('Error parsing assessment:', e);
      }

      return {
        attemptNumber: index + 1,
        completionRate: assessment?.statistics?.completionRate || 0,
        objectivesAchieved: assessment?.objectivesAchieved || 0,
        totalObjectives: assessment?.totalObjectives || 0,
        duration: assessment?.statistics?.durationMinutes || 0,
        date: a.endTime,
      };
    });

    // Calculate improvement trends
    const firstRate = assessmentData[0]?.completionRate || 0;
    const lastRate = assessmentData[assessmentData.length - 1]?.completionRate || 0;
    const totalImprovement = lastRate - firstRate;

    // Parse current attempt assessment
    let currentAssessment = null;
    try {
      if (attempt.feedback) {
        currentAssessment = JSON.parse(attempt.feedback);
      }
    } catch (e) {
      console.error('Error parsing current assessment:', e);
    }

    const currentCompletionRate = currentAssessment?.statistics?.completionRate || 0;

    // Determine retry recommendation
    const shouldRetry = currentCompletionRate < 85 && retryCount < 3;

    const retryRecommendation = shouldRetry
      ? {
          recommended: true,
          reason:
            currentCompletionRate < 70
              ? 'Significant room for improvement. Retry recommended to master the material.'
              : 'Good progress! One more attempt could help you achieve mastery.',
          focusAreas: currentAssessment?.conversationFeedback?.areasToImprove || [],
        }
      : {
          recommended: false,
          reason:
            currentCompletionRate >= 85
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
        currentCompletionRate,
        firstRate,
        bestRate: Math.max(...assessmentData.map(a => a.completionRate)),
        averageRate:
          assessmentData.reduce((sum, a) => sum + a.completionRate, 0) / assessmentData.length || 0,
        totalImprovement,
      },
      progression: assessmentData,
      recommendation: retryRecommendation,
      insights: {
        strengthAreas: currentAssessment?.conversationFeedback?.strengths || [],
        improvementNeeded: currentAssessment?.conversationFeedback?.areasToImprove || [],
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

// Note: Helper functions removed in Phase 6 - Simplified Assessment
// Focus areas and strengths are now extracted directly from the AI-generated feedback
