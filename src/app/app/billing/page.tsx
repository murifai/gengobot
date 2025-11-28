'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  CreditCard,
  BarChart3,
  ArrowUpCircle,
  Calendar,
  AlertCircle,
  XCircle,
  RefreshCw,
  Loader2,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Separator } from '@/components/ui/separator';
import { CreditBalance } from '@/components/subscription/CreditBalance';
import { PaymentHistory } from '@/components/payment/PaymentHistory';
import { PricingComparison } from '@/components/subscription/PricingTable';
import { CreditUsageChart } from '@/components/subscription/CreditUsageChart';
import { useSubscription } from '@/hooks/useSubscription';
import { SubscriptionTier } from '@prisma/client';
import { TIER_PRICING } from '@/lib/subscription/credit-config';

export default function BillingPage() {
  const router = useRouter();
  const { subscription, balance, tier, isLoading, isTrialActive, trialDaysRemaining, refresh } =
    useSubscription();

  const [showPricingComparison, setShowPricingComparison] = useState(false);
  const [cancellationStatus, setCancellationStatus] = useState<{
    isCanceled: boolean;
    cancelDate?: string;
  } | null>(null);
  const [isCanceling, setIsCanceling] = useState(false);
  const [isReactivating, setIsReactivating] = useState(false);
  const [cancelError, setCancelError] = useState<string | null>(null);

  // Fetch cancellation status
  useEffect(() => {
    async function fetchCancellationStatus() {
      try {
        const response = await fetch('/api/subscription/cancel');
        if (response.ok) {
          const data = await response.json();
          setCancellationStatus(data);
        }
      } catch (error) {
        console.error('Error fetching cancellation status:', error);
      }
    }

    if (tier !== SubscriptionTier.FREE) {
      fetchCancellationStatus();
    }
  }, [tier]);

  const handleCancelSubscription = async () => {
    if (
      !confirm(
        'Apakah Anda yakin ingin membatalkan langganan? Anda masih dapat menggunakan kredit hingga akhir periode.'
      )
    ) {
      return;
    }

    setIsCanceling(true);
    setCancelError(null);

    try {
      const response = await fetch('/api/subscription/cancel', {
        method: 'POST',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Gagal membatalkan langganan');
      }

      setCancellationStatus({
        isCanceled: true,
        cancelDate: data.cancelDate,
      });
      refresh();
    } catch (error) {
      setCancelError(error instanceof Error ? error.message : 'Terjadi kesalahan');
    } finally {
      setIsCanceling(false);
    }
  };

  const handleReactivateSubscription = async () => {
    setIsReactivating(true);
    setCancelError(null);

    try {
      const response = await fetch('/api/subscription/cancel', {
        method: 'DELETE',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Gagal mengaktifkan kembali langganan');
      }

      setCancellationStatus({
        isCanceled: false,
      });
      refresh();
    } catch (error) {
      setCancelError(error instanceof Error ? error.message : 'Terjadi kesalahan');
    } finally {
      setIsReactivating(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const formatDate = (date: Date | string | null | undefined) => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
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

  const getTierBadgeVariant = (): 'default' | 'primary' | 'secondary' | 'success' | 'warning' => {
    switch (tier) {
      case SubscriptionTier.PRO:
        return 'primary';
      case SubscriptionTier.BASIC:
        return 'secondary';
      default:
        return 'default';
    }
  };

  const getStatusBadgeVariant = (): 'default' | 'success' | 'warning' | 'danger' => {
    switch (subscription?.status) {
      case 'ACTIVE':
        return 'success';
      case 'PAST_DUE':
        return 'warning';
      case 'CANCELED':
      case 'EXPIRED':
        return 'danger';
      default:
        return 'default';
    }
  };

  const getStatusLabel = () => {
    switch (subscription?.status) {
      case 'ACTIVE':
        return 'Aktif';
      case 'PAST_DUE':
        return 'Tertunggak';
      case 'CANCELED':
        return 'Dibatalkan';
      case 'EXPIRED':
        return 'Kadaluarsa';
      default:
        return 'Tidak Aktif';
    }
  };

  const handleUpgrade = (selectedTier?: SubscriptionTier) => {
    const tierParam = selectedTier ? `?tier=${selectedTier}` : '';
    router.push(`/app/upgrade${tierParam}`);
  };

  if (isLoading) {
    return (
      <div className="container max-w-4xl mx-auto py-8 px-4">
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container max-w-4xl mx-auto py-8 px-4 space-y-8">
      {/* Header */}
      <div>
        <Button variant="ghost" size="sm" onClick={() => router.back()} className="mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Kembali
        </Button>
        <h1 className="text-2xl font-bold">Billing & Langganan</h1>
        <p className="text-muted-foreground mt-1">Kelola langganan dan riwayat pembayaran kamu</p>
      </div>

      {/* Current Subscription Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <CreditCard className="h-5 w-5" />
            Langganan Saat Ini
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Paket</p>
              <p className="text-2xl font-bold">{getTierLabel()}</p>
            </div>
            <div className="flex gap-2">
              <Badge variant={getTierBadgeVariant()}>{getTierLabel()}</Badge>
              {subscription?.status && (
                <Badge variant={getStatusBadgeVariant()}>{getStatusLabel()}</Badge>
              )}
            </div>
          </div>

          {tier !== SubscriptionTier.FREE && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Harga</p>
                  <p className="font-semibold">{formatPrice(TIER_PRICING[tier])}/bulan</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Berlaku Sampai</p>
                  <p className="font-semibold">{formatDate(subscription?.currentPeriodEnd)}</p>
                </div>
              </div>

              <Separator />

              {/* Cancellation warning */}
              {cancellationStatus?.isCanceled && (
                <div className="flex items-start gap-2 p-3 bg-warning/10 border border-warning/30 rounded-base">
                  <XCircle className="h-4 w-4 text-warning shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <p className="text-sm text-warning-foreground font-medium">
                      Langganan dijadwalkan untuk dibatalkan
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Langganan akan berakhir pada{' '}
                      <strong>{formatDate(cancellationStatus.cancelDate)}</strong>. Anda masih dapat
                      menggunakan kredit hingga tanggal tersebut.
                    </p>
                  </div>
                </div>
              )}

              {/* Error message */}
              {cancelError && (
                <div className="flex items-center gap-2 p-3 bg-destructive/10 border border-destructive/30 rounded-base">
                  <AlertCircle className="h-4 w-4 text-destructive shrink-0" />
                  <p className="text-sm text-destructive">{cancelError}</p>
                </div>
              )}

              <div className="flex gap-2">
                <Button variant="outline" onClick={() => handleUpgrade()}>
                  Ubah Paket
                </Button>

                {cancellationStatus?.isCanceled ? (
                  <Button
                    variant="outline"
                    onClick={handleReactivateSubscription}
                    disabled={isReactivating}
                  >
                    {isReactivating ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Memproses...
                      </>
                    ) : (
                      <>
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Batalkan Pembatalan
                      </>
                    )}
                  </Button>
                ) : (
                  <Button
                    variant="ghost"
                    className="text-destructive hover:text-destructive hover:bg-destructive/10"
                    onClick={handleCancelSubscription}
                    disabled={isCanceling}
                  >
                    {isCanceling ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Memproses...
                      </>
                    ) : (
                      <>
                        <XCircle className="h-4 w-4 mr-2" />
                        Batalkan Langganan
                      </>
                    )}
                  </Button>
                )}
              </div>
            </>
          )}

          {tier === SubscriptionTier.FREE && (
            <div className="space-y-4">
              {isTrialActive && trialDaysRemaining !== undefined && (
                <div className="flex items-center gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <AlertCircle className="h-4 w-4 text-yellow-600" />
                  <p className="text-sm text-yellow-800">
                    Trial berakhir dalam <strong>{trialDaysRemaining} hari</strong>
                  </p>
                </div>
              )}
              <Button onClick={() => handleUpgrade()} className="w-full">
                <ArrowUpCircle className="h-4 w-4 mr-2" />
                Upgrade Sekarang
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

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

      {/* Credit Usage Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <BarChart3 className="h-5 w-5" />
            Penggunaan Kredit (30 Hari Terakhir)
          </CardTitle>
          <CardDescription>Lihat pola penggunaan kredit harian kamu</CardDescription>
        </CardHeader>
        <CardContent>
          <CreditUsageChart />
        </CardContent>
      </Card>

      {/* Payment History */}
      <PaymentHistory />

      {/* Subscription Plans Comparison */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-base">
              <Calendar className="h-5 w-5" />
              Bandingkan Paket
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowPricingComparison(!showPricingComparison)}
            >
              {showPricingComparison ? 'Sembunyikan' : 'Lihat'}
            </Button>
          </div>
        </CardHeader>
        {showPricingComparison && (
          <CardContent>
            <PricingComparison currentTier={tier} onSelectTier={handleUpgrade} />
          </CardContent>
        )}
      </Card>
    </div>
  );
}
