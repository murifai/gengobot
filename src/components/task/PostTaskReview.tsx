'use client';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface VocabularyUsage {
  word: string;
  reading?: string;
  meaning: string;
  used: boolean;
  timesUsed?: number;
}

interface PostTaskReviewProps {
  vocabularyUsed: VocabularyUsage[];
  missedOpportunities: VocabularyUsage[];
  newWordsEncountered: string[];
  onAddToReviewQueue: (words: string[]) => void;
  onContinue: () => void;
}

export default function PostTaskReview({
  vocabularyUsed,
  missedOpportunities,
  newWordsEncountered,
  onAddToReviewQueue,
  onContinue,
}: PostTaskReviewProps) {
  const handleAddAllToQueue = () => {
    const wordsToAdd = [...missedOpportunities.map(v => v.word), ...newWordsEncountered];
    onAddToReviewQueue(wordsToAdd);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Post-Task Review</h2>
        <p className="text-gray-600 dark:text-gray-400">
          Review your vocabulary usage and performance
        </p>
      </div>

      {/* Vocabulary Used Successfully */}
      {vocabularyUsed.length > 0 && (
        <Card className="p-4">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
            <span className="text-green-600">✓</span>
            Vocabulary Used ({vocabularyUsed.length})
          </h3>
          <div className="space-y-2">
            {vocabularyUsed.map((vocab, idx) => (
              <div
                key={idx}
                className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border-l-4 border-green-500"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-baseline gap-2">
                      <span className="font-bold text-gray-900 dark:text-white">{vocab.word}</span>
                      {vocab.reading && (
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          {vocab.reading}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-700 dark:text-gray-300">{vocab.meaning}</p>
                  </div>
                  {vocab.timesUsed && vocab.timesUsed > 1 && (
                    <span className="text-xs bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-300 px-2 py-1 rounded">
                      Used {vocab.timesUsed}x
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Missed Opportunities */}
      {missedOpportunities.length > 0 && (
        <Card className="p-4">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
            <span className="text-yellow-600">⚠</span>
            Missed Opportunities ({missedOpportunities.length})
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
            These words from your study deck could have been used in the conversation:
          </p>
          <div className="space-y-2">
            {missedOpportunities.map((vocab, idx) => (
              <div
                key={idx}
                className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border-l-4 border-yellow-500"
              >
                <div className="flex items-baseline gap-2">
                  <span className="font-bold text-gray-900 dark:text-white">{vocab.word}</span>
                  {vocab.reading && (
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {vocab.reading}
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-700 dark:text-gray-300">{vocab.meaning}</p>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* New Words Encountered */}
      {newWordsEncountered.length > 0 && (
        <Card className="p-4">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
            <span className="text-blue-600">+</span>
            New Words Encountered ({newWordsEncountered.length})
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
            Add these words to your review queue for future practice:
          </p>
          <div className="flex flex-wrap gap-2">
            {newWordsEncountered.map((word, idx) => (
              <span
                key={idx}
                className="px-3 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-900 dark:text-blue-300 rounded-full text-sm"
              >
                {word}
              </span>
            ))}
          </div>
        </Card>
      )}

      {/* Summary Stats */}
      <Card className="p-4 bg-gray-50 dark:bg-gray-800">
        <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
          Vocabulary Performance Summary
        </h3>
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-green-600">{vocabularyUsed.length}</div>
            <div className="text-xs text-gray-600 dark:text-gray-400">Words Used</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-yellow-600">{missedOpportunities.length}</div>
            <div className="text-xs text-gray-600 dark:text-gray-400">Missed</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-blue-600">{newWordsEncountered.length}</div>
            <div className="text-xs text-gray-600 dark:text-gray-400">New Words</div>
          </div>
        </div>
      </Card>

      {/* Action Buttons */}
      <div className="flex gap-4">
        {(missedOpportunities.length > 0 || newWordsEncountered.length > 0) && (
          <Button onClick={handleAddAllToQueue} variant="secondary" className="flex-1">
            Add All to Review Queue
          </Button>
        )}
        <Button onClick={onContinue} className="flex-1">
          Continue
        </Button>
      </div>
    </div>
  );
}
