'use client';

import { use, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import DeckLearningWithStats from '@/components/deck/DeckLearningWithStats';
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

export default function StudyDeckPage({ params }: { params: Promise<{ deckId: string }> }) {
  const { deckId } = use(params);
  const router = useRouter();
  const [deck, setDeck] = useState<Deck | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [initialCardIndex, setInitialCardIndex] = useState(0);
  const [initialReviewedCardIds, setInitialReviewedCardIds] = useState<string[]>([]);
  const [initialHafalCount, setInitialHafalCount] = useState(0);
  const [initialBelumHafalCount, setInitialBelumHafalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    startStudySession();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [deckId]);

  const startStudySession = async () => {
    try {
      setLoading(true);
      setError(null);

      // Start or resume a study session
      const response = await fetch('/api/app/drill-sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ deckId }),
      });

      if (!response.ok) {
        throw new Error('Failed to start study session');
      }

      const data = await response.json();
      setSessionId(data.sessionId);
      setDeck(data.deck);

      // If resuming, set the initial position and counts
      if (data.isResumed) {
        setInitialCardIndex(data.currentCardIndex || 0);
        setInitialReviewedCardIds(data.reviewedCardIds || []);
        setInitialHafalCount(data.hafalCount || 0);
        setInitialBelumHafalCount(data.belumHafalCount || 0);
      }
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
        await fetch(`/api/app/drill-sessions/${sessionId}`, {
          method: 'PUT',
        });
      } catch (err) {
        console.error('Error completing session:', err);
      }
    }
    router.push('/drill');
  };

  const handleExit = async () => {
    // Don't mark as completed - progress is already saved
    // User can resume later
    router.push('/drill');
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
          <p className="text-primary mb-4">{error}</p>
          <Button onClick={() => router.push('/drill')}>Back to Decks</Button>
        </Card>
      </div>
    );
  }

  if (!deck || !sessionId) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
        <Card className="max-w-md w-full p-8 text-center">
          <p className="text-gray-600 dark:text-gray-400 mb-4">Deck not found</p>
          <Button onClick={() => router.push('/drill')}>Back to Decks</Button>
        </Card>
      </div>
    );
  }

  return (
    <DeckLearningWithStats
      deck={deck}
      sessionId={sessionId}
      initialCardIndex={initialCardIndex}
      initialReviewedCardIds={initialReviewedCardIds}
      initialHafalCount={initialHafalCount}
      initialBelumHafalCount={initialBelumHafalCount}
      onComplete={handleComplete}
      onExit={handleExit}
    />
  );
}
