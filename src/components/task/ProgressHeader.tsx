'use client';

import { useState, useEffect, useRef } from 'react';
import { CheckCircle2, Circle } from 'lucide-react';
import { TaskFeedbackProgress } from '@/hooks/useTaskFeedbackProgress';

interface ProgressHeaderProps {
  progress: TaskFeedbackProgress;
}

export function ProgressHeader({ progress }: ProgressHeaderProps) {
  const { objectives, completedObjectivesCount, totalObjectivesCount } = progress;
  const [activeTooltip, setActiveTooltip] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const progressPercentage =
    totalObjectivesCount > 0 ? (completedObjectivesCount / totalObjectivesCount) * 100 : 0;

  // Close tooltip when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setActiveTooltip(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, []);

  const handleObjectiveClick = (objectiveId: string) => {
    setActiveTooltip(activeTooltip === objectiveId ? null : objectiveId);
  };

  return (
    <div className="border-b border-border bg-card shadow-sm">
      <div className="max-w-4xl mx-auto px-4 py-3" ref={containerRef}>
        {/* Objectives Row */}
        <div className="flex items-center gap-2 mb-3">
          {objectives.map((obj, index) => (
            <button
              key={obj.objectiveId}
              className="group relative cursor-pointer"
              onClick={() => handleObjectiveClick(obj.objectiveId)}
              aria-label={`Objective ${index + 1}: ${obj.objectiveText}`}
            >
              {obj.status === 'completed' ? (
                <CheckCircle2
                  className="w-7 h-7 text-primary transition-transform hover:scale-110"
                  strokeWidth={2}
                />
              ) : (
                <Circle
                  className="w-7 h-7 text-muted-foreground/50 transition-transform hover:scale-110"
                  strokeWidth={2}
                />
              )}
              <span
                className={`absolute -top-1 -right-1 w-4 h-4 rounded-full text-xs flex items-center justify-center font-semibold ${
                  obj.status === 'completed'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground'
                }`}
              >
                {index + 1}
              </span>

              {/* Tooltip - shows on hover (desktop) or click (mobile) */}
              <div
                className={`absolute left-1/2 -translate-x-1/2 top-full mt-2 px-3 py-2 bg-foreground text-background text-xs rounded-lg transition-opacity z-10 max-w-[200px] whitespace-normal text-center shadow-lg ${
                  activeTooltip === obj.objectiveId
                    ? 'opacity-100'
                    : 'opacity-0 group-hover:opacity-100 pointer-events-none'
                }`}
              >
                {obj.objectiveText}
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-b-4 border-transparent border-b-foreground" />
              </div>
            </button>
          ))}
        </div>

        {/* Progress Bar */}
        <div className="relative">
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-primary transition-all duration-500 ease-out"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
          <div className="mt-1">
            <span className="text-xs text-muted-foreground">
              {completedObjectivesCount} of {totalObjectivesCount} completed
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
