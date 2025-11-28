// Credit configuration and types
export {
  CREDIT_COSTS,
  TIER_CONFIG,
  TIER_PRICING,
  SUBSCRIPTION_DISCOUNTS,
  getCreditCost,
  estimateMinutesFromCredits,
  getDiscountedPrice,
} from './credit-config';

export type { CreditCheck, CreditBalance, HistoryOptions } from './credit-config';

// Tier sync utilities
export {
  getEffectiveTier,
  getOrCreateSubscription,
  syncUserTier,
  syncAllUserTiers,
  hasTierOrHigher,
  isPaidTier,
  getTierDisplayName,
  planToTier,
  tierToPlan,
} from './tier-sync';

// Credit service
export {
  CreditService,
  creditService,
  calculateCreditsFromUsage,
  getUsageTypeFromModel,
  aggregateUsage,
} from './credit-service';

export type { TokenUsage, CreditCalculationResult } from './credit-service';

// Trial service
export { TrialService, trialService } from './trial-service';

export type { TrialStatus, TrialExtensionResult } from './trial-service';

// Usage guard middleware
export {
  withCreditCheck,
  createCreditGuardedHandler,
  recordUsage,
  checkUsage,
} from './usage-guard';

export type { UsageCheckResult } from './usage-guard';
