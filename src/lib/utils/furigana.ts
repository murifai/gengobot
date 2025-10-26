// Utility functions for displaying furigana (ruby text) in Japanese text

import Kuroshiro from 'kuroshiro';
import KuromojiAnalyzer from 'kuroshiro-analyzer-kuromoji';

// Singleton instance for kuroshiro
let kuroshiroInstance: Kuroshiro | null = null;
let initPromise: Promise<void> | null = null;

/**
 * Initialize kuroshiro instance (singleton)
 * @returns Promise that resolves when kuroshiro is ready
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
 * Convert Japanese text to HTML ruby tags using automatic furigana detection
 * @param text - Japanese text
 * @returns Promise<HTML string with ruby tags>
 */
export async function convertToRubyAuto(text: string): Promise<string> {
  try {
    await initKuroshiro();
    if (!kuroshiroInstance) {
      throw new Error('Kuroshiro not initialized');
    }

    const result = await kuroshiroInstance.convert(text, {
      to: 'hiragana',
      mode: 'furigana',
    });

    return result;
  } catch (error) {
    console.error('Error converting to furigana:', error);
    return text; // Return original text on error
  }
}

/**
 * Convert text with furigana notation to HTML ruby tags
 * Supports format: 漢字[かんじ] or 漢字(かんじ)
 * @param text - Text with furigana notation
 * @returns HTML string with ruby tags
 */
export function convertToRuby(text: string): string {
  // Pattern to match: 漢字[かんじ] or 漢字(かんじ)
  const furiganaPattern = /([一-龯々〆ヵヶ]+)[\[(]([ぁ-んァ-ヶー]+)[\])]/g;

  return text.replace(furiganaPattern, (match, kanji, reading) => {
    return `<ruby>${kanji}<rt>${reading}</rt></ruby>`;
  });
}

/**
 * Check if text contains furigana notation
 * @param text - Text to check
 * @returns true if text contains furigana notation
 */
export function hasFurigana(text: string): boolean {
  const furiganaPattern = /[一-龯々〆ヵヶ]+[\[(][ぁ-んァ-ヶー]+[\])]/;
  return furiganaPattern.test(text);
}

/**
 * Check if text contains kanji characters
 * @param text - Text to check
 * @returns true if text contains kanji
 */
export function hasKanji(text: string): boolean {
  const kanjiPattern = /[一-龯々〆ヵヶ]/;
  return kanjiPattern.test(text);
}

/**
 * Parse text with furigana notation into structured data
 * @param text - Text with furigana notation
 * @returns Array of text segments with optional furigana
 */
export function parseFurigana(text: string): Array<{
  text: string;
  furigana?: string;
}> {
  const segments: Array<{ text: string; furigana?: string }> = [];
  const furiganaPattern = /([一-龯々〆ヵヶ]+)[\[(]([ぁ-んァ-ヶー]+)[\])]/g;

  let lastIndex = 0;
  let match;

  while ((match = furiganaPattern.exec(text)) !== null) {
    // Add text before the match
    if (match.index > lastIndex) {
      segments.push({ text: text.slice(lastIndex, match.index) });
    }

    // Add the kanji with furigana
    segments.push({
      text: match[1], // kanji
      furigana: match[2], // reading
    });

    lastIndex = match.index + match[0].length;
  }

  // Add remaining text
  if (lastIndex < text.length) {
    segments.push({ text: text.slice(lastIndex) });
  }

  return segments;
}
