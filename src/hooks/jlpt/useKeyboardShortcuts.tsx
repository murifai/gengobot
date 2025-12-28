import { useEffect, useCallback } from 'react';

export interface KeyboardShortcutHandlers {
  onNextQuestion?: () => void;
  onPreviousQuestion?: () => void;
  onSelectChoice1?: () => void;
  onSelectChoice2?: () => void;
  onSelectChoice3?: () => void;
  onSelectChoice4?: () => void;
  onToggleFlag?: () => void;
  onSubmitSection?: () => void;
}

export interface UseKeyboardShortcutsOptions {
  enabled?: boolean;
  handlers: KeyboardShortcutHandlers;
}

/**
 * Custom hook for JLPT test keyboard shortcuts
 *
 * Shortcuts:
 * - Arrow Right / N: Next question
 * - Arrow Left / P: Previous question
 * - 1-4: Select answer choice
 * - F: Toggle flag
 * - Ctrl+Enter: Submit section
 */
export function useKeyboardShortcuts({
  enabled = true,
  handlers,
}: UseKeyboardShortcutsOptions) {
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (!enabled) return;

      // Ignore if user is typing in an input field
      const target = event.target as HTMLElement;
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable
      ) {
        return;
      }

      // Navigation shortcuts
      if (event.key === 'ArrowRight' || event.key.toLowerCase() === 'n') {
        event.preventDefault();
        handlers.onNextQuestion?.();
        return;
      }

      if (event.key === 'ArrowLeft' || event.key.toLowerCase() === 'p') {
        event.preventDefault();
        handlers.onPreviousQuestion?.();
        return;
      }

      // Answer selection shortcuts (1-4)
      if (event.key >= '1' && event.key <= '4') {
        event.preventDefault();
        const choiceNumber = parseInt(event.key, 10);

        switch (choiceNumber) {
          case 1:
            handlers.onSelectChoice1?.();
            break;
          case 2:
            handlers.onSelectChoice2?.();
            break;
          case 3:
            handlers.onSelectChoice3?.();
            break;
          case 4:
            handlers.onSelectChoice4?.();
            break;
        }
        return;
      }

      // Flag toggle (F key)
      if (event.key.toLowerCase() === 'f' && !event.ctrlKey && !event.metaKey) {
        event.preventDefault();
        handlers.onToggleFlag?.();
        return;
      }

      // Submit section (Ctrl+Enter or Cmd+Enter)
      if (event.key === 'Enter' && (event.ctrlKey || event.metaKey)) {
        event.preventDefault();
        handlers.onSubmitSection?.();
        return;
      }
    },
    [enabled, handlers]
  );

  useEffect(() => {
    if (!enabled) return;

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [enabled, handleKeyDown]);
}

/**
 * Helper component to display keyboard shortcuts guide
 */
export function KeyboardShortcutsGuide({ className }: { className?: string }) {
  const arrowRight = '\u2192';
  const arrowLeft = '\u2190';

  return (
    <div className={className}>
      <div className="text-sm font-semibold mb-2">Keyboard Shortcuts</div>
      <div className="text-xs space-y-1 text-muted-foreground">
        <div className="flex items-center gap-2">
          <kbd className="px-2 py-0.5 bg-muted border border-border rounded text-xs">{arrowRight}</kbd>
          <span>or</span>
          <kbd className="px-2 py-0.5 bg-muted border border-border rounded text-xs">N</kbd>
          <span>: Next question</span>
        </div>
        <div className="flex items-center gap-2">
          <kbd className="px-2 py-0.5 bg-muted border border-border rounded text-xs">{arrowLeft}</kbd>
          <span>or</span>
          <kbd className="px-2 py-0.5 bg-muted border border-border rounded text-xs">P</kbd>
          <span>: Previous question</span>
        </div>
        <div className="flex items-center gap-2">
          <kbd className="px-2 py-0.5 bg-muted border border-border rounded text-xs">1-4</kbd>
          <span>: Select answer</span>
        </div>
        <div className="flex items-center gap-2">
          <kbd className="px-2 py-0.5 bg-muted border border-border rounded text-xs">F</kbd>
          <span>: Toggle flag</span>
        </div>
        <div className="flex items-center gap-2">
          <kbd className="px-2 py-0.5 bg-muted border border-border rounded text-xs">Ctrl</kbd>
          <span>+</span>
          <kbd className="px-2 py-0.5 bg-muted border border-border rounded text-xs">Enter</kbd>
          <span>: Submit section</span>
        </div>
      </div>
    </div>
  );
}
