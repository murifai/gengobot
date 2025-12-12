'use client';

import { useState, useCallback, useMemo } from 'react';
import { VocabularyPopup } from './VocabularyPopup';

interface ClickableJapaneseProps {
  text: string;
  className?: string;
}

// Regex to detect Japanese characters (hiragana, katakana, kanji)
const JAPANESE_REGEX = /[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]+/g;

interface TextPart {
  text: string;
  isJapanese: boolean;
  key: number;
}

export function ClickableJapanese({ text, className }: ClickableJapaneseProps) {
  const [popup, setPopup] = useState<{ word: string; x: number; y: number } | null>(null);

  const handleWordClick = useCallback((word: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setPopup({
      word,
      x: e.clientX,
      y: e.clientY,
    });
  }, []);

  const closePopup = useCallback(() => {
    setPopup(null);
  }, []);

  // Split text into Japanese and non-Japanese parts
  const parts = useMemo((): TextPart[] => {
    const result: TextPart[] = [];
    let lastIndex = 0;
    let keyCounter = 0;

    // Reset regex lastIndex
    JAPANESE_REGEX.lastIndex = 0;

    let match;
    while ((match = JAPANESE_REGEX.exec(text)) !== null) {
      // Add non-Japanese text before this match
      if (match.index > lastIndex) {
        result.push({
          text: text.slice(lastIndex, match.index),
          isJapanese: false,
          key: keyCounter++,
        });
      }

      // Add Japanese text
      result.push({
        text: match[0],
        isJapanese: true,
        key: keyCounter++,
      });

      lastIndex = match.index + match[0].length;
    }

    // Add remaining non-Japanese text
    if (lastIndex < text.length) {
      result.push({
        text: text.slice(lastIndex),
        isJapanese: false,
        key: keyCounter++,
      });
    }

    return result;
  }, [text]);

  // If no Japanese text, just render the text normally
  if (!parts.some(p => p.isJapanese)) {
    return <span className={className}>{text}</span>;
  }

  return (
    <>
      <span className={className}>
        {parts.map(part =>
          part.isJapanese ? (
            <span
              key={part.key}
              onClick={e => handleWordClick(part.text, e)}
              className="cursor-pointer hover:bg-primary/30 dark:hover:bg-primary/40 hover:underline decoration-primary/70 rounded px-0.5 transition-colors font-japanese"
              title="Klik untuk lihat arti"
            >
              {part.text}
            </span>
          ) : (
            <span key={part.key}>{part.text}</span>
          )
        )}
      </span>

      {popup && (
        <VocabularyPopup
          word={popup.word}
          position={{ x: popup.x, y: popup.y }}
          onClose={closePopup}
        />
      )}
    </>
  );
}
