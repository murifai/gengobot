import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth';
import { prisma } from '@/lib/prisma';
import { TIER_PRICING } from '@/lib/subscription/credit-config';

/**
 * GET /api/payment/latest
 * Get user's latest successful payment for invoice generation
 */
export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get the latest paid payment
    const payment = await prisma.pendingPayment.findFirst({
      where: {
        userId: session.user.id,
        status: 'PAID',
      },
      orderBy: { paidAt: 'desc' },
    });

    if (!payment) {
      return NextResponse.json({ payment: null });
    }

    // Calculate original amount from tier pricing
    const originalAmount = TIER_PRICING[payment.tier] * payment.durationMonths;
    const discountAmount = originalAmount - payment.amount;

    // Generate invoice number from payment ID
    const invoiceNumber = `INV-${payment.paidAt?.getFullYear() || new Date().getFullYear()}-${payment.id.substring(0, 8).toUpperCase()}`;

    return NextResponse.json({
      payment: {
        invoiceNumber,
        orderId: payment.externalId,
        date: payment.paidAt || payment.createdAt,
        customerName: session.user.name || 'User',
        customerEmail: session.user.email || '',
        tier: payment.tier,
        durationMonths: payment.durationMonths,
        originalAmount,
        discountAmount,
        finalAmount: payment.amount,
        paymentMethod: payment.paymentMethod,
        paymentChannel: payment.paymentChannel,
        status: payment.status,
      },
    });
  } catch (error) {
    console.error('Error fetching latest payment:', error);
    return NextResponse.json({ error: 'Failed to fetch payment' }, { status: 500 });
  }
}
