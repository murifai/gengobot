'use client';

import { useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Invoice, InvoiceData } from '@/components/payment/Invoice';
import {
  CheckCircle,
  Loader2,
  ArrowRight,
  FileText,
  ChevronDown,
  ChevronUp,
  Clock,
  RefreshCw,
} from 'lucide-react';

type PaymentStatus = 'PENDING' | 'PAID' | 'FAILED' | 'EXPIRED' | null;

export default function PaymentSuccessPage() {
  const searchParams = useSearchParams();
  const [showInvoice, setShowInvoice] = useState(false);
  const [invoiceData, setInvoiceData] = useState<InvoiceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>(null);
  const [isPolling, setIsPolling] = useState(false);

  // Fetch payment data
  const fetchPaymentData = useCallback(async () => {
    try {
      const response = await fetch('/api/payment/latest');
      if (response.ok) {
        const data = await response.json();
        if (data.payment) {
          setPaymentStatus(data.payment.status);
          setInvoiceData({
            ...data.payment,
            date: new Date(data.payment.date),
          });
          return data.payment.status;
        }
      }
      return null;
    } catch (error) {
      console.error('Failed to fetch payment data:', error);
      return null;
    }
  }, []);

  // Initial fetch
  useEffect(() => {
    const init = async () => {
      await fetchPaymentData();
      setLoading(false);
    };
    init();
  }, [fetchPaymentData]);

  // Auto-poll when payment is pending (every 5 seconds for 2 minutes)
  useEffect(() => {
    if (paymentStatus !== 'PENDING') return;

    setIsPolling(true);
    let pollCount = 0;
    const maxPolls = 24; // 2 minutes (24 * 5 seconds)

    const pollInterval = setInterval(async () => {
      pollCount++;
      const status = await fetchPaymentData();

      if (status === 'PAID' || pollCount >= maxPolls) {
        clearInterval(pollInterval);
        setIsPolling(false);
      }
    }, 5000);

    return () => {
      clearInterval(pollInterval);
      setIsPolling(false);
    };
  }, [paymentStatus, fetchPaymentData]);

  // Manual refresh
  const handleRefresh = async () => {
    setIsPolling(true);
    await fetchPaymentData();
    setIsPolling(false);
  };

  // Get order_id from URL if available
  const orderId = searchParams?.get('order_id');

  // Render different UI based on payment status
  const renderStatusIcon = () => {
    if (loading) {
      return (
        <div className="rounded-full bg-muted p-3">
          <Loader2 className="h-12 w-12 text-muted-foreground animate-spin" />
        </div>
      );
    }

    if (paymentStatus === 'PAID') {
      return (
        <div className="rounded-full bg-green-100 p-3">
          <CheckCircle className="h-12 w-12 text-green-600" />
        </div>
      );
    }

    // PENDING status
    return (
      <div className="rounded-full bg-amber-100 p-3">
        <Clock className="h-12 w-12 text-amber-600" />
      </div>
    );
  };

  const renderStatusContent = () => {
    if (loading) {
      return (
        <div className="space-y-2">
          <h1 className="text-2xl font-bold">Memuat Status Pembayaran...</h1>
          <p className="text-muted-foreground">Mohon tunggu sebentar.</p>
        </div>
      );
    }

    if (paymentStatus === 'PAID') {
      return (
        <div className="space-y-2">
          <h1 className="text-2xl font-bold">Pembayaran Berhasil!</h1>
          <p className="text-muted-foreground">
            Terima kasih! Langganan Anda telah aktif dan kredit AI sudah ditambahkan ke akun Anda.
          </p>
          {orderId && (
            <p className="text-xs text-muted-foreground font-mono">Order ID: {orderId}</p>
          )}
        </div>
      );
    }

    // PENDING status
    return (
      <div className="space-y-2">
        <h1 className="text-2xl font-bold">Menunggu Konfirmasi Pembayaran</h1>
        <p className="text-muted-foreground">
          Pembayaran Anda sedang diproses. Halaman ini akan otomatis diperbarui ketika pembayaran
          dikonfirmasi.
        </p>
        {orderId && <p className="text-xs text-muted-foreground font-mono">Order ID: {orderId}</p>}
        {isPolling && (
          <p className="text-xs text-amber-600 flex items-center justify-center gap-1">
            <RefreshCw className="h-3 w-3 animate-spin" />
            Memeriksa status pembayaran...
          </p>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 gap-6">
      <Card className="max-w-md w-full">
        <CardContent className="pt-8 pb-6 text-center space-y-6">
          <div className="flex justify-center">{renderStatusIcon()}</div>

          {renderStatusContent()}

          <div className="space-y-3">
            {/* Manual refresh button for pending payments */}
            {paymentStatus === 'PENDING' && !isPolling && (
              <Button variant="outline" className="w-full" onClick={handleRefresh}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Cek Status Pembayaran
              </Button>
            )}

            {/* Invoice button only for PAID payments */}
            {paymentStatus === 'PAID' && invoiceData && (
              <Button
                variant="outline"
                className="w-full"
                onClick={() => setShowInvoice(!showInvoice)}
              >
                <FileText className="h-4 w-4 mr-2" />
                {showInvoice ? 'Sembunyikan Invoice' : 'Lihat Invoice'}
                {showInvoice ? (
                  <ChevronUp className="h-4 w-4 ml-2" />
                ) : (
                  <ChevronDown className="h-4 w-4 ml-2" />
                )}
              </Button>
            )}

            <Link href="/profile" className="block">
              <Button className="w-full">
                {paymentStatus === 'PAID' ? 'Lihat Langganan Saya' : 'Cek Akun Saya'}
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>

            <Link href="/app" className="block">
              <Button variant="outline" className="w-full">
                {paymentStatus === 'PAID' ? 'Mulai Belajar' : 'Kembali ke Aplikasi'}
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Invoice Section - only for PAID */}
      {showInvoice && paymentStatus === 'PAID' && invoiceData && (
        <div className="w-full max-w-2xl animate-in slide-in-from-top-4 duration-300">
          <Invoice data={invoiceData} />
        </div>
      )}
    </div>
  );
}
