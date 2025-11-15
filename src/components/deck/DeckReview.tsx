'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import DeckStatistics from './DeckStatistics';

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

interface DeckReviewProps {
  deck: Deck;
  onComplete: () => void;
  onExit: () => void;
}

type ViewMode = 'review' | 'completed';

export default function DeckReview({ deck, onComplete, onExit }: DeckReviewProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('review');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [reviewedCards, setReviewedCards] = useState<Set<number>>(new Set());

  const currentCard = deck.flashcards[currentIndex];
  const totalCards = deck.flashcards.length;
  const progress = ((reviewedCards.size / totalCards) * 100).toFixed(0);

  if (!currentCard) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
        <Card className="max-w-2xl w-full p-8 text-center bg-white dark:bg-white">
          <p className="text-gray-900 mb-4">Tidak ada kartu dalam dek ini.</p>
          <Button onClick={onExit}>Kembali</Button>
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
      handleCompleteReview();
    }
  };

  const handleCompleteReview = () => {
    setViewMode('completed');
    onComplete();
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
                <div className="inline-block px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium mb-4">
                  Kartu Kanji
                </div>
              </div>
              <div className="text-8xl font-bold text-center text-gray-900 mb-4">
                {currentCard.kanji}
              </div>
            </div>

            {/* Back - Answer */}
            {showAnswer && (
              <div className="space-y-4 bg-yellow-100 p-6 rounded-lg">
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
            )}
          </>
        );

      case 'vocabulary':
        return (
          <>
            {/* Front - Word */}
            <div className="mb-8">
              <div className="text-center mb-6">
                <div className="inline-block px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium mb-4">
                  Kartu Kosakata
                </div>
              </div>
              <div className="text-6xl font-bold text-center text-gray-900 mb-2">
                {currentCard.word}
              </div>
              {currentCard.reading && (
                <div className="text-2xl text-center text-gray-600">{currentCard.reading}</div>
              )}
            </div>

            {/* Back - Answer */}
            {showAnswer && (
              <div className="space-y-4 bg-green-100 p-6 rounded-lg">
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
            )}
          </>
        );

      case 'grammar':
        return (
          <>
            {/* Front - Grammar Point */}
            <div className="mb-8">
              <div className="text-center mb-6">
                <div className="inline-block px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm font-medium mb-4">
                  Kartu Grammar
                </div>
              </div>
              <div className="text-4xl font-bold text-center text-gray-900">
                {currentCard.grammarPoint}
              </div>
            </div>

            {/* Back - Answer */}
            {showAnswer && (
              <div className="space-y-4 bg-orange-100 p-6 rounded-lg">
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
            )}
          </>
        );

      default:
        return <p className="text-center text-gray-900">Jenis kartu tidak dikenal</p>;
    }
  };

  // Completed View - Show stats after completion
  if (viewMode === 'completed') {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
        <div className="max-w-4xl mx-auto">
          {/* Completion Header */}
          <Card className="p-8 text-center mb-6">
            <div className="flex justify-center mb-4">
              <svg
                className="w-16 h-16 text-green-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Sesi Selesai!</h1>
            <p className="text-gray-600 dark:text-gray-400">
              Kerja bagus! Kamu telah menyelesaikan review untuk deck {deck.name}
            </p>
          </Card>

          {/* Statistics */}
          <DeckStatistics deckId={deck.id} />

          {/* Action Buttons */}
          <div className="mt-8 flex gap-4 justify-center">
            <Button
              onClick={() => {
                setCurrentIndex(0);
                setShowAnswer(false);
                setReviewedCards(new Set());
                setViewMode('review');
              }}
              size="lg"
            >
              Review Lagi
            </Button>
            <Button onClick={onExit} variant="secondary" size="lg">
              Selesai
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Review View - Active learning session
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
            <span>{progress}% direview</span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div
              className="h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%`, backgroundColor: 'var(--secondary)' }}
            />
          </div>
        </div>

        {/* Card */}
        <Card className="p-8 mb-6 min-h-[400px] flex flex-col justify-between bg-white dark:bg-white">
          <div>{renderCardContent()}</div>

          {/* Notes */}
          {showAnswer && currentCard.notes && (
            <div className="mt-4 p-4 bg-blue-50 rounded-lg border-l-4 border-blue-400">
              <h3 className="text-sm font-medium text-gray-700 mb-1">Catatan</h3>
              <p className="text-sm text-gray-900 whitespace-pre-wrap">{currentCard.notes}</p>
            </div>
          )}
        </Card>

        {/* Controls */}
        <div className="flex items-center gap-4">
          {/* Previous Button */}
          <button
            onClick={handlePrevious}
            disabled={currentIndex === 0}
            className="p-3 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            title="Kartu sebelumnya"
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

          {/* Show Answer / Next Button */}
          <div className="flex-1">
            {!showAnswer ? (
              <Button onClick={handleShowAnswer} className="w-full" variant="default">
                Tampilkan Jawaban
              </Button>
            ) : (
              <Button onClick={handleNext} className="w-full" variant="default">
                {currentIndex < totalCards - 1 ? 'Kartu Berikutnya' : 'Selesai'}
              </Button>
            )}
          </div>

          {/* Next Button */}
          <button
            onClick={showAnswer ? handleNext : handleShowAnswer}
            disabled={!showAnswer && currentIndex === totalCards - 1}
            className="p-3 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            title={showAnswer ? 'Kartu berikutnya' : 'Tampilkan jawaban dulu'}
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
