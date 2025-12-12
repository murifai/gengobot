import { prisma } from '@/lib/prisma';
import {
  CreditTransactionType,
  SubscriptionStatus,
  SubscriptionTier,
  Subscription,
} from '@prisma/client';
import { TIER_CONFIG } from './credit-config';
import { checkTrialEligibility, recordTrialStart } from './trial-history-service';

export interface TrialStatus {
  isActive: boolean;
  daysRemaining: number;
  creditsRemaining: number;
  creditsUsed: number;
  dailyUsed: number;
  dailyLimit: number;
  startDate: Date | null;
  endDate: Date | null;
  hasExpired: boolean;
  percentageUsed: number;
  dailyPercentageUsed: number;
}

export interface TrialExtensionResult {
  success: boolean;
  newEndDate?: Date;
  additionalDays?: number;
  error?: string;
}

export class TrialService {
  /**
   * Start trial for a new user
   */
  async startTrial(userId: string): Promise<Subscription> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { email: true, subscription: { select: { id: true } } },
    });

    if (user?.subscription) {
      throw new Error('User already has a subscription');
    }

    if (!user?.email) {
      throw new Error('User email not found');
    }

    const now = new Date();
    const trialEnd = new Date(now);
    trialEnd.setDate(trialEnd.getDate() + TIER_CONFIG[SubscriptionTier.FREE].trialDays);

    const subscription = await prisma.subscription.create({
      data: {
        userId,
        tier: SubscriptionTier.FREE,
        status: SubscriptionStatus.ACTIVE,
        currentPeriodStart: now,
        currentPeriodEnd: trialEnd,
        trialStartDate: now,
        trialEndDate: trialEnd,
        trialDailyReset: this.getNextMidnight(),
      },
    });

    // Record trial grant transaction
    await prisma.creditTransaction.create({
      data: {
        userId,
        type: CreditTransactionType.TRIAL_GRANT,
        amount: TIER_CONFIG[SubscriptionTier.FREE].trialCredits,
        balance: TIER_CONFIG[SubscriptionTier.FREE].trialCredits,
        description: 'Trial credits granted - 14 day trial started',
      },
    });

    // Record trial start in history (prevents re-registering to get new trial)
    await recordTrialStart(userId, user.email);

    return subscription;
  }

  /**
   * Get trial status for a user
   */
  async getTrialStatus(userId: string): Promise<TrialStatus> {
    const subscription = await prisma.subscription.findUnique({
      where: { userId },
    });

    if (!subscription) {
      // Return default trial status for new user
      const tierConfig = TIER_CONFIG[SubscriptionTier.FREE];
      return {
        isActive: false,
        daysRemaining: tierConfig.trialDays,
        creditsRemaining: tierConfig.trialCredits,
        creditsUsed: 0,
        dailyUsed: 0,
        dailyLimit: tierConfig.trialDailyLimit,
        startDate: null,
        endDate: null,
        hasExpired: false,
        percentageUsed: 0,
        dailyPercentageUsed: 0,
      };
    }

    // Not a trial user
    if (subscription.tier !== SubscriptionTier.FREE) {
      return {
        isActive: false,
        daysRemaining: 0,
        creditsRemaining: subscription.creditsRemaining,
        creditsUsed: subscription.creditsUsed,
        dailyUsed: 0,
        dailyLimit: 0,
        startDate: null,
        endDate: null,
        hasExpired: false,
        percentageUsed: 0,
        dailyPercentageUsed: 0,
      };
    }

    const tierConfig = TIER_CONFIG[SubscriptionTier.FREE];
    const now = new Date();
    const isActive = subscription.trialEndDate ? now < subscription.trialEndDate : false;
    const hasExpired = subscription.trialEndDate ? now >= subscription.trialEndDate : false;

    const daysRemaining = subscription.trialEndDate
      ? Math.max(
          0,
          Math.ceil((subscription.trialEndDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
        )
      : 0;

    const creditsRemaining = tierConfig.trialCredits - subscription.trialCreditsUsed;
    const percentageUsed = (subscription.trialCreditsUsed / tierConfig.trialCredits) * 100;
    const dailyPercentageUsed = (subscription.trialDailyUsed / tierConfig.trialDailyLimit) * 100;

    return {
      isActive,
      daysRemaining,
      creditsRemaining,
      creditsUsed: subscription.trialCreditsUsed,
      dailyUsed: subscription.trialDailyUsed,
      dailyLimit: tierConfig.trialDailyLimit,
      startDate: subscription.trialStartDate,
      endDate: subscription.trialEndDate,
      hasExpired,
      percentageUsed,
      dailyPercentageUsed,
    };
  }

  /**
   * Reset daily trial usage for all trial users (cron job)
   */
  async resetDailyUsage(): Promise<{ count: number; timestamp: Date }> {
    const now = new Date();

    const result = await prisma.subscription.updateMany({
      where: {
        tier: SubscriptionTier.FREE,
        status: SubscriptionStatus.ACTIVE,
        trialEndDate: { gte: now },
      },
      data: {
        trialDailyUsed: 0,
        trialDailyReset: this.getNextMidnight(),
      },
    });

    // Log the reset
    console.log(
      `[TrialService] Daily usage reset for ${result.count} trial users at ${now.toISOString()}`
    );

    return {
      count: result.count,
      timestamp: now,
    };
  }

  /**
   * Handle trial expiration for a user
   */
  async handleExpiration(userId: string): Promise<void> {
    const subscription = await prisma.subscription.findUnique({
      where: { userId },
    });

    if (!subscription || subscription.tier !== SubscriptionTier.FREE) {
      return;
    }

    // Check if trial has expired
    if (subscription.trialEndDate && new Date() >= subscription.trialEndDate) {
      await prisma.subscription.update({
        where: { userId },
        data: {
          status: SubscriptionStatus.EXPIRED,
        },
      });

      // Record expiration transaction
      await prisma.creditTransaction.create({
        data: {
          userId,
          type: CreditTransactionType.ADJUSTMENT,
          amount: 0,
          balance: 0,
          description: 'Trial period expired',
        },
      });
    }
  }

  /**
   * Process all expired trials (cron job)
   */
  async processExpiredTrials(): Promise<{ processed: number; timestamp: Date }> {
    const now = new Date();

    // Find all expired trials that are still marked as active
    const expiredTrials = await prisma.subscription.findMany({
      where: {
        tier: SubscriptionTier.FREE,
        status: SubscriptionStatus.ACTIVE,
        trialEndDate: { lt: now },
      },
      select: {
        userId: true,
      },
    });

    // Update all expired trials
    const result = await prisma.subscription.updateMany({
      where: {
        tier: SubscriptionTier.FREE,
        status: SubscriptionStatus.ACTIVE,
        trialEndDate: { lt: now },
      },
      data: {
        status: SubscriptionStatus.EXPIRED,
      },
    });

    // Create transactions for expired trials
    if (expiredTrials.length > 0) {
      await prisma.creditTransaction.createMany({
        data: expiredTrials.map(trial => ({
          userId: trial.userId,
          type: CreditTransactionType.ADJUSTMENT,
          amount: 0,
          balance: 0,
          description: 'Trial period expired',
        })),
      });
    }

    console.log(`[TrialService] Processed ${result.count} expired trials at ${now.toISOString()}`);

    return {
      processed: result.count,
      timestamp: now,
    };
  }

  /**
   * Extend trial for a user (e.g., via voucher)
   */
  async extendTrial(userId: string, additionalDays: number): Promise<TrialExtensionResult> {
    const subscription = await prisma.subscription.findUnique({
      where: { userId },
    });

    if (!subscription) {
      return {
        success: false,
        error: 'Subscription not found',
      };
    }

    if (subscription.tier !== SubscriptionTier.FREE) {
      return {
        success: false,
        error: 'User is not on free tier',
      };
    }

    if (!subscription.trialEndDate) {
      return {
        success: false,
        error: 'No trial end date found',
      };
    }

    // Calculate new end date
    const currentEndDate = subscription.trialEndDate;
    const now = new Date();

    // If trial has already expired, extend from now
    // Otherwise, extend from current end date
    const baseDate = currentEndDate < now ? now : currentEndDate;
    const newEndDate = new Date(baseDate);
    newEndDate.setDate(newEndDate.getDate() + additionalDays);

    await prisma.subscription.update({
      where: { userId },
      data: {
        trialEndDate: newEndDate,
        currentPeriodEnd: newEndDate,
        // Reactivate if expired
        status: SubscriptionStatus.ACTIVE,
      },
    });

    // Record extension transaction
    await prisma.creditTransaction.create({
      data: {
        userId,
        type: CreditTransactionType.BONUS,
        amount: 0,
        balance: TIER_CONFIG[SubscriptionTier.FREE].trialCredits - subscription.trialCreditsUsed,
        description: `Trial extended by ${additionalDays} days`,
      },
    });

    return {
      success: true,
      newEndDate,
      additionalDays,
    };
  }

  /**
   * Add bonus trial credits to a user
   */
  async addBonusTrialCredits(userId: string, amount: number, reason: string): Promise<void> {
    const subscription = await prisma.subscription.findUnique({
      where: { userId },
    });

    if (!subscription || subscription.tier !== SubscriptionTier.FREE) {
      throw new Error('User is not on free tier');
    }

    // We track trial credits used, so adding bonus means reducing used amount
    // This effectively increases remaining credits
    const newTrialCreditsUsed = Math.max(0, subscription.trialCreditsUsed - amount);
    const newBalance = TIER_CONFIG[SubscriptionTier.FREE].trialCredits - newTrialCreditsUsed;

    await prisma.subscription.update({
      where: { userId },
      data: {
        trialCreditsUsed: newTrialCreditsUsed,
      },
    });

    await prisma.creditTransaction.create({
      data: {
        userId,
        type: CreditTransactionType.BONUS,
        amount,
        balance: newBalance,
        description: reason,
      },
    });
  }

  /**
   * Get users with expiring trials (for notification purposes)
   */
  async getExpiringTrials(
    daysUntilExpiry: number
  ): Promise<{ userId: string; email: string | null; daysRemaining: number }[]> {
    const now = new Date();
    const expiryThreshold = new Date(now);
    expiryThreshold.setDate(expiryThreshold.getDate() + daysUntilExpiry);

    const expiringSubscriptions = await prisma.subscription.findMany({
      where: {
        tier: SubscriptionTier.FREE,
        status: SubscriptionStatus.ACTIVE,
        trialEndDate: {
          gt: now,
          lte: expiryThreshold,
        },
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
          },
        },
      },
    });

    return expiringSubscriptions.map(sub => ({
      userId: sub.userId,
      email: sub.user.email,
      daysRemaining: Math.ceil(
        (sub.trialEndDate!.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
      ),
    }));
  }

  /**
   * Check if user is eligible for trial
   * Checks both current subscription AND trial history by email
   */
  async isEligibleForTrial(userId: string): Promise<boolean> {
    // First check if user already has subscription
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        email: true,
        subscription: { select: { id: true } },
      },
    });

    // Already has subscription - not eligible
    if (user?.subscription) {
      return false;
    }

    // Check trial history by email (prevents re-registering to get new trial)
    if (user?.email) {
      const eligibility = await checkTrialEligibility(user.email);
      return eligibility.eligible;
    }

    // No email found (shouldn't happen) - not eligible
    return false;
  }

  /**
   * Create FREE subscription without trial credits
   * Used for returning users who already used their trial
   */
  async createFreeSubscription(userId: string): Promise<Subscription> {
    const existingSubscription = await prisma.subscription.findUnique({
      where: { userId },
    });

    if (existingSubscription) {
      return existingSubscription;
    }

    const now = new Date();
    // Set period end far in future for free tier (no expiration)
    const periodEnd = new Date(now);
    periodEnd.setFullYear(periodEnd.getFullYear() + 100);

    const subscription = await prisma.subscription.create({
      data: {
        userId,
        tier: SubscriptionTier.FREE,
        status: SubscriptionStatus.ACTIVE,
        currentPeriodStart: now,
        currentPeriodEnd: periodEnd,
        // No trial dates - user already used trial before
        trialStartDate: null,
        trialEndDate: null,
        trialDailyReset: null,
      },
    });

    return subscription;
  }

  /**
   * Get next midnight for daily reset
   */
  private getNextMidnight(): Date {
    const midnight = new Date();
    midnight.setHours(24, 0, 0, 0);
    return midnight;
  }
}

// Export singleton instance
export const trialService = new TrialService();
