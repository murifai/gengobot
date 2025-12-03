'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { SubscriptionTier } from '@prisma/client';

interface PricingDuration {
  total: number;
  perMonth: number;
  discount: number;
  savings: number;
}

interface PlanPricing {
  monthly: PricingDuration;
  quarterly: PricingDuration;
  semiannual: PricingDuration;
  annual: PricingDuration;
}

interface PlanDiscounts {
  discount3Months: number;
  discount6Months: number;
  discount12Months: number;
}

interface PlanConfig {
  customCharacters: number;
  customCharactersUnlimited: boolean;
  textUnlimited: boolean;
  realtimeEnabled: boolean;
  trialDays: number;
  trialCredits: number;
}

export interface Plan {
  tier: SubscriptionTier;
  name: string;
  priceMonthly: number;
  credits: number;
  features: string[];
  isActive: boolean;
  discounts: PlanDiscounts;
  pricing: PlanPricing;
  config: PlanConfig;
}

interface UsePricingPlansReturn {
  plans: Plan[];
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  getPlan: (tier: SubscriptionTier) => Plan | undefined;
  getPrice: (
    tier: SubscriptionTier,
    months: 1 | 3 | 6 | 12
  ) => {
    total: number;
    perMonth: number;
    discount: number;
    savings: number;
    originalTotal: number;
  };
  getDiscountPercent: (tier: SubscriptionTier, months: 1 | 3 | 6 | 12) => number;
}

export function usePricingPlans(): UsePricingPlansReturn {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPlans = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch('/api/subscription/plans');

      if (!response.ok) {
        throw new Error('Failed to fetch pricing plans');
      }

      const data = await response.json();
      setPlans(data.plans || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPlans();
  }, [fetchPlans]);

  const getPlan = useCallback(
    (tier: SubscriptionTier): Plan | undefined => {
      return plans.find(p => p.tier === tier);
    },
    [plans]
  );

  const getPrice = useCallback(
    (
      tier: SubscriptionTier,
      months: 1 | 3 | 6 | 12
    ): {
      total: number;
      perMonth: number;
      discount: number;
      savings: number;
      originalTotal: number;
    } => {
      const plan = plans.find(p => p.tier === tier);

      if (!plan) {
        return { total: 0, perMonth: 0, discount: 0, savings: 0, originalTotal: 0 };
      }

      const originalTotal = plan.priceMonthly * months;

      let pricingKey: keyof PlanPricing;
      switch (months) {
        case 3:
          pricingKey = 'quarterly';
          break;
        case 6:
          pricingKey = 'semiannual';
          break;
        case 12:
          pricingKey = 'annual';
          break;
        default:
          pricingKey = 'monthly';
      }

      const pricing = plan.pricing[pricingKey];

      return {
        total: pricing.total,
        perMonth: pricing.perMonth,
        discount: pricing.discount,
        savings: pricing.savings,
        originalTotal,
      };
    },
    [plans]
  );

  const getDiscountPercent = useCallback(
    (tier: SubscriptionTier, months: 1 | 3 | 6 | 12): number => {
      const plan = plans.find(p => p.tier === tier);

      if (!plan) return 0;

      switch (months) {
        case 3:
          return plan.discounts.discount3Months;
        case 6:
          return plan.discounts.discount6Months;
        case 12:
          return plan.discounts.discount12Months;
        default:
          return 0;
      }
    },
    [plans]
  );

  return {
    plans,
    isLoading,
    error,
    refresh: fetchPlans,
    getPlan,
    getPrice,
    getDiscountPercent,
  };
}

// Export duration discounts hook for use in upgrade page
export function useDurationOptions() {
  const { plans, isLoading } = usePricingPlans();

  const durationOptions = useMemo(() => {
    // Use BASIC or PRO plan discounts (they should be the same)
    const paidPlan = plans.find(p => p.tier === 'BASIC' || p.tier === 'PRO');

    const options: { value: 1 | 3 | 6 | 12; label: string; discount?: string }[] = [
      { value: 1, label: '1 bulan' },
      { value: 3, label: '3 bulan' },
      { value: 6, label: '6 bulan' },
      { value: 12, label: '12 bulan' },
    ];

    if (paidPlan) {
      if (paidPlan.discounts.discount3Months > 0) {
        options[1].discount = `${paidPlan.discounts.discount3Months}%`;
      }
      if (paidPlan.discounts.discount6Months > 0) {
        options[2].discount = `${paidPlan.discounts.discount6Months}%`;
      }
      if (paidPlan.discounts.discount12Months > 0) {
        options[3].discount = `${paidPlan.discounts.discount12Months}%`;
      }
    }

    return options;
  }, [plans]);

  return { durationOptions, isLoading };
}
