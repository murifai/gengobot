-- CreateEnum
CREATE TYPE "SubscriptionTier" AS ENUM ('FREE', 'BASIC', 'PRO');

-- CreateEnum
CREATE TYPE "SubscriptionStatus" AS ENUM ('ACTIVE', 'PAST_DUE', 'CANCELED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "CreditTransactionType" AS ENUM ('GRANT', 'TRIAL_GRANT', 'USAGE', 'REFUND', 'ADJUSTMENT', 'BONUS');

-- CreateEnum
CREATE TYPE "UsageType" AS ENUM ('VOICE_STANDARD', 'REALTIME', 'TEXT_CHAT');

-- CreateEnum
CREATE TYPE "VoucherType" AS ENUM ('PERCENTAGE', 'FIXED_AMOUNT', 'BONUS_CREDITS', 'TRIAL_EXTENSION', 'TIER_UPGRADE');

-- CreateEnum
CREATE TYPE "RedemptionStatus" AS ENUM ('APPLIED', 'EXPIRED', 'REVOKED');

-- CreateTable
CREATE TABLE "Subscription" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "tier" "SubscriptionTier" NOT NULL DEFAULT 'FREE',
    "status" "SubscriptionStatus" NOT NULL DEFAULT 'ACTIVE',
    "currentPeriodStart" TIMESTAMP(3) NOT NULL,
    "currentPeriodEnd" TIMESTAMP(3) NOT NULL,
    "creditsTotal" INTEGER NOT NULL DEFAULT 0,
    "creditsUsed" INTEGER NOT NULL DEFAULT 0,
    "creditsRemaining" INTEGER NOT NULL DEFAULT 0,
    "trialStartDate" TIMESTAMP(3),
    "trialEndDate" TIMESTAMP(3),
    "trialCreditsUsed" INTEGER NOT NULL DEFAULT 0,
    "trialDailyUsed" INTEGER NOT NULL DEFAULT 0,
    "trialDailyReset" TIMESTAMP(3),
    "customCharactersUsed" INTEGER NOT NULL DEFAULT 0,
    "xenditCustomerId" TEXT,
    "xenditRecurringId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Subscription_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CreditTransaction" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" "CreditTransactionType" NOT NULL,
    "amount" INTEGER NOT NULL,
    "balance" INTEGER NOT NULL,
    "usageType" "UsageType",
    "durationSecs" INTEGER,
    "referenceId" TEXT,
    "referenceType" TEXT,
    "description" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CreditTransaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Voucher" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "type" "VoucherType" NOT NULL,
    "value" INTEGER NOT NULL,
    "maxUses" INTEGER,
    "usesPerUser" INTEGER NOT NULL DEFAULT 1,
    "currentUses" INTEGER NOT NULL DEFAULT 0,
    "startDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endDate" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "newUsersOnly" BOOLEAN NOT NULL DEFAULT false,
    "applicableTiers" "SubscriptionTier"[],
    "minMonths" INTEGER,
    "isStackable" BOOLEAN NOT NULL DEFAULT false,
    "isExclusive" BOOLEAN NOT NULL DEFAULT false,
    "createdBy" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Voucher_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VoucherRedemption" (
    "id" TEXT NOT NULL,
    "voucherId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "subscriptionId" TEXT,
    "discountType" "VoucherType" NOT NULL,
    "discountValue" INTEGER NOT NULL,
    "originalAmount" INTEGER,
    "finalAmount" INTEGER,
    "status" "RedemptionStatus" NOT NULL DEFAULT 'APPLIED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "VoucherRedemption_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Subscription_userId_key" ON "Subscription"("userId");

-- CreateIndex
CREATE INDEX "Subscription_tier_idx" ON "Subscription"("tier");

-- CreateIndex
CREATE INDEX "Subscription_status_idx" ON "Subscription"("status");

-- CreateIndex
CREATE INDEX "CreditTransaction_userId_createdAt_idx" ON "CreditTransaction"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "CreditTransaction_type_createdAt_idx" ON "CreditTransaction"("type", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "Voucher_code_key" ON "Voucher"("code");

-- CreateIndex
CREATE INDEX "Voucher_code_idx" ON "Voucher"("code");

-- CreateIndex
CREATE INDEX "Voucher_isActive_endDate_idx" ON "Voucher"("isActive", "endDate");

-- CreateIndex
CREATE INDEX "VoucherRedemption_userId_idx" ON "VoucherRedemption"("userId");

-- CreateIndex
CREATE INDEX "VoucherRedemption_voucherId_idx" ON "VoucherRedemption"("voucherId");

-- CreateIndex
CREATE UNIQUE INDEX "VoucherRedemption_voucherId_userId_key" ON "VoucherRedemption"("voucherId", "userId");

-- AddForeignKey
ALTER TABLE "Subscription" ADD CONSTRAINT "Subscription_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CreditTransaction" ADD CONSTRAINT "CreditTransaction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VoucherRedemption" ADD CONSTRAINT "VoucherRedemption_voucherId_fkey" FOREIGN KEY ("voucherId") REFERENCES "Voucher"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VoucherRedemption" ADD CONSTRAINT "VoucherRedemption_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
