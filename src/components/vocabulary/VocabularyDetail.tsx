'use client';

import { useEffect, useRef } from 'react';
import { katakanaToHiragana, katakanaToRomaji } from '@/lib/utils/kuromoji-parser';

interface VocabularyDetailProps {
  vocab: {
    word: string;
    reading: string;
    baseForm?: string; // Dictionary form (for verbs/adjectives)
    meaning?: string; // Indonesian translation
  };
  onClose: () => void;
  position?: { x: number; y: number };
}

export default function VocabularyDetail({ vocab, onClose, position }: VocabularyDetailProps) {
  const popupRef = useRef<HTMLDivElement>(null);
  const hiraganaReading = katakanaToHiragana(vocab.reading);
  const romajiReading = katakanaToRomaji(vocab.reading);

  // Close on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (popupRef.current && !popupRef.current.contains(event.target as Node)) {
        onClose();
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  // Close on Escape key
  useEffect(() => {
    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        onClose();
      }
    }

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  return (
    <div
      ref={popupRef}
      className="fixed z-50 bg-white dark:bg-gray-800 rounded-lg shadow-xl border-2 border-blue-500/20 dark:border-blue-400/20 p-3 min-w-[200px] max-w-[280px]"
      style={{
        left: position ? `${Math.min(position.x, window.innerWidth - 300)}px` : '50%',
        top: position ? `${Math.min(position.y + 10, window.innerHeight - 200)}px` : '50%',
        transform: position ? 'none' : 'translate(-50%, -50%)',
      }}
    >
      {/* Content */}
      <div className="space-y-2">
        {/* Kosakata (Word) */}
        <div className="text-2xl font-bold text-gray-900 dark:text-white text-center">
          {vocab.word}
        </div>

        {/* Cara Baca (Reading) */}
        <div className="text-center space-y-0.5">
          {hiraganaReading !== vocab.word && (
            <div className="text-base text-gray-600 dark:text-gray-300">{hiraganaReading}</div>
          )}
          {romajiReading && (
            <div className="text-sm text-gray-500 dark:text-gray-400">({romajiReading})</div>
          )}
        </div>

        {/* Kata Dasar (Base Form) - for conjugated verbs/adjectives */}
        {vocab.baseForm && vocab.baseForm !== vocab.word && (
          <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
            <div className="text-xs text-gray-500 dark:text-gray-400 text-center mb-0.5">
              Kata Dasar:
            </div>
            <div className="text-sm font-medium text-gray-700 dark:text-gray-300 text-center">
              {vocab.baseForm}
            </div>
          </div>
        )}

        {/* Arti (Meaning in Indonesian) */}
        {vocab.meaning && (
          <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
            <div className="text-sm text-gray-700 dark:text-gray-300 text-center italic">
              &ldquo;{vocab.meaning}&rdquo;
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
