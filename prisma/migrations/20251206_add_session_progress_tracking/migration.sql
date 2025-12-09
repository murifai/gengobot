-- AlterTable
ALTER TABLE "StudySession" ADD COLUMN "currentCardIndex" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "StudySession" ADD COLUMN "cardOrder" JSONB;
ALTER TABLE "StudySession" ADD COLUMN "reviewedCardIds" JSONB;
