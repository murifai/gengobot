import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/jlpt/tryout/attempt/[attemptId]
 * Fetch test attempt details for resuming
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ attemptId: string }> }
) {
  try {
    const { attemptId } = await params;
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 });
    }

    const userId = session.user.id;

    // Fetch test attempt with section submissions
    const attempt = await prisma.jLPTTestAttempt.findUnique({
      where: { id: attemptId },
      include: {
        sectionSubmissions: {
          select: {
            sectionType: true,
            submittedAt: true,
          },
        },
      },
    });

    if (!attempt) {
      return NextResponse.json({ error: '試験が見つかりません' }, { status: 404 });
    }

    // Verify ownership
    if (attempt.userId !== userId) {
      return NextResponse.json({ error: 'アクセスが拒否されました' }, { status: 403 });
    }

    return NextResponse.json({
      id: attempt.id,
      level: attempt.level,
      shuffleSeed: attempt.shuffleSeed,
      questionsSnapshot: attempt.questionsSnapshot,
      status: attempt.status,
      startedAt: attempt.startedAt,
      sectionSubmissions: attempt.sectionSubmissions,
    });
  } catch (error) {
    console.error('Error fetching test attempt:', error);
    return NextResponse.json(
      { error: '試験情報の取得中にエラーが発生しました' },
      { status: 500 }
    );
  }
}
