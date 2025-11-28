import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth';
import { validateTierChange } from '@/lib/subscription/tier-change-service';
import { SubscriptionTier } from '@prisma/client';

/**
 * POST /api/subscription/validate-change
 * Validate if a user can change to a target tier
 * Returns validation result with change type (upgrade/downgrade/same/new)
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { tier } = body;

    // Validate tier parameter
    if (!tier || !Object.values(SubscriptionTier).includes(tier)) {
      return NextResponse.json({ error: 'Invalid tier' }, { status: 400 });
    }

    // FREE tier doesn't need validation (no payment required)
    if (tier === SubscriptionTier.FREE) {
      return NextResponse.json({
        allowed: false,
        changeType: 'same',
        message: 'Paket gratis tidak memerlukan pembayaran',
      });
    }

    const validation = await validateTierChange(session.user.id, tier);

    return NextResponse.json(validation);
  } catch (error) {
    console.error('Error validating tier change:', error);
    return NextResponse.json({ error: 'Failed to validate tier change' }, { status: 500 });
  }
}
