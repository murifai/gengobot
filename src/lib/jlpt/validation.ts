/**
 * JLPT Validation Schemas (Zod)
 *
 * Validation schemas for API requests and user input
 */

import { z } from 'zod';
import type { JLPTLevel, SectionType } from './types';

// ============================================
// Core Type Schemas
// ============================================

export const JLPTLevelSchema = z.enum(['N5', 'N4', 'N3', 'N2', 'N1']);

export const SectionTypeSchema = z.enum(['vocabulary', 'grammar_reading', 'listening']);

export const QuestionTypeSchema = z.enum(['standard', 'cloze', 'reading_comp', 'audio']);

export const ContentTypeSchema = z.enum(['text', 'audio', 'image']);

export const TestModeSchema = z.enum(['full_test', 'section_practice', 'mondai_practice']);

export const ReferenceGradeSchema = z.enum(['A', 'B', 'C']);

export const TestStatusSchema = z.enum(['in_progress', 'completed', 'abandoned']);

// ============================================
// Test Initialization
// ============================================

export const StartTestSchema = z.object({
  level: JLPTLevelSchema,
  testMode: TestModeSchema.default('full_test'),
  userId: z.string().cuid(),
});

export type StartTestInput = z.infer<typeof StartTestSchema>;

// ============================================
// Answer Submission
// ============================================

export const UserAnswerSchema = z.object({
  questionId: z.string().cuid(),
  selectedAnswer: z.number().int().min(1).max(4).nullable(),
  timeSpentSeconds: z.number().int().min(0).optional(),
  isFlagged: z.boolean().default(false),
});

export type UserAnswerInput = z.infer<typeof UserAnswerSchema>;

export const SaveAnswersSchema = z.object({
  testAttemptId: z.string().cuid(),
  answers: z.array(UserAnswerSchema),
});

export type SaveAnswersInput = z.infer<typeof SaveAnswersSchema>;

// ============================================
// Section Submission
// ============================================

export const SubmitSectionSchema = z.object({
  testAttemptId: z.string().cuid(),
  sectionType: SectionTypeSchema,
  timeSpentSeconds: z.number().int().min(0),
  answers: z.array(UserAnswerSchema),
});

export type SubmitSectionInput = z.infer<typeof SubmitSectionSchema>;

// ============================================
// Test Completion
// ============================================

export const CompleteTestSchema = z.object({
  testAttemptId: z.string().cuid(),
});

export type CompleteTestInput = z.infer<typeof CompleteTestSchema>;

// ============================================
// Offline Calculator
// ============================================

export const MondaiScoreSchema = z.object({
  sectionType: SectionTypeSchema,
  mondaiNumber: z.number().int().min(1).max(14),
  correct: z.number().int().min(0),
  total: z.number().int().min(1),
});

export const CalculatorInputSchema = z.object({
  level: JLPTLevelSchema,
  source: z.string().optional(),
  userNote: z.string().optional(),
  mondaiScores: z.array(MondaiScoreSchema).min(1),
});

export type CalculatorInput = z.infer<typeof CalculatorInputSchema>;

export const SaveCalculationSchema = z.object({
  userId: z.string().cuid(),
  calculation: CalculatorInputSchema,
  result: z.object({
    totalScore: z.number(),
    isPassed: z.boolean(),
  }),
});

export type SaveCalculationInput = z.infer<typeof SaveCalculationSchema>;

// ============================================
// Question Creation (Admin)
// ============================================

export const CreatePassageSchema = z.object({
  contentType: ContentTypeSchema,
  contentText: z.string().optional(),
  mediaUrl: z.string().url().optional(),
  title: z.string().optional(),
  createdBy: z.string().cuid(),
});

export type CreatePassageInput = z.infer<typeof CreatePassageSchema>;

export const CreateQuestionSchema = z.object({
  passageId: z.string().cuid().optional(),
  level: JLPTLevelSchema,
  sectionType: SectionTypeSchema,
  mondaiNumber: z.number().int().min(1).max(14),
  questionNumber: z.number().int().min(1),
  questionText: z.string().min(1),
  blankPosition: z.string().optional(),
  questionType: QuestionTypeSchema.default('standard'),
  mediaUrl: z.string().url().optional(),
  mediaType: z.string().optional(),
  correctAnswer: z.number().int().min(1).max(4),
  difficulty: z.enum(['easy', 'medium', 'hard']).default('medium'),
  createdBy: z.string().cuid(),
});

export type CreateQuestionInput = z.infer<typeof CreateQuestionSchema>;

export const CreateAnswerChoiceSchema = z.object({
  questionId: z.string().cuid(),
  choiceNumber: z.number().int().min(1).max(4),
  choiceType: z.enum(['text', 'image', 'audio']).default('text'),
  choiceText: z.string().optional(),
  choiceMediaUrl: z.string().url().optional(),
  orderIndex: z.number().int().default(0),
});

export type CreateAnswerChoiceInput = z.infer<typeof CreateAnswerChoiceSchema>;

// ============================================
// Query Schemas
// ============================================

export const GetTestHistorySchema = z.object({
  userId: z.string().cuid(),
  level: JLPTLevelSchema.optional(),
  limit: z.number().int().min(1).max(100).default(20),
  offset: z.number().int().min(0).default(0),
});

export type GetTestHistoryInput = z.infer<typeof GetTestHistorySchema>;

export const GetCalculatorHistorySchema = z.object({
  userId: z.string().cuid(),
  level: JLPTLevelSchema.optional(),
  limit: z.number().int().min(1).max(100).default(20),
  offset: z.number().int().min(0).default(0),
});

export type GetCalculatorHistoryInput = z.infer<typeof GetCalculatorHistorySchema>;

export const GetQuestionsSchema = z.object({
  level: JLPTLevelSchema,
  sectionType: SectionTypeSchema.optional(),
  mondaiNumber: z.number().int().min(1).max(14).optional(),
  isActive: z.boolean().default(true),
});

export type GetQuestionsInput = z.infer<typeof GetQuestionsSchema>;

// ============================================
// Validation Helpers
// ============================================

/**
 * Validate JLPT level string
 */
export function isValidJLPTLevel(level: string): level is JLPTLevel {
  return JLPTLevelSchema.safeParse(level).success;
}

/**
 * Validate section type string
 */
export function isValidSectionType(section: string): section is SectionType {
  return SectionTypeSchema.safeParse(section).success;
}

/**
 * Validate answer choice (1-4)
 */
export function isValidAnswerChoice(choice: number): boolean {
  return Number.isInteger(choice) && choice >= 1 && choice <= 4;
}

/**
 * Validate mondai scores for a level
 * Ensures all required mondai are present and counts are correct
 */
export async function validateMondaiScores(
  level: JLPTLevel,
  mondaiScores: z.infer<typeof MondaiScoreSchema>[]
): Promise<{ valid: boolean; errors: string[] }> {
  const errors: string[] = [];

  // Import mondai config dynamically to avoid circular dependency
  const { MONDAI_CONFIG } = await import('@/config/jlpt-mondai');

  // Group by section
  const bySection = mondaiScores.reduce(
    (acc, score) => {
      if (!acc[score.sectionType]) {
        acc[score.sectionType] = [];
      }
      acc[score.sectionType].push(score);
      return acc;
    },
    {} as Record<SectionType, typeof mondaiScores>
  );

  // Validate each section
  const sections: SectionType[] = ['vocabulary', 'grammar_reading', 'listening'];

  for (const section of sections) {
    const sectionScores = bySection[section] || [];
    const expectedMondai = MONDAI_CONFIG[level][section].mondai;

    // Check if all mondai are present
    for (const mondai of expectedMondai) {
      const score = sectionScores.find(s => s.mondaiNumber === mondai.number);

      if (!score) {
        errors.push(`Missing mondai ${mondai.number} for ${section} section`);
        continue;
      }

      // Validate question count
      if (score.total !== mondai.questions_count) {
        errors.push(
          `Invalid question count for ${section} 問題${mondai.number}: expected ${mondai.questions_count}, got ${score.total}`
        );
      }

      // Validate correct count
      if (score.correct > score.total) {
        errors.push(
          `Invalid correct count for ${section} 問題${mondai.number}: ${score.correct} > ${score.total}`
        );
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Sanitize user note text
 */
export function sanitizeUserNote(note: string): string {
  // Remove any potentially dangerous content
  return note.trim().slice(0, 1000);
}

/**
 * Validate test attempt ownership
 */
export function canAccessTestAttempt(attemptUserId: string, requestUserId: string): boolean {
  return attemptUserId === requestUserId;
}
