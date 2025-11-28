import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/subscription/usage-chart
 * Get aggregated credit usage data for chart visualization
 * Groups usage by day and category (kaiwa vs drill)
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const days = parseInt(searchParams.get('days') || '30', 10);

    // Calculate date range
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    startDate.setHours(0, 0, 0, 0);

    // Fetch all usage transactions in the date range
    const transactions = await prisma.creditTransaction.findMany({
      where: {
        userId: session.user.id,
        type: 'USAGE',
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
      select: {
        amount: true,
        referenceType: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    // Group by day and category
    const dailyUsage: Record<string, { kaiwa: number; drill: number }> = {};

    // Initialize all days in range with zero values
    for (let i = 0; i < days; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      const dateKey = date.toISOString().split('T')[0];
      dailyUsage[dateKey] = { kaiwa: 0, drill: 0 };
    }

    // Aggregate transactions by day and category
    for (const tx of transactions) {
      const dateKey = tx.createdAt.toISOString().split('T')[0];
      // Credits are stored as negative for usage, so we take absolute value
      const credits = Math.abs(tx.amount);

      // Categorize based on referenceType
      // Kaiwa includes: free_conversation*, roleplay*, task_attempt* (conversation-based)
      // Drill includes: everything else (flashcard study, etc.)
      const isKaiwa =
        tx.referenceType?.startsWith('free_conversation') ||
        tx.referenceType?.startsWith('roleplay') ||
        tx.referenceType?.startsWith('task_attempt') ||
        tx.referenceType?.startsWith('kaiwa');

      if (dailyUsage[dateKey]) {
        if (isKaiwa) {
          dailyUsage[dateKey].kaiwa += credits;
        } else {
          dailyUsage[dateKey].drill += credits;
        }
      }
    }

    // Convert to array format for the chart
    const data = Object.entries(dailyUsage).map(([date, usage]) => {
      const dateObj = new Date(date);
      return {
        date,
        displayDate: dateObj.toLocaleDateString('id-ID', {
          day: 'numeric',
          month: 'short',
        }),
        kaiwa: usage.kaiwa,
        drill: usage.drill,
        total: usage.kaiwa + usage.drill,
      };
    });

    // Calculate summary stats
    const totalKaiwa = data.reduce((sum, d) => sum + d.kaiwa, 0);
    const totalDrill = data.reduce((sum, d) => sum + d.drill, 0);
    const averageDaily = Math.round((totalKaiwa + totalDrill) / days);

    return NextResponse.json({
      data,
      summary: {
        totalKaiwa,
        totalDrill,
        totalUsage: totalKaiwa + totalDrill,
        averageDaily,
        days,
      },
    });
  } catch (error) {
    console.error('Error fetching usage chart data:', error);
    return NextResponse.json({ error: 'Failed to fetch usage chart data' }, { status: 500 });
  }
}
