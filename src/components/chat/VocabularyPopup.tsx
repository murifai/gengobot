'use client';

import { useState, useEffect, useRef } from 'react';
import { Loader2, Volume2 } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';

interface VocabularyPopupProps {
  word: string;
  position: { x: number; y: number };
  onClose: () => void;
}

interface VocabData {
  found: boolean;
  word?: string;
  allKanji?: string[];
  reading?: string;
  allReadings?: string[];
  meaningsEn?: string[];
  meaningsId?: string[];
  partsOfSpeech?: string[];
  jlptLevel?: string | null;
  priority?: number;
}

function getJlptColor(level: string | null): string {
  switch (level) {
    case 'N5':
      return 'bg-green-500 text-white';
    case 'N4':
      return 'bg-blue-500 text-white';
    case 'N3':
      return 'bg-yellow-500 text-black';
    case 'N2':
      return 'bg-orange-500 text-white';
    case 'N1':
      return 'bg-red-500 text-white';
    default:
      return 'bg-gray-500 text-white';
  }
}

export function VocabularyPopup({ word, position, onClose }: VocabularyPopupProps) {
  const [data, setData] = useState<VocabData | null>(null);
  const [loading, setLoading] = useState(true);
  const popupRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function fetchVocab() {
      try {
        const res = await fetch(`/api/vocabulary/lookup?word=${encodeURIComponent(word)}`);
        const result = await res.json();
        setData(result);
      } catch {
        setData({ found: false });
      } finally {
        setLoading(false);
      }
    }
    fetchVocab();
  }, [word]);

  // Close on click outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (popupRef.current && !popupRef.current.contains(e.target as Node)) {
        onClose();
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  // Close on escape key
  useEffect(() => {
    function handleEscape(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        onClose();
      }
    }
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  const playAudio = () => {
    const text = data?.reading || word;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'ja-JP';
    utterance.rate = 0.8;
    speechSynthesis.speak(utterance);
  };

  // Calculate position to keep popup in viewport
  const getPopupStyle = () => {
    const popupWidth = 280;
    const popupHeight = 200;
    const padding = 10;

    let left = position.x;
    let top = position.y + 10;

    // Check right edge
    if (left + popupWidth > window.innerWidth - padding) {
      left = window.innerWidth - popupWidth - padding;
    }

    // Check left edge
    if (left < padding) {
      left = padding;
    }

    // Check bottom edge - if popup would go below viewport, show above the click
    if (top + popupHeight > window.innerHeight - padding) {
      top = position.y - popupHeight - 10;
    }

    return { left, top };
  };

  const popupStyle = getPopupStyle();

  return (
    <div
      ref={popupRef}
      className="fixed z-50 bg-background border-2 border-border rounded-base shadow-shadow p-3 min-w-[200px] max-w-[280px]"
      style={{
        left: popupStyle.left,
        top: popupStyle.top,
      }}
    >
      {loading ? (
        <div className="flex justify-center py-4">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </div>
      ) : data?.found ? (
        <div className="space-y-2">
          {/* Header */}
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <span className="text-xl font-bold font-japanese block truncate">{data.word}</span>
              {data.word !== data.reading && (
                <span className="text-sm text-muted-foreground font-japanese">{data.reading}</span>
              )}
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <button
                onClick={playAudio}
                className="p-1.5 hover:bg-secondary-background rounded-base transition-colors"
                title="Putar audio"
              >
                <Volume2 className="h-4 w-4" />
              </button>
              {data.jlptLevel && (
                <Badge className={getJlptColor(data.jlptLevel)} size="sm">
                  {data.jlptLevel}
                </Badge>
              )}
            </div>
          </div>

          {/* Indonesian Meanings */}
          {data.meaningsId && data.meaningsId.length > 0 && (
            <div>
              <p className="text-xs text-muted-foreground font-medium">Indonesia:</p>
              <p className="text-sm">{data.meaningsId.slice(0, 3).join(', ')}</p>
            </div>
          )}

          {/* English Meanings (fallback or additional) */}
          {data.meaningsEn && data.meaningsEn.length > 0 && (
            <div>
              <p className="text-xs text-muted-foreground font-medium">English:</p>
              <p className="text-sm text-muted-foreground line-clamp-2">
                {data.meaningsEn.slice(0, 3).join(', ')}
              </p>
            </div>
          )}
        </div>
      ) : (
        <div className="py-2 text-center">
          <p className="text-sm text-muted-foreground">Kata tidak ditemukan</p>
          <p className="text-xs text-muted-foreground mt-1">{word}</p>
        </div>
      )}
    </div>
  );
}
