'use client';

import { useState } from 'react';
import { AlertTriangle, CheckCircle2, Flag, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';
import type { SectionType } from '@/lib/jlpt/types';

export interface SectionReviewModalProps {
  isOpen: boolean;
  sectionType: SectionType;
  totalQuestions: number;
  answeredQuestions: number;
  flaggedQuestions: number;
  timeRemaining: number; // seconds
  onConfirm: () => void;
  onCancel: () => void;
}

export function SectionReviewModal({
  isOpen,
  sectionType,
  totalQuestions,
  answeredQuestions,
  flaggedQuestions,
  timeRemaining,
  onConfirm,
  onCancel,
}: SectionReviewModalProps) {
  const [isConfirming, setIsConfirming] = useState(false);

  if (!isOpen) return null;

  const unansweredQuestions = totalQuestions - answeredQuestions;
  const hasUnanswered = unansweredQuestions > 0;
  const hasFlagged = flaggedQuestions > 0;

  const handleConfirm = async () => {
    setIsConfirming(true);
    await onConfirm();
    setIsConfirming(false);
  };

  const getSectionName = (section: SectionType): string => {
    const names: Record<SectionType, string> = {
      vocabulary: '言語知識（文字・語彙）',
      grammar_reading: '言語知識（文法）・読解',
      listening: '聴解',
    };
    return names[section];
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-40"
        onClick={onCancel}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div
          className="bg-background border-2 border-border rounded-lg shadow-xl max-w-md w-full"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="border-b px-6 py-4">
            <h2 className="text-xl font-bold">セクション提出確認</h2>
            <p className="text-sm text-muted-foreground mt-1">
              {getSectionName(sectionType)}
            </p>
          </div>

          {/* Content */}
          <div className="px-6 py-4 space-y-4">
            {/* Warning Banner */}
            <div className="bg-orange-50 dark:bg-orange-950 border-2 border-orange-500 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-orange-600 dark:text-orange-400 shrink-0 mt-0.5" />
                <div className="text-sm">
                  <div className="font-semibold text-orange-900 dark:text-orange-100 mb-1">
                    注意：提出後は戻れません
                  </div>
                  <div className="text-orange-800 dark:text-orange-200">
                    このセクションを提出すると、前のセクションに戻ることはできません。
                    本番のJLPTと同じ形式です。
                  </div>
                </div>
              </div>
            </div>

            {/* Statistics */}
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                  <span className="text-sm font-medium">解答済み</span>
                </div>
                <span className="text-lg font-bold">
                  {answeredQuestions} / {totalQuestions}
                </span>
              </div>

              {hasUnanswered && (
                <div className="flex items-center justify-between p-3 bg-destructive/10 rounded-lg border border-destructive/30">
                  <div className="flex items-center gap-2">
                    <XCircle className="h-5 w-5 text-destructive" />
                    <span className="text-sm font-medium text-destructive">未解答</span>
                  </div>
                  <span className="text-lg font-bold text-destructive">
                    {unansweredQuestions}
                  </span>
                </div>
              )}

              {hasFlagged && (
                <div className="flex items-center justify-between p-3 bg-orange-50 dark:bg-orange-950 rounded-lg border border-orange-300 dark:border-orange-700">
                  <div className="flex items-center gap-2">
                    <Flag className="h-5 w-5 text-orange-600" />
                    <span className="text-sm font-medium text-orange-900 dark:text-orange-100">
                      フラグ付き
                    </span>
                  </div>
                  <span className="text-lg font-bold text-orange-900 dark:text-orange-100">
                    {flaggedQuestions}
                  </span>
                </div>
              )}

              {/* Time Remaining */}
              <div className="flex items-center justify-between p-3 bg-primary/10 rounded-lg border border-primary/30">
                <span className="text-sm font-medium text-primary">残り時間</span>
                <span className={cn(
                  'text-lg font-bold',
                  timeRemaining < 300 ? 'text-destructive' : 'text-primary'
                )}>
                  {formatTime(timeRemaining)}
                </span>
              </div>
            </div>

            {/* Confirmation Message */}
            <div className="text-sm text-center text-muted-foreground pt-2 border-t">
              {hasUnanswered ? (
                <span className="text-destructive font-medium">
                  未解答の問題があります。このまま提出してもよろしいですか？
                </span>
              ) : (
                <span>
                  全ての問題に解答しました。このセクションを提出しますか？
                </span>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="border-t px-6 py-4 flex gap-3">
            <Button
              onClick={onCancel}
              variant="outline"
              className="flex-1"
              disabled={isConfirming}
            >
              キャンセル
            </Button>
            <Button
              onClick={handleConfirm}
              variant="default"
              className="flex-1"
              disabled={isConfirming}
            >
              {isConfirming ? '提出中...' : '提出する'}
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
