import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { TIER_CONFIG, TIER_PRICING, getDiscountedPrice } from '@/lib/subscription';
import { SubscriptionTier } from '@prisma/client';

/**
 * GET /api/subscription/plans
 * Get all available subscription plans with pricing from database
 * Public endpoint - no auth required
 */
export async function GET() {
  try {
    // Fetch all tier configs from database
    const dbConfigs = await prisma.subscriptionTierConfig.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' },
    });

    // Map to response format with fallbacks
    const plans = (['FREE', 'BASIC', 'PRO'] as SubscriptionTier[]).map(tierName => {
      const dbConfig = dbConfigs.find(c => c.name === tierName);
      const fallbackConfig = TIER_CONFIG[tierName];
      const fallbackPrice = TIER_PRICING[tierName];

      // Get pricing config from database
      const pricingConfig = dbConfig
        ? {
            priceMonthly: dbConfig.priceMonthly,
            discount3Months: dbConfig.discount3Months,
            discount6Months: dbConfig.discount6Months,
            discount12Months: dbConfig.discount12Months,
          }
        : null;

      // Calculate prices for each duration
      const price1m = getDiscountedPrice(tierName, 1, pricingConfig);
      const price3m = getDiscountedPrice(tierName, 3, pricingConfig);
      const price6m = getDiscountedPrice(tierName, 6, pricingConfig);
      const price12m = getDiscountedPrice(tierName, 12, pricingConfig);

      return {
        tier: tierName,
        name: tierName === 'FREE' ? 'Gratis' : tierName === 'BASIC' ? 'Basic' : 'Pro',
        priceMonthly: dbConfig?.priceMonthly ?? fallbackPrice,
        credits: dbConfig?.credits ?? fallbackConfig.monthlyCredits,
        features: dbConfig?.features ?? [],
        isActive: dbConfig?.isActive ?? true,
        // Duration discounts (percentage 0-100)
        discounts: {
          discount3Months: dbConfig?.discount3Months ?? 10,
          discount6Months: dbConfig?.discount6Months ?? 20,
          discount12Months: dbConfig?.discount12Months ?? 30,
        },
        // Calculated prices per duration
        pricing: {
          monthly: {
            total: price1m.discountedTotal,
            perMonth: price1m.monthlyEquivalent,
            discount: price1m.discountPercent,
            savings: price1m.savings,
          },
          quarterly: {
            total: price3m.discountedTotal,
            perMonth: price3m.monthlyEquivalent,
            discount: price3m.discountPercent,
            savings: price3m.savings,
          },
          semiannual: {
            total: price6m.discountedTotal,
            perMonth: price6m.monthlyEquivalent,
            discount: price6m.discountPercent,
            savings: price6m.savings,
          },
          annual: {
            total: price12m.discountedTotal,
            perMonth: price12m.monthlyEquivalent,
            discount: price12m.discountPercent,
            savings: price12m.savings,
          },
        },
        config: {
          customCharacters: fallbackConfig.customCharacters,
          customCharactersUnlimited: fallbackConfig.customCharactersUnlimited,
          textUnlimited: fallbackConfig.textUnlimited,
          realtimeEnabled: fallbackConfig.realtimeEnabled,
          trialDays: fallbackConfig.trialDays,
          trialCredits: fallbackConfig.trialCredits,
        },
      };
    });

    return NextResponse.json({ plans });
  } catch (error) {
    console.error('Error fetching subscription plans:', error);
    return NextResponse.json({ error: 'Failed to fetch plans' }, { status: 500 });
  }
}
