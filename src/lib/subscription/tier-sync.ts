import { prisma } from '@/lib/prisma';
import { SubscriptionTier, SubscriptionStatus } from '@prisma/client';

/**
 * Tier sync utility
 *
 * The Subscription model is the single source of truth for user tiers.
 * User.subscriptionPlan is a legacy field kept for backward compatibility.
 *
 * This utility provides:
 * 1. getEffectiveTier() - Get the actual tier from Subscription model
 * 2. syncUserTier() - Sync User.subscriptionPlan from Subscription.tier
 * 3. getTierDisplayName() - Get display name for tier
 */

// Map SubscriptionTier enum to legacy subscriptionPlan string
const TIER_TO_PLAN_MAP: Record<SubscriptionTier, string> = {
  [SubscriptionTier.FREE]: 'free',
  [SubscriptionTier.BASIC]: 'basic',
  [SubscriptionTier.PRO]: 'premium', // PRO maps to 'premium' for legacy compatibility
};

// Map legacy plan strings to SubscriptionTier enum
const PLAN_TO_TIER_MAP: Record<string, SubscriptionTier> = {
  free: SubscriptionTier.FREE,
  basic: SubscriptionTier.BASIC,
  premium: SubscriptionTier.PRO,
  pro: SubscriptionTier.PRO,
};

// Display names for tiers
const TIER_DISPLAY_NAMES: Record<SubscriptionTier, string> = {
  [SubscriptionTier.FREE]: 'Free',
  [SubscriptionTier.BASIC]: 'Basic',
  [SubscriptionTier.PRO]: 'Pro',
};

/**
 * Get the effective tier for a user from the Subscription model
 * Returns FREE if no active subscription exists
 */
export async function getEffectiveTier(userId: string): Promise<SubscriptionTier> {
  const subscription = await prisma.subscription.findUnique({
    where: { userId },
    select: { tier: true, status: true },
  });

  // Only return paid tier if subscription is active
  if (subscription && subscription.status === SubscriptionStatus.ACTIVE) {
    return subscription.tier;
  }

  return SubscriptionTier.FREE;
}

/**
 * Get user's subscription with tier info
 * @deprecated Use creditService.getOrCreateSubscription() instead - it properly checks trial eligibility
 */
export async function getOrCreateSubscription(userId: string) {
  const subscription = await prisma.subscription.findUnique({
    where: { userId },
  });

  if (!subscription) {
    throw new Error(
      'Use creditService.getOrCreateSubscription() to create subscriptions with proper trial eligibility check'
    );
  }

  return subscription;
}

/**
 * Sync User.subscriptionPlan from Subscription.tier
 * Call this after subscription changes to keep legacy field updated
 */
export async function syncUserTier(userId: string): Promise<void> {
  const effectiveTier = await getEffectiveTier(userId);
  const planValue = TIER_TO_PLAN_MAP[effectiveTier];

  await prisma.user.update({
    where: { id: userId },
    data: { subscriptionPlan: planValue },
  });
}

/**
 * Sync all users' subscriptionPlan from their Subscription.tier
 * Use for data migration or batch sync
 */
export async function syncAllUserTiers(): Promise<{ synced: number; errors: number }> {
  const users = await prisma.user.findMany({
    select: { id: true },
  });

  let synced = 0;
  let errors = 0;

  for (const user of users) {
    try {
      await syncUserTier(user.id);
      synced++;
    } catch (error) {
      console.error(`Error syncing tier for user ${user.id}:`, error);
      errors++;
    }
  }

  return { synced, errors };
}

/**
 * Check if user has a specific tier or higher
 */
export async function hasTierOrHigher(
  userId: string,
  requiredTier: SubscriptionTier
): Promise<boolean> {
  const effectiveTier = await getEffectiveTier(userId);

  const tierOrder = [SubscriptionTier.FREE, SubscriptionTier.BASIC, SubscriptionTier.PRO];
  const userTierIndex = tierOrder.indexOf(effectiveTier);
  const requiredTierIndex = tierOrder.indexOf(requiredTier);

  return userTierIndex >= requiredTierIndex;
}

/**
 * Check if user is on a paid tier (BASIC or PRO)
 */
export async function isPaidTier(userId: string): Promise<boolean> {
  const effectiveTier = await getEffectiveTier(userId);
  return effectiveTier !== SubscriptionTier.FREE;
}

/**
 * Get display name for a tier
 */
export function getTierDisplayName(tier: SubscriptionTier): string {
  return TIER_DISPLAY_NAMES[tier];
}

/**
 * Convert legacy plan string to SubscriptionTier
 */
export function planToTier(plan: string): SubscriptionTier {
  return PLAN_TO_TIER_MAP[plan.toLowerCase()] || SubscriptionTier.FREE;
}

/**
 * Convert SubscriptionTier to legacy plan string
 */
export function tierToPlan(tier: SubscriptionTier): string {
  return TIER_TO_PLAN_MAP[tier];
}
