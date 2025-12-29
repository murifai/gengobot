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
 *   answers: Array<{
 *     questionId: string;
 *     selectedAnswer: number | null;
 *     isFlagged?: boolean;
 *   }>;
 * }
 */
interface SubmitAnswer {
  questionId: string;
  userAnswer?: string | null;
  selectedAnswer?: number | null;
  isFlagged?: boolean;
}

export async function POST(request: NextRequest) {
  let attemptId: string | undefined;
  let sectionType: string | undefined;
  let timeSpentSeconds: number | undefined;
  let answers: SubmitAnswer[] | undefined;

  try {
    // Check authentication
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 });
    }

    const userId = session.user.id;
    const body = await request.json();
    attemptId = body.attemptId;
    sectionType = body.sectionType;
    timeSpentSeconds = body.timeSpentSeconds;
    answers = body.answers;

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

    // Save answers if provided
    if (answers && Array.isArray(answers) && attemptId) {
      const upsertPromises = answers.map(answer =>
        prisma.jLPTUserAnswer.upsert({
          where: {
            testAttemptId_questionId: {
              testAttemptId: attemptId!,
              questionId: answer.questionId,
            },
          },
          create: {
            testAttemptId: attemptId!,
            questionId: answer.questionId,
            selectedAnswer: answer.selectedAnswer,
            isFlagged: answer.isFlagged ?? false,
            answeredAt: new Date(),
          },
          update: {
            selectedAnswer: answer.selectedAnswer,
            isFlagged: answer.isFlagged ?? false,
            answeredAt: new Date(),
          },
        })
      );

      await Promise.all(upsertPromises);
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

    // Check if all sections are now submitted
    const allSubmissions = await prisma.jLPTSectionSubmission.findMany({
      where: { testAttemptId: attemptId },
      select: { sectionType: true },
    });

    const submittedSections = new Set(allSubmissions.map(s => s.sectionType));
    const allSections: SectionType[] = ['vocabulary', 'grammar_reading', 'listening'];
    const allSectionsCompleted = allSections.every(s => submittedSections.has(s));

    // If all sections are completed, calculate scores and update attempt status
    if (allSectionsCompleted) {
      // Calculate scores for each section
      const allAnswers = await prisma.jLPTUserAnswer.findMany({
        where: { testAttemptId: attemptId },
        include: {
          question: {
            select: {
              sectionType: true,
              correctAnswer: true,
            },
          },
        },
      });

      // Group by section and calculate scores
      const sectionScoresData: { sectionType: string; correct: number; total: number }[] = [];
      const sections: SectionType[] = ['vocabulary', 'grammar_reading', 'listening'];

      for (const section of sections) {
        const sectionAnswers = allAnswers.filter(a => a.question.sectionType === section);
        const correctCount = sectionAnswers.filter(
          a => a.selectedAnswer === a.question.correctAnswer
        ).length;

        sectionScoresData.push({
          sectionType: section,
          correct: correctCount,
          total: sectionAnswers.length,
        });

        // Save section score
        if (sectionAnswers.length > 0) {
          const rawScore = correctCount;
          const rawMaxScore = sectionAnswers.length;
          const accuracy = correctCount / sectionAnswers.length;

          // Simplified normalized score calculation (0-60 scale)
          const normalizedScore = Math.round((correctCount / sectionAnswers.length) * 60);
          const weightedScore = normalizedScore; // For now, same as normalized

          // Section passing criteria (typically 19/60 for JLPT)
          const sectionPassed = normalizedScore >= 19;

          // Determine reference grade based on accuracy
          let referenceGrade: 'A' | 'B' | 'C';
          if (accuracy >= 0.8) {
            referenceGrade = 'A';
          } else if (accuracy >= 0.6) {
            referenceGrade = 'B';
          } else {
            referenceGrade = 'C';
          }

          await prisma.jLPTSectionScore.upsert({
            where: {
              testAttemptId_sectionType: {
                testAttemptId: attemptId,
                sectionType: section,
              },
            },
            create: {
              testAttemptId: attemptId,
              sectionType: section,
              rawScore,
              rawMaxScore,
              weightedScore,
              normalizedScore,
              isPassed: sectionPassed,
              referenceGrade,
            },
            update: {
              rawScore,
              rawMaxScore,
              weightedScore,
              normalizedScore,
              isPassed: sectionPassed,
              referenceGrade,
            },
          });
        }
      }

      // Calculate total score and pass/fail
      const totalCorrect = sectionScoresData.reduce((sum, s) => sum + s.correct, 0);
      const totalQuestions = sectionScoresData.reduce((sum, s) => sum + s.total, 0);
      const totalScore = Math.round((totalCorrect / totalQuestions) * 180);

      // JLPT N5 passing criteria: typically 80/180 (simplified)
      const isPassed = totalScore >= 80;

      // Update test attempt with scores
      await prisma.jLPTTestAttempt.update({
        where: { id: attemptId },
        data: {
          status: 'completed',
          completedAt: new Date(),
          totalScore,
          isPassed,
        },
      });

      // Mark answers as correct/incorrect
      for (const answer of allAnswers) {
        await prisma.jLPTUserAnswer.update({
          where: { id: answer.id },
          data: {
            isCorrect: answer.selectedAnswer === answer.question.correctAnswer,
          },
        });
      }
    }

    return NextResponse.json({
      success: true,
      submission: {
        id: submission.id,
        sectionType: submission.sectionType,
        submittedAt: submission.submittedAt,
        timeSpentSeconds: submission.timeSpentSeconds,
      },
      testCompleted: allSectionsCompleted,
    });
  } catch (error) {
    console.error('Error submitting section:', error);
    console.error('Error details:', {
      attemptId,
      sectionType,
      answersCount: answers?.length,
      errorMessage: error instanceof Error ? error.message : 'Unknown error',
      errorStack: error instanceof Error ? error.stack : undefined,
    });
    return NextResponse.json(
      {
        error: 'セクションの提出中にエラーが発生しました',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
