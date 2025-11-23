import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth';
import { voucherService } from '@/lib/voucher';
import { creditService } from '@/lib/subscription';

/**
 * POST /api/voucher/apply
 * Apply a voucher to a subscription/checkout
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { code, amount, subscriptionId } = body;

    if (!code || typeof code !== 'string') {
      return NextResponse.json({ error: 'Voucher code is required' }, { status: 400 });
    }

    if (typeof amount !== 'number' || amount < 0) {
      return NextResponse.json({ error: 'Valid amount is required' }, { status: 400 });
    }

    // Get user's current tier
    const subscription = await creditService.getOrCreateSubscription(session.user.id);

    // Apply voucher
    const result = await voucherService.applyVoucher(
      code,
      session.user.id,
      subscription.tier,
      amount,
      subscriptionId
    );

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          error: result.error,
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      redemption: {
        id: result.redemption!.id,
        discountType: result.redemption!.discountType,
        discountValue: result.redemption!.discountValue,
        originalAmount: result.redemption!.originalAmount,
        finalAmount: result.redemption!.finalAmount,
      },
      discountResult: result.discountResult,
    });
  } catch (error) {
    console.error('Error applying voucher:', error);
    return NextResponse.json({ error: 'Failed to apply voucher' }, { status: 500 });
  }
}
