import { prisma } from '@/lib/prisma';
import { SubscriptionTier, SubscriptionStatus } from '@prisma/client';
import { TIER_CONFIG } from './credit-config';

export type TierChangeType = 'upgrade' | 'downgrade' | 'same' | 'new';

export interface TierChangeValidation {
  allowed: boolean;
  changeType: TierChangeType;
  message: string;
  scheduledForNextPeriod?: boolean;
  currentPeriodEnd?: Date;
}

const TIER_HIERARCHY: Record<SubscriptionTier, number> = {
  FREE: 0,
  BASIC: 1,
  PRO: 2,
};

/**
 * Validate if a user can change to a target tier
 * Rules:
 * - New subscription: Always allowed
 * - Same tier: Blocked (unless there's a scheduled downgrade to cancel)
 * - Upgrade (BASIC → PRO): Allowed immediately
 * - Downgrade (PRO → BASIC): Scheduled for next period
 */
export async function validateTierChange(
  userId: string,
  targetTier: SubscriptionTier
): Promise<TierChangeValidation> {
  const subscription = await prisma.subscription.findUnique({
    where: { userId },
  });

  // No active subscription - allow any tier
  if (!subscription || subscription.status !== SubscriptionStatus.ACTIVE) {
    return {
      allowed: true,
      changeType: 'new',
      message: 'Membuat langganan baru',
    };
  }

  // FREE tier users can always subscribe to paid tiers
  if (subscription.tier === SubscriptionTier.FREE) {
    return {
      allowed: true,
      changeType: 'new',
      message: 'Upgrade dari paket Gratis',
    };
  }

  const currentTierLevel = TIER_HIERARCHY[subscription.tier];
  const targetTierLevel = TIER_HIERARCHY[targetTier];

  // Same tier - check if we should allow extension
  if (subscription.tier === targetTier) {
    // If there's a scheduled downgrade, allow purchase to cancel it and extend
    if (subscription.scheduledTier) {
      return {
        allowed: true,
        changeType: 'same',
        message: `Memperpanjang langganan ${getTierDisplayName(targetTier)} dan membatalkan downgrade yang dijadwalkan`,
      };
    }

    // Block same tier purchase
    return {
      allowed: false,
      changeType: 'same',
      message: `Anda sudah berlangganan ${getTierDisplayName(targetTier)}. Perpanjang langganan akan tersedia saat mendekati masa berakhir.`,
    };
  }

  // Upgrade - allow immediately
  if (targetTierLevel > currentTierLevel) {
    return {
      allowed: true,
      changeType: 'upgrade',
      message: `Upgrade ke ${getTierDisplayName(targetTier)} akan aktif segera`,
    };
  }

  // Downgrade - schedule for next period
  const periodEndDate = subscription.currentPeriodEnd;
  return {
    allowed: true,
    changeType: 'downgrade',
    scheduledForNextPeriod: true,
    currentPeriodEnd: periodEndDate,
    message: `Downgrade ke ${getTierDisplayName(targetTier)} akan aktif pada ${formatDate(periodEndDate)} setelah periode ${getTierDisplayName(subscription.tier)} berakhir`,
  };
}

/**
 * Schedule a tier change for the next billing period (for downgrades)
 */
export async function scheduleTierChange(
  userId: string,
  targetTier: SubscriptionTier,
  durationMonths: number
): Promise<void> {
  const subscription = await prisma.subscription.findUnique({
    where: { userId },
  });

  if (!subscription) {
    throw new Error('Subscription not found');
  }

  await prisma.subscription.update({
    where: { userId },
    data: {
      scheduledTier: targetTier,
      scheduledTierStartAt: subscription.currentPeriodEnd,
      scheduledDurationMonths: durationMonths,
    },
  });
}

/**
 * Cancel a scheduled tier change
 */
export async function cancelScheduledTierChange(userId: string): Promise<void> {
  await prisma.subscription.update({
    where: { userId },
    data: {
      scheduledTier: null,
      scheduledTierStartAt: null,
      scheduledDurationMonths: null,
    },
  });
}

/**
 * Process all scheduled tier changes that are due
 * This should be called by a cron job
 */
export async function processScheduledTierChanges(): Promise<number> {
  const now = new Date();

  // Find subscriptions with scheduled tier changes that are due
  const subscriptionsToProcess = await prisma.subscription.findMany({
    where: {
      scheduledTier: { not: null },
      scheduledTierStartAt: { lte: now },
    },
  });

  let processedCount = 0;

  for (const subscription of subscriptionsToProcess) {
    if (!subscription.scheduledTier) continue;

    const newTier = subscription.scheduledTier;

    // Handle cancellation (downgrade to FREE tier)
    if (newTier === SubscriptionTier.FREE) {
      // For FREE tier, set period end to trial end date or a far future date
      const freeEndDate = new Date(now);
      freeEndDate.setFullYear(freeEndDate.getFullYear() + 100); // Far future for "no expiry"

      await prisma.$transaction([
        // Update subscription to FREE tier
        prisma.subscription.update({
          where: { id: subscription.id },
          data: {
            tier: SubscriptionTier.FREE,
            status: SubscriptionStatus.ACTIVE, // Keep as ACTIVE (FREE tier)
            currentPeriodStart: now,
            currentPeriodEnd: freeEndDate, // FREE tier uses far future date
            creditsTotal: 0,
            creditsUsed: 0,
            creditsRemaining: 0,
            scheduledTier: null,
            scheduledTierStartAt: null,
            scheduledDurationMonths: null,
          },
        }),
        // Record the tier change
        prisma.creditTransaction.create({
          data: {
            userId: subscription.userId,
            type: 'ADJUSTMENT',
            amount: -subscription.creditsRemaining, // Record credits lost
            balance: 0,
            description: `Langganan berakhir - downgrade ke paket Gratis`,
          },
        }),
      ]);

      console.log(
        `[TierChange] Processed cancellation for user ${subscription.userId}: ${subscription.tier} → FREE`
      );
    } else {
      // Handle downgrade to paid tier (e.g., PRO → BASIC)
      const durationMonths = subscription.scheduledDurationMonths || 1;
      const tierConfig = TIER_CONFIG[newTier];
      const totalCredits = tierConfig.monthlyCredits * durationMonths;

      const periodEnd = new Date(now);
      periodEnd.setMonth(periodEnd.getMonth() + durationMonths);

      await prisma.$transaction([
        // Update subscription
        prisma.subscription.update({
          where: { id: subscription.id },
          data: {
            tier: newTier,
            status: SubscriptionStatus.ACTIVE,
            currentPeriodStart: now,
            currentPeriodEnd: periodEnd,
            creditsTotal: totalCredits,
            creditsUsed: 0,
            creditsRemaining: totalCredits,
            scheduledTier: null,
            scheduledTierStartAt: null,
            scheduledDurationMonths: null,
          },
        }),
        // Create credit transaction
        prisma.creditTransaction.create({
          data: {
            userId: subscription.userId,
            type: 'GRANT',
            amount: totalCredits,
            balance: totalCredits,
            description: `Scheduled tier change to ${newTier} - ${durationMonths} month(s)`,
          },
        }),
      ]);

      console.log(
        `[TierChange] Processed downgrade for user ${subscription.userId}: ${subscription.tier} → ${newTier}`
      );
    }

    processedCount++;
  }

  return processedCount;
}

/**
 * Get subscription info with tier change status
 */
export async function getSubscriptionWithTierChangeInfo(userId: string) {
  const subscription = await prisma.subscription.findUnique({
    where: { userId },
  });

  if (!subscription) return null;

  return {
    ...subscription,
    hasScheduledChange: !!subscription.scheduledTier,
    scheduledChangeInfo: subscription.scheduledTier
      ? {
          tier: subscription.scheduledTier,
          startsAt: subscription.scheduledTierStartAt,
          durationMonths: subscription.scheduledDurationMonths,
        }
      : null,
  };
}

/**
 * Cancel subscription - schedule downgrade to FREE tier at period end
 * User keeps their credits until the period ends
 */
export async function cancelSubscription(userId: string): Promise<{
  success: boolean;
  message: string;
  cancelDate?: Date;
}> {
  const subscription = await prisma.subscription.findUnique({
    where: { userId },
  });

  if (!subscription) {
    return {
      success: false,
      message: 'Langganan tidak ditemukan',
    };
  }

  // Already FREE tier
  if (subscription.tier === SubscriptionTier.FREE) {
    return {
      success: false,
      message: 'Anda sudah menggunakan paket Gratis',
    };
  }

  // Already has cancellation scheduled
  if (subscription.scheduledTier === SubscriptionTier.FREE) {
    return {
      success: false,
      message: `Pembatalan sudah dijadwalkan untuk ${formatDate(subscription.scheduledTierStartAt || subscription.currentPeriodEnd)}`,
    };
  }

  // Schedule cancellation (downgrade to FREE) at period end
  // IMPORTANT: Keep status as ACTIVE so user can still use credits until period end
  await prisma.subscription.update({
    where: { userId },
    data: {
      scheduledTier: SubscriptionTier.FREE,
      scheduledTierStartAt: subscription.currentPeriodEnd,
      scheduledDurationMonths: null, // FREE tier doesn't have duration
      // DO NOT change status to CANCELED here - keep ACTIVE until period ends
      // The cron job will handle the actual transition to FREE tier
    },
  });

  // Record the cancellation
  await prisma.creditTransaction.create({
    data: {
      userId,
      type: 'ADJUSTMENT',
      amount: 0,
      balance: subscription.creditsRemaining,
      description: `Langganan ${getTierDisplayName(subscription.tier)} dibatalkan - aktif hingga ${formatDate(subscription.currentPeriodEnd)}`,
    },
  });

  return {
    success: true,
    message: `Langganan Anda akan berakhir pada ${formatDate(subscription.currentPeriodEnd)}. Anda masih dapat menggunakan kredit hingga tanggal tersebut.`,
    cancelDate: subscription.currentPeriodEnd,
  };
}

/**
 * Reactivate a canceled subscription (undo cancellation)
 */
export async function reactivateSubscription(userId: string): Promise<{
  success: boolean;
  message: string;
}> {
  const subscription = await prisma.subscription.findUnique({
    where: { userId },
  });

  if (!subscription) {
    return {
      success: false,
      message: 'Langganan tidak ditemukan',
    };
  }

  // Check if there's a cancellation scheduled
  if (subscription.scheduledTier !== SubscriptionTier.FREE) {
    return {
      success: false,
      message: 'Tidak ada pembatalan yang dijadwalkan',
    };
  }

  // Remove the scheduled cancellation
  await prisma.subscription.update({
    where: { userId },
    data: {
      scheduledTier: null,
      scheduledTierStartAt: null,
      scheduledDurationMonths: null,
      status: SubscriptionStatus.ACTIVE, // Restore active status
    },
  });

  return {
    success: true,
    message: `Pembatalan dibatalkan. Langganan ${getTierDisplayName(subscription.tier)} Anda akan berlanjut.`,
  };
}

/**
 * Check if subscription is scheduled for cancellation
 */
export async function getCancellationStatus(userId: string): Promise<{
  isCanceled: boolean;
  cancelDate?: Date;
  currentTier?: SubscriptionTier;
}> {
  const subscription = await prisma.subscription.findUnique({
    where: { userId },
  });

  if (!subscription) {
    return { isCanceled: false };
  }

  const isCanceled = subscription.scheduledTier === SubscriptionTier.FREE;

  return {
    isCanceled,
    cancelDate: isCanceled ? subscription.scheduledTierStartAt || undefined : undefined,
    currentTier: subscription.tier,
  };
}

// Helper functions
function getTierDisplayName(tier: SubscriptionTier): string {
  switch (tier) {
    case SubscriptionTier.FREE:
      return 'Gratis';
    case SubscriptionTier.BASIC:
      return 'Basic';
    case SubscriptionTier.PRO:
      return 'Pro';
    default:
      return tier;
  }
}

function formatDate(date: Date): string {
  return date.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}
