import { NextRequest, NextResponse } from 'next/server';
import { midtransService } from '@/lib/payment';
import { MidtransNotification } from '@/lib/payment/midtrans-types';

/**
 * POST /api/webhooks/midtrans
 * Handle Midtrans webhook notifications
 */
export async function POST(request: NextRequest) {
  const startTime = Date.now();

  try {
    // Log raw request info for debugging
    const rawBody = await request.text();
    console.log('[Midtrans Webhook] Raw request body:', rawBody);

    const notification: MidtransNotification = JSON.parse(rawBody);

    // Get environment info
    const envInfo = midtransService.getEnvironmentInfo();

    console.log('[Midtrans Webhook] Received notification:', {
      transaction_id: notification.transaction_id,
      order_id: notification.order_id,
      transaction_status: notification.transaction_status,
      fraud_status: notification.fraud_status,
      gross_amount: notification.gross_amount,
      payment_type: notification.payment_type,
      status_code: notification.status_code,
      status_message: notification.status_message,
      signature_key: notification.signature_key?.substring(0, 20) + '...',
      environment: envInfo,
    });

    // Process notification
    await midtransService.handleNotification(notification);

    const duration = Date.now() - startTime;
    console.log('[Midtrans Webhook] Notification processed successfully:', {
      order_id: notification.order_id,
      duration_ms: duration,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    const duration = Date.now() - startTime;
    console.error('[Midtrans Webhook] Error processing notification:', {
      error: error instanceof Error ? error.message : error,
      stack: error instanceof Error ? error.stack : undefined,
      duration_ms: duration,
    });

    // Return 200 for signature errors to prevent Midtrans from retrying
    if (error instanceof Error && error.message === 'Invalid signature') {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 200 });
    }

    return NextResponse.json({ error: 'Failed to process notification' }, { status: 500 });
  }
}
