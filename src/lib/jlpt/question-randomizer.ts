/**
 * JLPT Question Randomizer
 *
 * Handles deterministic shuffling of questions and answer choices
 * using a seed-based approach for consistent display across sessions
 */

import type { JLPTLevel, SectionType, QuestionSnapshot, MondaiQuestions } from './types';
import { MONDAI_CONFIG } from '@/config/jlpt-mondai';

/**
 * Seeded random number generator (LCG algorithm)
 * Provides deterministic randomization based on a seed
 */
class SeededRandom {
  private seed: number;

  constructor(seed: string) {
    // Convert string seed to number
    this.seed = this.hashString(seed);
  }

  private hashString(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash);
  }

  /**
   * Generate next random number between 0 and 1
   */
  next(): number {
    // Linear Congruential Generator
    this.seed = (this.seed * 9301 + 49297) % 233280;
    return this.seed / 233280;
  }

  /**
   * Shuffle an array deterministically
   */
  shuffle<T>(array: T[]): T[] {
    const result = [...array];
    for (let i = result.length - 1; i > 0; i--) {
      const j = Math.floor(this.next() * (i + 1));
      [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
  }
}

/**
 * Generate a unique shuffle seed
 */
export function generateShuffleSeed(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
}

/**
 * Shuffle questions within each mondai while maintaining mondai structure
 *
 * @param questionIds - Array of question IDs for a mondai
 * @param seed - Shuffle seed for deterministic randomization
 * @returns Shuffled array of question IDs
 */
export function shuffleQuestionsInMondai(questionIds: string[], seed: string): string[] {
  if (questionIds.length <= 1) return questionIds;

  const rng = new SeededRandom(`${seed}-mondai`);
  return rng.shuffle(questionIds);
}

/**
 * Shuffle answer choices deterministically
 *
 * @param questionId - Question ID to create unique seed
 * @param shuffleSeed - Base shuffle seed
 * @returns Array of shuffled choice numbers [1,2,3,4]
 */
export function getShuffledChoices(questionId: string, shuffleSeed: string): number[] {
  const seed = `${shuffleSeed}-${questionId}`;
  const rng = new SeededRandom(seed);
  return rng.shuffle([1, 2, 3, 4]);
}

/**
 * Create a question snapshot for a section
 * Groups questions by mondai
 *
 * @param level - JLPT level
 * @param sectionType - Section type
 * @param questionIds - All question IDs for this section
 * @param shuffleSeed - Seed for randomization
 * @returns Question snapshot organized by mondai
 */
export function createSectionSnapshot(
  level: JLPTLevel,
  sectionType: SectionType,
  questionIds: string[],
  shuffleSeed: string
): MondaiQuestions[] {
  const sectionConfig = MONDAI_CONFIG[level][sectionType];
  const snapshot: MondaiQuestions[] = [];

  let currentIndex = 0;

  for (const mondai of sectionConfig.mondai) {
    const mondaiQuestions = questionIds.slice(currentIndex, currentIndex + mondai.questions_count);

    // Shuffle questions within this mondai
    const shuffled = shuffleQuestionsInMondai(
      mondaiQuestions,
      `${shuffleSeed}-${sectionType}-${mondai.number}`
    );

    snapshot.push({
      mondaiNumber: mondai.number,
      questionIds: shuffled,
    });

    currentIndex += mondai.questions_count;
  }

  return snapshot;
}

/**
 * Create complete test snapshot with all sections
 *
 * @param level - JLPT level
 * @param vocabularyQuestions - Question IDs for vocabulary section
 * @param grammarReadingQuestions - Question IDs for grammar/reading section
 * @param listeningQuestions - Question IDs for listening section
 * @param shuffleSeed - Seed for deterministic randomization
 * @returns Complete test snapshot
 */
export function createTestSnapshot(
  level: JLPTLevel,
  vocabularyQuestions: string[],
  grammarReadingQuestions: string[],
  listeningQuestions: string[],
  shuffleSeed: string
): QuestionSnapshot {
  return {
    vocabulary: createSectionSnapshot(level, 'vocabulary', vocabularyQuestions, shuffleSeed),
    grammar_reading: createSectionSnapshot(
      level,
      'grammar_reading',
      grammarReadingQuestions,
      shuffleSeed
    ),
    listening: createSectionSnapshot(level, 'listening', listeningQuestions, shuffleSeed),
  };
}

/**
 * Get all question IDs from a snapshot in order
 */
export function getQuestionIdsFromSnapshot(snapshot: MondaiQuestions[]): string[] {
  return snapshot.flatMap(mondai => mondai.questionIds);
}

/**
 * Get question by index in a section snapshot
 */
export function getQuestionAtIndex(
  snapshot: MondaiQuestions[],
  index: number
): { questionId: string; mondaiNumber: number } | null {
  let currentIndex = 0;

  for (const mondai of snapshot) {
    if (index < currentIndex + mondai.questionIds.length) {
      const localIndex = index - currentIndex;
      return {
        questionId: mondai.questionIds[localIndex],
        mondaiNumber: mondai.mondaiNumber,
      };
    }
    currentIndex += mondai.questionIds.length;
  }

  return null;
}

/**
 * Get mondai number for a question ID
 */
export function getMondaiForQuestion(
  snapshot: MondaiQuestions[],
  questionId: string
): number | null {
  for (const mondai of snapshot) {
    if (mondai.questionIds.includes(questionId)) {
      return mondai.mondaiNumber;
    }
  }
  return null;
}
