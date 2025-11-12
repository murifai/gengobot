-- Simplified Feedback System Migration
-- This migration converts from the old numeric score system to the new simplified feedback system

-- ============================================
-- 1. Add new columns to Task table
-- ============================================

-- Add maxMessages column to Task
ALTER TABLE "Task" ADD COLUMN IF NOT EXISTS "maxMessages" INTEGER NOT NULL DEFAULT 30;

-- ============================================
-- 2. Modify TaskAttempt table
-- ============================================

-- Add new simplified feedback system columns
ALTER TABLE "TaskAttempt" ADD COLUMN IF NOT EXISTS "feedback" TEXT;
ALTER TABLE "TaskAttempt" ADD COLUMN IF NOT EXISTS "objectiveCompletionStatus" JSONB;
ALTER TABLE "TaskAttempt" ADD COLUMN IF NOT EXISTS "totalMessages" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "TaskAttempt" ADD COLUMN IF NOT EXISTS "completionDuration" INTEGER;
ALTER TABLE "TaskAttempt" ADD COLUMN IF NOT EXISTS "completionSuggestedAt" TIMESTAMP(3);

-- ============================================
-- 3. Data Migration (Optional)
-- ============================================
-- Migrate existing data from old numeric scores to new feedback JSON
-- This creates a basic SimplifiedAssessment from old scores

UPDATE "TaskAttempt"
SET "feedback" = jsonb_build_object(
  'attemptId', "TaskAttempt"."id",
  'taskId', "TaskAttempt"."taskId",
  'objectives', '[]'::jsonb,
  'objectivesAchieved', 0,
  'totalObjectives', 0,
  'conversationFeedback', jsonb_build_object(
    'strengths', '[]'::jsonb,
    'areasToImprove', '[]'::jsonb,
    'overallFeedback', 'Legacy data - migrated from old system',
    'encouragement', 'Keep practicing!'
  ),
  'statistics', jsonb_build_object(
    'duration', COALESCE(EXTRACT(EPOCH FROM ("TaskAttempt"."endTime" - "TaskAttempt"."startTime"))::integer, 0),
    'durationMinutes', COALESCE(EXTRACT(EPOCH FROM ("TaskAttempt"."endTime" - "TaskAttempt"."startTime"))::integer / 60, 0),
    'totalMessages', 0,
    'userMessagesCount', 0,
    'completionRate', COALESCE(
      CASE
        WHEN EXISTS (
          SELECT 1 FROM information_schema.columns
          WHERE table_name = 'TaskAttempt'
          AND column_name = 'taskAchievement'
        )
        THEN "TaskAttempt"."taskAchievement"
        ELSE 0
      END,
      0
    )
  ),
  'suggestRetry', false,
  'nextSteps', '[]'::jsonb,
  'assessmentDate', COALESCE("TaskAttempt"."endTime", "TaskAttempt"."startTime")
)::text
WHERE "TaskAttempt"."isCompleted" = true
  AND "TaskAttempt"."feedback" IS NULL;

-- ============================================
-- 4. Remove old numeric score columns from TaskAttempt
-- ============================================

-- Drop old score columns if they exist
ALTER TABLE "TaskAttempt" DROP COLUMN IF EXISTS "taskAchievement";
ALTER TABLE "TaskAttempt" DROP COLUMN IF EXISTS "fluency";
ALTER TABLE "TaskAttempt" DROP COLUMN IF EXISTS "vocabularyGrammarAccuracy";
ALTER TABLE "TaskAttempt" DROP COLUMN IF EXISTS "politeness";
ALTER TABLE "TaskAttempt" DROP COLUMN IF EXISTS "overallScore";

-- ============================================
-- 5. Update conversationHistory if needed
-- ============================================

-- Ensure conversationHistory is valid JSON
UPDATE "TaskAttempt"
SET "conversationHistory" = '{"messages": []}'::jsonb
WHERE "conversationHistory" IS NULL
   OR "conversationHistory"::text = 'null'
   OR "conversationHistory"::text = '{}';
