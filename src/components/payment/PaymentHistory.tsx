'use client';

import { useEffect, useState } from 'react';
import {
  CreditCard,
  Loader2,
  ExternalLink,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';
import { SubscriptionTier, PaymentStatus } from '@prisma/client';

interface PaymentItem {
  id: string;
  tier: SubscriptionTier;
  durationMonths: number;
  amount: number;
  status: PaymentStatus;
  invoiceUrl: string;
  paymentMethod: string | null;
  paymentChannel: string | null;
  paidAt: string | null;
  expiresAt: string;
  createdAt: string;
}

interface PaymentHistoryProps {
  className?: string;
}

export function PaymentHistory({ className }: PaymentHistoryProps) {
  const [payments, setPayments] = useState<PaymentItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        const response = await fetch('/api/payment/history');
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Failed to fetch payments');
        }

        setPayments(data.payments);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setIsLoading(false);
      }
    };

    fetchPayments();
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
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Get status icon and color
  const getStatusDisplay = (status: PaymentStatus) => {
    switch (status) {
      case 'PAID':
        return {
          icon: <CheckCircle className="h-4 w-4" />,
          variant: 'success' as const,
          label: 'Berhasil',
        };
      case 'PENDING':
        return {
          icon: <Clock className="h-4 w-4" />,
          variant: 'warning' as const,
          label: 'Menunggu',
        };
      case 'EXPIRED':
        return {
          icon: <XCircle className="h-4 w-4" />,
          variant: 'secondary' as const,
          label: 'Kadaluarsa',
        };
      case 'FAILED':
        return {
          icon: <AlertTriangle className="h-4 w-4" />,
          variant: 'danger' as const,
          label: 'Gagal',
        };
      case 'REFUNDED':
        return {
          icon: <XCircle className="h-4 w-4" />,
          variant: 'secondary' as const,
          label: 'Refund',
        };
      default:
        return {
          icon: <Clock className="h-4 w-4" />,
          variant: 'default' as const,
          label: status,
        };
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
          <CreditCard className="h-5 w-5 text-primary" />
          Riwayat Pembayaran
        </CardTitle>
      </CardHeader>
      <CardContent>
        {payments.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            Belum ada riwayat pembayaran
          </p>
        ) : (
          <div className="space-y-4">
            {payments.map(payment => {
              const statusDisplay = getStatusDisplay(payment.status);

              return (
                <div key={payment.id} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-medium">
                        Gengo {payment.tier} - {payment.durationMonths} bulan
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {formatDate(payment.createdAt)}
                      </p>
                    </div>
                    <Badge variant={statusDisplay.variant} className="flex items-center gap-1">
                      {statusDisplay.icon}
                      {statusDisplay.label}
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-lg font-semibold">{formatCurrency(payment.amount)}</p>
                      {payment.paymentMethod && (
                        <p className="text-xs text-muted-foreground">
                          {payment.paymentMethod} - {payment.paymentChannel}
                        </p>
                      )}
                    </div>

                    {payment.status === 'PENDING' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(payment.invoiceUrl, '_blank')}
                      >
                        <ExternalLink className="h-3 w-3 mr-1" />
                        Bayar
                      </Button>
                    )}
                  </div>

                  {payment.status === 'PENDING' && (
                    <p className="text-xs text-muted-foreground">
                      Kadaluarsa: {formatDate(payment.expiresAt)}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
