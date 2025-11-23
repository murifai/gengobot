'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { AlertTriangle, Activity, DollarSign } from 'lucide-react';
import { cn } from '@/lib/utils';

interface APIUsageAlertProps {
  current: number;
  limit: number;
  percentage: number;
  costInRupiah: number;
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

export function APIUsageAlert({ current, limit, percentage, costInRupiah }: APIUsageAlertProps) {
  const isWarning = percentage >= 80;
  const isCritical = percentage >= 95;

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
          <CardDescription>OpenAI token consumption</CardDescription>
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
              <span>
                {formatTokens(current)} / {formatTokens(limit)}
              </span>
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

          {/* Cost display */}
          <div className="flex items-center justify-between pt-2 border-t">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <DollarSign className="h-4 w-4" />
              <span>Estimated cost</span>
            </div>
            <span className="font-medium">{formatRupiah(costInRupiah)}</span>
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
                  <strong>Critical:</strong> API usage has exceeded 95%. Consider upgrading your
                  plan or reducing usage.
                </p>
              ) : (
                <p>
                  <strong>Warning:</strong> API usage has exceeded 80%. Monitor usage closely.
                </p>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
