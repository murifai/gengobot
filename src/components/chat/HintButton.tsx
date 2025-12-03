'use client';

import { useState, useRef } from 'react';
import { Loader2, X } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface HintButtonProps {
  // For task-based
  attemptId?: string;
  currentObjective?: string;
  // For free chat
  sessionId?: string;
  // Common
  lastMessage: string;
  disabled?: boolean;
  type: 'task' | 'free-chat';
}

export function HintButton({
  attemptId,
  sessionId,
  lastMessage,
  currentObjective,
  disabled,
  type,
}: HintButtonProps) {
  const [hint, setHint] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  // Cache hint for the same message
  const cachedMessageRef = useRef<string | null>(null);

  const fetchHint = async () => {
    if (loading) return;

    // If we already have a hint for this message, just show it
    if (hint && cachedMessageRef.current === lastMessage) {
      setShowTooltip(true);
      return;
    }

    setLoading(true);
    try {
      const endpoint =
        type === 'task'
          ? `/api/task-attempts/${attemptId}/hint`
          : `/api/free-conversation/${sessionId}/hint`;

      const body = type === 'task' ? { lastMessage, currentObjective } : { lastMessage };

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch hint');
      }

      const data = await response.json();
      setHint(data.hint);
      cachedMessageRef.current = lastMessage;
      setShowTooltip(true);
    } catch (error) {
      console.error('Error fetching hint:', error);
      setHint('Maaf, tidak bisa menghasilkan hint saat ini.');
      setShowTooltip(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative">
      <Button
        onClick={fetchHint}
        disabled={disabled || loading || !lastMessage}
        variant="ghost"
        className="h-7 w-7 p-0 rounded-full bg-card border-2 border-border shadow-shadow hover:bg-accent transition-colors"
        title="Get hint"
        aria-label="Get hint"
      >
        {loading ? (
          <Loader2 className="h-6! w-6! animate-spin" />
        ) : (
          <span className="text-lg font-bold">?</span>
        )}
      </Button>

      {showTooltip && hint && (
        <div className="fixed bottom-36 left-4 right-4 p-4 bg-background rounded-base border-2 border-border shadow-shadow z-50">
          <p className="text-sm text-foreground whitespace-pre-wrap pr-6">{hint}</p>
          <button
            onClick={() => setShowTooltip(false)}
            className="absolute top-2 right-2 p-1 hover:bg-main/20 rounded-base"
            aria-label="Close hint"
          >
            <X className="h-4 w-4 text-muted-foreground" />
          </button>
        </div>
      )}
    </div>
  );
}
