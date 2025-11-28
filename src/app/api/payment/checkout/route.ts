import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth';
import { midtransService } from '@/lib/payment';
import { SubscriptionTier } from '@prisma/client';
import { validateTierChange } from '@/lib/subscription/tier-change-service';

/**
 * POST /api/payment/checkout
 * Create a checkout session for subscription
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { tier, durationMonths, voucherCode } = body;

    // Validate tier
    if (!tier || !Object.values(SubscriptionTier).includes(tier)) {
      return NextResponse.json({ error: 'Invalid subscription tier' }, { status: 400 });
    }

    // Validate duration
    const validDurations = [1, 3, 6, 12];
    if (!durationMonths || !validDurations.includes(durationMonths)) {
      return NextResponse.json({ error: 'Invalid subscription duration' }, { status: 400 });
    }

    // FREE tier doesn't need payment
    if (tier === SubscriptionTier.FREE) {
      return NextResponse.json({ error: 'Free tier does not require payment' }, { status: 400 });
    }

    // Validate tier change (upgrade/downgrade/same tier)
    const tierValidation = await validateTierChange(session.user.id, tier);

    if (!tierValidation.allowed) {
      return NextResponse.json(
        {
          error: tierValidation.message,
          changeType: tierValidation.changeType,
        },
        { status: 400 }
      );
    }

    // For downgrades, we still create the payment but the tier change is scheduled
    // The webhook will handle scheduling the tier change after payment success

    // Create checkout
    const result = await midtransService.createSubscriptionInvoice(
      {
        userId: session.user.id,
        tier,
        durationMonths,
        voucherCode,
        payerEmail: session.user.email || undefined,
        payerName: session.user.name || undefined,
      },
      {
        payerEmail: session.user.email || undefined,
        payerName: session.user.name || undefined,
      }
    );

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      transaction: {
        orderId: result.orderId,
        snapToken: result.snapToken,
        redirectUrl: result.redirectUrl,
      },
      pricing: {
        originalAmount: result.originalAmount,
        discountAmount: result.discountAmount,
        finalAmount: result.finalAmount,
      },
      tierChange: {
        changeType: tierValidation.changeType,
        scheduledForNextPeriod: tierValidation.scheduledForNextPeriod || false,
        currentPeriodEnd: tierValidation.currentPeriodEnd,
        message: tierValidation.message,
      },
      mockMode: midtransService.isMockMode(),
      clientKey: midtransService.getClientKey(),
      isProduction: midtransService.isProduction(),
    });
  } catch (error) {
    console.error('Error creating checkout:', error);
    return NextResponse.json({ error: 'Failed to create checkout' }, { status: 500 });
  }
}
