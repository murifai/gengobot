-- AlterTable
ALTER TABLE "Task" RENAME COLUMN "successCriteria" TO "conversationExample";

-- Update comments
COMMENT ON COLUMN "Task"."conversationExample" IS 'Example conversation flow';
