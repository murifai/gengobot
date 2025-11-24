import { toKatakana, isRomaji as wanakanaIsRomaji } from 'wanakana';

/**
 * Convert romaji text to katakana
 */
export function romajiToKatakana(romaji: string): string {
  return toKatakana(romaji);
}

/**
 * Check if text is romaji
 */
export function isRomaji(text: string): boolean {
  return wanakanaIsRomaji(text);
}

/**
 * Convert name to katakana if it's romaji, otherwise keep original
 * Returns both display name (converted) and original romaji (if applicable)
 */
export function convertNameIfNeeded(name: string): {
  displayName: string;
  romajiName: string | null;
} {
  const trimmedName = name.trim();

  if (isRomaji(trimmedName)) {
    return {
      displayName: romajiToKatakana(trimmedName),
      romajiName: trimmedName,
    };
  }

  return {
    displayName: trimmedName,
    romajiName: null,
  };
}
