/**
 * Shuffle choices deterministically based on question ID and seed
 */

import type { JLPTAnswerChoice } from './types';

/**
 * Seeded random number generator
 * Uses a simple LCG (Linear Congruential Generator) algorithm
 */
function seededRandom(seed: number): () => number {
  let current = seed;
  return () => {
    current = (current * 1103515245 + 12345) & 0x7fffffff;
    return current / 0x7fffffff;
  };
}

/**
 * Convert string to seed number
 */
function stringToSeed(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash);
}

/**
 * Shuffle array using Fisher-Yates algorithm with seeded random
 */
function shuffleArray<T>(array: T[], seed: number): T[] {
  const result = [...array];
  const random = seededRandom(seed);

  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }

  return result;
}

/**
 * Shuffle answer choices deterministically based on question ID and shuffle seed
 *
 * @param choices - Original answer choices
 * @param questionId - Unique question ID
 * @param shuffleSeed - Test-level shuffle seed
 * @returns Shuffled choices maintaining original choiceNumber for grading
 */
export function shuffleChoices(
  choices: JLPTAnswerChoice[],
  questionId: string,
  shuffleSeed: string
): JLPTAnswerChoice[] {
  // Combine questionId and shuffleSeed for deterministic but unique shuffle per question
  const combinedSeed = stringToSeed(`${questionId}-${shuffleSeed}`);

  // Shuffle the choices
  return shuffleArray(choices, combinedSeed);
}
