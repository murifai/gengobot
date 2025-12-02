/**
 * Task Analytics and Reporting System
 * Comprehensive analytics for task performance and user learning insights
 */

import { prisma } from '@/lib/prisma';
export interface TaskAnalytics {
  taskId: string;
  taskTitle: string;
  category: string;
  difficulty: string;
  totalAttempts: number;
  completedAttempts: number;
  uniqueUsers: number;
  completionRate: number;
  averageScores: {
    overall: number;
    taskAchievement: number;
    fluency: number;
    vocabularyGrammar: number;
    politeness: number;
  };
  averageDuration: number; // minutes
  retryRate: number;
  userSatisfaction: number; // based on completion and scores
  trendData: TrendData[];
}

export interface TrendData {
  date: Date;
  attempts: number;
  completions: number;
  averageScore: number;
}

export interface CategoryAnalytics {
  category: string;
  taskCount: number;
  totalAttempts: number;
  completedAttempts: number;
  averageScore: number;
  popularityRank: number;
}

export interface UserAnalytics {
  userId: string;
  userName: string;
  proficiency: string;
  totalAttempts: number;
  completedAttempts: number;
  averageScores: {
    overall: number;
    taskAchievement: number;
    fluency: number;
    vocabularyGrammar: number;
    politeness: number;
  };
  strongCategories: string[];
  weakCategories: string[];
  learningVelocity: number; // tasks per week
  consistencyScore: number; // based on regular activity
}

export interface SystemAnalytics {
  totalUsers: number;
  activeUsers: number; // last 30 days
  totalTasks: number;
  activeTasks: number;
  totalAttempts: number;
  completedAttempts: number;
  overallCompletionRate: number;
  averageSessionDuration: number;
  categoryDistribution: CategoryAnalytics[];
  difficultyDistribution: {
    level: string;
    count: number;
    averageScore: number;
  }[];
  growthMetrics: {
    userGrowth: number; // percentage
    attemptGrowth: number; // percentage
    engagementGrowth: number; // percentage
  };
}

/**
 * Get comprehensive analytics for a specific task
 */
export async function getTaskAnalytics(
  taskId: string,
  dateRange?: { start: Date; end: Date }
): Promise<TaskAnalytics> {
  const task = await prisma.task.findUnique({
    where: { id: taskId },
  });

  if (!task) {
    throw new Error(`Task ${taskId} not found`);
  }

  // Build date filter
  const dateFilter: Record<string, unknown> = { taskId };
  if (dateRange) {
    dateFilter.startTime = {
      gte: dateRange.start,
      lte: dateRange.end,
    };
  }

  // Get all attempts for this task
  const attempts = await prisma.taskAttempt.findMany({
    where: dateFilter,
  });

  const completedAttempts = attempts.filter(a => a.isCompleted);
  const uniqueUserIds = new Set(attempts.map(a => a.userId));

  // Calculate average scores
  const avgScores = calculateAverageScores(completedAttempts);

  // Calculate average duration
  const avgDuration = calculateAverageDuration(completedAttempts);

  // Calculate retry rate
  const retryRate = calculateRetryRate(attempts);

  // Calculate user satisfaction score
  const satisfaction = calculateSatisfactionScore(
    completedAttempts.length,
    attempts.length,
    avgScores.overall
  );

  // Get trend data
  const trendData = await getTaskTrendData(taskId, dateRange);

  return {
    taskId,
    taskTitle: task.title,
    category: task.category,
    difficulty: task.difficulty,
    totalAttempts: attempts.length,
    completedAttempts: completedAttempts.length,
    uniqueUsers: uniqueUserIds.size,
    completionRate: attempts.length > 0 ? (completedAttempts.length / attempts.length) * 100 : 0,
    averageScores: avgScores,
    averageDuration: avgDuration,
    retryRate,
    userSatisfaction: satisfaction,
    trendData,
  };
}

/**
 * Get analytics for all categories
 */
export async function getCategoryAnalytics(): Promise<CategoryAnalytics[]> {
  const tasks = await prisma.task.findMany({
    where: { isActive: true },
    include: {
      taskAttempts: {
        where: { isCompleted: true },
      },
    },
  });

  // Group by category
  interface CategoryStats {
    category: string;
    taskCount: number;
    totalAttempts: number;
    completedAttempts: number;
    totalScore: number;
  }

  const categoryMap = new Map<string, CategoryStats>();

  for (const task of tasks) {
    if (!categoryMap.has(task.category)) {
      categoryMap.set(task.category, {
        category: task.category,
        taskCount: 0,
        totalAttempts: 0,
        completedAttempts: 0,
        totalScore: 0,
      });
    }

    const cat = categoryMap.get(task.category)!;
    cat.taskCount++;
    cat.totalAttempts += task.usageCount;
    cat.completedAttempts += task.taskAttempts.length;
    cat.totalScore += task.taskAttempts.reduce(
      (sum: number, a: Record<string, unknown>) =>
        sum + (typeof a.overallScore === 'number' ? a.overallScore : 0),
      0
    );
  }

  // Convert to array and calculate averages
  const categories = Array.from(categoryMap.values()).map(cat => ({
    category: cat.category,
    taskCount: cat.taskCount,
    totalAttempts: cat.totalAttempts,
    completedAttempts: cat.completedAttempts,
    averageScore: cat.completedAttempts > 0 ? cat.totalScore / cat.completedAttempts : 0,
    popularityRank: 0, // Will be set after sorting
  }));

  // Sort by total attempts and assign ranks
  categories.sort((a, b) => b.totalAttempts - a.totalAttempts);
  categories.forEach((cat, index) => {
    cat.popularityRank = index + 1;
  });

  return categories;
}

/**
 * Get comprehensive analytics for a specific user
 */
export async function getUserAnalytics(userId: string): Promise<UserAnalytics> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new Error(`User ${userId} not found`);
  }

  const attempts = await prisma.taskAttempt.findMany({
    where: { userId },
    include: { task: true },
  });

  const completedAttempts = attempts.filter(a => a.isCompleted);

  // Calculate average scores
  const avgScores = calculateAverageScores(completedAttempts);

  // Identify strong and weak categories
  const { strong, weak } = identifyStrengthsWeaknesses(completedAttempts);

  // Calculate learning velocity (tasks per week)
  const velocity = calculateLearningVelocity(completedAttempts);

  // Calculate consistency score
  const consistency = await calculateConsistencyScore(userId);

  return {
    userId,
    userName: user.name || 'Unknown',
    proficiency: user.proficiency,
    totalAttempts: attempts.length,
    completedAttempts: completedAttempts.length,
    averageScores: avgScores,
    strongCategories: strong,
    weakCategories: weak,
    learningVelocity: velocity,
    consistencyScore: consistency,
  };
}

/**
 * Get system-wide analytics
 */
export async function getSystemAnalytics(): Promise<SystemAnalytics> {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  // Get basic counts
  const [totalUsers, activeUsers, totalTasks, activeTasks, totalAttempts, completedAttempts] =
    await Promise.all([
      prisma.user.count(),
      prisma.user.count({
        where: {
          taskAttempts: {
            some: {
              startTime: { gte: thirtyDaysAgo },
            },
          },
        },
      }),
      prisma.task.count(),
      prisma.task.count({ where: { isActive: true } }),
      prisma.taskAttempt.count(),
      prisma.taskAttempt.count({ where: { isCompleted: true } }),
    ]);

  // Get category analytics
  const categoryDistribution = await getCategoryAnalytics();

  // Get difficulty distribution
  const difficultyDistribution = await getDifficultyDistribution();

  // Calculate average session duration
  const avgSessionDuration = await calculateAverageSessionDuration();

  // Calculate growth metrics
  const growthMetrics = await calculateGrowthMetrics();

  return {
    totalUsers,
    activeUsers,
    totalTasks,
    activeTasks,
    totalAttempts,
    completedAttempts,
    overallCompletionRate: totalAttempts > 0 ? (completedAttempts / totalAttempts) * 100 : 0,
    averageSessionDuration: avgSessionDuration,
    categoryDistribution,
    difficultyDistribution,
    growthMetrics,
  };
}

/**
 * Get task performance comparison
 */
export async function compareTaskPerformance(taskIds: string[]) {
  const analytics = await Promise.all(taskIds.map(id => getTaskAnalytics(id)));

  return {
    tasks: analytics,
    bestPerforming: analytics.reduce((best, current) =>
      current.averageScores.overall > best.averageScores.overall ? current : best
    ),
    mostPopular: analytics.reduce((best, current) =>
      current.totalAttempts > best.totalAttempts ? current : best
    ),
    highestCompletion: analytics.reduce((best, current) =>
      current.completionRate > best.completionRate ? current : best
    ),
  };
}

// ===== Helper Functions =====

function calculateAverageScores(attempts: Record<string, unknown>[]) {
  if (attempts.length === 0) {
    return {
      overall: 0,
      taskAchievement: 0,
      fluency: 0,
      vocabularyGrammar: 0,
      politeness: 0,
    };
  }

  return {
    overall:
      attempts.reduce((sum, a) => sum + ((a.overallScore as number) || 0), 0) / attempts.length,
    taskAchievement:
      attempts.reduce((sum, a) => sum + ((a.taskAchievement as number) || 0), 0) / attempts.length,
    fluency: attempts.reduce((sum, a) => sum + ((a.fluency as number) || 0), 0) / attempts.length,
    vocabularyGrammar:
      attempts.reduce((sum, a) => sum + ((a.vocabularyGrammarAccuracy as number) || 0), 0) /
      attempts.length,
    politeness:
      attempts.reduce((sum, a) => sum + ((a.politeness as number) || 0), 0) / attempts.length,
  };
}

function calculateAverageDuration(attempts: Record<string, unknown>[]): number {
  const withDuration = attempts.filter(a => a.endTime);
  if (withDuration.length === 0) return 0;

  const totalMinutes = withDuration.reduce((sum, a) => {
    const duration = ((a.endTime as Date).getTime() - (a.startTime as Date).getTime()) / 60000;
    return sum + duration;
  }, 0);

  return totalMinutes / withDuration.length;
}

function calculateRetryRate(attempts: Record<string, unknown>[]): number {
  const totalRetries = attempts.reduce((sum, a) => sum + ((a.retryCount as number) || 0), 0);
  return attempts.length > 0 ? (totalRetries / attempts.length) * 100 : 0;
}

function calculateSatisfactionScore(completed: number, total: number, avgScore: number): number {
  if (total === 0) return 0;
  const completionFactor = (completed / total) * 50;
  const scoreFactor = (avgScore / 100) * 50;
  return completionFactor + scoreFactor;
}

async function getTaskTrendData(
  taskId: string,
  dateRange?: { start: Date; end: Date }
): Promise<TrendData[]> {
  const start = dateRange?.start || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const end = dateRange?.end || new Date();

  const attempts = await prisma.taskAttempt.findMany({
    where: {
      taskId,
      startTime: { gte: start, lte: end },
    },
    orderBy: { startTime: 'asc' },
  });

  // Group by date
  const dailyData = new Map<
    string,
    {
      date: Date;
      attempts: number;
      completions: number;
      totalScore: number;
      scoreCount: number;
    }
  >();

  for (const attempt of attempts) {
    const dateKey = attempt.startTime.toISOString().split('T')[0];
    if (!dailyData.has(dateKey)) {
      dailyData.set(dateKey, {
        date: new Date(dateKey),
        attempts: 0,
        completions: 0,
        totalScore: 0,
        scoreCount: 0,
      });
    }

    const data = dailyData.get(dateKey)!;
    data.attempts++;
    if (attempt.isCompleted) {
      data.completions++;
      // Phase 6 - Parse simplified assessment for completion rate
      try {
        if (attempt.feedback) {
          const assessment = JSON.parse(attempt.feedback);
          const completionRate = assessment?.statistics?.completionRate || 0;
          data.totalScore += completionRate;
          data.scoreCount++;
        }
      } catch {
        // Ignore parse errors
      }
    }
  }

  return Array.from(dailyData.values()).map(data => ({
    date: data.date,
    attempts: data.attempts,
    completions: data.completions,
    averageScore: data.scoreCount > 0 ? data.totalScore / data.scoreCount : 0,
  }));
}

function identifyStrengthsWeaknesses(attempts: Record<string, unknown>[]): {
  strong: string[];
  weak: string[];
} {
  const categoryScores = new Map<string, number[]>();

  for (const attempt of attempts) {
    if (!attempt.task || !attempt.overallScore) continue;

    const category = (attempt.task as { category: string }).category;
    if (!categoryScores.has(category)) {
      categoryScores.set(category, []);
    }
    categoryScores.get(category)!.push(attempt.overallScore as number);
  }

  const categoryAverages = Array.from(categoryScores.entries()).map(([category, scores]) => ({
    category,
    average: scores.reduce((sum, s) => sum + s, 0) / scores.length,
  }));

  categoryAverages.sort((a, b) => b.average - a.average);

  return {
    strong: categoryAverages.slice(0, 3).map(c => c.category),
    weak: categoryAverages.slice(-3).map(c => c.category),
  };
}

function calculateLearningVelocity(attempts: Record<string, unknown>[]): number {
  if (attempts.length === 0) return 0;

  const sorted = attempts.sort(
    (a, b) => (a.startTime as Date).getTime() - (b.startTime as Date).getTime()
  );
  const firstDate = sorted[0].startTime as Date;
  const lastDate = sorted[sorted.length - 1].startTime as Date;

  const weeks = (lastDate.getTime() - firstDate.getTime()) / (7 * 24 * 60 * 60 * 1000);
  return weeks > 0 ? attempts.length / weeks : 0;
}

async function calculateConsistencyScore(userId: string): Promise<number> {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const attempts = await prisma.taskAttempt.findMany({
    where: {
      userId,
      startTime: { gte: thirtyDaysAgo },
    },
    select: { startTime: true },
  });

  // Count unique days with activity
  const activeDays = new Set(attempts.map(a => a.startTime.toISOString().split('T')[0]));

  return (activeDays.size / 30) * 100;
}

async function getDifficultyDistribution() {
  const tasks = await prisma.task.findMany({
    where: { isActive: true },
    include: {
      taskAttempts: {
        where: { isCompleted: true },
      },
    },
  });

  const difficultyMap = new Map<
    string,
    {
      level: string;
      count: number;
      totalScore: number;
      scoreCount: number;
    }
  >();

  for (const task of tasks) {
    if (!difficultyMap.has(task.difficulty)) {
      difficultyMap.set(task.difficulty, {
        level: task.difficulty,
        count: 0,
        totalScore: 0,
        scoreCount: 0,
      });
    }

    const diff = difficultyMap.get(task.difficulty)!;
    diff.count++;
    // Phase 6 - Calculate average completion rate from assessments
    diff.totalScore += task.taskAttempts.reduce((sum: number, a) => {
      try {
        if (a.feedback) {
          const assessment = JSON.parse(a.feedback);
          return sum + (assessment?.statistics?.completionRate || 0);
        }
      } catch {
        // Ignore parse errors
      }
      return sum;
    }, 0);
    diff.scoreCount += task.taskAttempts.length;
  }

  return Array.from(difficultyMap.values()).map(diff => ({
    level: diff.level,
    count: diff.count,
    averageScore: diff.scoreCount > 0 ? diff.totalScore / diff.scoreCount : 0,
  }));
}

async function calculateAverageSessionDuration(): Promise<number> {
  const attempts = await prisma.taskAttempt.findMany({
    where: {
      isCompleted: true,
      endTime: { not: null },
    },
    select: { startTime: true, endTime: true },
  });

  if (attempts.length === 0) return 0;

  const totalMinutes = attempts.reduce((sum, a) => {
    if (!a.endTime) return sum;
    const duration = (a.endTime.getTime() - a.startTime.getTime()) / 60000;
    return sum + duration;
  }, 0);

  return totalMinutes / attempts.length;
}

async function calculateGrowthMetrics() {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const sixtyDaysAgo = new Date();
  sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);

  const [
    recentUsers,
    previousUsers,
    recentAttempts,
    previousAttempts,
    recentActive,
    previousActive,
  ] = await Promise.all([
    prisma.user.count({ where: { createdAt: { gte: thirtyDaysAgo } } }),
    prisma.user.count({
      where: { createdAt: { gte: sixtyDaysAgo, lt: thirtyDaysAgo } },
    }),
    prisma.taskAttempt.count({ where: { startTime: { gte: thirtyDaysAgo } } }),
    prisma.taskAttempt.count({
      where: { startTime: { gte: sixtyDaysAgo, lt: thirtyDaysAgo } },
    }),
    prisma.user.count({
      where: {
        taskAttempts: {
          some: { startTime: { gte: thirtyDaysAgo } },
        },
      },
    }),
    prisma.user.count({
      where: {
        taskAttempts: {
          some: { startTime: { gte: sixtyDaysAgo, lt: thirtyDaysAgo } },
        },
      },
    }),
  ]);

  return {
    userGrowth: previousUsers > 0 ? ((recentUsers - previousUsers) / previousUsers) * 100 : 0,
    attemptGrowth:
      previousAttempts > 0 ? ((recentAttempts - previousAttempts) / previousAttempts) * 100 : 0,
    engagementGrowth:
      previousActive > 0 ? ((recentActive - previousActive) / previousActive) * 100 : 0,
  };
}
