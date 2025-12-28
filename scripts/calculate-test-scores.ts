#!/usr/bin/env tsx
/**
 * Calculate scores for completed tests that don't have scores yet
 * Run with: npx tsx scripts/calculate-test-scores.ts [attemptId]
 */

import { prisma } from '../src/lib/prisma';

type SectionType = 'vocabulary' | 'grammar_reading' | 'listening';

async function calculateScoresForAttempt(attemptId: string) {
  console.log(`\n📊 Calculating scores for attempt: ${attemptId}\n`);

  // Get all answers for this attempt
  const allAnswers = await prisma.jLPTUserAnswer.findMany({
    where: { testAttemptId: attemptId },
    include: {
      question: {
        select: {
          sectionType: true,
          correctAnswer: true,
          mondaiNumber: true,
          questionNumber: true,
        },
      },
    },
  });

  console.log(`Found ${allAnswers.length} answers\n`);

  // Group by section and calculate scores
  const sections: SectionType[] = ['vocabulary', 'grammar_reading', 'listening'];
  const sectionScoresData: { sectionType: string; correct: number; total: number }[] = [];

  for (const section of sections) {
    const sectionAnswers = allAnswers.filter(a => a.question.sectionType === section);
    const correctCount = sectionAnswers.filter(
      a => a.selectedAnswer === a.question.correctAnswer
    ).length;

    console.log(`${section}:`);
    console.log(`  Total: ${sectionAnswers.length} questions`);
    console.log(`  Correct: ${correctCount}`);
    console.log(`  Accuracy: ${((correctCount / sectionAnswers.length) * 100).toFixed(1)}%`);

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
      const weightedScore = normalizedScore;

      // Section passing criteria (typically 19/60 for JLPT)
      const sectionPassed = normalizedScore >= 19;

      // Determine reference grade
      let referenceGrade: 'A' | 'B' | 'C';
      if (accuracy >= 0.8) {
        referenceGrade = 'A';
      } else if (accuracy >= 0.6) {
        referenceGrade = 'B';
      } else {
        referenceGrade = 'C';
      }

      console.log(`  Normalized Score: ${normalizedScore}/60`);
      console.log(`  Grade: ${referenceGrade}`);
      console.log(`  Passed: ${sectionPassed ? 'Yes' : 'No'}\n`);

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

  // JLPT passing criteria: typically need total ≥ 90/180 AND all sections ≥ 19/60
  const allSectionsPassed = (
    await prisma.jLPTSectionScore.findMany({
      where: { testAttemptId: attemptId },
    })
  ).every(s => s.isPassed);

  const isPassed = totalScore >= 90 && allSectionsPassed;

  console.log('Overall Results:');
  console.log(`  Total Score: ${totalScore}/180`);
  console.log(`  All Sections Passed: ${allSectionsPassed ? 'Yes' : 'No'}`);
  console.log(`  Test Result: ${isPassed ? '✅ PASSED' : '❌ FAILED'}\n`);

  // Update test attempt with scores
  await prisma.jLPTTestAttempt.update({
    where: { id: attemptId },
    data: {
      totalScore,
      isPassed,
    },
  });

  // Mark answers as correct/incorrect
  let updatedCount = 0;
  for (const answer of allAnswers) {
    const isCorrect = answer.selectedAnswer === answer.question.correctAnswer;
    await prisma.jLPTUserAnswer.update({
      where: { id: answer.id },
      data: { isCorrect },
    });
    updatedCount++;
  }

  console.log(`✅ Updated ${updatedCount} answers with correct/incorrect status\n`);
}

async function main() {
  const attemptId = process.argv[2];

  if (attemptId) {
    // Calculate scores for specific attempt
    await calculateScoresForAttempt(attemptId);
  } else {
    // Find all completed tests without scores
    const testsWithoutScores = await prisma.jLPTTestAttempt.findMany({
      where: {
        status: 'completed',
        totalScore: null,
      },
      select: {
        id: true,
        level: true,
        completedAt: true,
      },
    });

    console.log(`Found ${testsWithoutScores.length} completed tests without scores\n`);

    for (const test of testsWithoutScores) {
      console.log(`\n${'='.repeat(60)}`);
      console.log(`Test: ${test.id}`);
      console.log(`Level: ${test.level}`);
      console.log(`Completed: ${test.completedAt?.toISOString()}`);
      console.log('='.repeat(60));

      await calculateScoresForAttempt(test.id);
    }
  }

  await prisma.$disconnect();
}

main().catch(error => {
  console.error('Error:', error);
  process.exit(1);
});
