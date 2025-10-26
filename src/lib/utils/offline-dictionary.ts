// Offline Japanese-Indonesian dictionary with ChatGPT fallback

import jaIdDictionary from '@/lib/dictionaries/ja-id-dictionary.json';

/**
 * In-memory cache for translations (to avoid repeated API calls)
 */
const translationCache = new Map<string, string>();

/**
 * Look up word in offline dictionary
 * @param word - Japanese word (kanji, hiragana, or katakana)
 * @param baseForm - Dictionary form of the word (optional)
 * @returns Indonesian translation or null if not found
 */
export function lookupOffline(word: string, baseForm?: string): string | null {
  // Try exact match first
  if (word in jaIdDictionary) {
    return jaIdDictionary[word as keyof typeof jaIdDictionary];
  }

  // Try base form (dictionary form)
  if (baseForm && baseForm in jaIdDictionary) {
    return jaIdDictionary[baseForm as keyof typeof jaIdDictionary];
  }

  return null;
}

/**
 * Get Indonesian translation using hybrid approach:
 * 1. Check in-memory cache
 * 2. Try offline dictionary
 * 3. Fall back to ChatGPT API (only if needed)
 *
 * @param word - Japanese word
 * @param reading - Hiragana reading (optional)
 * @param baseForm - Dictionary form (optional)
 * @param context - Full sentence for context (optional)
 * @param useAI - Whether to use AI fallback (default: true)
 * @returns Indonesian translation or null if not found
 */
export async function getTranslation(
  word: string,
  reading?: string,
  baseForm?: string,
  context?: string,
  useAI: boolean = true
): Promise<string | null> {
  // 1. Check cache first (fastest)
  const cacheKey = `${word}:${baseForm || ''}`;
  if (translationCache.has(cacheKey)) {
    return translationCache.get(cacheKey)!;
  }

  // 2. Try offline dictionary (free, instant)
  const offlineResult = lookupOffline(word, baseForm);
  if (offlineResult) {
    translationCache.set(cacheKey, offlineResult);
    return offlineResult;
  }

  // 3. Fall back to AI only if enabled (costs money)
  if (useAI) {
    try {
      const response = await fetch('/api/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ word, reading, context }),
      });

      if (response.ok) {
        const data = await response.json();
        const translation = data.translation;

        if (translation) {
          // Cache AI translation for future use
          translationCache.set(cacheKey, translation);
          return translation;
        }
      }
    } catch (error) {
      console.error('AI translation failed:', error);
    }
  }

  return null;
}

/**
 * Get dictionary statistics
 */
export function getDictionaryStats() {
  const offlineCount = Object.keys(jaIdDictionary).length;
  const cachedCount = translationCache.size;

  return {
    offlineWords: offlineCount,
    cachedTranslations: cachedCount,
    totalAvailable: offlineCount + cachedCount,
  };
}

/**
 * Check if AI fallback is needed for a word
 */
export function needsAITranslation(word: string, baseForm?: string): boolean {
  const cacheKey = `${word}:${baseForm || ''}`;

  // Already cached or in offline dictionary
  if (translationCache.has(cacheKey)) return false;
  if (lookupOffline(word, baseForm)) return false;

  return true;
}

/**
 * Pre-cache common words on app startup (optional)
 */
export function preloadCommonWords() {
  // Dictionary is already loaded as JSON module
  console.log(`✅ Offline dictionary loaded: ${Object.keys(jaIdDictionary).length} words`);
}
