/*
  Warnings:

  - You are about to drop the column `characterId` on the `Task` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Task" DROP CONSTRAINT "Task_characterId_fkey";

-- AlterTable
ALTER TABLE "Task" DROP COLUMN "characterId",
ADD COLUMN     "audioExample" TEXT,
ADD COLUMN     "prompt" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "speakingSpeed" DOUBLE PRECISION NOT NULL DEFAULT 1.0,
ADD COLUMN     "voice" TEXT NOT NULL DEFAULT 'alloy';
