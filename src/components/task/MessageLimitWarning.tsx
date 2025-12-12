'use client';

import { AlertTriangle, XCircle, MessageSquare } from 'lucide-react';

export type MessageLimitLevel = 'warning' | 'critical';

interface MessageLimitWarningProps {
  level: MessageLimitLevel;
  messagesRemaining: number;
  totalMessages: number;
  maxMessages: number;
  onComplete?: () => void;
}

export function MessageLimitWarning({
  level,
  messagesRemaining,
  totalMessages,
  maxMessages,
  onComplete,
}: MessageLimitWarningProps) {
  const isWarning = level === 'warning';
  const isCritical = level === 'critical';

  return (
    <div
      className={`animate-slide-down mb-4 rounded-base border-2 shadow-shadow ${
        isWarning
          ? 'bg-yellow-50 dark:bg-yellow-950/50 border-yellow-200 dark:border-yellow-800'
          : 'bg-red-50 dark:bg-red-950/50 border-red-200 dark:border-red-800'
      }`}
    >
      <div className="flex items-start gap-3 p-4">
        {/* Icon */}
        <div className="flex-shrink-0 mt-0.5">
          {isWarning ? (
            <AlertTriangle className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
          ) : (
            <XCircle className="w-6 h-6 text-red-600 dark:text-red-400" />
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <h4
            className={`font-semibold text-sm mb-1 ${
              isWarning ? 'text-yellow-900 dark:text-yellow-200' : 'text-red-900 dark:text-red-200'
            }`}
          >
            {isCritical ? 'Message Limit Reached' : 'Approaching Message Limit'}
          </h4>
          <p
            className={`text-sm ${
              isWarning ? 'text-yellow-800 dark:text-yellow-300' : 'text-red-800 dark:text-red-300'
            }`}
          >
            {isCritical ? (
              <>
                You&apos;ve used all {maxMessages} available messages for this task. Please complete
                the task to see your feedback.
              </>
            ) : (
              <>
                You have <span className="font-semibold">{messagesRemaining}</span>{' '}
                {messagesRemaining === 1 ? 'message' : 'messages'} remaining out of {maxMessages}.
                Try to complete your objectives soon!
              </>
            )}
          </p>

          {/* Progress indicator */}
          <div className="mt-3 flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-muted-foreground" />
            <div className="flex-1 h-2 bg-muted rounded-base border-2 border-border overflow-hidden">
              <div
                className={`h-full transition-all duration-300 ${
                  isWarning ? 'bg-yellow-500' : 'bg-red-500'
                }`}
                style={{ width: `${(totalMessages / maxMessages) * 100}%` }}
              />
            </div>
            <span
              className={`text-xs font-mono font-semibold ${
                isWarning
                  ? 'text-yellow-700 dark:text-yellow-300'
                  : 'text-red-700 dark:text-red-300'
              }`}
            >
              {totalMessages}/{maxMessages}
            </span>
          </div>
        </div>

        {/* Action button for critical level */}
        {isCritical && onComplete && (
          <button
            onClick={onComplete}
            className="flex-shrink-0 bg-red-600 hover:bg-red-700 text-white font-medium text-sm py-2 px-4 rounded-base border-2 border-border shadow-shadow hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none transition-all"
          >
            Complete Task
          </button>
        )}
      </div>
    </div>
  );
}
