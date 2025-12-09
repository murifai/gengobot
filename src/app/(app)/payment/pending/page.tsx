'use client';

import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Clock, ArrowRight, RefreshCw } from 'lucide-react';

export default function PaymentPendingPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="max-w-md w-full">
        <CardContent className="pt-8 pb-6 text-center space-y-6">
          <div className="flex justify-center">
            <div className="rounded-full bg-yellow-100 p-3">
              <Clock className="h-12 w-12 text-yellow-600" />
            </div>
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl font-bold">Menunggu Pembayaran</h1>
            <p className="text-muted-foreground">
              Pembayaran Anda sedang diproses. Silakan selesaikan pembayaran sesuai instruksi yang
              diberikan.
            </p>
          </div>

          <div className="bg-muted/50 rounded-lg p-4 text-sm text-muted-foreground">
            <p>
              Setelah pembayaran berhasil, langganan Anda akan langsung aktif dan kredit akan
              ditambahkan ke akun.
            </p>
          </div>

          <div className="space-y-3">
            <Link href="/profile">
              <Button className="w-full">
                Cek Status Langganan
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>

            <Button variant="outline" className="w-full" onClick={() => window.location.reload()}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh Halaman
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
