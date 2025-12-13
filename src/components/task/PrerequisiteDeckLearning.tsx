'use client';

import { useState, useEffect, useCallback } from 'react';
import { Volume2, VolumeX, Repeat, X, Check, ArrowLeft, BookOpen, ArrowRight } from 'lucide-react';
import { playAudio, stopAudio } from '@/lib/audio';

interface Flashcard {
  id: string;
  cardType: string;
  // Kana fields
  character?: string;
  romaji?: string;
  strokeSvg?: string;
  // Kanji fields
  kanji?: string;
  kanjiMeaning?: string;
  onyomi?: string;
  kunyomi?: string;
  // Vocabulary fields
  word?: string;
  wordMeaning?: string;
  reading?: string;
  partOfSpeech?: string;
  // Grammar fields
  grammarPoint?: string;
  grammarMeaning?: string;
  usageNote?: string;
  // Common fields
  exampleSentence?: string;
  exampleTranslation?: string;
  notes?: string;
  audioUrl?: string;
  exampleAudioUrl?: string;
}

interface Deck {
  id: string;
  name: string;
  description: string | null;
  category: string | null;
  difficulty: string | null;
  flashcards: Flashcard[];
  order: number;
}

interface PrerequisiteDeckLearningProps {
  deck: Deck;
  deckIndex: number;
  totalDecks: number;
  onComplete: (hafalCount: number, belumHafalCount: number) => void;
  onExit: () => void;
  onContinueToTask: () => void;
  onRelearn: () => void;
}

type ViewMode = 'learning' | 'completed';
type Rating = 'belum_hafal' | 'hafal';

const CARD_COLORS: Record<string, { front: string; back: string; accent: string }> = {
  hiragana: {
    front: 'var(--card-hiragana)',
    back: 'var(--card-hiragana-back)',
    accent: '#E91E63',
  },
  katakana: {
    front: 'var(--card-katakana)',
    back: 'var(--card-katakana-back)',
    accent: '#2196F3',
  },
  kanji: {
    front: 'var(--card-kanji)',
    back: 'var(--card-kanji-back)',
    accent: '#FF9800',
  },
  vocabulary: {
    front: 'var(--card-vocabulary)',
    back: 'var(--card-vocabulary-back)',
    accent: '#4CAF50',
  },
  grammar: {
    front: 'var(--card-grammar)',
    back: 'var(--card-grammar-back)',
    accent: '#FF5722',
  },
};

interface CompletionMessage {
  title: string;
  subtitle: string;
}

function getCompletionMessage(hafalPercentage: number): CompletionMessage {
  if (hafalPercentage >= 80) {
    return {
      title: 'すごい！！！',
      subtitle: 'Kamu udah hafal sebagian besar kartu di dek ini.',
    };
  } else if (hafalPercentage >= 40) {
    return {
      title: 'よくできた！！',
      subtitle: 'Kamu udah setengah jalan, ayo coba lagi.',
    };
  } else if (hafalPercentage >= 10) {
    return {
      title: 'がんばれ！',
      subtitle: 'Terus belajar buat nambah hafalan kamu ya.',
    };
  } else {
    return {
      title: 'Sesi Selesai!',
      subtitle: 'Ayo mulai menghafal kartu-kartu di deck ini.',
    };
  }
}

export default function PrerequisiteDeckLearning({
  deck,
  deckIndex,
  totalDecks,
  onComplete,
  onExit,
  onContinueToTask,
  onRelearn,
}: PrerequisiteDeckLearningProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('learning');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [submittingRating, setSubmittingRating] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [hafalCount, setHafalCount] = useState(0);
  const [belumHafalCount, setBelumHafalCount] = useState(0);

  const currentCard = deck.flashcards[currentIndex];
  const totalCards = deck.flashcards.length;
  const progress = Math.round(((currentIndex + 1) / totalCards) * 100);
  const hafalPercentage = totalCards > 0 ? Math.round((hafalCount / totalCards) * 100) : 0;

  const cardColors = CARD_COLORS[currentCard?.cardType] || CARD_COLORS.vocabulary;

  // Keyboard controls
  useEffect(() => {
    if (viewMode !== 'learning') return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (submittingRating) return;

      switch (e.key) {
        case ' ':
        case 'Enter':
          e.preventDefault();
          setShowAnswer(!showAnswer);
          break;
        case 'ArrowLeft':
        case '1':
          e.preventDefault();
          handleRating('belum_hafal');
          break;
        case 'ArrowRight':
        case '2':
          e.preventDefault();
          handleRating('hafal');
          break;
        case 'Escape':
          e.preventDefault();
          onExit();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showAnswer, submittingRating, viewMode]);

  const handlePlayAudio = useCallback(
    async (audioUrl?: string, text?: string) => {
      if (isPlaying) {
        stopAudio();
        setIsPlaying(false);
        return;
      }

      try {
        setIsPlaying(true);
        await playAudio(audioUrl, text);
      } catch (error) {
        console.error('Audio playback error:', error);
      } finally {
        setIsPlaying(false);
      }
    },
    [isPlaying]
  );

  if (!currentCard && viewMode === 'learning') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div
          className="max-w-md w-full p-8 text-center bg-white"
          style={{
            border: 'var(--neo-border)',
            boxShadow: 'var(--neo-shadow)',
          }}
        >
          <p className="text-lg text-foreground mb-4">Tidak ada kartu dalam dek ini.</p>
          <button
            onClick={onExit}
            className="px-6 py-3 font-bold bg-primary text-white"
            style={{
              border: 'var(--neo-border)',
              boxShadow: 'var(--neo-shadow)',
            }}
          >
            Kembali
          </button>
        </div>
      </div>
    );
  }

  const handleFlipCard = () => {
    setShowAnswer(!showAnswer);
  };

  const handleRating = async (rating: Rating) => {
    if (submittingRating) return;

    try {
      setSubmittingRating(true);

      // Update local state
      const newHafalCount = rating === 'hafal' ? hafalCount + 1 : hafalCount;
      const newBelumHafalCount = rating === 'belum_hafal' ? belumHafalCount + 1 : belumHafalCount;

      setHafalCount(newHafalCount);
      setBelumHafalCount(newBelumHafalCount);

      if (currentIndex < totalCards - 1) {
        setCurrentIndex(currentIndex + 1);
        setShowAnswer(false);
      } else {
        // Completed all cards, show completion screen
        setViewMode('completed');
        onComplete(newHafalCount, newBelumHafalCount);
      }
    } finally {
      setSubmittingRating(false);
    }
  };

  const handleRelearn = () => {
    // Reset state for re-learning
    setCurrentIndex(0);
    setShowAnswer(false);
    setHafalCount(0);
    setBelumHafalCount(0);
    setViewMode('learning');
    onRelearn();
  };

  // Get primary text for audio
  const getPrimaryText = (): string => {
    switch (currentCard?.cardType) {
      case 'hiragana':
      case 'katakana':
        return currentCard.character || '';
      case 'kanji':
        return currentCard.kanji || '';
      case 'vocabulary':
        return currentCard.word || '';
      case 'grammar':
        return currentCard.grammarPoint || '';
      default:
        return '';
    }
  };

  const renderCardFront = () => {
    const primaryText = getPrimaryText();

    return (
      <div className="h-full flex flex-col items-center justify-center p-6 relative">
        {/* Card type badge */}
        <div
          className="absolute top-4 left-4 px-3 py-1 text-xs font-bold uppercase tracking-wider"
          style={{
            backgroundColor: cardColors.accent,
            color: 'white',
            border: '2px solid #000',
            boxShadow: '2px 2px 0px 0px #000',
          }}
        >
          {currentCard.cardType}
        </div>

        {/* Audio button */}
        <button
          onClick={e => {
            e.stopPropagation();
            handlePlayAudio(currentCard.audioUrl, primaryText);
          }}
          className="absolute top-4 right-4 p-2 bg-background border-2 border-border shadow-shadow transition-all hover:translate-x-1 hover:translate-y-1 hover:shadow-none"
        >
          {isPlaying ? <VolumeX size={20} /> : <Volume2 size={20} />}
        </button>

        {/* Main content */}
        <div className="text-center">
          {currentCard.cardType === 'hiragana' || currentCard.cardType === 'katakana' ? (
            <>
              <div className="text-9xl font-bold text-black mb-4 font-jp-mincho">
                {currentCard.character}
              </div>
              {currentCard.strokeSvg && (
                <div
                  className="w-24 h-24 mx-auto mb-4"
                  dangerouslySetInnerHTML={{ __html: currentCard.strokeSvg }}
                />
              )}
            </>
          ) : currentCard.cardType === 'kanji' ? (
            <>
              <div className="text-9xl font-bold text-black font-jp-mincho">
                {currentCard.kanji}
              </div>
              {currentCard.strokeSvg && (
                <div
                  className="w-20 h-20 mx-auto mt-4 opacity-50"
                  dangerouslySetInnerHTML={{ __html: currentCard.strokeSvg }}
                />
              )}
            </>
          ) : currentCard.cardType === 'vocabulary' ? (
            <>
              <div className="text-6xl font-bold text-black mb-3 font-jp-mincho">
                {currentCard.word}
              </div>
              {currentCard.reading && (
                <div className="text-2xl text-black/70">{currentCard.reading}</div>
              )}
            </>
          ) : currentCard.cardType === 'grammar' ? (
            <div className="text-4xl font-bold text-black font-jp-mincho">
              {currentCard.grammarPoint}
            </div>
          ) : (
            <p className="text-black">Jenis kartu tidak dikenal</p>
          )}
        </div>
      </div>
    );
  };

  const renderCardBack = () => {
    return (
      <div className="h-full flex flex-col p-4 overflow-hidden">
        {/* Card type badge */}
        <div
          className="absolute top-4 left-4 px-3 py-1 text-xs font-bold uppercase tracking-wider"
          style={{
            backgroundColor: cardColors.accent,
            color: 'white',
            border: '2px solid #000',
            boxShadow: '2px 2px 0px 0px #000',
          }}
        >
          {currentCard.cardType}
        </div>

        <div className="mt-10 space-y-3">
          {/* Meaning Section */}
          <div
            className="p-3 bg-white"
            style={{
              border: '2px solid #000',
              boxShadow: '2px 2px 0px 0px #000',
            }}
          >
            <h3 className="text-xs font-bold uppercase tracking-wider text-black/60 mb-1">Arti</h3>
            <p className="text-base font-bold text-black">
              {currentCard.cardType === 'hiragana' || currentCard.cardType === 'katakana'
                ? currentCard.romaji
                : currentCard.cardType === 'kanji'
                  ? currentCard.kanjiMeaning
                  : currentCard.cardType === 'vocabulary'
                    ? currentCard.wordMeaning
                    : currentCard.grammarMeaning}
            </p>
          </div>

          {/* Additional info based on card type */}
          {currentCard.cardType === 'kanji' && (
            <div className="grid grid-cols-2 gap-2">
              {currentCard.onyomi && (
                <div
                  className="p-2 bg-white"
                  style={{
                    border: '2px solid #000',
                    boxShadow: '2px 2px 0px 0px #000',
                  }}
                >
                  <h4 className="text-[10px] font-bold uppercase text-black/60 mb-0.5">
                    On&apos;yomi
                  </h4>
                  <p className="text-sm font-bold text-black">{currentCard.onyomi}</p>
                </div>
              )}
              {currentCard.kunyomi && (
                <div
                  className="p-2 bg-white"
                  style={{
                    border: '2px solid #000',
                    boxShadow: '2px 2px 0px 0px #000',
                  }}
                >
                  <h4 className="text-[10px] font-bold uppercase text-black/60 mb-0.5">
                    Kun&apos;yomi
                  </h4>
                  <p className="text-sm font-bold text-black">{currentCard.kunyomi}</p>
                </div>
              )}
            </div>
          )}

          {currentCard.cardType === 'vocabulary' && currentCard.partOfSpeech && (
            <div
              className="inline-block px-2 py-0.5 bg-white text-xs font-bold"
              style={{
                border: '2px solid #000',
                boxShadow: '2px 2px 0px 0px #000',
              }}
            >
              {currentCard.partOfSpeech}
            </div>
          )}

          {currentCard.cardType === 'grammar' && currentCard.usageNote && (
            <div
              className="p-2 bg-white"
              style={{
                border: '2px solid #000',
                boxShadow: '2px 2px 0px 0px #000',
              }}
            >
              <h4 className="text-[10px] font-bold uppercase text-black/60 mb-0.5">
                Catatan Penggunaan
              </h4>
              <p className="text-xs text-black whitespace-pre-wrap">{currentCard.usageNote}</p>
            </div>
          )}

          {/* Example Sentence */}
          {currentCard.exampleSentence && (
            <div
              className="p-2 bg-white relative"
              style={{
                border: '2px solid #000',
                boxShadow: '2px 2px 0px 0px #000',
              }}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h4 className="text-[10px] font-bold uppercase text-black/60 mb-1">Contoh</h4>
                  <p className="text-sm font-medium text-black mb-0.5 furigana-text">
                    {currentCard.exampleSentence}
                  </p>
                  {currentCard.exampleTranslation && (
                    <p className="text-xs text-black/70">{currentCard.exampleTranslation}</p>
                  )}
                </div>
                {(currentCard.exampleAudioUrl || currentCard.exampleSentence) && (
                  <button
                    onClick={e => {
                      e.stopPropagation();
                      handlePlayAudio(currentCard.exampleAudioUrl, currentCard.exampleSentence);
                    }}
                    className="ml-2 p-1.5 bg-main text-main-foreground border-2 border-border shadow-shadow transition-all hover:translate-x-1 hover:translate-y-1 hover:shadow-none"
                  >
                    <Volume2 size={14} />
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Notes */}
          {currentCard.notes && (
            <div
              className="p-2"
              style={{
                backgroundColor: cardColors.accent + '20',
                border: '2px solid #000',
                borderLeft: `4px solid ${cardColors.accent}`,
              }}
            >
              <h4 className="text-[10px] font-bold uppercase text-black/60 mb-0.5">Catatan</h4>
              <p className="text-xs text-black whitespace-pre-wrap">{currentCard.notes}</p>
            </div>
          )}
        </div>
      </div>
    );
  };

  // Completed View - Show hafal percentage and action buttons
  if (viewMode === 'completed') {
    const message = getCompletionMessage(hafalPercentage);
    const isLastDeck = deckIndex === totalDecks - 1;

    return (
      <div className="min-h-screen bg-background p-4">
        <div className="max-w-md mx-auto pt-8">
          {/* Completion Header */}
          <div className="p-8 text-center mb-6 bg-background rounded-base border-2 border-border shadow-shadow">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full border-2 border-border bg-chart-3/20 flex items-center justify-center">
              <BookOpen className="w-8 h-8 text-chart-3" />
            </div>
            <h1 className="text-3xl font-bold text-foreground mb-2">{message.title}</h1>
            <p className="text-sm text-muted-foreground">{message.subtitle}</p>

            {/* Deck Progress Indicator */}
            {totalDecks > 1 && (
              <div className="mt-4 text-xs text-muted-foreground">
                Dek {deckIndex + 1} dari {totalDecks}
              </div>
            )}
          </div>

          {/* Hafal Percentage Display */}
          <div className="mb-6 p-6 bg-background rounded-base border-2 border-border shadow-shadow">
            <div className="flex items-center justify-center gap-8">
              {/* Hafal */}
              <div className="text-center">
                <div className="w-20 h-20 mx-auto mb-2 rounded-full border-4 border-chart-3 flex items-center justify-center bg-chart-3/10">
                  <span className="text-2xl font-bold text-chart-3">{hafalPercentage}%</span>
                </div>
                <div className="flex items-center justify-center gap-1 text-sm text-muted-foreground">
                  <Check size={16} className="text-chart-3" />
                  <span>Hafal ({hafalCount})</span>
                </div>
              </div>

              {/* Belum Hafal */}
              <div className="text-center">
                <div className="w-20 h-20 mx-auto mb-2 rounded-full border-4 border-primary flex items-center justify-center bg-primary/10">
                  <span className="text-2xl font-bold text-primary">{100 - hafalPercentage}%</span>
                </div>
                <div className="flex items-center justify-center gap-1 text-sm text-muted-foreground">
                  <X size={16} className="text-primary" />
                  <span>Belum ({belumHafalCount})</span>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            {/* Re-learn Button */}
            <button
              onClick={handleRelearn}
              className="w-full flex items-center justify-center gap-2 px-6 py-4 font-bold text-lg bg-secondary text-secondary-foreground rounded-base border-2 border-border shadow-shadow hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none transition-all"
            >
              <Repeat size={20} />
              Belajar Lagi
            </button>

            {/* Continue to Task Button */}
            <button
              onClick={onContinueToTask}
              className="w-full flex items-center justify-center gap-2 px-6 py-4 font-bold text-lg bg-primary text-primary-foreground rounded-base border-2 border-border shadow-shadow hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none transition-all"
            >
              {isLastDeck ? 'Lanjut ke Percakapan' : 'Lanjut ke Dek Berikutnya'}
              <ArrowRight size={20} />
            </button>
          </div>

          {/* Skip/Exit Link */}
          <div className="mt-6 text-center">
            <button
              onClick={onExit}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Keluar
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Learning View
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="p-4 flex items-center justify-between border-b-2 border-black bg-white">
        <button
          onClick={onExit}
          className="flex items-center gap-2 px-3 py-2 font-bold text-sm bg-background border-2 border-border shadow-shadow transition-all hover:translate-x-1 hover:translate-y-1 hover:shadow-none"
        >
          <ArrowLeft size={16} />
          Keluar
        </button>
        <div className="text-center">
          <h1 className="font-bold text-lg">{deck.name}</h1>
          <p className="text-sm text-muted-foreground">
            {currentIndex + 1} / {totalCards}
            {totalDecks > 1 && (
              <span className="ml-2">
                (Dek {deckIndex + 1}/{totalDecks})
              </span>
            )}
          </p>
        </div>
        <div className="w-20" /> {/* Spacer */}
      </div>

      {/* Progress Bar */}
      <div className="h-2 bg-muted relative">
        <div
          className="h-full transition-all duration-300"
          style={{
            width: `${progress}%`,
            backgroundColor: cardColors.accent,
          }}
        />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center p-4">
        {/* Card Container */}
        <div className="w-full max-w-sm perspective-1000 relative">
          <div
            className={`relative w-full aspect-[3/4] cursor-pointer ${
              showAnswer ? 'rotate-y-180' : ''
            }`}
            onClick={handleFlipCard}
            style={{
              transformStyle: 'preserve-3d',
              transition: 'transform 0.5s cubic-bezier(0.4, 0.0, 0.2, 1)',
              transform: showAnswer ? 'rotateY(180deg)' : '',
            }}
          >
            {/* Front */}
            <div
              className="absolute inset-0 overflow-hidden"
              style={{
                backfaceVisibility: 'hidden',
                backgroundColor: cardColors.front,
                border: 'var(--neo-border)',
                boxShadow: 'var(--neo-shadow)',
              }}
            >
              {renderCardFront()}
            </div>

            {/* Back */}
            <div
              className="absolute inset-0 overflow-hidden"
              style={{
                backfaceVisibility: 'hidden',
                transform: 'rotateY(180deg)',
                backgroundColor: cardColors.back,
                border: 'var(--neo-border)',
                boxShadow: 'var(--neo-shadow)',
              }}
            >
              {renderCardBack()}
            </div>
          </div>
        </div>

        {/* Bottom Action Buttons - Belum Hafal (left), Flip (center), Hafal (right) */}
        <div className="mt-6 w-full max-w-sm flex gap-3">
          {/* Belum Hafal Button */}
          <div className="flex-1 flex flex-col items-center gap-2">
            <button
              onClick={e => {
                e.stopPropagation();
                handleRating('belum_hafal');
              }}
              disabled={submittingRating}
              className="w-full py-4 flex items-center justify-center bg-primary text-white border-2 border-border shadow-shadow transition-all disabled:opacity-50 hover:translate-x-1 hover:translate-y-1 hover:shadow-none"
            >
              <X size={24} strokeWidth={2.5} />
            </button>
            <span className="text-xs text-muted-foreground">Belum hafal</span>
          </div>

          {/* Flip Button */}
          <div className="flex-1 flex flex-col items-center gap-2">
            <button
              onClick={handleFlipCard}
              disabled={submittingRating}
              className="w-full py-4 flex items-center justify-center bg-background border-2 border-border shadow-shadow transition-all disabled:opacity-50 hover:translate-x-1 hover:translate-y-1 hover:shadow-none"
            >
              <Repeat size={24} strokeWidth={2.5} />
            </button>
            <span className="text-xs text-muted-foreground">Balik</span>
          </div>

          {/* Hafal Button */}
          <div className="flex-1 flex flex-col items-center gap-2">
            <button
              onClick={e => {
                e.stopPropagation();
                handleRating('hafal');
              }}
              disabled={submittingRating}
              className="w-full py-4 flex items-center justify-center bg-chart-3 text-white border-2 border-border shadow-shadow transition-all disabled:opacity-50 hover:translate-x-1 hover:translate-y-1 hover:shadow-none"
            >
              <Check size={24} strokeWidth={2.5} />
            </button>
            <span className="text-xs text-muted-foreground">Hafal</span>
          </div>
        </div>
      </div>

      {/* CSS for flip animation */}
      <style jsx>{`
        .perspective-1000 {
          perspective: 1000px;
        }
        .rotate-y-180 {
          transform: rotateY(180deg);
        }
      `}</style>
    </div>
  );
}
