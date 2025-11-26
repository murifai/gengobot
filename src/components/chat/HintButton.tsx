'use client';

import { useState } from 'react';
import { HelpCircle, Loader2, X } from 'lucide-react';
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

  const fetchHint = async () => {
    if (loading) return;

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
        size="icon"
        className="h-12 w-12 rounded-full hover:animate-wiggle"
        title="Get hint"
        aria-label="Get hint"
      >
        {loading ? (
          <Loader2 className="h-10 w-10 animate-spin" />
        ) : (
          <HelpCircle className="h-10 w-10" />
        )}
      </Button>

      {showTooltip && hint && (
        <div className="absolute bottom-full left-0 right-0 mb-2 p-4 bg-background rounded-base border-2 border-border shadow-shadow z-50">
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
