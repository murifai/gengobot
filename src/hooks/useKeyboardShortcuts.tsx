/**
 * useKeyboardShortcuts Hook
 *
 * Task-specific keyboard shortcuts and accessibility features.
 * Provides keyboard navigation and quick actions for task-based learning.
 */

'use client';

import React, { useEffect, useCallback, useRef } from 'react';

export interface KeyboardShortcut {
  key: string;
  ctrl?: boolean;
  shift?: boolean;
  alt?: boolean;
  meta?: boolean;
  description: string;
  action: () => void;
  enabled?: boolean;
}

export interface UseKeyboardShortcutsOptions {
  shortcuts: KeyboardShortcut[];
  enabled?: boolean;
}

export function useKeyboardShortcuts({ shortcuts, enabled = true }: UseKeyboardShortcutsOptions) {
  const shortcutsRef = useRef(shortcuts);

  // Update ref when shortcuts change
  useEffect(() => {
    shortcutsRef.current = shortcuts;
  }, [shortcuts]);

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (!enabled) return;

      for (const shortcut of shortcutsRef.current) {
        if (shortcut.enabled === false) continue;

        const keyMatches = event.key.toLowerCase() === shortcut.key.toLowerCase();
        const ctrlMatches = shortcut.ctrl ? event.ctrlKey : !event.ctrlKey;
        const shiftMatches = shortcut.shift ? event.shiftKey : !event.shiftKey;
        const altMatches = shortcut.alt ? event.altKey : !event.altKey;
        const metaMatches = shortcut.meta ? event.metaKey : !event.metaKey;

        if (keyMatches && ctrlMatches && shiftMatches && altMatches && metaMatches) {
          event.preventDefault();
          shortcut.action();
          break;
        }
      }
    },
    [enabled]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);
}

/**
 * Task-specific keyboard shortcuts
 */
export function useTaskKeyboardShortcuts() {
  const shortcuts: Record<string, KeyboardShortcut> = {
    startTask: {
      key: 's',
      ctrl: true,
      description: 'タスクを開始 (Start Task)',
      action: () => {
        // Will be implemented by consuming component
        console.log('Start task shortcut');
      },
    },
    submitMessage: {
      key: 'Enter',
      ctrl: true,
      description: 'メッセージを送信 (Submit Message)',
      action: () => {
        console.log('Submit message shortcut');
      },
    },
    toggleVoice: {
      key: 'v',
      ctrl: true,
      description: '音声入力を切り替え (Toggle Voice Input)',
      action: () => {
        console.log('Toggle voice shortcut');
      },
    },
    showHelp: {
      key: '?',
      shift: true,
      description: 'ヘルプを表示 (Show Help)',
      action: () => {
        console.log('Show help shortcut');
      },
    },
    nextTask: {
      key: 'n',
      ctrl: true,
      description: '次のタスク (Next Task)',
      action: () => {
        console.log('Next task shortcut');
      },
    },
    previousTask: {
      key: 'p',
      ctrl: true,
      description: '前のタスク (Previous Task)',
      action: () => {
        console.log('Previous task shortcut');
      },
    },
    focusSearch: {
      key: '/',
      description: '検索にフォーカス (Focus Search)',
      action: () => {
        console.log('Focus search shortcut');
      },
    },
    escape: {
      key: 'Escape',
      description: 'キャンセル/閉じる (Cancel/Close)',
      action: () => {
        console.log('Escape shortcut');
      },
    },
  };

  return shortcuts;
}

/**
 * Keyboard Shortcuts Help Panel Component
 */
export interface KeyboardShortcutsHelpProps {
  shortcuts: KeyboardShortcut[];
  onClose: () => void;
}

export function KeyboardShortcutsHelp({ shortcuts, onClose }: KeyboardShortcutsHelpProps) {
  // Close on Escape key
  useEffect(() => {
    function handleEscape(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        onClose();
      }
    }

    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  function formatShortcut(shortcut: KeyboardShortcut): string {
    const parts: string[] = [];
    if (shortcut.ctrl) parts.push('Ctrl');
    if (shortcut.shift) parts.push('Shift');
    if (shortcut.alt) parts.push('Alt');
    if (shortcut.meta) parts.push('Cmd');
    parts.push(shortcut.key.toUpperCase());
    return parts.join(' + ');
  }

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-auto"
        onClick={e => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
            キーボードショートカット (Keyboard Shortcuts)
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            aria-label="Close"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <div className="p-6">
          <div className="space-y-3">
            {shortcuts.map((shortcut, index) => (
              <div
                key={index}
                className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700 last:border-0"
              >
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  {shortcut.description}
                </span>
                <kbd className="px-3 py-1 text-sm font-mono bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded border border-gray-300 dark:border-gray-600">
                  {formatShortcut(shortcut)}
                </kbd>
              </div>
            ))}
          </div>
        </div>

        <div className="sticky bottom-0 bg-gray-50 dark:bg-gray-900 px-6 py-3 text-xs text-center text-gray-500 dark:text-gray-500">
          Press <kbd className="px-2 py-0.5 bg-gray-200 dark:bg-gray-700 rounded">Esc</kbd> to close
        </div>
      </div>
    </div>
  );
}
