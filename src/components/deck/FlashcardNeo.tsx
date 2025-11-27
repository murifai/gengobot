'use client';

import { useState, useEffect, useCallback } from 'react';
import { Volume2, VolumeX, RotateCcw, X, Check, ArrowLeft } from 'lucide-react';
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
  // SRS fields
  nextReviewDate?: string;
  easeFactor: number;
  interval: number;
  repetitions: number;
}

interface Deck {
  id: string;
  name: string;
  description: string | null;
  category: string | null;
  difficulty: string | null;
  flashcards: Flashcard[];
}

interface FlashcardNeoProps {
  deck: Deck;
  sessionId: string;
  onComplete: () => void;
  onExit: () => void;
}

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

export default function FlashcardNeo({ deck, sessionId, onComplete, onExit }: FlashcardNeoProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [reviewStartTime, setReviewStartTime] = useState<number>(Date.now());
  const [submittingRating, setSubmittingRating] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  // Swipe state
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const [dragOffset, setDragOffset] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  const currentCard = deck.flashcards[currentIndex];
  const totalCards = deck.flashcards.length;
  const progress = Math.round(((currentIndex + 1) / totalCards) * 100);

  const cardColors = CARD_COLORS[currentCard?.cardType] || CARD_COLORS.vocabulary;
  const minSwipeDistance = 50;

  useEffect(() => {
    setReviewStartTime(Date.now());
  }, [currentIndex]);

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (submittingRating || isAnimating) return;

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
  }, [showAnswer, submittingRating, isAnimating]);

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

  // Touch handlers for swipe
  const onTouchStart = (e: React.TouchEvent) => {
    if (isAnimating) return;
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    if (isAnimating || touchStart === null) return;
    const currentX = e.targetTouches[0].clientX;
    setTouchEnd(currentX);
    const distance = currentX - touchStart;
    setDragOffset(Math.max(-150, Math.min(150, distance)));
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd || isAnimating) {
      setDragOffset(0);
      setTouchStart(null);
      setTouchEnd(null);
      return;
    }

    const distance = touchStart - touchEnd;
    const isLeftSwipe = showAnswer ? distance < -minSwipeDistance : distance > minSwipeDistance;
    const isRightSwipe = showAnswer ? distance > minSwipeDistance : distance < -minSwipeDistance;

    if (isLeftSwipe || isRightSwipe) {
      setIsAnimating(true);
      const flyDirection = isLeftSwipe ? -400 : 400;
      setDragOffset(flyDirection);
      const ratingValue = isLeftSwipe ? 'belum_hafal' : 'hafal';

      setTimeout(() => {
        handleRating(ratingValue);
        setTimeout(() => {
          setIsAnimating(false);
          setDragOffset(0);
        }, 100);
      }, 300);
    } else {
      setDragOffset(0);
    }

    setTouchStart(null);
    setTouchEnd(null);
  };

  if (!currentCard) {
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
    if (isAnimating) return;
    setShowAnswer(!showAnswer);
  };

  const handleRating = async (rating: Rating) => {
    if (submittingRating) return;

    try {
      setSubmittingRating(true);
      const responseTime = Math.floor((Date.now() - reviewStartTime) / 1000);

      const response = await fetch(`/api/flashcards/${currentCard.id}/review`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rating,
          sessionId,
          responseTime,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to submit rating');
      }

      if (currentIndex < totalCards - 1) {
        setCurrentIndex(currentIndex + 1);
        setShowAnswer(false);
      } else {
        onComplete();
      }
    } catch (error) {
      console.error('Error submitting rating:', error);
      alert('Gagal menyimpan rating. Silakan coba lagi.');
    } finally {
      setSubmittingRating(false);
    }
  };

  // Get primary text for audio
  const getPrimaryText = (): string => {
    switch (currentCard.cardType) {
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
          className="absolute top-4 right-4 p-2 transition-transform hover:scale-110"
          style={{
            backgroundColor: 'white',
            border: '2px solid #000',
            boxShadow: '2px 2px 0px 0px #000',
          }}
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

        {/* Tap hint */}
        <div className="absolute bottom-4 text-sm text-black/50 font-medium">
          Tap untuk balik kartu
        </div>
      </div>
    );
  };

  const renderCardBack = () => {
    return (
      <div className="h-full flex flex-col p-6 overflow-y-auto">
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

        <div className="mt-8 space-y-4">
          {/* Meaning Section */}
          <div
            className="p-4 bg-white"
            style={{
              border: '2px solid #000',
              boxShadow: '3px 3px 0px 0px #000',
            }}
          >
            <h3 className="text-sm font-bold uppercase tracking-wider text-black/60 mb-2">Arti</h3>
            <p className="text-xl font-bold text-black">
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
            <div className="grid grid-cols-2 gap-3">
              {currentCard.onyomi && (
                <div
                  className="p-3 bg-white"
                  style={{
                    border: '2px solid #000',
                    boxShadow: '2px 2px 0px 0px #000',
                  }}
                >
                  <h4 className="text-xs font-bold uppercase text-black/60 mb-1">On&apos;yomi</h4>
                  <p className="text-lg font-bold text-black">{currentCard.onyomi}</p>
                </div>
              )}
              {currentCard.kunyomi && (
                <div
                  className="p-3 bg-white"
                  style={{
                    border: '2px solid #000',
                    boxShadow: '2px 2px 0px 0px #000',
                  }}
                >
                  <h4 className="text-xs font-bold uppercase text-black/60 mb-1">Kun&apos;yomi</h4>
                  <p className="text-lg font-bold text-black">{currentCard.kunyomi}</p>
                </div>
              )}
            </div>
          )}

          {currentCard.cardType === 'vocabulary' && currentCard.partOfSpeech && (
            <div
              className="inline-block px-3 py-1 bg-white text-sm font-bold"
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
              className="p-3 bg-white"
              style={{
                border: '2px solid #000',
                boxShadow: '2px 2px 0px 0px #000',
              }}
            >
              <h4 className="text-xs font-bold uppercase text-black/60 mb-1">Catatan Penggunaan</h4>
              <p className="text-sm text-black whitespace-pre-wrap">{currentCard.usageNote}</p>
            </div>
          )}

          {/* Example Sentence */}
          {currentCard.exampleSentence && (
            <div
              className="p-4 bg-white relative"
              style={{
                border: '2px solid #000',
                boxShadow: '3px 3px 0px 0px #000',
              }}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h4 className="text-xs font-bold uppercase text-black/60 mb-2">Contoh</h4>
                  <p className="text-lg font-medium text-black mb-1 furigana-text">
                    {currentCard.exampleSentence}
                  </p>
                  {currentCard.exampleTranslation && (
                    <p className="text-sm text-black/70">{currentCard.exampleTranslation}</p>
                  )}
                </div>
                {(currentCard.exampleAudioUrl || currentCard.exampleSentence) && (
                  <button
                    onClick={e => {
                      e.stopPropagation();
                      handlePlayAudio(currentCard.exampleAudioUrl, currentCard.exampleSentence);
                    }}
                    className="ml-2 p-2 transition-transform hover:scale-110"
                    style={{
                      backgroundColor: cardColors.accent,
                      color: 'white',
                      border: '2px solid #000',
                      boxShadow: '2px 2px 0px 0px #000',
                    }}
                  >
                    <Volume2 size={16} />
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Notes */}
          {currentCard.notes && (
            <div
              className="p-3"
              style={{
                backgroundColor: cardColors.accent + '20',
                border: '2px solid #000',
                borderLeft: `4px solid ${cardColors.accent}`,
              }}
            >
              <h4 className="text-xs font-bold uppercase text-black/60 mb-1">Catatan</h4>
              <p className="text-sm text-black whitespace-pre-wrap">{currentCard.notes}</p>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="p-4 flex items-center justify-between border-b-2 border-black bg-white">
        <button
          onClick={onExit}
          className="flex items-center gap-2 px-3 py-2 font-bold text-sm transition-transform hover:translate-x-[-2px]"
          style={{
            border: '2px solid #000',
            boxShadow: '2px 2px 0px 0px #000',
          }}
        >
          <ArrowLeft size={16} />
          Keluar
        </button>
        <div className="text-center">
          <h1 className="font-bold text-lg">{deck.name}</h1>
          <p className="text-sm text-muted-foreground">
            {currentIndex + 1} / {totalCards}
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
        {/* Swipe Instructions - Mobile */}
        <div className="md:hidden w-full max-w-sm flex justify-between items-center mb-3 px-2 text-sm font-medium">
          <span className="flex items-center gap-1 text-destructive">
            <X size={16} /> Belum hafal
          </span>
          <span className="flex items-center gap-1 text-green-600">
            Hafal <Check size={16} />
          </span>
        </div>

        {/* Card Container */}
        <div className="w-full max-w-sm perspective-1000 relative">
          <div
            className={`relative w-full aspect-[3/4] cursor-pointer ${
              showAnswer ? 'rotate-y-180' : ''
            }`}
            onClick={handleFlipCard}
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
            style={{
              transformStyle: 'preserve-3d',
              transition: isAnimating
                ? 'all 0.3s cubic-bezier(0.4, 0.0, 0.2, 1)'
                : 'transform 0.5s cubic-bezier(0.4, 0.0, 0.2, 1)',
              transform: `${showAnswer ? 'rotateY(180deg)' : ''} translateX(${dragOffset}px) rotate(${dragOffset * 0.05}deg)`,
              opacity: Math.max(0, 1 - Math.abs(dragOffset) / 400),
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

          {/* Desktop Rating Buttons */}
          <button
            onClick={e => {
              e.stopPropagation();
              handleRating('belum_hafal');
            }}
            disabled={submittingRating}
            className="hidden md:flex absolute left-0 top-1/2 -translate-y-1/2 -translate-x-20 w-14 h-14 items-center justify-center transition-all disabled:opacity-50 hover:translate-x-[-22px]"
            style={{
              backgroundColor: 'var(--destructive)',
              color: 'white',
              border: 'var(--neo-border)',
              boxShadow: 'var(--neo-shadow)',
            }}
          >
            <X size={28} strokeWidth={3} />
          </button>

          <button
            onClick={e => {
              e.stopPropagation();
              handleRating('hafal');
            }}
            disabled={submittingRating}
            className="hidden md:flex absolute right-0 top-1/2 -translate-y-1/2 translate-x-20 w-14 h-14 items-center justify-center transition-all disabled:opacity-50 hover:translate-x-[22px]"
            style={{
              backgroundColor: 'var(--tertiary-green)',
              color: 'white',
              border: 'var(--neo-border)',
              boxShadow: 'var(--neo-shadow)',
            }}
          >
            <Check size={28} strokeWidth={3} />
          </button>
        </div>

        {/* Flip Button */}
        <button
          onClick={handleFlipCard}
          disabled={submittingRating}
          className="mt-6 w-full max-w-sm py-4 flex items-center justify-center gap-2 font-bold text-lg transition-all disabled:opacity-50 hover:translate-y-[-2px]"
          style={{
            backgroundColor: 'white',
            border: 'var(--neo-border)',
            boxShadow: 'var(--neo-shadow)',
          }}
        >
          <RotateCcw size={20} />
          Balik Kartu
        </button>

        {/* Keyboard Hints - Desktop */}
        <div className="hidden md:flex mt-4 gap-4 text-sm text-muted-foreground">
          <span className="flex items-center gap-1">
            <kbd className="px-2 py-1 bg-muted border border-black text-xs font-mono">←</kbd>
            Belum hafal
          </span>
          <span className="flex items-center gap-1">
            <kbd className="px-2 py-1 bg-muted border border-black text-xs font-mono">Space</kbd>
            Balik
          </span>
          <span className="flex items-center gap-1">
            <kbd className="px-2 py-1 bg-muted border border-black text-xs font-mono">→</kbd>
            Hafal
          </span>
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
