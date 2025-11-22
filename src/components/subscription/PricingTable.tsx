'use client';

import { Check, X, Zap, Crown, Star } from 'lucide-react';
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
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const tiers = [
    ...(showFree
      ? [
          {
            tier: SubscriptionTier.FREE,
            name: 'Free',
            description: 'Coba Gengo gratis dengan fitur terbatas',
            icon: Zap,
            popular: false,
          },
        ]
      : []),
    {
      tier: SubscriptionTier.BASIC,
      name: 'Basic',
      description: 'Untuk pengguna aktif dengan kebutuhan reguler',
      icon: Star,
      popular: true,
    },
    {
      tier: SubscriptionTier.PRO,
      name: 'Pro',
      description: 'Untuk pengguna serius dengan kebutuhan tinggi',
      icon: Crown,
      popular: false,
    },
  ];

  return (
    <div className={cn('grid gap-4', showFree ? 'md:grid-cols-3' : 'md:grid-cols-2', className)}>
      {tiers.map(({ tier, name, description, icon: Icon, popular }) => {
        const config = TIER_CONFIG[tier];
        const price = TIER_PRICING[tier];
        const isCurrentTier = currentTier === tier;

        // Calculate estimated minutes
        const voiceMinutes = Math.floor(
          config.monthlyCredits / CREDIT_COSTS.VOICE_STANDARD_PER_MINUTE
        );

        return (
          <Card
            key={tier}
            className={cn(
              'relative',
              popular && 'border-primary shadow-md',
              isCurrentTier && 'ring-2 ring-primary'
            )}
          >
            {popular && (
              <Badge className="absolute -top-3 left-1/2 -translate-x-1/2" variant="primary">
                Populer
              </Badge>
            )}
            {isCurrentTier && (
              <Badge className="absolute -top-3 right-4" variant="secondary">
                Paket Saat Ini
              </Badge>
            )}

            <CardHeader className="text-center pb-2">
              <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <Icon className="h-6 w-6 text-primary" />
              </div>
              <CardTitle className="text-xl">{name}</CardTitle>
              <p className="text-sm text-muted-foreground">{description}</p>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* Price */}
              <div className="text-center">
                <span className="text-3xl font-bold">{formatPrice(price)}</span>
                {price > 0 && <span className="text-muted-foreground">/bulan</span>}
              </div>

              {/* Features */}
              <ul className="space-y-2">
                {/* Credits */}
                <li className="flex items-center gap-2 text-sm">
                  <Check className="h-4 w-4 text-primary flex-shrink-0" />
                  <span>
                    {tier === SubscriptionTier.FREE
                      ? `${config.trialCredits.toLocaleString('id-ID')} kredit trial (${config.trialDays} hari)`
                      : `${config.monthlyCredits.toLocaleString('id-ID')} kredit/bulan`}
                  </span>
                </li>

                {/* Voice minutes estimate */}
                {tier !== SubscriptionTier.FREE && (
                  <li className="flex items-center gap-2 text-sm">
                    <Check className="h-4 w-4 text-primary flex-shrink-0" />
                    <span>~{voiceMinutes} menit voice/bulan</span>
                  </li>
                )}

                {/* Daily limit for free */}
                {tier === SubscriptionTier.FREE && (
                  <li className="flex items-center gap-2 text-sm">
                    <Check className="h-4 w-4 text-primary flex-shrink-0" />
                    <span>{config.trialDailyLimit} kredit/hari limit</span>
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

                {/* Custom characters */}
                <li className="flex items-center gap-2 text-sm">
                  <Check className="h-4 w-4 text-primary flex-shrink-0" />
                  <span>
                    {config.customCharactersUnlimited
                      ? 'Karakter kustom unlimited'
                      : `${config.customCharacters} karakter kustom`}
                  </span>
                </li>

                {/* Voice features */}
                <li className="flex items-center gap-2 text-sm">
                  <Check className="h-4 w-4 text-primary flex-shrink-0" />
                  <span>Voice standard & realtime</span>
                </li>
              </ul>

              {/* CTA Button */}
              <Button
                variant={popular ? 'default' : 'outline'}
                className="w-full"
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
    { name: 'Kredit/bulan', key: 'credits' },
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
      case 'credits':
        return tier === SubscriptionTier.FREE
          ? `${config.trialCredits.toLocaleString('id-ID')} (trial)`
          : config.monthlyCredits.toLocaleString('id-ID');
      case 'chat':
        return config.textUnlimited ? 'Unlimited' : `${config.textDailyLimit}/hari`;
      case 'characters':
        return config.customCharactersUnlimited ? 'Unlimited' : config.customCharacters.toString();
      case 'voice':
        return true;
      case 'realtime':
        return true;
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
            <th className="text-center py-3 px-4 font-medium">
              Basic
              <Badge variant="primary" size="sm" className="ml-2">
                Populer
              </Badge>
            </th>
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
                  variant={tier === SubscriptionTier.BASIC ? 'default' : 'outline'}
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
