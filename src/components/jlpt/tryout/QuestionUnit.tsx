'use client';

import { cn } from '@/lib/utils';
import { QuestionCard } from './QuestionCard';
import { ImageViewer } from './ImageViewer';
import { JLPTAudioPlayer } from './JLPTAudioPlayer';
import type { QuestionWithDetails, JLPTAnswerChoice, JLPTPassage } from '@/lib/jlpt/types';

export interface QuestionUnitProps {
  unitType: string; // 'cloze_test', 'reading_comp', 'long_reading', 'ab_comparison'
  passage?: JLPTPassage;
  passageSecondary?: JLPTPassage; // For A-B comparison
  questions: QuestionWithDetails[];
  shuffledChoicesMap: Map<string, JLPTAnswerChoice[]>; // questionId -> shuffled choices
  selectedAnswersMap: Map<string, number | null>; // questionId -> selected answer
  flaggedQuestionsSet: Set<string>; // questionIds that are flagged
  onSelectAnswer: (questionId: string, choiceNumber: number) => void;
  onToggleFlag: (questionId: string) => void;
  mondaiNumber: number;
  className?: string;
  maxAudioReplays?: number;
}

export function QuestionUnit({
  unitType,
  passage,
  passageSecondary,
  questions,
  shuffledChoicesMap,
  selectedAnswersMap,
  flaggedQuestionsSet,
  onSelectAnswer,
  onToggleFlag,
  mondaiNumber,
  className,
  maxAudioReplays = 2,
}: QuestionUnitProps) {
  const isABComparison = unitType === 'ab_comparison' && passageSecondary;

  return (
    <div className={cn('space-y-8', className)}>
      {/* Unit Header */}
      <div className="border-b-2 border-primary pb-2">
        <div className="text-xl font-bold text-primary">問題 {mondaiNumber}</div>
        {getUnitTypeDescription(unitType) && (
          <div className="text-sm text-muted-foreground mt-1">
            {getUnitTypeDescription(unitType)}
          </div>
        )}
      </div>

      {/* Main Passage */}
      {passage && (
        <div className="space-y-4">
          {/* A-B Comparison Label */}
          {isABComparison && (
            <div className="inline-block bg-primary/10 text-primary px-3 py-1 rounded-md text-sm font-semibold">
              文章A
            </div>
          )}

          {renderPassage(passage, maxAudioReplays)}
        </div>
      )}

      {/* Secondary Passage (for A-B comparison) */}
      {isABComparison && passageSecondary && (
        <div className="space-y-4 border-t-2 border-dashed pt-6">
          <div className="inline-block bg-primary/10 text-primary px-3 py-1 rounded-md text-sm font-semibold">
            文章B
          </div>
          {renderPassage(passageSecondary, maxAudioReplays)}
        </div>
      )}

      {/* Questions */}
      <div className="space-y-8 border-t pt-6">
        {questions.map((question, index) => {
          const shuffledChoices = shuffledChoicesMap.get(question.id) || [];
          const selectedAnswer = selectedAnswersMap.get(question.id) || null;
          const isFlagged = flaggedQuestionsSet.has(question.id);

          return (
            <div
              key={question.id}
              className={cn(
                'p-6 rounded-lg border-2',
                index > 0 && 'border-t-4 border-t-muted'
              )}
            >
              <QuestionCard
                question={question}
                questionNumber={question.questionNumber}
                mondaiNumber={mondaiNumber}
                shuffledChoices={shuffledChoices}
                selectedAnswer={selectedAnswer}
                isFlagged={isFlagged}
                onSelectAnswer={(choiceNumber) => onSelectAnswer(question.id, choiceNumber)}
                onToggleFlag={() => onToggleFlag(question.id)}
                maxAudioReplays={maxAudioReplays}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Helper function to render passage based on content type
function renderPassage(passage: JLPTPassage, maxAudioReplays: number) {
  if (passage.contentType === 'audio' && passage.mediaUrl) {
    return (
      <JLPTAudioPlayer
        src={passage.mediaUrl}
        maxReplays={maxAudioReplays}
      />
    );
  }

  if (passage.contentType === 'image' && passage.mediaUrl) {
    return (
      <ImageViewer
        src={passage.mediaUrl}
        alt={passage.title || '問題資料'}
        title={passage.title || undefined}
      />
    );
  }

  if (passage.contentType === 'text' && passage.contentText) {
    return (
      <div className="border-2 border-primary/20 rounded-lg p-6 bg-primary/5">
        {passage.title && (
          <div className="font-bold text-lg mb-4 text-primary">{passage.title}</div>
        )}
        <div className="whitespace-pre-wrap text-base leading-relaxed">
          {passage.contentText}
        </div>
      </div>
    );
  }

  return null;
}

// Helper function to get unit type description
function getUnitTypeDescription(unitType: string): string {
  const descriptions: Record<string, string> = {
    cloze_test: '次の文章を読んで、空欄に入る最も適切なものを選びなさい',
    reading_comp: '次の文章を読んで、質問に答えなさい',
    long_reading: '次の長文を読んで、質問に答えなさい',
    ab_comparison: '次の二つの文章を読んで、質問に答えなさい',
    listening_comp: '音声を聞いて、質問に答えなさい',
  };

  return descriptions[unitType] || '';
}
