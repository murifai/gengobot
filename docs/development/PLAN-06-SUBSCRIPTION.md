# PLAN-06: Subscription & Billing Management

## Overview

Implementasi billing management page dan integrasi diskon langganan panjang.

**Priority**: MEDIUM
**Complexity**: Medium
**Sessions**: 2

**Dependencies**: Phase 1 (Payment), Phase 5 (Admin - tier sync)

---

## Current State Analysis

### Yang Sudah Ada:

- [x] Subscription model di database
- [x] SubscriptionTierConfig model
- [x] Credit system
- [x] Voucher system untuk diskon
- [x] Payment via Midtrans

### Yang Belum Ada:

- [ ] Billing management page (user-facing)
- [ ] Invoice history
- [ ] Subscription renewal management
- [ ] Long-term subscription discounts
- [ ] Auto-renewal settings

---

## Session 1: Billing Management Page

### Tasks:

#### 1.1 Create Billing Page

**File**: `src/app/app/profile/billing/page.tsx`

```tsx
'use client';

import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CreditCard, Receipt, Calendar, ArrowUpCircle } from 'lucide-react';
import { formatCurrency, formatDate } from '@/lib/utils';
import Link from 'next/link';

export default function BillingPage() {
  const { data: subscription, isLoading } = useQuery({
    queryKey: ['subscription'],
    queryFn: () => fetch('/api/subscription').then(r => r.json()),
  });

  const { data: payments } = useQuery({
    queryKey: ['payment-history'],
    queryFn: () => fetch('/api/payment/history').then(r => r.json()),
  });

  if (isLoading) return <BillingPageSkeleton />;

  return (
    <div className="container max-w-4xl py-8 space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Billing & Langganan</h1>
        <p className="text-muted-foreground">Kelola langganan dan riwayat pembayaran kamu</p>
      </div>

      {/* Current Subscription Card */}
      <Card className="border-3 border-border shadow-neo">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Langganan Saat Ini
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Paket</p>
              <p className="text-2xl font-bold">{subscription?.tier || 'FREE'}</p>
            </div>
            <Badge variant={subscription?.status === 'ACTIVE' ? 'default' : 'secondary'}>
              {subscription?.status || 'Tidak Aktif'}
            </Badge>
          </div>

          {subscription?.tier !== 'FREE' && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Kredit Tersisa</p>
                  <p className="font-semibold">
                    {subscription?.remainingCredits?.toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Berlaku Sampai</p>
                  <p className="font-semibold">
                    {subscription?.endDate ? formatDate(subscription.endDate) : '-'}
                  </p>
                </div>
              </div>

              <div className="flex gap-2">
                <Button asChild variant="outline">
                  <Link href="/app/upgrade">Ubah Paket</Link>
                </Button>
                <Button variant="ghost" className="text-destructive">
                  Batalkan Langganan
                </Button>
              </div>
            </>
          )}

          {subscription?.tier === 'FREE' && (
            <Button asChild>
              <Link href="/app/upgrade">
                <ArrowUpCircle className="h-4 w-4 mr-2" />
                Upgrade Sekarang
              </Link>
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Credit Usage */}
      <Card className="border-3 border-border shadow-neo">
        <CardHeader>
          <CardTitle>Penggunaan Kredit Bulan Ini</CardTitle>
        </CardHeader>
        <CardContent>
          <CreditUsageChart data={subscription?.creditUsage} />
        </CardContent>
      </Card>

      {/* Payment History */}
      <Card className="border-3 border-border shadow-neo">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Receipt className="h-5 w-5" />
            Riwayat Pembayaran
          </CardTitle>
        </CardHeader>
        <CardContent>
          {payments?.length > 0 ? (
            <div className="space-y-4">
              {payments.map((payment: any) => (
                <PaymentHistoryItem key={payment.id} payment={payment} />
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-center py-8">Belum ada riwayat pembayaran</p>
          )}
        </CardContent>
      </Card>

      {/* Subscription Plans Comparison */}
      <Card className="border-3 border-border shadow-neo">
        <CardHeader>
          <CardTitle>Bandingkan Paket</CardTitle>
        </CardHeader>
        <CardContent>
          <SubscriptionPlansTable currentTier={subscription?.tier} />
        </CardContent>
      </Card>
    </div>
  );
}

function PaymentHistoryItem({ payment }: { payment: any }) {
  return (
    <div className="flex items-center justify-between p-4 border-2 border-border rounded-lg">
      <div className="flex items-center gap-4">
        <div
          className={`p-2 rounded-lg ${
            payment.status === 'PAID' ? 'bg-green-100' : 'bg-yellow-100'
          }`}
        >
          <Receipt
            className={`h-4 w-4 ${
              payment.status === 'PAID' ? 'text-green-600' : 'text-yellow-600'
            }`}
          />
        </div>
        <div>
          <p className="font-medium">{payment.description}</p>
          <p className="text-sm text-muted-foreground">{formatDate(payment.createdAt)}</p>
        </div>
      </div>
      <div className="text-right">
        <p className="font-bold">{formatCurrency(payment.amount)}</p>
        <Badge variant={payment.status === 'PAID' ? 'default' : 'secondary'}>
          {payment.status}
        </Badge>
      </div>
    </div>
  );
}
```

#### 1.2 Create Credit Usage Chart Component

**File**: `src/components/subscription/CreditUsageChart.tsx`

```tsx
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';

interface CreditUsageData {
  date: string;
  kaiwa: number;
  drill: number;
}

export function CreditUsageChart({ data }: { data: CreditUsageData[] }) {
  return (
    <div className="h-[200px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="kaiwa" name="Kaiwa" fill="#ff5e75" stackId="a" />
          <Bar dataKey="drill" name="Drill" fill="#1dcddc" stackId="a" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
```

#### 1.3 Create Subscription Plans Table

**File**: `src/components/subscription/SubscriptionPlansTable.tsx`

```tsx
import { Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

const PLANS = [
  {
    tier: 'FREE',
    name: 'Gratis',
    price: 0,
    credits: 5000,
    features: {
      textChat: '20/hari',
      voiceChat: false,
      characters: 1,
      decks: 5,
    },
  },
  {
    tier: 'BASIC',
    name: 'Basic',
    price: 29000,
    credits: 6000,
    features: {
      textChat: 'Unlimited',
      voiceChat: false,
      characters: 5,
      decks: 20,
    },
  },
  {
    tier: 'PRO',
    name: 'Pro',
    price: 49000,
    credits: 16500,
    features: {
      textChat: 'Unlimited',
      voiceChat: true,
      characters: 'Unlimited',
      decks: 'Unlimited',
    },
  },
];

export function SubscriptionPlansTable({ currentTier }: { currentTier?: string }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b-2 border-border">
            <th className="text-left py-3 px-4">Fitur</th>
            {PLANS.map(plan => (
              <th key={plan.tier} className="text-center py-3 px-4">
                <div>
                  <p className="font-bold">{plan.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {plan.price > 0 ? `Rp ${plan.price.toLocaleString()}/bln` : 'Gratis'}
                  </p>
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          <FeatureRow
            label="Kredit/bulan"
            values={PLANS.map(p => `${p.credits.toLocaleString()}`)}
          />
          <FeatureRow label="Chat Teks" values={PLANS.map(p => p.features.textChat)} />
          <FeatureRow label="Chat Suara" values={PLANS.map(p => p.features.voiceChat)} boolean />
          <FeatureRow
            label="Karakter Custom"
            values={PLANS.map(p => String(p.features.characters))}
          />
          <FeatureRow label="Deck" values={PLANS.map(p => String(p.features.decks))} />
        </tbody>
        <tfoot>
          <tr>
            <td></td>
            {PLANS.map(plan => (
              <td key={plan.tier} className="text-center py-4">
                {currentTier === plan.tier ? (
                  <Badge>Paket Saat Ini</Badge>
                ) : plan.tier !== 'FREE' && currentTier !== 'PRO' ? (
                  <Button asChild size="sm">
                    <Link href={`/app/upgrade?tier=${plan.tier}`}>Pilih</Link>
                  </Button>
                ) : null}
              </td>
            ))}
          </tr>
        </tfoot>
      </table>
    </div>
  );
}

function FeatureRow({
  label,
  values,
  boolean = false,
}: {
  label: string;
  values: (string | boolean)[];
  boolean?: boolean;
}) {
  return (
    <tr className="border-b border-border">
      <td className="py-3 px-4">{label}</td>
      {values.map((value, i) => (
        <td key={i} className="text-center py-3 px-4">
          {boolean ? (
            value ? (
              <Check className="h-5 w-5 text-green-500 mx-auto" />
            ) : (
              <X className="h-5 w-5 text-red-500 mx-auto" />
            )
          ) : (
            value
          )}
        </td>
      ))}
    </tr>
  );
}
```

#### 1.4 Add Billing API Endpoints

**File**: `src/app/api/subscription/history/route.ts`

```typescript
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/config';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const subscription = await prisma.subscription.findUnique({
    where: { userId: session.user.id },
    include: {
      user: {
        select: { name: true, email: true },
      },
    },
  });

  const creditUsage = await prisma.creditTransaction.groupBy({
    by: ['createdAt'],
    where: {
      userId: session.user.id,
      type: 'USAGE',
      createdAt: {
        gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
      },
    },
    _sum: {
      amount: true,
    },
  });

  return NextResponse.json({
    ...subscription,
    creditUsage,
  });
}
```

### Checklist Session 1:

- [x] Create billing page
- [x] Create credit usage chart
- [x] Create subscription plans table (reused existing PricingComparison)
- [x] Create payment history component (reused existing PaymentHistory)
- [x] Add subscription history API (reused existing + new usage-chart endpoint)
- [x] Add billing link to navigation
- [x] Test billing page displays correctly

---

## Session 2: Long-term Subscription Discounts

### Tasks:

#### 2.1 Update Subscription Tier Config Schema

**File**: `prisma/schema.prisma`

```prisma
model SubscriptionTierConfig {
  id                String   @id @default(cuid())
  tier              SubscriptionTier @unique
  displayName       String
  description       String?

  // Monthly pricing
  monthlyPrice      Int      // Price in IDR
  monthlyCredits    Int

  // Long-term discounts
  quarterlyPrice    Int?     // 3 months - e.g., 10% off
  quarterlyDiscount Float?   @default(0.10) // 10%

  semiAnnualPrice   Int?     // 6 months - e.g., 15% off
  semiAnnualDiscount Float?  @default(0.15) // 15%

  annualPrice       Int?     // 12 months - e.g., 20% off
  annualDiscount    Float?   @default(0.20) // 20%

  // Features
  features          Json     // Array of feature strings

  isActive          Boolean  @default(true)
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt
}
```

#### 2.2 Create Pricing Calculator

**File**: `src/lib/subscription/pricing-calculator.ts`

```typescript
import { prisma } from '../prisma';

export type BillingPeriod = 'monthly' | 'quarterly' | 'semi_annual' | 'annual';

interface PricingResult {
  originalPrice: number;
  discountedPrice: number;
  discountPercentage: number;
  savingsAmount: number;
  pricePerMonth: number;
  totalCredits: number;
  period: BillingPeriod;
  months: number;
}

const PERIOD_MONTHS: Record<BillingPeriod, number> = {
  monthly: 1,
  quarterly: 3,
  semi_annual: 6,
  annual: 12,
};

export async function calculatePricing(
  tier: string,
  period: BillingPeriod
): Promise<PricingResult> {
  const config = await prisma.subscriptionTierConfig.findUnique({
    where: { tier: tier as any },
  });

  if (!config) {
    throw new Error(`Tier ${tier} not found`);
  }

  const months = PERIOD_MONTHS[period];
  const originalPrice = config.monthlyPrice * months;

  let discountedPrice = originalPrice;
  let discountPercentage = 0;

  switch (period) {
    case 'quarterly':
      discountPercentage = config.quarterlyDiscount || 0.1;
      discountedPrice =
        config.quarterlyPrice || Math.round(originalPrice * (1 - discountPercentage));
      break;
    case 'semi_annual':
      discountPercentage = config.semiAnnualDiscount || 0.15;
      discountedPrice =
        config.semiAnnualPrice || Math.round(originalPrice * (1 - discountPercentage));
      break;
    case 'annual':
      discountPercentage = config.annualDiscount || 0.2;
      discountedPrice = config.annualPrice || Math.round(originalPrice * (1 - discountPercentage));
      break;
  }

  return {
    originalPrice,
    discountedPrice,
    discountPercentage,
    savingsAmount: originalPrice - discountedPrice,
    pricePerMonth: Math.round(discountedPrice / months),
    totalCredits: config.monthlyCredits * months,
    period,
    months,
  };
}

// Get all pricing options for a tier
export async function getAllPricingOptions(tier: string): Promise<PricingResult[]> {
  const periods: BillingPeriod[] = ['monthly', 'quarterly', 'semi_annual', 'annual'];
  return Promise.all(periods.map(period => calculatePricing(tier, period)));
}
```

#### 2.3 Update Upgrade Page with Billing Period Selection

**File**: `src/app/app/upgrade/page.tsx`

```tsx
'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { formatCurrency } from '@/lib/utils';

type BillingPeriod = 'monthly' | 'quarterly' | 'semi_annual' | 'annual';

const PERIOD_LABELS: Record<BillingPeriod, string> = {
  monthly: '1 Bulan',
  quarterly: '3 Bulan',
  semi_annual: '6 Bulan',
  annual: '12 Bulan',
};

export default function UpgradePage() {
  const [selectedTier, setSelectedTier] = useState<string>('BASIC');
  const [selectedPeriod, setSelectedPeriod] = useState<BillingPeriod>('monthly');

  const { data: pricingOptions } = useQuery({
    queryKey: ['pricing', selectedTier],
    queryFn: () => fetch(`/api/subscription/pricing?tier=${selectedTier}`).then(r => r.json()),
  });

  const selectedPricing = pricingOptions?.find((p: any) => p.period === selectedPeriod);

  const handleCheckout = async () => {
    const response = await fetch('/api/payment/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        tier: selectedTier,
        period: selectedPeriod,
      }),
    });
    const { snapToken, redirectUrl } = await response.json();
    // Redirect to Midtrans
    window.location.href = redirectUrl;
  };

  return (
    <div className="container max-w-4xl py-8">
      <h1 className="text-2xl font-bold mb-6">Pilih Paket Langganan</h1>

      {/* Tier Selection */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <TierCard
          tier="BASIC"
          selected={selectedTier === 'BASIC'}
          onSelect={() => setSelectedTier('BASIC')}
        />
        <TierCard
          tier="PRO"
          selected={selectedTier === 'PRO'}
          onSelect={() => setSelectedTier('PRO')}
        />
      </div>

      {/* Billing Period Selection */}
      <Card className="border-3 border-border shadow-neo mb-8">
        <CardHeader>
          <CardTitle>Pilih Durasi Langganan</CardTitle>
        </CardHeader>
        <CardContent>
          <RadioGroup
            value={selectedPeriod}
            onValueChange={v => setSelectedPeriod(v as BillingPeriod)}
            className="space-y-3"
          >
            {pricingOptions?.map((option: any) => (
              <div
                key={option.period}
                className={`flex items-center justify-between p-4 border-2 rounded-lg cursor-pointer ${
                  selectedPeriod === option.period ? 'border-primary bg-primary/5' : 'border-border'
                }`}
                onClick={() => setSelectedPeriod(option.period)}
              >
                <div className="flex items-center gap-3">
                  <RadioGroupItem value={option.period} id={option.period} />
                  <Label htmlFor={option.period} className="cursor-pointer">
                    <span className="font-medium">
                      {PERIOD_LABELS[option.period as BillingPeriod]}
                    </span>
                    {option.discountPercentage > 0 && (
                      <Badge className="ml-2" variant="secondary">
                        Hemat {Math.round(option.discountPercentage * 100)}%
                      </Badge>
                    )}
                  </Label>
                </div>
                <div className="text-right">
                  {option.discountPercentage > 0 && (
                    <p className="text-sm text-muted-foreground line-through">
                      {formatCurrency(option.originalPrice)}
                    </p>
                  )}
                  <p className="font-bold">{formatCurrency(option.discountedPrice)}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatCurrency(option.pricePerMonth)}/bulan
                  </p>
                </div>
              </div>
            ))}
          </RadioGroup>
        </CardContent>
      </Card>

      {/* Summary & Checkout */}
      {selectedPricing && (
        <Card className="border-3 border-border shadow-neo">
          <CardContent className="pt-6">
            <div className="flex justify-between items-center mb-4">
              <span>Paket {selectedTier}</span>
              <span>{PERIOD_LABELS[selectedPeriod]}</span>
            </div>
            <div className="flex justify-between items-center mb-4">
              <span>Total Kredit</span>
              <span>{selectedPricing.totalCredits.toLocaleString()} kredit</span>
            </div>
            {selectedPricing.savingsAmount > 0 && (
              <div className="flex justify-between items-center mb-4 text-green-600">
                <span>Hemat</span>
                <span>{formatCurrency(selectedPricing.savingsAmount)}</span>
              </div>
            )}
            <hr className="my-4" />
            <div className="flex justify-between items-center mb-6">
              <span className="font-bold text-lg">Total</span>
              <span className="font-bold text-xl">
                {formatCurrency(selectedPricing.discountedPrice)}
              </span>
            </div>
            <Button onClick={handleCheckout} className="w-full" size="lg">
              Bayar Sekarang
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
```

#### 2.4 Update Checkout API for Multi-period

**File**: `src/app/api/payment/checkout/route.ts`

```typescript
import { calculatePricing } from '@/lib/subscription/pricing-calculator';

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { tier, period } = await request.json();

  // Calculate pricing with discounts
  const pricing = await calculatePricing(tier, period);

  // Create pending payment
  const pendingPayment = await prisma.pendingPayment.create({
    data: {
      userId: session.user.id,
      amount: pricing.discountedPrice,
      tier,
      period,
      months: pricing.months,
      credits: pricing.totalCredits,
      status: 'PENDING',
    },
  });

  // Create Midtrans transaction
  const snapToken = await midtransService.createTransaction({
    orderId: pendingPayment.id,
    amount: pricing.discountedPrice,
    customerName: session.user.name,
    customerEmail: session.user.email,
    itemName: `Gengobot ${tier} - ${pricing.months} Bulan`,
  });

  return NextResponse.json({
    snapToken,
    redirectUrl: `https://app.midtrans.com/snap/v2/vtweb/${snapToken}`,
  });
}
```

#### 2.5 Update Webhook to Handle Multi-period

**File**: `src/app/api/webhooks/midtrans/route.ts`

```typescript
// When payment successful, activate subscription for correct duration
const activateSubscription = async (payment: PendingPayment) => {
  const endDate = new Date();
  endDate.setMonth(endDate.getMonth() + payment.months);

  await prisma.subscription.upsert({
    where: { userId: payment.userId },
    update: {
      tier: payment.tier,
      status: 'ACTIVE',
      startDate: new Date(),
      endDate,
      remainingCredits: { increment: payment.credits },
    },
    create: {
      userId: payment.userId,
      tier: payment.tier,
      status: 'ACTIVE',
      startDate: new Date(),
      endDate,
      remainingCredits: payment.credits,
    },
  });

  // Grant credits
  await prisma.creditTransaction.create({
    data: {
      userId: payment.userId,
      type: 'GRANT',
      amount: payment.credits,
      description: `Subscription ${payment.tier} - ${payment.months} months`,
    },
  });
};
```

### Checklist Session 2:

- [x] Update database schema for multi-period pricing (using SUBSCRIPTION_DISCOUNTS in credit-config.ts)
- [x] Create pricing calculator (getDiscountedPrice in credit-config.ts)
- [x] Create pricing API endpoint (/api/subscription/pricing)
- [x] Update upgrade page with period selection (DURATION_OPTIONS in upgrade/page.tsx)
- [x] Update checkout API for multi-period (using getDiscountedPrice)
- [x] Update webhook for correct duration (handlePaymentSuccess uses durationMonths)
- [x] Add discount display in CheckoutSummary component
- [x] Test all billing periods work correctly

---

## Database Migrations

```sql
-- Add multi-period pricing to SubscriptionTierConfig
ALTER TABLE "SubscriptionTierConfig"
ADD COLUMN "quarterlyPrice" INTEGER,
ADD COLUMN "quarterlyDiscount" FLOAT DEFAULT 0.10,
ADD COLUMN "semiAnnualPrice" INTEGER,
ADD COLUMN "semiAnnualDiscount" FLOAT DEFAULT 0.15,
ADD COLUMN "annualPrice" INTEGER,
ADD COLUMN "annualDiscount" FLOAT DEFAULT 0.20;

-- Add period info to PendingPayment
ALTER TABLE "PendingPayment"
ADD COLUMN "period" TEXT,
ADD COLUMN "months" INTEGER DEFAULT 1,
ADD COLUMN "credits" INTEGER;
```

---

## Testing Checklist

### Billing Page:

- [ ] Shows current subscription info
- [ ] Shows payment history
- [ ] Shows credit usage chart
- [ ] Subscription plans comparison correct

### Multi-period Pricing:

- [ ] Monthly price correct
- [ ] Quarterly discount applied (10%)
- [ ] Semi-annual discount applied (15%)
- [ ] Annual discount applied (20%)
- [ ] Savings displayed correctly

### Checkout Flow:

- [ ] Period selection works
- [ ] Correct amount charged
- [ ] Correct duration activated
- [ ] Correct credits granted

---

## Session 3: Subscription Tier Change Logic

### Problem Statement

Currently users can purchase any tier regardless of their current subscription status. This causes issues:

- A PRO user can buy BASIC (downgrade) and it takes effect immediately
- A BASIC user can buy BASIC again (duplicate purchase)
- No scheduled tier changes for future periods

### Solution

Implement proper tier change logic:

1. **Same tier purchase**: Block or extend duration
2. **Upgrade (BASIC → PRO)**: Take effect immediately, prorate credits
3. **Downgrade (PRO → BASIC)**: Schedule for next period, don't apply immediately

### Tasks:

#### 3.1 Add Scheduled Tier Change to Schema

**File**: `prisma/schema.prisma`

```prisma
model Subscription {
  // ... existing fields ...

  // Scheduled tier change (for downgrades)
  scheduledTier        SubscriptionTier?
  scheduledTierStartAt DateTime?
}
```

#### 3.2 Create Tier Change Validation Service

**File**: `src/lib/subscription/tier-change-service.ts`

```typescript
import { prisma } from '@/lib/prisma';
import { SubscriptionTier, SubscriptionStatus } from '@prisma/client';

export type TierChangeType = 'upgrade' | 'downgrade' | 'same' | 'new';

interface TierChangeValidation {
  allowed: boolean;
  changeType: TierChangeType;
  message: string;
  scheduledForNextPeriod?: boolean;
  currentPeriodEnd?: Date;
}

const TIER_HIERARCHY: Record<SubscriptionTier, number> = {
  FREE: 0,
  BASIC: 1,
  PRO: 2,
};

export async function validateTierChange(
  userId: string,
  targetTier: SubscriptionTier
): Promise<TierChangeValidation> {
  const subscription = await prisma.subscription.findUnique({
    where: { userId },
  });

  // No active subscription - allow any tier
  if (!subscription || subscription.status !== SubscriptionStatus.ACTIVE) {
    return {
      allowed: true,
      changeType: 'new',
      message: 'Membuat langganan baru',
    };
  }

  const currentTierLevel = TIER_HIERARCHY[subscription.tier];
  const targetTierLevel = TIER_HIERARCHY[targetTier];

  // Same tier - block (or optionally extend)
  if (subscription.tier === targetTier) {
    // Check if there's already a scheduled downgrade
    if (subscription.scheduledTier) {
      return {
        allowed: true,
        changeType: 'same',
        message: `Memperpanjang langganan ${targetTier} dan membatalkan perubahan tier yang dijadwalkan`,
      };
    }

    return {
      allowed: false,
      changeType: 'same',
      message: `Anda sudah berlangganan ${targetTier}. Perpanjang langganan akan tersedia saat mendekati masa berakhir.`,
    };
  }

  // Upgrade - allow immediately
  if (targetTierLevel > currentTierLevel) {
    return {
      allowed: true,
      changeType: 'upgrade',
      message: `Upgrade ke ${targetTier} akan aktif segera`,
    };
  }

  // Downgrade - schedule for next period
  return {
    allowed: true,
    changeType: 'downgrade',
    scheduledForNextPeriod: true,
    currentPeriodEnd: subscription.currentPeriodEnd || undefined,
    message: `Downgrade ke ${targetTier} akan aktif pada ${subscription.currentPeriodEnd?.toLocaleDateString('id-ID')} setelah periode ${subscription.tier} berakhir`,
  };
}

export async function applyTierChange(
  userId: string,
  targetTier: SubscriptionTier,
  durationMonths: number,
  changeType: TierChangeType
): Promise<void> {
  const subscription = await prisma.subscription.findUnique({
    where: { userId },
  });

  if (changeType === 'downgrade' && subscription) {
    // Schedule downgrade for next period
    await prisma.subscription.update({
      where: { userId },
      data: {
        scheduledTier: targetTier,
        scheduledTierStartAt: subscription.currentPeriodEnd,
        // Store pending payment info for when it activates
        metadata: {
          ...((subscription.metadata as object) || {}),
          scheduledDurationMonths: durationMonths,
        },
      },
    });
  } else if (changeType === 'upgrade' && subscription) {
    // Apply upgrade immediately
    // Calculate remaining value from current subscription (optional: prorate)
    const now = new Date();
    const periodEnd = new Date(now);
    periodEnd.setMonth(periodEnd.getMonth() + durationMonths);

    await prisma.subscription.update({
      where: { userId },
      data: {
        tier: targetTier,
        currentPeriodStart: now,
        currentPeriodEnd: periodEnd,
        scheduledTier: null,
        scheduledTierStartAt: null,
      },
    });
  }
  // For 'new' type, the existing payment flow handles it
}

export async function cancelScheduledTierChange(userId: string): Promise<void> {
  await prisma.subscription.update({
    where: { userId },
    data: {
      scheduledTier: null,
      scheduledTierStartAt: null,
      metadata: {
        scheduledDurationMonths: null,
      },
    },
  });
}
```

#### 3.3 Update Checkout API to Validate Tier Changes

**File**: `src/app/api/payment/checkout/route.ts`

```typescript
import { validateTierChange } from '@/lib/subscription/tier-change-service';

export async function POST(request: NextRequest) {
  // ... existing auth code ...

  const { tier, durationMonths, voucherCode } = body;

  // Validate tier change
  const validation = await validateTierChange(session.user.id, tier);

  if (!validation.allowed) {
    return NextResponse.json(
      {
        error: validation.message,
        changeType: validation.changeType,
      },
      { status: 400 }
    );
  }

  // Include change type info in response for frontend handling
  const result = await midtransService.createSubscriptionInvoice({
    userId: session.user.id,
    tier,
    durationMonths,
    voucherCode,
    // Pass change type for proper handling
    changeType: validation.changeType,
    scheduledForNextPeriod: validation.scheduledForNextPeriod,
  });

  return NextResponse.json({
    ...result,
    changeType: validation.changeType,
    scheduledForNextPeriod: validation.scheduledForNextPeriod,
    currentPeriodEnd: validation.currentPeriodEnd,
  });
}
```

#### 3.4 Update Upgrade Page UI for Tier Validation

**File**: `src/components/subscription/TierCard.tsx` (update)

```tsx
// Add warning/info for tier changes
{
  currentTier === tier && (
    <Badge variant="secondary" className="absolute top-2 right-2">
      Paket Saat Ini
    </Badge>
  );
}

{
  currentTier === 'PRO' && tier === 'BASIC' && (
    <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-sm">
      <p className="text-yellow-800">
        ⚠️ Downgrade akan aktif setelah periode PRO Anda berakhir pada{' '}
        <strong>{currentPeriodEnd}</strong>
      </p>
    </div>
  );
}
```

#### 3.5 Create Tier Change Validation API

**File**: `src/app/api/subscription/validate-change/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth';
import { validateTierChange } from '@/lib/subscription/tier-change-service';
import { SubscriptionTier } from '@prisma/client';

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { tier } = await request.json();

  if (!tier || !Object.values(SubscriptionTier).includes(tier)) {
    return NextResponse.json({ error: 'Invalid tier' }, { status: 400 });
  }

  const validation = await validateTierChange(session.user.id, tier);

  return NextResponse.json(validation);
}
```

#### 3.6 Add Scheduled Change Processing (Cron Job)

**File**: `src/app/api/cron/process-scheduled-tier-changes/route.ts`

```typescript
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { TIER_CONFIG } from '@/lib/subscription/credit-config';

export async function GET(request: Request) {
  // Verify cron secret
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const now = new Date();

  // Find subscriptions with scheduled tier changes that are due
  const subscriptionsToProcess = await prisma.subscription.findMany({
    where: {
      scheduledTier: { not: null },
      scheduledTierStartAt: { lte: now },
    },
  });

  for (const subscription of subscriptionsToProcess) {
    if (!subscription.scheduledTier) continue;

    const metadata = (subscription.metadata as { scheduledDurationMonths?: number }) || {};
    const durationMonths = metadata.scheduledDurationMonths || 1;

    const newTier = subscription.scheduledTier;
    const tierConfig = TIER_CONFIG[newTier];
    const totalCredits = tierConfig.monthlyCredits * durationMonths;

    const periodEnd = new Date(now);
    periodEnd.setMonth(periodEnd.getMonth() + durationMonths);

    await prisma.subscription.update({
      where: { id: subscription.id },
      data: {
        tier: newTier,
        currentPeriodStart: now,
        currentPeriodEnd: periodEnd,
        creditsTotal: totalCredits,
        creditsUsed: 0,
        creditsRemaining: totalCredits,
        scheduledTier: null,
        scheduledTierStartAt: null,
        metadata: {
          scheduledDurationMonths: null,
        },
      },
    });

    // Create credit transaction
    await prisma.creditTransaction.create({
      data: {
        userId: subscription.userId,
        type: 'GRANT',
        amount: totalCredits,
        balance: totalCredits,
        description: `Scheduled tier change to ${newTier} - ${durationMonths} month(s)`,
      },
    });
  }

  return NextResponse.json({
    processed: subscriptionsToProcess.length,
    timestamp: now.toISOString(),
  });
}
```

### Checklist Session 3:

- [x] Add scheduledTier fields to Subscription schema (scheduledTier, scheduledTierStartAt, scheduledDurationMonths)
- [x] Create tier change validation service (tier-change-service.ts)
- [x] Update checkout API to validate tier changes
- [x] Update upgrade page UI to show tier change warnings (PricingCard.tsx)
- [x] Create validate-change API endpoint (/api/subscription/validate-change)
- [x] Add cron job for processing scheduled tier changes (/api/cron/process-scheduled-tier-changes)
- [ ] Test upgrade flow (BASIC → PRO)
- [ ] Test downgrade flow (PRO → BASIC)
- [ ] Test same tier purchase blocking
- [ ] Test scheduled tier change processing

---

## Definition of Done

- [ ] Billing management page complete
- [ ] Payment history displays
- [ ] Credit usage tracking works
- [ ] Multi-period discounts implemented
- [ ] All billing periods work correctly
- [ ] Admin can configure discounts
- [ ] No pricing conflicts
- [ ] Tier change validation works (upgrade/downgrade/same)
- [ ] Downgrade schedules for next period
- [ ] Upgrade applies immediately
- [ ] Same tier purchase blocked
- [ ] Scheduled tier changes processed by cron

---

_Plan Version: 1.1_
_Updated: 2025-11-27_
_Added: Session 3 - Subscription Tier Change Logic_
