'use client';

import { useState } from 'react';
import { Ticket, Check, X, Loader2, Gift } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';

interface RedeemResult {
  success: boolean;
  message?: string;
  error?: string;
  voucherType?: string;
  details?: {
    creditsAdded?: number;
    daysExtended?: number;
  };
}

interface RedeemCodeInputProps {
  onSuccess?: (result: RedeemResult) => void;
  disabled?: boolean;
  className?: string;
}

export function RedeemCodeInput({ onSuccess, disabled = false, className }: RedeemCodeInputProps) {
  const [code, setCode] = useState('');
  const [isRedeeming, setIsRedeeming] = useState(false);
  const [result, setResult] = useState<RedeemResult | null>(null);

  const redeemCode = async () => {
    if (!code.trim()) return;

    setIsRedeeming(true);
    setResult(null);

    try {
      const response = await fetch('/api/voucher/redeem', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: code.trim() }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        setResult({
          success: false,
          error: data.error || 'Gagal menukarkan kode',
        });
        return;
      }

      setResult({
        success: true,
        message: data.message,
        voucherType: data.voucherType,
        details: data.details,
      });

      // Clear code on success
      setCode('');

      // Notify parent
      if (onSuccess) {
        onSuccess(data);
      }
    } catch {
      setResult({
        success: false,
        error: 'Terjadi kesalahan. Silakan coba lagi.',
      });
    } finally {
      setIsRedeeming(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !isRedeeming && code.trim()) {
      redeemCode();
    }
  };

  const handleClear = () => {
    setResult(null);
  };

  return (
    <div className={cn('space-y-3', className)}>
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Ticket className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={code}
            onChange={e => setCode(e.target.value.toUpperCase())}
            onKeyDown={handleKeyDown}
            placeholder="Masukkan kode redeem"
            className="pl-9 uppercase"
            disabled={disabled || isRedeeming}
          />
        </div>

        <Button
          onClick={redeemCode}
          disabled={disabled || isRedeeming || !code.trim()}
          className="shrink-0"
        >
          {isRedeeming ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <>
              <Gift className="h-4 w-4 mr-2" />
              Tukarkan
            </>
          )}
        </Button>
      </div>

      {/* Result feedback */}
      {result && (
        <div
          className={cn(
            'flex items-start gap-2 text-sm rounded-md p-3',
            result.success
              ? 'bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300'
              : 'bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300'
          )}
        >
          {result.success ? (
            <>
              <Check className="h-4 w-4 mt-0.5 shrink-0" />
              <div className="flex-1">
                <p className="font-medium">{result.message}</p>
                {result.details?.creditsAdded && (
                  <p className="text-xs opacity-80 mt-1">
                    +{result.details.creditsAdded.toLocaleString('id-ID')} kredit AI telah
                    ditambahkan ke akun Anda.
                  </p>
                )}
                {result.details?.daysExtended && (
                  <p className="text-xs opacity-80 mt-1">
                    Trial Anda telah diperpanjang {result.details.daysExtended} hari.
                  </p>
                )}
              </div>
              <button
                onClick={handleClear}
                className="shrink-0 p-1 hover:bg-green-100 dark:hover:bg-green-900 rounded"
              >
                <X className="h-3 w-3" />
              </button>
            </>
          ) : (
            <>
              <X className="h-4 w-4 mt-0.5 shrink-0" />
              <p className="flex-1">{result.error}</p>
              <button
                onClick={handleClear}
                className="shrink-0 p-1 hover:bg-red-100 dark:hover:bg-red-900 rounded"
              >
                <X className="h-3 w-3" />
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
