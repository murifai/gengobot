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
  },
} as const;

// Pricing in IDR (Indonesian Rupiah)
export const TIER_PRICING = {
  [SubscriptionTier.FREE]: 0,
  [SubscriptionTier.BASIC]: 59000, // Rp 59,000/month
  [SubscriptionTier.PRO]: 149000, // Rp 149,000/month
} as const;

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
