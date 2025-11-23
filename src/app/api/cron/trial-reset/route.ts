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

// GET /api/cron/trial-reset
// This cron job resets daily trial usage for all trial users
// Should be scheduled to run at midnight (00:00) daily
export async function GET(request: NextRequest) {
  try {
    // Verify the request is from Vercel Cron
    if (!verifyCronSecret(request)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const result = await trialService.resetDailyUsage();

    return NextResponse.json({
      success: true,
      message: `Reset daily usage for ${result.count} trial users`,
      count: result.count,
      timestamp: result.timestamp.toISOString(),
    });
  } catch (error) {
    console.error('Error in trial-reset cron:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to reset daily trial usage',
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
