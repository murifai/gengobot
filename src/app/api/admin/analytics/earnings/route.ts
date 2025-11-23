import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAdminSession } from '@/lib/auth/admin-auth';

export async function GET() {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

    const [
      totalRevenue,
      monthlyRevenue,
      lastMonthRevenue,
      paymentsForMonthly,
      subscriptionsByTier,
      recentPayments,
      totalPayments,
      completedPayments,
    ] = await Promise.all([
      // Total revenue
      prisma.pendingPayment.aggregate({
        _sum: { amount: true },
        where: { status: 'PAID' },
      }),

      // This month's revenue
      prisma.pendingPayment.aggregate({
        _sum: { amount: true },
        where: {
          status: 'PAID',
          createdAt: { gte: startOfMonth },
        },
      }),

      // Last month's revenue
      prisma.pendingPayment.aggregate({
        _sum: { amount: true },
        where: {
          status: 'PAID',
          createdAt: {
            gte: startOfLastMonth,
            lte: endOfLastMonth,
          },
        },
      }),

      // Revenue by month (last 12 months) - using Prisma for compatibility
      prisma.pendingPayment.findMany({
        where: {
          status: 'PAID',
          createdAt: {
            gte: new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000),
          },
        },
        select: {
          amount: true,
          createdAt: true,
        },
        orderBy: { createdAt: 'desc' },
      }),

      // Subscriptions by tier
      prisma.subscription.groupBy({
        by: ['tier'],
        _count: { id: true },
        where: { status: 'ACTIVE' },
      }),

      // Recent payments
      prisma.pendingPayment.findMany({
        where: { status: 'PAID' },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: 50,
      }),

      // Total payment count
      prisma.pendingPayment.count(),

      // Completed payment count
      prisma.pendingPayment.count({
        where: { status: 'PAID' },
      }),
    ]);

    // Calculate growth
    const currentMonthAmount = monthlyRevenue._sum.amount || 0;
    const lastMonthAmount = lastMonthRevenue._sum.amount || 0;
    const growth =
      lastMonthAmount > 0 ? ((currentMonthAmount - lastMonthAmount) / lastMonthAmount) * 100 : 0;

    // Transform subscriptions by tier
    const tierCounts = {
      FREE: 0,
      BASIC: 0,
      PRO: 0,
    };
    subscriptionsByTier.forEach(sub => {
      tierCounts[sub.tier] = sub._count.id;
    });

    // Calculate estimated API costs (placeholder - needs real calculation)
    const estimatedAPICost = Math.round((totalRevenue._sum.amount || 0) * 0.15);

    // Group payments by month
    const monthlyData = new Map<string, number>();
    paymentsForMonthly.forEach(payment => {
      const month = payment.createdAt.toISOString().substring(0, 7); // YYYY-MM
      monthlyData.set(month, (monthlyData.get(month) || 0) + payment.amount);
    });
    const byMonthArray = Array.from(monthlyData.entries())
      .map(([month, total]) => ({ month, total }))
      .sort((a, b) => b.month.localeCompare(a.month));

    return NextResponse.json({
      revenue: {
        total: totalRevenue._sum.amount || 0,
        thisMonth: currentMonthAmount,
        lastMonth: lastMonthAmount,
        growth: parseFloat(growth.toFixed(1)),
        byMonth: byMonthArray,
      },
      expenses: {
        total: estimatedAPICost,
        apiUsage: estimatedAPICost,
      },
      profit: {
        total: (totalRevenue._sum.amount || 0) - estimatedAPICost,
        margin: totalRevenue._sum.amount
          ? (
              ((totalRevenue._sum.amount - estimatedAPICost) / totalRevenue._sum.amount) *
              100
            ).toFixed(1)
          : '0',
      },
      subscriptions: {
        byTier: tierCounts,
        total: tierCounts.FREE + tierCounts.BASIC + tierCounts.PRO,
        paid: tierCounts.BASIC + tierCounts.PRO,
        conversionRate:
          tierCounts.FREE + tierCounts.BASIC + tierCounts.PRO > 0
            ? (
                ((tierCounts.BASIC + tierCounts.PRO) /
                  (tierCounts.FREE + tierCounts.BASIC + tierCounts.PRO)) *
                100
              ).toFixed(1)
            : '0',
      },
      payments: {
        total: totalPayments,
        completed: completedPayments,
        recent: recentPayments.map(payment => ({
          id: payment.id,
          amount: payment.amount,
          status: payment.status,
          plan: payment.tier,
          billingCycle: `${payment.durationMonths} month${payment.durationMonths > 1 ? 's' : ''}`,
          createdAt: payment.createdAt,
          user: payment.user,
        })),
      },
    });
  } catch (error) {
    console.error('Earnings analytics error:', error);
    return NextResponse.json({ error: 'Failed to fetch earnings analytics' }, { status: 500 });
  }
}
