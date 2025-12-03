import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth';
import { creditService, TIER_CONFIG, TIER_PRICING, getDiscountedPrice } from '@/lib/subscription';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/subscription
 * Get current user's subscription status and credit balance
 */
export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const balance = await creditService.getBalance(session.user.id);
    const subscription = await creditService.getOrCreateSubscription(session.user.id);

    // Try to get tier config from database first (admin-configurable)
    const dbTierConfig = await prisma.subscriptionTierConfig.findUnique({
      where: { name: subscription.tier },
    });

    // Get fallback config from constants
    const fallbackConfig = TIER_CONFIG[subscription.tier];
    const fallbackPrice = TIER_PRICING[subscription.tier];

    // Get pricing config for calculating discounted prices
    const pricingConfig = dbTierConfig
      ? {
          priceMonthly: dbTierConfig.priceMonthly,
          discount3Months: dbTierConfig.discount3Months,
          discount6Months: dbTierConfig.discount6Months,
          discount12Months: dbTierConfig.discount12Months,
        }
      : null;

    // Calculate 12-month price
    const price12m = getDiscountedPrice(subscription.tier, 12, pricingConfig);

    // Merge database config with fallback
    const tierConfig = {
      monthlyCredits: dbTierConfig?.credits ?? fallbackConfig.monthlyCredits,
      customCharacters: fallbackConfig.customCharacters,
      customCharactersUnlimited: fallbackConfig.customCharactersUnlimited,
      textUnlimited: fallbackConfig.textUnlimited,
      realtimeEnabled: fallbackConfig.realtimeEnabled,
      price: dbTierConfig?.priceMonthly ?? fallbackPrice,
      features: dbTierConfig?.features ?? [],
      // Discount info
      discounts: {
        discount3Months: dbTierConfig?.discount3Months ?? 10,
        discount6Months: dbTierConfig?.discount6Months ?? 20,
        discount12Months: dbTierConfig?.discount12Months ?? 30,
      },
      // Calculated annual price (for backward compatibility)
      priceAnnual: price12m.discountedTotal,
    };

    return NextResponse.json({
      subscription: {
        id: subscription.id,
        tier: subscription.tier,
        status: subscription.status,
        currentPeriodStart: subscription.currentPeriodStart,
        currentPeriodEnd: subscription.currentPeriodEnd,
        customCharactersUsed: subscription.customCharactersUsed,
      },
      balance,
      tierConfig,
    });
  } catch (error) {
    console.error('Error fetching subscription:', error);
    return NextResponse.json({ error: 'Failed to fetch subscription' }, { status: 500 });
  }
}
