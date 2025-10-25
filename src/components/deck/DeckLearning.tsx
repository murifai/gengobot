'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface Flashcard {
  id: string;
  cardType: string;
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
}

interface Deck {
  id: string;
  name: string;
  description: string | null;
  category: string | null;
  difficulty: string | null;
  flashcards: Flashcard[];
}

interface DeckLearningProps {
  deck: Deck;
  onComplete: () => void;
  onExit: () => void;
}

export default function DeckLearning({ deck, onComplete, onExit }: DeckLearningProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [reviewedCards, setReviewedCards] = useState<Set<number>>(new Set());

  const currentCard = deck.flashcards[currentIndex];
  const totalCards = deck.flashcards.length;
  const progress = ((reviewedCards.size / totalCards) * 100).toFixed(0);

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

  const handleNext = () => {
    if (currentIndex < totalCards - 1) {
      setCurrentIndex(currentIndex + 1);
      setShowAnswer(false);
    } else {
      onComplete();
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
            {/* Front - Kanji */}
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

            {/* Back - Answer */}
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
            {/* Front - Word */}
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

            {/* Back - Answer */}
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
            {/* Front - Grammar Point */}
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

            {/* Back - Answer */}
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
        <div className="flex items-center gap-4">
          {/* Previous Button - Left Side (Icon Only) */}
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

          {/* Show Answer / Next Button - Center */}
          <div className="flex-1">
            {!showAnswer ? (
              <Button onClick={handleShowAnswer} className="w-full" variant="default">
                Show Answer
              </Button>
            ) : (
              <Button onClick={handleNext} className="w-full" variant="default">
                {currentIndex < totalCards - 1 ? 'Next Card' : 'Complete'}
              </Button>
            )}
          </div>

          {/* Next Button - Right Side (Icon Only) */}
          <button
            onClick={showAnswer ? handleNext : handleShowAnswer}
            disabled={!showAnswer && currentIndex === totalCards - 1}
            className="p-3 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            title={showAnswer ? 'Next card' : 'Show answer first'}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 text-gray-700 dark:text-gray-300"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
