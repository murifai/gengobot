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

interface ReviewStats {
  totalCards: number;
  dueToday: number;
  newCards: number;
}

interface DeckLearningWithSRSProps {
  deck: Deck;
  sessionId: string;
  reviewStats: ReviewStats | null;
  onComplete: () => void;
  onExit: () => void;
}

type Rating = 'again' | 'hard' | 'good' | 'easy';

export default function DeckLearningWithSRS({
  deck,
  sessionId,
  reviewStats,
  onComplete,
  onExit,
}: DeckLearningWithSRSProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [reviewedCards, setReviewedCards] = useState<Set<number>>(new Set());
  const [reviewStartTime, setReviewStartTime] = useState<number>(Date.now());
  const [submittingRating, setSubmittingRating] = useState(false);
  const [sessionStats, setSessionStats] = useState({
    againCount: 0,
    hardCount: 0,
    goodCount: 0,
    easyCount: 0,
  });

  const currentCard = deck.flashcards[currentIndex];
  const totalCards = deck.flashcards.length;
  const progress = ((reviewedCards.size / totalCards) * 100).toFixed(0);

  useEffect(() => {
    setReviewStartTime(Date.now());
  }, [currentIndex]);

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
    setShowAnswer(!showAnswer);
    if (!showAnswer) {
      setReviewedCards(prev => new Set([...prev, currentIndex]));
    }
  };

  const handleRating = async (rating: Rating) => {
    try {
      setSubmittingRating(true);
      const responseTime = Math.floor((Date.now() - reviewStartTime) / 1000); // in seconds

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

      // Update session stats
      setSessionStats(prev => ({
        ...prev,
        [`${rating}Count`]: prev[`${rating}Count` as keyof typeof prev] + 1,
      }));

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

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setShowAnswer(false);
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
          <div className="h-full flex flex-col justify-center p-8">
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Arti</h3>
                <p className="text-lg text-gray-900 dark:text-white">{currentCard.kanjiMeaning}</p>
              </div>
              {currentCard.onyomi && (
                <div>
                  <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                    On&apos;yomi (音読み)
                  </h3>
                  <p className="text-lg text-gray-900 dark:text-white">{currentCard.onyomi}</p>
                </div>
              )}
              {currentCard.kunyomi && (
                <div>
                  <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                    Kun&apos;yomi (訓読み)
                  </h3>
                  <p className="text-lg text-gray-900 dark:text-white">{currentCard.kunyomi}</p>
                </div>
              )}
              {currentCard.exampleSentence && (
                <div>
                  <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                    Contoh
                  </h3>
                  <p className="text-lg text-gray-900 dark:text-white mb-2">
                    {currentCard.exampleSentence}
                  </p>
                  {currentCard.exampleTranslation && (
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {currentCard.exampleTranslation}
                    </p>
                  )}
                </div>
              )}
            </div>
            {currentCard.notes && (
              <div className="mt-6 p-4 bg-white/50 dark:bg-gray-800/50 rounded-lg border-l-4 border-blue-400">
                <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                  Catatan
                </h3>
                <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                  {currentCard.notes}
                </p>
              </div>
            )}
          </div>
        );

      case 'vocabulary':
        return (
          <div className="h-full flex flex-col justify-center p-8">
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Arti</h3>
                <p className="text-lg text-gray-900 dark:text-white">{currentCard.wordMeaning}</p>
              </div>
              {currentCard.partOfSpeech && (
                <div>
                  <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                    Jenis Kata
                  </h3>
                  <p className="text-gray-900 dark:text-white">{currentCard.partOfSpeech}</p>
                </div>
              )}
              {currentCard.exampleSentence && (
                <div>
                  <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                    Contoh
                  </h3>
                  <p className="text-lg text-gray-900 dark:text-white mb-2">
                    {currentCard.exampleSentence}
                  </p>
                  {currentCard.exampleTranslation && (
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {currentCard.exampleTranslation}
                    </p>
                  )}
                </div>
              )}
            </div>
            {currentCard.notes && (
              <div className="mt-6 p-4 bg-white/50 dark:bg-gray-800/50 rounded-lg border-l-4 border-green-400">
                <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                  Catatan
                </h3>
                <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                  {currentCard.notes}
                </p>
              </div>
            )}
          </div>
        );

      case 'grammar':
        return (
          <div className="h-full flex flex-col justify-center p-8">
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Arti</h3>
                <p className="text-lg text-gray-900 dark:text-white">
                  {currentCard.grammarMeaning}
                </p>
              </div>
              {currentCard.usageNote && (
                <div>
                  <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                    Catatan Penggunaan
                  </h3>
                  <p className="text-gray-900 dark:text-white whitespace-pre-wrap">
                    {currentCard.usageNote}
                  </p>
                </div>
              )}
              {currentCard.exampleSentence && (
                <div>
                  <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                    Contoh
                  </h3>
                  <p className="text-lg text-gray-900 dark:text-white mb-2">
                    {currentCard.exampleSentence}
                  </p>
                  {currentCard.exampleTranslation && (
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {currentCard.exampleTranslation}
                    </p>
                  )}
                </div>
              )}
            </div>
            {currentCard.notes && (
              <div className="mt-6 p-4 bg-white/50 dark:bg-gray-800/50 rounded-lg border-l-4 border-orange-400">
                <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                  Catatan
                </h3>
                <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                  {currentCard.notes}
                </p>
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

        {/* Statistics Bar */}
        {reviewStats && (
          <div className="mb-4 grid grid-cols-3 gap-3">
            <Card
              className="p-3"
              style={{
                backgroundColor: 'color-mix(in srgb, var(--secondary) 12%, transparent)',
                borderColor: 'var(--secondary)',
              }}
            >
              <div className="text-xs mb-1" style={{ color: 'var(--secondary)' }}>
                Diriviw
              </div>
              <div className="text-2xl font-bold" style={{ color: 'var(--secondary)' }}>
                {reviewStats.dueToday}
              </div>
            </Card>
            <Card
              className="p-3"
              style={{
                backgroundColor: 'color-mix(in srgb, var(--tertiary-green) 12%, transparent)',
                borderColor: 'var(--tertiary-green)',
              }}
            >
              <div className="text-xs mb-1" style={{ color: 'var(--tertiary-green)' }}>
                Baru
              </div>
              <div className="text-2xl font-bold" style={{ color: 'var(--tertiary-green)' }}>
                {reviewStats.newCards}
              </div>
            </Card>
            <Card
              className="p-3"
              style={{
                backgroundColor: 'color-mix(in srgb, var(--tertiary-purple) 12%, transparent)',
                borderColor: 'var(--tertiary-purple)',
              }}
            >
              <div className="text-xs mb-1" style={{ color: 'var(--tertiary-purple)' }}>
                Total
              </div>
              <div className="text-2xl font-bold" style={{ color: 'var(--tertiary-purple)' }}>
                {reviewStats.totalCards}
              </div>
            </Card>
          </div>
        )}

        {/* Session Stats */}
        <div className="mb-4 grid grid-cols-4 gap-2">
          <div
            className="text-center p-2 rounded-lg"
            style={{ backgroundColor: 'color-mix(in srgb, var(--primary) 12%, transparent)' }}
          >
            <div className="text-xs" style={{ color: 'var(--primary)' }}>
              Baru
            </div>
            <div className="text-lg font-semibold" style={{ color: 'var(--primary)' }}>
              {sessionStats.againCount}
            </div>
          </div>
          <div
            className="text-center p-2 rounded-lg"
            style={{
              backgroundColor: 'color-mix(in srgb, var(--tertiary-yellow) 12%, transparent)',
            }}
          >
            <div className="text-xs" style={{ color: 'hsl(48, 50%, 50%)' }}>
              Susah
            </div>
            <div className="text-lg font-semibold" style={{ color: 'hsl(48, 50%, 50%)' }}>
              {sessionStats.hardCount}
            </div>
          </div>
          <div
            className="text-center p-2 rounded-lg"
            style={{
              backgroundColor: 'color-mix(in srgb, var(--tertiary-green) 12%, transparent)',
            }}
          >
            <div className="text-xs" style={{ color: 'var(--tertiary-green)' }}>
              Oke
            </div>
            <div className="text-lg font-semibold" style={{ color: 'var(--tertiary-green)' }}>
              {sessionStats.goodCount}
            </div>
          </div>
          <div
            className="text-center p-2 rounded-lg"
            style={{ backgroundColor: 'color-mix(in srgb, var(--secondary) 12%, transparent)' }}
          >
            <div className="text-xs" style={{ color: 'var(--secondary)' }}>
              Gampang
            </div>
            <div className="text-lg font-semibold" style={{ color: 'var(--secondary)' }}>
              {sessionStats.easyCount}
            </div>
          </div>
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
        <div className="mb-6 perspective-1000 max-w-sm mx-auto">
          <div
            onClick={handleFlipCard}
            className={`relative w-full aspect-[3/4] transition-transform duration-700 transform-style-3d cursor-pointer ${
              showAnswer ? 'rotate-y-180' : ''
            }`}
            style={{
              transformStyle: 'preserve-3d',
              transition: 'transform 0.7s cubic-bezier(0.4, 0.0, 0.2, 1)',
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
            <Card
              className="absolute inset-0 backface-hidden rotate-y-180 overflow-auto rounded-2xl shadow-xl"
              style={{
                backfaceVisibility: 'hidden',
                transform: 'rotateY(180deg)',
                backgroundColor: 'hsl(var(--card))',
              }}
            >
              {renderCardBack()}
            </Card>
          </div>
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

        {/* Controls */}
        <div className="max-w-sm mx-auto space-y-4">
          <button
            onClick={handleFlipCard}
            className="w-full p-4 rounded-lg text-white transition-colors flex items-center justify-center shadow-lg hover:brightness-90"
            style={{ backgroundColor: 'var(--primary)' }}
            title={showAnswer ? 'Flip to front' : 'Turn over'}
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

          {/* Rating Buttons - Always Visible */}
          <div className="grid grid-cols-4 gap-3">
            <button
              onClick={() => handleRating('again')}
              disabled={submittingRating || !showAnswer}
              className="flex items-center justify-center py-4 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed hover:brightness-90"
              style={{
                backgroundColor:
                  submittingRating || !showAnswer ? 'hsl(var(--muted))' : 'var(--primary)',
                color: submittingRating || !showAnswer ? 'hsl(var(--muted-foreground))' : '#fff',
              }}
            >
              <span className="text-sm font-semibold">Baru</span>
            </button>

            <button
              onClick={() => handleRating('hard')}
              disabled={submittingRating || !showAnswer}
              className="flex items-center justify-center py-4 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed hover:brightness-90"
              style={{
                backgroundColor:
                  submittingRating || !showAnswer ? 'hsl(var(--muted))' : 'var(--tertiary-yellow)',
                color:
                  submittingRating || !showAnswer
                    ? 'hsl(var(--muted-foreground))'
                    : 'hsl(48, 50%, 30%)',
              }}
            >
              <span className="text-sm font-semibold">Susah</span>
            </button>

            <button
              onClick={() => handleRating('good')}
              disabled={submittingRating || !showAnswer}
              className="flex items-center justify-center py-4 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed hover:brightness-90"
              style={{
                backgroundColor:
                  submittingRating || !showAnswer ? 'hsl(var(--muted))' : 'var(--tertiary-green)',
                color: submittingRating || !showAnswer ? 'hsl(var(--muted-foreground))' : '#fff',
              }}
            >
              <span className="text-sm font-semibold">Oke</span>
            </button>

            <button
              onClick={() => handleRating('easy')}
              disabled={submittingRating || !showAnswer}
              className="flex items-center justify-center py-4 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed hover:brightness-90"
              style={{
                backgroundColor:
                  submittingRating || !showAnswer ? 'hsl(var(--muted))' : 'var(--secondary)',
                color: submittingRating || !showAnswer ? 'hsl(var(--muted-foreground))' : '#fff',
              }}
            >
              <span className="text-sm font-semibold">Gampang</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
