// Japanese text parser using Kuroshiro/Kuromoji for word tokenization

import Kuroshiro from 'kuroshiro';
import KuromojiAnalyzer from 'kuroshiro-analyzer-kuromoji';

export interface JapaneseToken {
  surface: string; // The actual text (e.g., "食べる")
  reading?: string; // Hiragana reading (e.g., "たべる")
  pronunciation?: string; // Romaji (optional)
  partOfSpeech?: string; // Grammar type (verb, noun, etc.)
  baseForm?: string; // Dictionary form
  meaning?: string; // Indonesian translation (to be added via API)
}

// Singleton instance for kuroshiro
let kuroshiroInstance: Kuroshiro | null = null;
let initPromise: Promise<void> | null = null;

/**
 * Initialize kuroshiro instance (singleton)
 */
async function initKuroshiro(): Promise<void> {
  if (kuroshiroInstance) return;

  if (initPromise) {
    await initPromise;
    return;
  }

  initPromise = (async () => {
    kuroshiroInstance = new Kuroshiro();
    await kuroshiroInstance.init(
      new KuromojiAnalyzer({
        dictPath: '/dict/',
      })
    );
  })();

  await initPromise;
}

/**
 * Parse Japanese text into tokens with readings
 * @param text - Japanese text to parse
 * @returns Array of tokens with surface form and readings
 */
export async function parseJapaneseText(text: string): Promise<JapaneseToken[]> {
  try {
    await initKuroshiro();

    if (!kuroshiroInstance) {
      throw new Error('Kuroshiro not initialized');
    }

    // Get the analyzer instance to access tokenize method
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const analyzer = (kuroshiroInstance as any)._analyzer;

    if (!analyzer || !analyzer.parse) {
      throw new Error('Analyzer not available');
    }

    // Tokenize the text
    const tokens = await analyzer.parse(text);

    console.log('[Parser] Raw Kuromoji tokens:', tokens.slice(0, 5)); // Log first 5 tokens for debugging

    // Convert to our token format
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result = tokens.map((token: any) => {
      // Determine part of speech in English
      let partOfSpeech = '';
      if (token.pos && token.pos.length > 0) {
        const pos = token.pos[0];
        if (pos === '名詞') partOfSpeech = 'noun';
        else if (pos === '動詞') partOfSpeech = 'verb';
        else if (pos === '形容詞') partOfSpeech = 'adjective';
        else if (pos === '副詞') partOfSpeech = 'adverb';
        else if (pos === '助詞') partOfSpeech = 'particle';
        else if (pos === '助動詞') partOfSpeech = 'auxiliary verb';
        else if (pos === '接続詞') partOfSpeech = 'conjunction';
        else partOfSpeech = pos;
      }

      const formatted = {
        surface: token.surface_form || token.word || '',
        reading: token.reading || token.pronunciation || undefined,
        pronunciation: token.pronunciation || undefined,
        partOfSpeech: partOfSpeech || undefined,
        baseForm: token.basic_form || undefined,
      };

      return formatted;
    });

    console.log('[Parser] Formatted tokens:', result.slice(0, 5)); // Log first 5 formatted tokens

    return result;
  } catch (error) {
    console.error('Error parsing Japanese text:', error);
    // Return simple character-by-character tokens as fallback
    return text.split('').map(char => ({
      surface: char,
    }));
  }
}

/**
 * Get Indonesian translation for a Japanese word
 * NOTE: This function is deprecated. Use getTranslation from offline-dictionary.ts instead
 * for better performance and cost savings.
 *
 * @param word - Japanese word
 * @param reading - Hiragana reading
 * @param context - Optional context for better translation
 * @returns Indonesian translation
 */
export async function getIndonesianTranslation(
  word: string,
  reading?: string,
  context?: string
): Promise<string | null> {
  // Import dynamically to avoid circular dependencies
  const { getTranslation } = await import('./offline-dictionary');
  return getTranslation(word, reading, undefined, context, true);
}

/**
 * Enrich tokens with Indonesian translations
 * @param tokens - Array of tokens
 * @returns Tokens with meanings added
 */
export async function enrichTokensWithMeanings(tokens: JapaneseToken[]): Promise<JapaneseToken[]> {
  const enrichedTokens = await Promise.all(
    tokens.map(async token => {
      // Only translate content words (nouns, verbs, adjectives)
      const shouldTranslate =
        token.partOfSpeech === 'noun' ||
        token.partOfSpeech === 'verb' ||
        token.partOfSpeech === 'adjective';

      if (shouldTranslate && token.surface) {
        const meaning = await getIndonesianTranslation(token.surface, token.reading);
        return { ...token, meaning: meaning || undefined };
      }

      return token;
    })
  );

  return enrichedTokens;
}
