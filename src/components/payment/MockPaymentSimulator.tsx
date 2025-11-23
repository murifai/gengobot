'use client';

import { useState } from 'react';
import { Play, CheckCircle, XCircle, Clock, Loader2, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { cn } from '@/lib/utils';

interface MockPaymentSimulatorProps {
  invoiceId: string;
  amount: number;
  onSimulated?: (status: 'PAID' | 'EXPIRED' | 'FAILED') => void;
  className?: string;
}

export function MockPaymentSimulator({
  invoiceId,
  amount,
  onSimulated,
  className,
}: MockPaymentSimulatorProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<{
    success: boolean;
    status?: string;
    error?: string;
  } | null>(null);

  // Format currency
  const formatCurrency = (amt: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amt);
  };

  const simulatePayment = async (status: 'PAID' | 'EXPIRED' | 'FAILED') => {
    setIsLoading(true);
    setResult(null);

    try {
      const response = await fetch('/api/payment/simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ invoiceId, status }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to simulate payment');
      }

      setResult({ success: true, status });
      onSimulated?.(status);
    } catch (err) {
      setResult({
        success: false,
        error: err instanceof Error ? err.message : 'Simulation failed',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className={cn('border-dashed border-2 border-yellow-300 bg-yellow-50', className)}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            <Play className="h-5 w-5 text-yellow-600" />
            Simulator Pembayaran (Test Mode)
          </CardTitle>
          <Badge variant="warning">Development Only</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-yellow-700">
          Gunakan tombol di bawah untuk mensimulasikan hasil pembayaran. Fitur ini hanya tersedia di
          mode development.
        </p>

        <div className="bg-white rounded-lg p-3 border border-yellow-200">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Invoice ID</span>
            <span className="font-mono text-xs">{invoiceId}</span>
          </div>
          <div className="flex justify-between text-sm mt-1">
            <span className="text-muted-foreground">Amount</span>
            <span className="font-medium">{formatCurrency(amount)}</span>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2">
          <Button
            onClick={() => simulatePayment('PAID')}
            disabled={isLoading}
            variant="outline"
            className="flex flex-col items-center gap-1 h-auto py-3 border-green-300 hover:bg-green-50"
          >
            <CheckCircle className="h-5 w-5 text-green-600" />
            <span className="text-xs">Berhasil</span>
          </Button>

          <Button
            onClick={() => simulatePayment('EXPIRED')}
            disabled={isLoading}
            variant="outline"
            className="flex flex-col items-center gap-1 h-auto py-3 border-gray-300 hover:bg-gray-50"
          >
            <Clock className="h-5 w-5 text-gray-600" />
            <span className="text-xs">Kadaluarsa</span>
          </Button>

          <Button
            onClick={() => simulatePayment('FAILED')}
            disabled={isLoading}
            variant="outline"
            className="flex flex-col items-center gap-1 h-auto py-3 border-red-300 hover:bg-red-50"
          >
            <XCircle className="h-5 w-5 text-red-600" />
            <span className="text-xs">Gagal</span>
          </Button>
        </div>

        {isLoading && (
          <div className="flex items-center justify-center gap-2 text-sm text-yellow-700">
            <Loader2 className="h-4 w-4 animate-spin" />
            Memproses simulasi...
          </div>
        )}

        {result && (
          <div
            className={cn(
              'flex items-center gap-2 text-sm p-3 rounded-md',
              result.success ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
            )}
          >
            {result.success ? (
              <>
                <CheckCircle className="h-4 w-4" />
                Pembayaran disimulasikan: {result.status}
              </>
            ) : (
              <>
                <AlertTriangle className="h-4 w-4" />
                {result.error}
              </>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
