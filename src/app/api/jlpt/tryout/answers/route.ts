import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth';
import { prisma } from '@/lib/prisma';

/**
 * POST /api/jlpt/tryout/answers
 * Save or update user answers (auto-save)
 *
 * Body: {
 *   attemptId: string;
 *   answers: Array<{
 *     questionId: string;
 *     selectedAnswer: number | null;
 *   }>;
 * }
 */
export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 });
    }

    const userId = session.user.id;
    const body = await request.json();
    const { attemptId, answers } = body;

    if (!attemptId || !answers || !Array.isArray(answers)) {
      return NextResponse.json({ error: '無効なリクエストデータです' }, { status: 400 });
    }

    // Verify test attempt ownership
    const attempt = await prisma.jLPTTestAttempt.findUnique({
      where: { id: attemptId },
      select: { userId: true, status: true },
    });

    if (!attempt) {
      return NextResponse.json({ error: '試験が見つかりません' }, { status: 404 });
    }

    if (attempt.userId !== userId) {
      return NextResponse.json({ error: 'アクセスが拒否されました' }, { status: 403 });
    }

    if (attempt.status !== 'in_progress') {
      return NextResponse.json({ error: 'この試験は既に完了しています' }, { status: 400 });
    }

    // Upsert answers
    const upsertPromises = answers.map(answer =>
      prisma.jLPTUserAnswer.upsert({
        where: {
          testAttemptId_questionId: {
            testAttemptId: attemptId,
            questionId: answer.questionId,
          },
        },
        create: {
          testAttemptId: attemptId,
          questionId: answer.questionId,
          selectedAnswer: answer.selectedAnswer,
          answeredAt: new Date(),
        },
        update: {
          selectedAnswer: answer.selectedAnswer,
          answeredAt: new Date(),
        },
      })
    );

    await Promise.all(upsertPromises);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error saving answers:', error);
    return NextResponse.json({ error: '解答の保存中にエラーが発生しました' }, { status: 500 });
  }
}
