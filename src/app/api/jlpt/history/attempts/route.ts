import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import prisma from '@/lib/prisma';
import type { JLPTLevel, TestStatus } from '@/lib/jlpt/types';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const level = searchParams.get('level') as JLPTLevel | null;
    const status = searchParams.get('status') as TestStatus | null;
    const limit = parseInt(searchParams.get('limit') || '50', 10);
    const offset = parseInt(searchParams.get('offset') || '0', 10);

    // Build where clause
    const where: any = {
      userId: session.user.id,
    };

    if (level) {
      where.level = level;
    }

    if (status) {
      where.status = status;
    }

    // Fetch test attempts
    const [attempts, totalCount] = await Promise.all([
      prisma.jLPTTestAttempt.findMany({
        where,
        orderBy: {
          startedAt: 'desc',
        },
        take: limit,
        skip: offset,
        include: {
          sectionScores: {
            orderBy: {
              sectionType: 'asc',
            },
          },
        },
      }),
      prisma.jLPTTestAttempt.count({ where }),
    ]);

    // Format response
    const formattedAttempts = attempts.map((attempt) => {
      const sectionScores = attempt.sectionScores.reduce((acc, score) => {
        acc[score.sectionType] = {
          normalizedScore: score.normalizedScore,
          isPassed: score.isPassed,
          referenceGrade: score.referenceGrade,
        };
        return acc;
      }, {} as Record<string, any>);

      return {
        id: attempt.id,
        level: attempt.level,
        status: attempt.status,
        totalScore: attempt.totalScore,
        isPassed: attempt.isPassed,
        startedAt: attempt.startedAt,
        completedAt: attempt.completedAt,
        sectionScores,
      };
    });

    return NextResponse.json({
      attempts: formattedAttempts,
      totalCount,
      hasMore: offset + limit < totalCount,
    });
  } catch (error) {
    console.error('Error fetching test history:', error);
    return NextResponse.json(
      { error: 'Failed to fetch test history' },
      { status: 500 }
    );
  }
}
