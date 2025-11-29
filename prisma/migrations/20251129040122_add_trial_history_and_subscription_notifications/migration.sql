/*
  Warnings:

  - You are about to drop the column `assignedTasks` on the `Character` table. All the data in the column will be lost.
  - You are about to drop the column `personality` on the `Character` table. All the data in the column will be lost.
  - You are about to drop the column `taskSpecific` on the `Character` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[shareToken]` on the table `Deck` will be added. If there are existing duplicate values, this will fail.
  - Made the column `voice` on table `Character` required. This step will fail if there are existing NULL values in that column.
  - Made the column `relationshipType` on table `Character` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "NotificationType" ADD VALUE 'SUBSCRIPTION_EXPIRING_3_DAYS';
ALTER TYPE "NotificationType" ADD VALUE 'SUBSCRIPTION_EXPIRING_1_DAY';
ALTER TYPE "NotificationType" ADD VALUE 'SUBSCRIPTION_EXPIRED';

-- DropIndex
DROP INDEX "Character_taskSpecific_idx";

-- AlterTable
ALTER TABLE "Character" DROP COLUMN "assignedTasks",
DROP COLUMN "personality",
DROP COLUMN "taskSpecific",
ADD COLUMN     "nameRomaji" TEXT,
ADD COLUMN     "relationshipCustom" TEXT,
ALTER COLUMN "voice" SET NOT NULL,
ALTER COLUMN "voice" SET DEFAULT 'alloy',
ALTER COLUMN "relationshipType" SET NOT NULL,
ALTER COLUMN "relationshipType" SET DEFAULT 'teman';

-- AlterTable
ALTER TABLE "Deck" ADD COLUMN     "shareToken" TEXT;

-- AlterTable
ALTER TABLE "Flashcard" ADD COLUMN     "audioUrl" TEXT,
ADD COLUMN     "character" TEXT,
ADD COLUMN     "exampleAudioUrl" TEXT,
ADD COLUMN     "romaji" TEXT,
ADD COLUMN     "strokeSvg" TEXT;

-- AlterTable
ALTER TABLE "Subscription" ADD COLUMN     "scheduledDurationMonths" INTEGER,
ADD COLUMN     "scheduledTier" "SubscriptionTier",
ADD COLUMN     "scheduledTierStartAt" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "UserFavorite" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "deckId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserFavorite_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserStudyingDeck" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "deckId" TEXT NOT NULL,
    "lastStudied" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserStudyingDeck_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DictionaryEntry" (
    "id" TEXT NOT NULL,
    "entryId" INTEGER NOT NULL,
    "kanji" TEXT[],
    "readings" TEXT[],
    "meaningsEn" TEXT[],
    "meaningsId" TEXT[],
    "partsOfSpeech" TEXT[],
    "jlptLevel" TEXT,
    "priority" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DictionaryEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TrialHistory" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "email" TEXT NOT NULL,
    "trialStartedAt" TIMESTAMP(3) NOT NULL,
    "trialEndedAt" TIMESTAMP(3),
    "trialCreditsUsed" INTEGER NOT NULL DEFAULT 0,
    "hasUsedTrial" BOOLEAN NOT NULL DEFAULT true,
    "wasUpgraded" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TrialHistory_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "UserFavorite_userId_idx" ON "UserFavorite"("userId");

-- CreateIndex
CREATE INDEX "UserFavorite_deckId_idx" ON "UserFavorite"("deckId");

-- CreateIndex
CREATE UNIQUE INDEX "UserFavorite_userId_deckId_key" ON "UserFavorite"("userId", "deckId");

-- CreateIndex
CREATE INDEX "UserStudyingDeck_userId_idx" ON "UserStudyingDeck"("userId");

-- CreateIndex
CREATE INDEX "UserStudyingDeck_deckId_idx" ON "UserStudyingDeck"("deckId");

-- CreateIndex
CREATE INDEX "UserStudyingDeck_lastStudied_idx" ON "UserStudyingDeck"("lastStudied");

-- CreateIndex
CREATE UNIQUE INDEX "UserStudyingDeck_userId_deckId_key" ON "UserStudyingDeck"("userId", "deckId");

-- CreateIndex
CREATE UNIQUE INDEX "DictionaryEntry_entryId_key" ON "DictionaryEntry"("entryId");

-- CreateIndex
CREATE INDEX "DictionaryEntry_kanji_idx" ON "DictionaryEntry"("kanji");

-- CreateIndex
CREATE INDEX "DictionaryEntry_readings_idx" ON "DictionaryEntry"("readings");

-- CreateIndex
CREATE INDEX "DictionaryEntry_jlptLevel_idx" ON "DictionaryEntry"("jlptLevel");

-- CreateIndex
CREATE INDEX "DictionaryEntry_priority_idx" ON "DictionaryEntry"("priority");

-- CreateIndex
CREATE UNIQUE INDEX "TrialHistory_userId_key" ON "TrialHistory"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "TrialHistory_email_key" ON "TrialHistory"("email");

-- CreateIndex
CREATE INDEX "TrialHistory_email_idx" ON "TrialHistory"("email");

-- CreateIndex
CREATE INDEX "TrialHistory_userId_idx" ON "TrialHistory"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Deck_shareToken_key" ON "Deck"("shareToken");

-- CreateIndex
CREATE INDEX "Deck_shareToken_idx" ON "Deck"("shareToken");

-- CreateIndex
CREATE INDEX "Subscription_scheduledTierStartAt_idx" ON "Subscription"("scheduledTierStartAt");

-- AddForeignKey
ALTER TABLE "UserFavorite" ADD CONSTRAINT "UserFavorite_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserFavorite" ADD CONSTRAINT "UserFavorite_deckId_fkey" FOREIGN KEY ("deckId") REFERENCES "Deck"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserStudyingDeck" ADD CONSTRAINT "UserStudyingDeck_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserStudyingDeck" ADD CONSTRAINT "UserStudyingDeck_deckId_fkey" FOREIGN KEY ("deckId") REFERENCES "Deck"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TrialHistory" ADD CONSTRAINT "TrialHistory_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
