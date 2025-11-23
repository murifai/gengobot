'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { DollarSign, TrendingUp, TrendingDown } from 'lucide-react';

interface RevenueCardProps {
  totalRevenue: number;
  monthlyRevenue: number;
  profit: number;
  expenses: number;
}

function formatRupiah(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function RevenueCard({ totalRevenue, monthlyRevenue, profit, expenses }: RevenueCardProps) {
  const profitMargin = totalRevenue > 0 ? ((profit / totalRevenue) * 100).toFixed(1) : '0';

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Revenue</CardTitle>
        <DollarSign className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{formatRupiah(totalRevenue)}</div>
        <p className="text-xs text-muted-foreground">{formatRupiah(monthlyRevenue)} this month</p>
        <div className="mt-4 grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Profit</p>
            <div className="flex items-center gap-1">
              <TrendingUp className="h-3 w-3 text-tertiary-green" />
              <span className="text-sm font-medium text-tertiary-green">
                {formatRupiah(profit)}
              </span>
            </div>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Expenses</p>
            <div className="flex items-center gap-1">
              <TrendingDown className="h-3 w-3 text-destructive" />
              <span className="text-sm font-medium text-destructive">{formatRupiah(expenses)}</span>
            </div>
          </div>
        </div>
        <div className="mt-2 text-xs text-muted-foreground">Profit margin: {profitMargin}%</div>
      </CardContent>
    </Card>
  );
}
