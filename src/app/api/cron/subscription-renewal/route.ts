import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { SubscriptionStatus, SubscriptionTier } from '@prisma/client';
import { notifySubscriptionExpiring } from '@/lib/notification/notification-service';

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

/**
 * GET /api/cron/subscription-renewal
 *
 * This cron job sends renewal reminders to paid subscribers:
 * - 3 days before subscription ends
 *
 * Should be scheduled to run daily (e.g., at 09:00 WIB)
 *
 * For Indonesia market with non-recurring payments, this reminder
 * is critical as users must manually renew before expiration.
 */
export async function GET(request: NextRequest) {
  try {
    // Verify the request is from Vercel Cron
    if (!verifyCronSecret(request)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const now = new Date();

    // Find subscriptions expiring in exactly 3 days (±12 hours window)
    const threeDaysFromNow = new Date(now);
    threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);

    const threeDaysFromNowStart = new Date(threeDaysFromNow);
    threeDaysFromNowStart.setHours(0, 0, 0, 0);

    const threeDaysFromNowEnd = new Date(threeDaysFromNow);
    threeDaysFromNowEnd.setHours(23, 59, 59, 999);

    // Get paid subscriptions expiring in 3 days
    const subscriptionsExpiring3Days = await prisma.subscription.findMany({
      where: {
        tier: { in: [SubscriptionTier.BASIC, SubscriptionTier.PRO] },
        status: SubscriptionStatus.ACTIVE,
        scheduledTier: null, // Not already scheduled for downgrade/cancel
        currentPeriodEnd: {
          gte: threeDaysFromNowStart,
          lte: threeDaysFromNowEnd,
        },
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
      },
    });

    const notifications: { userId: string; success: boolean; error?: string }[] = [];

    for (const subscription of subscriptionsExpiring3Days) {
      try {
        await notifySubscriptionExpiring(
          subscription.userId,
          subscription.tier,
          subscription.currentPeriodEnd,
          subscription.creditsRemaining,
          3 // days remaining
        );

        notifications.push({
          userId: subscription.userId,
          success: true,
        });

        console.log(
          `[SubscriptionRenewal] Sent 3-day reminder to user ${subscription.userId} (${subscription.user.email})`
        );
      } catch (error) {
        console.error(`[SubscriptionRenewal] Failed to notify user ${subscription.userId}:`, error);
        notifications.push({
          userId: subscription.userId,
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }

    // Find subscriptions expiring in exactly 1 day (±12 hours window)
    const oneDayFromNow = new Date(now);
    oneDayFromNow.setDate(oneDayFromNow.getDate() + 1);

    const oneDayFromNowStart = new Date(oneDayFromNow);
    oneDayFromNowStart.setHours(0, 0, 0, 0);

    const oneDayFromNowEnd = new Date(oneDayFromNow);
    oneDayFromNowEnd.setHours(23, 59, 59, 999);

    // Get paid subscriptions expiring in 1 day (more urgent reminder)
    const subscriptionsExpiring1Day = await prisma.subscription.findMany({
      where: {
        tier: { in: [SubscriptionTier.BASIC, SubscriptionTier.PRO] },
        status: SubscriptionStatus.ACTIVE,
        scheduledTier: null,
        currentPeriodEnd: {
          gte: oneDayFromNowStart,
          lte: oneDayFromNowEnd,
        },
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
      },
    });

    for (const subscription of subscriptionsExpiring1Day) {
      try {
        await notifySubscriptionExpiring(
          subscription.userId,
          subscription.tier,
          subscription.currentPeriodEnd,
          subscription.creditsRemaining,
          1 // days remaining
        );

        notifications.push({
          userId: subscription.userId,
          success: true,
        });

        console.log(
          `[SubscriptionRenewal] Sent 1-day URGENT reminder to user ${subscription.userId} (${subscription.user.email})`
        );
      } catch (error) {
        console.error(`[SubscriptionRenewal] Failed to notify user ${subscription.userId}:`, error);
        notifications.push({
          userId: subscription.userId,
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }

    const successCount = notifications.filter(n => n.success).length;
    const failCount = notifications.filter(n => !n.success).length;

    return NextResponse.json({
      success: true,
      message: `Processed subscription renewal reminders`,
      timestamp: now.toISOString(),
      subscriptionsExpiring: {
        in3Days: subscriptionsExpiring3Days.length,
        in1Day: subscriptionsExpiring1Day.length,
      },
      notifications: {
        sent: successCount,
        failed: failCount,
      },
    });
  } catch (error) {
    console.error('[SubscriptionRenewal] Cron error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to process subscription renewals',
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
