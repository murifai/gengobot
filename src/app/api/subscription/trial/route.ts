import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth';
import { trialService } from '@/lib/subscription/trial-service';

// GET /api/subscription/trial - Get trial status
export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const trialStatus = await trialService.getTrialStatus(session.user.id);

    return NextResponse.json(trialStatus);
  } catch (error) {
    console.error('Error getting trial status:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/subscription/trial - Start trial for user
export async function POST() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is eligible for trial
    const isEligible = await trialService.isEligibleForTrial(session.user.id);

    if (!isEligible) {
      return NextResponse.json({ error: 'User is not eligible for trial' }, { status: 400 });
    }

    const subscription = await trialService.startTrial(session.user.id);

    return NextResponse.json({
      success: true,
      subscription: {
        id: subscription.id,
        tier: subscription.tier,
        trialStartDate: subscription.trialStartDate,
        trialEndDate: subscription.trialEndDate,
      },
    });
  } catch (error) {
    console.error('Error starting trial:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
