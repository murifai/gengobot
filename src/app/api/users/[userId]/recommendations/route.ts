// API route for personalized task recommendations
// Phase 3.2: Task-Based Chat Development

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// JLPT level hierarchy for progressive recommendations
const JLPT_LEVELS = ['N5', 'N4', 'N3', 'N2', 'N1'];
const LEVEL_INDEX: Record<string, number> = {
  N5: 0,
  N4: 1,
  N3: 2,
  N2: 3,
  N1: 4,
};

/**
 * GET /api/users/[userId]/recommendations
 * Get personalized task recommendations based on user progress
 * Query params:
 * - limit: Number of recommendations (default: 10)
 * - category: Filter by category
 * - includeReasons: Include recommendation reasoning
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params;
    const searchParams = request.nextUrl.searchParams;
    const limit = parseInt(searchParams.get('limit') || '10');
    const categoryFilter = searchParams.get('category');
    const includeReasons = searchParams.get('includeReasons') === 'true';

    // Get user with their history
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        taskAttempts: {
          where: { isCompleted: true },
          include: {
            task: true,
          },
          orderBy: { endTime: 'desc' },
          take: 20, // Last 20 completed attempts
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const completedTaskIds = (user.completedTasks as string[]) || [];
    const preferredCategories = (user.preferredTaskCategories as string[]) || [];

    // Calculate user's performance metrics
    const completedAttempts = user.taskAttempts.filter(a => a.isCompleted);
    // Calculate average completion rate (Phase 6 - Simplified Assessment)
    let averageCompletionRate = 0;

    if (completedAttempts.length > 0) {
      const completionRates = completedAttempts.map(attempt => {
        try {
          if (attempt.feedback) {
            const assessment = JSON.parse(attempt.feedback);
            return assessment?.statistics?.completionRate || 0;
          }
        } catch (e) {
          // Ignore parse errors
        }
        return 0;
      });

      averageCompletionRate =
        completionRates.reduce((sum, rate) => sum + rate, 0) / completionRates.length;
    }

    // Determine recommended difficulty level
    const currentLevelIndex = LEVEL_INDEX[user.proficiency] || 0;
    let recommendedLevel = user.proficiency;

    // If user is performing well (completion > 80%), suggest next level
    if (averageCompletionRate > 80 && currentLevelIndex < JLPT_LEVELS.length - 1) {
      recommendedLevel = JLPT_LEVELS[currentLevelIndex + 1];
    }
    // If struggling (completion < 60%), suggest easier tasks at same level
    else if (averageCompletionRate < 60 && completedAttempts.length > 3) {
      // Keep same level but focus on different categories
    }

    // Build recommendation query
    const where: Record<string, unknown> = {
      isActive: true,
      id: {
        notIn: completedTaskIds,
      },
    };

    // Filter by difficulty (current level and recommended level)
    const difficulties = [user.proficiency];
    if (recommendedLevel !== user.proficiency) {
      difficulties.push(recommendedLevel);
    }
    where.difficulty = { in: difficulties };

    // Apply category filter if provided
    if (categoryFilter) {
      where.category = categoryFilter;
    }

    // Get candidate tasks
    const candidateTasks = await prisma.task.findMany({
      where,
      include: {
        character: true,
        _count: {
          select: {
            taskAttempts: true,
          },
        },
      },
      take: limit * 3, // Get more than needed for scoring
    });

    // Score and rank tasks
    const scoredTasks = candidateTasks.map(task => {
      let score = 0;
      const reasons: string[] = [];

      // Preferred category bonus (+30 points)
      if (preferredCategories.includes(task.category)) {
        score += 30;
        reasons.push(`Matches your preferred category: ${task.category}`);
      }

      // Difficulty alignment (+25 points for recommended level)
      if (task.difficulty === recommendedLevel) {
        score += 25;
        reasons.push(`Recommended difficulty level: ${task.difficulty}`);
      } else if (task.difficulty === user.proficiency) {
        score += 15;
        reasons.push(`Matches your current level: ${task.difficulty}`);
      }

      // Popular tasks bonus (+15 points if high usage)
      if (task.usageCount > 10) {
        score += 15;
        reasons.push('Popular task with many learners');
      }

      // High-rated tasks (+20 points if average score > 75)
      if (task.averageScore && task.averageScore > 75) {
        score += 20;
        reasons.push('Highly rated by other learners');
      }

      // Category diversity bonus (+10 points for new categories)
      const attemptedCategories = completedAttempts.map(a => a.task.category);
      if (!attemptedCategories.includes(task.category)) {
        score += 10;
        reasons.push('New category to explore');
      }

      // Appropriate duration (+10 points for reasonable length)
      if (task.estimatedDuration >= 10 && task.estimatedDuration <= 30) {
        score += 10;
        reasons.push('Good duration for focused practice');
      }

      return {
        task,
        score,
        reasons,
      };
    });

    // Sort by score and take top recommendations
    const recommendations = scoredTasks
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map(item => ({
        ...item.task,
        recommendationScore: item.score,
        ...(includeReasons && { reasons: item.reasons }),
      }));

    return NextResponse.json({
      recommendations,
      userProfile: {
        currentLevel: user.proficiency,
        recommendedLevel,
        completedTasks: completedTaskIds.length,
        averageCompletionRate: Math.round(averageCompletionRate * 10) / 10,
        preferredCategories,
      },
      insights: {
        progressSuggestion:
          averageCompletionRate > 80
            ? `Great progress! Ready to try ${recommendedLevel} level tasks.`
            : averageCompletionRate > 60
              ? "You're making steady progress. Keep practicing at your current level."
              : 'Focus on mastering your current level before advancing.',
        completionTrend:
          averageCompletionRate > 75
            ? 'Excellent'
            : averageCompletionRate > 60
              ? 'Good'
              : averageCompletionRate > 40
                ? 'Fair'
                : 'Needs Improvement',
      },
    });
  } catch (error) {
    console.error('Error generating recommendations:', error);
    return NextResponse.json({ error: 'Failed to generate recommendations' }, { status: 500 });
  }
}

// Helper: Identify strength areas
function getStrengthAreas(scores: {
  taskAchievement: number;
  fluency: number;
  vocabularyGrammarAccuracy: number;
  politeness: number;
}): string[] {
  const areas: string[] = [];
  if (scores.taskAchievement > 80) areas.push('Task Achievement');
  if (scores.fluency > 80) areas.push('Fluency');
  if (scores.vocabularyGrammarAccuracy > 80) areas.push('Vocabulary & Grammar');
  if (scores.politeness > 80) areas.push('Politeness');
  return areas;
}

// Helper: Identify improvement areas
function getImprovementAreas(scores: {
  taskAchievement: number;
  fluency: number;
  vocabularyGrammarAccuracy: number;
  politeness: number;
}): string[] {
  const areas: string[] = [];
  if (scores.taskAchievement < 70) areas.push('Task Achievement');
  if (scores.fluency < 70) areas.push('Fluency');
  if (scores.vocabularyGrammarAccuracy < 70) areas.push('Vocabulary & Grammar');
  if (scores.politeness < 70) areas.push('Politeness');
  return areas;
}
