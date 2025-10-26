// Utility functions for displaying furigana (ruby text) in Japanese text

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
