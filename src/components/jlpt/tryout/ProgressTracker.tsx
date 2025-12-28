'use client';

import { CheckCircle2, Flag } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Progress } from '@/components/ui/progress';

interface ProgressTrackerProps {
  currentIndex: number;
  totalQuestions: number;
  answeredCount: number;
  flaggedCount: number;
  className?: string;
}

export function ProgressTracker({
  currentIndex,
  totalQuestions,
  answeredCount,
  flaggedCount,
  className,
}: ProgressTrackerProps) {
  const progressPercentage = (answeredCount / totalQuestions) * 100;

  return (
    <div className={cn('space-y-3', className)}>
      {/* Question Counter */}
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium">
          問題 {currentIndex + 1} / {totalQuestions}
        </span>
        <div className="flex items-center gap-4 text-muted-foreground">
          <div className="flex items-center gap-1">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            <span>{answeredCount}問回答済み</span>
          </div>
          {flaggedCount > 0 && (
            <div className="flex items-center gap-1">
              <Flag className="h-4 w-4 text-orange-600" />
              <span>{flaggedCount}問フラグ付き</span>
            </div>
          )}
        </div>
      </div>

      {/* Progress Bar */}
      <Progress value={progressPercentage} className="h-2" />
    </div>
  );
}

interface QuestionNavigationProps {
  questions: Array<{ id: string; isAnswered: boolean; isFlagged: boolean }>;
  currentIndex: number;
  onNavigate: (index: number) => void;
  className?: string;
}

export function QuestionNavigation({
  questions,
  currentIndex,
  onNavigate,
  className,
}: QuestionNavigationProps) {
  return (
    <div className={cn('space-y-2', className)}>
      <div className="text-sm font-medium">問題一覧</div>
      <div className="grid grid-cols-10 gap-2">
        {questions.map((question, index) => (
          <button
            key={question.id}
            onClick={() => onNavigate(index)}
            className={cn(
              'relative aspect-square rounded border text-xs font-medium transition-colors',
              'hover:bg-accent hover:border-accent-foreground/20',
              currentIndex === index && 'bg-primary text-primary-foreground border-primary',
              currentIndex !== index && question.isAnswered && 'bg-green-50 border-green-600',
              currentIndex !== index && !question.isAnswered && 'bg-background',
              question.isFlagged && 'ring-2 ring-orange-500'
            )}
          >
            {index + 1}
            {question.isFlagged && (
              <Flag className="absolute -top-1 -right-1 h-3 w-3 text-orange-600 fill-orange-600" />
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
