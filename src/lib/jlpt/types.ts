/**
 * JLPT Tryout TypeScript Type Definitions
 *
 * Shared types for JLPT test system
 */

import type {
  JLPTPassage,
  JLPTQuestion,
  JLPTAnswerChoice,
  JLPTQuestionUnit,
  JLPTTestAttempt,
  JLPTSectionSubmission,
  JLPTUserAnswer,
  JLPTSectionScore,
  JLPTOfflineTestResult,
  JLPTOfflineSectionScore,
  JLPTScoringConfig,
  JLPTQuestionAnalytics,
} from '@prisma/client';

// Re-export Prisma types
export type {
  JLPTPassage,
  JLPTQuestion,
  JLPTAnswerChoice,
  JLPTQuestionUnit,
  JLPTTestAttempt,
  JLPTSectionSubmission,
  JLPTUserAnswer,
  JLPTSectionScore,
  JLPTOfflineTestResult,
  JLPTOfflineSectionScore,
  JLPTScoringConfig,
  JLPTQuestionAnalytics,
};

// JLPT Level type
export type JLPTLevel = 'N5' | 'N4' | 'N3' | 'N2' | 'N1';

// Section Type
export type SectionType = 'vocabulary' | 'grammar_reading' | 'listening';

// Test Status
export type TestStatus = 'in_progress' | 'completed' | 'abandoned';

// Reference Grade (scoring bands)
export type ReferenceGrade = 'A' | 'B' | 'C';

// Question Types
export type QuestionType = 'standard' | 'cloze' | 'reading_comp' | 'audio';

// Content Types for passages
export type ContentType = 'text' | 'audio' | 'image';

// Test Mode
export type TestMode = 'full_test' | 'section_practice' | 'mondai_practice';

// ============================================
// Extended Types with Relations
// ============================================

/**
 * Question with all related data
 */
export interface QuestionWithDetails extends JLPTQuestion {
  answerChoices: JLPTAnswerChoice[];
  passage?: JLPTPassage | null;
}

/**
 * Test attempt with full details
 */
export interface TestAttemptWithDetails extends JLPTTestAttempt {
  userAnswers: JLPTUserAnswer[];
  sectionScores: JLPTSectionScore[];
  sectionSubmissions: JLPTSectionSubmission[];
}

/**
 * Question snapshot for test generation
 * (stored in questionsSnapshot JSON field)
 */
export interface QuestionSnapshot {
  vocabulary: MondaiQuestions[];
  grammar_reading: MondaiQuestions[];
  listening: MondaiQuestions[];
}

export interface MondaiQuestions {
  mondaiNumber: number;
  questionIds: string[];
}

/**
 * User answer for a question
 */
export interface UserAnswerInput {
  questionId: string;
  selectedAnswer: number | null;
  timeSpentSeconds?: number;
  isFlagged?: boolean;
}

/**
 * Section submission data
 */
export interface SectionSubmissionData {
  sectionType: SectionType;
  timeSpentSeconds: number;
  answers: UserAnswerInput[];
}

/**
 * Scoring result for a section
 */
export interface SectionScoringResult {
  sectionType: SectionType;
  rawScore: number;
  weightedScore: number;
  rawMaxScore: number;
  normalizedScore: number;
  isPassed: boolean;
  referenceGrade: ReferenceGrade;
  mondaiBreakdown: MondaiScore[];
}

/**
 * Breakdown by mondai
 */
export interface MondaiScore {
  mondaiNumber: number;
  correct: number;
  total: number;
  weightedScore: number;
  maxScore: number;
}

/**
 * Overall test result
 */
export interface TestResult {
  testAttemptId: string;
  level: JLPTLevel;
  totalScore: number;
  isPassed: boolean;
  sectionResults: SectionScoringResult[];
  completedAt: Date;
}

/**
 * Pass/Fail result with reasoning
 */
export interface PassFailResult {
  isPassed: boolean;
  totalScore: number;
  sectionsPassed: {
    vocabulary: boolean;
    grammar_reading: boolean;
    listening: boolean;
  };
  failureReasons?: string[];
}

/**
 * Offline calculator input
 */
export interface OfflineCalculatorInput {
  level: JLPTLevel;
  source?: string;
  userNote?: string;
  mondaiScores: {
    sectionType: SectionType;
    mondaiNumber: number;
    correct: number;
    total: number;
  }[];
}

/**
 * Shuffled choices for display
 */
export interface ShuffledChoice {
  choiceNumber: number; // Original choice number (1-4)
  displayPosition: number; // Shuffled position for display
  choiceText?: string;
  choiceMediaUrl?: string;
  choiceType: string;
}

/**
 * Question display data
 */
export interface QuestionDisplayData {
  question: QuestionWithDetails;
  shuffledChoices: ShuffledChoice[];
  currentAnswer?: number | null;
  isFlagged?: boolean;
}

/**
 * Test session state
 */
export interface TestSessionState {
  attemptId: string;
  level: JLPTLevel;
  currentSection: SectionType;
  currentQuestionIndex: number;
  answers: Record<string, number | null>; // questionId -> answer (1-4)
  flaggedQuestions: Set<string>;
  sectionStartTimes: Record<SectionType, number>; // timestamp
  shuffleSeed: string;
}

/**
 * Section timer data
 */
export interface SectionTimer {
  sectionType: SectionType;
  durationMinutes: number;
  startedAt: Date;
  expiresAt: Date;
}

/**
 * Test history item for listing
 */
export interface TestHistoryItem {
  id: string;
  level: JLPTLevel;
  totalScore: number | null;
  isPassed: boolean | null;
  startedAt: Date;
  completedAt: Date | null;
  status: TestStatus;
}

/**
 * Calculator history item
 */
export interface CalculatorHistoryItem {
  id: string;
  level: JLPTLevel;
  source?: string;
  totalScore: number;
  isPassed: boolean;
  createdAt: Date;
}

/**
 * Analytics data for question quality
 */
export interface QuestionQualityMetrics {
  successRate: number;
  averageTimeSpent: number;
  discriminationIndex: number;
  timesPresented: number;
  needsReview: boolean;
}

/**
 * Test configuration by level
 */
export interface TestConfiguration {
  level: JLPTLevel;
  sections: {
    vocabulary: SectionTestConfig;
    grammar_reading: SectionTestConfig;
    listening: SectionTestConfig;
  };
}

export interface SectionTestConfig {
  durationMinutes: number;
  totalQuestions: number;
  passingScore: number;
}

/**
 * Scoring configuration
 */
export interface ScoringConfiguration {
  level: JLPTLevel;
  sectionType: SectionType;
  rawMaxScore: number;
  overallPassingScore: number;
  sectionPassingScore: number;
  hasDualNormalization: boolean;
  combinedWithSection?: string;
}
