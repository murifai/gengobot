import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth';
import { midtransService, AVAILABLE_PAYMENT_METHODS } from '@/lib/payment';

/**
 * GET /api/payment/methods
 * Get available payment methods
 */
export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const methods = midtransService.getAvailablePaymentMethods();

    // Group by type
    const grouped = {
      bank_transfer: methods.filter(m => m.type === 'BANK_TRANSFER'),
      ewallet: methods.filter(m => m.type === 'EWALLET'),
      retail_outlet: methods.filter(m => m.type === 'RETAIL_OUTLET'),
      qris: methods.filter(m => m.type === 'QRIS'),
      credit_card: methods.filter(m => m.type === 'CREDIT_CARD'),
    };

    return NextResponse.json({
      methods: AVAILABLE_PAYMENT_METHODS,
      grouped,
      mockMode: midtransService.isMockMode(),
    });
  } catch (error) {
    console.error('Error fetching payment methods:', error);
    return NextResponse.json({ error: 'Failed to fetch payment methods' }, { status: 500 });
  }
}
