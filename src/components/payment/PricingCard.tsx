'use client';

import { Check, Zap, Star, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { cn } from '@/lib/utils';
import { SubscriptionTier } from '@prisma/client';
import { TIER_CONFIG, getDiscountedPrice } from '@/lib/subscription/credit-config';

interface PricingCardProps {
  tier: SubscriptionTier;
  durationMonths?: 1 | 3 | 6 | 12;
  isCurrentPlan?: boolean;
  currentTier?: SubscriptionTier;
  currentPeriodEnd?: Date | null;
  onSelect?: (tier: SubscriptionTier) => void;
  disabled?: boolean;
  className?: string;
}

const TIER_HIERARCHY: Record<SubscriptionTier, number> = {
  FREE: 0,
  BASIC: 1,
  PRO: 2,
};

export function PricingCard({
  tier,
  durationMonths = 1,
  isCurrentPlan = false,
  currentTier,
  currentPeriodEnd,
  onSelect,
  disabled = false,
  className,
}: PricingCardProps) {
  // Determine if this is a downgrade
  const isDowngrade =
    currentTier &&
    currentTier !== SubscriptionTier.FREE &&
    TIER_HIERARCHY[tier] < TIER_HIERARCHY[currentTier];
  const config = TIER_CONFIG[tier];
  const pricing = getDiscountedPrice(tier, durationMonths);

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Get tier display name
  const getTierName = () => {
    switch (tier) {
      case SubscriptionTier.FREE:
        return 'Free';
      case SubscriptionTier.BASIC:
        return 'Basic';
      case SubscriptionTier.PRO:
        return 'Pro';
      default:
        return tier;
    }
  };

  // Get tier features
  const getFeatures = () => {
    const features: string[] = [];

    if (tier === SubscriptionTier.FREE) {
      features.push(`${config.trialCredits.toLocaleString()} kredit trial`);
      features.push(`${config.trialDays} hari trial`);
      features.push(`Limit ${config.trialDailyLimit} kredit/hari`);
      features.push(`${config.customCharacters} karakter custom`);
    } else {
      features.push(`${config.monthlyCredits.toLocaleString()} kredit/bulan`);
      if (config.textUnlimited) {
        features.push('Chat text unlimited');
      }
      if (config.customCharactersUnlimited) {
        features.push('Karakter custom unlimited');
      } else {
        features.push(`${config.customCharacters} karakter custom`);
      }
      if (config.realtimeEnabled) {
        features.push('Realtime voice enabled');
      }
    }

    return features;
  };

  const isPro = tier === SubscriptionTier.PRO;
  const isFree = tier === SubscriptionTier.FREE;

  return (
    <Card
      className={cn(
        'relative',
        isPro && 'border-primary shadow-lg',
        isCurrentPlan && 'bg-muted/30',
        className
      )}
    >
      {isPro && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <Badge variant="primary" className="flex items-center gap-1">
            <Star className="h-3 w-3" />
            Popular
          </Badge>
        </div>
      )}

      <CardHeader className="text-center pb-2">
        <CardTitle className="flex items-center justify-center gap-2">
          {isPro && <Zap className="h-5 w-5 text-primary" />}
          {getTierName()}
        </CardTitle>

        {isCurrentPlan && (
          <Badge variant="secondary" size="sm">
            Paket saat ini
          </Badge>
        )}
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Pricing */}
        <div className="text-center">
          {isFree ? (
            <div className="text-3xl font-bold">Gratis</div>
          ) : (
            <>
              <div className="text-3xl font-bold">{formatCurrency(pricing.monthlyEquivalent)}</div>
              <div className="text-sm text-muted-foreground">/bulan</div>
              {durationMonths > 1 && pricing.savings > 0 && (
                <div className="mt-1">
                  <span className="text-xs text-muted-foreground line-through">
                    {formatCurrency(pricing.originalTotal)}
                  </span>
                  <Badge variant="success" size="sm" className="ml-2">
                    Hemat {formatCurrency(pricing.savings)}
                  </Badge>
                </div>
              )}
            </>
          )}
        </div>

        {/* Features */}
        <ul className="space-y-2">
          {getFeatures().map((feature, index) => (
            <li key={index} className="flex items-center gap-2 text-sm">
              <Check className="h-4 w-4 text-tertiary-green shrink-0" />
              <span>{feature}</span>
            </li>
          ))}
        </ul>

        {/* Downgrade Warning */}
        {isDowngrade && currentPeriodEnd && (
          <div className="p-3 bg-warning/10 border border-warning/30 rounded-base text-sm">
            <div className="flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 text-warning shrink-0 mt-0.5" />
              <p className="text-warning-foreground">
                Downgrade akan aktif setelah periode{' '}
                {currentTier === SubscriptionTier.PRO ? 'Pro' : 'Basic'} Anda berakhir pada{' '}
                <strong>
                  {currentPeriodEnd.toLocaleDateString('id-ID', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </strong>
              </p>
            </div>
          </div>
        )}

        {/* CTA Button */}
        {!isFree && onSelect && (
          <Button
            onClick={() => onSelect(tier)}
            disabled={disabled || isCurrentPlan}
            variant={isPro ? 'default' : 'outline'}
            className="w-full"
          >
            {isCurrentPlan
              ? 'Paket Saat Ini'
              : isDowngrade
                ? `Jadwalkan Downgrade ke ${getTierName()}`
                : `Pilih ${getTierName()}`}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
