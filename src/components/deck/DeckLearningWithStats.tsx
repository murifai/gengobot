'use client';

import { useState } from 'react';
import FlashcardNeo from './FlashcardNeo';
import DeckStatistics from './DeckStatistics';

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
        onComplete={handleCompleteLearning}
        onExit={onExit}
      />
    );
  }

  // Completed View - Show stats after completion
  if (viewMode === 'completed') {
    return (
      <div className="min-h-screen bg-background p-4">
        <div className="max-w-4xl mx-auto">
          {/* Completion Header */}
          <div
            className="p-8 text-center mb-6 bg-white"
            style={{
              border: '3px solid #000',
              boxShadow: '4px 4px 0px 0px #000',
            }}
          >
            <div
              className="w-20 h-20 mx-auto mb-4 flex items-center justify-center"
              style={{
                backgroundColor: 'var(--tertiary-green, #22c55e)',
                border: '3px solid #000',
                boxShadow: '3px 3px 0px 0px #000',
              }}
            >
              <svg
                className="w-12 h-12 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={3}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Sesi Belajar Selesai!</h1>
            <p className="text-muted-foreground">
              Hebat! Kamu telah menyelesaikan sesi belajar untuk deck{' '}
              <strong className="text-foreground">{deck.name}</strong>
            </p>
            <p className="text-sm text-muted-foreground mt-2">Lihat progresmu di bawah ini</p>
          </div>

          {/* Statistics */}
          <DeckStatistics deckId={deck.id} />

          {/* Action Buttons */}
          <div className="mt-8 flex gap-4 justify-center flex-wrap">
            <button
              onClick={onComplete}
              className="px-8 py-4 font-bold text-lg bg-primary text-white transition-transform hover:translate-y-[-2px]"
              style={{
                border: '3px solid #000',
                boxShadow: '4px 4px 0px 0px #000',
              }}
            >
              Selesai
            </button>
            <button
              onClick={onExit}
              className="px-8 py-4 font-bold text-lg bg-white text-foreground transition-transform hover:translate-y-[-2px]"
              style={{
                border: '3px solid #000',
                boxShadow: '4px 4px 0px 0px #000',
              }}
            >
              Kembali ke Daftar Deck
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
