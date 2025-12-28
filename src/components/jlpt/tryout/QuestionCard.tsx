'use client';

import { Flag } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';
import type { QuestionWithDetails, JLPTAnswerChoice } from '@/lib/jlpt/types';

interface QuestionCardProps {
  question: QuestionWithDetails;
  questionNumber: number;
  mondaiNumber: number;
  shuffledChoices: JLPTAnswerChoice[];
  selectedAnswer: number | null;
  isFlagged: boolean;
  onSelectAnswer: (choiceNumber: number) => void;
  onToggleFlag: () => void;
  className?: string;
}

export function QuestionCard({
  question,
  questionNumber,
  mondaiNumber,
  shuffledChoices,
  selectedAnswer,
  isFlagged,
  onSelectAnswer,
  onToggleFlag,
  className,
}: QuestionCardProps) {
  return (
    <div className={cn('space-y-6', className)}>
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="text-sm text-muted-foreground">問題 {mondaiNumber}</div>
          <div className="text-lg font-semibold">第 {questionNumber} 問</div>
        </div>
        <Button
          variant={isFlagged ? 'default' : 'outline'}
          size="sm"
          onClick={onToggleFlag}
          className={cn(isFlagged && 'bg-orange-600 hover:bg-orange-700')}
        >
          <Flag className={cn('h-4 w-4', isFlagged && 'fill-current')} />
          {isFlagged ? 'フラグ解除' : 'フラグ'}
        </Button>
      </div>

      {/* Passage (if exists) */}
      {question.passage && (
        <div className="border rounded-lg p-4 bg-muted/50">
          {question.passage.title && (
            <div className="font-semibold mb-2">{question.passage.title}</div>
          )}
          <div className="whitespace-pre-wrap text-base leading-relaxed">
            {question.passage.contentText}
          </div>
        </div>
      )}

      {/* Question Text */}
      <div className="space-y-3">
        <div className="text-lg leading-relaxed">
          {question.blankPosition ? (
            // Render with blank position highlighted
            <div className="space-y-2">
              <div className="whitespace-pre-wrap">{question.questionText}</div>
              {question.blankPosition && (
                <div className="text-sm text-muted-foreground">
                  （下線部 {question.blankPosition} に入る最も適切なものを選びなさい）
                </div>
              )}
            </div>
          ) : (
            <div className="whitespace-pre-wrap">{question.questionText}</div>
          )}
        </div>

        {/* Answer Choices */}
        <div className="space-y-2 mt-4">
          {shuffledChoices.map(choice => (
            <button
              key={choice.id}
              onClick={() => onSelectAnswer(choice.choiceNumber)}
              className={cn(
                'w-full text-left p-4 rounded-lg border-2 transition-all',
                'hover:bg-accent hover:border-accent-foreground/20',
                selectedAnswer === choice.choiceNumber
                  ? 'bg-primary/10 border-primary font-medium'
                  : 'bg-card border-border'
              )}
            >
              <div className="flex items-start gap-3">
                <div
                  className={cn(
                    'shrink-0 w-8 h-8 rounded-full border-2 flex items-center justify-center text-sm font-semibold',
                    selectedAnswer === choice.choiceNumber
                      ? 'bg-primary text-primary-foreground border-primary'
                      : 'border-muted-foreground/30'
                  )}
                >
                  {choice.choiceNumber}
                </div>
                <div className="flex-1 pt-1">
                  <div className="whitespace-pre-wrap">{choice.choiceText}</div>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Help Text */}
      <div className="text-xs text-muted-foreground text-center pt-4 border-t">
        選択肢をクリックして解答を選択してください
      </div>
    </div>
  );
}
