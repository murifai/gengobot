/**
 * Data Export Service
 * Export task performance data in various formats (CSV, JSON, Excel)
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export type ExportFormat = 'csv' | 'json' | 'excel';

export interface ExportOptions {
  format: ExportFormat;
  userId?: string;
  taskId?: string;
  startDate?: Date;
  endDate?: Date;
  includeUserData?: boolean;
  includeTaskData?: boolean;
  includeConversations?: boolean;
}

export interface ExportResult {
  format: ExportFormat;
  filename: string;
  data: string | object;
  mimeType: string;
}

/**
 * Export task attempt data
 */
export async function exportTaskAttempts(options: ExportOptions): Promise<ExportResult> {
  const data = await fetchTaskAttemptData(options);

  switch (options.format) {
    case 'csv':
      return exportToCSV(data, 'task_attempts');
    case 'json':
      return exportToJSON(data, 'task_attempts');
    case 'excel':
      return exportToExcel(data, 'task_attempts');
    default:
      throw new Error(`Unsupported format: ${options.format}`);
  }
}

/**
 * Export user progress data
 */
export async function exportUserProgress(
  userId: string,
  format: ExportFormat = 'json'
): Promise<ExportResult> {
  const data = await fetchUserProgressData(userId);

  switch (format) {
    case 'csv':
      return exportToCSV(data, `user_progress_${userId}`);
    case 'json':
      return exportToJSON(data, `user_progress_${userId}`);
    case 'excel':
      return exportToExcel(data, `user_progress_${userId}`);
    default:
      throw new Error(`Unsupported format: ${format}`);
  }
}

/**
 * Export task analytics data
 */
export async function exportTaskAnalytics(
  taskId: string,
  format: ExportFormat = 'json'
): Promise<ExportResult> {
  const data = await fetchTaskAnalyticsData(taskId);

  switch (format) {
    case 'csv':
      return exportToCSV(data, `task_analytics_${taskId}`);
    case 'json':
      return exportToJSON(data, `task_analytics_${taskId}`);
    case 'excel':
      return exportToExcel(data, `task_analytics_${taskId}`);
    default:
      throw new Error(`Unsupported format: ${format}`);
  }
}

/**
 * Export system-wide analytics
 */
export async function exportSystemAnalytics(format: ExportFormat = 'json'): Promise<ExportResult> {
  const data = await fetchSystemAnalyticsData();

  switch (format) {
    case 'csv':
      return exportToCSV(data, 'system_analytics');
    case 'json':
      return exportToJSON(data, 'system_analytics');
    case 'excel':
      return exportToExcel(data, 'system_analytics');
    default:
      throw new Error(`Unsupported format: ${format}`);
  }
}

/**
 * Export conversation history
 */
export async function exportConversations(
  userId: string,
  format: ExportFormat = 'json'
): Promise<ExportResult> {
  const conversations = await prisma.conversation.findMany({
    where: { userId },
    include: {
      task: true,
      character: true,
    },
  });

  const data = conversations.map(conv => ({
    id: conv.id,
    type: conv.type,
    taskTitle: conv.task?.title,
    characterName: conv.character?.name,
    messageCount: (conv.messages as unknown[]).length,
    assessment: conv.assessment,
    createdAt: conv.createdAt,
    updatedAt: conv.updatedAt,
  }));

  switch (format) {
    case 'csv':
      return exportToCSV(data, `conversations_${userId}`);
    case 'json':
      return exportToJSON(data, `conversations_${userId}`);
    case 'excel':
      return exportToExcel(data, `conversations_${userId}`);
    default:
      throw new Error(`Unsupported format: ${format}`);
  }
}

// ===== Data Fetching Functions =====

async function fetchTaskAttemptData(options: ExportOptions) {
  const where: Record<string, unknown> = {};

  if (options.userId) where.userId = options.userId;
  if (options.taskId) where.taskId = options.taskId;
  if (options.startDate || options.endDate) {
    where.startTime = {};
    if (options.startDate) where.startTime.gte = options.startDate;
    if (options.endDate) where.startTime.lte = options.endDate;
  }

  const attempts = await prisma.taskAttempt.findMany({
    where,
    include: {
      user: options.includeUserData,
      task: options.includeTaskData,
    },
    orderBy: { startTime: 'desc' },
  });

  return attempts.map(attempt => {
    const base: Record<string, unknown> = {
      attemptId: attempt.id,
      userId: attempt.userId,
      taskId: attempt.taskId,
      startTime: attempt.startTime,
      endTime: attempt.endTime,
      taskAchievement: attempt.taskAchievement,
      fluency: attempt.fluency,
      vocabularyGrammarAccuracy: attempt.vocabularyGrammarAccuracy,
      politeness: attempt.politeness,
      overallScore: attempt.overallScore,
      isCompleted: attempt.isCompleted,
      retryCount: attempt.retryCount,
    };

    if (options.includeUserData && attempt.user) {
      base.userName = attempt.user.name;
      base.userEmail = attempt.user.email;
      base.userProficiency = attempt.user.proficiency;
    }

    if (options.includeTaskData && attempt.task) {
      base.taskTitle = attempt.task.title;
      base.taskCategory = attempt.task.category;
      base.taskDifficulty = attempt.task.difficulty;
    }

    if (options.includeConversations) {
      base.conversationHistory = attempt.conversationHistory;
      base.feedback = attempt.feedback;
    }

    return base;
  });
}

async function fetchUserProgressData(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      taskAttempts: {
        include: { task: true },
        orderBy: { startTime: 'desc' },
      },
    },
  });

  if (!user) {
    throw new Error(`User ${userId} not found`);
  }

  const completedAttempts = user.taskAttempts.filter(a => a.isCompleted);

  return {
    userId: user.id,
    userName: user.name,
    email: user.email,
    proficiency: user.proficiency,
    isAdmin: user.isAdmin,
    createdAt: user.createdAt,
    statistics: {
      totalAttempts: user.taskAttempts.length,
      completedAttempts: completedAttempts.length,
      completionRate:
        user.taskAttempts.length > 0
          ? (completedAttempts.length / user.taskAttempts.length) * 100
          : 0,
    },
    averageScores: calculateAverageScores(completedAttempts),
    recentAttempts: user.taskAttempts.slice(0, 10).map(a => ({
      taskTitle: a.task.title,
      category: a.task.category,
      difficulty: a.task.difficulty,
      score: a.overallScore,
      completed: a.isCompleted,
      date: a.startTime,
    })),
  };
}

async function fetchTaskAnalyticsData(taskId: string) {
  const task = await prisma.task.findUnique({
    where: { id: taskId },
    include: {
      taskAttempts: {
        include: { user: true },
      },
    },
  });

  if (!task) {
    throw new Error(`Task ${taskId} not found`);
  }

  const completedAttempts = task.taskAttempts.filter(a => a.isCompleted);
  const uniqueUsers = new Set(task.taskAttempts.map(a => a.userId));

  return {
    taskId: task.id,
    title: task.title,
    description: task.description,
    category: task.category,
    difficulty: task.difficulty,
    estimatedDuration: task.estimatedDuration,
    isActive: task.isActive,
    createdAt: task.createdAt,
    statistics: {
      totalAttempts: task.taskAttempts.length,
      completedAttempts: completedAttempts.length,
      uniqueUsers: uniqueUsers.size,
      completionRate:
        task.taskAttempts.length > 0
          ? (completedAttempts.length / task.taskAttempts.length) * 100
          : 0,
      usageCount: task.usageCount,
      averageScore: task.averageScore,
    },
    averageScores: calculateAverageScores(completedAttempts),
    recentAttempts: task.taskAttempts.slice(0, 10).map(a => ({
      userName: a.user.name,
      userProficiency: a.user.proficiency,
      score: a.overallScore,
      completed: a.isCompleted,
      date: a.startTime,
    })),
  };
}

async function fetchSystemAnalyticsData() {
  const [totalUsers, totalTasks, totalAttempts, completedAttempts] = await Promise.all([
    prisma.user.count(),
    prisma.task.count(),
    prisma.taskAttempt.count(),
    prisma.taskAttempt.count({ where: { isCompleted: true } }),
  ]);

  const tasks = await prisma.task.findMany({
    include: {
      taskAttempts: {
        where: { isCompleted: true },
      },
    },
  });

  // Category distribution
  const categoryMap = new Map<string, number>();
  tasks.forEach(task => {
    categoryMap.set(task.category, (categoryMap.get(task.category) || 0) + 1);
  });

  // Difficulty distribution
  const difficultyMap = new Map<string, number>();
  tasks.forEach(task => {
    difficultyMap.set(task.difficulty, (difficultyMap.get(task.difficulty) || 0) + 1);
  });

  return {
    overview: {
      totalUsers,
      totalTasks,
      totalAttempts,
      completedAttempts,
      overallCompletionRate: totalAttempts > 0 ? (completedAttempts / totalAttempts) * 100 : 0,
    },
    categoryDistribution: Array.from(categoryMap.entries()).map(([category, count]) => ({
      category,
      count,
    })),
    difficultyDistribution: Array.from(difficultyMap.entries()).map(([difficulty, count]) => ({
      difficulty,
      count,
    })),
  };
}

// ===== Export Format Functions =====

function exportToCSV(data: Record<string, unknown>[], filename: string): ExportResult {
  if (data.length === 0) {
    return {
      format: 'csv',
      filename: `${filename}.csv`,
      data: '',
      mimeType: 'text/csv',
    };
  }

  // Get headers from first object
  const headers = Object.keys(flattenObject(data[0]));

  // Create CSV content
  const rows = data.map(item => {
    const flattened = flattenObject(item);
    return headers.map(header => {
      const value = flattened[header];
      if (value === null || value === undefined) return '';
      if (typeof value === 'string' && value.includes(',')) {
        return `"${value.replace(/"/g, '""')}"`;
      }
      return value;
    });
  });

  const csvContent = headers.join(',') + '\n' + rows.map(row => row.join(',')).join('\n');

  return {
    format: 'csv',
    filename: `${filename}.csv`,
    data: csvContent,
    mimeType: 'text/csv',
  };
}

function exportToJSON(data: Record<string, unknown>, filename: string): ExportResult {
  return {
    format: 'json',
    filename: `${filename}.json`,
    data: JSON.stringify(data, null, 2),
    mimeType: 'application/json',
  };
}

function exportToExcel(data: Record<string, unknown>[], filename: string): ExportResult {
  // For Excel export, we'll return JSON format with instructions
  // In a real implementation, you would use a library like xlsx
  return {
    format: 'excel',
    filename: `${filename}.xlsx`,
    data: JSON.stringify({
      message: 'Excel export requires additional library (xlsx)',
      data: data,
    }),
    mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  };
}

// ===== Helper Functions =====

function flattenObject(obj: Record<string, unknown>, prefix = ''): Record<string, unknown> {
  const flattened: Record<string, unknown> = {};

  for (const key in obj) {
    const value = obj[key];
    const newKey = prefix ? `${prefix}.${key}` : key;

    if (value === null || value === undefined) {
      flattened[newKey] = value;
    } else if (value instanceof Date) {
      flattened[newKey] = value.toISOString();
    } else if (typeof value === 'object' && !Array.isArray(value)) {
      Object.assign(flattened, flattenObject(value, newKey));
    } else if (Array.isArray(value)) {
      flattened[newKey] = JSON.stringify(value);
    } else {
      flattened[newKey] = value;
    }
  }

  return flattened;
}

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
    overall: attempts.reduce((sum, a) => sum + (a.overallScore || 0), 0) / attempts.length,
    taskAchievement:
      attempts.reduce((sum, a) => sum + (a.taskAchievement || 0), 0) / attempts.length,
    fluency: attempts.reduce((sum, a) => sum + (a.fluency || 0), 0) / attempts.length,
    vocabularyGrammar:
      attempts.reduce((sum, a) => sum + (a.vocabularyGrammarAccuracy || 0), 0) / attempts.length,
    politeness: attempts.reduce((sum, a) => sum + (a.politeness || 0), 0) / attempts.length,
  };
}

/**
 * Generate export filename with timestamp
 */
export function generateExportFilename(baseName: string, format: ExportFormat): string {
  const timestamp = new Date().toISOString().split('T')[0];
  return `${baseName}_${timestamp}.${format}`;
}
