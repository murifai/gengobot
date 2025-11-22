import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth';
import { UsageType } from '@prisma/client';
import { creditService, getCreditCost, estimateMinutesFromCredits } from '@/lib/subscription';

/**
 * POST /api/subscription/check
 * Check if user can perform an action based on their credits
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { usageType, estimatedUnits = 1 } = body;

    // Validate usage type
    if (!usageType || !Object.values(UsageType).includes(usageType)) {
      return NextResponse.json({ error: 'Invalid usage type' }, { status: 400 });
    }

    const creditCheck = await creditService.checkCredits(
      session.user.id,
      usageType as UsageType,
      estimatedUnits
    );

    // Calculate estimated usage
    const estimatedCredits = getCreditCost(usageType as UsageType, estimatedUnits);
    const estimatedMinutes = estimateMinutesFromCredits(
      creditCheck.creditsAvailable,
      usageType as UsageType
    );

    return NextResponse.json({
      allowed: creditCheck.allowed,
      reason: creditCheck.reason,
      credits: {
        required: creditCheck.creditsRequired,
        available: creditCheck.creditsAvailable,
        estimated: estimatedCredits,
      },
      trial: {
        isTrialUser: creditCheck.isTrialUser,
        daysRemaining: creditCheck.trialDaysRemaining,
      },
      estimatedMinutesRemaining: estimatedMinutes,
    });
  } catch (error) {
    console.error('Error checking credits:', error);
    return NextResponse.json({ error: 'Failed to check credits' }, { status: 500 });
  }
}
