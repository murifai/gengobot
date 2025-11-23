import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { CreditTransactionType, SubscriptionStatus, SubscriptionTier } from '@prisma/client';
import { TIER_CONFIG } from '@/lib/subscription/credit-config';

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

// GET /api/cron/monthly-credits
// This cron job grants monthly credits to paid subscribers whose billing period has ended
// Should be scheduled to run daily (e.g., at 02:00 UTC)
export async function GET(request: NextRequest) {
  try {
    // Verify the request is from Vercel Cron
    if (!verifyCronSecret(request)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const now = new Date();

    // Find all active paid subscriptions that need renewal
    // (currentPeriodEnd has passed)
    const subscriptionsToRenew = await prisma.subscription.findMany({
      where: {
        tier: {
          in: [SubscriptionTier.BASIC, SubscriptionTier.PRO],
        },
        status: SubscriptionStatus.ACTIVE,
        currentPeriodEnd: {
          lte: now,
        },
      },
      select: {
        id: true,
        userId: true,
        tier: true,
        creditsRemaining: true,
        currentPeriodEnd: true,
      },
    });

    if (subscriptionsToRenew.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No subscriptions to renew',
        renewed: 0,
        timestamp: now.toISOString(),
      });
    }

    // Process each subscription
    const results = {
      renewed: 0,
      failed: 0,
      details: [] as { userId: string; tier: string; credits: number }[],
    };

    for (const subscription of subscriptionsToRenew) {
      try {
        const tierConfig = TIER_CONFIG[subscription.tier];
        const creditsToGrant = tierConfig.monthlyCredits;

        // Calculate new period dates
        const newPeriodStart = new Date(subscription.currentPeriodEnd);
        const newPeriodEnd = new Date(newPeriodStart);
        newPeriodEnd.setMonth(newPeriodEnd.getMonth() + 1);

        // Update subscription with new credits and period
        // Note: We reset credits (don't rollover unused credits)
        await prisma.subscription.update({
          where: { id: subscription.id },
          data: {
            creditsTotal: creditsToGrant,
            creditsUsed: 0,
            creditsRemaining: creditsToGrant,
            currentPeriodStart: newPeriodStart,
            currentPeriodEnd: newPeriodEnd,
          },
        });

        // Record the credit grant transaction
        await prisma.creditTransaction.create({
          data: {
            userId: subscription.userId,
            type: CreditTransactionType.GRANT,
            amount: creditsToGrant,
            balance: creditsToGrant,
            description: `Monthly credit grant: ${subscription.tier} tier`,
            metadata: {
              periodStart: newPeriodStart.toISOString(),
              periodEnd: newPeriodEnd.toISOString(),
              previousRemaining: subscription.creditsRemaining,
            },
          },
        });

        results.renewed++;
        results.details.push({
          userId: subscription.userId,
          tier: subscription.tier,
          credits: creditsToGrant,
        });
      } catch (error) {
        console.error(`Failed to renew subscription ${subscription.id}:`, error);
        results.failed++;
      }
    }

    console.log(
      `[MonthlyCreditsCron] Renewed ${results.renewed} subscriptions, ${results.failed} failed at ${now.toISOString()}`
    );

    return NextResponse.json({
      success: true,
      message: `Renewed ${results.renewed} subscriptions`,
      renewed: results.renewed,
      failed: results.failed,
      timestamp: now.toISOString(),
      details: results.details,
    });
  } catch (error) {
    console.error('Error in monthly-credits cron:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to process monthly credits',
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
