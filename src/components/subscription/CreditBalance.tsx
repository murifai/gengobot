'use client';

import { Zap, Clock, MessageSquare, Mic } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/Badge';
import { cn } from '@/lib/utils';
import { SubscriptionTier, UsageType } from '@prisma/client';
import { CREDIT_COSTS, estimateMinutesFromCredits } from '@/lib/subscription/credit-config';

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
}

export function CreditBalance({
  total,
  used,
  remaining,
  tier: _tier,
  isTrialActive = false,
  trialDaysRemaining,
  trialDailyUsed,
  trialDailyLimit,
  periodEnd,
  compact = false,
  className,
}: CreditBalanceProps) {
  const usagePercentage = total > 0 ? (used / total) * 100 : 0;

  // Format credits with thousand separator
  const formatCredits = (credits: number) => {
    return new Intl.NumberFormat('id-ID').format(credits);
  };

  // Estimate usage in minutes
  const voiceMinutes = estimateMinutesFromCredits(remaining, UsageType.VOICE_STANDARD);
  const realtimeMinutes = estimateMinutesFromCredits(remaining, UsageType.REALTIME);
  const textMessages = Math.floor(remaining / CREDIT_COSTS.TEXT_CHAT_PER_MESSAGE);

  if (compact) {
    return (
      <div className={cn('flex items-center gap-2', className)}>
        <Zap className="h-4 w-4 text-primary" />
        <span className="text-sm font-medium">{formatCredits(remaining)}</span>
        <span className="text-xs text-muted-foreground">kredit</span>
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
        {/* Main balance display */}
        <div className="space-y-2">
          <div className="flex items-baseline justify-between">
            <span className="text-3xl font-bold">{formatCredits(remaining)}</span>
            <span className="text-sm text-muted-foreground">
              dari {formatCredits(total)} kredit
            </span>
          </div>

          {/* Progress bar */}
          <div className="space-y-1">
            <Progress value={used} max={total} className="h-2" />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{formatCredits(used)} digunakan</span>
              <span>{Math.round(usagePercentage)}%</span>
            </div>
          </div>
        </div>

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

        {/* Estimated usage */}
        <div className="space-y-2">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            Estimasi Penggunaan
          </p>
          <div className="grid grid-cols-3 gap-2">
            <div className="flex flex-col items-center rounded-lg bg-muted/50 p-2">
              <Mic className="h-4 w-4 text-muted-foreground mb-1" />
              <span className="text-sm font-medium">{voiceMinutes}</span>
              <span className="text-xs text-muted-foreground">menit voice</span>
            </div>
            <div className="flex flex-col items-center rounded-lg bg-muted/50 p-2">
              <Clock className="h-4 w-4 text-muted-foreground mb-1" />
              <span className="text-sm font-medium">{realtimeMinutes}</span>
              <span className="text-xs text-muted-foreground">menit realtime</span>
            </div>
            <div className="flex flex-col items-center rounded-lg bg-muted/50 p-2">
              <MessageSquare className="h-4 w-4 text-muted-foreground mb-1" />
              <span className="text-sm font-medium">{textMessages}</span>
              <span className="text-xs text-muted-foreground">pesan chat</span>
            </div>
          </div>
        </div>

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
