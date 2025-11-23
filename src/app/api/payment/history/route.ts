import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/payment/history
 * Get user's payment history
 */
export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payments = await prisma.pendingPayment.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: 'desc' },
      take: 20,
    });

    return NextResponse.json({
      payments: payments.map(payment => ({
        id: payment.id,
        tier: payment.tier,
        durationMonths: payment.durationMonths,
        amount: payment.amount,
        status: payment.status,
        invoiceUrl: payment.invoiceUrl,
        paymentMethod: payment.paymentMethod,
        paymentChannel: payment.paymentChannel,
        paidAt: payment.paidAt,
        expiresAt: payment.expiresAt,
        createdAt: payment.createdAt,
      })),
    });
  } catch (error) {
    console.error('Error fetching payment history:', error);
    return NextResponse.json({ error: 'Failed to fetch payment history' }, { status: 500 });
  }
}
