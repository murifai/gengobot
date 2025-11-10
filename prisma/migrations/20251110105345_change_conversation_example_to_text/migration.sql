-- Change conversationExample from JSON array to TEXT field
-- This migration converts the field to store actual conversation dialog

-- First, we need to handle existing data if any
-- Since we're changing from JSON array to TEXT, we'll need to convert or clear existing data

-- Drop the existing column and recreate it as TEXT
-- WARNING: This will lose existing data in conversationExample
ALTER TABLE "Task" DROP COLUMN "conversationExample";
ALTER TABLE "Task" ADD COLUMN "conversationExample" TEXT NOT NULL DEFAULT '';

-- Update the comment
COMMENT ON COLUMN "Task"."conversationExample" IS 'Example conversation dialog (T: teacher, G: student)';
