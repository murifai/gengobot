'use client';

import { AlertTriangle, XCircle, Zap } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';

type WarningLevel = 'low' | 'critical' | 'depleted';

interface UsageWarningProps {
  used: number;
  total: number;
  onUpgrade?: () => void;
  className?: string;
  dismissible?: boolean;
  onDismiss?: () => void;
}

export function UsageWarning({
  used,
  total,
  onUpgrade,
  className,
  dismissible = false,
  onDismiss,
}: UsageWarningProps) {
  const usagePercentage = total > 0 ? (used / total) * 100 : 0;
  const remaining = total - used;

  // Determine warning level
  const getWarningLevel = (): WarningLevel | null => {
    if (remaining <= 0) return 'depleted';
    if (usagePercentage >= 95) return 'critical';
    if (usagePercentage >= 80) return 'low';
    return null;
  };

  const level = getWarningLevel();

  // Don't show if no warning needed
  if (!level) return null;

  const formatCredits = (credits: number) => {
    return new Intl.NumberFormat('id-ID').format(credits);
  };

  const getConfig = () => {
    switch (level) {
      case 'depleted':
        return {
          icon: XCircle,
          title: 'Kredit Habis',
          message:
            'Kredit Anda telah habis. Upgrade sekarang untuk melanjutkan menggunakan fitur voice.',
          bgColor: 'bg-destructive/10 border-destructive/20',
          textColor: 'text-destructive',
          iconColor: 'text-destructive',
          buttonVariant: 'default' as const,
        };
      case 'critical':
        return {
          icon: AlertTriangle,
          title: 'Kredit Hampir Habis',
          message: `Sisa ${formatCredits(remaining)} kredit (${Math.round(100 - usagePercentage)}%). Pertimbangkan untuk upgrade.`,
          bgColor: 'bg-tertiary-yellow/10 border-tertiary-yellow/20',
          textColor: 'text-tertiary-yellow',
          iconColor: 'text-tertiary-yellow',
          buttonVariant: 'outline' as const,
        };
      case 'low':
        return {
          icon: Zap,
          title: 'Kredit Menipis',
          message: `Anda telah menggunakan ${Math.round(usagePercentage)}% kredit. Sisa ${formatCredits(remaining)} kredit.`,
          bgColor: 'bg-muted border-border',
          textColor: 'text-muted-foreground',
          iconColor: 'text-primary',
          buttonVariant: 'ghost' as const,
        };
    }
  };

  const config = getConfig();
  const Icon = config.icon;

  return (
    <div className={cn('relative rounded-lg border p-4', config.bgColor, className)}>
      <div className="flex items-start gap-3">
        <Icon className={cn('h-5 w-5 mt-0.5 flex-shrink-0', config.iconColor)} />
        <div className="flex-1 space-y-2">
          <p className={cn('text-sm font-medium', config.textColor)}>{config.title}</p>
          <p className="text-sm text-muted-foreground">{config.message}</p>
          {onUpgrade && (
            <Button variant={config.buttonVariant} size="sm" onClick={onUpgrade} className="mt-2">
              Upgrade Sekarang
            </Button>
          )}
        </div>
        {dismissible && onDismiss && (
          <button onClick={onDismiss} className="text-muted-foreground hover:text-foreground">
            <XCircle className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  );
}

// Banner version for top of page
export function UsageWarningBanner({
  used,
  total,
  onUpgrade,
  onDismiss,
  className,
}: UsageWarningProps) {
  const usagePercentage = total > 0 ? (used / total) * 100 : 0;
  const remaining = total - used;

  const getWarningLevel = (): WarningLevel | null => {
    if (remaining <= 0) return 'depleted';
    if (usagePercentage >= 95) return 'critical';
    if (usagePercentage >= 80) return 'low';
    return null;
  };

  const level = getWarningLevel();
  if (!level) return null;

  const formatCredits = (credits: number) => {
    return new Intl.NumberFormat('id-ID').format(credits);
  };

  const getMessage = () => {
    switch (level) {
      case 'depleted':
        return 'Kredit Anda telah habis. Upgrade untuk melanjutkan.';
      case 'critical':
        return `Sisa ${formatCredits(remaining)} kredit. Upgrade sekarang.`;
      case 'low':
        return `${Math.round(usagePercentage)}% kredit digunakan.`;
    }
  };

  const getBgColor = () => {
    switch (level) {
      case 'depleted':
        return 'bg-destructive text-destructive-foreground';
      case 'critical':
        return 'bg-tertiary-yellow text-black';
      case 'low':
        return 'bg-primary text-primary-foreground';
    }
  };

  return (
    <div className={cn('py-2 px-4', getBgColor(), className)}>
      <div className="flex items-center justify-center gap-4">
        <p className="text-sm font-medium">{getMessage()}</p>
        {onUpgrade && (
          <Button variant="secondary" size="sm" onClick={onUpgrade} className="h-7 px-3">
            Upgrade
          </Button>
        )}
        {onDismiss && (
          <button onClick={onDismiss} className="opacity-70 hover:opacity-100">
            <XCircle className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  );
}

// Inline warning for specific features
export function UsageWarningInline({
  used,
  total,
  featureName,
  className,
}: {
  used: number;
  total: number;
  featureName: string;
  className?: string;
}) {
  const remaining = total - used;

  if (remaining > 0) return null;

  return (
    <div className={cn('flex items-center gap-2 text-sm text-destructive', className)}>
      <XCircle className="h-4 w-4" />
      <span>Kredit tidak cukup untuk {featureName}</span>
    </div>
  );
}
