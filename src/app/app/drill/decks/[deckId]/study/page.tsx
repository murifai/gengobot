'use client';

import { use, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import DeckLearningWithStats from '@/components/deck/DeckLearningWithStats';
import { LoadingState } from '@/components/ui/LoadingState';

export const dynamic = 'force-dynamic';

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

export default function StudyDeckPage({ params }: { params: Promise<{ deckId: string }> }) {
  const { deckId } = use(params);
  const router = useRouter();
  const [deck, setDeck] = useState<Deck | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
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

      // Start a new study session
      const response = await fetch('/api/app/drill-sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ deckId }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to start study session');
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
        await fetch(`/api/app/drill-sessions/${sessionId}`, {
          method: 'PUT',
        });
      } catch (err) {
        console.error('Error completing session:', err);
      }
    }
    router.push('/app/drill');
  };

  const handleExit = async () => {
    if (sessionId) {
      try {
        await fetch(`/api/app/drill-sessions/${sessionId}`, {
          method: 'PUT',
        });
      } catch (err) {
        console.error('Error completing session:', err);
      }
    }
    router.push('/app/drill');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <LoadingState type="spinner" size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div
          className="max-w-md w-full p-8 text-center bg-white"
          style={{
            border: '3px solid #000',
            boxShadow: '4px 4px 0px 0px #000',
          }}
        >
          <p className="text-destructive font-bold mb-4">{error}</p>
          <button
            onClick={() => router.push('/app/drill')}
            className="px-6 py-3 font-bold bg-primary text-white transition-transform hover:translate-y-[-2px]"
            style={{
              border: '3px solid #000',
              boxShadow: '4px 4px 0px 0px #000',
            }}
          >
            Kembali ke Dek
          </button>
        </div>
      </div>
    );
  }

  if (!deck || !sessionId) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div
          className="max-w-md w-full p-8 text-center bg-white"
          style={{
            border: '3px solid #000',
            boxShadow: '4px 4px 0px 0px #000',
          }}
        >
          <p className="text-foreground font-bold mb-4">Deck tidak ditemukan</p>
          <button
            onClick={() => router.push('/app/drill')}
            className="px-6 py-3 font-bold bg-primary text-white transition-transform hover:translate-y-[-2px]"
            style={{
              border: '3px solid #000',
              boxShadow: '4px 4px 0px 0px #000',
            }}
          >
            Kembali ke Dek
          </button>
        </div>
      </div>
    );
  }

  return (
    <DeckLearningWithStats
      deck={deck}
      sessionId={sessionId}
      onComplete={handleComplete}
      onExit={handleExit}
    />
  );
}
