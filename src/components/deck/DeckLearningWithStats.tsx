'use client';

import { useState, useEffect } from 'react';
import FlashcardNeo from './FlashcardNeo';
import DeckStatistics from './DeckStatistics';

interface CompletionMessage {
  title: string;
  subtitle: string;
}

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

interface DeckLearningWithStatsProps {
  deck: Deck;
  sessionId: string;
  initialCardIndex?: number;
  initialReviewedCardIds?: string[];
  initialHafalCount?: number;
  initialBelumHafalCount?: number;
  onComplete: () => void;
  onExit: () => void;
  onRetry?: () => void;
}

type ViewMode = 'learning' | 'completed';

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

export default function DeckLearningWithStats({
  deck,
  sessionId,
  initialCardIndex = 0,
  initialReviewedCardIds = [],
  initialHafalCount = 0,
  initialBelumHafalCount = 0,
  onComplete,
  onExit,
  onRetry,
}: DeckLearningWithStatsProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('learning');
  const [hafalPercentage, setHafalPercentage] = useState<number>(0);

  useEffect(() => {
    if (viewMode === 'completed') {
      fetchHafalPercentage();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [viewMode]);

  const fetchHafalPercentage = async () => {
    try {
      const response = await fetch(`/api/decks/${deck.id}/stats`);
      if (response.ok) {
        const data = await response.json();
        const total = data.overall?.totalCardsInDeck || 0;
        const hafal = data.overall?.uniqueHafal || 0;
        const percentage = total > 0 ? Math.round((hafal / total) * 100) : 0;
        setHafalPercentage(percentage);
      }
    } catch (err) {
      console.error('Error fetching hafal percentage:', err);
    }
  };

  const handleCompleteLearning = async () => {
    // Mark session as completed in database BEFORE showing stats
    try {
      await fetch(`/api/app/drill-sessions/${sessionId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          isCompleted: true,
          endTime: new Date().toISOString(),
        }),
      });
    } catch (err) {
      console.error('Error completing session:', err);
    }

    // Then show completion stats
    setViewMode('completed');
  };

  // Learning View - Active SRS learning session
  if (viewMode === 'learning') {
    return (
      <FlashcardNeo
        deck={deck}
        sessionId={sessionId}
        initialCardIndex={initialCardIndex}
        initialReviewedCardIds={initialReviewedCardIds}
        initialHafalCount={initialHafalCount}
        initialBelumHafalCount={initialBelumHafalCount}
        onComplete={handleCompleteLearning}
        onExit={onExit}
      />
    );
  }

  // Completed View - Show stats after completion
  if (viewMode === 'completed') {
    const message = getCompletionMessage(hafalPercentage);

    return (
      <div className="min-h-screen bg-background p-4">
        <div className="max-w-4xl mx-auto">
          {/* Completion Header */}
          <div className="p-8 text-center mb-6 bg-background rounded-base border-2 border-border shadow-shadow">
            <h1 className="text-3xl font-bold text-foreground mb-2">{message.title}</h1>

            <p className="text-m text-muted-foreground mt-2">{message.subtitle}</p>
          </div>

          {/* Statistics */}
          <DeckStatistics deckId={deck.id} />

          {/* Action Buttons */}
          <div className="mt-8 flex gap-4 justify-center flex-wrap">
            <button
              onClick={onRetry}
              className="px-8 py-4 font-bold text-lg bg-secondary text-secondary-foreground rounded-base border-2 border-border shadow-shadow hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none transition-all"
            >
              Coba Lagi
            </button>
            <button
              onClick={onComplete}
              className="px-8 py-4 font-bold text-lg bg-primary text-primary-foreground rounded-base border-2 border-border shadow-shadow hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none transition-all"
            >
              Selesai
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
