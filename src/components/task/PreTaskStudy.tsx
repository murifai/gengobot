'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import FlashcardSession, { FlashcardSessionStats } from '@/components/flashcard/FlashcardSession';

interface VocabularyCard {
  id: string;
  front: string; // Japanese
  back: string; // English translation
  reading?: string; // Furigana
}

interface PreTaskStudyProps {
  taskId: string;
  taskTitle: string;
  taskScenario?: string;
  learningObjectives?: string[];
  successCriteria?: string[];
  vocabularyCards?: VocabularyCard[];
  grammarCards?: VocabularyCard[];
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
  vocabularyCards = [],
  grammarCards = [],
  onComplete,
}: PreTaskStudyProps) {
  const [currentStep, setCurrentStep] = useState<FlowStep>('scenario');
  const [studyType, setStudyType] = useState<'vocabulary' | 'grammar' | null>(null);

  const handleSessionComplete = (stats: FlashcardSessionStats) => {
    // TODO: Save session stats to user's study history
    console.log('Session completed:', stats);

    // Check if there's another deck to study
    if (studyType === 'vocabulary' && grammarCards.length > 0) {
      // Switch to grammar deck
      setStudyType('grammar');
    } else {
      // All study done, move to success criteria
      setCurrentStep('success-criteria');
      setStudyType(null);
    }
  };

  const handleSessionExit = () => {
    // User exited study early, move to success criteria
    setCurrentStep('success-criteria');
    setStudyType(null);
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
            Would you like to review the vocabulary and grammar associated with this task? You can
            choose to study now or skip directly to the task instructions.
          </p>

          <div className="space-y-4 mb-8">
            {vocabularyCards.length > 0 && (
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                  Vocabulary Deck
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {vocabularyCards.length} cards available for review
                </p>
              </div>
            )}

            {grammarCards.length > 0 && (
              <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Grammar Deck</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {grammarCards.length} cards available for review
                </p>
              </div>
            )}

            {vocabularyCards.length === 0 && grammarCards.length === 0 && (
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
            {vocabularyCards.length > 0 && (
              <Button
                onClick={() => {
                  setStudyType('vocabulary');
                  setCurrentStep('study-session');
                }}
                className="flex-1"
              >
                Start Vocabulary Review
              </Button>
            )}
            {grammarCards.length > 0 && vocabularyCards.length === 0 && (
              <Button
                onClick={() => {
                  setStudyType('grammar');
                  setCurrentStep('study-session');
                }}
                className="flex-1"
              >
                Start Grammar Review
              </Button>
            )}
          </div>
        </Card>
      </div>
    );
  }

  // Step 4: Flashcard Study Session
  if (currentStep === 'study-session' && studyType) {
    const currentCards = studyType === 'vocabulary' ? vocabularyCards : grammarCards;
    const deckName = studyType === 'vocabulary' ? 'Vocabulary Review' : 'Grammar Review';

    return (
      <FlashcardSession
        cards={currentCards}
        deckName={deckName}
        onComplete={handleSessionComplete}
        onExit={handleSessionExit}
        showRatingButtons={false} // For pre-task study, we just show next/previous
      />
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
