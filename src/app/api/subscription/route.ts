import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth';
import { creditService, TIER_CONFIG, TIER_PRICING } from '@/lib/subscription';

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

    // Get tier config for display
    const tierConfig = TIER_CONFIG[subscription.tier];
    const tierPrice = TIER_PRICING[subscription.tier];

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
      tierConfig: {
        monthlyCredits: tierConfig.monthlyCredits,
        customCharacters: tierConfig.customCharacters,
        customCharactersUnlimited: tierConfig.customCharactersUnlimited,
        textUnlimited: tierConfig.textUnlimited,
        price: tierPrice,
      },
    });
  } catch (error) {
    console.error('Error fetching subscription:', error);
    return NextResponse.json({ error: 'Failed to fetch subscription' }, { status: 500 });
  }
}
