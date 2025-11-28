import { NextRequest, NextResponse } from 'next/server';
import { SubscriptionTier } from '@prisma/client';
import { getDiscountedPrice, TIER_CONFIG } from '@/lib/subscription/credit-config';

export type BillingPeriod = 'monthly' | 'quarterly' | 'semi_annual' | 'annual';

interface PricingOption {
  period: BillingPeriod;
  months: number;
  originalPrice: number;
  discountedPrice: number;
  discountPercentage: number;
  savingsAmount: number;
  pricePerMonth: number;
  totalCredits: number;
}

const PERIOD_CONFIG: Record<BillingPeriod, { months: 1 | 3 | 6 | 12; label: string }> = {
  monthly: { months: 1, label: '1 Bulan' },
  quarterly: { months: 3, label: '3 Bulan' },
  semi_annual: { months: 6, label: '6 Bulan' },
  annual: { months: 12, label: '12 Bulan' },
};

/**
 * GET /api/subscription/pricing
 * Get all pricing options for a specific tier
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const tierParam = searchParams.get('tier');

  // Validate tier
  if (!tierParam || !['BASIC', 'PRO'].includes(tierParam)) {
    return NextResponse.json({ error: 'Invalid tier. Must be BASIC or PRO' }, { status: 400 });
  }

  const tier = tierParam as SubscriptionTier;
  const tierConfig = TIER_CONFIG[tier];

  // Calculate pricing for all periods
  const pricingOptions: PricingOption[] = Object.entries(PERIOD_CONFIG).map(([period, config]) => {
    const pricing = getDiscountedPrice(tier, config.months);
    const discountPercentage =
      pricing.originalTotal > 0 ? pricing.savings / pricing.originalTotal : 0;

    return {
      period: period as BillingPeriod,
      months: config.months,
      originalPrice: pricing.originalTotal,
      discountedPrice: pricing.discountedTotal,
      discountPercentage,
      savingsAmount: pricing.savings,
      pricePerMonth: pricing.monthlyEquivalent,
      totalCredits: tierConfig.monthlyCredits * config.months,
    };
  });

  return NextResponse.json(pricingOptions);
}
