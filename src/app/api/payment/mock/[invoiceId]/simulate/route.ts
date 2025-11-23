import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth';
import { midtransService } from '@/lib/payment';
import { prisma } from '@/lib/prisma';

interface RouteParams {
  params: Promise<{ invoiceId: string }>;
}

/**
 * POST /api/payment/mock/[invoiceId]/simulate
 * Simulate payment status for testing
 */
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Only allow in mock mode
    if (!midtransService.isMockMode()) {
      return NextResponse.json(
        { error: 'Simulation only available in mock mode' },
        { status: 400 }
      );
    }

    const { invoiceId } = await params;
    const body = await request.json();
    const { status } = body;

    // Map status to Midtrans format
    const statusMap: Record<string, 'settlement' | 'expire' | 'cancel'> = {
      PAID: 'settlement',
      EXPIRED: 'expire',
      FAILED: 'cancel',
      settlement: 'settlement',
      expire: 'expire',
      cancel: 'cancel',
    };

    const midtransStatus = statusMap[status];

    if (!midtransStatus) {
      return NextResponse.json(
        { error: 'Invalid status. Must be settlement, expire, or cancel' },
        { status: 400 }
      );
    }

    // Get the orderId from invoiceId (token)
    const mockInvoice = await prisma.mockInvoice.findUnique({
      where: { invoiceId },
    });

    if (!mockInvoice) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
    }

    await midtransService.simulatePayment(mockInvoice.externalId, midtransStatus);

    return NextResponse.json({ success: true, status: midtransStatus });
  } catch (error) {
    console.error('Error simulating payment:', error);
    const message = error instanceof Error ? error.message : 'Failed to simulate payment';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
