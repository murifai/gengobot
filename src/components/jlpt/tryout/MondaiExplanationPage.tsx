'use client';

import { Button } from '@/components/ui/Button';
import { ChevronRight, BookOpen } from 'lucide-react';
import type { QuestionWithDetails } from '@/lib/jlpt/types';

interface MondaiExplanationPageProps {
  mondaiNumber: number;
  explanation: string;
  exampleQuestion: QuestionWithDetails;
  onStart: () => void;
}

export function MondaiExplanationPage({
  mondaiNumber,
  explanation,
  exampleQuestion,
  onStart,
}: MondaiExplanationPageProps) {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-lg">
          <BookOpen className="h-5 w-5" />
          <span className="font-bold text-lg">問題 {mondaiNumber}</span>
        </div>
        <h2 className="text-2xl font-bold">問題の説明</h2>
      </div>

      {/* Explanation */}
      <div className="bg-blue-50 dark:bg-blue-950/30 border-2 border-blue-200 dark:border-blue-900 rounded-lg p-6">
        <div className="text-base text-blue-900 dark:text-blue-100 whitespace-pre-wrap leading-relaxed">
          {explanation}
        </div>
      </div>

      {/* Example Question */}
      <div className="space-y-3">
        <h3 className="font-semibold text-lg flex items-center gap-2">
          <span className="bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-100 px-3 py-1 rounded-md text-sm">
            例題
          </span>
          問題の例
        </h3>

        <div className="border-2 border-border rounded-lg p-6 bg-muted/30">
          {/* Example Passage */}
          {exampleQuestion.passage && (
            <div className="mb-4 p-4 bg-background rounded-lg border">
              {exampleQuestion.passage.title && (
                <div className="font-semibold mb-2">{exampleQuestion.passage.title}</div>
              )}
              <div className="whitespace-pre-wrap text-sm leading-relaxed">
                {exampleQuestion.passage.contentText}
              </div>
            </div>
          )}

          {/* Example Question Text */}
          <div className="mb-4">
            <div className="text-base leading-relaxed whitespace-pre-wrap">
              {exampleQuestion.questionText}
            </div>
          </div>

          {/* Example Choices */}
          <div className="space-y-2">
            {exampleQuestion.answerChoices
              .sort((a, b) => a.choiceNumber - b.choiceNumber)
              .map(choice => (
                <div
                  key={choice.id}
                  className="flex items-start gap-3 p-3 rounded-lg border bg-background/50"
                >
                  <div className="shrink-0 w-7 h-7 rounded-full border-2 border-muted-foreground/30 flex items-center justify-center text-sm font-semibold">
                    {choice.choiceNumber}
                  </div>
                  <div className="flex-1 pt-0.5">
                    <div className="whitespace-pre-wrap text-sm">{choice.choiceText}</div>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>

      {/* Instructions */}
      <div className="bg-yellow-50 dark:bg-yellow-950/30 border-2 border-yellow-200 dark:border-yellow-900 rounded-lg p-4">
        <p className="text-sm text-yellow-900 dark:text-yellow-100">
          ✓ 問題の説明を理解したら、「問題を始める」ボタンを押して実際の問題に進んでください
        </p>
      </div>

      {/* Start Button */}
      <div className="flex justify-center pt-4">
        <Button onClick={onStart} size="lg" className="gap-2">
          問題を始める
          <ChevronRight className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
}
