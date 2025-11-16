'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

interface Flashcard {
  id: string;
  cardType: string;
  kanji?: string;
  kanjiMeaning?: string;
  onyomi?: string;
  kunyomi?: string;
  word?: string;
  wordMeaning?: string;
  reading?: string;
  partOfSpeech?: string;
  grammarPoint?: string;
  grammarMeaning?: string;
  usageNote?: string;
  exampleSentence?: string;
  exampleTranslation?: string;
  notes?: string;
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

interface DeckLearningWithSRSProps {
  deck: Deck;
  sessionId: string;
  onComplete: () => void;
  onExit: () => void;
}

type Rating = 'belum_hafal' | 'hafal';

export default function DeckLearningWithSRS({
  deck,
  sessionId,
  onComplete,
  onExit,
}: DeckLearningWithSRSProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [ratedCards, setRatedCards] = useState<Set<number>>(new Set());
  const [reviewStartTime, setReviewStartTime] = useState<number>(Date.now());
  const [submittingRating, setSubmittingRating] = useState(false);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const [isSwiping, setIsSwiping] = useState(false);
  const [dragOffset, setDragOffset] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  const currentCard = deck.flashcards[currentIndex];
  const totalCards = deck.flashcards.length;
  const progress = ((ratedCards.size / totalCards) * 100).toFixed(0);

  // Minimum swipe distance (in px)
  const minSwipeDistance = 50;

  useEffect(() => {
    setReviewStartTime(Date.now());
  }, [currentIndex]);

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
    setIsSwiping(false);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    if (isAnimating) return;

    const currentX = e.targetTouches[0].clientX;
    setTouchEnd(currentX);

    // Check if user is swiping
    if (touchStart !== null) {
      const distance = currentX - touchStart;
      const currentDistance = Math.abs(distance);

      if (currentDistance > 10) {
        // If moved more than 10px, consider it a swipe attempt
        setIsSwiping(true);
        // Limit drag offset to max 150px in either direction
        const limitedOffset = Math.max(-150, Math.min(150, distance));
        setDragOffset(limitedOffset);
      }
    }
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd || isAnimating) {
      setIsSwiping(false);
      setDragOffset(0);
      setTouchStart(null);
      setTouchEnd(null);
      return;
    }

    const distance = touchStart - touchEnd;

    // When card is flipped (showAnswer = true), the swipe direction is inverted
    // due to rotateY(180deg) transform, so we need to reverse the logic
    const isLeftSwipe = showAnswer
      ? distance < -minSwipeDistance // Reversed for flipped card
      : distance > minSwipeDistance;
    const isRightSwipe = showAnswer
      ? distance > minSwipeDistance // Reversed for flipped card
      : distance < -minSwipeDistance;

    if (isLeftSwipe || isRightSwipe) {
      // Always rate on swipe, regardless of showAnswer state
      setIsAnimating(true);

      // Animate card flying away
      const flyDirection = isLeftSwipe ? -400 : 400;
      setDragOffset(flyDirection);

      const ratingValue = isLeftSwipe ? 'belum_hafal' : 'hafal';

      // Wait for animation to complete, then rate
      setTimeout(() => {
        handleRating(ratingValue);

        // Reset states after rating
        setTimeout(() => {
          setIsAnimating(false);
          setDragOffset(0);
        }, 100);
      }, 300);
    } else {
      // Swipe not far enough, snap back
      setDragOffset(0);
    }

    // Reset touch state
    setTouchStart(null);
    setTouchEnd(null);
    setIsSwiping(false);
  };

  if (!currentCard) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
        <Card className="max-w-2xl w-full p-8 text-center">
          <p className="text-gray-600 dark:text-gray-400 mb-4">Tidak ada kartu dalam dek ini.</p>
          <Button onClick={onExit}>Kembali</Button>
        </Card>
      </div>
    );
  }

  const handleFlipCard = () => {
    // Don't flip if animating
    if (isAnimating) {
      return;
    }

    setShowAnswer(!showAnswer);
  };

  const handleRating = async (rating: Rating) => {
    try {
      setSubmittingRating(true);
      const responseTime = Math.floor((Date.now() - reviewStartTime) / 1000); // in seconds

      // Mark card as rated for progress tracking
      setRatedCards(prev => new Set([...prev, currentIndex]));

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

      // Move to next card or complete
      if (currentIndex < totalCards - 1) {
        setCurrentIndex(currentIndex + 1);
        setShowAnswer(false);
      } else {
        onComplete();
      }
    } catch (error) {
      console.error('Error submitting rating:', error);
      alert('Failed to submit rating. Please try again.');
    } finally {
      setSubmittingRating(false);
    }
  };

  const renderCardFront = () => {
    switch (currentCard.cardType) {
      case 'kanji':
        return (
          <div className="flex flex-col items-center justify-center h-full">
            <div className="text-8xl font-bold text-center text-white">{currentCard.kanji}</div>
          </div>
        );

      case 'vocabulary':
        return (
          <div className="flex flex-col items-center justify-center h-full">
            <div className="text-6xl font-bold text-center text-white mb-2">{currentCard.word}</div>
            {currentCard.reading && (
              <div className="text-2xl text-center text-white/80">{currentCard.reading}</div>
            )}
          </div>
        );

      case 'grammar':
        return (
          <div className="flex flex-col items-center justify-center h-full">
            <div className="text-4xl font-bold text-center text-white">
              {currentCard.grammarPoint}
            </div>
          </div>
        );

      default:
        return (
          <p className="text-center text-gray-600 dark:text-gray-400">Jenis kartu tidak dikenal</p>
        );
    }
  };

  const renderCardBack = () => {
    switch (currentCard.cardType) {
      case 'kanji':
        return (
          <div className="h-full flex flex-col justify-center p-8 bg-yellow-100">
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-bold text-gray-700 mb-1">Arti</h3>
                <p className="text-lg text-gray-900">{currentCard.kanjiMeaning}</p>
              </div>
              {currentCard.onyomi && (
                <div>
                  <h3 className="text-lg font-bold text-gray-700 mb-1">On&apos;yomi</h3>
                  <p className="text-lg text-gray-900">{currentCard.onyomi}</p>
                </div>
              )}
              {currentCard.kunyomi && (
                <div>
                  <h3 className="text-lg font-bold text-gray-700 mb-1">Kun&apos;yomi</h3>
                  <p className="text-lg text-gray-900">{currentCard.kunyomi}</p>
                </div>
              )}
              {currentCard.exampleSentence && (
                <div>
                  <h3 className="text-lg font-bold text-gray-700 mb-1">Contoh</h3>
                  <p className="text-lg text-gray-900 mb-2">{currentCard.exampleSentence}</p>
                  {currentCard.exampleTranslation && (
                    <p className="text-sm text-gray-700">{currentCard.exampleTranslation}</p>
                  )}
                </div>
              )}
            </div>
            {currentCard.notes && (
              <div className="mt-6 p-4 bg-yellow-50 rounded-lg border-l-4 border-yellow-400">
                <h3 className="text-sm font-medium text-gray-700 mb-1">Catatan</h3>
                <p className="text-sm text-gray-900 whitespace-pre-wrap">{currentCard.notes}</p>
              </div>
            )}
          </div>
        );

      case 'vocabulary':
        return (
          <div className="h-full flex flex-col justify-center p-8 bg-green-100">
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-bold text-gray-700 mb-1">Arti</h3>
                <p className="text-lg text-gray-900">{currentCard.wordMeaning}</p>
              </div>
              {currentCard.partOfSpeech && (
                <div>
                  <h3 className="text-lg font-bold text-gray-700 mb-1">Jenis Kata</h3>
                  <p className="text-gray-900">{currentCard.partOfSpeech}</p>
                </div>
              )}
              {currentCard.exampleSentence && (
                <div>
                  <h3 className="text-lg font-bold text-gray-700 mb-1">Contoh</h3>
                  <p className="text-lg text-gray-900 mb-2">{currentCard.exampleSentence}</p>
                  {currentCard.exampleTranslation && (
                    <p className="text-sm text-gray-700">{currentCard.exampleTranslation}</p>
                  )}
                </div>
              )}
            </div>
            {currentCard.notes && (
              <div className="mt-6 p-4 bg-green-50 rounded-lg border-l-4 border-green-400">
                <h3 className="text-sm font-medium text-gray-700 mb-1">Catatan</h3>
                <p className="text-sm text-gray-900 whitespace-pre-wrap">{currentCard.notes}</p>
              </div>
            )}
          </div>
        );

      case 'grammar':
        return (
          <div className="h-full flex flex-col justify-center p-8 bg-orange-100">
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-bold text-gray-700 mb-1">Arti</h3>
                <p className="text-lg text-gray-900">{currentCard.grammarMeaning}</p>
              </div>
              {currentCard.usageNote && (
                <div>
                  <h3 className="text-lg font-bold text-gray-700 mb-1">Catatan Penggunaan</h3>
                  <p className="text-gray-900 whitespace-pre-wrap">{currentCard.usageNote}</p>
                </div>
              )}
              {currentCard.exampleSentence && (
                <div>
                  <h3 className="text-lg font-bold text-gray-700 mb-1">Contoh</h3>
                  <p className="text-lg text-gray-900 mb-2">{currentCard.exampleSentence}</p>
                  {currentCard.exampleTranslation && (
                    <p className="text-sm text-gray-700">{currentCard.exampleTranslation}</p>
                  )}
                </div>
              )}
            </div>
            {currentCard.notes && (
              <div className="mt-6 p-4 bg-orange-50 rounded-lg border-l-4 border-orange-400">
                <h3 className="text-xl font-medium text-gray-700 mb-1">Catatan</h3>
                <p className="text-sm text-gray-900 whitespace-pre-wrap">{currentCard.notes}</p>
              </div>
            )}
          </div>
        );

      default:
        return (
          <p className="text-center text-gray-600 dark:text-gray-400">Jenis kartu tidak dikenal</p>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
      <div className="max-w-3xl w-full">
        {/* Header */}
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{deck.name}</h1>
            {deck.description && (
              <p className="text-sm text-gray-600 dark:text-gray-400">{deck.description}</p>
            )}
          </div>
          <button
            onClick={onExit}
            className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 text-sm"
          >
            Keluar
          </button>
        </div>

        {/* Progress Bar */}
        <div className="mb-6">
          <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
            <span>
              Kartu {currentIndex + 1} dari {totalCards}
            </span>
            <span>{progress}% diriviw</span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div
              className="h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%`, backgroundColor: 'var(--secondary)' }}
            />
          </div>
        </div>

        {/* Flip Card Container - Portrait */}
        <div className="mb-6 perspective-1000 max-w-sm mx-auto relative">
          <div
            className={`relative w-full aspect-[3/4] transition-transform duration-700 transform-style-3d ${
              showAnswer ? 'rotate-y-180' : ''
            }`}
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
            style={{
              transformStyle: 'preserve-3d',
              transition:
                isSwiping && !isAnimating
                  ? 'none'
                  : isAnimating
                    ? 'all 0.3s cubic-bezier(0.4, 0.0, 0.2, 1)'
                    : 'transform 0.3s cubic-bezier(0.4, 0.0, 0.2, 1)',
              transform: `${showAnswer ? 'rotateY(180deg)' : ''} translateX(${dragOffset}px) rotate(${dragOffset * 0.05}deg)`,
              opacity: Math.max(0, 1 - Math.abs(dragOffset) / 300),
              touchAction: 'pan-y',
              userSelect: 'none',
              WebkitUserSelect: 'none',
            }}
          >
            {/* Front of Card */}
            <Card
              className="absolute inset-0 backface-hidden overflow-hidden rounded-2xl shadow-xl"
              style={{
                backfaceVisibility: 'hidden',
                backgroundColor: 'var(--secondary)',
              }}
            >
              {renderCardFront()}
            </Card>

            {/* Back of Card */}
            <div
              className="absolute inset-0 backface-hidden rotate-y-180 overflow-auto rounded-2xl shadow-xl"
              style={{
                backfaceVisibility: 'hidden',
                transform: 'rotateY(180deg)',
              }}
            >
              {renderCardBack()}
            </div>
          </div>

          {/* Arrow Rating Buttons - Always visible, always rate directly */}
          {/* Left - Belum Hafal (X icon) */}
          <button
            onClick={e => {
              e.stopPropagation();
              handleRating('belum_hafal');
            }}
            disabled={submittingRating}
            className="rating-button absolute left-0 top-1/2 -translate-y-1/2 -translate-x-16 w-12 h-12 rounded-full flex items-center justify-center shadow-lg transition-all disabled:opacity-30 disabled:cursor-not-allowed hover:scale-110 z-20"
            style={{
              backgroundColor: submittingRating ? 'hsl(var(--muted))' : 'var(--primary)',
              color: submittingRating ? 'hsl(var(--muted-foreground))' : '#fff',
            }}
            title="Belum Hafal (Swipe Left)"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-7 w-7"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2.5}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>

          {/* Right - Hafal (Checkmark icon) */}
          <button
            onClick={e => {
              e.stopPropagation();
              handleRating('hafal');
            }}
            disabled={submittingRating}
            className="rating-button absolute right-0 top-1/2 -translate-y-1/2 translate-x-16 w-12 h-12 rounded-full flex items-center justify-center shadow-lg transition-all disabled:opacity-30 disabled:cursor-not-allowed hover:scale-110 z-20"
            style={{
              backgroundColor: submittingRating ? 'hsl(var(--muted))' : 'var(--tertiary-green)',
              color: submittingRating ? 'hsl(var(--muted-foreground))' : '#fff',
            }}
            title="Hafal (Swipe Right)"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-7 w-7"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2.5}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </button>
        </div>

        {/* Flip Button - Same width as card, icon only */}
        <div className="flex justify-center mb-6">
          <button
            onClick={handleFlipCard}
            disabled={submittingRating}
            className="max-w-sm w-full h-12 rounded-lg flex items-center justify-center shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg"
            style={{
              backgroundColor: 'var(--primary)',
              color: '#fff',
            }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
          </button>
        </div>

        {/* Custom CSS for flip animation */}
        <style jsx>{`
          .perspective-1000 {
            perspective: 1000px;
          }
          .transform-style-3d {
            transform-style: preserve-3d;
          }
          .backface-hidden {
            backface-visibility: hidden;
          }
          .rotate-y-180 {
            transform: rotateY(180deg);
          }
        `}</style>
      </div>
    </div>
  );
}
