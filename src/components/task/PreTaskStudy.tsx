'use client';

import { useState } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import DeckReview from '@/components/deck/DeckReview';

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
  order: number;
}

interface PreTaskStudyProps {
  taskId: string;
  taskTitle: string;
  taskScenario?: string;
  learningObjectives?: string[];
  conversationExample?: string;
  decks?: Deck[];
  onSkip: () => void;
  onCancel: () => void;
  onComplete: () => void;
}

type FlowStep =
  | 'scenario'
  | 'objectives'
  | 'study-selection'
  | 'study-session'
  | 'success-criteria';

export default function PreTaskStudy({
  taskTitle,
  taskScenario,
  learningObjectives = [],
  conversationExample = '',
  decks = [],
  onSkip: _onSkip,
  onCancel,
  onComplete,
}: PreTaskStudyProps) {
  const [currentStep, setCurrentStep] = useState<FlowStep>('scenario');
  const [currentDeckIndex, setCurrentDeckIndex] = useState<number | null>(null);

  const handleDeckComplete = () => {
    // Check if there's another deck to study
    if (currentDeckIndex !== null && currentDeckIndex < decks.length - 1) {
      // Move to next deck
      setCurrentDeckIndex(currentDeckIndex + 1);
    } else {
      // All decks completed, move to success criteria
      setCurrentStep('success-criteria');
      setCurrentDeckIndex(null);
    }
  };

  const handleDeckExit = () => {
    // User exited study early, move to success criteria
    setCurrentStep('success-criteria');
    setCurrentDeckIndex(null);
  };

  // Step 1: Scenario Display
  if (currentStep === 'scenario') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-3xl w-full p-8 relative">
          <button
            onClick={onCancel}
            className="absolute top-4 right-4 p-2 text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg transition-colors"
            aria-label="Cancel task"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="mb-6">
            <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 mb-4">
              Langkah 1: Skenario
            </Badge>
            <h1 className="text-3xl font-bold text-foreground mb-2">{taskTitle}</h1>
          </div>

          <div className="mb-8">
            <h2 className="text-lg font-semibold text-foreground mb-4">Skenario percakapan</h2>
            {taskScenario ? (
              <div className="p-6 bg-primary/5 rounded-lg border-l-4 border-primary">
                <p className="text-foreground leading-relaxed whitespace-pre-wrap">
                  {taskScenario}
                </p>
              </div>
            ) : (
              <p className="text-muted-foreground italic">Tidak ada skenario</p>
            )}
          </div>

          <div className="flex justify-end">
            <Button onClick={() => setCurrentStep('objectives')}>Lanjut</Button>
          </div>
        </Card>
      </div>
    );
  }

  // Step 2: Learning Objectives
  if (currentStep === 'objectives') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-3xl w-full p-8 relative">
          <button
            onClick={onCancel}
            className="absolute top-4 right-4 p-2 text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg transition-colors"
            aria-label="Cancel task"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="mb-6">
            <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 mb-4">
              Langkah 2: Tujuan Pembelajaran
            </Badge>
            <h1 className="text-3xl font-bold text-foreground mb-2">{taskTitle}</h1>
          </div>

          <div className="mb-8">
            <h2 className="text-lg font-semibold text-foreground mb-4">Yang Akan Kamu Pelajari</h2>
            {learningObjectives.length > 0 ? (
              <ul className="space-y-3">
                {learningObjectives.map((objective, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-6 h-6 bg-primary/10 text-primary rounded-full flex items-center justify-center text-sm font-bold">
                      {idx + 1}
                    </span>
                    <p className="text-foreground pt-0.5">{objective}</p>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-muted-foreground italic">Tidak ada tujuan pembelajaran</p>
            )}
          </div>

          <div className="flex justify-between">
            <Button onClick={() => setCurrentStep('scenario')} variant="secondary">
              Kembali
            </Button>
            <Button onClick={() => setCurrentStep('study-selection')}>Lanjut</Button>
          </div>
        </Card>
      </div>
    );
  }

  // Step 3: Study Selection
  if (currentStep === 'study-selection') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-3xl w-full p-8 relative">
          <button
            onClick={onCancel}
            className="absolute top-4 right-4 p-2 text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg transition-colors"
            aria-label="Cancel task"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="mb-6">
            <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 mb-4">
              Langkah 3: Belajar Dulu (Opsional)
            </Badge>
            <h1 className="text-2xl font-bold text-foreground mb-4">Belajar Dulu</h1>
            <h2 className="text-lg text-muted-foreground mb-6">{taskTitle}</h2>
          </div>

          <p className="text-muted-foreground mb-6">
            Mau review materi belajar untuk percakapan ini? Kamu bisa belajar dulu atau langsung ke
            instruksi percakapan.
          </p>

          <div className="space-y-4 mb-8">
            {decks.length > 0 ? (
              decks.map((deck, index) => (
                <div
                  key={deck.id}
                  className="p-4 rounded-lg border border-border bg-card hover:bg-accent/50 transition-colors"
                >
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold text-foreground">{deck.name}</h3>
                    <Badge variant="secondary" size="sm">
                      {index + 1} of {decks.length}
                    </Badge>
                  </div>
                  {deck.description && (
                    <p className="text-sm text-muted-foreground mb-2">{deck.description}</p>
                  )}
                  <div className="flex gap-3 text-xs text-muted-foreground">
                    <span>{deck.flashcards.length} kartu</span>
                    {deck.category && <span>• {deck.category}</span>}
                    {deck.difficulty && <span>• {deck.difficulty}</span>}
                  </div>
                </div>
              ))
            ) : (
              <div className="p-4 bg-muted rounded-lg">
                <p className="text-muted-foreground">
                  Belum ada materi belajar untuk percakapan ini.
                </p>
              </div>
            )}
          </div>

          <div className="flex gap-4">
            <Button onClick={() => setCurrentStep('objectives')} variant="secondary">
              Kembali
            </Button>
            <Button onClick={() => setCurrentStep('success-criteria')} variant="secondary">
              Lewati
            </Button>
            {decks.length > 0 && (
              <Button
                onClick={() => {
                  setCurrentDeckIndex(0);
                  setCurrentStep('study-session');
                }}
                className="flex-1"
              >
                Mulai Belajar
              </Button>
            )}
          </div>
        </Card>
      </div>
    );
  }

  // Step 4: Deck Learning Session
  if (currentStep === 'study-session' && currentDeckIndex !== null) {
    const currentDeck = decks[currentDeckIndex];

    if (!currentDeck) {
      return null;
    }

    return (
      <DeckReview deck={currentDeck} onComplete={handleDeckComplete} onExit={handleDeckExit} />
    );
  }

  // Step 5: Success Criteria
  if (currentStep === 'success-criteria') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-3xl w-full p-8 relative">
          <button
            onClick={onCancel}
            className="absolute top-4 right-4 p-2 text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg transition-colors"
            aria-label="Cancel task"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="mb-6">
            <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 mb-4">
              Langkah 4: Kriteria Sukses
            </Badge>
            <h1 className="text-3xl font-bold text-foreground mb-2">{taskTitle}</h1>
          </div>

          <div className="mb-8">
            <h2 className="text-lg font-semibold text-foreground mb-4">Contoh Percakapan</h2>
            {conversationExample ? (
              <div className="bg-muted rounded-lg p-4 font-mono text-sm whitespace-pre-wrap text-foreground">
                {conversationExample}
              </div>
            ) : (
              <p className="text-muted-foreground italic">Tidak ada contoh percakapan</p>
            )}
          </div>

          <div className="p-4 bg-primary/10 rounded-lg border-l-4 border-primary mb-8">
            <p className="text-foreground font-medium">
              Sudah siap? Klik &quot;Mulai percakapan&quot; kalau sudah!
            </p>
          </div>

          <div className="flex gap-4">
            <Button onClick={() => setCurrentStep('study-selection')} variant="secondary">
              Kembali
            </Button>
            <Button onClick={onComplete} className="flex-1">
              Mulai percakapan
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  // Fallback - shouldn't reach here
  return null;
}
