import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth';
import { trialService } from '@/lib/subscription/trial-service';

// POST /api/subscription/free - Create free subscription (no trial credits)
export async function POST() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const subscription = await trialService.createFreeSubscription(session.user.id);

    return NextResponse.json({
      success: true,
      subscription: {
        id: subscription.id,
        tier: subscription.tier,
        status: subscription.status,
      },
    });
  } catch (error) {
    console.error('Error creating free subscription:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
