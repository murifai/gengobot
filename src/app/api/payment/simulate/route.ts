import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth';
import { midtransService } from '@/lib/payment';

/**
 * POST /api/payment/simulate
 * Simulate payment completion (mock mode only)
 * This is for testing purposes only
 */
export async function POST(request: NextRequest) {
  try {
    // Only allow in development or when mock mode is enabled
    if (!midtransService.isMockMode()) {
      return NextResponse.json(
        { error: 'Simulation only available in mock mode' },
        { status: 400 }
      );
    }

    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { orderId, status } = body;

    if (!orderId) {
      return NextResponse.json({ error: 'Order ID is required' }, { status: 400 });
    }

    // Midtrans uses lowercase status names
    const validStatuses = ['settlement', 'expire', 'cancel'];
    const normalizedStatus = status.toLowerCase();

    if (!normalizedStatus || !validStatuses.includes(normalizedStatus)) {
      return NextResponse.json(
        { error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` },
        { status: 400 }
      );
    }

    await midtransService.simulatePayment(
      orderId,
      normalizedStatus as 'settlement' | 'expire' | 'cancel'
    );

    return NextResponse.json({
      success: true,
      message: `Payment simulated with status: ${normalizedStatus}`,
    });
  } catch (error) {
    console.error('Error simulating payment:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to simulate payment' },
      { status: 500 }
    );
  }
}
