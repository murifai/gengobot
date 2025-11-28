import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { TIER_CONFIG, TIER_PRICING } from '@/lib/subscription';
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

      return {
        tier: tierName,
        name: tierName === 'FREE' ? 'Gratis' : tierName === 'BASIC' ? 'Basic' : 'Pro',
        priceMonthly: dbConfig?.priceMonthly ?? fallbackPrice,
        priceAnnual: dbConfig?.priceAnnual ?? fallbackPrice * 10, // 2 months free for annual
        credits: dbConfig?.credits ?? fallbackConfig.monthlyCredits,
        features: dbConfig?.features ?? [],
        isActive: dbConfig?.isActive ?? true,
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
