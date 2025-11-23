import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth';
import { voucherService } from '@/lib/voucher';

/**
 * GET /api/voucher/my-redemptions
 * Get user's voucher redemption history
 */
export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const redemptions = await voucherService.getUserRedemptions(session.user.id);

    return NextResponse.json({
      redemptions: redemptions.map(r => ({
        id: r.id,
        voucherCode: r.voucher.code,
        voucherName: r.voucher.name,
        discountType: r.discountType,
        discountValue: r.discountValue,
        originalAmount: r.originalAmount,
        finalAmount: r.finalAmount,
        status: r.status,
        createdAt: r.createdAt,
      })),
    });
  } catch (error) {
    console.error('Error fetching redemptions:', error);
    return NextResponse.json({ error: 'Failed to fetch redemptions' }, { status: 500 });
  }
}
