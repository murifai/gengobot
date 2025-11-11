'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

export interface FlashcardData {
  id: string;
  front: string; // Japanese/Question
  back: string; // English/Answer
  reading?: string; // Furigana
  example?: string;
  cardType?: 'vocabulary' | 'grammar' | 'kanji' | 'sentence';
}

export interface FlashcardSessionStats {
  totalCards: number;
  cardsReviewed: number;
  ratings: {
    again: number;
    hard: number;
    good: number;
    easy: number;
  };
  startTime: Date;
  endTime?: Date;
  averageResponseTime?: number;
}

export interface FlashcardSessionProps {
  cards: FlashcardData[];
  deckName?: string;
  onComplete: (stats: FlashcardSessionStats) => void;
  onExit?: () => void;
  showRatingButtons?: boolean; // If false, just show next/previous
  enableAudio?: boolean;
}

export default function FlashcardSession({
  cards,
  deckName = 'Study Session',
  onComplete,
  onExit,
  showRatingButtons = true,
}: FlashcardSessionProps) {
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [sessionStats, setSessionStats] = useState<FlashcardSessionStats>({
    totalCards: cards.length,
    cardsReviewed: 0,
    ratings: {
      again: 0,
      hard: 0,
      good: 0,
      easy: 0,
    },
    startTime: new Date(),
  });
  const [cardStartTime, setCardStartTime] = useState<Date>(new Date());
  const [showSummary, setShowSummary] = useState(false);

  const currentCard = cards[currentCardIndex];
  const progress = ((currentCardIndex + 1) / cards.length) * 100;

  const handleRevealAnswer = () => {
    setShowAnswer(true);
  };

  const handleRating = (rating: 'again' | 'hard' | 'good' | 'easy') => {
    // Update stats
    setSessionStats(prev => ({
      ...prev,
      cardsReviewed: prev.cardsReviewed + 1,
      ratings: {
        ...prev.ratings,
        [rating]: prev.ratings[rating] + 1,
      },
    }));

    // TODO: Here you would call an API to update the card's spaced repetition schedule
    // based on the rating (Again, Hard, Good, Easy)
    // For now, we just move to the next card

    moveToNextCard();
  };

  const moveToNextCard = () => {
    if (currentCardIndex < cards.length - 1) {
      setCurrentCardIndex(currentCardIndex + 1);
      setShowAnswer(false);
      setCardStartTime(new Date());
    } else {
      // Session complete
      completeSession();
    }
  };

  const handlePrevious = () => {
    if (currentCardIndex > 0) {
      setCurrentCardIndex(currentCardIndex - 1);
      setShowAnswer(false);
      setCardStartTime(new Date());
    }
  };

  const completeSession = () => {
    const endTime = new Date();
    const totalTime = endTime.getTime() - sessionStats.startTime.getTime();
    const averageResponseTime =
      sessionStats.cardsReviewed > 0 ? totalTime / sessionStats.cardsReviewed : 0;

    const finalStats: FlashcardSessionStats = {
      ...sessionStats,
      endTime,
      averageResponseTime,
    };

    setSessionStats(finalStats);
    setShowSummary(true);
  };

  const handleExitSession = () => {
    if (onExit) {
      onExit();
    } else {
      completeSession();
    }
  };

  // Summary screen
  if (showSummary) {
    const duration = sessionStats.endTime
      ? Math.round((sessionStats.endTime.getTime() - sessionStats.startTime.getTime()) / 1000)
      : 0;
    const minutes = Math.floor(duration / 60);
    const seconds = duration % 60;

    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
        <Card className="max-w-2xl w-full p-8">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-tertiary-green/10 rounded-full mb-4">
              <svg
                className="w-8 h-8 text-tertiary-green"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Session Complete!
            </h2>
            <p className="text-gray-600 dark:text-gray-400">{deckName}</p>
          </div>

          <div className="space-y-6 mb-8">
            {/* Summary Stats */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-secondary/10 rounded-lg">
                <div className="text-3xl font-bold text-secondary">
                  {sessionStats.cardsReviewed}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Cards Reviewed</div>
              </div>
              <div className="p-4 bg-tertiary-purple/10 rounded-lg">
                <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                  {minutes}:{seconds.toString().padStart(2, '0')}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Time Spent</div>
              </div>
            </div>

            {/* Rating Breakdown */}
            {showRatingButtons && (
              <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
                  Performance Breakdown
                </h3>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Again</span>
                    <div className="flex items-center gap-2">
                      <div className="w-32 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary"
                          style={{
                            width: `${
                              sessionStats.cardsReviewed > 0
                                ? (sessionStats.ratings.again / sessionStats.cardsReviewed) * 100
                                : 0
                            }%`,
                          }}
                        />
                      </div>
                      <span className="text-sm font-medium text-gray-900 dark:text-white w-8">
                        {sessionStats.ratings.again}
                      </span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Hard</span>
                    <div className="flex items-center gap-2">
                      <div className="w-32 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-tertiary-yellow"
                          style={{
                            width: `${
                              sessionStats.cardsReviewed > 0
                                ? (sessionStats.ratings.hard / sessionStats.cardsReviewed) * 100
                                : 0
                            }%`,
                          }}
                        />
                      </div>
                      <span className="text-sm font-medium text-gray-900 dark:text-white w-8">
                        {sessionStats.ratings.hard}
                      </span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Good</span>
                    <div className="flex items-center gap-2">
                      <div className="w-32 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-tertiary-green"
                          style={{
                            width: `${
                              sessionStats.cardsReviewed > 0
                                ? (sessionStats.ratings.good / sessionStats.cardsReviewed) * 100
                                : 0
                            }%`,
                          }}
                        />
                      </div>
                      <span className="text-sm font-medium text-gray-900 dark:text-white w-8">
                        {sessionStats.ratings.good}
                      </span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Easy</span>
                    <div className="flex items-center gap-2">
                      <div className="w-32 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-secondary"
                          style={{
                            width: `${
                              sessionStats.cardsReviewed > 0
                                ? (sessionStats.ratings.easy / sessionStats.cardsReviewed) * 100
                                : 0
                            }%`,
                          }}
                        />
                      </div>
                      <span className="text-sm font-medium text-gray-900 dark:text-white w-8">
                        {sessionStats.ratings.easy}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Next Review Info */}
            {showRatingButtons && (
              <div className="p-4 bg-secondary/10 rounded-lg text-center">
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  Cards will be scheduled for review based on your performance.
                  <br />
                  Keep practicing to improve your retention!
                </p>
              </div>
            )}
          </div>

          <Button onClick={() => onComplete(sessionStats)} className="w-full">
            Continue
          </Button>
        </Card>
      </div>
    );
  }

  // No cards available
  if (!currentCard || cards.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
        <Card className="max-w-2xl w-full p-8 text-center">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            No cards available
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            There are no cards to review in this session.
          </p>
          <Button onClick={() => onComplete(sessionStats)}>Continue</Button>
        </Card>
      </div>
    );
  }

  // Flashcard study screen
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        {/* Header */}
        <div className="mb-4 flex justify-between items-center">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{deckName}</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Card {currentCardIndex + 1} of {cards.length}
            </p>
          </div>
          <Button onClick={handleExitSession} variant="secondary" size="sm">
            Exit Session
          </Button>
        </div>

        {/* Progress Bar */}
        <div className="mb-6 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
          <div
            className="bg-primary-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Flashcard */}
        <Card
          className="mb-6 p-8 min-h-[350px] flex flex-col justify-center items-center cursor-pointer hover:shadow-lg transition-shadow"
          onClick={handleRevealAnswer}
        >
          <div className="text-center w-full">
            <div className="mb-4">
              <span className="text-sm text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                {showAnswer ? 'Answer' : 'Question'}
              </span>
            </div>

            {!showAnswer ? (
              <>
                <p className="text-4xl font-bold text-gray-900 dark:text-white mb-3">
                  {currentCard.front}
                </p>
                {currentCard.reading && (
                  <p className="text-xl text-gray-600 dark:text-gray-400 mb-6">
                    {currentCard.reading}
                  </p>
                )}
                <p className="mt-8 text-sm text-gray-500 dark:text-gray-400">
                  Click to reveal answer
                </p>
              </>
            ) : (
              <>
                <p className="text-3xl text-gray-900 dark:text-white mb-4">{currentCard.back}</p>
                {currentCard.example && (
                  <div className="mt-6 p-4 bg-secondary/10 rounded-lg">
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Example:</p>
                    <p className="text-base text-gray-800 dark:text-gray-200">
                      {currentCard.example}
                    </p>
                  </div>
                )}
              </>
            )}
          </div>
        </Card>

        {/* Controls */}
        {!showAnswer ? (
          <div className="flex gap-4">
            <Button
              onClick={handlePrevious}
              disabled={currentCardIndex === 0}
              variant="secondary"
              className="flex-1"
            >
              Previous
            </Button>
            <Button onClick={handleRevealAnswer} className="flex-1">
              Show Answer
            </Button>
          </div>
        ) : (
          <>
            {showRatingButtons ? (
              <div className="space-y-3">
                <p className="text-center text-sm text-gray-600 dark:text-gray-400 mb-2">
                  How well did you know this card?
                </p>
                <div className="grid grid-cols-2 gap-3">
                  <Button
                    onClick={() => handleRating('again')}
                    variant="secondary"
                    className="bg-primary/10 hover:brightness-95 text-primary border-primary/30"
                  >
                    <span className="mr-2">🔴</span>
                    Again
                  </Button>
                  <Button
                    onClick={() => handleRating('hard')}
                    variant="secondary"
                    className="bg-tertiary-yellow/10 hover:brightness-95 text-foreground border-tertiary-yellow/30"
                  >
                    <span className="mr-2">🟠</span>
                    Hard
                  </Button>
                  <Button
                    onClick={() => handleRating('good')}
                    variant="secondary"
                    className="bg-tertiary-green/10 hover:brightness-95 text-tertiary-green border-tertiary-green/30"
                  >
                    <span className="mr-2">🟢</span>
                    Good
                  </Button>
                  <Button
                    onClick={() => handleRating('easy')}
                    variant="secondary"
                    className="bg-secondary/10 hover:brightness-95 text-secondary border-secondary/30"
                  >
                    <span className="mr-2">🔵</span>
                    Easy
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex gap-4">
                <Button
                  onClick={handlePrevious}
                  disabled={currentCardIndex === 0}
                  variant="secondary"
                  className="flex-1"
                >
                  Previous
                </Button>
                <Button onClick={moveToNextCard} className="flex-1">
                  {currentCardIndex === cards.length - 1 ? 'Finish' : 'Next Card'}
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
