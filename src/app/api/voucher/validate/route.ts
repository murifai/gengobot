import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth';
import { voucherService } from '@/lib/voucher';
import { creditService } from '@/lib/subscription';

/**
 * POST /api/voucher/validate
 * Validate a voucher code without applying it
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { code, amount, durationMonths, targetTier } = body;

    if (!code || typeof code !== 'string') {
      return NextResponse.json({ error: 'Voucher code is required' }, { status: 400 });
    }

    // Get user's current subscription
    const subscription = await creditService.getOrCreateSubscription(session.user.id);

    // Use targetTier if provided (for upgrade scenarios), otherwise use current tier
    const tierToValidate = targetTier || subscription.tier;

    // Validate voucher
    const validation = await voucherService.validateVoucher(
      code,
      session.user.id,
      tierToValidate,
      amount,
      durationMonths
    );

    if (!validation.valid) {
      return NextResponse.json(
        {
          valid: false,
          error: validation.error,
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      valid: true,
      voucher: {
        code: validation.voucher!.code,
        name: validation.voucher!.name,
        description: validation.voucher!.description,
        type: validation.voucher!.type,
      },
      discountPreview: validation.discountPreview,
    });
  } catch (error) {
    console.error('Error validating voucher:', error);
    return NextResponse.json({ error: 'Failed to validate voucher' }, { status: 500 });
  }
}
