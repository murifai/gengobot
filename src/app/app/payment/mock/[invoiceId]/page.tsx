'use client';

import { use, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Loader2, CheckCircle, XCircle, Clock, CreditCard, AlertTriangle } from 'lucide-react';

interface MockInvoice {
  id: string;
  external_id: string;
  amount: number;
  description: string;
  payer_email?: string;
  status: string;
  expiry_date: string;
  success_redirect_url?: string;
  failure_redirect_url?: string;
  items?: Array<{
    name: string;
    quantity: number;
    price: number;
  }>;
}

export default function MockPaymentPage({ params }: { params: Promise<{ invoiceId: string }> }) {
  const { invoiceId } = use(params);
  const router = useRouter();
  const [invoice, setInvoice] = useState<MockInvoice | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchInvoice = async () => {
      try {
        const response = await fetch(`/api/payment/mock/${invoiceId}`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Failed to fetch invoice');
        }

        setInvoice(data.invoice);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load invoice');
      } finally {
        setIsLoading(false);
      }
    };

    fetchInvoice();
  }, [invoiceId]);

  const handleSimulatePayment = async (status: 'PAID' | 'EXPIRED' | 'FAILED') => {
    setIsProcessing(true);
    setError(null);

    try {
      const response = await fetch(`/api/payment/mock/${invoiceId}/simulate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to simulate payment');
      }

      // Redirect based on status
      if (status === 'PAID' && invoice?.success_redirect_url) {
        window.location.href = invoice.success_redirect_url;
      } else if ((status === 'FAILED' || status === 'EXPIRED') && invoice?.failure_redirect_url) {
        window.location.href = invoice.failure_redirect_url;
      } else {
        router.push('/app/profile');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to simulate payment');
      setIsProcessing(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !invoice) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6 text-center">
            <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Invoice Tidak Ditemukan</h2>
            <p className="text-muted-foreground mb-4">
              {error || 'Invoice yang Anda cari tidak ditemukan atau sudah kadaluarsa.'}
            </p>
            <Button onClick={() => router.push('/app/upgrade')}>Kembali ke Upgrade</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-muted/30">
      <Card className="max-w-lg w-full">
        <CardHeader className="text-center border-b">
          <div className="flex items-center justify-center gap-2 mb-2">
            <CreditCard className="h-6 w-6 text-primary" />
            <Badge variant="warning">Mode Testing</Badge>
          </div>
          <CardTitle>Simulasi Pembayaran</CardTitle>
          <CardDescription>
            Ini adalah halaman simulasi pembayaran untuk testing. Pilih status pembayaran yang ingin
            disimulasikan.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6 space-y-6">
          {/* Invoice details */}
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Invoice ID</span>
              <span className="font-mono text-xs">{invoice.id}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Deskripsi</span>
              <span>{invoice.description}</span>
            </div>
            {invoice.items && invoice.items.length > 0 && (
              <div className="border-t pt-3 space-y-2">
                {invoice.items.map((item, index) => (
                  <div key={index} className="flex justify-between text-sm">
                    <span>
                      {item.name} x {item.quantity}
                    </span>
                    <span>{formatCurrency(item.price * item.quantity)}</span>
                  </div>
                ))}
              </div>
            )}
            <div className="flex justify-between font-medium text-lg pt-3 border-t">
              <span>Total</span>
              <span className="text-primary">{formatCurrency(invoice.amount)}</span>
            </div>
          </div>

          {/* Simulation buttons */}
          <div className="space-y-3">
            <Button
              onClick={() => handleSimulatePayment('PAID')}
              disabled={isProcessing}
              className="w-full bg-green-600 hover:bg-green-700"
            >
              {isProcessing ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <CheckCircle className="h-4 w-4 mr-2" />
              )}
              Simulasi Pembayaran Berhasil
            </Button>

            <Button
              onClick={() => handleSimulatePayment('EXPIRED')}
              disabled={isProcessing}
              variant="outline"
              className="w-full"
            >
              {isProcessing ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Clock className="h-4 w-4 mr-2" />
              )}
              Simulasi Invoice Kadaluarsa
            </Button>

            <Button
              onClick={() => handleSimulatePayment('FAILED')}
              disabled={isProcessing}
              variant="outline"
              className="w-full text-red-600 hover:text-red-700"
            >
              {isProcessing ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <XCircle className="h-4 w-4 mr-2" />
              )}
              Simulasi Pembayaran Gagal
            </Button>
          </div>

          {error && (
            <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 p-3 rounded-md">
              <AlertTriangle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Info box */}
          <div className="bg-amber-50 border border-amber-200 rounded-md p-3 text-sm text-amber-800">
            <p className="font-medium mb-1">Catatan Testing</p>
            <p>
              Halaman ini hanya muncul dalam mode development. Di production, pengguna akan
              diarahkan ke halaman pembayaran Xendit yang sebenarnya.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
