'use client';

import { useState, useEffect } from 'react';
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

// Default plans (fallback if API fails)
const DEFAULT_PLANS: PlanOption[] = [
  {
    tier: SubscriptionTier.FREE,
    name: 'Gratis',
    price: 'Rp 0',
    description: 'Mulai belajar dengan fitur dasar',
    features: [
      'Trial 14 hari dengan 50 kredit AI',
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
      '500 kredit AI per bulan',
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
      '2000 kredit AI per bulan',
      'Semua fitur Basic',
      'Karakter custom unlimited',
      'Voice chat realtime',
      'Prioritas support',
      'Fitur eksklusif baru',
    ],
    icon: <Zap className="h-6 w-6 fill-current" />,
  },
];

// Format price in Indonesian Rupiah
function formatPrice(price: number): string {
  if (price === 0) return 'Rp 0';
  return `Rp ${price.toLocaleString('id-ID')}/bulan`;
}

// Helper functions for mapping API data
function getDescriptionForTier(tier: SubscriptionTier): string {
  switch (tier) {
    case SubscriptionTier.FREE:
      return 'Buat yang mau belajar hafal kosakata, kanji dan pola kalimat. Ada juga trial buat user baru coba coba fitur AI';
    case SubscriptionTier.BASIC:
      return 'Buat yang mulai latihan ngobrol Jepang.';
    case SubscriptionTier.PRO:
      return 'Buat yang serius mau ningkatin kemampuan bahasa Jepangnya.';
    default:
      return '';
  }
}

function getDefaultFeaturesForTier(tier: SubscriptionTier): string[] {
  const defaultPlan = DEFAULT_PLANS.find(p => p.tier === tier);
  return defaultPlan?.features || [];
}

function getIconForTier(tier: SubscriptionTier): React.ReactNode {
  switch (tier) {
    case SubscriptionTier.FREE:
      return <Sparkles className="h-6 w-6" />;
    case SubscriptionTier.BASIC:
      return <Zap className="h-6 w-6" />;
    case SubscriptionTier.PRO:
      return <Zap className="h-6 w-6 fill-current" />;
    default:
      return <Sparkles className="h-6 w-6" />;
  }
}

export default function ChoosePlanPage() {
  const router = useRouter();
  const [selectedTier, setSelectedTier] = useState<SubscriptionTier>(SubscriptionTier.FREE);
  const [plans, setPlans] = useState<PlanOption[]>(DEFAULT_PLANS);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [trialUsed, setTrialUsed] = useState(false);
  const [checkingTrial, setCheckingTrial] = useState(true);

  // Check trial eligibility on mount
  useEffect(() => {
    async function checkTrialEligibility() {
      try {
        const response = await fetch('/api/subscription/trial/check');
        if (response.ok) {
          const data = await response.json();
          setTrialUsed(!data.eligible);
        }
      } catch {
        // Assume trial available on error
      } finally {
        setCheckingTrial(false);
      }
    }
    checkTrialEligibility();
  }, []);

  // Fetch plans from API to sync with admin settings
  useEffect(() => {
    async function fetchPlans() {
      try {
        const response = await fetch('/api/subscription/plans');
        if (response.ok) {
          const data = await response.json();
          if (data.plans && data.plans.length > 0) {
            // Map API response to PlanOption format
            const apiPlans: PlanOption[] = data.plans.map(
              (plan: {
                tier: SubscriptionTier;
                name: string;
                priceMonthly: number;
                features: string[];
              }) => ({
                tier: plan.tier,
                name: plan.name,
                price: formatPrice(plan.priceMonthly),
                description: getDescriptionForTier(plan.tier),
                features:
                  plan.features.length > 0 ? plan.features : getDefaultFeaturesForTier(plan.tier),
                icon: getIconForTier(plan.tier),
                popular: plan.tier === SubscriptionTier.BASIC,
              })
            );
            setPlans(apiPlans);
          }
        }
      } catch (error) {
        console.error('Failed to fetch plans:', error);
        // Keep default plans on error
      }
    }
    fetchPlans();
  }, []);

  const handleSelectPlan = async () => {
    setIsSubmitting(true);

    try {
      if (selectedTier === SubscriptionTier.FREE) {
        if (!trialUsed) {
          // New user - start trial with credits
          const response = await fetch('/api/subscription/trial', {
            method: 'POST',
          });

          if (!response.ok) {
            const data = await response.json();
            if (data.error === 'User is not eligible for trial') {
              setTrialUsed(true);
              // Create free subscription without trial credits
              await fetch('/api/subscription/free', { method: 'POST' });
            }
          }
        } else {
          // Returning user - create free subscription without trial credits
          await fetch('/api/subscription/free', { method: 'POST' });
        }

        // Force full page reload to refresh server-side subscription check
        window.location.href = '/app';
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
          <h1 className="text-3xl font-bold">Pilih Paket Anda</h1>
        </div>

        {!checkingTrial && trialUsed && selectedTier === SubscriptionTier.FREE && (
          <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-950/50 border-2 border-blue-200 dark:border-blue-800 rounded-base">
            <div className="flex items-start gap-3">
              <Sparkles className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-blue-900 dark:text-blue-200">
                  Selamat datang kembali!
                </p>
                <p className="text-sm text-blue-800 dark:text-blue-300 mt-1">
                  Paket Gratis tetap bisa digunakan untuk belajar kosakata, kanji, dan pola kalimat.
                  Kredit AI trial hanya tersedia sekali per akun. Untuk fitur AI conversation,
                  silakan upgrade ke paket berbayar.
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="grid md:grid-cols-3 gap-4 mb-8">
          {plans.map(plan => (
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
          <Button
            size="lg"
            onClick={handleSelectPlan}
            disabled={isSubmitting || checkingTrial}
            className="min-w-48"
          >
            {isSubmitting || checkingTrial
              ? 'Memproses...'
              : selectedTier === SubscriptionTier.FREE
                ? 'Mulai dengan Gratis'
                : `Pilih ${plans.find(p => p.tier === selectedTier)?.name}`}
          </Button>
          <p className="text-xs text-muted-foreground mt-3">
            {selectedTier === SubscriptionTier.FREE
              ? !checkingTrial && !trialUsed
                ? '🎁 User baru mendapat 50 kredit AI trial gratis selama 14 hari!'
                : 'Anda bisa upgrade kapan saja'
              : 'Anda akan diarahkan ke halaman pembayaran'}
          </p>
        </div>
      </div>
    </div>
  );
}
