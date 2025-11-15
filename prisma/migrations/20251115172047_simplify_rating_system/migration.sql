-- AlterTable: Add new columns first
ALTER TABLE "StudySession" ADD COLUMN "belumHafalCount" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "StudySession" ADD COLUMN "hafalCount" INTEGER NOT NULL DEFAULT 0;

-- Migrate existing data:
-- belumHafalCount = againCount (cards not memorized)
-- hafalCount = hardCount + goodCount + easyCount (cards with varying degrees of memorization)
UPDATE "StudySession"
SET "belumHafalCount" = "againCount",
    "hafalCount" = "hardCount" + "goodCount" + "easyCount";

-- Drop old columns
ALTER TABLE "StudySession" DROP COLUMN "againCount";
ALTER TABLE "StudySession" DROP COLUMN "hardCount";
ALTER TABLE "StudySession" DROP COLUMN "goodCount";
ALTER TABLE "StudySession" DROP COLUMN "easyCount";
