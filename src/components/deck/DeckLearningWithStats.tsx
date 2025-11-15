'use client';

import { useState } from 'react';
import DeckLearningWithSRS from './DeckLearningWithSRS';
import DeckStatistics from './DeckStatistics';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

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

interface DeckLearningWithStatsProps {
  deck: Deck;
  sessionId: string;
  onComplete: () => void;
  onExit: () => void;
}

type ViewMode = 'learning' | 'completed';

export default function DeckLearningWithStats({
  deck,
  sessionId,
  onComplete,
  onExit,
}: DeckLearningWithStatsProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('learning');

  const handleCompleteLearning = () => {
    setViewMode('completed');
  };

  // Learning View - Active SRS learning session
  if (viewMode === 'learning') {
    return (
      <DeckLearningWithSRS
        deck={deck}
        sessionId={sessionId}
        onComplete={handleCompleteLearning}
        onExit={onExit}
      />
    );
  }

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
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Sesi Belajar Selesai!
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Hebat! Kamu telah menyelesaikan sesi belajar untuk deck <strong>{deck.name}</strong>
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
              Lihat progresmu di bawah ini
            </p>
          </Card>

          {/* Statistics */}
          <DeckStatistics deckId={deck.id} />

          {/* Action Buttons */}
          <div className="mt-8 flex gap-4 justify-center">
            <Button onClick={onComplete} size="lg">
              Selesai
            </Button>
            <Button onClick={onExit} variant="secondary" size="lg">
              Kembali ke Daftar Deck
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
