import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth';
import { creditService, TIER_CONFIG, TIER_PRICING } from '@/lib/subscription';
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

    // Merge database config with fallback
    const tierConfig = {
      monthlyCredits: dbTierConfig?.credits ?? fallbackConfig.monthlyCredits,
      customCharacters: fallbackConfig.customCharacters,
      customCharactersUnlimited: fallbackConfig.customCharactersUnlimited,
      textUnlimited: fallbackConfig.textUnlimited,
      realtimeEnabled: fallbackConfig.realtimeEnabled,
      price: dbTierConfig?.priceMonthly ?? fallbackPrice,
      priceAnnual: dbTierConfig?.priceAnnual ?? fallbackPrice * 12,
      features: dbTierConfig?.features ?? [],
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
