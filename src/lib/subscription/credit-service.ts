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
import { TokenUsage, calculateCreditsFromUsage, getUsageTypeFromModel } from './credit-calculator';
import { notifyCreditUsage } from '@/lib/notification/notification-service';
import { checkTrialEligibility, recordTrialStart } from './trial-history-service';

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
      // Check if user actually has trial (trialEndDate exists)
      // Users who re-registered after using trial won't have trialEndDate
      if (!subscription.trialEndDate) {
        return {
          allowed: false,
          reason:
            'Paket Gratis tidak memiliki kredit AI. Silakan upgrade untuk menggunakan fitur AI.',
          creditsRequired,
          creditsAvailable: 0,
          isTrialUser: false,
          trialDaysRemaining: 0,
        };
      }

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

    // Check if user has remaining trial credits (upgraded from FREE)
    const trialCreditsRemaining = this.getTrialCreditsRemaining(subscription);
    const totalAvailable = trialCreditsRemaining + subscription.creditsRemaining;

    // Check combined credits (trial + subscription)
    if (creditsRequired > totalAvailable) {
      return {
        allowed: false,
        reason: `Insufficient credits. Need ${creditsRequired}, have ${totalAvailable}.`,
        creditsRequired,
        creditsAvailable: totalAvailable,
        isTrialUser: false,
        hasTrialCredits: trialCreditsRemaining > 0,
        trialCreditsRemaining,
      };
    }

    return {
      allowed: true,
      creditsRequired,
      creditsAvailable: totalAvailable,
      isTrialUser: false,
      hasTrialCredits: trialCreditsRemaining > 0,
      trialCreditsRemaining,
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

    // For paid tiers - check if user has remaining trial credits first
    const trialCreditsRemaining = this.getTrialCreditsRemaining(subscription);

    if (trialCreditsRemaining > 0) {
      // Use trial credits first, then subscription credits
      const fromTrialCredits = Math.min(creditsToDeduct, trialCreditsRemaining);
      const fromSubscriptionCredits = creditsToDeduct - fromTrialCredits;

      const newTrialCreditsUsed = subscription.trialCreditsUsed + fromTrialCredits;
      const newCreditsUsed = subscription.creditsUsed + fromSubscriptionCredits;
      const newCreditsRemaining = subscription.creditsRemaining - fromSubscriptionCredits;
      const newTrialRemaining = this.getTrialCreditsRemaining({
        ...subscription,
        trialCreditsUsed: newTrialCreditsUsed,
      });
      const totalBalance = newTrialRemaining + newCreditsRemaining;

      await prisma.subscription.update({
        where: { userId },
        data: {
          trialCreditsUsed: newTrialCreditsUsed,
          creditsUsed: newCreditsUsed,
          creditsRemaining: newCreditsRemaining,
        },
      });

      const transaction = await prisma.creditTransaction.create({
        data: {
          userId,
          type: CreditTransactionType.USAGE,
          amount: -creditsToDeduct,
          balance: totalBalance,
          usageType: type,
          durationSecs: type === UsageType.TEXT_CHAT ? undefined : actualUnits,
          referenceId,
          referenceType,
          description:
            fromTrialCredits > 0
              ? `Usage: ${type} (${fromTrialCredits} from trial, ${fromSubscriptionCredits} from subscription)`
              : `Usage: ${type}`,
        },
      });

      // Check usage thresholds (only for subscription credits)
      if (fromSubscriptionCredits > 0) {
        await this.checkUsageThresholdsAndNotify(userId, subscription, newCreditsUsed);
      }

      return transaction;
    }

    // No trial credits remaining - use subscription credits only
    const newCreditsUsed = subscription.creditsUsed + creditsToDeduct;
    const newCreditsRemaining = subscription.creditsRemaining - creditsToDeduct;

    await prisma.subscription.update({
      where: { userId },
      data: {
        creditsUsed: newCreditsUsed,
        creditsRemaining: newCreditsRemaining,
      },
    });

    const transaction = await prisma.creditTransaction.create({
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

    // Check usage thresholds and send notifications
    await this.checkUsageThresholdsAndNotify(userId, subscription, newCreditsUsed);

    return transaction;
  }

  /**
   * Deduct credits based on actual API token usage (NEW USAGE-BASED SYSTEM)
   *
   * This method calculates credits from actual OpenAI API usage data,
   * ensuring credits accurately reflect real API costs.
   *
   * @param userId - User ID to deduct credits from
   * @param usage - Token usage data from API response
   * @param referenceId - Optional reference ID (e.g., conversation ID)
   * @param referenceType - Optional reference type (e.g., 'free_conversation')
   * @param description - Optional description for the transaction
   * @param forceDeduct - Force credit deduction even for unlimited text tiers (used for voice context)
   * @returns Credits deducted and USD cost
   *
   * @example
   * // After a text chat API call
   * await creditService.deductCreditsFromUsage(
   *   userId,
   *   { model: 'gpt-4o-mini', inputTokens: 3050, outputTokens: 150 },
   *   sessionId,
   *   'free_conversation',
   *   'Text chat message'
   * );
   *
   * @example
   * // Force deduct for voice context (even for paid tiers with unlimited text)
   * await creditService.deductCreditsFromUsage(
   *   userId,
   *   { model: 'gpt-4o-mini', inputTokens: 3050, outputTokens: 150 },
   *   sessionId,
   *   'free_conversation_voice',
   *   'Voice chat text generation',
   *   true // forceDeduct
   * );
   */
  async deductCreditsFromUsage(
    userId: string,
    usage: TokenUsage,
    referenceId?: string,
    referenceType?: string,
    description?: string,
    forceDeduct: boolean = false
  ): Promise<{ credits: number; usdCost: number; transaction: CreditTransaction | null }> {
    const { credits, usdCost, breakdown } = calculateCreditsFromUsage(usage);

    // If no credits to deduct, return early
    if (credits === 0) {
      return { credits: 0, usdCost: 0, transaction: null };
    }

    const subscription = await this.getOrCreateSubscription(userId);
    const usageType = getUsageTypeFromModel(usage.model);

    // For paid tiers with unlimited text, don't deduct for text chat
    // UNLESS forceDeduct is true (used for voice context where all credits should be tracked)
    if (
      !forceDeduct &&
      usageType === UsageType.TEXT_CHAT &&
      subscription.tier !== SubscriptionTier.FREE &&
      TIER_CONFIG[subscription.tier].textUnlimited
    ) {
      // Record the transaction with 0 deduction but store usage metadata
      const transaction = await prisma.creditTransaction.create({
        data: {
          userId,
          type: CreditTransactionType.USAGE,
          amount: 0,
          balance: subscription.creditsRemaining,
          usageType,
          referenceId,
          referenceType,
          description: description || 'Text chat (unlimited)',
          metadata: {
            model: usage.model,
            inputTokens: usage.inputTokens,
            outputTokens: usage.outputTokens,
            usdCost,
            breakdown,
            unlimitedTextChat: true,
          },
        },
      });
      return { credits: 0, usdCost, transaction };
    }

    // For FREE tier users (trial)
    if (subscription.tier === SubscriptionTier.FREE) {
      const newTrialCreditsUsed = subscription.trialCreditsUsed + credits;
      const newTrialDailyUsed = subscription.trialDailyUsed + credits;
      const newBalance = TIER_CONFIG[SubscriptionTier.FREE].trialCredits - newTrialCreditsUsed;

      await prisma.subscription.update({
        where: { userId },
        data: {
          trialCreditsUsed: newTrialCreditsUsed,
          trialDailyUsed: newTrialDailyUsed,
        },
      });

      const transaction = await prisma.creditTransaction.create({
        data: {
          userId,
          type: CreditTransactionType.USAGE,
          amount: -credits,
          balance: newBalance,
          usageType,
          referenceId,
          referenceType,
          description: description || `Trial usage: ${usageType}`,
          metadata: {
            model: usage.model,
            inputTokens: usage.inputTokens,
            outputTokens: usage.outputTokens,
            audioDurationSeconds: usage.audioDurationSeconds,
            audioInputTokens: usage.audioInputTokens,
            audioOutputTokens: usage.audioOutputTokens,
            characterCount: usage.characterCount,
            usdCost,
            breakdown,
          },
        },
      });

      return { credits, usdCost, transaction };
    }

    // For paid tiers - check if user has remaining trial credits first
    const trialCreditsRemaining = this.getTrialCreditsRemaining(subscription);

    if (trialCreditsRemaining > 0) {
      // Use trial credits first, then subscription credits
      const fromTrialCredits = Math.min(credits, trialCreditsRemaining);
      const fromSubscriptionCredits = credits - fromTrialCredits;

      const newTrialCreditsUsed = subscription.trialCreditsUsed + fromTrialCredits;
      const newCreditsUsed = subscription.creditsUsed + fromSubscriptionCredits;
      const newCreditsRemaining = subscription.creditsRemaining - fromSubscriptionCredits;
      const newTrialRemaining = this.getTrialCreditsRemaining({
        ...subscription,
        trialCreditsUsed: newTrialCreditsUsed,
      });
      const totalBalance = newTrialRemaining + newCreditsRemaining;

      await prisma.subscription.update({
        where: { userId },
        data: {
          trialCreditsUsed: newTrialCreditsUsed,
          creditsUsed: newCreditsUsed,
          creditsRemaining: newCreditsRemaining,
        },
      });

      const transaction = await prisma.creditTransaction.create({
        data: {
          userId,
          type: CreditTransactionType.USAGE,
          amount: -credits,
          balance: totalBalance,
          usageType,
          referenceId,
          referenceType,
          description:
            description ||
            (fromTrialCredits > 0
              ? `Usage: ${usageType} (${fromTrialCredits} from trial, ${fromSubscriptionCredits} from subscription)`
              : `Usage: ${usageType}`),
          metadata: {
            model: usage.model,
            inputTokens: usage.inputTokens,
            outputTokens: usage.outputTokens,
            audioDurationSeconds: usage.audioDurationSeconds,
            audioInputTokens: usage.audioInputTokens,
            audioOutputTokens: usage.audioOutputTokens,
            characterCount: usage.characterCount,
            usdCost,
            breakdown,
            fromTrialCredits,
            fromSubscriptionCredits,
          },
        },
      });

      // Check usage thresholds (only for subscription credits)
      if (fromSubscriptionCredits > 0) {
        await this.checkUsageThresholdsAndNotify(userId, subscription, newCreditsUsed);
      }

      return { credits, usdCost, transaction };
    }

    // No trial credits remaining - use subscription credits only
    const newCreditsUsed = subscription.creditsUsed + credits;
    const newCreditsRemaining = subscription.creditsRemaining - credits;

    await prisma.subscription.update({
      where: { userId },
      data: {
        creditsUsed: newCreditsUsed,
        creditsRemaining: newCreditsRemaining,
      },
    });

    const transaction = await prisma.creditTransaction.create({
      data: {
        userId,
        type: CreditTransactionType.USAGE,
        amount: -credits,
        balance: newCreditsRemaining,
        usageType,
        referenceId,
        referenceType,
        description: description || `Usage: ${usageType}`,
        metadata: {
          model: usage.model,
          inputTokens: usage.inputTokens,
          outputTokens: usage.outputTokens,
          audioDurationSeconds: usage.audioDurationSeconds,
          audioInputTokens: usage.audioInputTokens,
          audioOutputTokens: usage.audioOutputTokens,
          characterCount: usage.characterCount,
          usdCost,
          breakdown,
        },
      },
    });

    // Check usage thresholds and send notifications
    await this.checkUsageThresholdsAndNotify(userId, subscription, newCreditsUsed);

    return { credits, usdCost, transaction };
  }

  /**
   * Check usage thresholds and send notifications if crossed
   */
  private async checkUsageThresholdsAndNotify(
    userId: string,
    subscription: Subscription,
    newCreditsUsed: number
  ): Promise<void> {
    const total = subscription.creditsTotal;
    if (total === 0) return;

    const oldPercentage = Math.floor((subscription.creditsUsed / total) * 100);
    const newPercentage = Math.floor((newCreditsUsed / total) * 100);

    // Calculate days until reset
    const now = new Date();
    const daysRemaining = Math.max(
      0,
      Math.ceil((subscription.currentPeriodEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    );

    const remaining = total - newCreditsUsed;

    // Check if we crossed thresholds
    // 100% (depleted)
    if (oldPercentage < 100 && newPercentage >= 100) {
      await notifyCreditUsage(userId, 100, remaining, daysRemaining);
    }
    // 95%
    else if (oldPercentage < 95 && newPercentage >= 95) {
      await notifyCreditUsage(userId, 95, remaining, daysRemaining);
    }
    // 80%
    else if (oldPercentage < 80 && newPercentage >= 80) {
      await notifyCreditUsage(userId, 80, remaining, daysRemaining);
    }
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

      // Check if user actually has trial (trialEndDate exists and not expired)
      // Users who re-registered after using trial won't have trialEndDate
      if (!subscription.trialEndDate) {
        // No trial - return 0 credits
        return {
          total: 0,
          used: 0,
          remaining: 0,
          tier: subscription.tier,
          isTrialActive: false,
          trialDaysRemaining: 0,
          trialDailyUsed: 0,
          trialDailyLimit: tierConfig.trialDailyLimit,
          periodEnd: subscription.currentPeriodEnd,
        };
      }

      const trialRemaining = tierConfig.trialCredits - subscription.trialCreditsUsed;

      return {
        total: tierConfig.trialCredits,
        used: subscription.trialCreditsUsed,
        remaining: isTrialActive ? trialRemaining : 0,
        tier: subscription.tier,
        isTrialActive,
        trialDaysRemaining: isTrialActive ? this.getTrialDaysRemaining(subscription) : 0,
        trialDailyUsed: subscription.trialDailyUsed,
        trialDailyLimit: tierConfig.trialDailyLimit,
        periodEnd: subscription.trialEndDate || subscription.currentPeriodEnd,
      };
    }

    // Check if paid user has remaining trial credits
    const trialCreditsRemaining = this.getTrialCreditsRemaining(subscription);
    const hasTrialCredits = trialCreditsRemaining > 0;

    // For paid users, total balance = subscription credits + trial credits remaining
    const totalRemaining = subscription.creditsRemaining + trialCreditsRemaining;
    const totalCredits =
      subscription.creditsTotal +
      (hasTrialCredits ? TIER_CONFIG[SubscriptionTier.FREE].trialCredits : 0);
    const totalUsed =
      subscription.creditsUsed + (hasTrialCredits ? subscription.trialCreditsUsed : 0);

    return {
      total: totalCredits,
      used: totalUsed,
      remaining: totalRemaining,
      tier: subscription.tier,
      isTrialActive: false,
      periodEnd: subscription.currentPeriodEnd,
      // Include trial info for paid users who upgraded from FREE
      hasTrialCredits,
      trialCreditsRemaining: hasTrialCredits ? trialCreditsRemaining : undefined,
      trialDaysRemaining: hasTrialCredits ? this.getTrialDaysRemaining(subscription) : undefined,
      trialEndDate: hasTrialCredits ? subscription.trialEndDate : undefined,
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
    const newCreditsRemaining = Math.max(0, subscription.creditsRemaining + amount);

    // Update both creditsRemaining and creditsTotal (if adding credits)
    // This ensures the total reflects all credits including adjustments
    const updateData: { creditsRemaining: number; creditsTotal?: number } = {
      creditsRemaining: newCreditsRemaining,
    };

    // If adding credits, also increase creditsTotal to maintain consistency
    if (amount > 0) {
      updateData.creditsTotal = subscription.creditsTotal + amount;
    }

    await prisma.subscription.update({
      where: { userId },
      data: updateData,
    });

    return prisma.creditTransaction.create({
      data: {
        userId,
        type: CreditTransactionType.ADJUSTMENT,
        amount,
        balance: newCreditsRemaining,
        description,
      },
    });
  }

  /**
   * Get or create a subscription for a user
   * @param userId - User ID
   * @param options - Optional parameters for subscription creation
   */
  async getOrCreateSubscription(
    userId: string,
    options?: { skipTrialCheck?: boolean }
  ): Promise<Subscription> {
    let subscription = await prisma.subscription.findUnique({
      where: { userId },
    });

    if (!subscription) {
      // Get user email for trial history check
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { email: true },
      });

      if (!user) {
        throw new Error('User not found');
      }

      const now = new Date();
      let trialEnd = new Date(now);
      let grantTrial = true;

      // Check trial eligibility unless skipped
      if (!options?.skipTrialCheck) {
        const eligibility = await checkTrialEligibility(user.email);

        if (!eligibility.eligible) {
          // User has already used trial - create subscription without trial
          grantTrial = false;
          // Set trial end to past to indicate no trial available
          trialEnd = new Date(now);
          trialEnd.setDate(trialEnd.getDate() - 1);
        }
      }

      if (grantTrial) {
        trialEnd.setDate(trialEnd.getDate() + TIER_CONFIG[SubscriptionTier.FREE].trialDays);
      }

      subscription = await prisma.subscription.create({
        data: {
          userId,
          tier: SubscriptionTier.FREE,
          status: SubscriptionStatus.ACTIVE,
          currentPeriodStart: now,
          currentPeriodEnd: trialEnd,
          trialStartDate: grantTrial ? now : null,
          trialEndDate: grantTrial ? trialEnd : null,
          trialDailyReset: grantTrial ? this.getNextMidnight() : null,
        },
      });

      if (grantTrial) {
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

        // Record in trial history for anti-abuse
        await recordTrialStart(userId, user.email);
      } else {
        // Record that user tried to get trial but was denied
        await prisma.creditTransaction.create({
          data: {
            userId,
            type: CreditTransactionType.ADJUSTMENT,
            amount: 0,
            balance: 0,
            description: 'Trial not available - email already used trial',
          },
        });
      }
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
   * For FREE tier: trial must not be expired
   * For paid tiers: trial credits can still be used if they haven't expired
   */
  private isTrialActive(subscription: Subscription): boolean {
    if (!subscription.trialEndDate) return false;
    return new Date() < subscription.trialEndDate;
  }

  /**
   * Check if user has remaining trial credits that can be used
   * This applies to both FREE tier users and paid users who upgraded from FREE
   */
  private hasRemainingTrialCredits(subscription: Subscription): boolean {
    // Trial must still be active (not expired)
    if (!this.isTrialActive(subscription)) return false;

    // Check if there are remaining trial credits
    const tierConfig = TIER_CONFIG[SubscriptionTier.FREE];
    const trialRemaining = tierConfig.trialCredits - subscription.trialCreditsUsed;

    return trialRemaining > 0;
  }

  /**
   * Get remaining trial credits
   */
  private getTrialCreditsRemaining(subscription: Subscription): number {
    if (!this.isTrialActive(subscription)) return 0;

    const tierConfig = TIER_CONFIG[SubscriptionTier.FREE];
    return Math.max(0, tierConfig.trialCredits - subscription.trialCreditsUsed);
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

// Re-export types and utilities from credit-calculator for convenience
export type { TokenUsage, CreditCalculationResult } from './credit-calculator';
export {
  calculateCreditsFromUsage,
  getUsageTypeFromModel,
  aggregateUsage,
} from './credit-calculator';
