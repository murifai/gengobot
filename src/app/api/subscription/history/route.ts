import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth';
import { creditService } from '@/lib/subscription';

/**
 * GET /api/subscription/history
 * Get user's credit transaction history
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50', 10);
    const offset = parseInt(searchParams.get('offset') || '0', 10);
    const type = searchParams.get('type') || undefined;
    const startDate = searchParams.get('startDate')
      ? new Date(searchParams.get('startDate')!)
      : undefined;
    const endDate = searchParams.get('endDate')
      ? new Date(searchParams.get('endDate')!)
      : undefined;

    const history = await creditService.getHistory(session.user.id, {
      limit: Math.min(limit, 100), // Cap at 100
      offset,
      type,
      startDate,
      endDate,
    });

    return NextResponse.json({
      transactions: history,
      pagination: {
        limit,
        offset,
        hasMore: history.length === limit,
      },
    });
  } catch (error) {
    console.error('Error fetching credit history:', error);
    return NextResponse.json({ error: 'Failed to fetch credit history' }, { status: 500 });
  }
}
