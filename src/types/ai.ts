// Type definitions for AI services

import { Task, Character, TaskAttempt } from '@prisma/client';

export interface Message {
  role: 'system' | 'user' | 'assistant';
  content: string;
  timestamp?: Date;
}

export interface TaskConversationContext {
  mode: 'task-based' | 'free-chat';
  task: Task;
  currentObjective: number;
  completedObjectives: string[];
  character?: Character;
  userProficiency: string;
  conversationHistory: Message[];
  taskAttemptCount: number;
  hints: string[];
}

export interface TaskAssessment {
  taskId: string;
  attemptId: string;

  // Core Japanese Language Learning Evaluation Criteria
  taskAchievement: number; // タスク達成度 (0-100)
  fluency: number; // 流暢さ (0-100)
  vocabularyGrammarAccuracy: number; // 語彙・文法的正確さ (0-100)
  politeness: number; // 丁寧さ (0-100)

  // Detailed breakdown
  objectiveCompletion: {
    [objective: string]: boolean;
  };

  // Feedback and recommendations
  overallScore: number; // Combined weighted score
  feedback: string;
  specificFeedback: {
    taskAchievement: string;
    fluency: string;
    vocabularyGrammar: string;
    politeness: string;
  };

  // Learning progression
  areasForImprovement: string[];
  strengths: string[];
  recommendedNextTasks: string[];
  timeToComplete: number; // Minutes
  retryRecommendation: boolean;

  // JLPT level assessment
  estimatedJLPTLevel: string;
  progressToNextLevel: number;
}

export interface ConversationOptions {
  temperature?: number;
  maxTokens?: number;
  model?: string;
  systemPrompt?: string;
}

export interface AssessmentCriteria {
  taskAchievementWeight: number;
  fluencyWeight: number;
  vocabularyGrammarWeight: number;
  politenessWeight: number;
}
