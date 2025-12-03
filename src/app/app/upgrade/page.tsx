'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ChevronLeft, Check } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { PricingCard } from '@/components/payment/PricingCard';
import { CheckoutSummary } from '@/components/payment/CheckoutSummary';
import { SubscriptionTier } from '@prisma/client';
import { useSubscription } from '@/hooks/useSubscription';

type DurationOption = 1 | 3 | 6 | 12;

const DURATION_OPTIONS: { value: DurationOption; label: string; discount?: string }[] = [
  { value: 1, label: '1 bulan' },
  { value: 3, label: '3 bulan', discount: '10%' },
  { value: 6, label: '6 bulan', discount: '15%' },
  { value: 12, label: '12 bulan', discount: '20%' },
];

export default function UpgradePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { tier: currentTier, subscription, isLoading } = useSubscription();

  // Get initial tier from URL params
  const tierParam = searchParams?.get('tier') as SubscriptionTier | null;

  const [selectedTier, setSelectedTier] = useState<SubscriptionTier>(
    tierParam && (tierParam === SubscriptionTier.BASIC || tierParam === SubscriptionTier.PRO)
      ? tierParam
      : SubscriptionTier.BASIC
  );
  const [selectedDuration, setSelectedDuration] = useState<DurationOption>(1);

  // Update selected tier when URL param changes
  useEffect(() => {
    if (tierParam && (tierParam === SubscriptionTier.BASIC || tierParam === SubscriptionTier.PRO)) {
      setSelectedTier(tierParam);
    }
  }, [tierParam]);

  const handleBack = () => {
    router.back();
  };

  const handleTierSelect = (tier: SubscriptionTier) => {
    setSelectedTier(tier);
  };

  if (isLoading) {
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
                {DURATION_OPTIONS.map(option => (
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
          <div className="lg:col-span-1">
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
