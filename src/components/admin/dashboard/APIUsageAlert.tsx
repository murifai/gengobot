'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { AlertTriangle, Activity, DollarSign, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';

interface APIUsageAlertProps {
  current: number;
  limit: number;
  percentage: number;
  costInRupiah: number;
  // New optional props for enhanced display
  credits?: number;
  transactions?: number;
  costUSD?: number;
  budgetIDR?: number;
}

function formatRupiah(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

function formatTokens(tokens: number): string {
  if (tokens >= 1000000) {
    return `${(tokens / 1000000).toFixed(1)}M`;
  }
  if (tokens >= 1000) {
    return `${(tokens / 1000).toFixed(1)}K`;
  }
  return tokens.toString();
}

export function APIUsageAlert({
  current,
  limit,
  percentage,
  costInRupiah,
  credits,
  transactions,
  costUSD,
  budgetIDR,
}: APIUsageAlertProps) {
  const isWarning = percentage >= 80;
  const isCritical = percentage >= 95;

  // Use credits if available, otherwise fall back to current
  const displayCredits = credits ?? current;
  const displayBudget = budgetIDR ?? (limit > 0 ? limit * 0.155 : 0); // Approximate IDR if not provided

  return (
    <Card
      className={cn(
        isCritical && 'border-destructive',
        isWarning && !isCritical && 'border-tertiary-yellow'
      )}
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div>
          <CardTitle className="text-sm font-medium">API Usage</CardTitle>
          <CardDescription>Monthly OpenAI credit consumption</CardDescription>
        </div>
        {isWarning ? (
          <AlertTriangle
            className={cn('h-5 w-5', isCritical ? 'text-destructive' : 'text-tertiary-yellow')}
          />
        ) : (
          <Activity className="h-4 w-4 text-muted-foreground" />
        )}
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Usage bar */}
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span>{formatTokens(displayCredits)} credits</span>
              <span
                className={cn(
                  'font-medium',
                  isCritical && 'text-destructive',
                  isWarning && !isCritical && 'text-tertiary-yellow',
                  !isWarning && 'text-tertiary-green'
                )}
              >
                {percentage.toFixed(1)}%
              </span>
            </div>
            <div className="h-3 w-full rounded-full bg-muted">
              <div
                className={cn(
                  'h-3 rounded-full transition-all',
                  isCritical && 'bg-destructive',
                  isWarning && !isCritical && 'bg-tertiary-yellow',
                  !isWarning && 'bg-tertiary-green'
                )}
                style={{ width: `${Math.min(percentage, 100)}%` }}
              />
            </div>
          </div>

          {/* Stats display */}
          <div className="grid grid-cols-2 gap-4 pt-2 border-t">
            <div className="flex items-center gap-2 text-sm">
              <DollarSign className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-muted-foreground">Cost</p>
                <p className="font-medium">{formatRupiah(costInRupiah)}</p>
                {costUSD !== undefined && (
                  <p className="text-xs text-muted-foreground">(${costUSD.toFixed(4)})</p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Zap className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-muted-foreground">Budget</p>
                <p className="font-medium">{formatRupiah(displayBudget)}</p>
                {transactions !== undefined && (
                  <p className="text-xs text-muted-foreground">
                    {transactions.toLocaleString()} transactions
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Warning message */}
          {isWarning && (
            <div
              className={cn(
                'p-3 rounded-lg text-sm',
                isCritical
                  ? 'bg-destructive/10 text-destructive'
                  : 'bg-tertiary-yellow/10 text-tertiary-yellow'
              )}
            >
              {isCritical ? (
                <p>
                  <strong>Critical:</strong> API usage has exceeded 95% of budget. Consider
                  reviewing usage patterns or adjusting budget.
                </p>
              ) : (
                <p>
                  <strong>Warning:</strong> API usage has exceeded 80% of budget. Monitor usage
                  closely.
                </p>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
