import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth';
import { voucherService } from '@/lib/voucher';
import { creditService } from '@/lib/subscription';
import { VoucherType } from '@prisma/client';

/**
 * POST /api/voucher/redeem
 * Redeem a voucher code directly (for bonus credits, trial extension, etc.)
 * This is different from /api/voucher/apply which is used during checkout.
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { code } = body;

    if (!code || typeof code !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Kode voucher diperlukan' },
        { status: 400 }
      );
    }

    // Get user's current subscription
    const subscription = await creditService.getOrCreateSubscription(session.user.id);

    // First validate the voucher
    const validation = await voucherService.validateVoucher(
      code,
      session.user.id,
      subscription.tier,
      0 // No amount for direct redeem
    );

    if (!validation.valid || !validation.voucher) {
      return NextResponse.json(
        { success: false, error: validation.error || 'Kode voucher tidak valid' },
        { status: 400 }
      );
    }

    const voucher = validation.voucher;

    // Only allow certain voucher types for direct redeem
    const allowedTypes: VoucherType[] = [VoucherType.BONUS_CREDITS, VoucherType.TRIAL_EXTENSION];

    if (!allowedTypes.includes(voucher.type)) {
      return NextResponse.json(
        {
          success: false,
          error:
            'Kode ini hanya bisa digunakan saat checkout. Silakan gunakan saat melakukan pembayaran.',
        },
        { status: 400 }
      );
    }

    // Apply the voucher
    const result = await voucherService.applyVoucher(
      code,
      session.user.id,
      subscription.tier,
      0, // No amount for direct redeem
      undefined // No subscription ID
    );

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error || 'Gagal menukarkan voucher' },
        { status: 400 }
      );
    }

    // Format success message based on voucher type
    let message = 'Voucher berhasil ditukarkan!';
    let details: Record<string, unknown> = {};

    switch (voucher.type) {
      case VoucherType.BONUS_CREDITS:
        message = `Selamat! Anda mendapatkan ${voucher.value.toLocaleString('id-ID')} kredit bonus.`;
        details = { creditsAdded: voucher.value };
        break;
      case VoucherType.TRIAL_EXTENSION:
        message = `Selamat! Trial Anda diperpanjang ${voucher.value} hari.`;
        details = { daysExtended: voucher.value };
        break;
    }

    return NextResponse.json({
      success: true,
      message,
      voucherType: voucher.type,
      details,
    });
  } catch (error) {
    console.error('Error redeeming voucher:', error);
    return NextResponse.json(
      { success: false, error: 'Gagal menukarkan voucher. Silakan coba lagi.' },
      { status: 500 }
    );
  }
}
