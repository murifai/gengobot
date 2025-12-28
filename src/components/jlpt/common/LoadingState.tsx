'use client';

import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface JLPTLoadingStateProps {
  message?: string;
  submessage?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function JLPTLoadingState({
  message = '読み込み中...',
  submessage,
  size = 'md',
  className,
}: JLPTLoadingStateProps) {
  const iconSizes = {
    sm: 'h-6 w-6',
    md: 'h-10 w-10',
    lg: 'h-16 w-16',
  };

  const textSizes = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
  };

  return (
    <div className={cn('flex flex-col items-center justify-center p-8', className)}>
      <Loader2 className={cn('animate-spin text-primary', iconSizes[size])} />
      <p className={cn('mt-4 font-medium text-foreground', textSizes[size])}>
        {message}
      </p>
      {submessage && (
        <p className="mt-2 text-sm text-muted-foreground text-center max-w-md">
          {submessage}
        </p>
      )}
    </div>
  );
}

export function QuestionLoadingSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Header skeleton */}
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <div className="h-4 w-20 bg-muted rounded" />
          <div className="h-6 w-16 bg-muted rounded" />
        </div>
        <div className="h-9 w-24 bg-muted rounded" />
      </div>

      {/* Passage skeleton */}
      <div className="border rounded-lg p-4 bg-muted/50 space-y-3">
        <div className="h-4 w-3/4 bg-muted rounded" />
        <div className="h-4 w-full bg-muted rounded" />
        <div className="h-4 w-5/6 bg-muted rounded" />
        <div className="h-4 w-2/3 bg-muted rounded" />
      </div>

      {/* Question text skeleton */}
      <div className="space-y-3">
        <div className="h-5 w-full bg-muted rounded" />
        <div className="h-5 w-4/5 bg-muted rounded" />
      </div>

      {/* Answer choices skeleton */}
      <div className="space-y-2 mt-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-16 bg-muted rounded-lg" />
        ))}
      </div>
    </div>
  );
}

export function TestHistoryLoadingSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="border rounded-lg p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="h-6 w-20 bg-muted rounded" />
            <div className="h-5 w-32 bg-muted rounded" />
          </div>
          <div className="flex gap-4">
            <div className="h-4 w-24 bg-muted rounded" />
            <div className="h-4 w-24 bg-muted rounded" />
            <div className="h-4 w-24 bg-muted rounded" />
          </div>
        </div>
      ))}
    </div>
  );
}
