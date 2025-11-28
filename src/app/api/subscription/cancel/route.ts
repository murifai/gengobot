import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth';
import {
  cancelSubscription,
  reactivateSubscription,
  getCancellationStatus,
} from '@/lib/subscription/tier-change-service';

/**
 * POST /api/subscription/cancel
 * Cancel subscription - schedule downgrade to FREE tier at period end
 */
export async function POST() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const result = await cancelSubscription(session.user.id);

    if (!result.success) {
      return NextResponse.json({ error: result.message }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      message: result.message,
      cancelDate: result.cancelDate,
    });
  } catch (error) {
    console.error('Error canceling subscription:', error);
    return NextResponse.json({ error: 'Gagal membatalkan langganan' }, { status: 500 });
  }
}

/**
 * DELETE /api/subscription/cancel
 * Reactivate subscription - undo scheduled cancellation
 */
export async function DELETE() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const result = await reactivateSubscription(session.user.id);

    if (!result.success) {
      return NextResponse.json({ error: result.message }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      message: result.message,
    });
  } catch (error) {
    console.error('Error reactivating subscription:', error);
    return NextResponse.json({ error: 'Gagal mengaktifkan kembali langganan' }, { status: 500 });
  }
}

/**
 * GET /api/subscription/cancel
 * Get cancellation status
 */
export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const status = await getCancellationStatus(session.user.id);

    return NextResponse.json(status);
  } catch (error) {
    console.error('Error getting cancellation status:', error);
    return NextResponse.json({ error: 'Gagal mendapatkan status pembatalan' }, { status: 500 });
  }
}
