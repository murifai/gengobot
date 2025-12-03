'use client';

import { useEffect, useRef, useState } from 'react';
import { Plus, Loader2, Check, ChevronLeft } from 'lucide-react';
import { katakanaToHiragana } from '@/lib/utils/kuromoji-parser';
import { Badge } from '@/components/ui/Badge';

interface VocabularyDetailProps {
  vocab: {
    word: string;
    reading: string;
    baseForm?: string; // Dictionary form (for verbs/adjectives)
    partOfSpeech?: string; // Part of speech (動詞, 形容詞, etc.)
    conjugation?: string; // Conjugation type info
    meaning?: string; // Indonesian translation (legacy, kept for compatibility)
  };
  onClose: () => void;
  position?: { x: number; y: number };
}

/**
 * Extract verb group from conjugation type string
 * Returns Indonesian label for verb/adjective group
 */
function getVerbGroup(
  conjugationType: string | undefined,
  partOfSpeech: string | undefined
): string | null {
  // Adjectives - い adjective
  if (partOfSpeech === '形容詞' || conjugationType?.includes('形容詞')) {
    return 'Kata Sifat-い';
  }

  // な adjective (形容動詞)
  if (partOfSpeech === '形容動詞' || conjugationType?.includes('形容動詞')) {
    return 'Kata Sifat-な';
  }

  if (!conjugationType) return null;

  // Verb groups
  if (conjugationType.includes('五段')) {
    return 'Kelompok 1 (Godan)';
  }
  if (conjugationType.includes('一段')) {
    return 'Kelompok 2 (Ichidan)';
  }
  if (conjugationType.includes('サ変') || conjugationType.includes('カ変')) {
    return 'Kelompok 3 (Irregular)';
  }

  return null;
}

interface DictionaryData {
  found: boolean;
  word?: string;
  reading?: string;
  meaningsEn?: string[];
  meaningsId?: string[];
  jlptLevel?: string | null;
}

interface DeckOption {
  id: string;
  name: string;
  totalCards: number;
  category: string | null;
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

export default function VocabularyDetail({ vocab, onClose, position }: VocabularyDetailProps) {
  const popupRef = useRef<HTMLDivElement>(null);
  const [dictData, setDictData] = useState<DictionaryData | null>(null);
  const [loading, setLoading] = useState(true);

  // Deck selection state
  const [showDeckPicker, setShowDeckPicker] = useState(false);
  const [decks, setDecks] = useState<DeckOption[]>([]);
  const [loadingDecks, setLoadingDecks] = useState(false);
  const [addingToDeck, setAddingToDeck] = useState<string | null>(null);
  const [addedToDeck, setAddedToDeck] = useState<string | null>(null);

  const hiraganaReading = katakanaToHiragana(vocab.reading);
  const verbGroup = getVerbGroup(vocab.conjugation, vocab.partOfSpeech);

  // Fetch dictionary data
  useEffect(() => {
    async function fetchDictionary() {
      try {
        // Try to look up by baseForm first (dictionary form), then by word
        const lookupWord = vocab.baseForm || vocab.word;
        const res = await fetch(`/api/vocabulary/lookup?word=${encodeURIComponent(lookupWord)}`);
        const data = await res.json();

        if (data.found) {
          setDictData(data);
          return;
        }

        // If baseForm lookup failed, try the surface form
        if (vocab.baseForm && vocab.baseForm !== vocab.word) {
          const fallbackRes = await fetch(
            `/api/vocabulary/lookup?word=${encodeURIComponent(vocab.word)}`
          );
          const fallbackData = await fallbackRes.json();
          if (fallbackData.found) {
            setDictData(fallbackData);
            return;
          }
        }

        // For noun+する compounds (e.g., 勉強する), try looking up just the noun part
        if (vocab.baseForm?.endsWith('する')) {
          const nounPart = vocab.baseForm.slice(0, -2); // Remove する
          if (nounPart) {
            const nounRes = await fetch(
              `/api/vocabulary/lookup?word=${encodeURIComponent(nounPart)}`
            );
            const nounData = await nounRes.json();
            if (nounData.found) {
              setDictData(nounData);
              return;
            }
          }
        }

        setDictData({ found: false });
      } catch {
        setDictData({ found: false });
      } finally {
        setLoading(false);
      }
    }
    fetchDictionary();
  }, [vocab.word, vocab.baseForm]);

  // Fetch user's decks when picker is opened
  useEffect(() => {
    if (showDeckPicker && decks.length === 0) {
      setLoadingDecks(true);
      fetch('/api/vocabulary/add-to-deck')
        .then(res => res.json())
        .then(data => {
          setDecks(data.decks || []);
        })
        .catch(err => {
          console.error('Failed to fetch decks:', err);
        })
        .finally(() => {
          setLoadingDecks(false);
        });
    }
  }, [showDeckPicker, decks.length]);

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
        if (showDeckPicker) {
          setShowDeckPicker(false);
        } else {
          onClose();
        }
      }
    }

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [onClose, showDeckPicker]);

  // Add to specific deck
  const handleAddToDeck = async (deckId: string) => {
    if (addingToDeck || addedToDeck) return;

    setAddingToDeck(deckId);
    try {
      // Always use baseForm (kata dasar) as the primary word for flashcard
      const wordToSave = vocab.baseForm || vocab.word;
      const res = await fetch('/api/vocabulary/add-to-deck', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          word: wordToSave,
          reading: hiraganaReading,
          meaning: dictData?.meaningsId?.[0] || vocab.meaning || '',
          deckId,
        }),
      });

      if (res.ok) {
        setAddedToDeck(deckId);
        // Auto close deck picker after successful add
        setTimeout(() => {
          setShowDeckPicker(false);
        }, 500);
      }
    } catch (error) {
      console.error('Failed to add to deck:', error);
    } finally {
      setAddingToDeck(null);
    }
  };

  // Calculate safe position
  const getPopupStyle = () => {
    if (!position) {
      return { left: '50%', top: '50%', transform: 'translate(-50%, -50%)' };
    }

    const popupWidth = 280;
    const popupHeight = showDeckPicker ? 300 : 250;
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

    return { left: `${left}px`, top: `${top}px`, transform: 'none' };
  };

  const popupStyle = getPopupStyle();

  return (
    <div
      ref={popupRef}
      className="fixed z-50 bg-background rounded-base shadow-shadow border-2 border-border p-3 min-w-[200px] max-w-[280px]"
      style={popupStyle}
    >
      {showDeckPicker ? (
        // Deck picker view
        <div className="space-y-2">
          <div className="flex items-center gap-2 pb-2 border-b-2 border-border">
            <button
              onClick={() => setShowDeckPicker(false)}
              className="p-1 hover:bg-secondary-background rounded-base"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="font-medium text-sm">Pilih Deck</span>
          </div>

          {loadingDecks ? (
            <div className="flex justify-center py-4">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          ) : decks.length === 0 ? (
            <div className="text-sm text-muted-foreground text-center py-4">
              Belum ada deck. Buat deck terlebih dahulu.
            </div>
          ) : (
            <div className="max-h-[200px] overflow-y-auto space-y-1">
              {decks.map(deck => (
                <button
                  key={deck.id}
                  onClick={() => handleAddToDeck(deck.id)}
                  disabled={addingToDeck !== null || addedToDeck === deck.id}
                  className={`w-full text-left p-2 rounded-base border-2 border-border transition-colors ${
                    addedToDeck === deck.id
                      ? 'bg-green-100 border-green-500'
                      : 'hover:bg-secondary-background'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm truncate">{deck.name}</div>
                      <div className="text-xs text-muted-foreground">{deck.totalCards} kartu</div>
                    </div>
                    {addingToDeck === deck.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : addedToDeck === deck.id ? (
                      <Check className="h-4 w-4 text-green-600" />
                    ) : null}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      ) : (
        // Main vocabulary view
        <div className="space-y-2">
          {/* Header with word and add to deck button */}
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <div className="text-xl font-bold font-japanese truncate">{vocab.word}</div>
              {/* Cara Baca (Reading) */}
              {hiraganaReading !== vocab.word && (
                <div className="text-sm text-muted-foreground font-japanese">{hiraganaReading}</div>
              )}
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <button
                onClick={() => setShowDeckPicker(true)}
                disabled={addedToDeck !== null}
                className={`p-1.5 rounded-base transition-colors ${
                  addedToDeck ? 'bg-green-500 text-white' : 'hover:bg-secondary-background'
                }`}
                title={addedToDeck ? 'Ditambahkan ke deck' : 'Tambah ke deck'}
              >
                {addedToDeck ? <Check className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
              </button>
              {dictData?.jlptLevel && (
                <Badge className={getJlptColor(dictData.jlptLevel)} size="sm">
                  {dictData.jlptLevel}
                </Badge>
              )}
            </div>
          </div>

          {/* Verb/Adjective Group */}
          {verbGroup && (
            <Badge variant="outline" size="sm" className="text-xs">
              {verbGroup}
            </Badge>
          )}

          {/* Kata Dasar (Base Form) - for conjugated verbs/adjectives */}
          {vocab.baseForm && vocab.baseForm !== vocab.word && (
            <div className="pt-2 border-t-2 border-border">
              <div className="text-xs text-muted-foreground mb-0.5">Kata Dasar:</div>
              <div className="text-sm font-medium font-japanese">{vocab.baseForm}</div>
            </div>
          )}

          {/* Dictionary meanings */}
          {loading ? (
            <div className="flex justify-center py-2">
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            </div>
          ) : dictData?.found ? (
            <>
              {/* Indonesian Meanings (from translations.db) */}
              {dictData.meaningsId && dictData.meaningsId.length > 0 && (
                <div className="pt-2 border-t-2 border-border">
                  <div className="text-xs text-muted-foreground font-medium">Arti:</div>
                  <div className="text-sm">{dictData.meaningsId.slice(0, 3).join(', ')}</div>
                </div>
              )}
            </>
          ) : (
            /* Fallback to legacy meaning or show not found */
            vocab.meaning && (
              <div className="pt-2 border-t-2 border-border">
                <div className="text-sm text-foreground/80 text-center italic">
                  &ldquo;{vocab.meaning}&rdquo;
                </div>
              </div>
            )
          )}
        </div>
      )}
    </div>
  );
}
