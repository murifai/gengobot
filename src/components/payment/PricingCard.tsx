'use client';

import { useState } from 'react';
import { Check, Zap, AlertTriangle, ChevronDown, ChevronUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { cn } from '@/lib/utils';
import { SubscriptionTier } from '@prisma/client';
import {
  TIER_CONFIG,
  getDiscountedPrice,
  TierPricingConfig,
} from '@/lib/subscription/credit-config';

interface PricingCardProps {
  tier: SubscriptionTier;
  durationMonths?: 1 | 3 | 6 | 12;
  isCurrentPlan?: boolean;
  currentTier?: SubscriptionTier;
  currentPeriodEnd?: Date | null;
  onSelect?: (tier: SubscriptionTier) => void;
  disabled?: boolean;
  className?: string;
  /** Pricing config from database (for dynamic pricing) */
  pricingConfig?: TierPricingConfig | null;
  /** Features from database (for dynamic features) */
  features?: string[];
  /** Credits from database */
  credits?: number;
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
  pricingConfig,
  features: propFeatures,
  credits: propCredits,
}: PricingCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  // Determine if this is a downgrade
  const isDowngrade =
    currentTier &&
    currentTier !== SubscriptionTier.FREE &&
    TIER_HIERARCHY[tier] < TIER_HIERARCHY[currentTier];
  const config = TIER_CONFIG[tier];
  const pricing = getDiscountedPrice(tier, durationMonths, pricingConfig);

  // Use credits from props if available, otherwise fallback to config
  const credits = propCredits ?? config.monthlyCredits;

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

  // Get tier features - use API features if available, otherwise fallback to defaults
  const getFeatures = () => {
    // If features provided from API and not empty, use them
    if (propFeatures && propFeatures.length > 0) {
      return propFeatures;
    }

    // Fallback to default features
    const features: string[] = [];

    if (tier === SubscriptionTier.FREE) {
      features.push(`${config.trialCredits.toLocaleString()} kredit trial`);
      features.push(`${config.trialDays} hari trial`);
      features.push(`Limit ${config.trialDailyLimit} kredit/hari`);
      features.push(`${config.customCharacters} karakter custom`);
    } else {
      features.push(`${credits.toLocaleString()} kredit/bulan`);
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

  const isFree = tier === SubscriptionTier.FREE;

  return (
    <Card className={cn('relative flex flex-col', isCurrentPlan && 'bg-muted/30', className)}>
      {isCurrentPlan && (
        <Badge className="absolute -top-3 right-4" variant="secondary">
          Paket Saat Ini
        </Badge>
      )}

      <CardHeader className="text-center pb-2">
        <CardTitle className="text-2xl font-bold flex items-center justify-center gap-2">
          {tier === SubscriptionTier.PRO && <Zap className="h-5 w-5 text-primary" />}
          {getTierName()}
        </CardTitle>
      </CardHeader>

      <CardContent className="flex flex-col flex-1">
        {/* Pricing */}
        <div className="text-center mb-4">
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

        {/* Toggle Features Button */}
        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center justify-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4"
        >
          {isExpanded ? (
            <>
              <span>Sembunyikan fitur</span>
              <ChevronUp className="h-4 w-4" />
            </>
          ) : (
            <>
              <span>Lihat fitur</span>
              <ChevronDown className="h-4 w-4" />
            </>
          )}
        </button>

        {/* Features - Collapsible */}
        {isExpanded && (
          <ul className="space-y-2 mb-4">
            {getFeatures().map((feature, index) => (
              <li key={index} className="flex items-center gap-2 text-sm">
                <Check className="h-4 w-4 text-tertiary-green shrink-0" />
                <span>{feature}</span>
              </li>
            ))}
          </ul>
        )}

        {/* Downgrade Warning */}
        {isDowngrade && currentPeriodEnd && (
          <div className="p-3 bg-warning/10 border border-warning/30 rounded-base text-sm mb-4">
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

        {/* Spacer to push button to bottom */}
        <div className="flex-1" />

        {/* CTA Button - Always at bottom */}
        {!isFree && onSelect && (
          <Button
            onClick={() => onSelect(tier)}
            disabled={disabled || isCurrentPlan}
            variant="outline"
            className="w-full mt-auto"
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
