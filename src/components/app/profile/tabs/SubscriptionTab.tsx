'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { CreditCard, History, Zap } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { CreditBalance } from '@/components/subscription/CreditBalance';
import { UsageHistory } from '@/components/subscription/UsageHistory';
import { UsageWarning } from '@/components/subscription/UsageWarning';
import { TrialStatus, TrialExpired } from '@/components/subscription/TrialStatus';
import { useSubscription, useCreditWarning, useTrialStatus } from '@/hooks/useSubscription';
import { SubscriptionTier } from '@prisma/client';
import { TIER_PRICING } from '@/lib/subscription/credit-config';

export function SubscriptionTab() {
  const router = useRouter();
  const {
    subscription,
    balance,
    tierConfig: _tierConfig,
    transactions,
    isLoading,
    isLoadingHistory,
    tier,
    isTrialActive,
    trialDaysRemaining,
    loadHistory,
    refresh,
  } = useSubscription();

  const warningLevel = useCreditWarning(balance);
  const trialStatus = useTrialStatus(balance);

  const [historyOffset, setHistoryOffset] = useState(0);
  const historyLimit = 10;

  // Load history on mount
  useEffect(() => {
    loadHistory({ limit: historyLimit, offset: 0 });
  }, [loadHistory]);

  const handleLoadMoreHistory = () => {
    const newOffset = historyOffset + historyLimit;
    loadHistory({ limit: historyLimit, offset: newOffset });
    setHistoryOffset(newOffset);
  };

  const handleUpgrade = (selectedTier?: SubscriptionTier) => {
    // Navigate to upgrade page with selected tier
    const tierParam = selectedTier ? `?tier=${selectedTier}` : '';
    router.push(`/app/upgrade${tierParam}`);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const getTierBadgeVariant = ():
    | 'default'
    | 'primary'
    | 'secondary'
    | 'success'
    | 'warning'
    | 'danger' => {
    switch (tier) {
      case SubscriptionTier.PRO:
        return 'primary';
      case SubscriptionTier.BASIC:
        return 'secondary';
      default:
        return 'default';
    }
  };

  const getTierLabel = () => {
    switch (tier) {
      case SubscriptionTier.PRO:
        return 'Pro';
      case SubscriptionTier.BASIC:
        return 'Basic';
      default:
        return 'Free';
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="py-8">
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Current Plan Info */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              <CardTitle className="text-base">Paket Langganan</CardTitle>
            </div>
            <Badge variant={getTierBadgeVariant()}>{getTierLabel()}</Badge>
          </div>
          <CardDescription>
            {tier === SubscriptionTier.FREE
              ? 'Anda menggunakan paket gratis dengan fitur terbatas.'
              : `Paket ${getTierLabel()} - ${formatPrice(TIER_PRICING[tier])}/bulan`}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Subscription details */}
          {subscription && subscription.status && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Status</span>
              <Badge variant={subscription.status === 'ACTIVE' ? 'success' : 'warning'} size="sm">
                {subscription.status === 'ACTIVE' ? 'Aktif' : subscription.status}
              </Badge>
            </div>
          )}

          {tier !== SubscriptionTier.FREE && (
            <Button
              variant="outline"
              className="w-full"
              onClick={() => router.push('/app/billing')}
            >
              Kelola Langganan
            </Button>
          )}

          {tier === SubscriptionTier.FREE && (
            <Button className="w-full" onClick={() => handleUpgrade()}>
              <Zap className="h-4 w-4 mr-2" />
              Upgrade ke Premium
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Trial Status (for FREE tier) */}
      {isTrialActive && trialStatus !== 'expired' && (
        <TrialStatus
          isTrialActive={isTrialActive}
          trialDaysRemaining={trialDaysRemaining}
          trialCreditsUsed={balance?.used}
          trialCreditsTotal={balance?.total}
          trialDailyUsed={balance?.trialDailyUsed}
          trialDailyLimit={balance?.trialDailyLimit}
          onUpgrade={() => handleUpgrade()}
        />
      )}

      {/* Trial Expired */}
      {trialStatus === 'expired' && <TrialExpired onUpgrade={() => handleUpgrade()} />}

      {/* Credit Balance */}
      {balance && (
        <CreditBalance
          total={balance.total}
          used={balance.used}
          remaining={balance.remaining}
          tier={tier}
          isTrialActive={isTrialActive}
          trialDaysRemaining={trialDaysRemaining}
          trialDailyUsed={balance.trialDailyUsed}
          trialDailyLimit={balance.trialDailyLimit}
          periodEnd={balance.periodEnd}
        />
      )}

      {/* Usage Warning */}
      {balance && warningLevel && (
        <UsageWarning
          used={balance.used}
          total={balance.total}
          onUpgrade={() => handleUpgrade()}
          dismissible
        />
      )}

      {/* Usage History */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-medium flex items-center gap-2">
            <History className="h-4 w-4" />
            Riwayat Penggunaan
          </h3>
          <Button variant="ghost" size="sm" onClick={() => refresh()}>
            Refresh
          </Button>
        </div>
        <UsageHistory
          transactions={transactions}
          isLoading={isLoadingHistory}
          hasMore={transactions.length > 0 && transactions.length % historyLimit === 0}
          onLoadMore={handleLoadMoreHistory}
        />
      </div>
    </div>
  );
}
