import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth';
import { prisma } from '@/lib/prisma';
import {
  calculateSectionScore,
  calculateTotalScore,
  evaluatePassFail,
} from '@/lib/jlpt/scoring-engine';
import type { JLPTLevel, SectionType } from '@/lib/jlpt/types';

/**
 * POST /api/jlpt/tryout/complete
 * Complete the test and calculate scores
 *
 * Body: {
 *   attemptId: string;
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
    const { attemptId } = body;

    if (!attemptId) {
      return NextResponse.json({ error: '試験IDが必要です' }, { status: 400 });
    }

    // Fetch test attempt with all data
    const attempt = await prisma.jLPTTestAttempt.findUnique({
      where: { id: attemptId },
      include: {
        userAnswers: {
          include: {
            question: {
              include: {
                answerChoices: true,
              },
            },
          },
        },
        sectionSubmissions: true,
      },
    });

    if (!attempt) {
      return NextResponse.json({ error: '試験が見つかりません' }, { status: 404 });
    }

    if (attempt.userId !== userId) {
      return NextResponse.json({ error: 'アクセスが拒否されました' }, { status: 403 });
    }

    if (attempt.status === 'completed') {
      return NextResponse.json({ error: 'この試験は既に完了しています' }, { status: 400 });
    }

    // Ensure all sections are submitted
    const submittedSections = new Set(attempt.sectionSubmissions.map(s => s.sectionType));
    const requiredSections: SectionType[] = ['vocabulary', 'grammar_reading', 'listening'];

    const missingSection = requiredSections.find(section => !submittedSections.has(section));
    if (missingSection) {
      return NextResponse.json(
        { error: `セクション「${missingSection}」が未提出です` },
        { status: 400 }
      );
    }

    const level = attempt.level as JLPTLevel;

    // Calculate scores for each section
    const sectionScores: Array<{
      sectionType: SectionType;
      rawScore: number;
      normalizedScore: number;
      referenceGrade: 'A' | 'B' | 'C';
      totalQuestions: number;
      correctAnswers: number;
    }> = [];

    for (const section of requiredSections) {
      // Get answers for this section
      const sectionAnswers = attempt.userAnswers.filter(
        answer => answer.question.sectionType === section
      );

      // Prepare questions with details
      const questionsWithDetails = sectionAnswers.map(answer => answer.question);

      // Calculate score
      const scoreResult = calculateSectionScore(
        level,
        section,
        sectionAnswers.map(answer => ({
          questionId: answer.questionId,
          mondaiNumber: answer.question.mondaiNumber,
          selectedAnswer: answer.selectedAnswer,
          correctAnswer: answer.question.correctAnswer,
        })),
        questionsWithDetails
      );

      // Calculate stats
      const totalQuestions = sectionAnswers.length;
      const correctAnswers = sectionAnswers.filter(
        answer => answer.selectedAnswer === answer.question.correctAnswer
      ).length;

      sectionScores.push({
        sectionType: section,
        rawScore: scoreResult.rawScore,
        normalizedScore: scoreResult.normalizedScore,
        referenceGrade: scoreResult.referenceGrade,
        totalQuestions,
        correctAnswers,
      });

      // Store section score in database
      await prisma.jLPTSectionScore.create({
        data: {
          testAttemptId: attemptId,
          sectionType: section,
          rawScore: scoreResult.rawScore,
          weightedScore: scoreResult.weightedScore,
          rawMaxScore: scoreResult.rawMaxScore,
          normalizedScore: scoreResult.normalizedScore,
          isPassed: scoreResult.isPassed,
          referenceGrade: scoreResult.referenceGrade,
        },
      });
    }

    // Calculate total score (using stored SectionScoringResults)
    const totalScore = calculateTotalScore(
      sectionScores.map(s => ({
        sectionType: s.sectionType,
        rawScore: s.rawScore,
        weightedScore: 0, // Not used in totalScore calculation
        rawMaxScore: 0, // Not used in totalScore calculation
        normalizedScore: s.normalizedScore,
        isPassed: false, // Not used in totalScore calculation
        referenceGrade: s.referenceGrade,
        mondaiBreakdown: [], // Not used in totalScore calculation
      }))
    );

    // Evaluate pass/fail
    const passFailResult = evaluatePassFail(
      level,
      sectionScores.map(s => ({
        sectionType: s.sectionType,
        rawScore: s.rawScore,
        weightedScore: 0,
        rawMaxScore: 0,
        normalizedScore: s.normalizedScore,
        isPassed: false,
        referenceGrade: s.referenceGrade,
        mondaiBreakdown: [],
      })),
      totalScore
    );

    // Update test attempt with final scores and completion
    const updatedAttempt = await prisma.jLPTTestAttempt.update({
      where: { id: attemptId },
      data: {
        status: 'completed',
        completedAt: new Date(),
        totalScore,
        isPassed: passFailResult.isPassed,
      },
    });

    return NextResponse.json({
      success: true,
      results: {
        attemptId: updatedAttempt.id,
        level: updatedAttempt.level,
        totalScore,
        passed: passFailResult.isPassed,
        sectionsPassed: passFailResult.sectionsPassed,
        sectionScores: sectionScores.map(s => ({
          sectionType: s.sectionType,
          normalizedScore: s.normalizedScore,
          referenceGrade: s.referenceGrade,
          correctAnswers: s.correctAnswers,
          totalQuestions: s.totalQuestions,
        })),
        completedAt: updatedAttempt.completedAt,
      },
    });
  } catch (error) {
    console.error('Error completing test:', error);
    return NextResponse.json(
      { error: 'テストの完了処理中にエラーが発生しました' },
      { status: 500 }
    );
  }
}
