'use client';

import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Check, Loader2 } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { usePricingPlans } from '@/hooks/usePricingPlans';
import Link from 'next/link';

// Generate default features based on plan data from API
const getDefaultFeatures = (tier: string, credits: number): string[] => {
  if (tier === 'FREE') {
    return ['50 kredit AI trial', '7 hari trial', 'Limit 10 kredit AI/hari', '3 karakter custom'];
  } else if (tier === 'BASIC') {
    return [
      `${credits.toLocaleString('id-ID')} kredit AI/bulan`,
      'Chat text unlimited',
      '10 karakter custom',
      'Akses semua fitur dasar',
    ];
  } else if (tier === 'PRO') {
    return [
      `${credits.toLocaleString('id-ID')} kredit AI/bulan`,
      'Chat text unlimited',
      'Karakter custom unlimited',
      'Realtime voice enabled',
      'Prioritas support',
    ];
  }
  return [];
};

const TIER_DESCRIPTIONS: Record<string, string> = {
  FREE: 'Cocok untuk mencoba dan mengenal Gengo',
  BASIC: 'Untuk latihan rutin dan meningkatkan kemampuan',
  PRO: 'Untuk pengguna serius yang ingin hasil maksimal',
};

// Format currency to IDR
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

export function Pricing() {
  const { plans, isLoading, error } = usePricingPlans();

  if (isLoading) {
    return (
      <section className="container mx-auto px-6 py-20" id="pricing">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-foreground">Pilih Paket Kamu</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Mulai belajar bahasa Jepang dengan paket yang sesuai kebutuhanmu
          </p>
        </div>
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="container mx-auto px-6 py-20" id="pricing">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-foreground">Pilih Paket Kamu</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Mulai belajar bahasa Jepang dengan paket yang sesuai kebutuhanmu
          </p>
        </div>
        <div className="text-center py-12 text-muted-foreground">
          Gagal memuat data harga. Silakan refresh halaman.
        </div>
      </section>
    );
  }

  // Sort plans: FREE, BASIC, PRO
  const sortedPlans = [...plans].sort((a, b) => {
    const order = { FREE: 0, BASIC: 1, PRO: 2 };
    return (order[a.tier] || 0) - (order[b.tier] || 0);
  });

  return (
    <section className="container mx-auto px-6 py-20" id="pricing">
      <div className="text-center mb-12">
        <h2 className="text-3xl md:text-4xl font-bold mb-4 text-foreground">Pilih Paket Kamu</h2>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Mulai belajar bahasa Jepang dengan paket yang sesuai kebutuhanmu
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
        {sortedPlans.map((plan, index) => {
          const isPro = plan.tier === 'PRO';
          const isFree = plan.tier === 'FREE';
          const features =
            plan.features && plan.features.length > 0
              ? plan.features
              : getDefaultFeatures(plan.tier, plan.credits);

          return (
            <Card
              key={index}
              className={`relative hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none transition-all ${
                isPro ? 'border-primary scale-105' : ''
              }`}
            >
              {isPro && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <Badge variant="danger" className="bg-primary text-primary-foreground">
                    Populer
                  </Badge>
                </div>
              )}
              <CardHeader>
                <CardTitle className="text-2xl">{plan.name}</CardTitle>
                <div className="mt-4">
                  {isFree ? (
                    <span className="text-4xl font-bold text-foreground">Gratis</span>
                  ) : (
                    <>
                      <span className="text-4xl font-bold text-foreground">
                        {formatCurrency(plan.priceMonthly)}
                      </span>
                      <span className="text-muted-foreground">/bulan</span>
                    </>
                  )}
                </div>
                {!isFree && plan.discounts.discount12Months > 0 && (
                  <div className="mt-2">
                    <Badge variant="success" className="text-xs">
                      Hemat {plan.discounts.discount12Months}% untuk 12 bulan
                    </Badge>
                  </div>
                )}
                <CardDescription className="mt-4">
                  {TIER_DESCRIPTIONS[plan.tier] || ''}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Separator className="mb-6" />
                <ul className="space-y-3 mb-6">
                  {features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-start gap-3">
                      <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                      <span className="text-sm text-muted-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>
                <Link href={isFree ? '/auth/login' : `/app/upgrade?tier=${plan.tier}`}>
                  <Button
                    className={`w-full ${
                      isPro ? 'bg-primary hover:opacity-90' : 'bg-secondary hover:bg-secondary/80'
                    }`}
                    size="lg"
                  >
                    {isFree ? 'Mulai Gratis' : `Pilih ${plan.name}`}
                  </Button>
                </Link>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </section>
  );
}
