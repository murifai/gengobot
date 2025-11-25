'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  LineChart,
  Line,
} from 'recharts';
import { TrendingUp, TrendingDown, DollarSign, CreditCard, Users, Download } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface EarningReportsTabProps {
  revenue: {
    total: number;
    thisMonth: number;
    lastMonth: number;
    growth: number;
    byMonth: Array<{ month: string; total: number }>;
  };
  expenses: {
    total: number;
    apiUsage: number;
    credits?: number;
    costUSD?: number;
    byType?: {
      textChat: number;
      voice: number;
      realtime: number;
    };
  };
  profit: {
    total: number;
    margin: string;
  };
  subscriptions: {
    byTier: { FREE: number; BASIC: number; PRO: number };
    total: number;
    paid: number;
    conversionRate: string;
  };
  payments: {
    total: number;
    completed: number;
    recent: Array<{
      id: string;
      amount: number;
      status: string;
      plan: string;
      billingCycle: string;
      createdAt: string;
      user: { id: string; name: string | null; email: string };
    }>;
  };
  onExport: () => void;
  isExporting: boolean;
}

const TIER_COLORS = {
  FREE: '#94a3b8',
  BASIC: '#3b82f6',
  PRO: '#8b5cf6',
};

function formatRupiah(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function EarningReportsTab({
  revenue,
  expenses,
  profit,
  subscriptions,
  payments,
  onExport,
  isExporting,
}: EarningReportsTabProps) {
  const tierData = Object.entries(subscriptions.byTier).map(([tier, count]) => ({
    name: tier,
    value: count,
  }));

  return (
    <div className="space-y-6">
      {/* Export button */}
      <div className="flex justify-end">
        <Button variant="outline" size="sm" onClick={onExport} disabled={isExporting}>
          <Download className="h-4 w-4 mr-2" />
          {isExporting ? 'Exporting...' : 'Export Pendapatan'}
        </Button>
      </div>

      {/* Revenue metrics */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatRupiah(revenue.total)}</div>
            <p className="text-xs text-muted-foreground">All time</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Month</CardTitle>
            {revenue.growth >= 0 ? (
              <TrendingUp className="h-4 w-4 text-tertiary-green" />
            ) : (
              <TrendingDown className="h-4 w-4 text-destructive" />
            )}
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatRupiah(revenue.thisMonth)}</div>
            <p
              className={`text-xs ${revenue.growth >= 0 ? 'text-tertiary-green' : 'text-destructive'}`}
            >
              {revenue.growth >= 0 ? '+' : ''}
              {revenue.growth}% vs last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Profit</CardTitle>
            <TrendingUp className="h-4 w-4 text-tertiary-green" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatRupiah(profit.total)}</div>
            <p className="text-xs text-muted-foreground">{profit.margin}% margin</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">API Expenses</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatRupiah(expenses.apiUsage)}</div>
            <p className="text-xs text-muted-foreground">
              {expenses.credits?.toLocaleString() || 0} credits used
            </p>
            {expenses.byType && (
              <div className="mt-3 space-y-1 text-xs">
                <div className="flex justify-between text-muted-foreground">
                  <span>Text Chat:</span>
                  <span>{formatRupiah(expenses.byType.textChat)}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Voice:</span>
                  <span>{formatRupiah(expenses.byType.voice)}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Realtime:</span>
                  <span>{formatRupiah(expenses.byType.realtime)}</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Charts row */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Monthly revenue trend */}
        <Card>
          <CardHeader>
            <CardTitle>Revenue Trend</CardTitle>
            <CardDescription>Monthly revenue over time</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={revenue.byMonth}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis
                    dataKey="month"
                    tick={{ fontSize: 11 }}
                    tickFormatter={value => value.substring(5)} // Show MM only
                  />
                  <YAxis
                    tick={{ fontSize: 11 }}
                    tickFormatter={value => `${(value / 1000000).toFixed(0)}M`}
                  />
                  <Tooltip formatter={(value: number) => [formatRupiah(value), 'Revenue']} />
                  <Line
                    type="monotone"
                    dataKey="total"
                    stroke="hsl(var(--primary))"
                    strokeWidth={2}
                    dot={{ fill: 'hsl(var(--primary))' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Subscriptions by tier */}
        <Card>
          <CardHeader>
            <CardTitle>Subscriptions by Tier</CardTitle>
            <CardDescription>
              {subscriptions.paid} paid ({subscriptions.conversionRate}% conversion)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={tierData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                  >
                    {tierData.map(entry => (
                      <Cell
                        key={entry.name}
                        fill={TIER_COLORS[entry.name as keyof typeof TIER_COLORS]}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent payments */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Payments</CardTitle>
          <CardDescription>
            {payments.completed} of {payments.total} completed
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {payments.recent.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">No payments yet</p>
            ) : (
              payments.recent.slice(0, 10).map(payment => (
                <div key={payment.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="text-xs">
                        {payment.user.email.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium">
                        {payment.user.name || payment.user.email}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {payment.plan} • {payment.billingCycle}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">{formatRupiah(payment.amount)}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(payment.createdAt), { addSuffix: true })}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
