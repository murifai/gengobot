import { NextRequest, NextResponse } from 'next/server';
import { trialService } from '@/lib/subscription/trial-service';

// Verify cron secret to ensure request is from Vercel Cron
function verifyCronSecret(request: NextRequest): boolean {
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;

  // If no CRON_SECRET is set, allow in development
  if (!cronSecret && process.env.NODE_ENV === 'development') {
    return true;
  }

  if (!cronSecret) {
    console.error('CRON_SECRET environment variable not set');
    return false;
  }

  return authHeader === `Bearer ${cronSecret}`;
}

// GET /api/cron/trial-expiry
// This cron job processes expired trials and updates their status
// Should be scheduled to run daily (e.g., at 01:00)
export async function GET(request: NextRequest) {
  try {
    // Verify the request is from Vercel Cron
    if (!verifyCronSecret(request)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Process expired trials
    const result = await trialService.processExpiredTrials();

    // Get trials expiring soon (for notification purposes)
    // This can be used to trigger email notifications
    const expiringSoon = {
      in1Day: await trialService.getExpiringTrials(1),
      in3Days: await trialService.getExpiringTrials(3),
    };

    return NextResponse.json({
      success: true,
      message: `Processed ${result.processed} expired trials`,
      processed: result.processed,
      timestamp: result.timestamp.toISOString(),
      expiringSoon: {
        in1Day: expiringSoon.in1Day.length,
        in3Days: expiringSoon.in3Days.length,
      },
    });
  } catch (error) {
    console.error('Error in trial-expiry cron:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to process expired trials',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// Also support POST for manual triggering in development
export async function POST(request: NextRequest) {
  // Only allow POST in development
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
  }

  return GET(request);
}
