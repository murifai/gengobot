'use client';

import { useState } from 'react';
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
  ChevronUp,
  Cpu,
  DollarSign,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { cn } from '@/lib/utils';
import { CreditTransactionType, UsageType } from '@prisma/client';
import { CREDIT_CONVERSION_RATE } from '@/lib/subscription/credit-config';

/**
 * Token usage metadata stored in CreditTransaction.metadata
 */
interface TokenUsageMetadata {
  model?: string;
  inputTokens?: number;
  outputTokens?: number;
  audioInputTokens?: number;
  audioOutputTokens?: number;
  audioDurationSeconds?: number;
  characterCount?: number;
  usdCost?: number;
}

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
  metadata?: TokenUsageMetadata | null;
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
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const formatCredits = (credits: number) => {
    return new Intl.NumberFormat('id-ID').format(Math.abs(credits));
  };

  const formatTokens = (tokens: number) => {
    if (tokens >= 1000) {
      return `${(tokens / 1000).toFixed(1)}k`;
    }
    return tokens.toString();
  };

  const formatUSD = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 4,
      maximumFractionDigits: 6,
    }).format(amount);
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

  const hasMetadata = (tx: Transaction) => {
    return (
      tx.metadata &&
      (tx.metadata.inputTokens ||
        tx.metadata.outputTokens ||
        tx.metadata.audioInputTokens ||
        tx.metadata.audioOutputTokens ||
        tx.metadata.audioDurationSeconds ||
        tx.metadata.usdCost)
    );
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
        {transactions.map(transaction => {
          const isExpanded = expandedId === transaction.id;
          const showExpandButton = hasMetadata(transaction);

          return (
            <div key={transaction.id} className="py-2 border-b border-border/50 last:border-0">
              <div
                className={cn(
                  'flex items-center justify-between',
                  showExpandButton && 'cursor-pointer'
                )}
                onClick={() =>
                  showExpandButton && setExpandedId(isExpanded ? null : transaction.id)
                }
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
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium">
                        {getTransactionLabel(transaction.type, transaction.usageType)}
                      </p>
                      {showExpandButton && (
                        <Badge variant="outline" size="sm" className="text-[10px] px-1 py-0">
                          <Cpu className="h-2.5 w-2.5 mr-0.5" />
                          Token
                        </Badge>
                      )}
                    </div>
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
                <div className="flex items-center gap-2">
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
                  {showExpandButton && (
                    <div className="text-muted-foreground">
                      {isExpanded ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Token breakdown - expandable */}
              {isExpanded && transaction.metadata && (
                <div className="mt-2 ml-11 p-2 rounded-md bg-muted/50 space-y-1.5">
                  <p className="text-xs font-medium text-muted-foreground mb-2">
                    Detail Penggunaan Token
                  </p>

                  {/* Model */}
                  {transaction.metadata.model && (
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">Model</span>
                      <span className="font-mono text-[10px]">{transaction.metadata.model}</span>
                    </div>
                  )}

                  {/* Text tokens */}
                  {(transaction.metadata.inputTokens || transaction.metadata.outputTokens) && (
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">Token Teks</span>
                      <span>
                        {transaction.metadata.inputTokens
                          ? `${formatTokens(transaction.metadata.inputTokens)} input`
                          : ''}
                        {transaction.metadata.inputTokens && transaction.metadata.outputTokens
                          ? ' / '
                          : ''}
                        {transaction.metadata.outputTokens
                          ? `${formatTokens(transaction.metadata.outputTokens)} output`
                          : ''}
                      </span>
                    </div>
                  )}

                  {/* Audio tokens (Realtime) */}
                  {(transaction.metadata.audioInputTokens ||
                    transaction.metadata.audioOutputTokens) && (
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">Token Audio</span>
                      <span>
                        {transaction.metadata.audioInputTokens
                          ? `${formatTokens(transaction.metadata.audioInputTokens)} in`
                          : ''}
                        {transaction.metadata.audioInputTokens &&
                        transaction.metadata.audioOutputTokens
                          ? ' / '
                          : ''}
                        {transaction.metadata.audioOutputTokens
                          ? `${formatTokens(transaction.metadata.audioOutputTokens)} out`
                          : ''}
                      </span>
                    </div>
                  )}

                  {/* Audio duration (Whisper) */}
                  {transaction.metadata.audioDurationSeconds && (
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">Durasi Audio</span>
                      <span>{formatDuration(transaction.metadata.audioDurationSeconds)}</span>
                    </div>
                  )}

                  {/* Character count (TTS) */}
                  {transaction.metadata.characterCount && (
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">Karakter TTS</span>
                      <span>{formatTokens(transaction.metadata.characterCount)}</span>
                    </div>
                  )}

                  {/* USD Cost */}
                  {transaction.metadata.usdCost && (
                    <div className="flex justify-between text-xs pt-1 border-t border-border/50">
                      <span className="text-muted-foreground flex items-center gap-1">
                        <DollarSign className="h-3 w-3" />
                        Biaya API
                      </span>
                      <span className="font-medium">{formatUSD(transaction.metadata.usdCost)}</span>
                    </div>
                  )}

                  {/* Credits to USD equivalent */}
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Nilai Kredit</span>
                    <span>
                      ≈ {formatUSD(Math.abs(transaction.amount) * CREDIT_CONVERSION_RATE)}
                    </span>
                  </div>
                </div>
              )}
            </div>
          );
        })}

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
