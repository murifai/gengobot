import { prisma } from '@/lib/prisma';
import {
  CreditTransactionType,
  SubscriptionStatus,
  SubscriptionTier,
  UsageType,
  CreditTransaction,
  Subscription,
} from '@prisma/client';
import {
  getCreditCost,
  TIER_CONFIG,
  CreditCheck,
  CreditBalance,
  HistoryOptions,
} from './credit-config';

export class CreditService {
  /**
   * Check if user can perform an action based on their credits
   */
  async checkCredits(
    userId: string,
    type: UsageType,
    estimatedUnits: number
  ): Promise<CreditCheck> {
    const subscription = await this.getOrCreateSubscription(userId);
    const creditsRequired = getCreditCost(type, estimatedUnits);

    // Check if user is in trial
    const isTrialActive = this.isTrialActive(subscription);
    const trialDaysRemaining = isTrialActive ? this.getTrialDaysRemaining(subscription) : undefined;

    // For FREE tier users
    if (subscription.tier === SubscriptionTier.FREE) {
      // Check if trial is active
      if (!isTrialActive) {
        return {
          allowed: false,
          reason: 'Trial period has ended. Please upgrade to continue.',
          creditsRequired,
          creditsAvailable: 0,
          isTrialUser: true,
          trialDaysRemaining: 0,
        };
      }

      // Check daily trial limit
      const tierConfig = TIER_CONFIG[SubscriptionTier.FREE];
      if (subscription.trialDailyUsed + creditsRequired > tierConfig.trialDailyLimit) {
        return {
          allowed: false,
          reason: `Daily trial limit reached (${tierConfig.trialDailyLimit} credits). Resets at midnight.`,
          creditsRequired,
          creditsAvailable: tierConfig.trialDailyLimit - subscription.trialDailyUsed,
          isTrialUser: true,
          trialDaysRemaining,
        };
      }

      // Check total trial credits
      const trialCreditsRemaining = tierConfig.trialCredits - subscription.trialCreditsUsed;
      if (creditsRequired > trialCreditsRemaining) {
        return {
          allowed: false,
          reason: 'Trial credits exhausted. Please upgrade to continue.',
          creditsRequired,
          creditsAvailable: trialCreditsRemaining,
          isTrialUser: true,
          trialDaysRemaining,
        };
      }

      return {
        allowed: true,
        creditsRequired,
        creditsAvailable: trialCreditsRemaining,
        isTrialUser: true,
        trialDaysRemaining,
      };
    }

    // For BASIC and PRO tier users
    // Check text chat unlimited for paid tiers
    if (type === UsageType.TEXT_CHAT && TIER_CONFIG[subscription.tier].textUnlimited) {
      return {
        allowed: true,
        creditsRequired: 0, // Text is unlimited for paid tiers
        creditsAvailable: subscription.creditsRemaining,
        isTrialUser: false,
      };
    }

    // Check regular credits
    if (creditsRequired > subscription.creditsRemaining) {
      return {
        allowed: false,
        reason: `Insufficient credits. Need ${creditsRequired}, have ${subscription.creditsRemaining}.`,
        creditsRequired,
        creditsAvailable: subscription.creditsRemaining,
        isTrialUser: false,
      };
    }

    return {
      allowed: true,
      creditsRequired,
      creditsAvailable: subscription.creditsRemaining,
      isTrialUser: false,
    };
  }

  /**
   * Deduct credits after usage
   */
  async deductCredits(
    userId: string,
    type: UsageType,
    actualUnits: number,
    referenceId?: string,
    referenceType?: string
  ): Promise<CreditTransaction> {
    const subscription = await this.getOrCreateSubscription(userId);
    const creditsToDeduct = getCreditCost(type, actualUnits);

    // For paid tiers with unlimited text, don't deduct for text chat
    if (
      type === UsageType.TEXT_CHAT &&
      subscription.tier !== SubscriptionTier.FREE &&
      TIER_CONFIG[subscription.tier].textUnlimited
    ) {
      // Record the transaction but with 0 deduction
      return prisma.creditTransaction.create({
        data: {
          userId,
          type: CreditTransactionType.USAGE,
          amount: 0,
          balance: subscription.creditsRemaining,
          usageType: type,
          durationSecs: type === UsageType.TEXT_CHAT ? undefined : actualUnits,
          referenceId,
          referenceType,
          description: 'Text chat (unlimited)',
        },
      });
    }

    // For FREE tier users (trial)
    if (subscription.tier === SubscriptionTier.FREE) {
      const newTrialCreditsUsed = subscription.trialCreditsUsed + creditsToDeduct;
      const newTrialDailyUsed = subscription.trialDailyUsed + creditsToDeduct;
      const newBalance = TIER_CONFIG[SubscriptionTier.FREE].trialCredits - newTrialCreditsUsed;

      await prisma.subscription.update({
        where: { userId },
        data: {
          trialCreditsUsed: newTrialCreditsUsed,
          trialDailyUsed: newTrialDailyUsed,
        },
      });

      return prisma.creditTransaction.create({
        data: {
          userId,
          type: CreditTransactionType.USAGE,
          amount: -creditsToDeduct,
          balance: newBalance,
          usageType: type,
          durationSecs: type === UsageType.TEXT_CHAT ? undefined : actualUnits,
          referenceId,
          referenceType,
          description: `Trial usage: ${type}`,
        },
      });
    }

    // For paid tiers
    const newCreditsUsed = subscription.creditsUsed + creditsToDeduct;
    const newCreditsRemaining = subscription.creditsRemaining - creditsToDeduct;

    await prisma.subscription.update({
      where: { userId },
      data: {
        creditsUsed: newCreditsUsed,
        creditsRemaining: newCreditsRemaining,
      },
    });

    return prisma.creditTransaction.create({
      data: {
        userId,
        type: CreditTransactionType.USAGE,
        amount: -creditsToDeduct,
        balance: newCreditsRemaining,
        usageType: type,
        durationSecs: type === UsageType.TEXT_CHAT ? undefined : actualUnits,
        referenceId,
        referenceType,
        description: `Usage: ${type}`,
      },
    });
  }

  /**
   * Grant monthly credits to a user
   */
  async grantMonthlyCredits(userId: string): Promise<CreditTransaction> {
    const subscription = await this.getOrCreateSubscription(userId);
    const tierConfig = TIER_CONFIG[subscription.tier];
    const creditsToGrant = tierConfig.monthlyCredits;

    if (creditsToGrant === 0) {
      throw new Error('No monthly credits for FREE tier');
    }

    const now = new Date();
    const periodEnd = new Date(now);
    periodEnd.setMonth(periodEnd.getMonth() + 1);

    const newCreditsRemaining = subscription.creditsRemaining + creditsToGrant;

    await prisma.subscription.update({
      where: { userId },
      data: {
        creditsTotal: subscription.creditsTotal + creditsToGrant,
        creditsRemaining: newCreditsRemaining,
        creditsUsed: 0, // Reset used credits for new period
        currentPeriodStart: now,
        currentPeriodEnd: periodEnd,
      },
    });

    return prisma.creditTransaction.create({
      data: {
        userId,
        type: CreditTransactionType.GRANT,
        amount: creditsToGrant,
        balance: newCreditsRemaining,
        description: `Monthly credit grant: ${subscription.tier} tier`,
      },
    });
  }

  /**
   * Get user's credit balance
   */
  async getBalance(userId: string): Promise<CreditBalance> {
    const subscription = await this.getOrCreateSubscription(userId);
    const isTrialActive = this.isTrialActive(subscription);

    if (subscription.tier === SubscriptionTier.FREE) {
      const tierConfig = TIER_CONFIG[SubscriptionTier.FREE];
      const trialRemaining = tierConfig.trialCredits - subscription.trialCreditsUsed;

      return {
        total: tierConfig.trialCredits,
        used: subscription.trialCreditsUsed,
        remaining: trialRemaining,
        tier: subscription.tier,
        isTrialActive,
        trialDaysRemaining: isTrialActive ? this.getTrialDaysRemaining(subscription) : 0,
        trialDailyUsed: subscription.trialDailyUsed,
        trialDailyLimit: tierConfig.trialDailyLimit,
        periodEnd: subscription.trialEndDate || subscription.currentPeriodEnd,
      };
    }

    return {
      total: subscription.creditsTotal,
      used: subscription.creditsUsed,
      remaining: subscription.creditsRemaining,
      tier: subscription.tier,
      isTrialActive: false,
      periodEnd: subscription.currentPeriodEnd,
    };
  }

  /**
   * Get credit transaction history
   */
  async getHistory(userId: string, options?: HistoryOptions): Promise<CreditTransaction[]> {
    const { limit = 50, offset = 0, type, startDate, endDate } = options || {};

    return prisma.creditTransaction.findMany({
      where: {
        userId,
        ...(type && { type: type as CreditTransactionType }),
        ...(startDate && { createdAt: { gte: startDate } }),
        ...(endDate && { createdAt: { lte: endDate } }),
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset,
    });
  }

  /**
   * Add bonus credits to a user
   */
  async addBonusCredits(
    userId: string,
    amount: number,
    description: string
  ): Promise<CreditTransaction> {
    const subscription = await this.getOrCreateSubscription(userId);
    const newCreditsRemaining = subscription.creditsRemaining + amount;

    await prisma.subscription.update({
      where: { userId },
      data: {
        creditsTotal: subscription.creditsTotal + amount,
        creditsRemaining: newCreditsRemaining,
      },
    });

    return prisma.creditTransaction.create({
      data: {
        userId,
        type: CreditTransactionType.BONUS,
        amount,
        balance: newCreditsRemaining,
        description,
      },
    });
  }

  /**
   * Manual credit adjustment (admin only)
   */
  async adjustCredits(
    userId: string,
    amount: number,
    description: string
  ): Promise<CreditTransaction> {
    const subscription = await this.getOrCreateSubscription(userId);
    const newCreditsRemaining = subscription.creditsRemaining + amount;

    await prisma.subscription.update({
      where: { userId },
      data: {
        creditsRemaining: Math.max(0, newCreditsRemaining),
      },
    });

    return prisma.creditTransaction.create({
      data: {
        userId,
        type: CreditTransactionType.ADJUSTMENT,
        amount,
        balance: Math.max(0, newCreditsRemaining),
        description,
      },
    });
  }

  /**
   * Get or create a subscription for a user
   */
  async getOrCreateSubscription(userId: string): Promise<Subscription> {
    let subscription = await prisma.subscription.findUnique({
      where: { userId },
    });

    if (!subscription) {
      const now = new Date();
      const trialEnd = new Date(now);
      trialEnd.setDate(trialEnd.getDate() + TIER_CONFIG[SubscriptionTier.FREE].trialDays);

      subscription = await prisma.subscription.create({
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

      // Record trial grant
      await prisma.creditTransaction.create({
        data: {
          userId,
          type: CreditTransactionType.TRIAL_GRANT,
          amount: TIER_CONFIG[SubscriptionTier.FREE].trialCredits,
          balance: TIER_CONFIG[SubscriptionTier.FREE].trialCredits,
          description: 'Trial credits granted',
        },
      });
    }

    return subscription;
  }

  /**
   * Reset daily trial usage (called by cron job)
   */
  async resetDailyTrialUsage(): Promise<number> {
    const result = await prisma.subscription.updateMany({
      where: {
        tier: SubscriptionTier.FREE,
        status: SubscriptionStatus.ACTIVE,
        trialEndDate: { gte: new Date() },
      },
      data: {
        trialDailyUsed: 0,
        trialDailyReset: this.getNextMidnight(),
      },
    });

    return result.count;
  }

  /**
   * Check if trial is active
   */
  private isTrialActive(subscription: Subscription): boolean {
    if (subscription.tier !== SubscriptionTier.FREE) return false;
    if (!subscription.trialEndDate) return false;
    return new Date() < subscription.trialEndDate;
  }

  /**
   * Get remaining trial days
   */
  private getTrialDaysRemaining(subscription: Subscription): number {
    if (!subscription.trialEndDate) return 0;
    const now = new Date();
    const diffTime = subscription.trialEndDate.getTime() - now.getTime();
    return Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
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
export const creditService = new CreditService();
