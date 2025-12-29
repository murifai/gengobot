import { z } from 'zod';

// Passage validation schema
export const passageSchema = z.object({
  content_type: z.enum(['text', 'audio', 'image']),
  title: z.string().min(1, 'Passage title required').optional(),
  content_text: z.string().optional(),
  media_url: z.string().url().optional(),
}).refine(
  (data) => {
    if (data.content_type === 'text') {
      return !!data.content_text;
    }
    return !!data.media_url;
  },
  {
    message: 'Text passages need content_text, audio/image need media_url',
  }
);

// Answer choice validation schema
export const answerChoiceSchema = z.object({
  choice_number: z.number().min(1).max(4),
  choice_text: z.string().min(1, 'Choice text required').optional(),
  choice_media_url: z.string().url().optional(),
  choice_type: z.enum(['text', 'audio', 'image']).default('text'),
  order_index: z.number().default(0),
}).refine(
  (data) => data.choice_text || data.choice_media_url,
  {
    message: 'Each choice must have either text or media',
  }
);

// Question validation schema
export const questionSchema = z.object({
  level: z.enum(['N1', 'N2', 'N3', 'N4', 'N5']),
  section_type: z.enum(['vocabulary', 'grammar_reading', 'listening']),
  mondai_number: z.number().min(1).max(20),
  question_number: z.number().min(1),
  question_text: z.string().min(1, 'Question text required'),
  question_type: z.enum(['standard', 'cloze', 'comparison', 'graphic']).default('standard'),
  mondai_explanation: z.string().optional(),
  blank_position: z.string().optional(),
  media_url: z.string().url().optional(),
  media_type: z.enum(['audio', 'image']).optional(),
  correct_answer: z.number().min(1).max(4),
  difficulty: z.enum(['easy', 'medium', 'hard']).default('medium'),
  answer_choices: z.array(answerChoiceSchema).min(3).max(4),
  passage_id: z.string().optional(),
}).refine(
  (data) => data.correct_answer <= data.answer_choices.length,
  {
    message: 'Correct answer must match an existing choice',
  }
);

// Create question request (includes passage if needed)
export const createQuestionRequestSchema = z.object({
  question: questionSchema,
  passage: passageSchema.optional(),
  passage_secondary: passageSchema.optional(), // For A-B comparison
});

// Bulk import validation schema
export const bulkImportSchema = z.object({
  level: z.enum(['N1', 'N2', 'N3', 'N4', 'N5']),
  section_type: z.enum(['vocabulary', 'grammar_reading', 'listening']),
  mondai_number: z.number().min(1).max(20),
  passages: z.array(passageSchema).optional(),
  questions: z.array(questionSchema).min(1),
});

// Types derived from schemas
export type PassageInput = z.infer<typeof passageSchema>;
export type AnswerChoiceInput = z.infer<typeof answerChoiceSchema>;
export type QuestionInput = z.infer<typeof questionSchema>;
export type CreateQuestionRequest = z.infer<typeof createQuestionRequestSchema>;
export type BulkImportRequest = z.infer<typeof bulkImportSchema>;
