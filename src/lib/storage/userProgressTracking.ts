/**
 * User Progress Tracking Service
 * Comprehensive tracking of user learning progress and achievements
 */

import { prisma } from '@/lib/prisma';
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
    averageScore: number;
    averageTaskAchievement: number;
    averageFluency: number;
    averageVocabularyGrammar: number;
    averagePoliteness: number;
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
    attemptWhere.startTime = {};
    if (filter.startDate) attemptWhere.startTime.gte = filter.startDate;
    if (filter.endDate) attemptWhere.startTime.lte = filter.endDate;
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

  const avgScore =
    completedAttempts.length > 0
      ? completedAttempts.reduce((sum, a) => sum + (a.overallScore || 0), 0) /
        completedAttempts.length
      : 0;

  const avgTaskAchievement =
    completedAttempts.length > 0
      ? completedAttempts.reduce((sum, a) => sum + (a.taskAchievement || 0), 0) /
        completedAttempts.length
      : 0;

  const avgFluency =
    completedAttempts.length > 0
      ? completedAttempts.reduce((sum, a) => sum + (a.fluency || 0), 0) / completedAttempts.length
      : 0;

  const avgVocabGrammar =
    completedAttempts.length > 0
      ? completedAttempts.reduce((sum, a) => sum + (a.vocabularyGrammarAccuracy || 0), 0) /
        completedAttempts.length
      : 0;

  const avgPoliteness =
    completedAttempts.length > 0
      ? completedAttempts.reduce((sum, a) => sum + (a.politeness || 0), 0) /
        completedAttempts.length
      : 0;

  // Calculate total study time
  const totalStudyTime = completedAttempts.reduce((sum, a) => {
    if (a.endTime) {
      const duration = (a.endTime.getTime() - a.startTime.getTime()) / 60000; // minutes
      return sum + duration;
    }
    return sum;
  }, 0);

  // Get recent activity
  const recentActivity: RecentActivity[] = filteredAttempts.slice(0, 10).map(attempt => ({
    id: attempt.id,
    type: 'task_attempt' as const,
    taskId: attempt.taskId,
    taskTitle: attempt.task.title,
    score: attempt.overallScore || undefined,
    timestamp: attempt.startTime,
  }));

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
 */
export async function getProgressComparison(userId: string) {
  const userProgress = await getUserProgress(userId);

  // Get average scores for same proficiency level
  const sameLevel = await prisma.taskAttempt.groupBy({
    by: ['userId'],
    where: {
      user: { proficiency: userProgress.proficiency },
      isCompleted: true,
    },
    _avg: {
      overallScore: true,
    },
  });

  const avgScoreForLevel =
    sameLevel.reduce((sum, u) => sum + (u._avg.overallScore || 0), 0) / sameLevel.length;

  return {
    userScore: userProgress.statistics.averageScore,
    levelAverage: avgScoreForLevel,
    percentile: calculatePercentile(
      userProgress.statistics.averageScore,
      sameLevel.map(u => u._avg.overallScore || 0)
    ),
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
