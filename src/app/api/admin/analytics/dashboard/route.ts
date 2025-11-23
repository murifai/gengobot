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
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    // Parallel queries for performance
    const [
      totalUsers,
      activeUsers,
      newUsersThisMonth,
      subscriptionsByTier,
      recentSubscribers,
      usersByLevel,
      usersByDomicile,
      totalRevenue,
      monthlyRevenue,
    ] = await Promise.all([
      // Total users
      prisma.user.count(),

      // Active users (had activity in last 30 days)
      prisma.user.count({
        where: {
          OR: [
            { updatedAt: { gte: thirtyDaysAgo } },
            { taskAttempts: { some: { startTime: { gte: thirtyDaysAgo } } } },
            { studySessions: { some: { startTime: { gte: thirtyDaysAgo } } } },
          ],
        },
      }),

      // New users this month
      prisma.user.count({
        where: {
          createdAt: { gte: startOfMonth },
        },
      }),

      // Subscriptions by tier
      prisma.subscription.groupBy({
        by: ['tier'],
        _count: { id: true },
        where: { status: 'ACTIVE' },
      }),

      // Recent subscribers (last 10)
      prisma.subscription.findMany({
        where: {
          tier: { not: 'FREE' },
          status: 'ACTIVE',
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: 10,
      }),

      // Users by proficiency level
      prisma.user.groupBy({
        by: ['proficiency'],
        _count: { id: true },
      }),

      // Users by domicile (top 10)
      prisma.user.groupBy({
        by: ['domicile'],
        _count: { id: true },
        where: {
          domicile: { not: null },
        },
        orderBy: {
          _count: { id: 'desc' },
        },
        take: 10,
      }),

      // Total revenue (sum of all successful payments)
      prisma.pendingPayment.aggregate({
        _sum: { amount: true },
        where: { status: 'PAID' },
      }),

      // Monthly revenue
      prisma.pendingPayment.aggregate({
        _sum: { amount: true },
        where: {
          status: 'PAID',
          createdAt: { gte: startOfMonth },
        },
      }),
    ]);

    // Transform subscriptions by tier
    const subscribersByTier = {
      FREE: 0,
      BASIC: 0,
      PRO: 0,
    };
    subscriptionsByTier.forEach(sub => {
      subscribersByTier[sub.tier] = sub._count.id;
    });

    // Transform users by level
    const levelDistribution = usersByLevel.map(item => ({
      level: item.proficiency,
      count: item._count.id,
    }));

    // Transform users by domicile
    const domicileDistribution = usersByDomicile.map(item => ({
      domicile: item.domicile || 'Unknown',
      count: item._count.id,
    }));

    // Calculate earnings metrics
    const totalRevenueAmount = totalRevenue._sum.amount || 0;
    const monthlyRevenueAmount = monthlyRevenue._sum.amount || 0;

    // Get API usage data (placeholder - needs actual implementation based on your tracking)
    const apiUsage = {
      current: 0,
      limit: 100000,
      percentage: 0,
      costInRupiah: 0,
    };

    return NextResponse.json({
      overview: {
        totalUsers,
        activeUsers,
        newUsersThisMonth,
      },
      subscribers: {
        byTier: subscribersByTier,
        total: subscribersByTier.FREE + subscribersByTier.BASIC + subscribersByTier.PRO,
        paid: subscribersByTier.BASIC + subscribersByTier.PRO,
      },
      recentSubscribers: recentSubscribers.map(sub => ({
        id: sub.id,
        tier: sub.tier,
        createdAt: sub.createdAt,
        user: sub.user,
      })),
      userAnalytics: {
        byLevel: levelDistribution,
        byDomicile: domicileDistribution,
      },
      earnings: {
        totalRevenue: totalRevenueAmount,
        monthlyRevenue: monthlyRevenueAmount,
        profit: Math.round(totalRevenueAmount * 0.7), // Estimated 70% profit margin
        expenses: Math.round(totalRevenueAmount * 0.3), // Estimated 30% expenses
      },
      apiUsage,
    });
  } catch (error) {
    console.error('Dashboard analytics error:', error);
    return NextResponse.json({ error: 'Failed to fetch dashboard analytics' }, { status: 500 });
  }
}
