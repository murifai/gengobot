'use client';

import { Zap, Gift } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/Badge';
import { cn } from '@/lib/utils';
import { SubscriptionTier } from '@prisma/client';

interface CreditBalanceProps {
  total: number;
  used: number;
  remaining: number;
  tier: SubscriptionTier;
  isTrialActive?: boolean;
  trialDaysRemaining?: number;
  trialDailyUsed?: number;
  trialDailyLimit?: number;
  periodEnd?: Date;
  compact?: boolean;
  className?: string;
  // New props for separate trial credits display (for paid users)
  hasTrialCredits?: boolean;
  trialCreditsRemaining?: number;
  trialEndDate?: Date; // When trial credits expire
  // Subscription-only credits (for paid users with trial credits)
  subscriptionCreditsTotal?: number;
  subscriptionCreditsUsed?: number;
  subscriptionCreditsRemaining?: number;
}

export function CreditBalance({
  total,
  used,
  remaining,
  tier,
  isTrialActive = false,
  trialDaysRemaining,
  trialDailyUsed,
  trialDailyLimit,
  periodEnd,
  compact = false,
  className,
  hasTrialCredits = false,
  trialCreditsRemaining = 0,
  trialEndDate,
  subscriptionCreditsTotal,
  subscriptionCreditsUsed,
  subscriptionCreditsRemaining,
}: CreditBalanceProps) {
  // Format credits with thousand separator
  const formatCredits = (credits: number) => {
    return new Intl.NumberFormat('id-ID').format(credits);
  };

  // For paid users with trial credits, show separate bars
  const showSeparateBars =
    hasTrialCredits && tier !== SubscriptionTier.FREE && trialCreditsRemaining > 0;

  // Calculate subscription-specific values if not provided
  const subTotal = subscriptionCreditsTotal ?? (showSeparateBars ? total - 5000 : total);
  const subUsed =
    subscriptionCreditsUsed ?? (showSeparateBars ? used - (5000 - trialCreditsRemaining) : used);
  const subRemaining =
    subscriptionCreditsRemaining ??
    (showSeparateBars ? remaining - trialCreditsRemaining : remaining);

  // Trial credits calculation (5000 is the trial credits amount)
  const trialTotal = 5000;
  const trialUsed = trialTotal - trialCreditsRemaining;

  if (compact) {
    return (
      <div className={cn('flex items-center gap-2', className)}>
        <Zap className="h-4 w-4 text-primary" />
        <span className="text-sm font-medium">{formatCredits(remaining)}</span>
        <span className="text-xs text-muted-foreground">kredit AI</span>
      </div>
    );
  }

  return (
    <Card className={cn('', className)}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            <Zap className="h-5 w-5 text-primary" />
            Saldo Kredit
          </CardTitle>
          {isTrialActive && trialDaysRemaining !== undefined && (
            <Badge variant="warning" size="sm">
              Trial: {trialDaysRemaining} hari tersisa
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Total balance display */}
        <div className="space-y-1">
          <div className="flex items-baseline justify-between">
            <span className="text-3xl font-bold">{formatCredits(remaining)}</span>
            <span className="text-sm text-muted-foreground">total kredit AI tersedia</span>
          </div>
        </div>

        {showSeparateBars ? (
          <>
            {/* Subscription Credits Bar */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium text-foreground">Kredit AI Langganan</span>
                <span className="text-muted-foreground">
                  {formatCredits(subRemaining)} / {formatCredits(subTotal)}
                </span>
              </div>
              <Progress value={subUsed} max={subTotal} className="h-2" />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{formatCredits(subUsed)} digunakan</span>
                <span>{subTotal > 0 ? Math.round((subUsed / subTotal) * 100) : 0}%</span>
              </div>
            </div>

            {/* Trial Credits Bar */}
            <div className="rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 p-3 space-y-2">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-1.5">
                  <Gift className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                  <span className="font-medium text-amber-800 dark:text-amber-200">
                    Kredit AI Trial
                  </span>
                </div>
                <span className="text-amber-700 dark:text-amber-300">
                  {formatCredits(trialCreditsRemaining)} / {formatCredits(trialTotal)}
                </span>
              </div>
              <Progress
                value={trialUsed}
                max={trialTotal}
                className="h-1.5 bg-amber-200 dark:bg-amber-900 [&>div]:bg-amber-500"
              />
              <div className="flex items-center justify-between text-xs text-amber-600 dark:text-amber-400">
                <span>Sisa kredit AI dari masa trial (digunakan lebih dulu)</span>
                {trialEndDate && (
                  <span className="font-medium">
                    Kadaluarsa:{' '}
                    {new Date(trialEndDate).toLocaleDateString('id-ID', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </span>
                )}
              </div>
            </div>
          </>
        ) : (
          /* Single bar for FREE tier or users without trial credits */
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">dari {formatCredits(total)} kredit AI</span>
            </div>
            <Progress value={used} max={total} className="h-2" />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{formatCredits(used)} digunakan</span>
              <span>{total > 0 ? Math.round((used / total) * 100) : 0}%</span>
            </div>
          </div>
        )}

        {/* Trial daily limit (for FREE tier) */}
        {isTrialActive && trialDailyLimit && trialDailyUsed !== undefined && (
          <div className="rounded-lg bg-muted/50 p-3 space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Limit harian trial</span>
              <span className="font-medium">
                {formatCredits(trialDailyUsed)} / {formatCredits(trialDailyLimit)}
              </span>
            </div>
            <Progress value={trialDailyUsed} max={trialDailyLimit} className="h-1.5" />
          </div>
        )}

        {/* Period end date */}
        {periodEnd && (
          <p className="text-xs text-muted-foreground text-center">
            Periode berakhir:{' '}
            {new Date(periodEnd).toLocaleDateString('id-ID', {
              day: 'numeric',
              month: 'long',
              year: 'numeric',
            })}
          </p>
        )}
      </CardContent>
    </Card>
  );
}

// Compact version for header/navbar
export function CreditBalanceCompact({
  remaining,
  className,
}: {
  remaining: number;
  className?: string;
}) {
  const formatCredits = (credits: number) => {
    if (credits >= 1000) {
      return `${(credits / 1000).toFixed(1)}k`;
    }
    return credits.toString();
  };

  return (
    <div className={cn('flex items-center gap-1.5', className)}>
      <Zap className="h-4 w-4 text-primary" />
      <span className="text-sm font-medium">{formatCredits(remaining)}</span>
    </div>
  );
}
