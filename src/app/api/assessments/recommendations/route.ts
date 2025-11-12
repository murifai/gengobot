import { NextRequest, NextResponse } from 'next/server';
import { TaskRecommendationService } from '@/lib/ai/task-recommendation-service';
import { TaskAssessmentService } from '@/lib/ai/task-assessment-service';
import { prisma } from '@/lib/prisma';
import { TaskAssessment } from '@/types/assessment';

// GET /api/assessments/recommendations - Get task recommendations
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const type = searchParams.get('type') || 'personalized';
    const limit = parseInt(searchParams.get('limit') || '5');

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

    const completedTaskIds = (user.completedTasks as string[]) || [];
    const currentLevel = user.proficiency;

    // Get recent assessments
    const recentAttempts = await prisma.taskAttempt.findMany({
      where: {
        userId,
        isCompleted: true,
      },
      orderBy: {
        endTime: 'desc',
      },
      take: 10,
    });

    // Convert to TaskAssessment format
    // Note: Since Phase 6, we store SimplifiedAssessment in feedback field
    // For recommendations, we use placeholder values as the old assessment fields were removed
    const recentAssessments: TaskAssessment[] = recentAttempts.map(attempt => {
      // Try to parse SimplifiedAssessment from feedback if available
      let objectivesAchieved = 0;
      let totalObjectives = 1;
      try {
        if (attempt.feedback) {
          const simplified = JSON.parse(attempt.feedback);
          objectivesAchieved = simplified.objectivesAchieved || 0;
          totalObjectives = simplified.totalObjectives || 1;
        }
      } catch (e) {
        // Ignore parse errors, use defaults
      }

      // Calculate approximate scores based on objective completion rate
      const completionRate =
        totalObjectives > 0 ? (objectivesAchieved / totalObjectives) * 100 : 50;

      return {
        taskId: attempt.taskId,
        attemptId: attempt.id,
        taskAchievement: completionRate,
        fluency: completionRate,
        vocabularyGrammarAccuracy: completionRate,
        politeness: completionRate,
        objectiveCompletion: {},
        overallScore: completionRate,
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
        timeToComplete: attempt.completionDuration || 0,
        retryRecommendation: false,
        estimatedJLPTLevel: currentLevel,
        progressToNextLevel: 0,
        assessmentDate: attempt.endTime || new Date(),
        conversationTurns: 0,
        totalMessages: attempt.totalMessages || 0,
      };
    });

    // Calculate skill gaps
    const { averageScores } = TaskAssessmentService.calculateProgressMetrics(recentAssessments);

    const skillGaps = {
      weakestAreas: [
        {
          category: 'Task Completion',
          score: averageScores.taskAchievement,
          examples: [],
          recommendedTasks: [],
        },
        {
          category: 'Fluency',
          score: averageScores.fluency,
          examples: [],
          recommendedTasks: [],
        },
      ].sort((a, b) => a.score - b.score),
      strongestAreas: [
        {
          category: 'Vocabulary & Grammar',
          score: averageScores.vocabularyGrammarAccuracy,
          examples: [],
        },
        {
          category: 'Politeness',
          score: averageScores.politeness,
          examples: [],
        },
      ].sort((a, b) => b.score - a.score),
      overallProgress: {
        taskAchievement: averageScores.taskAchievement,
        fluency: averageScores.fluency,
        vocabularyGrammar: averageScores.vocabularyGrammarAccuracy,
        politeness: averageScores.politeness,
      },
    };

    let recommendations;

    switch (type) {
      case 'personalized':
        recommendations = await TaskRecommendationService.getRecommendedTasks(
          {
            userId,
            currentJLPTLevel: currentLevel,
            recentAssessments,
            skillGaps,
            completedTaskIds,
          },
          limit
        );
        break;

      case 'progressive':
        recommendations = await TaskRecommendationService.getProgressiveTasks(
          userId,
          currentLevel,
          completedTaskIds
        );
        break;

      case 'daily':
        const daily = await TaskRecommendationService.getDailyRecommendation(
          userId,
          currentLevel,
          completedTaskIds
        );
        recommendations = daily ? [daily] : [];
        break;

      default:
        recommendations = await TaskRecommendationService.getRecommendedTasks(
          {
            userId,
            currentJLPTLevel: currentLevel,
            recentAssessments,
            skillGaps,
            completedTaskIds,
          },
          limit
        );
    }

    return NextResponse.json({ recommendations });
  } catch (error) {
    console.error('Error getting recommendations:', error);
    return NextResponse.json({ error: 'Failed to get recommendations' }, { status: 500 });
  }
}
