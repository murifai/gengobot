/**
 * JLPT Scoring Engine
 *
 * Core scoring calculations for JLPT tests.
 * Implements weighted scoring, normalization, and pass/fail evaluation.
 *
 * @see docs/jlpttest/03-scoring-calculation.md
 */

import type {
  JLPTLevel,
  SectionType,
  ReferenceGrade,
  SectionScoringResult,
  MondaiScore,
  PassFailResult,
  UserAnswerInput,
  QuestionWithDetails,
} from './types';
import {
  MONDAI_CONFIG,
  getMondaiWeight,
  getMaxRawScoreForSection,
  getTotalQuestionsForSection,
  getMondaiNumbers,
} from '@/config/jlpt-mondai';

// ============================================
// Core Scoring Configuration
// ============================================

/**
 * Passing score thresholds per level
 */
const PASSING_THRESHOLDS: Record<JLPTLevel, { overall: number; sectional: number }> = {
  N5: { overall: 80, sectional: 19 },
  N4: { overall: 90, sectional: 19 },
  N3: { overall: 95, sectional: 19 },
  N2: { overall: 90, sectional: 19 },
  N1: { overall: 100, sectional: 19 },
};

/**
 * Combined sectional minimum for N4/N5 (vocab + grammar)
 */
const COMBINED_SECTIONAL_MINIMUM = 38;

/**
 * Reference grade thresholds (based on percentage correct)
 */
const GRADE_THRESHOLDS = {
  A: 0.67, // ≥67% correct
  B: 0.34, // ≥34% correct
  C: 0.0, // <34% correct
} as const;

// ============================================
// Main Scoring Functions
// ============================================

/**
 * Calculate weighted score for a section
 *
 * @param level JLPT level
 * @param sectionType Section type
 * @param userAnswers User's answers for this section
 * @param questions Question details with correct answers
 * @returns Section scoring result with breakdown
 */
export function calculateSectionScore(
  level: JLPTLevel,
  sectionType: SectionType,
  userAnswers: UserAnswerInput[],
  questions: QuestionWithDetails[]
): SectionScoringResult {
  // Handle special case: N3 dual normalization
  if (level === 'N3' && sectionType === 'grammar_reading') {
    return calculateN3DualNormalization(userAnswers, questions);
  }

  // Standard calculation
  const answerMap = new Map(userAnswers.map(a => [a.questionId, a.selectedAnswer]));

  // Group by mondai and calculate scores
  const mondaiScores: MondaiScore[] = [];
  let totalWeightedScore = 0;
  let totalRawScore = 0;

  const mondaiNumbers = getMondaiNumbers(level, sectionType);

  for (const mondaiNumber of mondaiNumbers) {
    const mondaiQuestions = questions.filter(q => q.mondaiNumber === mondaiNumber);
    const weight = getMondaiWeight(level, sectionType, mondaiNumber);

    let correct = 0;
    for (const question of mondaiQuestions) {
      const userAnswer = answerMap.get(question.id);
      if (userAnswer === question.correctAnswer) {
        correct++;
        totalRawScore++;
      }
    }

    const weightedScore = correct * weight;
    totalWeightedScore += weightedScore;

    const maxScore = mondaiQuestions.length * weight;

    mondaiScores.push({
      mondaiNumber,
      correct,
      total: mondaiQuestions.length,
      weightedScore,
      maxScore,
    });
  }

  // Calculate normalized score (0-60 scale)
  const rawMaxScore = getMaxRawScoreForSection(level, sectionType);
  const normalizedScore = (totalWeightedScore / rawMaxScore) * 60;

  // Calculate reference grade
  const totalQuestions = getTotalQuestionsForSection(level, sectionType);
  const referenceGrade = calculateReferenceGrade(totalRawScore, totalQuestions);

  // Determine if section passed (will be validated in pass/fail evaluation)
  const isPassed = normalizedScore >= PASSING_THRESHOLDS[level].sectional;

  return {
    sectionType,
    rawScore: totalRawScore,
    weightedScore: totalWeightedScore,
    rawMaxScore,
    normalizedScore: Math.round(normalizedScore * 100) / 100,
    isPassed,
    referenceGrade,
    mondaiBreakdown: mondaiScores,
  };
}

/**
 * Calculate N3 Grammar/Reading section with dual normalization
 *
 * N3 Section 2 has two parts:
 * - Reading Part (問題1-3): 23 questions, weight=1 each
 * - Grammar Part (問題4-7): 16 questions, weights=3,4,4,4
 *
 * Each part is normalized to 60, then averaged for final score.
 */
function calculateN3DualNormalization(
  userAnswers: UserAnswerInput[],
  questions: QuestionWithDetails[]
): SectionScoringResult {
  const answerMap = new Map(userAnswers.map(a => [a.questionId, a.selectedAnswer]));

  // Split into reading (1-3) and grammar (4-7)
  const readingQuestions = questions.filter(q => q.mondaiNumber >= 1 && q.mondaiNumber <= 3);
  const grammarQuestions = questions.filter(q => q.mondaiNumber >= 4 && q.mondaiNumber <= 7);

  // Calculate reading part (unweighted)
  let readingCorrect = 0;
  for (const question of readingQuestions) {
    if (answerMap.get(question.id) === question.correctAnswer) {
      readingCorrect++;
    }
  }
  const readingNormalized = (readingCorrect / readingQuestions.length) * 60;

  // Calculate grammar part (weighted)
  let grammarWeightedScore = 0;
  let grammarMaxScore = 0;
  let grammarCorrect = 0;

  const grammarMondaiScores: MondaiScore[] = [];

  for (const mondaiNumber of [4, 5, 6, 7]) {
    const mondaiQuestions = grammarQuestions.filter(q => q.mondaiNumber === mondaiNumber);
    const weight = getMondaiWeight('N3', 'grammar_reading', mondaiNumber);

    let correct = 0;
    for (const question of mondaiQuestions) {
      if (answerMap.get(question.id) === question.correctAnswer) {
        correct++;
        grammarCorrect++;
      }
    }

    const weightedScore = correct * weight;
    grammarWeightedScore += weightedScore;
    grammarMaxScore += mondaiQuestions.length * weight;

    grammarMondaiScores.push({
      mondaiNumber,
      correct,
      total: mondaiQuestions.length,
      weightedScore,
      maxScore: mondaiQuestions.length * weight,
    });
  }

  const grammarNormalized = (grammarWeightedScore / grammarMaxScore) * 60;

  // Final score: average of both normalized parts
  const finalScore = (readingNormalized + grammarNormalized) / 2;

  // Calculate overall reference grade
  const totalCorrect = readingCorrect + grammarCorrect;
  const totalQuestions = readingQuestions.length + grammarQuestions.length;
  const referenceGrade = calculateReferenceGrade(totalCorrect, totalQuestions);

  // Combined mondai breakdown (reading + grammar)
  const readingMondaiScores: MondaiScore[] = [1, 2, 3].map(mondaiNumber => {
    const mondaiQuestions = readingQuestions.filter(q => q.mondaiNumber === mondaiNumber);
    let correct = 0;
    for (const question of mondaiQuestions) {
      if (answerMap.get(question.id) === question.correctAnswer) {
        correct++;
      }
    }
    return {
      mondaiNumber,
      correct,
      total: mondaiQuestions.length,
      weightedScore: correct * 1, // weight=1 for reading
      maxScore: mondaiQuestions.length * 1,
    };
  });

  const mondaiBreakdown = [...readingMondaiScores, ...grammarMondaiScores];

  return {
    sectionType: 'grammar_reading',
    rawScore: totalCorrect,
    weightedScore: grammarWeightedScore, // Only grammar part is weighted
    rawMaxScore: grammarMaxScore,
    normalizedScore: Math.round(finalScore * 100) / 100,
    isPassed: finalScore >= 19,
    referenceGrade,
    mondaiBreakdown,
  };
}

/**
 * Calculate total score from all section scores
 *
 * @param sectionScores Array of section scoring results
 * @returns Total score (0-180)
 */
export function calculateTotalScore(sectionScores: SectionScoringResult[]): number {
  const total = sectionScores.reduce((sum, section) => sum + section.normalizedScore, 0);
  return Math.round(total * 100) / 100;
}

/**
 * Evaluate pass/fail based on level-specific criteria
 *
 * @param level JLPT level
 * @param sectionScores Array of section scoring results
 * @param totalScore Total score (0-180)
 * @returns Pass/fail result with reasoning
 */
export function evaluatePassFail(
  level: JLPTLevel,
  sectionScores: SectionScoringResult[],
  totalScore: number
): PassFailResult {
  const config = PASSING_THRESHOLDS[level];
  const failureReasons: string[] = [];

  // Check overall minimum
  const overallPass = totalScore >= config.overall;
  if (!overallPass) {
    failureReasons.push(
      `Total score ${totalScore}/180 is below passing threshold ${config.overall}/180`
    );
  }

  // Get section scores by type
  const sectionScoreMap = new Map(sectionScores.map(s => [s.sectionType, s.normalizedScore]));
  const vocabScore = sectionScoreMap.get('vocabulary') ?? 0;
  const grammarScore = sectionScoreMap.get('grammar_reading') ?? 0;
  const listeningScore = sectionScoreMap.get('listening') ?? 0;

  // Sectional minimum checks
  let sectionalPass = true;
  const sectionsPassed = {
    vocabulary: false,
    grammar_reading: false,
    listening: false,
  };

  if (level === 'N5' || level === 'N4') {
    // Combined vocabulary + grammar/reading check
    const combined = vocabScore + grammarScore;
    const combinedPass = combined >= COMBINED_SECTIONAL_MINIMUM;

    if (!combinedPass) {
      sectionalPass = false;
      failureReasons.push(
        `Combined Vocabulary + Grammar/Reading score ${combined}/120 is below minimum ${COMBINED_SECTIONAL_MINIMUM}/120`
      );
    } else {
      sectionsPassed.vocabulary = true;
      sectionsPassed.grammar_reading = true;
    }

    // Listening minimum
    const listeningPass = listeningScore >= config.sectional;
    sectionsPassed.listening = listeningPass;

    if (!listeningPass) {
      sectionalPass = false;
      failureReasons.push(
        `Listening score ${listeningScore}/60 is below minimum ${config.sectional}/60`
      );
    }
  } else {
    // N3, N2, N1: Each section must meet 19/60 minimum
    for (const [sectionType, score] of sectionScoreMap.entries()) {
      const passed = score >= config.sectional;
      sectionsPassed[sectionType as SectionType] = passed;

      if (!passed) {
        sectionalPass = false;
        failureReasons.push(
          `${getSectionDisplayName(sectionType as SectionType)} score ${score}/60 is below minimum ${config.sectional}/60`
        );
      }
    }
  }

  const isPassed = overallPass && sectionalPass;

  return {
    isPassed,
    totalScore,
    sectionsPassed,
    failureReasons: failureReasons.length > 0 ? failureReasons : undefined,
  };
}

/**
 * Calculate reference grade (A/B/C) based on percentage correct
 *
 * @param rawScore Number of correct answers
 * @param totalQuestions Total questions in section
 * @returns Reference grade
 */
export function calculateReferenceGrade(rawScore: number, totalQuestions: number): ReferenceGrade {
  if (totalQuestions === 0) {
    return 'C';
  }

  const percentage = rawScore / totalQuestions;

  if (percentage >= GRADE_THRESHOLDS.A) {
    return 'A';
  } else if (percentage >= GRADE_THRESHOLDS.B) {
    return 'B';
  } else {
    return 'C';
  }
}

// ============================================
// Offline Calculator Functions
// ============================================

/**
 * Calculate score from offline test input (calculator)
 *
 * @param level JLPT level
 * @param mondaiScores Array of mondai scores
 * @returns Section scoring results
 */
export function calculateOfflineTestScore(
  level: JLPTLevel,
  mondaiScores: Array<{
    sectionType: SectionType;
    mondaiNumber: number;
    correct: number;
    total: number;
  }>
): SectionScoringResult[] {
  // Group by section
  const sections = ['vocabulary', 'grammar_reading', 'listening'] as const;
  const results: SectionScoringResult[] = [];

  for (const sectionType of sections) {
    const sectionMondaiScores = mondaiScores.filter(m => m.sectionType === sectionType);

    if (sectionMondaiScores.length === 0) {
      continue;
    }

    // Handle N3 dual normalization
    if (level === 'N3' && sectionType === 'grammar_reading') {
      const result = calculateN3OfflineDualNormalization(sectionMondaiScores);
      results.push(result);
      continue;
    }

    // Standard calculation
    let totalWeightedScore = 0;
    let totalRawScore = 0;
    const mondaiBreakdown: MondaiScore[] = [];

    for (const mondai of sectionMondaiScores) {
      const weight = getMondaiWeight(level, sectionType, mondai.mondaiNumber);
      const weightedScore = mondai.correct * weight;
      totalWeightedScore += weightedScore;
      totalRawScore += mondai.correct;

      mondaiBreakdown.push({
        mondaiNumber: mondai.mondaiNumber,
        correct: mondai.correct,
        total: mondai.total,
        weightedScore,
        maxScore: mondai.total * weight,
      });
    }

    const rawMaxScore = getMaxRawScoreForSection(level, sectionType);
    const normalizedScore = (totalWeightedScore / rawMaxScore) * 60;

    const totalQuestions = getTotalQuestionsForSection(level, sectionType);
    const referenceGrade = calculateReferenceGrade(totalRawScore, totalQuestions);

    results.push({
      sectionType,
      rawScore: totalRawScore,
      weightedScore: totalWeightedScore,
      rawMaxScore,
      normalizedScore: Math.round(normalizedScore * 100) / 100,
      isPassed: normalizedScore >= PASSING_THRESHOLDS[level].sectional,
      referenceGrade,
      mondaiBreakdown,
    });
  }

  return results;
}

/**
 * Calculate N3 dual normalization for offline calculator
 */
function calculateN3OfflineDualNormalization(
  mondaiScores: Array<{
    mondaiNumber: number;
    correct: number;
    total: number;
  }>
): SectionScoringResult {
  const readingMondai = mondaiScores.filter(m => m.mondaiNumber >= 1 && m.mondaiNumber <= 3);
  const grammarMondai = mondaiScores.filter(m => m.mondaiNumber >= 4 && m.mondaiNumber <= 7);

  // Reading part (unweighted)
  const readingCorrect = readingMondai.reduce((sum, m) => sum + m.correct, 0);
  const readingTotal = readingMondai.reduce((sum, m) => sum + m.total, 0);
  const readingNormalized = (readingCorrect / readingTotal) * 60;

  // Grammar part (weighted)
  let grammarWeightedScore = 0;
  let grammarMaxScore = 0;
  let grammarCorrect = 0;

  const grammarBreakdown: MondaiScore[] = [];

  for (const mondai of grammarMondai) {
    const weight = getMondaiWeight('N3', 'grammar_reading', mondai.mondaiNumber);
    const weightedScore = mondai.correct * weight;
    grammarWeightedScore += weightedScore;
    grammarMaxScore += mondai.total * weight;
    grammarCorrect += mondai.correct;

    grammarBreakdown.push({
      mondaiNumber: mondai.mondaiNumber,
      correct: mondai.correct,
      total: mondai.total,
      weightedScore,
      maxScore: mondai.total * weight,
    });
  }

  const grammarNormalized = (grammarWeightedScore / grammarMaxScore) * 60;

  // Final score: average
  const finalScore = (readingNormalized + grammarNormalized) / 2;

  // Reference grade
  const totalCorrect = readingCorrect + grammarCorrect;
  const totalQuestions = readingTotal + grammarMondai.reduce((sum, m) => sum + m.total, 0);
  const referenceGrade = calculateReferenceGrade(totalCorrect, totalQuestions);

  // Reading breakdown
  const readingBreakdown: MondaiScore[] = readingMondai.map(m => ({
    mondaiNumber: m.mondaiNumber,
    correct: m.correct,
    total: m.total,
    weightedScore: m.correct * 1,
    maxScore: m.total * 1,
  }));

  return {
    sectionType: 'grammar_reading',
    rawScore: totalCorrect,
    weightedScore: grammarWeightedScore,
    rawMaxScore: grammarMaxScore,
    normalizedScore: Math.round(finalScore * 100) / 100,
    isPassed: finalScore >= 19,
    referenceGrade,
    mondaiBreakdown: [...readingBreakdown, ...grammarBreakdown],
  };
}

// ============================================
// Helper Functions
// ============================================

/**
 * Get display name for section type
 */
function getSectionDisplayName(sectionType: SectionType): string {
  const names: Record<SectionType, string> = {
    vocabulary: 'Vocabulary',
    grammar_reading: 'Grammar/Reading',
    listening: 'Listening',
  };
  return names[sectionType];
}

/**
 * Validate that mondai scores match expected configuration
 */
export function validateMondaiScores(
  level: JLPTLevel,
  sectionType: SectionType,
  mondaiScores: Array<{ mondaiNumber: number; total: number }>
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  const expectedMondai = MONDAI_CONFIG[level][sectionType].mondai;

  // Check all expected mondai are present
  for (const expected of expectedMondai) {
    const provided = mondaiScores.find(m => m.mondaiNumber === expected.number);

    if (!provided) {
      errors.push(`Missing mondai ${expected.number} for ${sectionType}`);
      continue;
    }

    // Validate question count
    if (provided.total !== expected.questions_count) {
      errors.push(
        `Mondai ${expected.number}: expected ${expected.questions_count} questions, got ${provided.total}`
      );
    }
  }

  // Check for unexpected mondai
  for (const provided of mondaiScores) {
    const expected = expectedMondai.find(m => m.number === provided.mondaiNumber);
    if (!expected) {
      errors.push(`Unexpected mondai ${provided.mondaiNumber} for ${sectionType}`);
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Get passing thresholds for a level
 */
export function getPassingThresholds(level: JLPTLevel) {
  return PASSING_THRESHOLDS[level];
}

/**
 * Get combined sectional minimum (for N4/N5)
 */
export function getCombinedSectionalMinimum() {
  return COMBINED_SECTIONAL_MINIMUM;
}
