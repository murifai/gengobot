'use client';

import {
  Mic,
  MessageSquare,
  Clock,
  Plus,
  Minus,
  RefreshCw,
  Gift,
  ArrowUpRight,
  ArrowDownRight,
  ChevronDown,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';
import { CreditTransactionType, UsageType } from '@prisma/client';

interface Transaction {
  id: string;
  type: CreditTransactionType;
  amount: number;
  balance: number;
  usageType?: UsageType | null;
  durationSecs?: number | null;
  description?: string | null;
  createdAt: Date | string;
  referenceId?: string | null;
}

interface UsageHistoryProps {
  transactions: Transaction[];
  isLoading?: boolean;
  hasMore?: boolean;
  onLoadMore?: () => void;
  className?: string;
}

export function UsageHistory({
  transactions,
  isLoading = false,
  hasMore = false,
  onLoadMore,
  className,
}: UsageHistoryProps) {
  const formatCredits = (credits: number) => {
    return new Intl.NumberFormat('id-ID').format(Math.abs(credits));
  };

  const formatDate = (date: Date | string) => {
    const d = new Date(date);
    return d.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    if (minutes === 0) return `${secs}d`;
    return `${minutes}m ${secs}d`;
  };

  const getTransactionIcon = (type: CreditTransactionType, usageType?: UsageType | null) => {
    if (type === CreditTransactionType.USAGE && usageType) {
      switch (usageType) {
        case UsageType.VOICE_STANDARD:
          return <Mic className="h-4 w-4" />;
        case UsageType.REALTIME:
          return <Clock className="h-4 w-4" />;
        case UsageType.TEXT_CHAT:
          return <MessageSquare className="h-4 w-4" />;
      }
    }

    switch (type) {
      case CreditTransactionType.GRANT:
        return <Plus className="h-4 w-4" />;
      case CreditTransactionType.TRIAL_GRANT:
        return <Gift className="h-4 w-4" />;
      case CreditTransactionType.REFUND:
        return <RefreshCw className="h-4 w-4" />;
      case CreditTransactionType.BONUS:
        return <Gift className="h-4 w-4" />;
      case CreditTransactionType.ADJUSTMENT:
        return <RefreshCw className="h-4 w-4" />;
      default:
        return <Minus className="h-4 w-4" />;
    }
  };

  const getTransactionLabel = (type: CreditTransactionType, usageType?: UsageType | null) => {
    if (type === CreditTransactionType.USAGE && usageType) {
      switch (usageType) {
        case UsageType.VOICE_STANDARD:
          return 'Voice Standard';
        case UsageType.REALTIME:
          return 'Realtime';
        case UsageType.TEXT_CHAT:
          return 'Chat';
      }
    }

    switch (type) {
      case CreditTransactionType.GRANT:
        return 'Kredit Bulanan';
      case CreditTransactionType.TRIAL_GRANT:
        return 'Kredit Trial';
      case CreditTransactionType.REFUND:
        return 'Refund';
      case CreditTransactionType.BONUS:
        return 'Bonus';
      case CreditTransactionType.ADJUSTMENT:
        return 'Penyesuaian';
      default:
        return 'Penggunaan';
    }
  };

  const isPositive = (amount: number) => amount > 0;

  if (transactions.length === 0 && !isLoading) {
    return (
      <Card className={className}>
        <CardContent className="py-8">
          <p className="text-center text-muted-foreground">Belum ada riwayat penggunaan</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="text-base">Riwayat Penggunaan</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {transactions.map(transaction => (
          <div
            key={transaction.id}
            className="flex items-center justify-between py-2 border-b border-border/50 last:border-0"
          >
            <div className="flex items-center gap-3">
              <div
                className={cn(
                  'flex h-8 w-8 items-center justify-center rounded-full',
                  isPositive(transaction.amount)
                    ? 'bg-tertiary-green/10 text-tertiary-green'
                    : 'bg-muted text-muted-foreground'
                )}
              >
                {getTransactionIcon(transaction.type, transaction.usageType)}
              </div>
              <div>
                <p className="text-sm font-medium">
                  {getTransactionLabel(transaction.type, transaction.usageType)}
                </p>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span>{formatDate(transaction.createdAt)}</span>
                  {transaction.durationSecs && (
                    <>
                      <span>•</span>
                      <span>{formatDuration(transaction.durationSecs)}</span>
                    </>
                  )}
                </div>
              </div>
            </div>
            <div className="text-right">
              <p
                className={cn(
                  'text-sm font-medium flex items-center gap-1',
                  isPositive(transaction.amount) ? 'text-tertiary-green' : 'text-foreground'
                )}
              >
                {isPositive(transaction.amount) ? (
                  <ArrowUpRight className="h-3 w-3" />
                ) : (
                  <ArrowDownRight className="h-3 w-3" />
                )}
                {isPositive(transaction.amount) ? '+' : '-'}
                {formatCredits(transaction.amount)}
              </p>
              <p className="text-xs text-muted-foreground">
                Saldo: {formatCredits(transaction.balance)}
              </p>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-center py-4">
            <RefreshCw className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        )}

        {hasMore && !isLoading && (
          <Button variant="ghost" size="sm" className="w-full" onClick={onLoadMore}>
            <ChevronDown className="h-4 w-4 mr-2" />
            Muat lebih banyak
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

// Simple inline history for compact view
export function UsageHistoryInline({
  transactions,
  limit = 5,
  className,
}: {
  transactions: Transaction[];
  limit?: number;
  className?: string;
}) {
  const formatCredits = (credits: number) => {
    return new Intl.NumberFormat('id-ID').format(Math.abs(credits));
  };

  const limitedTransactions = transactions.slice(0, limit);

  return (
    <div className={cn('space-y-2', className)}>
      {limitedTransactions.map(transaction => (
        <div key={transaction.id} className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground truncate">
            {transaction.description || 'Penggunaan'}
          </span>
          <span className={cn('font-medium', transaction.amount > 0 ? 'text-tertiary-green' : '')}>
            {transaction.amount > 0 ? '+' : '-'}
            {formatCredits(transaction.amount)}
          </span>
        </div>
      ))}
    </div>
  );
}
