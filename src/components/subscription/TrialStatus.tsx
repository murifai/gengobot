'use client';

import { Clock, Gift, Zap, AlertTriangle, Calendar } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

interface TrialStatusProps {
  isTrialActive: boolean;
  trialDaysRemaining?: number;
  trialStartDate?: Date | string;
  trialEndDate?: Date | string;
  trialCreditsUsed?: number;
  trialCreditsTotal?: number;
  trialDailyUsed?: number;
  trialDailyLimit?: number;
  onUpgrade?: () => void;
  className?: string;
}

export function TrialStatus({
  isTrialActive,
  trialDaysRemaining = 0,
  trialStartDate: _trialStartDate,
  trialEndDate,
  trialCreditsUsed = 0,
  trialCreditsTotal = 5000,
  trialDailyUsed = 0,
  trialDailyLimit = 500,
  onUpgrade,
  className,
}: TrialStatusProps) {
  // Don't show if not in trial
  if (!isTrialActive) return null;

  const formatCredits = (credits: number) => {
    return new Intl.NumberFormat('id-ID').format(credits);
  };

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  const isTrialEnding = trialDaysRemaining <= 3;
  const isDailyLimitReached = trialDailyUsed >= trialDailyLimit;

  return (
    <Card className={cn('border-primary/20', className)}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            <Gift className="h-5 w-5 text-primary" />
            Trial Gratis
          </CardTitle>
          <Badge variant={isTrialEnding ? 'warning' : 'primary'} size="sm">
            {trialDaysRemaining} hari tersisa
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Trial ending warning */}
        {isTrialEnding && (
          <div className="flex items-start gap-2 rounded-lg bg-tertiary-yellow/10 p-3 text-sm">
            <AlertTriangle className="h-4 w-4 text-tertiary-yellow mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium text-tertiary-yellow">Trial hampir berakhir!</p>
              <p className="text-muted-foreground">
                Upgrade sekarang untuk melanjutkan akses ke semua fitur.
              </p>
            </div>
          </div>
        )}

        {/* Daily limit status */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              Penggunaan Harian
            </span>
            <span className={cn('font-medium', isDailyLimitReached && 'text-destructive')}>
              {formatCredits(trialDailyUsed)} / {formatCredits(trialDailyLimit)}
            </span>
          </div>
          <Progress value={trialDailyUsed} max={trialDailyLimit} className="h-2" />
          {isDailyLimitReached && (
            <p className="text-xs text-destructive">
              Limit harian tercapai. Reset besok jam 00:00 WIB.
            </p>
          )}
        </div>

        {/* Total trial credits */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-muted-foreground" />
              Total Trial
            </span>
            <span className="font-medium">
              {formatCredits(trialCreditsTotal - trialCreditsUsed)} tersisa
            </span>
          </div>
          <Progress value={trialCreditsUsed} max={trialCreditsTotal} className="h-2" />
        </div>

        {/* Trial dates */}
        {trialEndDate && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Calendar className="h-3 w-3" />
            <span>Berakhir {formatDate(trialEndDate)}</span>
          </div>
        )}

        {/* Upgrade CTA */}
        {onUpgrade && (
          <Button
            onClick={onUpgrade}
            variant={isTrialEnding ? 'default' : 'outline'}
            className="w-full"
          >
            <Zap className="h-4 w-4 mr-2" />
            Upgrade ke Premium
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

// Banner version for trial status
export function TrialBanner({
  trialDaysRemaining,
  onUpgrade,
  onDismiss: _onDismiss,
  className,
}: {
  trialDaysRemaining: number;
  onUpgrade?: () => void;
  onDismiss?: () => void;
  className?: string;
}) {
  const isUrgent = trialDaysRemaining <= 3;

  return (
    <div
      className={cn(
        'flex items-center justify-between px-4 py-2',
        isUrgent ? 'bg-tertiary-yellow text-black' : 'bg-primary/10 text-foreground',
        className
      )}
    >
      <div className="flex items-center gap-2">
        <Gift className="h-4 w-4" />
        <span className="text-sm font-medium">
          {isUrgent
            ? `Trial berakhir dalam ${trialDaysRemaining} hari!`
            : `${trialDaysRemaining} hari trial tersisa`}
        </span>
      </div>
      <div className="flex items-center gap-2">
        {onUpgrade && (
          <Button
            size="sm"
            variant={isUrgent ? 'default' : 'outline'}
            onClick={onUpgrade}
            className="h-7"
          >
            Upgrade
          </Button>
        )}
      </div>
    </div>
  );
}

// Expired trial component
export function TrialExpired({
  onUpgrade,
  className,
}: {
  onUpgrade?: () => void;
  className?: string;
}) {
  return (
    <Card className={cn('border-destructive/20', className)}>
      <CardContent className="py-6 text-center space-y-4">
        <div className="mx-auto w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center">
          <Clock className="h-6 w-6 text-destructive" />
        </div>
        <div className="space-y-2">
          <h3 className="font-semibold">Trial Telah Berakhir</h3>
          <p className="text-sm text-muted-foreground">
            Upgrade ke premium untuk melanjutkan menggunakan fitur voice dan mendapatkan lebih
            banyak kredit AI.
          </p>
        </div>
        {onUpgrade && (
          <Button onClick={onUpgrade} className="w-full">
            <Zap className="h-4 w-4 mr-2" />
            Upgrade Sekarang
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
