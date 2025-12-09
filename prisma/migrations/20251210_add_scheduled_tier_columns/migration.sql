-- Add scheduled tier change columns to Subscription
-- These columns track when a user has scheduled a tier change (e.g., downgrade at period end)

-- Add scheduledTier column (nullable enum for the tier to change to)
ALTER TABLE "Subscription" ADD COLUMN IF NOT EXISTS "scheduledTier" "SubscriptionTier";

-- Add scheduledTierStartAt column (when the tier change should take effect)
ALTER TABLE "Subscription" ADD COLUMN IF NOT EXISTS "scheduledTierStartAt" TIMESTAMP(3);

-- Add scheduledDurationMonths column (duration for the new subscription period)
ALTER TABLE "Subscription" ADD COLUMN IF NOT EXISTS "scheduledDurationMonths" INTEGER;

-- Create index for efficient lookups of scheduled tier changes
CREATE INDEX IF NOT EXISTS "Subscription_scheduledTierStartAt_idx" ON "Subscription"("scheduledTierStartAt");
