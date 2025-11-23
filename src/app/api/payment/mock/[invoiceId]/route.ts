import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth';
import { prisma } from '@/lib/prisma';

interface RouteParams {
  params: Promise<{ invoiceId: string }>;
}

/**
 * GET /api/payment/mock/[invoiceId]
 * Get mock invoice details
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { invoiceId } = await params;

    // Get mock invoice from database
    const mockInvoice = await prisma.mockInvoice.findUnique({
      where: { invoiceId },
    });

    if (!mockInvoice) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
    }

    return NextResponse.json({ invoice: mockInvoice.data });
  } catch (error) {
    console.error('Error fetching mock invoice:', error);
    return NextResponse.json({ error: 'Failed to fetch invoice' }, { status: 500 });
  }
}
