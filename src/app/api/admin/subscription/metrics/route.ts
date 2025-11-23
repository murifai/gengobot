import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth';
import { prisma } from '@/lib/prisma';
import { voucherAdminService } from '@/lib/admin';
import { SubscriptionTier } from '@prisma/client';

/**
 * GET /api/admin/subscription/metrics
 * Get subscription and voucher metrics for admin dashboard
 */
export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check admin role
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { isAdmin: true },
    });

    if (!user?.isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Get date ranges
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    // Fetch all metrics in parallel
    const [totalUsers, usersByTier, trialUsers, totalRevenue, monthlyRevenue, voucherAnalytics] =
      await Promise.all([
        // Total users
        prisma.user.count(),

        // Users by tier
        prisma.subscription.groupBy({
          by: ['tier'],
          _count: { tier: true },
        }),

        // Trial users (FREE tier with active trial)
        prisma.subscription.count({
          where: {
            tier: SubscriptionTier.FREE,
            trialEndDate: { gte: now },
          },
        }),

        // Total revenue (from paid payments)
        prisma.pendingPayment.aggregate({
          where: { status: 'PAID' },
          _sum: { amount: true },
        }),

        // Monthly revenue
        prisma.pendingPayment.aggregate({
          where: {
            status: 'PAID',
            paidAt: { gte: startOfMonth },
          },
          _sum: { amount: true },
        }),

        // Voucher analytics
        voucherAdminService.getOverallAnalytics(),
      ]);

    // Process users by tier
    const tierCounts = {
      FREE: 0,
      BASIC: 0,
      PRO: 0,
    };

    usersByTier.forEach(item => {
      tierCounts[item.tier] = item._count.tier;
    });

    return NextResponse.json({
      // User metrics
      totalUsers,
      usersByTier: tierCounts,
      trialUsers,

      // Revenue metrics
      totalRevenue: totalRevenue._sum.amount || 0,
      monthlyRevenue: monthlyRevenue._sum.amount || 0,

      // Voucher metrics
      totalVouchers: voucherAnalytics.totalVouchers,
      activeVouchers: voucherAnalytics.activeVouchers,
      totalRedemptions: voucherAnalytics.totalRedemptions,
      totalDiscountGiven: voucherAnalytics.totalDiscountGiven,
      topVouchers: voucherAnalytics.topVouchers,
    });
  } catch (error) {
    console.error('Error fetching subscription metrics:', error);
    return NextResponse.json({ error: 'Failed to fetch metrics' }, { status: 500 });
  }
}
