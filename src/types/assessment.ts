// Task-based assessment types for Japanese language learning

export interface TaskAssessment {
  taskId: string;
  attemptId: string;

  // Core Japanese Language Learning Evaluation Criteria
  taskAchievement: number; // タスク達成度 (0-100) - Task completion level
  fluency: number; // 流暢さ (0-100) - Speaking fluency and naturalness
  vocabularyGrammarAccuracy: number; // 語彙・文法的正確さ (0-100) - Vocabulary and grammatical accuracy
  politeness: number; // 丁寧さ (0-100) - Politeness and appropriateness

  // Detailed breakdown
  objectiveCompletion: {
    // Track individual task objectives
    [objective: string]: boolean;
  };

  // Feedback and recommendations
  overallScore: number; // Combined weighted score
  feedback: string;
  specificFeedback: {
    taskAchievement: string; // Feedback on task completion
    fluency: string; // Feedback on speaking fluency
    vocabularyGrammar: string; // Feedback on language accuracy
    politeness: string; // Feedback on appropriateness
  };

  // Learning progression
  areasForImprovement: string[];
  strengths: string[];
  recommendedNextTasks: string[];
  timeToComplete: number; // Minutes
  retryRecommendation: boolean;

  // JLPT level assessment
  estimatedJLPTLevel: string; // Current estimated level based on performance
  progressToNextLevel: number; // Percentage progress to next JLPT level

  // Metadata
  assessmentDate: Date;
  conversationTurns: number;
  totalMessages: number;
}

export interface TaskObjective {
  id: string;
  description: string;
  completed: boolean;
  attempts: number;
  completedAt?: Date;
}

export interface ConversationTurn {
  userMessage: string;
  assistantMessage: string;
  timestamp: Date;
  turnNumber: number;
}

export interface AssessmentCriteria {
  taskAchievement: {
    objectivesCompleted: number;
    totalObjectives: number;
    qualityOfCompletion: number; // 0-100
  };
  fluency: {
    averageResponseTime: number; // milliseconds
    hesitationMarkers: number;
    sentenceComplexity: number; // 0-100
    naturalness: number; // 0-100
  };
  vocabularyGrammar: {
    vocabularyRange: number; // 0-100
    grammarAccuracy: number; // 0-100
    appropriateWordChoice: number; // 0-100
    jlptLevelMatch: boolean;
  };
  politeness: {
    appropriateFormality: number; // 0-100
    honorifics: number; // 0-100
    culturalAwareness: number; // 0-100
  };
}

export interface JLPTLevelEstimation {
  currentLevel: 'N5' | 'N4' | 'N3' | 'N2' | 'N1';
  confidence: number; // 0-100
  progressToNextLevel: number; // 0-100
  estimationBasis: {
    vocabularyLevel: string;
    grammarLevel: string;
    conversationComplexity: string;
    taskDifficultyHandled: string;
  };
  recommendedStudyAreas: string[];
}

export interface SkillGapAnalysis {
  weakestAreas: {
    category: string;
    score: number;
    examples: string[];
    recommendedTasks: string[];
  }[];
  strongestAreas: {
    category: string;
    score: number;
    examples: string[];
  }[];
  overallProgress: {
    taskAchievement: number;
    fluency: number;
    vocabularyGrammar: number;
    politeness: number;
  };
}

export interface FeedbackTemplate {
  category: 'taskAchievement' | 'fluency' | 'vocabularyGrammar' | 'politeness';
  scoreRange: {
    min: number;
    max: number;
  };
  feedbackText: string;
  suggestions: string[];
  examples?: string[];
}

export interface AssessmentWeights {
  taskAchievement: number; // 0-1
  fluency: number; // 0-1
  vocabularyGrammarAccuracy: number; // 0-1
  politeness: number; // 0-1
}

export const DEFAULT_ASSESSMENT_WEIGHTS: AssessmentWeights = {
  taskAchievement: 0.3,
  fluency: 0.25,
  vocabularyGrammarAccuracy: 0.3,
  politeness: 0.15,
};

export interface ProgressMetrics {
  userId: string;
  totalTasksAttempted: number;
  totalTasksCompleted: number;
  averageScores: {
    taskAchievement: number;
    fluency: number;
    vocabularyGrammarAccuracy: number;
    politeness: number;
    overall: number;
  };
  improvementTrend: {
    period: 'week' | 'month' | 'all';
    taskAchievement: number; // percentage change
    fluency: number;
    vocabularyGrammarAccuracy: number;
    politeness: number;
  };
  currentJLPTLevel: string;
  nextMilestone: {
    level: string;
    progressPercentage: number;
    estimatedTime: number; // hours
  };
}

// Simplified Assessment (Phase 6 - Task Feedback System)
export interface SimplifiedAssessment {
  attemptId: string;
  taskId: string;

  // 1. Objective Achievement
  objectives: {
    text: string;
    achieved: boolean;
    evidence: string[];
  }[];
  objectivesAchieved: number;
  totalObjectives: number;

  // 2. Conversation Feedback
  conversationFeedback: {
    strengths: string[]; // What user did well
    areasToImprove: string[]; // Specific improvements
    overallFeedback: string; // General narrative
    encouragement: string; // Motivational message
  };

  // 3. Statistics
  statistics: {
    duration: number; // seconds
    durationMinutes: number;
    totalMessages: number;
    userMessagesCount: number;
    completionRate: number; // percentage
  };

  // 4. Recommendations
  suggestRetry: boolean;
  nextSteps: string[];

  assessmentDate: Date;
}
