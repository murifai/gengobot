import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth';
import { prisma } from '@/lib/prisma';
import type { SectionType } from '@/lib/jlpt/types';

/**
 * GET /api/jlpt/tryout/questions?attemptId={id}&section={section}
 * Fetch questions for a specific test attempt and section
 *
 * Returns: {
 *   questions: QuestionWithDetails[];
 * }
 */
export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 });
    }

    const userId = session.user.id;
    const searchParams = request.nextUrl.searchParams;
    const attemptId = searchParams.get('attemptId');
    const section = searchParams.get('section') as SectionType;

    if (!attemptId || !section) {
      return NextResponse.json({ error: '試験IDとセクションが必要です' }, { status: 400 });
    }

    // Validate section
    const validSections: SectionType[] = ['vocabulary', 'grammar_reading', 'listening'];
    if (!validSections.includes(section)) {
      return NextResponse.json({ error: '無効なセクションです' }, { status: 400 });
    }

    // Fetch test attempt
    const attempt = await prisma.jLPTTestAttempt.findUnique({
      where: {
        id: attemptId,
      },
    });

    if (!attempt) {
      return NextResponse.json({ error: '試験が見つかりません' }, { status: 404 });
    }

    // Verify ownership
    if (attempt.userId !== userId) {
      return NextResponse.json({ error: 'アクセスが拒否されました' }, { status: 403 });
    }

    // Get question IDs from snapshot
    const snapshot = attempt.questionsSnapshot as Record<
      string,
      { mondaiNumber: number; questionIds: string[] }[]
    >;
    const sectionSnapshot = snapshot[section];

    if (!sectionSnapshot) {
      return NextResponse.json(
        { error: 'セクションのスナップショットが見つかりません' },
        { status: 404 }
      );
    }

    // Extract all question IDs from the section
    const questionIds: string[] = [];
    for (const mondai of sectionSnapshot) {
      questionIds.push(...mondai.questionIds);
    }

    // Fetch all questions with their answer choices and passages
    const questions = await prisma.jLPTQuestion.findMany({
      where: {
        id: {
          in: questionIds,
        },
      },
      include: {
        answerChoices: {
          orderBy: {
            choiceNumber: 'asc',
          },
        },
        passage: true,
      },
    });

    // Sort questions according to the snapshot order
    const sortedQuestions = questionIds
      .map(id => questions.find(q => q.id === id))
      .filter(q => q !== undefined);

    return NextResponse.json({
      questions: sortedQuestions,
    });
  } catch (error) {
    console.error('Error fetching questions:', error);
    return NextResponse.json({ error: '問題の取得中にエラーが発生しました' }, { status: 500 });
  }
}
