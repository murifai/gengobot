'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import DeckLearningWithSRS from '@/components/deck/DeckLearningWithSRS';
import { LoadingState } from '@/components/ui/LoadingState';
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

export default function StudyDeckPage({ params }: { params: { deckId: string } }) {
  const router = useRouter();
  const [deck, setDeck] = useState<Deck | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    startStudySession();
  }, [params.deckId]);

  const startStudySession = async () => {
    try {
      setLoading(true);
      setError(null);

      // Start a new study session
      const response = await fetch('/api/study-sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ deckId: params.deckId }),
      });

      if (!response.ok) {
        throw new Error('Failed to start study session');
      }

      const data = await response.json();
      setSessionId(data.sessionId);
      setDeck(data.deck);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleComplete = async () => {
    if (sessionId) {
      try {
        // Mark session as completed
        await fetch(`/api/study-sessions/${sessionId}`, {
          method: 'PUT',
        });
      } catch (err) {
        console.error('Error completing session:', err);
      }
    }
    router.push('/study');
  };

  const handleExit = async () => {
    if (sessionId) {
      try {
        // Mark session as completed
        await fetch(`/api/study-sessions/${sessionId}`, {
          method: 'PUT',
        });
      } catch (err) {
        console.error('Error completing session:', err);
      }
    }
    router.push('/study');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <LoadingState type="spinner" size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
        <Card className="max-w-md w-full p-8 text-center">
          <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
          <Button onClick={() => router.push('/study')}>Back to Decks</Button>
        </Card>
      </div>
    );
  }

  if (!deck || !sessionId) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
        <Card className="max-w-md w-full p-8 text-center">
          <p className="text-gray-600 dark:text-gray-400 mb-4">Deck not found</p>
          <Button onClick={() => router.push('/study')}>Back to Decks</Button>
        </Card>
      </div>
    );
  }

  return (
    <DeckLearningWithSRS
      deck={deck}
      sessionId={sessionId}
      onComplete={handleComplete}
      onExit={handleExit}
    />
  );
}
