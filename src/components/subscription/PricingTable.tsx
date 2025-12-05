'use client';

import { useState } from 'react';
import { Check, X, Zap, Crown, Star, ChevronDown, ChevronUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { cn } from '@/lib/utils';
import { SubscriptionTier } from '@prisma/client';
import { TIER_CONFIG, TIER_PRICING, CREDIT_COSTS } from '@/lib/subscription/credit-config';

interface PricingTableProps {
  currentTier?: SubscriptionTier;
  onSelectTier?: (tier: SubscriptionTier) => void;
  className?: string;
  showFree?: boolean;
}

export function PricingTable({
  currentTier,
  onSelectTier,
  className,
  showFree = true,
}: PricingTableProps) {
  const [expandedTiers, setExpandedTiers] = useState<Set<SubscriptionTier>>(new Set());

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const toggleExpanded = (tier: SubscriptionTier) => {
    setExpandedTiers(prev => {
      const newSet = new Set(prev);
      if (newSet.has(tier)) {
        newSet.delete(tier);
      } else {
        newSet.add(tier);
      }
      return newSet;
    });
  };

  const tiers = [
    ...(showFree
      ? [
          {
            tier: SubscriptionTier.FREE,
            name: 'Free',
            description: 'Coba Gengo gratis dengan fitur terbatas',
            icon: Zap,
          },
        ]
      : []),
    {
      tier: SubscriptionTier.BASIC,
      name: 'Basic',
      description: 'Untuk pengguna aktif dengan kebutuhan reguler',
      icon: Star,
    },
    {
      tier: SubscriptionTier.PRO,
      name: 'Pro',
      description: 'Untuk pengguna serius dengan kebutuhan tinggi',
      icon: Crown,
    },
  ];

  return (
    <div className={cn('grid gap-4', showFree ? 'md:grid-cols-3' : 'md:grid-cols-2', className)}>
      {tiers.map(({ tier, name, description, icon: Icon }) => {
        const config = TIER_CONFIG[tier];
        const price = TIER_PRICING[tier];
        const isCurrentTier = currentTier === tier;
        const isExpanded = expandedTiers.has(tier);

        // Calculate estimated minutes
        const _voiceMinutes = Math.floor(
          config.monthlyCredits / CREDIT_COSTS.VOICE_STANDARD_PER_MINUTE
        );

        return (
          <Card
            key={tier}
            className={cn('relative flex flex-col', isCurrentTier && 'ring-2 ring-primary')}
          >
            {isCurrentTier && (
              <Badge className="absolute -top-3 right-4" variant="secondary">
                Paket Saat Ini
              </Badge>
            )}

            <CardHeader className="text-center pb-2">
              <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <Icon className="h-6 w-6 text-primary" />
              </div>
              <CardTitle className="text-2xl font-bold">{name}</CardTitle>
              <p className="text-sm text-muted-foreground">{description}</p>
            </CardHeader>

            <CardContent className="flex flex-col flex-1">
              {/* Price */}
              <div className="text-center mb-4">
                <span className="text-3xl font-bold">{formatPrice(price)}</span>
                {price > 0 && <span className="text-muted-foreground">/bulan</span>}
              </div>

              {/* Toggle Benefits Button */}
              <button
                type="button"
                onClick={() => toggleExpanded(tier)}
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
                  {/* Trial info for free */}
                  {tier === SubscriptionTier.FREE && (
                    <li className="flex items-center gap-2 text-sm">
                      <Check className="h-4 w-4 text-primary flex-shrink-0" />
                      <span>Trial {config.trialDays} hari</span>
                    </li>
                  )}

                  {/* Text chat */}
                  <li className="flex items-center gap-2 text-sm">
                    {config.textUnlimited ? (
                      <>
                        <Check className="h-4 w-4 text-primary flex-shrink-0" />
                        <span>Chat unlimited</span>
                      </>
                    ) : (
                      <>
                        <Check className="h-4 w-4 text-primary flex-shrink-0" />
                        <span>{config.textDailyLimit} pesan/hari</span>
                      </>
                    )}
                  </li>

                  {/* Voice standard */}
                  <li className="flex items-center gap-2 text-sm">
                    <Check className="h-4 w-4 text-primary flex-shrink-0" />
                    <span>
                      {tier === SubscriptionTier.FREE ? 'Voice standard (trial)' : 'Voice standard'}
                    </span>
                  </li>

                  {/* Realtime - only for PRO */}
                  <li className="flex items-center gap-2 text-sm">
                    {tier === SubscriptionTier.PRO ? (
                      <>
                        <Check className="h-4 w-4 text-primary flex-shrink-0" />
                        <span>Realtime chat</span>
                      </>
                    ) : (
                      <>
                        <X className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                        <span className="text-muted-foreground">Realtime chat</span>
                      </>
                    )}
                  </li>

                  {/* Custom characters */}
                  <li className="flex items-center gap-2 text-sm">
                    <Check className="h-4 w-4 text-primary flex-shrink-0" />
                    <span>
                      {config.customCharactersUnlimited
                        ? 'Karakter unlimited'
                        : `${config.customCharacters} karakter kustom`}
                    </span>
                  </li>
                </ul>
              )}

              {/* Spacer to push button to bottom */}
              <div className="flex-1" />

              {/* CTA Button - Always at bottom */}
              <Button
                variant="outline"
                className="w-full mt-auto"
                onClick={() => onSelectTier?.(tier)}
                disabled={isCurrentTier}
              >
                {isCurrentTier
                  ? 'Paket Saat Ini'
                  : tier === SubscriptionTier.FREE
                    ? 'Mulai Gratis'
                    : `Pilih ${name}`}
              </Button>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

// Compact comparison table
export function PricingComparison({
  currentTier,
  onSelectTier,
  className,
}: {
  currentTier?: SubscriptionTier;
  onSelectTier?: (tier: SubscriptionTier) => void;
  className?: string;
}) {
  const formatPrice = (price: number) => {
    if (price === 0) return 'Gratis';
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const features = [
    { name: 'Harga/bulan', key: 'price' },
    { name: 'Chat', key: 'chat' },
    { name: 'Karakter Kustom', key: 'characters' },
    { name: 'Voice Standard', key: 'voice' },
    { name: 'Realtime', key: 'realtime' },
  ];

  const getValue = (tier: SubscriptionTier, key: string) => {
    const config = TIER_CONFIG[tier];
    const price = TIER_PRICING[tier];

    switch (key) {
      case 'price':
        return formatPrice(price);
      case 'chat':
        return config.textUnlimited ? 'Unlimited' : `${config.textDailyLimit}/hari`;
      case 'characters':
        return config.customCharactersUnlimited ? 'Unlimited' : config.customCharacters.toString();
      case 'voice':
        return tier === SubscriptionTier.FREE ? 'Trial only' : true;
      case 'realtime':
        return tier === SubscriptionTier.PRO;
      default:
        return '-';
    }
  };

  return (
    <div className={cn('overflow-x-auto', className)}>
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b">
            <th className="text-left py-3 px-4 font-medium">Fitur</th>
            <th className="text-center py-3 px-4 font-medium">Free</th>
            <th className="text-center py-3 px-4 font-medium">Basic</th>
            <th className="text-center py-3 px-4 font-medium">Pro</th>
          </tr>
        </thead>
        <tbody>
          {features.map(feature => (
            <tr key={feature.key} className="border-b border-border/50">
              <td className="py-3 px-4 text-muted-foreground">{feature.name}</td>
              {[SubscriptionTier.FREE, SubscriptionTier.BASIC, SubscriptionTier.PRO].map(tier => {
                const value = getValue(tier, feature.key);
                return (
                  <td key={tier} className="py-3 px-4 text-center">
                    {typeof value === 'boolean' ? (
                      value ? (
                        <Check className="h-4 w-4 text-primary mx-auto" />
                      ) : (
                        <X className="h-4 w-4 text-muted-foreground mx-auto" />
                      )
                    ) : (
                      <span className={cn(tier === currentTier && 'font-medium text-primary')}>
                        {value}
                      </span>
                    )}
                  </td>
                );
              })}
            </tr>
          ))}
          <tr>
            <td className="py-3 px-4"></td>
            {[SubscriptionTier.FREE, SubscriptionTier.BASIC, SubscriptionTier.PRO].map(tier => (
              <td key={tier} className="py-3 px-4 text-center">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onSelectTier?.(tier)}
                  disabled={currentTier === tier}
                >
                  {currentTier === tier ? 'Saat Ini' : 'Pilih'}
                </Button>
              </td>
            ))}
          </tr>
        </tbody>
      </table>
    </div>
  );
}
