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
      <div className="bg-primary/5 border-2 border-border rounded-base shadow-shadow overflow-hidden">
        {/* Header with dismiss */}
        <div className="flex items-start justify-between p-4 pb-3">
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0">
              <div className="relative">
                <CheckCircle2 className="w-10 h-10 text-primary" />
                <Sparkles className="w-5 h-5 text-yellow-500 absolute -top-1 -right-1 animate-pulse" />
              </div>
            </div>
            <div>
              <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                Great Job! All Objectives Completed
              </h3>
              <p className="text-sm text-muted-foreground mt-0.5">
                You&apos;ve successfully achieved all learning goals for this task
              </p>
            </div>
          </div>
          <button
            onClick={handleDismiss}
            className="flex-shrink-0 text-muted-foreground hover:text-foreground transition-colors p-1 rounded-base hover:bg-accent"
            aria-label="Dismiss"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Objectives List */}
        <div className="px-4 pb-3">
          <div className="bg-card rounded-base p-3 space-y-2 border-2 border-border">
            {completedObjectives.map(obj => (
              <div key={obj.objectiveId} className="flex items-start gap-2 text-sm">
                <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                <span className="text-foreground flex-1">{obj.objectiveText}</span>
                {obj.confidence >= 80 && (
                  <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-0.5 rounded-base">
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
            className="flex-1 bg-primary hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none text-primary-foreground font-semibold py-2.5 px-4 rounded-base border-2 border-border shadow-shadow transition-all flex items-center justify-center gap-2"
          >
            Complete Task
            <ArrowRight className="w-5 h-5" />
          </button>
          <button
            onClick={handleDismiss}
            className="px-6 py-2.5 border-2 border-border text-primary font-semibold rounded-base hover:bg-primary/10 transition-colors"
          >
            Continue Chatting
          </button>
        </div>

        {/* Bottom info */}
        <div className="bg-muted px-4 py-2 text-xs text-muted-foreground text-center border-t-2 border-border">
          You can continue practicing or complete the task now to see your detailed feedback
        </div>
      </div>
    </div>
  );
}
