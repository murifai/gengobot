'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Separator } from '@/components/ui/separator';
import { CreditCard, ArrowLeft, Zap, History, Coins, Calendar, Ticket } from 'lucide-react';
import { CreditBalance } from '@/components/subscription/CreditBalance';
import { UsageHistory } from '@/components/subscription/UsageHistory';
import { UsageWarning } from '@/components/subscription/UsageWarning';
import { TrialStatus, TrialExpired } from '@/components/subscription/TrialStatus';
import { PricingTable } from '@/components/subscription/PricingTable';
import { RedeemCodeInput } from '@/components/subscription/RedeemCodeInput';
import { useSubscription, useCreditWarning, useTrialStatus } from '@/hooks/useSubscription';
import { SubscriptionTier } from '@prisma/client';
import { TIER_PRICING } from '@/lib/subscription/credit-config';

export default function SubscriptionPage() {
  const router = useRouter();
  const [showPricing, setShowPricing] = useState(false);
  const [historyOffset, setHistoryOffset] = useState(0);
  const historyLimit = 10;

  const {
    subscription,
    balance,
    transactions,
    isLoading: isSubscriptionLoading,
    isLoadingHistory,
    tier,
    isTrialActive,
    trialDaysRemaining,
    loadHistory,
    refresh,
  } = useSubscription();

  const warningLevel = useCreditWarning(balance);
  const trialStatus = useTrialStatus(balance);

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

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Detail Langganan</h1>
          <p className="text-sm text-muted-foreground">Kelola langganan dan kredit Anda</p>
        </div>
      </div>

      {isSubscriptionLoading ? (
        <Card>
          <CardContent className="py-8">
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {/* Current Plan */}
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
              {/* Subscription Status */}
              {subscription && subscription.status && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Status</span>
                  <Badge
                    variant={subscription.status === 'ACTIVE' ? 'success' : 'warning'}
                    size="sm"
                  >
                    {subscription.status === 'ACTIVE' ? 'Aktif' : subscription.status}
                  </Badge>
                </div>
              )}

              {/* Period End */}
              {balance?.periodEnd && (
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>Berlaku hingga</span>
                  </div>
                  <span>
                    {new Date(balance.periodEnd).toLocaleDateString('id-ID', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </span>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-2 pt-2">
                {tier !== SubscriptionTier.PRO && (
                  <Button className="flex-1" onClick={() => handleUpgrade()}>
                    <Zap className="h-4 w-4 mr-2" />
                    Upgrade
                  </Button>
                )}
                {tier !== SubscriptionTier.FREE && (
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => router.push('/app/billing')}
                  >
                    Kelola Langganan
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Trial Status */}
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

          {trialStatus === 'expired' && <TrialExpired onUpgrade={() => handleUpgrade()} />}

          {/* Credit Balance */}
          {balance && (
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Coins className="h-5 w-5" />
                  <CardTitle className="text-base">Saldo Kredit AI</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
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

                {/* Usage Warning */}
                {warningLevel && (
                  <div className="mt-4">
                    <UsageWarning
                      used={balance.used}
                      total={balance.total}
                      onUpgrade={() => handleUpgrade()}
                      dismissible
                    />
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Redeem Code */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Ticket className="h-5 w-5" />
                <CardTitle className="text-base">Redeem Voucher</CardTitle>
              </div>
              <CardDescription>
                Punya kode promo atau voucher? Tukarkan di sini untuk mendapatkan kredit.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <RedeemCodeInput onSuccess={() => refresh()} />
            </CardContent>
          </Card>

          {/* Usage History */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <History className="h-5 w-5" />
                  <CardTitle className="text-base">Riwayat Penggunaan</CardTitle>
                </div>
                <Button variant="ghost" size="sm" onClick={() => refresh()}>
                  Refresh
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <UsageHistory
                transactions={transactions}
                isLoading={isLoadingHistory}
                hasMore={transactions.length > 0 && transactions.length % historyLimit === 0}
                onLoadMore={handleLoadMoreHistory}
              />
            </CardContent>
          </Card>

          <Separator />

          {/* Pricing Comparison */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold">Bandingkan Paket</h2>
              <Button variant="ghost" size="sm" onClick={() => setShowPricing(!showPricing)}>
                {showPricing ? 'Sembunyikan' : 'Lihat Semua'}
              </Button>
            </div>

            {!showPricing && tier !== SubscriptionTier.PRO && (
              <Card className="bg-primary/5 border-primary/20">
                <CardContent className="py-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">
                        {tier === SubscriptionTier.FREE
                          ? 'Upgrade ke Basic atau Pro'
                          : 'Upgrade ke Pro'}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Dapatkan lebih banyak kredit dan fitur premium
                      </p>
                    </div>
                    <Button size="sm" onClick={() => handleUpgrade()}>
                      Upgrade
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {showPricing && (
              <PricingTable currentTier={tier} onSelectTier={handleUpgrade} showFree={false} />
            )}
          </div>
        </div>
      )}
    </div>
  );
}
