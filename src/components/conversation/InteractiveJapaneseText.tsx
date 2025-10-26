'use client';

import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { parseJapaneseText, type JapaneseToken } from '@/lib/utils/japanese-parser';
import { getTranslation } from '@/lib/utils/offline-dictionary';

interface WordPopupProps {
  word: JapaneseToken;
  position: { x: number; y: number };
  onClose: () => void;
}

function WordPopup({ word, position, onClose }: WordPopupProps) {
  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-40" onClick={onClose} />

      {/* Popup */}
      <div
        className="fixed z-50 bg-white dark:bg-gray-800 rounded-lg shadow-2xl border-2 border-primary p-4 min-w-[250px] max-w-[350px]"
        style={{
          left: `${position.x}px`,
          top: `${position.y}px`,
          transform: 'translate(-50%, -120%)',
        }}
      >
        {/* Word */}
        <div className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{word.surface}</div>

        {/* Reading */}
        {word.reading && (
          <div className="text-lg text-gray-600 dark:text-gray-400 mb-3">
            <span className="text-xs text-gray-500 dark:text-gray-500 uppercase mr-2">
              Reading:
            </span>
            {word.reading}
          </div>
        )}

        {/* Meaning */}
        <div className="border-t border-gray-200 dark:border-gray-700 pt-3 mt-2">
          <div className="text-xs text-gray-500 dark:text-gray-500 uppercase mb-1">Indonesian:</div>
          {word.meaning ? (
            <div className="text-sm text-gray-900 dark:text-white">{word.meaning}</div>
          ) : (
            <div className="text-sm text-gray-400 dark:text-gray-600 italic flex items-center gap-2">
              <div className="animate-spin h-3 w-3 border-2 border-secondary border-t-transparent rounded-full" />
              Loading translation...
            </div>
          )}
        </div>

        {/* Part of Speech */}
        {word.partOfSpeech && (
          <div className="text-xs text-gray-500 dark:text-gray-500 mt-2 italic">
            {word.partOfSpeech}
          </div>
        )}

        {/* Close hint */}
        <div className="text-xs text-gray-400 dark:text-gray-600 mt-3 text-center">
          Click anywhere to close
        </div>
      </div>
    </>
  );
}

interface InteractiveJapaneseTextProps {
  text: string;
  className?: string;
}

export default function InteractiveJapaneseText({
  text,
  className = '',
}: InteractiveJapaneseTextProps) {
  const [selectedWord, setSelectedWord] = useState<JapaneseToken | null>(null);
  const [popupPosition, setPopupPosition] = useState({ x: 0, y: 0 });
  const [tokens, setTokens] = useState<JapaneseToken[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Auto-parse text on mount
  useEffect(() => {
    const parseText = async () => {
      if (tokens.length > 0) return; // Already parsed

      setIsLoading(true);
      try {
        const parsed = await parseJapaneseText(text);
        setTokens(parsed);
      } catch (error) {
        console.error('Failed to parse Japanese text:', error);
      } finally {
        setIsLoading(false);
      }
    };

    parseText();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text]); // Re-parse if text changes

  const handleWordClick = async (word: JapaneseToken, event: React.MouseEvent) => {
    const rect = (event.target as HTMLElement).getBoundingClientRect();
    setPopupPosition({
      x: rect.left + rect.width / 2,
      y: rect.top,
    });

    // Set word immediately to show popup
    setSelectedWord(word);

    // Fetch translation if not already available
    if (!word.meaning && word.surface) {
      try {
        // Use hybrid approach: offline dictionary first, then AI fallback
        const translation = await getTranslation(
          word.surface,
          word.reading,
          word.baseForm,
          text,
          true // Enable AI fallback (set to false to use offline only)
        );

        if (translation) {
          const updatedWord = { ...word, meaning: translation };

          // Update the token in the list
          setTokens(prev =>
            prev.map(t =>
              t.surface === word.surface && t.reading === word.reading ? updatedWord : t
            )
          );

          // Update selected word to show translation
          setSelectedWord(updatedWord);
        }
      } catch (error) {
        console.error('Failed to fetch translation:', error);
      }
    }
  };

  const handleClosePopup = () => {
    setSelectedWord(null);
  };

  // Show loading or plain text while parsing
  if (isLoading || tokens.length === 0) {
    return (
      <div className={cn('text-sm', className)}>
        <span className="text-gray-900 dark:text-white">{text}</span>
      </div>
    );
  }

  return (
    <>
      <div className={cn('text-sm leading-relaxed', className)}>
        {tokens.map((token, index) => {
          const isKanji = /[一-龯]/.test(token.surface);

          // Only make content words clickable (not particles or auxiliary verbs)
          const isContentWord =
            token.partOfSpeech === 'noun' ||
            token.partOfSpeech === 'verb' ||
            token.partOfSpeech === 'adjective' ||
            token.partOfSpeech === 'adverb';

          // Make clickable if it's a content word OR has kanji
          const isClickable = isContentWord || isKanji;

          if (!isClickable) {
            return (
              <span key={index} className="text-gray-900 dark:text-white">
                {token.surface}
              </span>
            );
          }

          return (
            <span
              key={index}
              onClick={e => handleWordClick(token, e)}
              className={cn(
                'cursor-pointer transition-all duration-200',
                'border-b border-gray-300 dark:border-gray-600', // Always visible underline
                'hover:text-primary hover:border-primary', // Color change on hover
                'px-0.5'
              )}
              title="Click for details"
            >
              {token.surface}
            </span>
          );
        })}
      </div>

      {selectedWord && (
        <WordPopup word={selectedWord} position={popupPosition} onClose={handleClosePopup} />
      )}
    </>
  );
}
