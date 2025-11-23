'use client';

import { useEffect, useState } from 'react';
import { CreditCard, Users, TrendingUp, DollarSign, Loader2, Tag, Percent } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';

interface SubscriptionMetrics {
  // User metrics
  totalUsers: number;
  usersByTier: {
    FREE: number;
    BASIC: number;
    PRO: number;
  };
  trialUsers: number;
  // Revenue metrics
  totalRevenue: number;
  monthlyRevenue: number;
  // Voucher metrics
  totalVouchers: number;
  activeVouchers: number;
  totalRedemptions: number;
  totalDiscountGiven: number;
  topVouchers: {
    id: string;
    code: string;
    name: string;
    currentUses: number;
    type: string;
    value: number;
  }[];
}

export default function SubscriptionDashboardPage() {
  const [metrics, setMetrics] = useState<SubscriptionMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const response = await fetch('/api/admin/subscription/metrics');
        const data = await response.json();

        if (response.ok) {
          setMetrics(data);
        }
      } catch (error) {
        console.error('Failed to fetch metrics:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMetrics();
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!metrics) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Gagal memuat data metrics</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Subscription Dashboard</h1>
        <p className="text-muted-foreground">Monitor metrics subscription dan voucher</p>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.totalUsers}</div>
            <p className="text-xs text-muted-foreground">{metrics.trialUsers} dalam trial</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revenue (MTD)</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(metrics.monthlyRevenue)}</div>
            <p className="text-xs text-muted-foreground">
              Total: {formatCurrency(metrics.totalRevenue)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Voucher Redemptions</CardTitle>
            <Tag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.totalRedemptions}</div>
            <p className="text-xs text-muted-foreground">{metrics.activeVouchers} voucher aktif</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Diskon</CardTitle>
            <Percent className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(metrics.totalDiscountGiven)}</div>
            <p className="text-xs text-muted-foreground">Dari {metrics.totalVouchers} voucher</p>
          </CardContent>
        </Card>
      </div>

      {/* User Distribution & Top Vouchers */}
      <div className="grid gap-4 lg:grid-cols-2">
        {/* Users by Tier */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Users by Tier
            </CardTitle>
            <CardDescription>Distribusi user berdasarkan tier</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">FREE</Badge>
                  <span className="text-sm">Free Tier</span>
                </div>
                <span className="font-medium">{metrics.usersByTier.FREE}</span>
              </div>
              <div className="w-full bg-secondary rounded-full h-2">
                <div
                  className="bg-secondary-foreground/50 h-2 rounded-full"
                  style={{
                    width: `${metrics.totalUsers > 0 ? (metrics.usersByTier.FREE / metrics.totalUsers) * 100 : 0}%`,
                  }}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge variant="primary">BASIC</Badge>
                  <span className="text-sm">Basic Tier</span>
                </div>
                <span className="font-medium">{metrics.usersByTier.BASIC}</span>
              </div>
              <div className="w-full bg-secondary rounded-full h-2">
                <div
                  className="bg-primary h-2 rounded-full"
                  style={{
                    width: `${metrics.totalUsers > 0 ? (metrics.usersByTier.BASIC / metrics.totalUsers) * 100 : 0}%`,
                  }}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge variant="success">PRO</Badge>
                  <span className="text-sm">Pro Tier</span>
                </div>
                <span className="font-medium">{metrics.usersByTier.PRO}</span>
              </div>
              <div className="w-full bg-secondary rounded-full h-2">
                <div
                  className="bg-tertiary-green h-2 rounded-full"
                  style={{
                    width: `${metrics.totalUsers > 0 ? (metrics.usersByTier.PRO / metrics.totalUsers) * 100 : 0}%`,
                  }}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Top Vouchers */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Top Vouchers
            </CardTitle>
            <CardDescription>Voucher dengan redemption terbanyak</CardDescription>
          </CardHeader>
          <CardContent>
            {metrics.topVouchers.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">Belum ada voucher</p>
            ) : (
              <div className="space-y-4">
                {metrics.topVouchers.map((voucher, index) => (
                  <div
                    key={voucher.id}
                    className="flex items-center justify-between py-2 border-b last:border-0"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-lg font-bold text-muted-foreground">#{index + 1}</span>
                      <div>
                        <p className="font-medium text-sm">{voucher.name}</p>
                        <p className="text-xs text-muted-foreground font-mono">{voucher.code}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{voucher.currentUses}</p>
                      <p className="text-xs text-muted-foreground">redemptions</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
