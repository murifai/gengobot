'use client';

import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import {
  RevenueCard,
  SubscriberChart,
  ActiveUsersCard,
  UserByLevelChart,
  UserByDomicileChart,
  APIUsageAlert,
  RecentSubscribers,
} from '@/components/admin/dashboard';

export const dynamic = 'force-dynamic';

interface DashboardData {
  overview: {
    totalUsers: number;
    activeUsers: number;
    newUsersThisMonth: number;
  };
  subscribers: {
    byTier: {
      FREE: number;
      BASIC: number;
      PRO: number;
    };
    total: number;
    paid: number;
  };
  recentSubscribers: Array<{
    id: string;
    tier: 'FREE' | 'BASIC' | 'PRO';
    createdAt: string;
    user: {
      id: string;
      name: string | null;
      email: string;
      image: string | null;
    };
  }>;
  userAnalytics: {
    byLevel: Array<{ level: string; count: number }>;
    byDomicile: Array<{ domicile: string; count: number }>;
  };
  earnings: {
    totalRevenue: number;
    monthlyRevenue: number;
    profit: number;
    expenses: number;
  };
  apiUsage: {
    current: number;
    limit: number;
    percentage: number;
    costInRupiah: number;
  };
}

export default function AdminDashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        const response = await fetch('/api/admin/analytics/dashboard');
        if (!response.ok) {
          throw new Error('Failed to fetch dashboard data');
        }
        const result = await response.json();
        setData(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    }

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <p className="text-destructive font-medium">Error loading dashboard</p>
          <p className="text-sm text-muted-foreground mt-1">{error}</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">Overview of GengoBot analytics and metrics</p>
      </div>

      {/* Top row: Key metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <ActiveUsersCard
          totalUsers={data.overview.totalUsers}
          activeUsers={data.overview.activeUsers}
          newUsersThisMonth={data.overview.newUsersThisMonth}
        />
        <RevenueCard
          totalRevenue={data.earnings.totalRevenue}
          monthlyRevenue={data.earnings.monthlyRevenue}
          profit={data.earnings.profit}
          expenses={data.earnings.expenses}
        />
        <SubscriberChart
          byTier={data.subscribers.byTier}
          total={data.subscribers.total}
          paid={data.subscribers.paid}
        />
        <APIUsageAlert
          current={data.apiUsage.current}
          limit={data.apiUsage.limit}
          percentage={data.apiUsage.percentage}
          costInRupiah={data.apiUsage.costInRupiah}
        />
      </div>

      {/* Middle row: User analytics charts */}
      <div className="grid gap-4 md:grid-cols-2">
        <UserByLevelChart data={data.userAnalytics.byLevel} />
        <UserByDomicileChart data={data.userAnalytics.byDomicile} />
      </div>

      {/* Bottom row: Recent subscribers */}
      <div className="grid gap-4 lg:grid-cols-2">
        <RecentSubscribers subscribers={data.recentSubscribers} />

        {/* Placeholder for additional metrics */}
        <div className="hidden lg:block">{/* Future: Earnings reports or additional charts */}</div>
      </div>
    </div>
  );
}
