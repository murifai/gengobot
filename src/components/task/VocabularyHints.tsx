'use client';

import { Card } from '@/components/ui/card';

interface VocabularyHint {
  id: string;
  word: string;
  reading?: string;
  meaning: string;
  example?: string;
}

interface VocabularyHintsProps {
  hints: VocabularyHint[];
}

export default function VocabularyHints({ hints }: VocabularyHintsProps) {
  if (hints.length === 0) {
    return (
      <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
        <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
          No vocabulary hints available yet
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
        Vocabulary Hints ({hints.length})
      </h3>
      <div className="space-y-2 max-h-96 overflow-y-auto">
        {hints.map(hint => (
          <Card
            key={hint.id}
            className="p-3 bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500"
          >
            <div className="flex flex-col gap-1">
              <div className="flex items-baseline gap-2">
                <span className="text-lg font-bold text-gray-900 dark:text-white">{hint.word}</span>
                {hint.reading && (
                  <span className="text-xs text-gray-600 dark:text-gray-400">{hint.reading}</span>
                )}
              </div>
              <p className="text-sm text-gray-700 dark:text-gray-300">{hint.meaning}</p>
              {hint.example && (
                <p className="text-xs text-gray-500 dark:text-gray-400 italic mt-1">
                  Example: {hint.example}
                </p>
              )}
            </div>
          </Card>
        ))}
      </div>
      <div className="mt-3 p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded text-xs text-gray-600 dark:text-gray-400">
        💡 Tip: Try to use these words in your conversation!
      </div>
    </div>
  );
}
