'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  SubscriptionTier,
  SubscriptionStatus,
  CreditTransactionType,
  UsageType,
} from '@prisma/client';
import { CreditBalance } from '@/lib/subscription/credit-config';

interface Subscription {
  id: string;
  tier: SubscriptionTier;
  status: SubscriptionStatus;
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  customCharactersUsed: number;
}

interface Transaction {
  id: string;
  type: CreditTransactionType;
  amount: number;
  balance: number;
  usageType?: UsageType | null;
  durationSecs?: number | null;
  description?: string | null;
  createdAt: Date;
  referenceId?: string | null;
}

interface TierConfig {
  monthlyCredits: number;
  customCharacters: number;
  customCharactersUnlimited: boolean;
  textUnlimited: boolean;
  trialCredits?: number;
  trialDays?: number;
  trialDailyLimit?: number;
  textDailyLimit?: number;
  price: number;
}

interface SubscriptionData {
  subscription: Subscription | null;
  balance: CreditBalance | null;
  tierConfig: TierConfig | null;
}

interface UseSubscriptionReturn {
  // Data
  subscription: Subscription | null;
  balance: CreditBalance | null;
  tierConfig: TierConfig | null;
  transactions: Transaction[];

  // Loading states
  isLoading: boolean;
  isLoadingHistory: boolean;
  error: string | null;

  // Computed properties
  tier: SubscriptionTier;
  isTrialActive: boolean;
  trialDaysRemaining: number;
  creditsRemaining: number;
  usagePercentage: number;
  canUseVoice: boolean;

  // Actions
  refresh: () => Promise<void>;
  loadHistory: (options?: { limit?: number; offset?: number }) => Promise<void>;
  checkCredits: (usageType: UsageType, estimatedUnits: number) => Promise<boolean>;
}

export function useSubscription(): UseSubscriptionReturn {
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [balance, setBalance] = useState<CreditBalance | null>(null);
  const [tierConfig, setTierConfig] = useState<TierConfig | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch subscription data
  const fetchSubscription = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch('/api/subscription');

      if (!response.ok) {
        throw new Error('Failed to fetch subscription');
      }

      const data: SubscriptionData = await response.json();

      setSubscription(data.subscription);
      setBalance(data.balance);
      setTierConfig(data.tierConfig);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Load transaction history
  const loadHistory = useCallback(async (options?: { limit?: number; offset?: number }) => {
    try {
      setIsLoadingHistory(true);

      const params = new URLSearchParams();
      if (options?.limit) params.set('limit', options.limit.toString());
      if (options?.offset) params.set('offset', options.offset.toString());

      const response = await fetch(`/api/subscription/history?${params.toString()}`);

      if (!response.ok) {
        throw new Error('Failed to fetch history');
      }

      const data = await response.json();

      if (options?.offset && options.offset > 0) {
        setTransactions(prev => [...prev, ...data.transactions]);
      } else {
        setTransactions(data.transactions);
      }
    } catch (err) {
      console.error('Error loading history:', err);
    } finally {
      setIsLoadingHistory(false);
    }
  }, []);

  // Check if user can use credits
  const checkCredits = useCallback(
    async (usageType: UsageType, estimatedUnits: number): Promise<boolean> => {
      try {
        const response = await fetch('/api/subscription/check', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ usageType, estimatedUnits }),
        });

        if (!response.ok) {
          return false;
        }

        const data = await response.json();
        return data.allowed;
      } catch {
        return false;
      }
    },
    []
  );

  // Initial fetch
  useEffect(() => {
    fetchSubscription();
  }, [fetchSubscription]);

  // Computed properties
  const tier = subscription?.tier ?? SubscriptionTier.FREE;
  const isTrialActive = balance?.isTrialActive ?? false;
  const trialDaysRemaining = balance?.trialDaysRemaining ?? 0;
  const creditsRemaining = balance?.remaining ?? 0;
  const usagePercentage = balance && balance.total > 0 ? (balance.used / balance.total) * 100 : 0;
  const canUseVoice = creditsRemaining > 0 || isTrialActive;

  return {
    // Data
    subscription,
    balance,
    tierConfig,
    transactions,

    // Loading states
    isLoading,
    isLoadingHistory,
    error,

    // Computed properties
    tier,
    isTrialActive,
    trialDaysRemaining,
    creditsRemaining,
    usagePercentage,
    canUseVoice,

    // Actions
    refresh: fetchSubscription,
    loadHistory,
    checkCredits,
  };
}

// Hook for credit warning state
export function useCreditWarning(balance: CreditBalance | null) {
  if (!balance) return null;

  const usagePercentage = balance.total > 0 ? (balance.used / balance.total) * 100 : 0;

  if (balance.remaining <= 0) return 'depleted';
  if (usagePercentage >= 95) return 'critical';
  if (usagePercentage >= 80) return 'low';

  return null;
}

// Hook for trial status
export function useTrialStatus(balance: CreditBalance | null) {
  if (!balance || !balance.isTrialActive) return null;

  const daysRemaining = balance.trialDaysRemaining ?? 0;

  if (daysRemaining <= 0) return 'expired';
  if (daysRemaining <= 3) return 'ending';

  return 'active';
}

// Hook for detailed trial information
interface TrialStatusData {
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

interface UseTrialReturn {
  data: TrialStatusData | null;
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  extendTrial: (days: number) => Promise<boolean>;
}

export function useTrial(): UseTrialReturn {
  const [data, setData] = useState<TrialStatusData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTrialStatus = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch('/api/subscription/trial');

      if (!response.ok) {
        throw new Error('Failed to fetch trial status');
      }

      const trialData = await response.json();
      setData({
        ...trialData,
        startDate: trialData.startDate ? new Date(trialData.startDate) : null,
        endDate: trialData.endDate ? new Date(trialData.endDate) : null,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const extendTrial = useCallback(
    async (days: number): Promise<boolean> => {
      try {
        const response = await fetch('/api/subscription/trial/extend', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ additionalDays: days }),
        });

        if (!response.ok) {
          return false;
        }

        // Refresh trial status after extension
        await fetchTrialStatus();
        return true;
      } catch {
        return false;
      }
    },
    [fetchTrialStatus]
  );

  useEffect(() => {
    fetchTrialStatus();
  }, [fetchTrialStatus]);

  return {
    data,
    isLoading,
    error,
    refresh: fetchTrialStatus,
    extendTrial,
  };
}
