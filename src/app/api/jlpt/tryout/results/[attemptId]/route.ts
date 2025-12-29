import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/jlpt/tryout/results/[attemptId]
 * Get detailed results for a completed test
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ attemptId: string }> }
) {
  try {
    // Check authentication
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 });
    }

    const userId = session.user.id;
    const { attemptId } = await params;

    // Fetch test attempt with all related data
    const attempt = await prisma.jLPTTestAttempt.findUnique({
      where: { id: attemptId },
      include: {
        sectionScores: {
          orderBy: {
            sectionType: 'asc',
          },
        },
        sectionSubmissions: {
          orderBy: {
            submittedAt: 'asc',
          },
        },
        userAnswers: {
          include: {
            question: {
              include: {
                answerChoices: {
                  orderBy: {
                    choiceNumber: 'asc',
                  },
                },
                passage: true,
              },
            },
          },
          orderBy: {
            answeredAt: 'asc',
          },
        },
      },
    });

    if (!attempt) {
      return NextResponse.json({ error: '試験が見つかりません' }, { status: 404 });
    }

    if (attempt.userId !== userId) {
      return NextResponse.json({ error: 'アクセスが拒否されました' }, { status: 403 });
    }

    if (attempt.status !== 'completed') {
      return NextResponse.json({ error: 'この試験はまだ完了していません' }, { status: 400 });
    }

    // Calculate total time spent
    const totalTimeSpent = attempt.sectionSubmissions.reduce(
      (sum, sub) => sum + (sub.timeSpentSeconds || 0),
      0
    );

    // Group answers by section and mondai
    const answersBySection = {
      vocabulary: [] as typeof attempt.userAnswers,
      grammar_reading: [] as typeof attempt.userAnswers,
      listening: [] as typeof attempt.userAnswers,
    };

    attempt.userAnswers.forEach(answer => {
      const sectionType = answer.question.sectionType as keyof typeof answersBySection;
      if (sectionType in answersBySection) {
        answersBySection[sectionType].push(answer);
      }
    });

    // Format response
    const results = {
      attempt: {
        id: attempt.id,
        level: attempt.level,
        status: attempt.status,
        startedAt: attempt.startedAt,
        completedAt: attempt.completedAt,
        totalScore: attempt.totalScore,
        passed: attempt.isPassed,
      },
      sectionScores: attempt.sectionScores.map(score => {
        // Calculate stats from answers
        const sectionAnswers = attempt.userAnswers.filter(
          a => a.question.sectionType === score.sectionType
        );
        const totalQuestions = sectionAnswers.length;
        const correctAnswers = sectionAnswers.filter(
          a => a.selectedAnswer === a.question.correctAnswer
        ).length;

        return {
          sectionType: score.sectionType,
          normalizedScore: score.normalizedScore,
          rawScore: score.rawScore,
          referenceGrade: score.referenceGrade,
          correctAnswers,
          totalQuestions,
          accuracy: totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0,
        };
      }),
      timeTracking: {
        totalSeconds: totalTimeSpent,
        bySection: attempt.sectionSubmissions.map(sub => ({
          sectionType: sub.sectionType,
          timeSpentSeconds: sub.timeSpentSeconds,
          submittedAt: sub.submittedAt,
        })),
      },
      questionReview: Object.entries(answersBySection).map(([sectionType, answers]) => ({
        sectionType,
        answers: answers.map(answer => ({
          questionId: answer.questionId,
          mondaiNumber: answer.question.mondaiNumber,
          questionText: answer.question.questionText,
          selectedAnswer: answer.selectedAnswer,
          correctAnswer: answer.question.correctAnswer,
          isCorrect: answer.selectedAnswer === answer.question.correctAnswer,
          explanation: null, // Explanation field not implemented yet
          passage: answer.question.passage
            ? {
                id: answer.question.passage.id,
                title: answer.question.passage.title,
                content: answer.question.passage.contentText,
              }
            : null,
          answerChoices: answer.question.answerChoices.map(choice => ({
            choiceNumber: choice.choiceNumber,
            choiceText: choice.choiceText,
          })),
        })),
      })),
    };

    return NextResponse.json(results);
  } catch (error) {
    console.error('Error fetching test results:', error);
    return NextResponse.json({ error: '結果の取得中にエラーが発生しました' }, { status: 500 });
  }
}
