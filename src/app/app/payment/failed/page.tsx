'use client';

import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { XCircle, RefreshCw, MessageCircle } from 'lucide-react';

export default function PaymentFailedPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="max-w-md w-full">
        <CardContent className="pt-8 pb-6 text-center space-y-6">
          <div className="flex justify-center">
            <div className="rounded-full bg-red-100 p-3">
              <XCircle className="h-12 w-12 text-red-600" />
            </div>
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl font-bold">Pembayaran Gagal</h1>
            <p className="text-muted-foreground">
              Maaf, pembayaran Anda tidak dapat diproses. Silakan coba lagi atau gunakan metode
              pembayaran lain.
            </p>
          </div>

          <div className="space-y-3">
            <Link href="/app/upgrade">
              <Button className="w-full">
                <RefreshCw className="h-4 w-4 mr-2" />
                Coba Lagi
              </Button>
            </Link>

            <Link href="/app">
              <Button variant="outline" className="w-full">
                Kembali ke Dashboard
              </Button>
            </Link>
          </div>

          <div className="pt-4 border-t">
            <p className="text-sm text-muted-foreground mb-3">
              Butuh bantuan? Hubungi tim support kami.
            </p>
            <Link href="mailto:support@gengo.id">
              <Button variant="ghost" size="sm">
                <MessageCircle className="h-4 w-4 mr-2" />
                Hubungi Support
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
