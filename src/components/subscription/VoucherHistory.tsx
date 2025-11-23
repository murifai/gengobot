'use client';

import { useEffect, useState } from 'react';
import { Tag, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { cn } from '@/lib/utils';
import { VoucherType, RedemptionStatus } from '@prisma/client';

interface VoucherRedemptionItem {
  id: string;
  voucherCode: string;
  voucherName: string;
  discountType: VoucherType;
  discountValue: number;
  originalAmount: number | null;
  finalAmount: number | null;
  status: RedemptionStatus;
  createdAt: string;
}

interface VoucherHistoryProps {
  className?: string;
}

export function VoucherHistory({ className }: VoucherHistoryProps) {
  const [redemptions, setRedemptions] = useState<VoucherRedemptionItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRedemptions = async () => {
      try {
        const response = await fetch('/api/voucher/my-redemptions');
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Failed to fetch redemptions');
        }

        setRedemptions(data.redemptions);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setIsLoading(false);
      }
    };

    fetchRedemptions();
  }, []);

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  // Get status badge variant
  const getStatusVariant = (
    status: RedemptionStatus
  ): 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'danger' => {
    switch (status) {
      case RedemptionStatus.APPLIED:
        return 'success';
      case RedemptionStatus.EXPIRED:
        return 'secondary';
      case RedemptionStatus.REVOKED:
        return 'danger';
      default:
        return 'default';
    }
  };

  // Get status label
  const getStatusLabel = (status: RedemptionStatus) => {
    switch (status) {
      case RedemptionStatus.APPLIED:
        return 'Diterapkan';
      case RedemptionStatus.EXPIRED:
        return 'Kadaluarsa';
      case RedemptionStatus.REVOKED:
        return 'Dibatalkan';
      default:
        return status;
    }
  };

  // Get voucher type description
  const getTypeDescription = (type: VoucherType, value: number) => {
    switch (type) {
      case VoucherType.PERCENTAGE:
        return `${value}% diskon`;
      case VoucherType.FIXED_AMOUNT:
        return formatCurrency(value);
      case VoucherType.BONUS_CREDITS:
        return `${value.toLocaleString('id-ID')} kredit`;
      case VoucherType.TRIAL_EXTENSION:
        return `${value} hari`;
      case VoucherType.TIER_UPGRADE:
        return 'Upgrade tier';
      default:
        return value.toString();
    }
  };

  if (isLoading) {
    return (
      <Card className={cn('', className)}>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={cn('', className)}>
        <CardContent className="py-8 text-center">
          <p className="text-sm text-muted-foreground">{error}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn('', className)}>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base">
          <Tag className="h-5 w-5 text-primary" />
          Riwayat Voucher
        </CardTitle>
      </CardHeader>
      <CardContent>
        {redemptions.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            Belum ada voucher yang digunakan
          </p>
        ) : (
          <div className="space-y-3">
            {redemptions.map(redemption => (
              <div
                key={redemption.id}
                className="flex items-center justify-between py-3 border-b last:border-0"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-sm">{redemption.voucherName}</p>
                    <Badge variant={getStatusVariant(redemption.status)} size="sm">
                      {getStatusLabel(redemption.status)}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span className="font-mono">{redemption.voucherCode}</span>
                    <span>•</span>
                    <span>{formatDate(redemption.createdAt)}</span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium">
                    {getTypeDescription(redemption.discountType, redemption.discountValue)}
                  </p>
                  {redemption.originalAmount && redemption.finalAmount && (
                    <p className="text-xs text-muted-foreground">
                      {formatCurrency(redemption.originalAmount)} →{' '}
                      {formatCurrency(redemption.finalAmount)}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
