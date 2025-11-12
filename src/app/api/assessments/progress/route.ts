import { NextRequest, NextResponse } from 'next/server';
import { TaskAssessmentService } from '@/lib/ai/task-assessment-service';
import { prisma } from '@/lib/prisma';
import { TaskAssessment, ProgressMetrics } from '@/types/assessment';

// GET /api/assessments/progress - Get user progress metrics
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const period = (searchParams.get('period') || 'all') as 'week' | 'month' | 'all';

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    // Get user data
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Calculate date range
    let startDate = new Date(0); // Beginning of time
    const now = new Date();

    if (period === 'week') {
      startDate = new Date(now);
      startDate.setDate(startDate.getDate() - 7);
    } else if (period === 'month') {
      startDate = new Date(now);
      startDate.setMonth(startDate.getMonth() - 1);
    }

    // Get task attempts in period
    const attempts = await prisma.taskAttempt.findMany({
      where: {
        userId,
        isCompleted: true,
        endTime: {
          gte: startDate,
        },
      },
      orderBy: {
        endTime: 'asc',
      },
    });

    // Convert to TaskAssessment format
    // NOTE: This uses the old assessment format which has been deprecated in Phase 1-6 of Task Feedback System
    // The scoring fields have been removed from TaskAttempt schema
    // TODO: Migrate this to use the new SimplifiedAssessment format
    const assessments: TaskAssessment[] = attempts.map(attempt => ({
      taskId: attempt.taskId,
      attemptId: attempt.id,
      taskAchievement: 0, // Removed field - deprecated
      fluency: 0, // Removed field - deprecated
      vocabularyGrammarAccuracy: 0, // Removed field - deprecated
      politeness: 0, // Removed field - deprecated
      objectiveCompletion: {},
      overallScore: 0, // Removed field - deprecated
      feedback: attempt.feedback || '',
      specificFeedback: {
        taskAchievement: '',
        fluency: '',
        vocabularyGrammar: '',
        politeness: '',
      },
      areasForImprovement: [],
      strengths: [],
      recommendedNextTasks: [],
      timeToComplete: 0,
      retryRecommendation: false,
      estimatedJLPTLevel: user.proficiency,
      progressToNextLevel: 0,
      assessmentDate: attempt.endTime || new Date(),
      conversationTurns: 0,
      totalMessages: 0,
    }));

    // Calculate progress metrics
    const { averageScores, trend } = TaskAssessmentService.calculateProgressMetrics(assessments);

    // Calculate improvement trend
    const improvementTrend = calculateImprovementTrend(assessments, period);

    // Calculate JLPT progress
    const currentLevel = user.proficiency;
    const levels = ['N5', 'N4', 'N3', 'N2', 'N1'];
    const currentIndex = levels.indexOf(currentLevel);
    const nextLevel = currentIndex < levels.length - 1 ? levels[currentIndex + 1] : currentLevel;

    // Estimate progress to next level based on average scores
    const progressPercentage = Math.min(100, Math.round(averageScores.overall * 0.8));
    const estimatedHours = Math.max(10, Math.round((100 - progressPercentage) * 0.5));

    const progressMetrics: ProgressMetrics = {
      userId,
      totalTasksAttempted: await prisma.taskAttempt.count({
        where: { userId },
      }),
      totalTasksCompleted: await prisma.taskAttempt.count({
        where: { userId, isCompleted: true },
      }),
      averageScores,
      improvementTrend,
      currentJLPTLevel: currentLevel,
      nextMilestone: {
        level: nextLevel,
        progressPercentage,
        estimatedTime: estimatedHours,
      },
    };

    return NextResponse.json({
      progress: progressMetrics,
      trend,
      recentAssessments: assessments.slice(-5),
    });
  } catch (error) {
    console.error('Error calculating progress:', error);
    return NextResponse.json({ error: 'Failed to calculate progress' }, { status: 500 });
  }
}

/**
 * Calculate improvement trend over time
 */
function calculateImprovementTrend(
  assessments: TaskAssessment[],
  period: 'week' | 'month' | 'all'
): {
  period: 'week' | 'month' | 'all';
  taskAchievement: number;
  fluency: number;
  vocabularyGrammarAccuracy: number;
  politeness: number;
} {
  if (assessments.length < 2) {
    return {
      period,
      taskAchievement: 0,
      fluency: 0,
      vocabularyGrammarAccuracy: 0,
      politeness: 0,
    };
  }

  // Compare first 20% with last 20%
  const segmentSize = Math.max(1, Math.floor(assessments.length * 0.2));
  const firstSegment = assessments.slice(0, segmentSize);
  const lastSegment = assessments.slice(-segmentSize);

  const firstAvg = {
    taskAchievement:
      firstSegment.reduce((sum, a) => sum + a.taskAchievement, 0) / firstSegment.length,
    fluency: firstSegment.reduce((sum, a) => sum + a.fluency, 0) / firstSegment.length,
    vocabularyGrammarAccuracy:
      firstSegment.reduce((sum, a) => sum + a.vocabularyGrammarAccuracy, 0) / firstSegment.length,
    politeness: firstSegment.reduce((sum, a) => sum + a.politeness, 0) / firstSegment.length,
  };

  const lastAvg = {
    taskAchievement:
      lastSegment.reduce((sum, a) => sum + a.taskAchievement, 0) / lastSegment.length,
    fluency: lastSegment.reduce((sum, a) => sum + a.fluency, 0) / lastSegment.length,
    vocabularyGrammarAccuracy:
      lastSegment.reduce((sum, a) => sum + a.vocabularyGrammarAccuracy, 0) / lastSegment.length,
    politeness: lastSegment.reduce((sum, a) => sum + a.politeness, 0) / lastSegment.length,
  };

  return {
    period,
    taskAchievement: Math.round(
      ((lastAvg.taskAchievement - firstAvg.taskAchievement) / firstAvg.taskAchievement) * 100
    ),
    fluency: Math.round(((lastAvg.fluency - firstAvg.fluency) / firstAvg.fluency) * 100),
    vocabularyGrammarAccuracy: Math.round(
      ((lastAvg.vocabularyGrammarAccuracy - firstAvg.vocabularyGrammarAccuracy) /
        firstAvg.vocabularyGrammarAccuracy) *
        100
    ),
    politeness: Math.round(
      ((lastAvg.politeness - firstAvg.politeness) / firstAvg.politeness) * 100
    ),
  };
}
