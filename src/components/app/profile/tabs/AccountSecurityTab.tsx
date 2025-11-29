'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Dialog, DialogTitle, DialogDescription } from '@/components/ui/Dialog';
import { Separator } from '@/components/ui/separator';
import {
  CreditCard,
  AlertTriangle,
  Trash2,
  LogOut,
  History,
  Zap,
  ArrowUpRight,
  Ticket,
} from 'lucide-react';
import { UserProfile } from '../ProfilePage';
import { useRouter } from 'next/navigation';
import { signOut } from 'next-auth/react';
import { CreditBalance } from '@/components/subscription/CreditBalance';
import { UsageHistory } from '@/components/subscription/UsageHistory';
import { UsageWarning } from '@/components/subscription/UsageWarning';
import { TrialStatus, TrialExpired } from '@/components/subscription/TrialStatus';
import { PricingTable } from '@/components/subscription/PricingTable';
import { useSubscription, useCreditWarning, useTrialStatus } from '@/hooks/useSubscription';
import { SubscriptionTier } from '@prisma/client';
import { TIER_PRICING } from '@/lib/subscription/credit-config';
import { RedeemCodeInput } from '@/components/subscription/RedeemCodeInput';

interface AccountSecurityTabProps {
  user: UserProfile;
}

export function AccountSecurityTab({ user }: AccountSecurityTabProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [showPricing, setShowPricing] = useState(false);
  const [showRedeemCode, setShowRedeemCode] = useState(false);
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

  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    try {
      const response = await fetch(`/api/users/${user.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        router.push('/login');
      } else {
        throw new Error('Failed to delete account');
      }
    } catch (error) {
      console.error('Error deleting account:', error);
      alert('Gagal menghapus akun. Silakan coba lagi.');
    } finally {
      setIsDeleting(false);
      setDeleteDialogOpen(false);
    }
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
    <div className="space-y-6">
      {/* Current Plan Info */}
      {isSubscriptionLoading ? (
        <Card>
          <CardContent className="py-8">
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
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
                  <Badge
                    variant={subscription.status === 'ACTIVE' ? 'success' : 'warning'}
                    size="sm"
                  >
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

          {/* Redeem Code Section */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Ticket className="h-5 w-5" />
                  <CardTitle className="text-base">Kode Redeem</CardTitle>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowRedeemCode(!showRedeemCode)}
                >
                  {showRedeemCode ? 'Sembunyikan' : 'Masukkan Kode'}
                </Button>
              </div>
              <CardDescription>
                Punya kode promo atau voucher? Tukarkan di sini untuk mendapatkan kredit atau
                langganan.
              </CardDescription>
            </CardHeader>
            {showRedeemCode && (
              <CardContent>
                <RedeemCodeInput onSuccess={() => refresh()} />
              </CardContent>
            )}
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

          <Separator />

          {/* Pricing / Upgrade Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-medium">Bandingkan Paket</h3>
              <Button variant="ghost" size="sm" onClick={() => setShowPricing(!showPricing)}>
                {showPricing ? 'Sembunyikan' : 'Lihat Semua'}
                <ArrowUpRight className="h-4 w-4 ml-1" />
              </Button>
            </div>

            {showPricing && (
              <PricingTable currentTier={tier} onSelectTier={handleUpgrade} showFree={false} />
            )}

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
          </div>
        </>
      )}

      <Separator />

      {/* Logout */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <LogOut className="h-5 w-5" />
            Keluar
          </CardTitle>
          <CardDescription>Keluar dari akun Anda</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Logout</p>
              <p className="text-sm text-muted-foreground">Anda akan keluar dari sesi saat ini</p>
            </div>
            <Button
              variant="outline"
              className="gap-2"
              onClick={() => signOut({ callbackUrl: '/' })}
            >
              <LogOut className="h-4 w-4" />
              Logout
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="border-2 border-destructive">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-5 w-5" />
            Danger Zone
          </CardTitle>
          <CardDescription>Tindakan yang tidak dapat dibatalkan</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Hapus Akun</p>
              <p className="text-sm text-muted-foreground">
                Hapus akun dan semua data Anda secara permanen
              </p>
            </div>
            <Button
              variant="destructive"
              className="gap-2"
              onClick={() => setDeleteDialogOpen(true)}
            >
              <Trash2 className="h-4 w-4" />
              Hapus Akun
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Hapus Akun</DialogTitle>
        <DialogDescription>
          Apakah Anda yakin ingin menghapus akun Anda? Tindakan ini tidak dapat dibatalkan dan semua
          data Anda akan dihapus secara permanen.
        </DialogDescription>
        <div className="flex justify-end gap-3 mt-6">
          <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
            Batal
          </Button>
          <Button variant="destructive" onClick={handleDeleteAccount} disabled={isDeleting}>
            {isDeleting ? 'Menghapus...' : 'Ya, Hapus Akun'}
          </Button>
        </div>
      </Dialog>
    </div>
  );
}
