/**
 * JLPT Mondai Configuration
 *
 * Static reference data for JLPT test structure, weights, and question counts.
 * Moved from database to application config for type safety and simplicity.
 *
 * @see docs/jlpttest/01-database-design-v2.md
 * @see docs/jlpttest/02-test-level-details.md
 */

export type JLPTLevel = 'N5' | 'N4' | 'N3' | 'N2' | 'N1';
export type SectionType = 'vocabulary' | 'grammar_reading' | 'listening';

export interface MondaiInfo {
  number: number;
  weight: number;
  questions_count: number;
}

export interface SectionConfig {
  mondai: MondaiInfo[];
}

export interface LevelConfig {
  vocabulary: SectionConfig;
  grammar_reading: SectionConfig;
  listening: SectionConfig;
}

/**
 * Complete JLPT Mondai Configuration
 *
 * Structure per level:
 * - vocabulary: 文字・語彙 (Kanji & Vocabulary)
 * - grammar_reading: 文法・読解 (Grammar & Reading)
 * - listening: 聴解 (Listening)
 */
export const MONDAI_CONFIG: Record<JLPTLevel, LevelConfig> = {
  N5: {
    vocabulary: {
      mondai: [
        { number: 1, weight: 1, questions_count: 12 }, // Kanji reading
        { number: 2, weight: 1, questions_count: 8 }, // Kanji writing
        { number: 3, weight: 1, questions_count: 10 }, // Context usage
        { number: 4, weight: 1, questions_count: 5 }, // Paraphrase
      ],
    },
    grammar_reading: {
      mondai: [
        { number: 1, weight: 1, questions_count: 16 }, // Grammar form
        { number: 2, weight: 1, questions_count: 5 }, // Sentence composition
        { number: 3, weight: 1, questions_count: 5 }, // Text grammar
        { number: 4, weight: 4, questions_count: 3 }, // Short reading
        { number: 5, weight: 4, questions_count: 2 }, // Mid reading
        { number: 6, weight: 4, questions_count: 1 }, // Information retrieval
      ],
    },
    listening: {
      mondai: [
        { number: 1, weight: 2, questions_count: 7 }, // Task-based
        { number: 2, weight: 2.5, questions_count: 6 }, // Point comprehension
        { number: 3, weight: 3, questions_count: 5 }, // Utterance expressions
        { number: 4, weight: 2.5, questions_count: 6 }, // Quick response
      ],
    },
  },

  N4: {
    vocabulary: {
      mondai: [
        { number: 1, weight: 1, questions_count: 9 }, // Kanji reading
        { number: 2, weight: 1, questions_count: 6 }, // Kanji writing
        { number: 3, weight: 1, questions_count: 10 }, // Context usage
        { number: 4, weight: 2, questions_count: 5 }, // Paraphrase
        { number: 5, weight: 2, questions_count: 5 }, // Word usage
      ],
    },
    grammar_reading: {
      mondai: [
        { number: 1, weight: 1, questions_count: 15 }, // Grammar form
        { number: 2, weight: 1, questions_count: 5 }, // Sentence composition
        { number: 3, weight: 1, questions_count: 5 }, // Text grammar
        { number: 4, weight: 7, questions_count: 4 }, // Short reading
        { number: 5, weight: 7, questions_count: 4 }, // Mid reading
        { number: 6, weight: 9, questions_count: 2 }, // Information retrieval
      ],
    },
    listening: {
      mondai: [
        { number: 1, weight: 2, questions_count: 8 }, // Task-based
        { number: 2, weight: 2, questions_count: 7 }, // Point comprehension
        { number: 3, weight: 4, questions_count: 5 }, // Utterance expressions
        { number: 4, weight: 1.5, questions_count: 8 }, // Quick response
      ],
    },
  },

  N3: {
    vocabulary: {
      mondai: [
        { number: 1, weight: 1, questions_count: 8 }, // Kanji reading
        { number: 2, weight: 1, questions_count: 6 }, // Kanji writing
        { number: 3, weight: 1, questions_count: 11 }, // Context usage
        { number: 4, weight: 1, questions_count: 5 }, // Paraphrase
        { number: 5, weight: 1, questions_count: 5 }, // Word usage
      ],
    },
    grammar_reading: {
      mondai: [
        { number: 1, weight: 1, questions_count: 13 }, // Grammar form
        { number: 2, weight: 1, questions_count: 5 }, // Sentence composition
        { number: 3, weight: 1, questions_count: 5 }, // Text grammar
        { number: 4, weight: 3, questions_count: 4 }, // Short reading
        { number: 5, weight: 4, questions_count: 6 }, // Mid reading
        { number: 6, weight: 4, questions_count: 4 }, // Long reading
        { number: 7, weight: 4, questions_count: 2 }, // Information retrieval
      ],
    },
    listening: {
      mondai: [
        { number: 1, weight: 2, questions_count: 6 }, // Task-based
        { number: 2, weight: 2, questions_count: 6 }, // Point comprehension
        { number: 3, weight: 2, questions_count: 4 }, // Utterance expressions
        { number: 4, weight: 2, questions_count: 9 }, // Quick response
      ],
    },
  },

  N2: {
    vocabulary: {
      mondai: [
        { number: 1, weight: 1, questions_count: 5 }, // Kanji reading
        { number: 2, weight: 1, questions_count: 5 }, // Kanji writing
        { number: 3, weight: 1, questions_count: 5 }, // Word formation
        { number: 4, weight: 1, questions_count: 7 }, // Context usage
        { number: 5, weight: 1, questions_count: 5 }, // Paraphrase
        { number: 6, weight: 2, questions_count: 5 }, // Word usage
        { number: 7, weight: 1, questions_count: 12 }, // Grammar form
        { number: 8, weight: 1, questions_count: 5 }, // Sentence composition
        { number: 9, weight: 1, questions_count: 5 }, // Text grammar
      ],
    },
    grammar_reading: {
      mondai: [
        { number: 10, weight: 2, questions_count: 5 }, // Short reading
        { number: 11, weight: 2, questions_count: 9 }, // Mid reading
        { number: 12, weight: 3, questions_count: 2 }, // Integrated comprehension
        { number: 13, weight: 4, questions_count: 3 }, // Thematic comprehension
        { number: 14, weight: 4, questions_count: 2 }, // Information retrieval
      ],
    },
    listening: {
      mondai: [
        { number: 1, weight: 2, questions_count: 5 }, // Task-based
        { number: 2, weight: 2, questions_count: 6 }, // Point comprehension
        { number: 3, weight: 2, questions_count: 5 }, // Utterance expressions
        { number: 4, weight: 1, questions_count: 12 }, // Quick response
        { number: 5, weight: 3, questions_count: 4 }, // Integrated comprehension
      ],
    },
  },

  N1: {
    vocabulary: {
      mondai: [
        { number: 1, weight: 1, questions_count: 6 }, // Kanji reading
        { number: 2, weight: 1, questions_count: 7 }, // Context usage
        { number: 3, weight: 1, questions_count: 6 }, // Paraphrase/similar meaning
        { number: 4, weight: 1, questions_count: 6 }, // Word usage
        { number: 5, weight: 1, questions_count: 10 }, // Grammar form
        { number: 6, weight: 2, questions_count: 5 }, // Sentence composition
        { number: 7, weight: 1, questions_count: 5 }, // Text grammar
      ],
    },
    grammar_reading: {
      mondai: [
        { number: 8, weight: 1, questions_count: 4 }, // Short reading
        { number: 9, weight: 1, questions_count: 9 }, // Mid reading
        { number: 10, weight: 2, questions_count: 4 }, // Long reading
        { number: 11, weight: 2, questions_count: 2 }, // Comparison/contrast
        { number: 12, weight: 3, questions_count: 4 }, // Integrated comprehension
        { number: 13, weight: 4, questions_count: 2 }, // Information retrieval
      ],
    },
    listening: {
      mondai: [
        { number: 1, weight: 2, questions_count: 6 }, // Task-based
        { number: 2, weight: 2, questions_count: 7 }, // Point comprehension
        { number: 3, weight: 2, questions_count: 6 }, // Utterance expressions
        { number: 4, weight: 1, questions_count: 14 }, // Quick response
        { number: 5, weight: 3, questions_count: 4 }, // Integrated comprehension
      ],
    },
  },
} as const;

/**
 * Get mondai weight for a specific level/section/mondai combination
 *
 * @throws Error if mondai configuration not found
 */
export function getMondaiWeight(
  level: JLPTLevel,
  section: SectionType,
  mondaiNumber: number
): number {
  const sectionConfig = MONDAI_CONFIG[level][section];
  const mondai = sectionConfig.mondai.find(m => m.number === mondaiNumber);

  if (!mondai) {
    throw new Error(`Invalid mondai configuration: ${level} ${section} 問題${mondaiNumber}`);
  }

  return mondai.weight;
}

/**
 * Get expected question count for a specific mondai
 *
 * @throws Error if mondai configuration not found
 */
export function getQuestionsPerMondai(
  level: JLPTLevel,
  section: SectionType,
  mondaiNumber: number
): number {
  const sectionConfig = MONDAI_CONFIG[level][section];
  const mondai = sectionConfig.mondai.find(m => m.number === mondaiNumber);

  if (!mondai) {
    throw new Error(`Invalid mondai configuration: ${level} ${section} 問題${mondaiNumber}`);
  }

  return mondai.questions_count;
}

/**
 * Get all mondai numbers for a section
 */
export function getMondaiNumbers(level: JLPTLevel, section: SectionType): number[] {
  return MONDAI_CONFIG[level][section].mondai.map(m => m.number);
}

/**
 * Get total question count for a section
 */
export function getTotalQuestionsForSection(level: JLPTLevel, section: SectionType): number {
  return MONDAI_CONFIG[level][section].mondai.reduce((sum, m) => sum + m.questions_count, 0);
}

/**
 * Get total question count for entire level
 */
export function getTotalQuestionsForLevel(level: JLPTLevel): number {
  const sections: SectionType[] = ['vocabulary', 'grammar_reading', 'listening'];
  return sections.reduce((sum, section) => sum + getTotalQuestionsForSection(level, section), 0);
}

/**
 * Get maximum raw score for a section (sum of all weighted questions)
 */
export function getMaxRawScoreForSection(level: JLPTLevel, section: SectionType): number {
  return MONDAI_CONFIG[level][section].mondai.reduce(
    (sum, m) => sum + m.weight * m.questions_count,
    0
  );
}

/**
 * Validate if a mondai exists in the configuration
 */
export function isValidMondai(
  level: JLPTLevel,
  section: SectionType,
  mondaiNumber: number
): boolean {
  const sectionConfig = MONDAI_CONFIG[level][section];
  return sectionConfig.mondai.some(m => m.number === mondaiNumber);
}

/**
 * Get mondai info object
 */
export function getMondaiInfo(
  level: JLPTLevel,
  section: SectionType,
  mondaiNumber: number
): MondaiInfo {
  const sectionConfig = MONDAI_CONFIG[level][section];
  const mondai = sectionConfig.mondai.find(m => m.number === mondaiNumber);

  if (!mondai) {
    throw new Error(`Invalid mondai configuration: ${level} ${section} 問題${mondaiNumber}`);
  }

  return mondai;
}

/**
 * Calculate weighted score for user answers in a mondai
 */
export function calculateMondaiWeightedScore(
  level: JLPTLevel,
  section: SectionType,
  mondaiNumber: number,
  correctCount: number
): number {
  const weight = getMondaiWeight(level, section, mondaiNumber);
  return correctCount * weight;
}

/**
 * Calculate raw max score for a mondai
 */
export function getMondaiMaxScore(
  level: JLPTLevel,
  section: SectionType,
  mondaiNumber: number
): number {
  const mondai = getMondaiInfo(level, section, mondaiNumber);
  return mondai.weight * mondai.questions_count;
}

// Type exports for database validation
