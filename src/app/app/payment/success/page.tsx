'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Invoice, InvoiceData } from '@/components/payment/Invoice';
import { CheckCircle, Loader2, ArrowRight, FileText, ChevronDown, ChevronUp } from 'lucide-react';

export default function PaymentSuccessPage() {
  const searchParams = useSearchParams();
  const [showInvoice, setShowInvoice] = useState(false);
  const [invoiceData, setInvoiceData] = useState<InvoiceData | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch latest payment data for invoice
  useEffect(() => {
    const fetchPaymentData = async () => {
      try {
        const response = await fetch('/api/payment/latest');
        if (response.ok) {
          const data = await response.json();
          if (data.payment) {
            setInvoiceData({
              ...data.payment,
              date: new Date(data.payment.date),
            });
          }
        }
      } catch (error) {
        console.error('Failed to fetch payment data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPaymentData();
  }, []);

  // Get order_id from URL if available
  const orderId = searchParams?.get('order_id');

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 gap-6">
      <Card className="max-w-md w-full">
        <CardContent className="pt-8 pb-6 text-center space-y-6">
          <div className="flex justify-center">
            <div className="rounded-full bg-green-100 p-3">
              <CheckCircle className="h-12 w-12 text-green-600" />
            </div>
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl font-bold">Pembayaran Berhasil!</h1>
            <p className="text-muted-foreground">
              Terima kasih! Langganan Anda telah aktif dan kredit sudah ditambahkan ke akun Anda.
            </p>
            {orderId && (
              <p className="text-xs text-muted-foreground font-mono">Order ID: {orderId}</p>
            )}
          </div>

          <div className="space-y-3">
            {invoiceData && (
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

            <Link href="/app/profile">
              <Button className="w-full">
                Lihat Langganan Saya
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>

            <Link href="/app">
              <Button variant="outline" className="w-full">
                Mulai Belajar
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Invoice Section */}
      {showInvoice && invoiceData && (
        <div className="w-full max-w-2xl animate-in slide-in-from-top-4 duration-300">
          <Invoice data={invoiceData} />
        </div>
      )}

      {loading && !invoiceData && (
        <div className="text-muted-foreground text-sm flex items-center gap-2">
          <Loader2 className="h-4 w-4 animate-spin" />
          Memuat data invoice...
        </div>
      )}
    </div>
  );
}
