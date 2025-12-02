'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Check, Sparkles, Zap } from 'lucide-react';
import { SubscriptionTier } from '@prisma/client';

interface PlanOption {
  tier: SubscriptionTier;
  name: string;
  price: string;
  description: string;
  features: string[];
  icon: React.ReactNode;
  popular?: boolean;
}

const PLANS: PlanOption[] = [
  {
    tier: SubscriptionTier.FREE,
    name: 'Gratis',
    price: 'Rp 0',
    description: 'Mulai belajar dengan fitur dasar',
    features: [
      'Trial 14 hari dengan 50 kredit',
      'Akses materi dasar',
      'Latihan percakapan terbatas',
      'Karakter AI bawaan',
    ],
    icon: <Sparkles className="h-6 w-6" />,
  },
  {
    tier: SubscriptionTier.BASIC,
    name: 'Basic',
    price: 'Rp 49.000/bulan',
    description: 'Untuk pembelajar serius',
    features: [
      '500 kredit per bulan',
      'Akses semua materi',
      'Latihan percakapan lebih banyak',
      'Buat 3 karakter custom',
      'Riwayat pembelajaran',
    ],
    icon: <Zap className="h-6 w-6" />,
    popular: true,
  },
  {
    tier: SubscriptionTier.PRO,
    name: 'Pro',
    price: 'Rp 99.000/bulan',
    description: 'Akses penuh tanpa batas',
    features: [
      '2000 kredit per bulan',
      'Semua fitur Basic',
      'Karakter custom unlimited',
      'Voice chat realtime',
      'Prioritas support',
      'Fitur eksklusif baru',
    ],
    icon: <Zap className="h-6 w-6 fill-current" />,
  },
];

export default function ChoosePlanPage() {
  const router = useRouter();
  const [selectedTier, setSelectedTier] = useState<SubscriptionTier>(SubscriptionTier.FREE);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSelectPlan = async () => {
    setIsSubmitting(true);

    try {
      if (selectedTier === SubscriptionTier.FREE) {
        // For free tier, just start trial and go to onboarding
        const response = await fetch('/api/subscription/trial', {
          method: 'POST',
        });

        if (!response.ok) {
          const data = await response.json();
          // If user already has subscription, just proceed to onboarding
          if (data.error === 'User is not eligible for trial') {
            router.push('/app/onboarding');
            return;
          }
          throw new Error('Failed to start trial');
        }

        router.push('/app/onboarding');
      } else {
        // For paid tiers, go to upgrade page with pre-selected tier
        router.push(`/app/upgrade?tier=${selectedTier}&from=choose-plan`);
      }
    } catch (error) {
      console.error('Error selecting plan:', error);
      alert('Gagal memilih paket. Silakan coba lagi.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <div className="w-full max-w-4xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Pilih Paket Anda</h1>
          <p className="text-muted-foreground">
            Pilih paket yang sesuai dengan kebutuhan belajar Anda
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-4 mb-8">
          {PLANS.map(plan => (
            <Card
              key={plan.tier}
              className={`relative cursor-pointer transition-all ${
                selectedTier === plan.tier
                  ? 'ring-2 ring-primary border-primary'
                  : 'hover:border-primary/50'
              } ${plan.popular ? 'md:-mt-4 md:mb-4' : ''}`}
              onClick={() => setSelectedTier(plan.tier)}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="bg-primary text-primary-foreground text-xs font-medium px-3 py-1 rounded-full">
                    Populer
                  </span>
                </div>
              )}
              <CardHeader className="text-center pb-2">
                <div
                  className={`mx-auto mb-2 p-3 rounded-full ${
                    selectedTier === plan.tier ? 'bg-primary/10 text-primary' : 'bg-muted'
                  }`}
                >
                  {plan.icon}
                </div>
                <CardTitle className="text-xl">{plan.name}</CardTitle>
                <div className="text-2xl font-bold">{plan.price}</div>
                <CardDescription>{plan.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm">
                      <Check className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center">
          <Button size="lg" onClick={handleSelectPlan} disabled={isSubmitting} className="min-w-48">
            {isSubmitting
              ? 'Memproses...'
              : selectedTier === SubscriptionTier.FREE
                ? 'Mulai dengan Gratis'
                : `Pilih ${PLANS.find(p => p.tier === selectedTier)?.name}`}
          </Button>
          <p className="text-xs text-muted-foreground mt-3">
            {selectedTier === SubscriptionTier.FREE
              ? 'Anda bisa upgrade kapan saja'
              : 'Anda akan diarahkan ke halaman pembayaran'}
          </p>
        </div>
      </div>
    </div>
  );
}
