'use client';

import { useState } from 'react';
import { Tag, Check, X, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';
import { VoucherType, SubscriptionTier } from '@prisma/client';

interface DiscountPreview {
  type: VoucherType;
  value: number;
  description: string;
}

interface VoucherInputProps {
  onApply?: (code: string, preview: DiscountPreview) => void;
  onClear?: () => void;
  amount?: number;
  durationMonths?: number;
  targetTier?: SubscriptionTier;
  disabled?: boolean;
  className?: string;
}

interface ValidationResult {
  valid: boolean;
  error?: string;
  discountPreview?: DiscountPreview;
  voucher?: {
    code: string;
    name: string;
    description?: string;
    type: VoucherType;
  };
}

export function VoucherInput({
  onApply,
  onClear,
  amount,
  durationMonths,
  targetTier,
  disabled = false,
  className,
}: VoucherInputProps) {
  const [code, setCode] = useState('');
  const [isValidating, setIsValidating] = useState(false);
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);
  const [isApplied, setIsApplied] = useState(false);

  const validateVoucher = async () => {
    if (!code.trim()) return;

    setIsValidating(true);
    setValidationResult(null);

    try {
      const response = await fetch('/api/voucher/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: code.trim(), amount, durationMonths, targetTier }),
      });

      const data = await response.json();

      if (!response.ok) {
        setValidationResult({
          valid: false,
          error: data.error || 'Voucher tidak valid',
        });
        return;
      }

      setValidationResult({
        valid: true,
        discountPreview: data.discountPreview,
        voucher: data.voucher,
      });

      setIsApplied(true);

      if (onApply && data.discountPreview) {
        onApply(code.trim(), data.discountPreview);
      }
    } catch {
      setValidationResult({
        valid: false,
        error: 'Gagal memvalidasi voucher',
      });
    } finally {
      setIsValidating(false);
    }
  };

  const handleClear = () => {
    setCode('');
    setValidationResult(null);
    setIsApplied(false);
    onClear?.();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !isValidating && code.trim() && !isApplied) {
      validateVoucher();
    }
  };

  return (
    <div className={cn('space-y-2', className)}>
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Tag className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={code}
            onChange={e => setCode(e.target.value.toUpperCase())}
            onKeyDown={handleKeyDown}
            placeholder="Masukkan kode voucher"
            className={cn(
              'pl-9 uppercase',
              isApplied && validationResult?.valid && 'border-green-500 bg-green-50',
              validationResult && !validationResult.valid && 'border-red-500 bg-red-50'
            )}
            disabled={disabled || isApplied}
          />
        </div>

        {isApplied ? (
          <Button
            variant="outline"
            size="icon"
            onClick={handleClear}
            disabled={disabled}
            className="shrink-0"
          >
            <X className="h-4 w-4" />
          </Button>
        ) : (
          <Button
            variant="outline"
            onClick={validateVoucher}
            disabled={disabled || isValidating || !code.trim()}
            className="shrink-0"
          >
            {isValidating ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Terapkan'}
          </Button>
        )}
      </div>

      {/* Validation feedback */}
      {validationResult && (
        <div
          className={cn(
            'flex items-start gap-2 text-sm rounded-md p-2',
            validationResult.valid ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
          )}
        >
          {validationResult.valid ? (
            <>
              <Check className="h-4 w-4 mt-0.5 shrink-0" />
              <div>
                <p className="font-medium">{validationResult.voucher?.name || 'Voucher valid'}</p>
                {validationResult.discountPreview && (
                  <p className="text-xs opacity-80">
                    {validationResult.discountPreview.description}
                  </p>
                )}
              </div>
            </>
          ) : (
            <>
              <X className="h-4 w-4 mt-0.5 shrink-0" />
              <p>{validationResult.error}</p>
            </>
          )}
        </div>
      )}
    </div>
  );
}
