-- Add discount columns to SubscriptionTierConfig
-- These columns store percentage discounts for different subscription durations

-- Drop priceAnnual column if it exists (replaced by discount system)
ALTER TABLE "SubscriptionTierConfig" DROP COLUMN IF EXISTS "priceAnnual";

-- Add discount percentage columns
ALTER TABLE "SubscriptionTierConfig" ADD COLUMN IF NOT EXISTS "discount3Months" INTEGER NOT NULL DEFAULT 10;
ALTER TABLE "SubscriptionTierConfig" ADD COLUMN IF NOT EXISTS "discount6Months" INTEGER NOT NULL DEFAULT 20;
ALTER TABLE "SubscriptionTierConfig" ADD COLUMN IF NOT EXISTS "discount12Months" INTEGER NOT NULL DEFAULT 30;
