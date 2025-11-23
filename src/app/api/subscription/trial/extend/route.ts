import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth';
import { trialService } from '@/lib/subscription/trial-service';

// POST /api/subscription/trial/extend - Extend trial period
// This endpoint is typically called when applying a voucher
export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { additionalDays } = body;

    if (!additionalDays || typeof additionalDays !== 'number' || additionalDays <= 0) {
      return NextResponse.json({ error: 'Invalid additionalDays parameter' }, { status: 400 });
    }

    // Limit maximum extension to 30 days
    if (additionalDays > 30) {
      return NextResponse.json({ error: 'Maximum extension is 30 days' }, { status: 400 });
    }

    const result = await trialService.extendTrial(session.user.id, additionalDays);

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error extending trial:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
