'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { CheckCircle, Loader2, ArrowRight } from 'lucide-react';

export default function PaymentSuccessPage() {
  const router = useRouter();
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    // Auto redirect countdown
    const interval = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          router.push('/app/profile');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
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
          </div>

          <div className="space-y-3">
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

          <p className="text-sm text-muted-foreground flex items-center justify-center gap-2">
            <Loader2 className="h-3 w-3 animate-spin" />
            Redirect otomatis dalam {countdown} detik...
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
