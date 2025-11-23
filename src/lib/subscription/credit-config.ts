import { SubscriptionTier, UsageType } from '@prisma/client';

// Credit costs per usage type
export const CREDIT_COSTS = {
  VOICE_STANDARD_PER_MINUTE: 100,
  REALTIME_PER_MINUTE: 350,
  TEXT_CHAT_PER_MESSAGE: 4,
} as const;

// Tier configurations
export const TIER_CONFIG = {
  [SubscriptionTier.FREE]: {
    monthlyCredits: 0,
    trialCredits: 5000,
    trialDays: 14,
    trialDailyLimit: 500,
    textDailyLimit: 20,
    customCharacters: 1,
    textUnlimited: false,
    customCharactersUnlimited: false,
    realtimeEnabled: false, // Realtime not available during trial
  },
  [SubscriptionTier.BASIC]: {
    monthlyCredits: 6000,
    trialCredits: 0,
    trialDays: 0,
    trialDailyLimit: 0,
    textDailyLimit: 0,
    customCharacters: 5,
    textUnlimited: true,
    customCharactersUnlimited: false,
    realtimeEnabled: false, // Realtime only for Pro
  },
  [SubscriptionTier.PRO]: {
    monthlyCredits: 16500,
    trialCredits: 0,
    trialDays: 0,
    trialDailyLimit: 0,
    textDailyLimit: 0,
    customCharacters: 0, // Unlimited
    textUnlimited: true,
    customCharactersUnlimited: true,
    realtimeEnabled: true, // Realtime available for Pro
  },
} as const;

// Pricing in IDR (Indonesian Rupiah)
export const TIER_PRICING = {
  [SubscriptionTier.FREE]: 0,
  [SubscriptionTier.BASIC]: 29000, // Rp 29,000/month
  [SubscriptionTier.PRO]: 49000, // Rp 49,000/month
} as const;

// Subscription duration discounts
export const SUBSCRIPTION_DISCOUNTS = {
  1: 0, // Monthly - no discount
  3: 0.1, // 3 months - 10% discount
  6: 0.2, // 6 months - 20% discount
  12: 0.3, // 12 months - 30% discount
} as const;

// Helper function to calculate discounted price
export function getDiscountedPrice(
  tier: SubscriptionTier,
  months: 1 | 3 | 6 | 12
): { originalTotal: number; discountedTotal: number; savings: number; monthlyEquivalent: number } {
  const monthlyPrice = TIER_PRICING[tier];
  const originalTotal = monthlyPrice * months;
  const discount = SUBSCRIPTION_DISCOUNTS[months];
  const discountedTotal = Math.round(originalTotal * (1 - discount));
  const savings = originalTotal - discountedTotal;
  const monthlyEquivalent = Math.round(discountedTotal / months);

  return {
    originalTotal,
    discountedTotal,
    savings,
    monthlyEquivalent,
  };
}

// Helper function to get credit cost for usage type
export function getCreditCost(usageType: UsageType, units: number): number {
  switch (usageType) {
    case UsageType.VOICE_STANDARD:
      // units = seconds, convert to minutes and round up
      const voiceMinutes = Math.ceil(units / 60);
      return voiceMinutes * CREDIT_COSTS.VOICE_STANDARD_PER_MINUTE;
    case UsageType.REALTIME:
      // units = seconds, convert to minutes and round up
      const realtimeMinutes = Math.ceil(units / 60);
      return realtimeMinutes * CREDIT_COSTS.REALTIME_PER_MINUTE;
    case UsageType.TEXT_CHAT:
      // units = number of messages
      return units * CREDIT_COSTS.TEXT_CHAT_PER_MESSAGE;
    default:
      return 0;
  }
}

// Helper function to estimate minutes from credits
export function estimateMinutesFromCredits(credits: number, usageType: UsageType): number {
  switch (usageType) {
    case UsageType.VOICE_STANDARD:
      return Math.floor(credits / CREDIT_COSTS.VOICE_STANDARD_PER_MINUTE);
    case UsageType.REALTIME:
      return Math.floor(credits / CREDIT_COSTS.REALTIME_PER_MINUTE);
    case UsageType.TEXT_CHAT:
      return Math.floor(credits / CREDIT_COSTS.TEXT_CHAT_PER_MESSAGE);
    default:
      return 0;
  }
}

// Types for credit operations
export interface CreditCheck {
  allowed: boolean;
  reason?: string;
  creditsRequired: number;
  creditsAvailable: number;
  isTrialUser: boolean;
  trialDaysRemaining?: number;
}

export interface CreditBalance {
  total: number;
  used: number;
  remaining: number;
  tier: SubscriptionTier;
  isTrialActive: boolean;
  trialDaysRemaining?: number;
  trialDailyUsed?: number;
  trialDailyLimit?: number;
  periodEnd: Date;
}

export interface HistoryOptions {
  limit?: number;
  offset?: number;
  type?: string;
  startDate?: Date;
  endDate?: Date;
}
