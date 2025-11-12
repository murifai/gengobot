/**
 * User Progress Tracking Service
 * Comprehensive tracking of user learning progress and achievements
 * Updated for Simplified Feedback System
 */

import { prisma } from '@/lib/prisma';
import { SimplifiedAssessment } from '@/types/assessment';

export interface UserProgress {
  userId: string;
  proficiency: string;
  completedTasksCount: number;
  completedTasks: string[];
  currentTaskId?: string;
  preferredCategories: string[];
  statistics: {
    totalAttempts: number;
    completedAttempts: number;
    averageScore: number; // Based on objective completion rate
    averageTaskAchievement: number; // Based on objective completion rate
    averageFluency: number; // Not available in simplified system (set to 0)
    averageVocabularyGrammar: number; // Not available in simplified system (set to 0)
    averagePoliteness: number; // Not available in simplified system (set to 0)
    totalStudyTime: number; // in minutes
  };
  recentActivity: RecentActivity[];
  recommendations: string[];
  jlptLevelProgress: {
    currentLevel: string;
    progressToNext: number; // percentage
    estimatedTimeToNext: number; // in days
  };
}

/**
 * Parse feedback JSON from TaskAttempt
 */
function parseFeedback(feedbackString: string | null): SimplifiedAssessment | null {
  if (!feedbackString) return null;
  try {
    return JSON.parse(feedbackString) as SimplifiedAssessment;
  } catch {
    return null;
  }
}

export interface RecentActivity {
  id: string;
  type: 'task_attempt' | 'conversation' | 'assessment';
  taskId?: string;
  taskTitle?: string;
  score?: number;
  timestamp: Date;
}

export interface ProgressFilter {
  startDate?: Date;
  endDate?: Date;
  taskCategory?: string;
  difficultyLevel?: string;
}

/**
 * Get comprehensive user progress
 */
export async function getUserProgress(
  userId: string,
  filter?: ProgressFilter
): Promise<UserProgress> {
  // Get user data
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new Error(`User ${userId} not found`);
  }

  // Build filter for task attempts
  const attemptWhere: Record<string, unknown> = { userId };
  if (filter?.startDate || filter?.endDate) {
    const startTimeFilter: Record<string, Date> = {};
    if (filter.startDate) startTimeFilter.gte = filter.startDate;
    if (filter.endDate) startTimeFilter.lte = filter.endDate;
    attemptWhere.startTime = startTimeFilter;
  }

  // Get task attempts with task details
  const attempts = await prisma.taskAttempt.findMany({
    where: attemptWhere,
    include: {
      task: true,
    },
    orderBy: { startTime: 'desc' },
  });

  // Filter by category and difficulty if specified
  const filteredAttempts = attempts.filter(attempt => {
    if (filter?.taskCategory && attempt.task.category !== filter.taskCategory) {
      return false;
    }
    if (filter?.difficultyLevel && attempt.task.difficulty !== filter.difficultyLevel) {
      return false;
    }
    return true;
  });

  // Calculate statistics
  const completedAttempts = filteredAttempts.filter(a => a.isCompleted);
  const totalAttempts = filteredAttempts.length;

  // Parse feedback and calculate completion rates
  const completedAttemptsWithFeedback = completedAttempts
    .map(a => ({
      attempt: a,
      feedback: parseFeedback(a.feedback),
    }))
    .filter(item => item.feedback !== null);

  // Calculate average objective completion rate (0-100)
  const avgCompletionRate =
    completedAttemptsWithFeedback.length > 0
      ? completedAttemptsWithFeedback.reduce((sum, item) => {
          const rate = item.feedback
            ? (item.feedback.objectivesAchieved / item.feedback.totalObjectives) * 100
            : 0;
          return sum + rate;
        }, 0) / completedAttemptsWithFeedback.length
      : 0;

  // Use completion rate for both avgScore and avgTaskAchievement
  const avgScore = avgCompletionRate;
  const avgTaskAchievement = avgCompletionRate;

  // These metrics are not available in the simplified feedback system
  const avgFluency = 0;
  const avgVocabGrammar = 0;
  const avgPoliteness = 0;

  // Calculate total study time
  const totalStudyTime = completedAttempts.reduce((sum, a) => {
    if (a.endTime) {
      const duration = (a.endTime.getTime() - a.startTime.getTime()) / 60000; // minutes
      return sum + duration;
    }
    return sum;
  }, 0);

  // Get recent activity
  const recentActivity: RecentActivity[] = filteredAttempts.slice(0, 10).map(attempt => {
    const feedback = parseFeedback(attempt.feedback);
    const completionRate = feedback
      ? (feedback.objectivesAchieved / feedback.totalObjectives) * 100
      : undefined;

    return {
      id: attempt.id,
      type: 'task_attempt' as const,
      taskId: attempt.taskId,
      taskTitle: attempt.task.title,
      score: completionRate,
      timestamp: attempt.startTime,
    };
  });

  // Calculate JLPT progress
  const jlptProgress = calculateJLPTProgress(user.proficiency, avgScore, completedAttempts.length);

  // Get task recommendations
  const recommendations = await getTaskRecommendations(
    userId,
    user.proficiency,
    (user.preferredTaskCategories as string[]) || []
  );

  return {
    userId,
    proficiency: user.proficiency,
    completedTasksCount: completedAttempts.length,
    completedTasks: (user.completedTasks as string[]) || [],
    currentTaskId: user.currentTaskId || undefined,
    preferredCategories: (user.preferredTaskCategories as string[]) || [],
    statistics: {
      totalAttempts,
      completedAttempts: completedAttempts.length,
      averageScore: avgScore,
      averageTaskAchievement: avgTaskAchievement,
      averageFluency: avgFluency,
      averageVocabularyGrammar: avgVocabGrammar,
      averagePoliteness: avgPoliteness,
      totalStudyTime,
    },
    recentActivity,
    recommendations,
    jlptLevelProgress: jlptProgress,
  };
}

/**
 * Update user progress after task completion
 */
export async function updateProgressAfterTask(userId: string, taskId: string): Promise<void> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new Error(`User ${userId} not found`);
  }

  const completedTasks = (user.completedTasks as string[]) || [];
  if (!completedTasks.includes(taskId)) {
    completedTasks.push(taskId);
  }

  await prisma.user.update({
    where: { id: userId },
    data: {
      completedTasks,
      currentTaskId: null,
      updatedAt: new Date(),
    },
  });
}

/**
 * Set current active task
 */
export async function setCurrentTask(userId: string, taskId: string): Promise<void> {
  await prisma.user.update({
    where: { id: userId },
    data: {
      currentTaskId: taskId,
      updatedAt: new Date(),
    },
  });
}

/**
 * Update user proficiency level
 */
export async function updateProficiency(userId: string, newLevel: string): Promise<void> {
  await prisma.user.update({
    where: { id: userId },
    data: {
      proficiency: newLevel,
      updatedAt: new Date(),
    },
  });
}

/**
 * Update user preferred categories
 */
export async function updatePreferredCategories(
  userId: string,
  categories: string[]
): Promise<void> {
  await prisma.user.update({
    where: { id: userId },
    data: {
      preferredTaskCategories: categories,
      updatedAt: new Date(),
    },
  });
}

/**
 * Get learning streak (consecutive days with activity)
 */
export async function getLearningStreak(userId: string): Promise<number> {
  const attempts = await prisma.taskAttempt.findMany({
    where: { userId },
    orderBy: { startTime: 'desc' },
    select: { startTime: true },
  });

  if (attempts.length === 0) return 0;

  let streak = 0;
  const currentDate = new Date();
  currentDate.setHours(0, 0, 0, 0);

  for (const attempt of attempts) {
    const attemptDate = new Date(attempt.startTime);
    attemptDate.setHours(0, 0, 0, 0);

    const diffDays = Math.floor(
      (currentDate.getTime() - attemptDate.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (diffDays === streak) {
      streak++;
    } else if (diffDays > streak) {
      break;
    }
  }

  return streak;
}

/**
 * Calculate JLPT level progress
 */
function calculateJLPTProgress(
  currentLevel: string,
  averageScore: number,
  completedTasks: number
): {
  currentLevel: string;
  progressToNext: number;
  estimatedTimeToNext: number;
} {
  const levels = ['N5', 'N4', 'N3', 'N2', 'N1'];
  levels.indexOf(currentLevel); // Keep levels for potential future use

  // Simple progress calculation based on score and task count
  const scoreProgress = Math.min(averageScore / 85, 1); // 85+ needed for next level
  const taskProgress = Math.min(completedTasks / 20, 1); // 20 tasks recommended per level
  const progress = ((scoreProgress + taskProgress) / 2) * 100;

  // Estimate time to next level (simplified)
  const remainingTasks = Math.max(20 - completedTasks, 0);
  const estimatedDays = remainingTasks * 3; // ~3 days per task

  return {
    currentLevel,
    progressToNext: Math.round(progress),
    estimatedTimeToNext: estimatedDays,
  };
}

/**
 * Get task recommendations for user
 */
async function getTaskRecommendations(
  userId: string,
  proficiency: string,
  preferredCategories: string[]
): Promise<string[]> {
  // Get completed tasks
  const completedAttempts = await prisma.taskAttempt.findMany({
    where: { userId, isCompleted: true },
    select: { taskId: true },
  });

  const completedTaskIds = completedAttempts.map(a => a.taskId);

  // Find suitable tasks
  const recommendedTasks = await prisma.task.findMany({
    where: {
      isActive: true,
      difficulty: proficiency,
      id: { notIn: completedTaskIds },
      category: preferredCategories.length > 0 ? { in: preferredCategories } : undefined,
    },
    take: 5,
    orderBy: { usageCount: 'desc' },
  });

  return recommendedTasks.map(task => task.id);
}

/**
 * Get progress comparison with other users
 * Note: Simplified feedback system doesn't store scores directly,
 * so this calculates completion rates from feedback JSON
 */
export async function getProgressComparison(userId: string) {
  const userProgress = await getUserProgress(userId);

  // Get all completed attempts for users at same proficiency level
  const sameLevelAttempts = await prisma.taskAttempt.findMany({
    where: {
      user: { proficiency: userProgress.proficiency },
      isCompleted: true,
      feedback: { not: null },
    },
    select: {
      userId: true,
      feedback: true,
    },
  });

  // Calculate average completion rates per user
  const userCompletionRates = new Map<string, number[]>();

  sameLevelAttempts.forEach(attempt => {
    const feedback = parseFeedback(attempt.feedback);
    if (feedback) {
      const rate = (feedback.objectivesAchieved / feedback.totalObjectives) * 100;
      const rates = userCompletionRates.get(attempt.userId) || [];
      rates.push(rate);
      userCompletionRates.set(attempt.userId, rates);
    }
  });

  // Calculate average score for each user
  const allUserAverages = Array.from(userCompletionRates.values()).map(rates => {
    return rates.reduce((sum, rate) => sum + rate, 0) / rates.length;
  });

  const avgScoreForLevel =
    allUserAverages.length > 0
      ? allUserAverages.reduce((sum, avg) => sum + avg, 0) / allUserAverages.length
      : 0;

  return {
    userScore: userProgress.statistics.averageScore,
    levelAverage: avgScoreForLevel,
    percentile: calculatePercentile(userProgress.statistics.averageScore, allUserAverages),
  };
}

/**
 * Calculate percentile ranking
 */
function calculatePercentile(score: number, allScores: number[]): number {
  const sorted = allScores.sort((a, b) => a - b);
  const below = sorted.filter(s => s < score).length;
  return Math.round((below / sorted.length) * 100);
}
