-- Migration: Add TrialHistory table and new NotificationType enum values
-- This migration only includes changes that are not yet in production

-- AlterEnum: Add new notification types for subscription expiry reminders
ALTER TYPE "NotificationType" ADD VALUE 'SUBSCRIPTION_EXPIRING_3_DAYS';
ALTER TYPE "NotificationType" ADD VALUE 'SUBSCRIPTION_EXPIRING_1_DAY';
ALTER TYPE "NotificationType" ADD VALUE 'SUBSCRIPTION_EXPIRED';

-- CreateTable: TrialHistory for anti-abuse tracking
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
CREATE UNIQUE INDEX "TrialHistory_userId_key" ON "TrialHistory"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "TrialHistory_email_key" ON "TrialHistory"("email");

-- CreateIndex
CREATE INDEX "TrialHistory_email_idx" ON "TrialHistory"("email");

-- CreateIndex
CREATE INDEX "TrialHistory_userId_idx" ON "TrialHistory"("userId");

-- AddForeignKey
ALTER TABLE "TrialHistory" ADD CONSTRAINT "TrialHistory_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
