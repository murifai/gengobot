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
          <p className="text-gray-600 dark:text-gray-400 mb-4">No cards available in this deck.</p>
          <Button onClick={onExit}>Go Back</Button>
        </Card>
      </div>
    );
  }

  const handleShowAnswer = () => {
    setShowAnswer(true);
    setReviewedCards(prev => new Set([...prev, currentIndex]));
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

  const renderCardContent = () => {
    switch (currentCard.cardType) {
      case 'kanji':
        return (
          <>
            <div className="mb-8">
              <div className="text-center mb-6">
                <div className="inline-block px-3 py-1 bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 rounded-full text-sm font-medium mb-4">
                  Kanji Card
                </div>
              </div>
              <div className="text-8xl font-bold text-center text-gray-900 dark:text-white mb-4">
                {currentCard.kanji}
              </div>
            </div>

            {showAnswer && (
              <div className="space-y-4 bg-blue-50 dark:bg-blue-900/20 p-6 rounded-lg">
                <div>
                  <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                    Meaning
                  </h3>
                  <p className="text-lg text-gray-900 dark:text-white">
                    {currentCard.kanjiMeaning}
                  </p>
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
                      Example
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
            )}
          </>
        );

      case 'vocabulary':
        return (
          <>
            <div className="mb-8">
              <div className="text-center mb-6">
                <div className="inline-block px-3 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-full text-sm font-medium mb-4">
                  Vocabulary Card
                </div>
              </div>
              <div className="text-6xl font-bold text-center text-gray-900 dark:text-white mb-2">
                {currentCard.word}
              </div>
              {currentCard.reading && (
                <div className="text-2xl text-center text-gray-600 dark:text-gray-400">
                  {currentCard.reading}
                </div>
              )}
            </div>

            {showAnswer && (
              <div className="space-y-4 bg-green-50 dark:bg-green-900/20 p-6 rounded-lg">
                <div>
                  <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                    Meaning
                  </h3>
                  <p className="text-lg text-gray-900 dark:text-white">{currentCard.wordMeaning}</p>
                </div>
                {currentCard.partOfSpeech && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                      Part of Speech
                    </h3>
                    <p className="text-gray-900 dark:text-white">{currentCard.partOfSpeech}</p>
                  </div>
                )}
                {currentCard.exampleSentence && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                      Example
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
            )}
          </>
        );

      case 'grammar':
        return (
          <>
            <div className="mb-8">
              <div className="text-center mb-6">
                <div className="inline-block px-3 py-1 bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200 rounded-full text-sm font-medium mb-4">
                  Grammar Card
                </div>
              </div>
              <div className="text-4xl font-bold text-center text-gray-900 dark:text-white">
                {currentCard.grammarPoint}
              </div>
            </div>

            {showAnswer && (
              <div className="space-y-4 bg-orange-50 dark:bg-orange-900/20 p-6 rounded-lg">
                <div>
                  <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                    Meaning
                  </h3>
                  <p className="text-lg text-gray-900 dark:text-white">
                    {currentCard.grammarMeaning}
                  </p>
                </div>
                {currentCard.usageNote && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                      Usage Note
                    </h3>
                    <p className="text-gray-900 dark:text-white whitespace-pre-wrap">
                      {currentCard.usageNote}
                    </p>
                  </div>
                )}
                {currentCard.exampleSentence && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                      Example
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
            )}
          </>
        );

      default:
        return <p className="text-center text-gray-600 dark:text-gray-400">Unknown card type</p>;
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
            Exit
          </button>
        </div>

        {/* Statistics Bar */}
        {reviewStats && (
          <div className="mb-4 grid grid-cols-3 gap-3">
            <Card className="p-3 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
              <div className="text-xs text-blue-600 dark:text-blue-400 mb-1">Due Today</div>
              <div className="text-2xl font-bold text-blue-700 dark:text-blue-300">
                {reviewStats.dueToday}
              </div>
            </Card>
            <Card className="p-3 bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
              <div className="text-xs text-green-600 dark:text-green-400 mb-1">New Cards</div>
              <div className="text-2xl font-bold text-green-700 dark:text-green-300">
                {reviewStats.newCards}
              </div>
            </Card>
            <Card className="p-3 bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800">
              <div className="text-xs text-purple-600 dark:text-purple-400 mb-1">Total Cards</div>
              <div className="text-2xl font-bold text-purple-700 dark:text-purple-300">
                {reviewStats.totalCards}
              </div>
            </Card>
          </div>
        )}

        {/* Session Stats */}
        <div className="mb-4 grid grid-cols-4 gap-2">
          <div className="text-center p-2 bg-red-50 dark:bg-red-900/20 rounded-lg">
            <div className="text-xs text-red-600 dark:text-red-400">Again</div>
            <div className="text-lg font-semibold text-red-700 dark:text-red-300">
              {sessionStats.againCount}
            </div>
          </div>
          <div className="text-center p-2 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
            <div className="text-xs text-orange-600 dark:text-orange-400">Hard</div>
            <div className="text-lg font-semibold text-orange-700 dark:text-orange-300">
              {sessionStats.hardCount}
            </div>
          </div>
          <div className="text-center p-2 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <div className="text-xs text-green-600 dark:text-green-400">Good</div>
            <div className="text-lg font-semibold text-green-700 dark:text-green-300">
              {sessionStats.goodCount}
            </div>
          </div>
          <div className="text-center p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <div className="text-xs text-blue-600 dark:text-blue-400">Easy</div>
            <div className="text-lg font-semibold text-blue-700 dark:text-blue-300">
              {sessionStats.easyCount}
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-6">
          <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
            <span>
              Card {currentIndex + 1} of {totalCards}
            </span>
            <span>{progress}% reviewed</span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div
              className="bg-blue-600 dark:bg-blue-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Card */}
        <Card className="p-8 mb-6 min-h-[400px] flex flex-col justify-between">
          <div>{renderCardContent()}</div>

          {/* Notes */}
          {showAnswer && currentCard.notes && (
            <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border-l-4 border-gray-400">
              <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Notes</h3>
              <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                {currentCard.notes}
              </p>
            </div>
          )}
        </Card>

        {/* Controls */}
        {!showAnswer ? (
          <div className="flex items-center gap-4">
            <button
              onClick={handlePrevious}
              disabled={currentIndex === 0}
              className="p-3 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              title="Previous card"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 text-gray-700 dark:text-gray-300"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>

            <Button onClick={handleShowAnswer} className="flex-1" variant="default">
              Show Answer
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-center text-sm text-gray-600 dark:text-gray-400">
              How well did you know this?
            </p>
            <div className="grid grid-cols-4 gap-2">
              <button
                onClick={() => handleRating('again')}
                disabled={submittingRating}
                className="flex flex-col items-center justify-center p-4 rounded-lg bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/30 border-2 border-red-200 dark:border-red-800 transition-colors disabled:opacity-50"
              >
                <span className="text-2xl mb-2">❌</span>
                <span className="text-sm font-semibold text-red-700 dark:text-red-300">Again</span>
                <span className="text-xs text-red-600 dark:text-red-400">{'<1 min'}</span>
              </button>

              <button
                onClick={() => handleRating('hard')}
                disabled={submittingRating}
                className="flex flex-col items-center justify-center p-4 rounded-lg bg-orange-50 hover:bg-orange-100 dark:bg-orange-900/20 dark:hover:bg-orange-900/30 border-2 border-orange-200 dark:border-orange-800 transition-colors disabled:opacity-50"
              >
                <span className="text-2xl mb-2">🤔</span>
                <span className="text-sm font-semibold text-orange-700 dark:text-orange-300">
                  Hard
                </span>
                <span className="text-xs text-orange-600 dark:text-orange-400">{'<10 min'}</span>
              </button>

              <button
                onClick={() => handleRating('good')}
                disabled={submittingRating}
                className="flex flex-col items-center justify-center p-4 rounded-lg bg-green-50 hover:bg-green-100 dark:bg-green-900/20 dark:hover:bg-green-900/30 border-2 border-green-200 dark:border-green-800 transition-colors disabled:opacity-50"
              >
                <span className="text-2xl mb-2">✅</span>
                <span className="text-sm font-semibold text-green-700 dark:text-green-300">
                  Good
                </span>
                <span className="text-xs text-green-600 dark:text-green-400">{'<1 day'}</span>
              </button>

              <button
                onClick={() => handleRating('easy')}
                disabled={submittingRating}
                className="flex flex-col items-center justify-center p-4 rounded-lg bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/20 dark:hover:bg-blue-900/30 border-2 border-blue-200 dark:border-blue-800 transition-colors disabled:opacity-50"
              >
                <span className="text-2xl mb-2">🎯</span>
                <span className="text-sm font-semibold text-blue-700 dark:text-blue-300">Easy</span>
                <span className="text-xs text-blue-600 dark:text-blue-400">{'4 days'}</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
