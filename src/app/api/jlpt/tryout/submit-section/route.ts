import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth';
import { prisma } from '@/lib/prisma';
import type { SectionType } from '@/lib/jlpt/types';

/**
 * POST /api/jlpt/tryout/submit-section
 * Submit a section and lock it (no going back)
 *
 * Body: {
 *   attemptId: string;
 *   sectionType: 'vocabulary' | 'grammar_reading' | 'listening';
 *   timeSpentSeconds: number;
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
    const { attemptId, sectionType, timeSpentSeconds } = body;

    if (!attemptId || !sectionType) {
      return NextResponse.json({ error: '無効なリクエストデータです' }, { status: 400 });
    }

    // Validate section type
    const validSections: SectionType[] = ['vocabulary', 'grammar_reading', 'listening'];
    if (!validSections.includes(sectionType as SectionType)) {
      return NextResponse.json({ error: '無効なセクションタイプです' }, { status: 400 });
    }

    // Verify test attempt ownership
    const attempt = await prisma.jLPTTestAttempt.findUnique({
      where: { id: attemptId },
      select: {
        userId: true,
        status: true,
      },
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

    // Check if section already submitted
    const existingSubmission = await prisma.jLPTSectionSubmission.findFirst({
      where: {
        testAttemptId: attemptId,
        sectionType: sectionType as SectionType,
      },
    });

    if (existingSubmission) {
      return NextResponse.json({ error: 'このセクションは既に提出されています' }, { status: 400 });
    }

    // Create section submission record
    const submission = await prisma.jLPTSectionSubmission.create({
      data: {
        testAttemptId: attemptId,
        sectionType: sectionType as SectionType,
        timeSpentSeconds: timeSpentSeconds || 0,
        submittedAt: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      submission: {
        id: submission.id,
        sectionType: submission.sectionType,
        submittedAt: submission.submittedAt,
        timeSpentSeconds: submission.timeSpentSeconds,
      },
    });
  } catch (error) {
    console.error('Error submitting section:', error);
    return NextResponse.json(
      { error: 'セクションの提出中にエラーが発生しました' },
      { status: 500 }
    );
  }
}
