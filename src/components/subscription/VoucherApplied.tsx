'use client';

import { Tag, Gift, Clock, Zap, ArrowUp, Percent } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { cn } from '@/lib/utils';
import { VoucherType } from '@prisma/client';

interface VoucherAppliedProps {
  code: string;
  name?: string;
  type: VoucherType;
  value: number;
  discountAmount?: number;
  originalAmount?: number;
  finalAmount?: number;
  className?: string;
}

export function VoucherApplied({
  code,
  name,
  type,
  value,
  discountAmount,
  originalAmount,
  finalAmount,
  className,
}: VoucherAppliedProps) {
  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Get icon based on voucher type
  const getIcon = () => {
    switch (type) {
      case VoucherType.PERCENTAGE:
        return <Percent className="h-4 w-4" />;
      case VoucherType.FIXED_AMOUNT:
        return <Tag className="h-4 w-4" />;
      case VoucherType.BONUS_CREDITS:
        return <Zap className="h-4 w-4" />;
      case VoucherType.TRIAL_EXTENSION:
        return <Clock className="h-4 w-4" />;
      case VoucherType.TIER_UPGRADE:
        return <ArrowUp className="h-4 w-4" />;
      default:
        return <Gift className="h-4 w-4" />;
    }
  };

  // Get description based on voucher type
  const getDescription = () => {
    switch (type) {
      case VoucherType.PERCENTAGE:
        return `Diskon ${value}%`;
      case VoucherType.FIXED_AMOUNT:
        return `Diskon ${formatCurrency(value)}`;
      case VoucherType.BONUS_CREDITS:
        return `+${value.toLocaleString('id-ID')} kredit AI bonus`;
      case VoucherType.TRIAL_EXTENSION:
        return `+${value} hari trial`;
      case VoucherType.TIER_UPGRADE:
        return 'Upgrade tier sementara';
      default:
        return 'Voucher applied';
    }
  };

  return (
    <Card className={cn('border-green-200 bg-green-50', className)}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
            <div className="rounded-full bg-green-100 p-2 text-green-600">{getIcon()}</div>
            <div>
              <div className="flex items-center gap-2">
                <p className="font-medium text-green-900">{name || code}</p>
                <Badge variant="success" size="sm">
                  Diterapkan
                </Badge>
              </div>
              <p className="text-sm text-green-700">{getDescription()}</p>
              {code !== name && <p className="text-xs text-green-600 mt-1">Kode: {code}</p>}
            </div>
          </div>
        </div>

        {/* Discount details */}
        {(discountAmount || originalAmount || finalAmount) && (
          <div className="mt-3 pt-3 border-t border-green-200 space-y-1">
            {originalAmount && (
              <div className="flex justify-between text-sm">
                <span className="text-green-700">Harga asli</span>
                <span className="text-green-700 line-through">
                  {formatCurrency(originalAmount)}
                </span>
              </div>
            )}
            {discountAmount && discountAmount > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-green-700">Diskon</span>
                <span className="text-green-700 font-medium">
                  -{formatCurrency(discountAmount)}
                </span>
              </div>
            )}
            {finalAmount !== undefined && (
              <div className="flex justify-between text-sm font-medium">
                <span className="text-green-900">Total</span>
                <span className="text-green-900">{formatCurrency(finalAmount)}</span>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
