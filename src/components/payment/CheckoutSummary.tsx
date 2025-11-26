'use client';

import { useState } from 'react';
import { Loader2, ExternalLink, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { VoucherInput } from '@/components/subscription/VoucherInput';
import { VoucherApplied } from '@/components/subscription/VoucherApplied';
import { cn } from '@/lib/utils';
import { SubscriptionTier, VoucherType } from '@prisma/client';
import { getDiscountedPrice } from '@/lib/subscription/credit-config';

interface CheckoutSummaryProps {
  tier: SubscriptionTier;
  durationMonths: 1 | 3 | 6 | 12;
  onCheckout?: () => void;
  className?: string;
}

interface AppliedVoucher {
  code: string;
  type: VoucherType;
  value: number;
  description: string;
}

export function CheckoutSummary({
  tier,
  durationMonths,
  onCheckout,
  className,
}: CheckoutSummaryProps) {
  const [appliedVoucher, setAppliedVoucher] = useState<AppliedVoucher | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [invoiceUrl, setInvoiceUrl] = useState<string | null>(null);

  const pricing = getDiscountedPrice(tier, durationMonths);

  // Calculate voucher discount
  let voucherDiscount = 0;
  if (appliedVoucher) {
    if (appliedVoucher.type === VoucherType.PERCENTAGE) {
      voucherDiscount = Math.round(pricing.discountedTotal * (appliedVoucher.value / 100));
    } else if (appliedVoucher.type === VoucherType.FIXED_AMOUNT) {
      voucherDiscount = Math.min(appliedVoucher.value, pricing.discountedTotal);
    }
  }

  const finalAmount = pricing.discountedTotal - voucherDiscount;

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
      case SubscriptionTier.BASIC:
        return 'Basic';
      case SubscriptionTier.PRO:
        return 'Pro';
      default:
        return tier;
    }
  };

  const handleCheckout = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/payment/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tier,
          durationMonths,
          voucherCode: appliedVoucher?.code,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create checkout');
      }

      setInvoiceUrl(data.invoice.url);
      onCheckout?.();

      // Redirect to payment page
      window.open(data.invoice.url, '_blank');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Terjadi kesalahan');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className={cn('', className)}>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Ringkasan Pembayaran</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Plan details */}
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Paket</span>
            <span className="font-medium">Gengo {getTierName()}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Durasi</span>
            <span className="font-medium">{durationMonths} bulan</span>
          </div>
        </div>

        {/* Pricing breakdown */}
        <div className="border-t-2 border-border pt-4 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Subtotal</span>
            <span>{formatCurrency(pricing.originalTotal)}</span>
          </div>

          {pricing.savings > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Diskon durasi</span>
              <span className="text-tertiary-green">-{formatCurrency(pricing.savings)}</span>
            </div>
          )}

          {voucherDiscount > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Diskon voucher</span>
              <span className="text-tertiary-green">-{formatCurrency(voucherDiscount)}</span>
            </div>
          )}

          <div className="flex justify-between font-medium text-lg pt-2 border-t-2 border-border">
            <span>Total</span>
            <span>{formatCurrency(finalAmount)}</span>
          </div>
        </div>

        {/* Voucher section */}
        <div className="border-t-2 border-border pt-4">
          {appliedVoucher ? (
            <VoucherApplied
              code={appliedVoucher.code}
              type={appliedVoucher.type}
              value={appliedVoucher.value}
              discountAmount={voucherDiscount}
            />
          ) : (
            <VoucherInput
              amount={pricing.discountedTotal}
              durationMonths={durationMonths}
              targetTier={tier}
              onApply={(code, preview) => {
                setAppliedVoucher({
                  code,
                  type: preview.type,
                  value: preview.value,
                  description: preview.description,
                });
              }}
              onClear={() => setAppliedVoucher(null)}
            />
          )}
        </div>

        {/* Error message */}
        {error && (
          <div className="flex items-center gap-2 text-sm text-primary bg-primary/10 p-3 rounded-base border-2 border-border">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Checkout button */}
        {invoiceUrl ? (
          <Button onClick={() => window.open(invoiceUrl, '_blank')} className="w-full">
            <ExternalLink className="h-4 w-4 mr-2" />
            Buka Halaman Pembayaran
          </Button>
        ) : (
          <Button onClick={handleCheckout} disabled={isLoading} className="w-full">
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Memproses...
              </>
            ) : (
              `Bayar ${formatCurrency(finalAmount)}`
            )}
          </Button>
        )}

        {/* Mock mode indicator */}
        {process.env.NODE_ENV === 'development' && (
          <Badge variant="warning" className="w-full justify-center">
            Mode Testing - Pembayaran Disimulasikan
          </Badge>
        )}
      </CardContent>
    </Card>
  );
}
