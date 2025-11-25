import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAdminSession } from '@/lib/auth/admin-auth';
import { CREDIT_CONVERSION_RATE } from '@/lib/subscription/credit-config';

// USD to IDR conversion rate
const USD_TO_IDR = 15500;

export async function GET() {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const [totalUsage, thisMonthUsage, lastMonthUsage, usageByType, dailyUsage, topUsers] =
      await Promise.all([
        // Total credits used (all time)
        prisma.creditTransaction.aggregate({
          _sum: { amount: true },
          _count: true,
          where: { type: 'USAGE' },
        }),

        // This month's usage
        prisma.creditTransaction.aggregate({
          _sum: { amount: true },
          _count: true,
          where: {
            type: 'USAGE',
            createdAt: { gte: startOfMonth },
          },
        }),

        // Last month's usage
        prisma.creditTransaction.aggregate({
          _sum: { amount: true },
          _count: true,
          where: {
            type: 'USAGE',
            createdAt: { gte: startOfLastMonth, lt: startOfMonth },
          },
        }),

        // By usage type
        prisma.creditTransaction.groupBy({
          by: ['usageType'],
          _sum: { amount: true },
          _count: true,
          where: { type: 'USAGE' },
        }),

        // Daily usage (last 30 days) - fetch raw data and aggregate in JS
        prisma.creditTransaction.findMany({
          where: {
            type: 'USAGE',
            createdAt: { gte: thirtyDaysAgo },
          },
          select: {
            amount: true,
            createdAt: true,
          },
          orderBy: { createdAt: 'asc' },
        }),

        // Top 10 users by usage
        prisma.creditTransaction.groupBy({
          by: ['userId'],
          _sum: { amount: true },
          _count: true,
          where: { type: 'USAGE' },
          orderBy: { _sum: { amount: 'asc' } }, // Negative values, so asc = most usage
          take: 10,
        }),
      ]);

    // Get user details for top users
    const userIds = topUsers.map(u => u.userId);
    const users = await prisma.user.findMany({
      where: { id: { in: userIds } },
      select: {
        id: true,
        name: true,
        email: true,
      },
    });
    const userMap = new Map(users.map(u => [u.id, u]));

    // Calculate totals
    const totalCredits = Math.abs(totalUsage._sum.amount || 0);
    const thisMonthCredits = Math.abs(thisMonthUsage._sum.amount || 0);
    const lastMonthCredits = Math.abs(lastMonthUsage._sum.amount || 0);

    // Calculate growth
    const growth =
      lastMonthCredits > 0
        ? ((thisMonthCredits - lastMonthCredits) / lastMonthCredits) * 100
        : thisMonthCredits > 0
          ? 100
          : 0;

    // Aggregate daily usage
    const dailyMap = new Map<string, { credits: number; transactions: number }>();
    dailyUsage.forEach(tx => {
      const date = tx.createdAt.toISOString().substring(0, 10); // YYYY-MM-DD
      const existing = dailyMap.get(date) || { credits: 0, transactions: 0 };
      dailyMap.set(date, {
        credits: existing.credits + Math.abs(tx.amount),
        transactions: existing.transactions + 1,
      });
    });

    const dailyUsageArray = Array.from(dailyMap.entries())
      .map(([date, data]) => ({
        date,
        credits: data.credits,
        transactions: data.transactions,
        costUSD: data.credits * CREDIT_CONVERSION_RATE,
        costIDR: Math.round(data.credits * CREDIT_CONVERSION_RATE * USD_TO_IDR),
      }))
      .sort((a, b) => a.date.localeCompare(b.date));

    return NextResponse.json({
      summary: {
        totalCredits,
        totalTransactions: totalUsage._count || 0,
        totalCostUSD: totalCredits * CREDIT_CONVERSION_RATE,
        totalCostIDR: Math.round(totalCredits * CREDIT_CONVERSION_RATE * USD_TO_IDR),
        thisMonth: {
          credits: thisMonthCredits,
          transactions: thisMonthUsage._count || 0,
          costUSD: thisMonthCredits * CREDIT_CONVERSION_RATE,
          costIDR: Math.round(thisMonthCredits * CREDIT_CONVERSION_RATE * USD_TO_IDR),
        },
        lastMonth: {
          credits: lastMonthCredits,
          transactions: lastMonthUsage._count || 0,
          costUSD: lastMonthCredits * CREDIT_CONVERSION_RATE,
          costIDR: Math.round(lastMonthCredits * CREDIT_CONVERSION_RATE * USD_TO_IDR),
        },
        growth: parseFloat(growth.toFixed(1)),
      },
      byType: usageByType.map(item => {
        const credits = Math.abs(item._sum.amount || 0);
        return {
          type: item.usageType,
          credits,
          costUSD: credits * CREDIT_CONVERSION_RATE,
          costIDR: Math.round(credits * CREDIT_CONVERSION_RATE * USD_TO_IDR),
          transactions: item._count,
        };
      }),
      dailyUsage: dailyUsageArray,
      topUsers: topUsers.map(u => {
        const credits = Math.abs(u._sum.amount || 0);
        const user = userMap.get(u.userId);
        return {
          userId: u.userId,
          userName: user?.name || user?.email || 'Unknown',
          credits,
          costUSD: credits * CREDIT_CONVERSION_RATE,
          costIDR: Math.round(credits * CREDIT_CONVERSION_RATE * USD_TO_IDR),
          transactions: u._count,
        };
      }),
    });
  } catch (error) {
    console.error('Token usage analytics error:', error);
    return NextResponse.json({ error: 'Failed to fetch token usage analytics' }, { status: 500 });
  }
}
