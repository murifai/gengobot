import { NextRequest, NextResponse } from 'next/server';
import { midtransService } from '@/lib/payment';
import { MidtransNotification } from '@/lib/payment/midtrans-types';

/**
 * POST /api/webhooks/midtrans
 * Handle Midtrans webhook notifications
 */
export async function POST(request: NextRequest) {
  try {
    const notification: MidtransNotification = await request.json();

    console.log('[Midtrans Webhook] Received notification:', {
      transaction_id: notification.transaction_id,
      order_id: notification.order_id,
      transaction_status: notification.transaction_status,
      gross_amount: notification.gross_amount,
      payment_type: notification.payment_type,
    });

    // Process notification
    await midtransService.handleNotification(notification);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[Midtrans Webhook] Error processing notification:', error);

    // Return 200 for signature errors to prevent Midtrans from retrying
    if (error instanceof Error && error.message === 'Invalid signature') {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 200 });
    }

    return NextResponse.json({ error: 'Failed to process notification' }, { status: 500 });
  }
}
