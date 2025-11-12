/**
 * Task Attempt Persistence Service
 * Manages storage and retrieval of task attempts and performance data
 */

import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
// Phase 6 - Updated for simplified assessment system
export interface TaskAttemptData {
  id: string;
  userId: string;
  taskId: string;
  startTime: Date;
  endTime?: Date;
  feedback?: string; // Now contains SimplifiedAssessment JSON
  conversationHistory: Record<string, unknown>;
  isCompleted: boolean;
  retryCount: number;
}

export interface CreateAttemptData {
  userId: string;
  taskId: string;
  conversationHistory?: Record<string, unknown>;
}

// Phase 6 - Updated for simplified assessment system
export interface UpdateAttemptData {
  endTime?: Date;
  feedback?: string; // SimplifiedAssessment JSON
  conversationHistory?: Record<string, unknown>;
  isCompleted?: boolean;
}

// Phase 6 - Updated for simplified assessment system
export interface AttemptFilter {
  userId?: string;
  taskId?: string;
  isCompleted?: boolean;
  startDate?: Date;
  endDate?: Date;
  limit?: number;
  offset?: number;
}

/**
 * Create a new task attempt
 */
export async function createTaskAttempt(data: CreateAttemptData): Promise<TaskAttemptData> {
  // Get retry count for this user and task
  const previousAttempts = await prisma.taskAttempt.count({
    where: {
      userId: data.userId,
      taskId: data.taskId,
    },
  });

  const attempt = await prisma.taskAttempt.create({
    data: {
      userId: data.userId,
      taskId: data.taskId,
      conversationHistory: (data.conversationHistory || {}) as unknown as Prisma.InputJsonValue,
      retryCount: previousAttempts,
    },
  });

  return mapAttemptToData(attempt);
}

/**
 * Update an existing task attempt
 */
export async function updateTaskAttempt(
  attemptId: string,
  data: UpdateAttemptData
): Promise<TaskAttemptData> {
  // Phase 6 - Simplified update data
  const updateData: Record<string, unknown> = {
    endTime: data.endTime,
    feedback: data.feedback,
    isCompleted: data.isCompleted,
  };

  if (data.conversationHistory) {
    updateData.conversationHistory = data.conversationHistory as unknown as Prisma.InputJsonValue;
  }

  const updated = await prisma.taskAttempt.update({
    where: { id: attemptId },
    data: updateData,
  });

  // Phase 6 - No need to update task stats here, done in assessment route

  return mapAttemptToData(updated);
}

/**
 * Get task attempt by ID
 */
export async function getTaskAttempt(attemptId: string): Promise<TaskAttemptData | null> {
  const attempt = await prisma.taskAttempt.findUnique({
    where: { id: attemptId },
  });

  return attempt ? mapAttemptToData(attempt) : null;
}

/**
 * Get task attempts with filtering
 */
export async function getTaskAttempts(filter: AttemptFilter): Promise<TaskAttemptData[]> {
  const where: Record<string, unknown> = {};

  if (filter.userId) where.userId = filter.userId;
  if (filter.taskId) where.taskId = filter.taskId;
  if (filter.isCompleted !== undefined) where.isCompleted = filter.isCompleted;
  // Phase 6 - minScore filter removed (no longer applicable with simplified assessment)
  if (filter.startDate || filter.endDate) {
    const startTimeFilter: Record<string, Date> = {};
    if (filter.startDate) startTimeFilter.gte = filter.startDate;
    if (filter.endDate) startTimeFilter.lte = filter.endDate;
    where.startTime = startTimeFilter;
  }

  const attempts = await prisma.taskAttempt.findMany({
    where,
    orderBy: { startTime: 'desc' },
    take: filter.limit || 50,
    skip: filter.offset || 0,
  });

  return attempts.map(mapAttemptToData);
}

/**
 * Get user's best attempt for a specific task
 */
export async function getBestAttempt(
  userId: string,
  taskId: string
): Promise<TaskAttemptData | null> {
  // Phase 6 - Get most recent completed attempt (simplified assessment)
  const attempt = await prisma.taskAttempt.findFirst({
    where: {
      userId,
      taskId,
      isCompleted: true,
    },
    orderBy: { endTime: 'desc' },
  });

  return attempt ? mapAttemptToData(attempt) : null;
}

/**
 * Get user's latest attempt for a specific task
 */
export async function getLatestAttempt(
  userId: string,
  taskId: string
): Promise<TaskAttemptData | null> {
  const attempt = await prisma.taskAttempt.findFirst({
    where: { userId, taskId },
    orderBy: { startTime: 'desc' },
  });

  return attempt ? mapAttemptToData(attempt) : null;
}

/**
 * Get attempt statistics for a user
 */
export async function getUserAttemptStats(userId: string) {
  const [total, completed, inProgress] = await Promise.all([
    prisma.taskAttempt.count({ where: { userId } }),
    prisma.taskAttempt.count({ where: { userId, isCompleted: true } }),
    prisma.taskAttempt.count({ where: { userId, isCompleted: false } }),
  ]);

  // Phase 6 - Get average completion rate from simplified assessments
  const completedAttempts = await prisma.taskAttempt.findMany({
    where: { userId, isCompleted: true },
    select: {
      feedback: true,
    },
  });

  let avgCompletionRate = 0;

  if (completedAttempts.length > 0) {
    const completionRates = completedAttempts.map(a => {
      try {
        if (a.feedback) {
          const assessment = JSON.parse(a.feedback);
          return assessment?.statistics?.completionRate || 0;
        }
      } catch (e) {
        // Ignore parse errors
      }
      return 0;
    });

    avgCompletionRate =
      completionRates.reduce((sum, rate) => sum + rate, 0) / completionRates.length;
  }

  return {
    total,
    completed,
    inProgress,
    completionRate: total > 0 ? (completed / total) * 100 : 0,
    averageCompletionRate: avgCompletionRate,
  };
}

/**
 * Get attempt statistics for a task
 */
export async function getTaskAttemptStats(taskId: string) {
  const [total, completed, uniqueUsers] = await Promise.all([
    prisma.taskAttempt.count({ where: { taskId } }),
    prisma.taskAttempt.count({ where: { taskId, isCompleted: true } }),
    prisma.taskAttempt.findMany({
      where: { taskId },
      distinct: ['userId'],
      select: { userId: true },
    }),
  ]);

  // Phase 6 - Get average completion rate
  const completedAttempts = await prisma.taskAttempt.findMany({
    where: { taskId, isCompleted: true },
    select: {
      feedback: true,
    },
  });

  let avgCompletionRate = 0;
  if (completedAttempts.length > 0) {
    const rates = completedAttempts.map(a => {
      try {
        if (a.feedback) {
          const assessment = JSON.parse(a.feedback);
          return assessment?.statistics?.completionRate || 0;
        }
      } catch (e) {
        // Ignore parse errors
      }
      return 0;
    });
    avgCompletionRate = rates.reduce((sum, r) => sum + r, 0) / rates.length;
  }

  return {
    total,
    completed,
    uniqueUsers: uniqueUsers.length,
    completionRate: total > 0 ? (completed / total) * 100 : 0,
    averageCompletionRate: avgCompletionRate,
  };
}

/**
 * Delete a task attempt
 */
export async function deleteTaskAttempt(attemptId: string): Promise<void> {
  await prisma.taskAttempt.delete({
    where: { id: attemptId },
  });
}

/**
 * Get recent attempts across all users (for admin)
 */
export async function getRecentAttempts(limit: number = 20) {
  const attempts = await prisma.taskAttempt.findMany({
    include: {
      user: { select: { id: true, name: true, email: true } },
      task: { select: { id: true, title: true, category: true } },
    },
    orderBy: { startTime: 'desc' },
    take: limit,
  });

  return attempts;
}

/**
 * Helper function to update task statistics
 */
async function updateTaskStats(taskId: string, newScore: number) {
  const task = await prisma.task.findUnique({
    where: { id: taskId },
  });

  if (!task) return;

  const newUsageCount = task.usageCount + 1;
  const currentAvg = task.averageScore || 0;
  const newAvg = (currentAvg * task.usageCount + newScore) / newUsageCount;

  await prisma.task.update({
    where: { id: taskId },
    data: {
      usageCount: newUsageCount,
      averageScore: newAvg,
    },
  });
}

/**
 * Helper function to map database model to interface
 * Phase 6 - Updated for simplified assessment system
 */
function mapAttemptToData(attempt: {
  id: string;
  userId: string;
  taskId: string;
  startTime: Date;
  endTime: Date | null;
  feedback: string | null;
  conversationHistory: unknown;
  isCompleted: boolean;
  retryCount: number;
}): TaskAttemptData {
  return {
    id: attempt.id,
    userId: attempt.userId,
    taskId: attempt.taskId,
    startTime: attempt.startTime,
    endTime: attempt.endTime || undefined,
    feedback: attempt.feedback || undefined,
    conversationHistory: attempt.conversationHistory as Record<string, unknown>,
    isCompleted: attempt.isCompleted,
    retryCount: attempt.retryCount,
  };
}
