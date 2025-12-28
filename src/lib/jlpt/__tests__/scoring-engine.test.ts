/**
 * JLPT Scoring Engine Unit Tests
 *
 * Comprehensive tests for all scoring calculations
 */

import {
  calculateSectionScore,
  calculateTotalScore,
  evaluatePassFail,
  calculateReferenceGrade,
  calculateOfflineTestScore,
  validateMondaiScores,
  getPassingThresholds,
  getCombinedSectionalMinimum,
} from '../scoring-engine';
import type {
  JLPTLevel,
  SectionType,
  UserAnswerInput,
  QuestionWithDetails,
  SectionScoringResult,
} from '../types';

// ============================================
// Test Helpers
// ============================================

/**
 * Create mock question with details
 */
function createMockQuestion(
  id: string,
  mondaiNumber: number,
  correctAnswer: number
): QuestionWithDetails {
  return {
    id,
    mondaiNumber,
    correctAnswer,
    level: 'N5',
    sectionType: 'vocabulary',
    questionNumber: 1,
    questionText: 'Test question',
    questionType: 'standard',
    difficulty: 'medium',
    isActive: true,
    createdBy: 'test',
    createdAt: new Date(),
    updatedAt: new Date(),
    passageId: null,
    blankPosition: null,
    mediaUrl: null,
    mediaType: null,
    answerChoices: [],
    passage: null,
  };
}

/**
 * Create mock user answer
 */
function createMockAnswer(questionId: string, selectedAnswer: number): UserAnswerInput {
  return {
    questionId,
    selectedAnswer,
    timeSpentSeconds: 30,
    isFlagged: false,
  };
}

// ============================================
// Reference Grade Tests
// ============================================

describe('calculateReferenceGrade', () => {
  it('should return A for ≥67% correct', () => {
    expect(calculateReferenceGrade(24, 35)).toBe('A'); // 68.6%
    expect(calculateReferenceGrade(28, 35)).toBe('A'); // 80%
    expect(calculateReferenceGrade(21, 30)).toBe('A'); // 70%
  });

  it('should return B for 34-66% correct', () => {
    expect(calculateReferenceGrade(18, 35)).toBe('B'); // 51.4%
    expect(calculateReferenceGrade(15, 35)).toBe('B'); // 42.9%
    expect(calculateReferenceGrade(12, 35)).toBe('B'); // 34.3%
  });

  it('should return C for <34% correct', () => {
    expect(calculateReferenceGrade(10, 35)).toBe('C'); // 28.6%
    expect(calculateReferenceGrade(5, 35)).toBe('C'); // 14.3%
    expect(calculateReferenceGrade(0, 35)).toBe('C'); // 0%
  });

  it('should return C for zero questions', () => {
    expect(calculateReferenceGrade(0, 0)).toBe('C');
  });
});

// ============================================
// Section Score Calculation Tests
// ============================================

describe('calculateSectionScore', () => {
  describe('N5 Vocabulary Section', () => {
    it('should calculate correct weighted score', () => {
      const questions: QuestionWithDetails[] = [
        // 問題1 (weight=1): 12 questions
        ...Array.from({ length: 12 }, (_, i) => createMockQuestion(`q1-${i}`, 1, 1)),
        // 問題2 (weight=1): 8 questions
        ...Array.from({ length: 8 }, (_, i) => createMockQuestion(`q2-${i}`, 2, 1)),
        // 問題3 (weight=1): 10 questions
        ...Array.from({ length: 10 }, (_, i) => createMockQuestion(`q3-${i}`, 3, 1)),
        // 問題4 (weight=1): 5 questions
        ...Array.from({ length: 5 }, (_, i) => createMockQuestion(`q4-${i}`, 4, 1)),
      ];

      // User gets 80% correct (28/35)
      const userAnswers: UserAnswerInput[] = [
        // 問題1: 10/12 correct
        ...Array.from({ length: 10 }, (_, i) => createMockAnswer(`q1-${i}`, 1)),
        ...Array.from({ length: 2 }, (_, i) => createMockAnswer(`q1-${i + 10}`, 2)),
        // 問題2: 6/8 correct
        ...Array.from({ length: 6 }, (_, i) => createMockAnswer(`q2-${i}`, 1)),
        ...Array.from({ length: 2 }, (_, i) => createMockAnswer(`q2-${i + 6}`, 2)),
        // 問題3: 8/10 correct
        ...Array.from({ length: 8 }, (_, i) => createMockAnswer(`q3-${i}`, 1)),
        ...Array.from({ length: 2 }, (_, i) => createMockAnswer(`q3-${i + 8}`, 2)),
        // 問題4: 4/5 correct
        ...Array.from({ length: 4 }, (_, i) => createMockAnswer(`q4-${i}`, 1)),
        createMockAnswer('q4-4', 2),
      ];

      const result = calculateSectionScore('N5', 'vocabulary', userAnswers, questions);

      expect(result.sectionType).toBe('vocabulary');
      expect(result.rawScore).toBe(28); // 28 correct
      expect(result.weightedScore).toBe(28); // 28 × 1 = 28
      expect(result.rawMaxScore).toBe(35); // 35 × 1 = 35
      expect(result.normalizedScore).toBeCloseTo(48, 1); // (28/35) × 60 = 48
      expect(result.referenceGrade).toBe('A'); // 80%
      expect(result.mondaiBreakdown).toHaveLength(4);
      expect(result.mondaiBreakdown[0]).toEqual({
        mondaiNumber: 1,
        correct: 10,
        total: 12,
        weightedScore: 10,
        maxScore: 12,
      });
    });
  });

  describe('N5 Grammar/Reading Section', () => {
    it('should calculate correct weighted score with different weights', () => {
      const questions: QuestionWithDetails[] = [
        ...Array.from({ length: 16 }, (_, i) => createMockQuestion(`q1-${i}`, 1, 1)), // 問題1 (weight=1)
        ...Array.from({ length: 5 }, (_, i) => createMockQuestion(`q2-${i}`, 2, 1)), // 問題2 (weight=1)
        ...Array.from({ length: 5 }, (_, i) => createMockQuestion(`q3-${i}`, 3, 1)), // 問題3 (weight=1)
        ...Array.from({ length: 3 }, (_, i) => createMockQuestion(`q4-${i}`, 4, 1)), // 問題4 (weight=4)
        ...Array.from({ length: 2 }, (_, i) => createMockQuestion(`q5-${i}`, 5, 1)), // 問題5 (weight=4)
        createMockQuestion('q6-0', 6, 1), // 問題6 (weight=4)
      ];

      // All correct
      const userAnswers: UserAnswerInput[] = questions.map(q => createMockAnswer(q.id, 1));

      const result = calculateSectionScore('N5', 'grammar_reading', userAnswers, questions);

      expect(result.rawScore).toBe(32); // All 32 questions correct
      expect(result.weightedScore).toBe(50); // 16×1 + 5×1 + 5×1 + 3×4 + 2×4 + 1×4 = 50
      expect(result.rawMaxScore).toBe(50);
      expect(result.normalizedScore).toBe(60); // Perfect score
      expect(result.referenceGrade).toBe('A');
    });
  });

  describe('N5 Listening Section', () => {
    it('should calculate with different weights (2, 2.5, 3)', () => {
      const questions: QuestionWithDetails[] = [
        ...Array.from({ length: 7 }, (_, i) => createMockQuestion(`q1-${i}`, 1, 1)), // 問題1 (weight=2)
        ...Array.from({ length: 6 }, (_, i) => createMockQuestion(`q2-${i}`, 2, 1)), // 問題2 (weight=2.5)
        ...Array.from({ length: 5 }, (_, i) => createMockQuestion(`q3-${i}`, 3, 1)), // 問題3 (weight=3)
        ...Array.from({ length: 6 }, (_, i) => createMockQuestion(`q4-${i}`, 4, 1)), // 問題4 (weight=2.5)
      ];

      // 50% correct in each mondai
      const userAnswers: UserAnswerInput[] = [
        ...Array.from({ length: 4 }, (_, i) => createMockAnswer(`q1-${i}`, 1)),
        ...Array.from({ length: 3 }, (_, i) => createMockAnswer(`q1-${i + 4}`, 2)),
        ...Array.from({ length: 3 }, (_, i) => createMockAnswer(`q2-${i}`, 1)),
        ...Array.from({ length: 3 }, (_, i) => createMockAnswer(`q2-${i + 3}`, 2)),
        ...Array.from({ length: 3 }, (_, i) => createMockAnswer(`q3-${i}`, 1)),
        ...Array.from({ length: 2 }, (_, i) => createMockAnswer(`q3-${i + 3}`, 2)),
        ...Array.from({ length: 3 }, (_, i) => createMockAnswer(`q4-${i}`, 1)),
        ...Array.from({ length: 3 }, (_, i) => createMockAnswer(`q4-${i + 3}`, 2)),
      ];

      const result = calculateSectionScore('N5', 'listening', userAnswers, questions);

      expect(result.rawScore).toBe(13); // Total correct
      // Weighted: 4×2 + 3×2.5 + 3×3 + 3×2.5 = 8 + 7.5 + 9 + 7.5 = 32
      expect(result.weightedScore).toBe(32);
      // Max: 7×2 + 6×2.5 + 5×3 + 6×2.5 = 14 + 15 + 15 + 15 = 59
      expect(result.rawMaxScore).toBe(59);
      // Normalized: (32/59) × 60 ≈ 32.54
      expect(result.normalizedScore).toBeCloseTo(32.54, 1);
      expect(result.referenceGrade).toBe('B'); // 54% correct
    });
  });
});

// ============================================
// Total Score Calculation Tests
// ============================================

describe('calculateTotalScore', () => {
  it('should sum all section scores correctly', () => {
    const sectionScores: SectionScoringResult[] = [
      {
        sectionType: 'vocabulary',
        rawScore: 28,
        weightedScore: 28,
        rawMaxScore: 35,
        normalizedScore: 48.0,
        isPassed: true,
        referenceGrade: 'A',
        mondaiBreakdown: [],
      },
      {
        sectionType: 'grammar_reading',
        rawScore: 25,
        weightedScore: 40,
        rawMaxScore: 50,
        normalizedScore: 48.0,
        isPassed: true,
        referenceGrade: 'B',
        mondaiBreakdown: [],
      },
      {
        sectionType: 'listening',
        rawScore: 15,
        weightedScore: 35,
        rawMaxScore: 59,
        normalizedScore: 35.59,
        isPassed: true,
        referenceGrade: 'B',
        mondaiBreakdown: [],
      },
    ];

    const total = calculateTotalScore(sectionScores);
    expect(total).toBeCloseTo(131.59, 2);
  });

  it('should return 0 for empty array', () => {
    expect(calculateTotalScore([])).toBe(0);
  });

  it('should round to 2 decimal places', () => {
    const sectionScores: SectionScoringResult[] = [
      {
        sectionType: 'vocabulary',
        rawScore: 20,
        weightedScore: 20,
        rawMaxScore: 35,
        normalizedScore: 34.2857,
        isPassed: true,
        referenceGrade: 'B',
        mondaiBreakdown: [],
      },
    ];

    const total = calculateTotalScore(sectionScores);
    expect(total).toBe(34.29);
  });
});

// ============================================
// Pass/Fail Evaluation Tests
// ============================================

describe('evaluatePassFail', () => {
  describe('N5 Pass/Fail', () => {
    it('should pass with all criteria met', () => {
      const sectionScores: SectionScoringResult[] = [
        {
          sectionType: 'vocabulary',
          normalizedScore: 45,
          rawScore: 0,
          weightedScore: 0,
          rawMaxScore: 0,
          isPassed: true,
          referenceGrade: 'A',
          mondaiBreakdown: [],
        },
        {
          sectionType: 'grammar_reading',
          normalizedScore: 48,
          rawScore: 0,
          weightedScore: 0,
          rawMaxScore: 0,
          isPassed: true,
          referenceGrade: 'A',
          mondaiBreakdown: [],
        },
        {
          sectionType: 'listening',
          normalizedScore: 38,
          rawScore: 0,
          weightedScore: 0,
          rawMaxScore: 0,
          isPassed: true,
          referenceGrade: 'B',
          mondaiBreakdown: [],
        },
      ];

      const result = evaluatePassFail('N5', sectionScores, 131);

      expect(result.isPassed).toBe(true);
      expect(result.totalScore).toBe(131);
      expect(result.sectionsPassed.vocabulary).toBe(true);
      expect(result.sectionsPassed.grammar_reading).toBe(true);
      expect(result.sectionsPassed.listening).toBe(true);
      expect(result.failureReasons).toBeUndefined();
    });

    it('should fail with low total score', () => {
      const sectionScores: SectionScoringResult[] = [
        {
          sectionType: 'vocabulary',
          normalizedScore: 20,
          rawScore: 0,
          weightedScore: 0,
          rawMaxScore: 0,
          isPassed: true,
          referenceGrade: 'C',
          mondaiBreakdown: [],
        },
        {
          sectionType: 'grammar_reading',
          normalizedScore: 25,
          rawScore: 0,
          weightedScore: 0,
          rawMaxScore: 0,
          isPassed: true,
          referenceGrade: 'C',
          mondaiBreakdown: [],
        },
        {
          sectionType: 'listening',
          normalizedScore: 20,
          rawScore: 0,
          weightedScore: 0,
          rawMaxScore: 0,
          isPassed: true,
          referenceGrade: 'C',
          mondaiBreakdown: [],
        },
      ];

      const result = evaluatePassFail('N5', sectionScores, 65);

      expect(result.isPassed).toBe(false);
      expect(result.failureReasons).toContain(
        'Total score 65/180 is below passing threshold 80/180'
      );
    });

    it('should fail with low combined vocabulary + grammar', () => {
      const sectionScores: SectionScoringResult[] = [
        {
          sectionType: 'vocabulary',
          normalizedScore: 15,
          rawScore: 0,
          weightedScore: 0,
          rawMaxScore: 0,
          isPassed: false,
          referenceGrade: 'C',
          mondaiBreakdown: [],
        },
        {
          sectionType: 'grammar_reading',
          normalizedScore: 20,
          rawScore: 0,
          weightedScore: 0,
          rawMaxScore: 0,
          isPassed: false,
          referenceGrade: 'C',
          mondaiBreakdown: [],
        },
        {
          sectionType: 'listening',
          normalizedScore: 50,
          rawScore: 0,
          weightedScore: 0,
          rawMaxScore: 0,
          isPassed: true,
          referenceGrade: 'A',
          mondaiBreakdown: [],
        },
      ];

      const result = evaluatePassFail('N5', sectionScores, 85);

      expect(result.isPassed).toBe(false);
      expect(result.sectionsPassed.vocabulary).toBe(false);
      expect(result.sectionsPassed.grammar_reading).toBe(false);
      expect(result.failureReasons).toContain(
        'Combined Vocabulary + Grammar/Reading score 35/120 is below minimum 38/120'
      );
    });

    it('should fail with low listening score', () => {
      const sectionScores: SectionScoringResult[] = [
        {
          sectionType: 'vocabulary',
          normalizedScore: 40,
          rawScore: 0,
          weightedScore: 0,
          rawMaxScore: 0,
          isPassed: true,
          referenceGrade: 'B',
          mondaiBreakdown: [],
        },
        {
          sectionType: 'grammar_reading',
          normalizedScore: 45,
          rawScore: 0,
          weightedScore: 0,
          rawMaxScore: 0,
          isPassed: true,
          referenceGrade: 'A',
          mondaiBreakdown: [],
        },
        {
          sectionType: 'listening',
          normalizedScore: 15,
          rawScore: 0,
          weightedScore: 0,
          rawMaxScore: 0,
          isPassed: false,
          referenceGrade: 'C',
          mondaiBreakdown: [],
        },
      ];

      const result = evaluatePassFail('N5', sectionScores, 100);

      expect(result.isPassed).toBe(false);
      expect(result.sectionsPassed.listening).toBe(false);
      expect(result.failureReasons).toContain('Listening score 15/60 is below minimum 19/60');
    });
  });

  describe('N3 Pass/Fail', () => {
    it('should require each section to meet 19/60 minimum', () => {
      const sectionScores: SectionScoringResult[] = [
        {
          sectionType: 'vocabulary',
          normalizedScore: 35,
          rawScore: 0,
          weightedScore: 0,
          rawMaxScore: 0,
          isPassed: true,
          referenceGrade: 'B',
          mondaiBreakdown: [],
        },
        {
          sectionType: 'grammar_reading',
          normalizedScore: 18,
          rawScore: 0,
          weightedScore: 0,
          rawMaxScore: 0,
          isPassed: false,
          referenceGrade: 'C',
          mondaiBreakdown: [],
        },
        {
          sectionType: 'listening',
          normalizedScore: 45,
          rawScore: 0,
          weightedScore: 0,
          rawMaxScore: 0,
          isPassed: true,
          referenceGrade: 'A',
          mondaiBreakdown: [],
        },
      ];

      const result = evaluatePassFail('N3', sectionScores, 98);

      expect(result.isPassed).toBe(false);
      expect(result.sectionsPassed.grammar_reading).toBe(false);
      expect(result.failureReasons).toContain('Grammar/Reading score 18/60 is below minimum 19/60');
    });

    it('should pass when all sections ≥19 and total ≥95', () => {
      const sectionScores: SectionScoringResult[] = [
        {
          sectionType: 'vocabulary',
          normalizedScore: 30,
          rawScore: 0,
          weightedScore: 0,
          rawMaxScore: 0,
          isPassed: true,
          referenceGrade: 'B',
          mondaiBreakdown: [],
        },
        {
          sectionType: 'grammar_reading',
          normalizedScore: 38,
          rawScore: 0,
          weightedScore: 0,
          rawMaxScore: 0,
          isPassed: true,
          referenceGrade: 'B',
          mondaiBreakdown: [],
        },
        {
          sectionType: 'listening',
          normalizedScore: 32,
          rawScore: 0,
          weightedScore: 0,
          rawMaxScore: 0,
          isPassed: true,
          referenceGrade: 'B',
          mondaiBreakdown: [],
        },
      ];

      const result = evaluatePassFail('N3', sectionScores, 100);

      expect(result.isPassed).toBe(true);
      expect(result.failureReasons).toBeUndefined();
    });
  });

  describe('N1 Pass/Fail', () => {
    it('should require total ≥100 and each section ≥19', () => {
      const sectionScores: SectionScoringResult[] = [
        {
          sectionType: 'vocabulary',
          normalizedScore: 45,
          rawScore: 0,
          weightedScore: 0,
          rawMaxScore: 0,
          isPassed: true,
          referenceGrade: 'A',
          mondaiBreakdown: [],
        },
        {
          sectionType: 'grammar_reading',
          normalizedScore: 40,
          rawScore: 0,
          weightedScore: 0,
          rawMaxScore: 0,
          isPassed: true,
          referenceGrade: 'A',
          mondaiBreakdown: [],
        },
        {
          sectionType: 'listening',
          normalizedScore: 12,
          rawScore: 0,
          weightedScore: 0,
          rawMaxScore: 0,
          isPassed: false,
          referenceGrade: 'C',
          mondaiBreakdown: [],
        },
      ];

      const result = evaluatePassFail('N1', sectionScores, 97);

      expect(result.isPassed).toBe(false);
      expect(result.failureReasons).toHaveLength(2);
      expect(result.failureReasons).toContain(
        'Total score 97/180 is below passing threshold 100/180'
      );
      expect(result.failureReasons).toContain('Listening score 12/60 is below minimum 19/60');
    });
  });
});

// ============================================
// Offline Calculator Tests
// ============================================

describe('calculateOfflineTestScore', () => {
  it('should calculate N5 offline test correctly', () => {
    const mondaiScores = [
      // Vocabulary
      { sectionType: 'vocabulary' as SectionType, mondaiNumber: 1, correct: 10, total: 12 },
      { sectionType: 'vocabulary' as SectionType, mondaiNumber: 2, correct: 6, total: 8 },
      { sectionType: 'vocabulary' as SectionType, mondaiNumber: 3, correct: 8, total: 10 },
      { sectionType: 'vocabulary' as SectionType, mondaiNumber: 4, correct: 4, total: 5 },
      // Grammar/Reading
      { sectionType: 'grammar_reading' as SectionType, mondaiNumber: 1, correct: 14, total: 16 },
      { sectionType: 'grammar_reading' as SectionType, mondaiNumber: 2, correct: 4, total: 5 },
      { sectionType: 'grammar_reading' as SectionType, mondaiNumber: 3, correct: 4, total: 5 },
      { sectionType: 'grammar_reading' as SectionType, mondaiNumber: 4, correct: 2, total: 3 },
      { sectionType: 'grammar_reading' as SectionType, mondaiNumber: 5, correct: 1, total: 2 },
      { sectionType: 'grammar_reading' as SectionType, mondaiNumber: 6, correct: 1, total: 1 },
      // Listening
      { sectionType: 'listening' as SectionType, mondaiNumber: 1, correct: 5, total: 7 },
      { sectionType: 'listening' as SectionType, mondaiNumber: 2, correct: 4, total: 6 },
      { sectionType: 'listening' as SectionType, mondaiNumber: 3, correct: 3, total: 5 },
      { sectionType: 'listening' as SectionType, mondaiNumber: 4, correct: 4, total: 6 },
    ];

    const results = calculateOfflineTestScore('N5', mondaiScores);

    expect(results).toHaveLength(3);

    const vocabResult = results.find(r => r.sectionType === 'vocabulary');
    expect(vocabResult).toBeDefined();
    expect(vocabResult!.rawScore).toBe(28);
    expect(vocabResult!.weightedScore).toBe(28);
    expect(vocabResult!.normalizedScore).toBeCloseTo(48, 1);

    const grammarResult = results.find(r => r.sectionType === 'grammar_reading');
    expect(grammarResult).toBeDefined();
    expect(grammarResult!.rawScore).toBe(26);
    // Weighted: 14×1 + 4×1 + 4×1 + 2×4 + 1×4 + 1×4 = 14+4+4+8+4+4 = 38
    expect(grammarResult!.weightedScore).toBe(38);
    expect(grammarResult!.normalizedScore).toBeCloseTo(45.6, 1);

    const listeningResult = results.find(r => r.sectionType === 'listening');
    expect(listeningResult).toBeDefined();
    expect(listeningResult!.rawScore).toBe(16);
  });
});

// ============================================
// Validation Tests
// ============================================

describe('validateMondaiScores', () => {
  it('should validate correct N5 vocabulary mondai scores', () => {
    const mondaiScores = [
      { mondaiNumber: 1, total: 12 },
      { mondaiNumber: 2, total: 8 },
      { mondaiNumber: 3, total: 10 },
      { mondaiNumber: 4, total: 5 },
    ];

    const result = validateMondaiScores('N5', 'vocabulary', mondaiScores);

    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('should detect missing mondai', () => {
    const mondaiScores = [
      { mondaiNumber: 1, total: 12 },
      { mondaiNumber: 2, total: 8 },
      // Missing mondai 3 and 4
    ];

    const result = validateMondaiScores('N5', 'vocabulary', mondaiScores);

    expect(result.valid).toBe(false);
    expect(result.errors).toContain('Missing mondai 3 for vocabulary');
    expect(result.errors).toContain('Missing mondai 4 for vocabulary');
  });

  it('should detect incorrect question counts', () => {
    const mondaiScores = [
      { mondaiNumber: 1, total: 10 }, // Should be 12
      { mondaiNumber: 2, total: 8 },
      { mondaiNumber: 3, total: 10 },
      { mondaiNumber: 4, total: 5 },
    ];

    const result = validateMondaiScores('N5', 'vocabulary', mondaiScores);

    expect(result.valid).toBe(false);
    expect(result.errors).toContain('Mondai 1: expected 12 questions, got 10');
  });

  it('should detect unexpected mondai', () => {
    const mondaiScores = [
      { mondaiNumber: 1, total: 12 },
      { mondaiNumber: 2, total: 8 },
      { mondaiNumber: 3, total: 10 },
      { mondaiNumber: 4, total: 5 },
      { mondaiNumber: 5, total: 5 }, // Unexpected for N5 vocabulary
    ];

    const result = validateMondaiScores('N5', 'vocabulary', mondaiScores);

    expect(result.valid).toBe(false);
    expect(result.errors).toContain('Unexpected mondai 5 for vocabulary');
  });
});

// ============================================
// Helper Functions Tests
// ============================================

describe('getPassingThresholds', () => {
  it('should return correct thresholds for each level', () => {
    expect(getPassingThresholds('N5')).toEqual({ overall: 80, sectional: 19 });
    expect(getPassingThresholds('N4')).toEqual({ overall: 90, sectional: 19 });
    expect(getPassingThresholds('N3')).toEqual({ overall: 95, sectional: 19 });
    expect(getPassingThresholds('N2')).toEqual({ overall: 90, sectional: 19 });
    expect(getPassingThresholds('N1')).toEqual({ overall: 100, sectional: 19 });
  });
});

describe('getCombinedSectionalMinimum', () => {
  it('should return 38 for N4/N5 combined minimum', () => {
    expect(getCombinedSectionalMinimum()).toBe(38);
  });
});
