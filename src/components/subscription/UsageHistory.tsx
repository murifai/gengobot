'use client';

import { useMemo } from 'react';
import {
  Mic,
  MessageSquare,
  Clock,
  Plus,
  RefreshCw,
  Gift,
  ArrowUpRight,
  ArrowDownRight,
  ChevronDown,
  Minus,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';
import { CreditTransactionType, UsageType } from '@prisma/client';

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

/**
 * Aggregated session data for simplified display
 */
interface AggregatedSession {
  id: string;
  sessionType: string;
  totalCredits: number;
  balanceAfter: number;
  timestamp: Date;
  transactionCount: number;
  isPositive: boolean;
  primaryUsageType?: UsageType | null;
  primaryTransactionType: CreditTransactionType;
}

interface UsageHistoryProps {
  transactions: Transaction[];
  isLoading?: boolean;
  hasMore?: boolean;
  onLoadMore?: () => void;
  className?: string;
}

/**
 * Aggregate transactions by session (referenceId) or by type for non-usage transactions
 */
function aggregateTransactions(transactions: Transaction[]): AggregatedSession[] {
  const sessionMap = new Map<string, AggregatedSession>();

  // Sort transactions by date (newest first for display, but we process oldest first for aggregation)
  const sortedTransactions = [...transactions].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  );

  for (const tx of sortedTransactions) {
    // For USAGE type with referenceId, group by referenceId
    // For other types, each transaction is its own "session"
    const isUsage = tx.type === CreditTransactionType.USAGE;
    const sessionKey = isUsage && tx.referenceId ? tx.referenceId : tx.id;

    const existing = sessionMap.get(sessionKey);

    if (existing) {
      // Aggregate with existing session
      existing.totalCredits += tx.amount;
      existing.balanceAfter = tx.balance; // Use the latest balance
      existing.transactionCount += 1;
      // Keep the most recent timestamp
      const txDate = new Date(tx.createdAt);
      if (txDate > existing.timestamp) {
        existing.timestamp = txDate;
      }
    } else {
      // Create new session entry
      sessionMap.set(sessionKey, {
        id: sessionKey,
        sessionType: getSessionLabel(tx.type, tx.usageType),
        totalCredits: tx.amount,
        balanceAfter: tx.balance,
        timestamp: new Date(tx.createdAt),
        transactionCount: 1,
        isPositive: tx.amount > 0,
        primaryUsageType: tx.usageType,
        primaryTransactionType: tx.type,
      });
    }
  }

  // Convert to array and sort by timestamp (newest first)
  return Array.from(sessionMap.values()).sort(
    (a, b) => b.timestamp.getTime() - a.timestamp.getTime()
  );
}

/**
 * Get session label based on transaction type
 */
function getSessionLabel(type: CreditTransactionType, usageType?: UsageType | null): string {
  if (type === CreditTransactionType.USAGE && usageType) {
    switch (usageType) {
      case UsageType.VOICE_STANDARD:
        return 'Sesi Voice';
      case UsageType.REALTIME:
        return 'Sesi Realtime';
      case UsageType.TEXT_CHAT:
        return 'Sesi Chat';
    }
  }

  switch (type) {
    case CreditTransactionType.GRANT:
      return 'Kredit AI Bulanan';
    case CreditTransactionType.TRIAL_GRANT:
      return 'Kredit AI Trial';
    case CreditTransactionType.REFUND:
      return 'Refund';
    case CreditTransactionType.BONUS:
      return 'Bonus';
    case CreditTransactionType.ADJUSTMENT:
      return 'Penyesuaian';
    default:
      return 'Penggunaan';
  }
}

/**
 * Get icon for session type
 */
function getSessionIcon(type: CreditTransactionType, usageType?: UsageType | null) {
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
}

export function UsageHistory({
  transactions,
  isLoading = false,
  hasMore = false,
  onLoadMore,
  className,
}: UsageHistoryProps) {
  // Aggregate transactions by session
  const aggregatedSessions = useMemo(() => aggregateTransactions(transactions), [transactions]);

  const formatCredits = (credits: number) => {
    return new Intl.NumberFormat('id-ID').format(Math.abs(credits));
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

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
        {aggregatedSessions.map(session => (
          <div key={session.id} className="py-2 border-b border-border/50 last:border-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div
                  className={cn(
                    'flex h-8 w-8 items-center justify-center rounded-full',
                    session.isPositive
                      ? 'bg-tertiary-green/10 text-tertiary-green'
                      : 'bg-muted text-muted-foreground'
                  )}
                >
                  {getSessionIcon(session.primaryTransactionType, session.primaryUsageType)}
                </div>
                <div>
                  <p className="text-sm font-medium">{session.sessionType}</p>
                  <p className="text-xs text-muted-foreground">{formatDate(session.timestamp)}</p>
                </div>
              </div>
              <div className="text-right">
                <p
                  className={cn(
                    'text-sm font-medium flex items-center gap-1 justify-end',
                    session.isPositive ? 'text-tertiary-green' : 'text-foreground'
                  )}
                >
                  {session.isPositive ? (
                    <ArrowUpRight className="h-3 w-3" />
                  ) : (
                    <ArrowDownRight className="h-3 w-3" />
                  )}
                  {session.isPositive ? '+' : '-'}
                  {formatCredits(session.totalCredits)}
                </p>
                <p className="text-xs text-muted-foreground">
                  Saldo: {formatCredits(session.balanceAfter)}
                </p>
              </div>
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
  // Aggregate transactions by session
  const aggregatedSessions = useMemo(() => aggregateTransactions(transactions), [transactions]);

  const formatCredits = (credits: number) => {
    return new Intl.NumberFormat('id-ID').format(Math.abs(credits));
  };

  const limitedSessions = aggregatedSessions.slice(0, limit);

  return (
    <div className={cn('space-y-2', className)}>
      {limitedSessions.map(session => (
        <div key={session.id} className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground truncate">{session.sessionType}</span>
          <span className={cn('font-medium', session.isPositive ? 'text-tertiary-green' : '')}>
            {session.isPositive ? '+' : '-'}
            {formatCredits(session.totalCredits)}
          </span>
        </div>
      ))}
    </div>
  );
}
