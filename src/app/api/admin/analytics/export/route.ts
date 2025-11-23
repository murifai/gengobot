import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAdminSession } from '@/lib/auth/admin-auth';
import {
  createExcelWorkbook,
  workbookToBuffer,
  userAnalyticsColumns,
  earningsColumns,
  practiceStatsColumns,
  deckStatsColumns,
} from '@/lib/admin/excel-export';

export async function GET(request: NextRequest) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const exportType = searchParams.get('type') || 'all';

    const sheets = [];

    // Export users data
    if (exportType === 'all' || exportType === 'users') {
      const users = await prisma.user.findMany({
        select: {
          id: true,
          name: true,
          email: true,
          proficiency: true,
          ageRange: true,
          gender: true,
          domicile: true,
          institution: true,
          learningDuration: true,
          subscriptionPlan: true,
          createdAt: true,
          updatedAt: true,
        },
        orderBy: { createdAt: 'desc' },
      });

      sheets.push({
        name: 'Users',
        columns: userAnalyticsColumns,
        data: users.map(user => ({
          ...user,
          createdAt: user.createdAt.toISOString(),
          updatedAt: user.updatedAt.toISOString(),
        })),
      });
    }

    // Export earnings data
    if (exportType === 'all' || exportType === 'earnings') {
      const payments = await prisma.pendingPayment.findMany({
        where: { status: 'PAID' },
        include: {
          user: {
            select: { email: true },
          },
        },
        orderBy: { createdAt: 'desc' },
      });

      sheets.push({
        name: 'Earnings',
        columns: earningsColumns,
        data: payments.map(payment => ({
          id: payment.id,
          userEmail: payment.user.email,
          amount: payment.amount,
          status: payment.status,
          plan: payment.tier,
          billingCycle: `${payment.durationMonths} month${payment.durationMonths > 1 ? 's' : ''}`,
          createdAt: payment.createdAt.toISOString(),
          completedAt: payment.updatedAt.toISOString(),
        })),
      });
    }

    // Export practice stats
    if (exportType === 'all' || exportType === 'practices') {
      const tasks = await prisma.task.findMany({
        select: {
          id: true,
          title: true,
          category: true,
          difficulty: true,
          averageScore: true,
          _count: {
            select: { taskAttempts: true },
          },
          taskAttempts: {
            select: {
              isCompleted: true,
              completionDuration: true,
            },
          },
        },
        orderBy: { usageCount: 'desc' },
      });

      sheets.push({
        name: 'Practice Stats',
        columns: practiceStatsColumns,
        data: tasks.map(task => {
          const completions = task.taskAttempts.filter(a => a.isCompleted).length;
          const durations = task.taskAttempts
            .filter(a => a.completionDuration)
            .map(a => a.completionDuration!);
          const avgDuration =
            durations.length > 0
              ? (durations.reduce((a, b) => a + b, 0) / durations.length / 60).toFixed(1)
              : '0';

          return {
            taskId: task.id,
            taskTitle: task.title,
            category: task.category,
            difficulty: task.difficulty,
            totalAttempts: task._count.taskAttempts,
            completions,
            avgDuration,
            avgScore: task.averageScore?.toFixed(1) || '0',
          };
        }),
      });
    }

    // Export deck stats
    if (exportType === 'all' || exportType === 'decks') {
      const decks = await prisma.deck.findMany({
        select: {
          id: true,
          name: true,
          createdBy: true,
          _count: {
            select: {
              flashcards: true,
              studySessions: true,
            },
          },
        },
        orderBy: {
          studySessions: {
            _count: 'desc',
          },
        },
      });

      sheets.push({
        name: 'Deck Stats',
        columns: deckStatsColumns,
        data: decks.map(deck => ({
          deckId: deck.id,
          deckName: deck.name,
          creatorType: deck.createdBy ? 'User' : 'Admin',
          cardCount: deck._count.flashcards,
          studySessions: deck._count.studySessions,
          totalReviews: 0, // Would need to calculate from study sessions
        })),
      });
    }

    if (sheets.length === 0) {
      return NextResponse.json({ error: 'No data to export' }, { status: 400 });
    }

    // Create workbook and convert to buffer
    const workbook = createExcelWorkbook(sheets);
    const buffer = workbookToBuffer(workbook);

    // Generate filename
    const timestamp = new Date().toISOString().split('T')[0];
    const filename = `gengobot-analytics-${exportType}-${timestamp}.xlsx`;

    // Return as downloadable file
    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error('Export error:', error);
    return NextResponse.json({ error: 'Failed to export data' }, { status: 500 });
  }
}
