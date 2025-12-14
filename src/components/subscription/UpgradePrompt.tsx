'use client';

import { Zap, Clock, MessageSquare, Users, Star, X } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Dialog, DialogTitle } from '@/components/ui/Dialog';
import { cn } from '@/lib/utils';
import { SubscriptionTier } from '@prisma/client';
import { TIER_CONFIG, TIER_PRICING } from '@/lib/subscription/credit-config';

type UpgradeContext =
  | 'credits_low'
  | 'credits_depleted'
  | 'trial_ending'
  | 'trial_expired'
  | 'feature_locked'
  | 'character_limit';

interface UpgradePromptProps {
  context: UpgradeContext;
  currentTier: SubscriptionTier;
  featureName?: string;
  onUpgrade?: (tier: SubscriptionTier) => void;
  onDismiss?: () => void;
  className?: string;
}

export function UpgradePrompt({
  context,
  currentTier,
  featureName,
  onUpgrade,
  onDismiss,
  className,
}: UpgradePromptProps) {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const getContextMessage = () => {
    switch (context) {
      case 'credits_low':
        return {
          title: 'Kredit AI Menipis',
          message: 'Upgrade untuk mendapatkan lebih banyak kredit AI setiap bulan.',
          icon: Zap,
        };
      case 'credits_depleted':
        return {
          title: 'Kredit AI Habis',
          message: 'Upgrade sekarang untuk melanjutkan menggunakan fitur voice.',
          icon: Zap,
        };
      case 'trial_ending':
        return {
          title: 'Trial Hampir Berakhir',
          message: 'Jangan kehilangan akses! Upgrade sebelum trial berakhir.',
          icon: Clock,
        };
      case 'trial_expired':
        return {
          title: 'Trial Telah Berakhir',
          message: 'Upgrade untuk melanjutkan menggunakan semua fitur Gengo.',
          icon: Clock,
        };
      case 'feature_locked':
        return {
          title: `Fitur ${featureName || ''} Terkunci`,
          message: 'Upgrade untuk membuka fitur ini dan fitur premium lainnya.',
          icon: Star,
        };
      case 'character_limit':
        return {
          title: 'Batas Karakter Tercapai',
          message: 'Upgrade untuk membuat lebih banyak karakter kustom.',
          icon: Users,
        };
    }
  };

  const contextInfo = getContextMessage();
  const Icon = contextInfo.icon;

  const recommendedTier =
    currentTier === SubscriptionTier.FREE ? SubscriptionTier.BASIC : SubscriptionTier.PRO;

  const tierConfig = TIER_CONFIG[recommendedTier];
  const tierPrice = TIER_PRICING[recommendedTier];

  return (
    <Card className={cn('relative overflow-hidden', className)}>
      {onDismiss && (
        <button
          onClick={onDismiss}
          className="absolute top-3 right-3 text-muted-foreground hover:text-foreground"
        >
          <X className="h-4 w-4" />
        </button>
      )}
      <CardContent className="pt-6 space-y-4">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
            <Icon className="h-5 w-5 text-primary" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold">{contextInfo.title}</h3>
            <p className="text-sm text-muted-foreground">{contextInfo.message}</p>
          </div>
        </div>

        <div className="rounded-lg bg-muted/50 p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="font-semibold">
              {recommendedTier === SubscriptionTier.BASIC ? 'Basic' : 'Pro'}
            </span>
            <span className="text-lg font-bold">
              {formatPrice(tierPrice)}
              <span className="text-sm font-normal text-muted-foreground">/bulan</span>
            </span>
          </div>
          <ul className="space-y-2 text-sm">
            <li className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-primary" />
              <span>{tierConfig.monthlyCredits.toLocaleString('id-ID')} kredit AI/bulan</span>
            </li>
            <li className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-primary" />
              <span>Chat unlimited</span>
            </li>
            <li className="flex items-center gap-2">
              <Users className="h-4 w-4 text-primary" />
              <span>
                {tierConfig.customCharactersUnlimited
                  ? 'Karakter unlimited'
                  : `${tierConfig.customCharacters} karakter kustom`}
              </span>
            </li>
          </ul>
        </div>

        <div className="flex gap-2">
          <Button onClick={() => onUpgrade?.(recommendedTier)} className="flex-1">
            Upgrade ke {recommendedTier === SubscriptionTier.BASIC ? 'Basic' : 'Pro'}
          </Button>
          {currentTier === SubscriptionTier.FREE && recommendedTier !== SubscriptionTier.PRO && (
            <Button variant="outline" onClick={() => onUpgrade?.(SubscriptionTier.PRO)}>
              Pro
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// Modal version for blocking prompts
export function UpgradeModal({
  open,
  onOpenChange,
  context,
  currentTier,
  featureName,
  onUpgrade,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  context: UpgradeContext;
  currentTier: SubscriptionTier;
  featureName?: string;
  onUpgrade?: (tier: SubscriptionTier) => void;
}) {
  return (
    <Dialog open={open} onClose={() => onOpenChange(false)} size="md">
      <DialogTitle className="sr-only">Upgrade Subscription</DialogTitle>
      <UpgradePrompt
        context={context}
        currentTier={currentTier}
        featureName={featureName}
        onUpgrade={tier => {
          onUpgrade?.(tier);
          onOpenChange(false);
        }}
        onDismiss={() => onOpenChange(false)}
      />
    </Dialog>
  );
}

// Inline prompt for subtle upgrade suggestions
export function UpgradePromptInline({
  message,
  onUpgrade,
  className,
}: {
  message: string;
  onUpgrade?: () => void;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'flex items-center justify-between rounded-lg bg-primary/5 px-4 py-3',
        className
      )}
    >
      <div className="flex items-center gap-2">
        <Zap className="h-4 w-4 text-primary" />
        <span className="text-sm">{message}</span>
      </div>
      {onUpgrade && (
        <Button size="sm" variant="ghost" onClick={onUpgrade}>
          Upgrade
        </Button>
      )}
    </div>
  );
}

// Feature-specific locked state
export function FeatureLockedPrompt({
  featureName,
  requiredTier,
  onUpgrade,
  className,
}: {
  featureName: string;
  requiredTier: SubscriptionTier;
  onUpgrade?: () => void;
  className?: string;
}) {
  const tierName = requiredTier === SubscriptionTier.BASIC ? 'Basic' : 'Pro';
  const tierPrice = TIER_PRICING[requiredTier];

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center p-6 text-center rounded-lg border border-dashed border-border bg-muted/30',
        className
      )}
    >
      <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-4">
        <Star className="h-6 w-6 text-muted-foreground" />
      </div>
      <h3 className="font-semibold mb-1">{featureName}</h3>
      <p className="text-sm text-muted-foreground mb-4">
        Fitur ini tersedia untuk paket {tierName} dan Pro.
      </p>
      {onUpgrade && (
        <Button onClick={onUpgrade} size="sm">
          Upgrade ke {tierName} - {formatPrice(tierPrice)}/bulan
        </Button>
      )}
    </div>
  );
}
