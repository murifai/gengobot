import { SubscriptionTier, UsageType } from '@prisma/client';

// =============================================================================
// USAGE-BASED PRICING CONSTANTS (NEW SYSTEM)
// =============================================================================

/**
 * OpenAI API pricing per model
 * Prices are in USD per token/minute
 * Source: https://openai.com/api/pricing/ (November 2025)
 */
export const OPENAI_PRICING = {
  // GPT-4o-mini - Used for RESPONSE (text chat) and ANALYSIS (feedback, hints)
  'gpt-4o-mini': {
    input: 0.15 / 1_000_000, // $0.15 per 1M tokens
    output: 0.6 / 1_000_000, // $0.60 per 1M tokens
  },
  // Whisper (Speech-to-Text)
  'whisper-1': {
    perMinute: 0.006, // $0.006 per minute
  },
  // TTS (Text-to-Speech)
  'gpt-4o-mini-tts': {
    inputPerChar: 0.6 / 1_000_000, // $0.60 per 1M chars
    outputPerToken: 12.0 / 1_000_000, // $12 per 1M audio tokens
  },
  // Realtime API
  'gpt-4o-realtime-preview': {
    audioInputPerMin: 0.036, // $0.036 per minute (~450 tokens/sec)
    audioOutputPerMin: 0.091, // $0.091 per minute (~450 tokens/sec)
    textInput: 0.6 / 1_000_000, // $0.60 per 1M tokens
    textOutput: 2.4 / 1_000_000, // $2.40 per 1M tokens
  },
} as const;

/**
 * Credit conversion rate
 * 1 credit = $0.0001 USD
 * This means: $1.00 = 10,000 credits
 */
export const CREDIT_CONVERSION_RATE = 0.0001;

// =============================================================================
// LEGACY FIXED-RATE COSTS (DEPRECATED - kept for backward compatibility)
// =============================================================================

/**
 * @deprecated Use calculateCreditsFromUsage() from credit-calculator.ts instead
 * These fixed rates will be removed in a future version
 */
// Credit costs per usage type
export const CREDIT_COSTS = {
  VOICE_STANDARD_PER_MINUTE: 100,
  REALTIME_PER_MINUTE: 350,
  TEXT_CHAT_PER_MESSAGE: 4,
} as const;

/**
 * Tier configurations
 *
 * Credit values represent USD worth of API usage:
 * - 1 credit = $0.0001 USD (CREDIT_CONVERSION_RATE)
 * - 5,000 credits = $0.50 USD (trial)
 * - 6,000 credits = $0.60 USD (Basic tier monthly)
 * - 16,500 credits = $1.65 USD (Pro tier monthly)
 *
 * Approximate usage per tier (based on typical usage patterns):
 * - Basic (6,000 credits): ~2,000 text exchanges OR ~10 hours voice
 * - Pro (16,500 credits): ~5,500 text exchanges OR ~27 hours voice OR ~2 hours realtime
 */
export const TIER_CONFIG = {
  [SubscriptionTier.FREE]: {
    monthlyCredits: 0,
    trialCredits: 5000, // $0.50 USD worth of API usage
    trialDays: 14,
    trialDailyLimit: 500, // $0.05 USD daily limit during trial
    textDailyLimit: 20,
    customCharacters: 1,
    textUnlimited: false,
    customCharactersUnlimited: false,
    realtimeEnabled: false, // Realtime not available during trial
    maxChatrooms: 5, // Free tier limited to 5 chatrooms
  },
  [SubscriptionTier.BASIC]: {
    monthlyCredits: 6000, // $0.60 USD worth of API usage
    trialCredits: 0,
    trialDays: 0,
    trialDailyLimit: 0,
    textDailyLimit: 0,
    customCharacters: 5,
    textUnlimited: true,
    customCharactersUnlimited: false,
    realtimeEnabled: false, // Realtime only for Pro
    maxChatrooms: 5, // Basic tier limited to 5 chatrooms
  },
  [SubscriptionTier.PRO]: {
    monthlyCredits: 16500, // $1.65 USD worth of API usage
    trialCredits: 0,
    trialDays: 0,
    trialDailyLimit: 0,
    textDailyLimit: 0,
    customCharacters: 0, // Unlimited
    textUnlimited: true,
    customCharactersUnlimited: true,
    realtimeEnabled: true, // Realtime available for Pro
    maxChatrooms: 0, // 0 = unlimited chatrooms for Pro
  },
} as const;

// Default pricing in IDR (Indonesian Rupiah) - fallback values
// Actual pricing should be fetched from database via getTierPricing()
export const DEFAULT_TIER_PRICING = {
  [SubscriptionTier.FREE]: 0,
  [SubscriptionTier.BASIC]: 29000, // Rp 29,000/month
  [SubscriptionTier.PRO]: 49000, // Rp 49,000/month
} as const;

// Default subscription duration discounts (percentage as decimal)
// Actual discounts should be fetched from database
export const DEFAULT_SUBSCRIPTION_DISCOUNTS = {
  1: 0, // Monthly - no discount
  3: 0.1, // 3 months - 10% discount
  6: 0.2, // 6 months - 20% discount
  12: 0.3, // 12 months - 30% discount
} as const;

// Legacy export for backward compatibility
export const TIER_PRICING = DEFAULT_TIER_PRICING;
export const SUBSCRIPTION_DISCOUNTS = DEFAULT_SUBSCRIPTION_DISCOUNTS;

// Type for tier pricing from database
export interface TierPricingConfig {
  priceMonthly: number;
  discount3Months: number; // Percentage (0-100)
  discount6Months: number; // Percentage (0-100)
  discount12Months: number; // Percentage (0-100)
}

// Helper function to calculate discounted price using config
export function getDiscountedPrice(
  tier: SubscriptionTier,
  months: 1 | 3 | 6 | 12,
  tierConfig?: TierPricingConfig | null
): {
  originalTotal: number;
  discountedTotal: number;
  savings: number;
  monthlyEquivalent: number;
  discountPercent: number;
} {
  // Use provided config or fallback to defaults
  const monthlyPrice = tierConfig?.priceMonthly ?? DEFAULT_TIER_PRICING[tier];

  // Get discount percentage based on duration
  let discountPercent = 0;
  if (tierConfig) {
    switch (months) {
      case 3:
        discountPercent = tierConfig.discount3Months;
        break;
      case 6:
        discountPercent = tierConfig.discount6Months;
        break;
      case 12:
        discountPercent = tierConfig.discount12Months;
        break;
      default:
        discountPercent = 0;
    }
  } else {
    discountPercent = DEFAULT_SUBSCRIPTION_DISCOUNTS[months] * 100;
  }

  const originalTotal = monthlyPrice * months;
  const discount = discountPercent / 100;
  const discountedTotal = Math.round(originalTotal * (1 - discount));
  const savings = originalTotal - discountedTotal;
  const monthlyEquivalent = Math.round(discountedTotal / months);

  return {
    originalTotal,
    discountedTotal,
    savings,
    monthlyEquivalent,
    discountPercent,
  };
}

/**
 * @deprecated Use calculateCreditsFromUsage() from credit-calculator.ts instead.
 * This function uses fixed rates which don't reflect actual API costs.
 * Kept for backward compatibility during migration.
 *
 * @example
 * // Old way (deprecated):
 * const cost = getCreditCost(UsageType.TEXT_CHAT, 1);
 *
 * // New way:
 * import { calculateCreditsFromUsage } from './credit-calculator';
 * const { credits } = calculateCreditsFromUsage({
 *   model: 'gpt-5-nano',
 *   inputTokens: 3050,
 *   outputTokens: 150,
 * });
 */
export function getCreditCost(usageType: UsageType, units: number): number {
  console.warn(
    '[Deprecated] getCreditCost() uses fixed rates. Use calculateCreditsFromUsage() for accurate usage-based billing.'
  );

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

/**
 * @deprecated This function uses fixed rates which don't reflect actual API costs.
 * With usage-based billing, estimates depend on actual token usage patterns.
 * Consider showing users their credit balance and recent usage trends instead.
 *
 * For rough estimates with the new system:
 * - Text chat: ~3 credits per exchange (varies by message length)
 * - Voice: ~10 credits per minute of audio
 * - Realtime: ~127 credits per minute (audio in + out)
 */
export function estimateMinutesFromCredits(credits: number, usageType: UsageType): number {
  console.warn(
    '[Deprecated] estimateMinutesFromCredits() uses fixed rates. Usage-based billing makes estimates variable.'
  );

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
  // For paid users who upgraded from FREE and still have trial credits
  hasTrialCredits?: boolean;
  trialCreditsRemaining?: number;
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
  // For paid users who upgraded from FREE and still have trial credits
  hasTrialCredits?: boolean;
  trialCreditsRemaining?: number;
  trialEndDate?: Date | null; // When trial credits expire
}

export interface HistoryOptions {
  limit?: number;
  offset?: number;
  type?: string;
  startDate?: Date;
  endDate?: Date;
}
