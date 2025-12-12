import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth';
import { trialService } from '@/lib/subscription/trial-service';

// GET /api/subscription/trial/check - Check trial eligibility
export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const eligible = await trialService.isEligibleForTrial(session.user.id);

    return NextResponse.json({ eligible });
  } catch (error) {
    console.error('Error checking trial eligibility:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
