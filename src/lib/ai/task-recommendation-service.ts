// Task recommendation service based on skill gaps and performance
import { prisma } from '@/lib/prisma';
import { TaskAssessment, SkillGapAnalysis } from '@/types/assessment';

interface RecommendationContext {
  userId: string;
  currentJLPTLevel: string;
  recentAssessments: TaskAssessment[];
  skillGaps: SkillGapAnalysis;
  completedTaskIds: string[];
}

interface TaskRecommendation {
  taskId: string;
  title: string;
  category: string;
  difficulty: string;
  relevanceScore: number;
  reason: string;
  focusAreas: string[];
}

export class TaskRecommendationService {
  /**
   * Get recommended tasks based on user performance and skill gaps
   */
  static async getRecommendedTasks(
    context: RecommendationContext,
    limit: number = 5
  ): Promise<TaskRecommendation[]> {
    // Get tasks that match user's level
    const levelTasks = await prisma.task.findMany({
      where: {
        difficulty: context.currentJLPTLevel,
        isActive: true,
        id: {
          notIn: context.completedTaskIds,
        },
      },
      orderBy: {
        usageCount: 'asc', // Prefer less-used tasks for variety
      },
      take: 20,
    });

    // Score each task based on skill gaps
    const scoredTasks = levelTasks.map(task => {
      const relevanceScore = this.calculateRelevanceScore(task, context.skillGaps);
      const reason = this.generateRecommendationReason(task, context.skillGaps);
      const focusAreas = this.identifyFocusAreas(task, context.skillGaps);

      return {
        taskId: task.id,
        title: task.title,
        category: task.category,
        difficulty: task.difficulty,
        relevanceScore,
        reason,
        focusAreas,
      };
    });

    // Sort by relevance and return top recommendations
    return scoredTasks.sort((a, b) => b.relevanceScore - a.relevanceScore).slice(0, limit);
  }

  /**
   * Calculate relevance score for a task
   */
  private static calculateRelevanceScore(
    task: Record<string, unknown>,
    skillGaps: SkillGapAnalysis
  ): number {
    let score = 50; // Base score

    // Increase score if task category matches weak areas
    const weakCategories = skillGaps.weakestAreas.map(a => a.category.toLowerCase());
    const taskCategory = (task.category as string).toLowerCase();

    if (weakCategories.some(cat => taskCategory.includes(cat))) {
      score += 30;
    }

    // Add variety bonus for different categories
    score += Math.random() * 20; // Add some randomness for variety

    return Math.min(100, score);
  }

  /**
   * Generate recommendation reason
   */
  private static generateRecommendationReason(
    task: Record<string, unknown>,
    skillGaps: SkillGapAnalysis
  ): string {
    const weakestArea = skillGaps.weakestAreas[0];

    if (weakestArea) {
      return `This task will help improve your ${weakestArea.category.toLowerCase()}, which is currently a focus area for you.`;
    }

    return `This task matches your current level and provides good practice opportunities.`;
  }

  /**
   * Identify focus areas for the task
   */
  private static identifyFocusAreas(
    task: Record<string, unknown>,
    skillGaps: SkillGapAnalysis
  ): string[] {
    const focusAreas: string[] = [];

    // Map task categories to skill areas
    const taskCategory = (task.category as string).toLowerCase();

    if (taskCategory.includes('restaurant') || taskCategory.includes('food')) {
      focusAreas.push('Polite ordering expressions');
      focusAreas.push('Food vocabulary');
    } else if (taskCategory.includes('shopping')) {
      focusAreas.push('Numbers and prices');
      focusAreas.push('Polite requests');
    } else if (taskCategory.includes('travel')) {
      focusAreas.push('Direction and location');
      focusAreas.push('Question formation');
    } else if (taskCategory.includes('business')) {
      focusAreas.push('Formal language');
      focusAreas.push('Keigo (honorifics)');
    }

    // Add weak areas as focus
    skillGaps.weakestAreas.forEach(area => {
      if (!focusAreas.includes(area.category)) {
        focusAreas.push(area.category);
      }
    });

    return focusAreas.slice(0, 3);
  }

  /**
   * Get progressive task recommendations (next difficulty level)
   */
  static async getProgressiveTasks(
    userId: string,
    currentLevel: string,
    completedTaskIds: string[]
  ): Promise<TaskRecommendation[]> {
    const levels = ['N5', 'N4', 'N3', 'N2', 'N1'];
    const currentIndex = levels.indexOf(currentLevel);

    if (currentIndex < levels.length - 1) {
      const nextLevel = levels[currentIndex + 1];

      // Get easier tasks from next level
      const progressiveTasks = await prisma.task.findMany({
        where: {
          difficulty: nextLevel,
          isActive: true,
          id: {
            notIn: completedTaskIds,
          },
        },
        orderBy: {
          estimatedDuration: 'asc', // Start with shorter tasks
        },
        take: 3,
      });

      return progressiveTasks.map(task => ({
        taskId: task.id,
        title: task.title,
        category: task.category,
        difficulty: task.difficulty,
        relevanceScore: 85,
        reason: `Ready to challenge yourself? This ${nextLevel} task will help you progress to the next level.`,
        focusAreas: ['Progressive difficulty', 'Level advancement'],
      }));
    }

    return [];
  }

  /**
   * Get similar tasks to retry or practice
   */
  static async getSimilarTasks(taskId: string, limit: number = 3): Promise<TaskRecommendation[]> {
    const originalTask = await prisma.task.findUnique({
      where: { id: taskId },
    });

    if (!originalTask) return [];

    // Find tasks with same category and difficulty
    const similarTasks = await prisma.task.findMany({
      where: {
        category: originalTask.category,
        difficulty: originalTask.difficulty,
        isActive: true,
        id: {
          not: taskId,
        },
      },
      take: limit,
    });

    return similarTasks.map(task => ({
      taskId: task.id,
      title: task.title,
      category: task.category,
      difficulty: task.difficulty,
      relevanceScore: 80,
      reason: `Similar to your recent task, this provides additional practice in ${task.category}.`,
      focusAreas: [task.category, 'Reinforcement practice'],
    }));
  }

  /**
   * Get tasks by specific skill focus
   */
  static async getTasksBySkillFocus(
    skillFocus: string,
    userLevel: string,
    completedTaskIds: string[],
    limit: number = 5
  ): Promise<TaskRecommendation[]> {
    // Map skill focus to task categories
    const categoryMapping: Record<string, string[]> = {
      'task completion': ['Restaurant', 'Shopping', 'Travel'],
      fluency: ['Daily Life', 'Social', 'Business'],
      'vocabulary & grammar': ['Education', 'Business', 'Healthcare'],
      politeness: ['Business', 'Healthcare', 'Social'],
    };

    const categories = categoryMapping[skillFocus.toLowerCase()] || [
      'Restaurant',
      'Shopping',
      'Travel',
    ];

    const tasks = await prisma.task.findMany({
      where: {
        category: {
          in: categories,
        },
        difficulty: userLevel,
        isActive: true,
        id: {
          notIn: completedTaskIds,
        },
      },
      take: limit,
    });

    return tasks.map(task => ({
      taskId: task.id,
      title: task.title,
      category: task.category,
      difficulty: task.difficulty,
      relevanceScore: 90,
      reason: `Focused practice for improving ${skillFocus}.`,
      focusAreas: [skillFocus, task.category],
    }));
  }

  /**
   * Get daily recommended task
   */
  static async getDailyRecommendation(
    userId: string,
    userLevel: string,
    completedTaskIds: string[]
  ): Promise<TaskRecommendation | null> {
    // Get a random task that hasn't been completed
    const tasks = await prisma.task.findMany({
      where: {
        difficulty: userLevel,
        isActive: true,
        id: {
          notIn: completedTaskIds,
        },
      },
    });

    if (tasks.length === 0) return null;

    // Use date-based seed for consistency within a day
    const today = new Date().toDateString();
    const seed = today.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const index = seed % tasks.length;
    const task = tasks[index];

    return {
      taskId: task.id,
      title: task.title,
      category: task.category,
      difficulty: task.difficulty,
      relevanceScore: 75,
      reason: "Today's recommended task to keep your Japanese fresh!",
      focusAreas: [task.category, 'Daily practice'],
    };
  }
}
