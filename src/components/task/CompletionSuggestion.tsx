'use client';

import { useState } from 'react';
import { CheckCircle2, X, ArrowRight, Sparkles } from 'lucide-react';
import { ObjectiveTracking } from '@/lib/ai/objective-detection';

interface CompletionSuggestionProps {
  objectives: ObjectiveTracking[];
  onComplete: () => void;
  onDismiss: () => void;
}

export function CompletionSuggestion({
  objectives,
  onComplete,
  onDismiss,
}: CompletionSuggestionProps) {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  const completedObjectives = objectives.filter(obj => obj.status === 'completed');

  const handleDismiss = () => {
    setIsVisible(false);
    onDismiss();
  };

  return (
    <div className="animate-slide-down mb-4">
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-2 border-green-500 dark:border-green-600 rounded-lg shadow-lg overflow-hidden">
        {/* Header with dismiss */}
        <div className="flex items-start justify-between p-4 pb-3">
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0">
              <div className="relative">
                <CheckCircle2 className="w-10 h-10 text-green-600 dark:text-green-400" />
                <Sparkles className="w-5 h-5 text-yellow-500 absolute -top-1 -right-1 animate-pulse" />
              </div>
            </div>
            <div>
              <h3 className="text-lg font-bold text-green-900 dark:text-green-100 flex items-center gap-2">
                Great Job! All Objectives Completed
              </h3>
              <p className="text-sm text-green-700 dark:text-green-300 mt-0.5">
                You've successfully achieved all learning goals for this task
              </p>
            </div>
          </div>
          <button
            onClick={handleDismiss}
            className="flex-shrink-0 text-green-700 dark:text-green-300 hover:text-green-900 dark:hover:text-green-100 transition-colors p-1 rounded-full hover:bg-green-100 dark:hover:bg-green-800/50"
            aria-label="Dismiss"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Objectives List */}
        <div className="px-4 pb-3">
          <div className="bg-white/50 dark:bg-gray-800/50 rounded-lg p-3 space-y-2">
            {completedObjectives.map((obj, index) => (
              <div
                key={obj.objectiveId}
                className="flex items-start gap-2 text-sm"
              >
                <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                <span className="text-gray-900 dark:text-gray-100 flex-1">
                  {obj.objectiveText}
                </span>
                {obj.confidence >= 80 && (
                  <span className="text-xs font-medium text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/30 px-2 py-0.5 rounded-full">
                    {obj.confidence}%
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3 px-4 pb-4 pt-2">
          <button
            onClick={onComplete}
            className="flex-1 bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-600 text-white font-semibold py-2.5 px-4 rounded-lg transition-colors flex items-center justify-center gap-2 shadow-md hover:shadow-lg"
          >
            Complete Task
            <ArrowRight className="w-5 h-5" />
          </button>
          <button
            onClick={handleDismiss}
            className="px-6 py-2.5 border-2 border-green-600 dark:border-green-500 text-green-700 dark:text-green-400 font-semibold rounded-lg hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors"
          >
            Continue Chatting
          </button>
        </div>

        {/* Bottom info */}
        <div className="bg-green-100/50 dark:bg-green-900/20 px-4 py-2 text-xs text-green-800 dark:text-green-200 text-center border-t border-green-200 dark:border-green-800">
          You can continue practicing or complete the task now to see your detailed feedback
        </div>
      </div>
    </div>
  );
}
