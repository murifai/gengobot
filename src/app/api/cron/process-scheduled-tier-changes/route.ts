import { NextRequest, NextResponse } from 'next/server';
import { processScheduledTierChanges } from '@/lib/subscription/tier-change-service';

/**
 * GET /api/cron/process-scheduled-tier-changes
 * Cron job to process scheduled tier changes (downgrades)
 * Should be called daily via Vercel Cron or similar service
 *
 * Expected authorization: Bearer {CRON_SECRET}
 */
export async function GET(request: NextRequest) {
  try {
    // Verify cron secret for security
    const authHeader = request.headers.get('authorization');
    const expectedAuth = `Bearer ${process.env.CRON_SECRET}`;

    if (!process.env.CRON_SECRET) {
      console.warn('[Cron] CRON_SECRET not configured');
      // Allow in development for testing
      if (process.env.NODE_ENV === 'production') {
        return NextResponse.json({ error: 'Cron not configured' }, { status: 500 });
      }
    } else if (authHeader !== expectedAuth) {
      console.error('[Cron] Unauthorized cron request');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('[Cron] Processing scheduled tier changes...');

    const processedCount = await processScheduledTierChanges();

    console.log(`[Cron] Processed ${processedCount} scheduled tier changes`);

    return NextResponse.json({
      success: true,
      processed: processedCount,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('[Cron] Error processing scheduled tier changes:', error);
    return NextResponse.json(
      { error: 'Failed to process scheduled tier changes' },
      { status: 500 }
    );
  }
}

// Vercel Cron configuration
export const dynamic = 'force-dynamic';
export const maxDuration = 60; // 60 seconds max execution time
