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
      className="fixed z-50 bg-background rounded-base shadow-shadow border-2 border-border p-3 min-w-[200px] max-w-[280px]"
      style={{
        left: position ? `${Math.min(position.x, window.innerWidth - 300)}px` : '50%',
        top: position ? `${Math.min(position.y + 10, window.innerHeight - 200)}px` : '50%',
        transform: position ? 'none' : 'translate(-50%, -50%)',
      }}
    >
      {/* Content */}
      <div className="space-y-2">
        {/* Kosakata (Word) */}
        <div className="text-2xl font-bold text-foreground text-center">{vocab.word}</div>

        {/* Cara Baca (Reading) */}
        <div className="text-center space-y-0.5">
          {hiraganaReading !== vocab.word && (
            <div className="text-base text-foreground/80">{hiraganaReading}</div>
          )}
          {romajiReading && <div className="text-sm text-muted-foreground">({romajiReading})</div>}
        </div>

        {/* Kata Dasar (Base Form) - for conjugated verbs/adjectives */}
        {vocab.baseForm && vocab.baseForm !== vocab.word && (
          <div className="pt-2 border-t-2 border-border">
            <div className="text-xs text-muted-foreground text-center mb-0.5">Kata Dasar:</div>
            <div className="text-sm font-medium text-foreground/80 text-center">
              {vocab.baseForm}
            </div>
          </div>
        )}

        {/* Arti (Meaning in Indonesian) */}
        {vocab.meaning && (
          <div className="pt-2 border-t-2 border-border">
            <div className="text-sm text-foreground/80 text-center italic">
              &ldquo;{vocab.meaning}&rdquo;
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
