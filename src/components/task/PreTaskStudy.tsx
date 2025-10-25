'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import DeckLearning from '@/components/deck/DeckLearning';

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
  successCriteria?: string[];
  decks?: Deck[];
  onSkip: () => void;
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
  successCriteria = [],
  decks = [],
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
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
        <Card className="max-w-3xl w-full p-8">
          <div className="mb-6">
            <div className="inline-block px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-sm font-medium mb-4">
              Step 1: Scenario
            </div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{taskTitle}</h1>
          </div>

          <div className="mb-8">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Task Scenario
            </h2>
            {taskScenario ? (
              <div className="p-6 bg-blue-50 dark:bg-blue-900/20 rounded-lg border-l-4 border-blue-500">
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
                  {taskScenario}
                </p>
              </div>
            ) : (
              <p className="text-gray-600 dark:text-gray-400 italic">No scenario provided</p>
            )}
          </div>

          <div className="flex justify-end">
            <Button onClick={() => setCurrentStep('objectives')}>Continue</Button>
          </div>
        </Card>
      </div>
    );
  }

  // Step 2: Learning Objectives
  if (currentStep === 'objectives') {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
        <Card className="max-w-3xl w-full p-8">
          <div className="mb-6">
            <div className="inline-block px-3 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-full text-sm font-medium mb-4">
              Step 2: Learning Objectives
            </div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{taskTitle}</h1>
          </div>

          <div className="mb-8">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              What You&apos;ll Learn
            </h2>
            {learningObjectives.length > 0 ? (
              <ul className="space-y-3">
                {learningObjectives.map((objective, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-6 h-6 bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-300 rounded-full flex items-center justify-center text-sm font-bold">
                      {idx + 1}
                    </span>
                    <p className="text-gray-700 dark:text-gray-300 pt-0.5">{objective}</p>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-600 dark:text-gray-400 italic">
                No learning objectives specified
              </p>
            )}
          </div>

          <div className="flex justify-between">
            <Button onClick={() => setCurrentStep('scenario')} variant="secondary">
              Back
            </Button>
            <Button onClick={() => setCurrentStep('study-selection')}>Continue</Button>
          </div>
        </Card>
      </div>
    );
  }

  // Step 3: Study Selection
  if (currentStep === 'study-selection') {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
        <Card className="max-w-3xl w-full p-8">
          <div className="mb-6">
            <div className="inline-block px-3 py-1 bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 rounded-full text-sm font-medium mb-4">
              Step 3: Pre-Task Study (Optional)
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Pre-Task Study
            </h1>
            <h2 className="text-lg text-gray-700 dark:text-gray-300 mb-6">{taskTitle}</h2>
          </div>

          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Would you like to review the study materials associated with this task? You can choose
            to study now or skip directly to the task instructions.
          </p>

          <div className="space-y-4 mb-8">
            {decks.length > 0 ? (
              decks.map((deck, index) => {
                const categoryColors = {
                  Kanji:
                    'bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800',
                  Vocabulary: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800',
                  Grammar:
                    'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800',
                  Mixed:
                    'bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800',
                };
                const colorClass =
                  categoryColors[deck.category as keyof typeof categoryColors] ||
                  'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700';

                return (
                  <div key={deck.id} className={`p-4 rounded-lg border ${colorClass}`}>
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-semibold text-gray-900 dark:text-white">{deck.name}</h3>
                      <span className="text-xs px-2 py-1 bg-white dark:bg-gray-900 rounded-full border border-gray-200 dark:border-gray-700">
                        {index + 1} of {decks.length}
                      </span>
                    </div>
                    {deck.description && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                        {deck.description}
                      </p>
                    )}
                    <div className="flex gap-3 text-xs text-gray-500 dark:text-gray-500">
                      <span>{deck.flashcards.length} cards</span>
                      {deck.category && <span>• {deck.category}</span>}
                      {deck.difficulty && <span>• {deck.difficulty}</span>}
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <p className="text-gray-600 dark:text-gray-400">
                  No study materials available for this task yet.
                </p>
              </div>
            )}
          </div>

          <div className="flex gap-4">
            <Button onClick={() => setCurrentStep('objectives')} variant="secondary">
              Back
            </Button>
            <Button onClick={() => setCurrentStep('success-criteria')} variant="secondary">
              Skip to Instructions
            </Button>
            {decks.length > 0 && (
              <Button
                onClick={() => {
                  setCurrentDeckIndex(0);
                  setCurrentStep('study-session');
                }}
                className="flex-1"
              >
                Start Study Review
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
      <DeckLearning deck={currentDeck} onComplete={handleDeckComplete} onExit={handleDeckExit} />
    );
  }

  // Step 5: Success Criteria
  if (currentStep === 'success-criteria') {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
        <Card className="max-w-3xl w-full p-8">
          <div className="mb-6">
            <div className="inline-block px-3 py-1 bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 rounded-full text-sm font-medium mb-4">
              Step 4: Success Criteria
            </div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{taskTitle}</h1>
          </div>

          <div className="mb-8">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              How to Complete This Task
            </h2>
            {successCriteria.length > 0 ? (
              <ul className="space-y-3">
                {successCriteria.map((criteria, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-6 h-6 bg-yellow-100 dark:bg-yellow-900 text-yellow-600 dark:text-yellow-300 rounded-full flex items-center justify-center text-sm">
                      ✓
                    </span>
                    <p className="text-gray-700 dark:text-gray-300 pt-0.5">{criteria}</p>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-600 dark:text-gray-400 italic">
                No success criteria specified
              </p>
            )}
          </div>

          <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border-l-4 border-green-500 mb-8">
            <p className="text-green-800 dark:text-green-200 font-medium">
              Ready to begin? Click &quot;Start Task&quot; when you&apos;re prepared!
            </p>
          </div>

          <div className="flex gap-4">
            <Button onClick={() => setCurrentStep('study-selection')} variant="secondary">
              Back to Study
            </Button>
            <Button onClick={onComplete} className="flex-1">
              Start Task
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  // Fallback - shouldn't reach here
  return null;
}
