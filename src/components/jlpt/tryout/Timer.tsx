'use client';

import { Clock, AlertCircle } from 'lucide-react';
import { useTimer } from '@/hooks/jlpt/useTimer';
import { cn } from '@/lib/utils';

interface TimerProps {
  durationSeconds: number;
  onExpire: () => void;
  autoStart?: boolean;
  className?: string;
}

export function Timer({ durationSeconds, onExpire, autoStart = true, className }: TimerProps) {
  const { timeRemaining, formatTime, isExpired } = useTimer({
    durationSeconds,
    onExpire,
    autoStart,
  });

  // Warning state: less than 5 minutes
  const isWarning = timeRemaining <= 300 && timeRemaining > 60;
  // Critical state: less than 1 minute
  const isCritical = timeRemaining <= 60;

  return (
    <div
      className={cn(
        'flex items-center gap-2 px-4 py-2 rounded-lg font-mono text-lg font-semibold transition-colors',
        isExpired && 'bg-destructive text-destructive-foreground',
        isCritical && !isExpired && 'bg-destructive/20 text-destructive animate-pulse',
        isWarning &&
          !isCritical &&
          'bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-400',
        !isWarning && !isCritical && !isExpired && 'bg-muted text-foreground',
        className
      )}
    >
      {isCritical || isExpired ? (
        <AlertCircle className="h-5 w-5" />
      ) : (
        <Clock className="h-5 w-5" />
      )}
      <span>{formatTime()}</span>
      {isExpired && <span className="text-sm font-normal ml-2">時間切れ</span>}
    </div>
  );
}
