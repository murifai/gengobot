import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth';
import { prisma } from '@/lib/prisma';
import { generateShuffleSeed, createTestSnapshot } from '@/lib/jlpt/question-randomizer';
import { getTotalQuestionsForSection } from '@/config/jlpt-mondai';
import type { JLPTLevel } from '@/lib/jlpt/types';

/**
 * POST /api/jlpt/tryout/start
 * Initialize a new JLPT test attempt
 *
 * Body: { level: 'N5' | 'N4' | 'N3' | 'N2' | 'N1' }
 *
 * Returns: {
 *   attemptId: string;
 *   level: string;
 *   shuffleSeed: string;
 *   questionsSnapshot: QuestionSnapshot;
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
    const { level } = body as { level: JLPTLevel };

    // Validate level
    const validLevels: JLPTLevel[] = ['N5', 'N4', 'N3', 'N2', 'N1'];
    if (!level || !validLevels.includes(level)) {
      return NextResponse.json({ error: '無効なJLPTレベルです' }, { status: 400 });
    }

    // Check for existing in-progress test
    const existingAttempt = await prisma.jLPTTestAttempt.findFirst({
      where: {
        userId,
        level,
        status: 'in_progress',
      },
      orderBy: {
        startedAt: 'desc',
      },
    });

    // If there's an existing in-progress test, return it
    if (existingAttempt) {
      return NextResponse.json({
        attemptId: existingAttempt.id,
        level: existingAttempt.level,
        shuffleSeed: existingAttempt.shuffleSeed,
        questionsSnapshot: existingAttempt.questionsSnapshot,
        resumed: true,
      });
    }

    // Fetch questions for each section
    // For MVP Phase 2, we're focusing on N5 with actual questions
    // For now, we'll fetch questions in order and randomize them
    const vocabularyQuestions = await prisma.jLPTQuestion.findMany({
      where: {
        level,
        sectionType: 'vocabulary',
        isActive: true,
      },
      select: {
        id: true,
        mondaiNumber: true,
        questionNumber: true,
      },
      orderBy: [{ mondaiNumber: 'asc' }, { questionNumber: 'asc' }],
    });

    const grammarReadingQuestions = await prisma.jLPTQuestion.findMany({
      where: {
        level,
        sectionType: 'grammar_reading',
        isActive: true,
      },
      select: {
        id: true,
        mondaiNumber: true,
        questionNumber: true,
      },
      orderBy: [{ mondaiNumber: 'asc' }, { questionNumber: 'asc' }],
    });

    const listeningQuestions = await prisma.jLPTQuestion.findMany({
      where: {
        level,
        sectionType: 'listening',
        isActive: true,
      },
      select: {
        id: true,
        mondaiNumber: true,
        questionNumber: true,
      },
      orderBy: [{ mondaiNumber: 'asc' }, { questionNumber: 'asc' }],
    });

    // Validate question counts
    const expectedVocab = getTotalQuestionsForSection(level, 'vocabulary');
    const expectedGrammar = getTotalQuestionsForSection(level, 'grammar_reading');
    const expectedListening = getTotalQuestionsForSection(level, 'listening');

    if (vocabularyQuestions.length < expectedVocab) {
      return NextResponse.json(
        {
          error: `語彙セクションの問題が不足しています（期待: ${expectedVocab}、実際: ${vocabularyQuestions.length}）`,
        },
        { status: 500 }
      );
    }

    if (grammarReadingQuestions.length < expectedGrammar) {
      return NextResponse.json(
        {
          error: `文法・読解セクションの問題が不足しています（期待: ${expectedGrammar}、実際: ${grammarReadingQuestions.length}）`,
        },
        { status: 500 }
      );
    }

    if (listeningQuestions.length < expectedListening) {
      return NextResponse.json(
        {
          error: `聴解セクションの問題が不足しています（期待: ${expectedListening}、実際: ${listeningQuestions.length}）`,
        },
        { status: 500 }
      );
    }

    // Generate shuffle seed
    const shuffleSeed = generateShuffleSeed();

    // Create question snapshot with shuffling
    const questionsSnapshot = createTestSnapshot(
      level,
      vocabularyQuestions.slice(0, expectedVocab).map(q => q.id),
      grammarReadingQuestions.slice(0, expectedGrammar).map(q => q.id),
      listeningQuestions.slice(0, expectedListening).map(q => q.id),
      shuffleSeed
    );

    // Create test attempt
    const testAttempt = await prisma.jLPTTestAttempt.create({
      data: {
        userId,
        level,
        testMode: 'full_test',
        questionsSnapshot: JSON.parse(JSON.stringify(questionsSnapshot)), // Convert to JSON
        shuffleSeed,
        status: 'in_progress',
      },
    });

    return NextResponse.json({
      attemptId: testAttempt.id,
      level: testAttempt.level,
      shuffleSeed: testAttempt.shuffleSeed,
      questionsSnapshot: testAttempt.questionsSnapshot,
      resumed: false,
    });
  } catch (error) {
    console.error('Error starting JLPT test:', error);
    return NextResponse.json({ error: 'テストの開始中にエラーが発生しました' }, { status: 500 });
  }
}
