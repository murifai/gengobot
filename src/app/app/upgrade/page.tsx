'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ChevronLeft, Check } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { PricingCard } from '@/components/payment/PricingCard';
import { CheckoutSummary } from '@/components/payment/CheckoutSummary';
import { SubscriptionTier } from '@prisma/client';
import { useSubscription } from '@/hooks/useSubscription';
import { usePricingPlans, useDurationOptions } from '@/hooks/usePricingPlans';
import { TierPricingConfig } from '@/lib/subscription/credit-config';

type DurationOption = 1 | 3 | 6 | 12;

export default function UpgradePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { tier: currentTier, subscription, isLoading } = useSubscription();
  const { isLoading: plansLoading, getPlan } = usePricingPlans();
  const { durationOptions } = useDurationOptions();

  // Get initial tier from URL params
  const tierParam = searchParams?.get('tier') as SubscriptionTier | null;

  const [selectedTier, setSelectedTier] = useState<SubscriptionTier>(
    tierParam && (tierParam === SubscriptionTier.BASIC || tierParam === SubscriptionTier.PRO)
      ? tierParam
      : SubscriptionTier.BASIC
  );
  const [selectedDuration, setSelectedDuration] = useState<DurationOption>(1);

  // Ref for checkout section (for mobile auto-scroll)
  const checkoutRef = useRef<HTMLDivElement>(null);

  // Get pricing config for each tier from API
  const getPricingConfig = (tier: SubscriptionTier): TierPricingConfig | null => {
    const plan = getPlan(tier);
    if (!plan) return null;
    return {
      priceMonthly: plan.priceMonthly,
      discount3Months: plan.discounts.discount3Months,
      discount6Months: plan.discounts.discount6Months,
      discount12Months: plan.discounts.discount12Months,
    };
  };

  // Get features for each tier from API
  const getFeatures = (tier: SubscriptionTier): string[] => {
    const plan = getPlan(tier);
    return plan?.features || [];
  };

  // Get credits for each tier from API
  const getCredits = (tier: SubscriptionTier): number | undefined => {
    const plan = getPlan(tier);
    return plan?.credits;
  };

  // Update selected tier when URL param changes
  useEffect(() => {
    if (tierParam && (tierParam === SubscriptionTier.BASIC || tierParam === SubscriptionTier.PRO)) {
      setSelectedTier(tierParam);
    }
  }, [tierParam]);

  const handleBack = () => {
    router.back();
  };

  // Scroll to checkout section on mobile
  const scrollToCheckout = useCallback(() => {
    // Only scroll on mobile (lg breakpoint is 1024px)
    if (window.innerWidth < 1024 && checkoutRef.current) {
      checkoutRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, []);

  const handleTierSelect = (tier: SubscriptionTier) => {
    setSelectedTier(tier);
    // Auto-scroll to checkout on mobile after selecting a tier
    setTimeout(scrollToCheckout, 100);
  };

  if (isLoading || plansLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-card border-b-2 border-border px-4 py-4 flex items-center gap-4">
        <button
          onClick={handleBack}
          className="p-2 hover:bg-accent rounded-base transition-colors"
          aria-label="Go back"
        >
          <ChevronLeft className="w-7 h-7 text-foreground" />
        </button>
        <h1 className="text-2xl font-bold">Upgrade Paket</h1>
      </div>

      <div className="container max-w-6xl mx-auto py-8 px-4">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left side - Plan selection */}
          <div className="lg:col-span-2 space-y-6">
            {/* Duration selector */}
            <div>
              <h2 className="font-medium mb-3">Pilih Durasi</h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {durationOptions.map(option => (
                  <button
                    key={option.value}
                    onClick={() => setSelectedDuration(option.value)}
                    className={`p-3 rounded-lg border text-sm transition-colors ${
                      selectedDuration === option.value
                        ? 'border-primary bg-primary/5 text-primary'
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <div className="font-medium">{option.label}</div>
                    {option.discount && (
                      <div className="text-xs text-tertiary-green">Hemat {option.discount}</div>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Plan cards */}
            <div>
              <h2 className="font-medium mb-3">Pilih Paket</h2>
              <div className="grid sm:grid-cols-2 gap-4">
                <PricingCard
                  tier={SubscriptionTier.BASIC}
                  durationMonths={selectedDuration}
                  isCurrentPlan={currentTier === SubscriptionTier.BASIC}
                  currentTier={currentTier}
                  currentPeriodEnd={
                    subscription?.currentPeriodEnd ? new Date(subscription.currentPeriodEnd) : null
                  }
                  onSelect={handleTierSelect}
                  pricingConfig={getPricingConfig(SubscriptionTier.BASIC)}
                  features={getFeatures(SubscriptionTier.BASIC)}
                  credits={getCredits(SubscriptionTier.BASIC)}
                  className={
                    selectedTier === SubscriptionTier.BASIC &&
                    currentTier !== SubscriptionTier.BASIC
                      ? 'ring-2 ring-primary'
                      : ''
                  }
                />
                <PricingCard
                  tier={SubscriptionTier.PRO}
                  durationMonths={selectedDuration}
                  isCurrentPlan={currentTier === SubscriptionTier.PRO}
                  currentTier={currentTier}
                  currentPeriodEnd={
                    subscription?.currentPeriodEnd ? new Date(subscription.currentPeriodEnd) : null
                  }
                  onSelect={handleTierSelect}
                  pricingConfig={getPricingConfig(SubscriptionTier.PRO)}
                  features={getFeatures(SubscriptionTier.PRO)}
                  credits={getCredits(SubscriptionTier.PRO)}
                  className={
                    selectedTier === SubscriptionTier.PRO && currentTier !== SubscriptionTier.PRO
                      ? 'ring-2 ring-primary'
                      : ''
                  }
                />
              </div>
            </div>

            {/* Selected plan indicator */}
            {selectedTier && currentTier !== selectedTier && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Check className="h-4 w-4 text-primary" />
                <span>
                  Paket {selectedTier === SubscriptionTier.BASIC ? 'Basic' : 'Pro'} dipilih
                </span>
              </div>
            )}
          </div>

          {/* Right side - Checkout summary */}
          <div className="lg:col-span-1" ref={checkoutRef}>
            <div className="sticky top-4">
              {currentTier === selectedTier ? (
                <div className="text-center py-8 text-muted-foreground">
                  <p>Anda sudah menggunakan paket ini</p>
                  <Button
                    variant="outline"
                    className="mt-4"
                    onClick={() =>
                      setSelectedTier(
                        selectedTier === SubscriptionTier.BASIC
                          ? SubscriptionTier.PRO
                          : SubscriptionTier.BASIC
                      )
                    }
                  >
                    Pilih Paket Lain
                  </Button>
                </div>
              ) : (
                <CheckoutSummary
                  tier={selectedTier}
                  durationMonths={selectedDuration}
                  pricingConfig={getPricingConfig(selectedTier)}
                  onCheckout={() => {
                    // Optional: track checkout event
                  }}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
