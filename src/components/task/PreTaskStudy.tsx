'use client';

import { useState, useRef, useMemo } from 'react';
import { X, Check } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import PrerequisiteDeckLearning from '@/components/task/PrerequisiteDeckLearning';

interface DeckResult {
  deckId: string;
  deckName: string;
  totalCards: number;
  hafalCount: number;
  belumHafalCount: number;
  hafalPercentage: number;
}

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
  audioExample?: string | null;
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
  audioExample,
  decks = [],
  onSkip: _onSkip,
  onCancel,
  onComplete,
}: PreTaskStudyProps) {
  const [currentStep, setCurrentStep] = useState<FlowStep>('scenario');
  const [currentDeckIndex, setCurrentDeckIndex] = useState<number | null>(null);
  const [deckResults, setDeckResults] = useState<DeckResult[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioRef, setAudioRef] = useState<HTMLAudioElement | null>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const waveformRef = useRef<HTMLDivElement>(null);

  // Generate pseudo-random waveform bars (consistent pattern)
  const waveformBars = useMemo(() => {
    const bars = [];
    const barCount = 50;
    for (let i = 0; i < barCount; i++) {
      // Create a wave-like pattern using sine with some variation
      const height = 20 + Math.sin(i * 0.3) * 15 + Math.sin(i * 0.7) * 10 + Math.random() * 10;
      bars.push(Math.min(100, Math.max(15, height)));
    }
    return bars;
  }, []);

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  const handlePlayPause = () => {
    if (!audioExample) return;

    if (isPlaying && audioRef) {
      audioRef.pause();
      setIsPlaying(false);
    } else {
      if (audioRef) {
        audioRef.pause();
      }
      const audio = new Audio(audioExample);
      setAudioRef(audio);

      audio.onloadedmetadata = () => {
        setDuration(audio.duration);
      };

      audio.ontimeupdate = () => {
        setCurrentTime(audio.currentTime);
      };

      audio.onended = () => {
        setIsPlaying(false);
        setCurrentTime(0);
      };

      audio.onerror = () => {
        setIsPlaying(false);
      };

      audio.play();
      setIsPlaying(true);
    }
  };

  const handleWaveformClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!waveformRef.current || !audioRef || duration === 0) return;

    const rect = waveformRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const percent = clickX / rect.width;
    const newTime = percent * duration;

    audioRef.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const handleDeckComplete = (hafalCount: number, belumHafalCount: number) => {
    // Save results for current deck
    if (currentDeckIndex !== null) {
      const currentDeck = decks[currentDeckIndex];
      const totalCards = currentDeck.flashcards.length;
      const hafalPercentage = totalCards > 0 ? Math.round((hafalCount / totalCards) * 100) : 0;

      setDeckResults(prev => [
        ...prev.filter(r => r.deckId !== currentDeck.id),
        {
          deckId: currentDeck.id,
          deckName: currentDeck.name,
          totalCards,
          hafalCount,
          belumHafalCount,
          hafalPercentage,
        },
      ]);
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

    const handleContinueToTask = () => {
      // Check if there's another deck to study
      if (currentDeckIndex < decks.length - 1) {
        // Move to next deck
        setCurrentDeckIndex(currentDeckIndex + 1);
      } else {
        // All decks completed, move to success criteria
        setCurrentStep('success-criteria');
        setCurrentDeckIndex(null);
      }
    };

    const handleRelearn = () => {
      // Just stay on the same deck (the component handles the reset)
    };

    return (
      <PrerequisiteDeckLearning
        deck={currentDeck}
        deckIndex={currentDeckIndex}
        totalDecks={decks.length}
        onComplete={handleDeckComplete}
        onExit={handleDeckExit}
        onContinueToTask={handleContinueToTask}
        onRelearn={handleRelearn}
      />
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

          {/* Deck Learning Results */}
          {deckResults.length > 0 && (
            <div className="mb-8">
              <h2 className="text-lg font-semibold text-foreground mb-4">Hasil Belajar</h2>
              <div className="space-y-3">
                {deckResults.map(result => (
                  <div key={result.deckId} className="p-4 rounded-lg border border-border bg-card">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium text-foreground">{result.deckName}</h3>
                      <span
                        className={`text-lg font-bold ${
                          result.hafalPercentage >= 80
                            ? 'text-chart-3'
                            : result.hafalPercentage >= 40
                              ? 'text-yellow-500'
                              : 'text-primary'
                        }`}
                      >
                        {result.hafalPercentage}%
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Check className="w-4 h-4 text-chart-3" />
                        <span>Hafal: {result.hafalCount}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <X className="w-4 h-4 text-primary" />
                        <span>Belum: {result.belumHafalCount}</span>
                      </div>
                      <span>• {result.totalCards} kartu</span>
                    </div>
                    {/* Progress bar */}
                    <div className="mt-2 h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-chart-3 transition-all"
                        style={{ width: `${result.hafalPercentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="mb-8">
            <h2 className="text-lg font-semibold text-foreground mb-4">Contoh Percakapan</h2>
            {conversationExample ? (
              <div className="bg-muted rounded-lg p-4 font-mono text-sm whitespace-pre-wrap text-foreground">
                {conversationExample}
              </div>
            ) : (
              <p className="text-muted-foreground italic">Tidak ada contoh percakapan</p>
            )}

            {/* Audio Example Player */}
            {audioExample && (
              <div className="mt-4 p-4 bg-primary/5 rounded-lg border border-primary/20">
                <p className="text-sm font-medium text-foreground mb-3">Contoh Audio Percakapan</p>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={handlePlayPause}
                    className="shrink-0 w-10 h-10 bg-primary text-primary-foreground rounded-full flex items-center justify-center hover:bg-primary/90 transition-colors"
                    aria-label={isPlaying ? 'Pause audio' : 'Play audio'}
                  >
                    {isPlaying ? (
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                        <rect x="6" y="4" width="4" height="16" />
                        <rect x="14" y="4" width="4" height="16" />
                      </svg>
                    ) : (
                      <svg className="w-4 h-4 ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    )}
                  </button>
                  <div className="flex-1">
                    {/* Waveform visualization */}
                    <div
                      ref={waveformRef}
                      onClick={handleWaveformClick}
                      className="relative h-10 flex items-center gap-0.5 cursor-pointer"
                    >
                      {waveformBars.map((height, index) => {
                        const barPercent = (index / waveformBars.length) * 100;
                        const isPlayed = barPercent <= progressPercent;
                        return (
                          <div
                            key={index}
                            className={`flex-1 rounded-full transition-colors ${
                              isPlayed ? 'bg-primary' : 'bg-muted-foreground/30'
                            }`}
                            style={{ height: `${height}%` }}
                          />
                        );
                      })}
                      {/* Progress line indicator */}
                      <div
                        className="absolute top-0 bottom-0 w-0.5 bg-primary shadow-sm"
                        style={{ left: `${progressPercent}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-xs text-muted-foreground mt-1">
                      <span>{formatTime(currentTime)}</span>
                      <span>{formatTime(duration)}</span>
                    </div>
                  </div>
                </div>
              </div>
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
