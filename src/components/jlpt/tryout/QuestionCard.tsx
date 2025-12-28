'use client';

import { Flag } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';
import type { QuestionWithDetails, JLPTAnswerChoice } from '@/lib/jlpt/types';
import { JLPTAudioPlayer } from './JLPTAudioPlayer';
import { ImageViewer } from './ImageViewer';

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
  maxAudioReplays?: number;
}

// Helper function to render cloze text with underlined blanks
function renderClozeText(text: string, blankPosition: string): React.ReactNode {
  // Split by underscores which typically mark blanks in JLPT questions
  const parts = text.split(/___+/);

  if (parts.length === 1) {
    // No underscores found, return as is
    return text;
  }

  // Render with highlighted blank positions
  return (
    <>
      {parts.map((part, index) => (
        <span key={index}>
          {part}
          {index < parts.length - 1 && (
            <span className="inline-block min-w-[3em] border-b-2 border-primary mx-1 text-center">
              <span className="text-sm font-semibold text-primary">{blankPosition}</span>
            </span>
          )}
        </span>
      ))}
    </>
  );
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
  maxAudioReplays = 2,
}: QuestionCardProps) {
  const hasPassageImage = question.passage?.contentType === 'image' && question.passage?.mediaUrl;
  const hasQuestionImage = question.mediaType === 'image' && question.mediaUrl;

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="text-sm text-muted-foreground">問題 {mondaiNumber}</div>
          <div className="text-lg font-semibold">問 {questionNumber}</div>
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

      {/* Audio Passage (if exists) */}
      {question.passage?.contentType === 'audio' && question.passage.mediaUrl && (
        <JLPTAudioPlayer
          src={question.passage.mediaUrl}
          maxReplays={maxAudioReplays}
        />
      )}

      {/* Image Passage (if exists) */}
      {hasPassageImage && (
        <ImageViewer
          src={question.passage!.mediaUrl!}
          alt={question.passage!.title || '問題資料'}
          title={question.passage!.title || undefined}
        />
      )}

      {/* Text Passage (if exists) */}
      {question.passage?.contentType === 'text' && question.passage.contentText && (
        <div className="border rounded-lg p-4 bg-muted/50">
          {question.passage.title && (
            <div className="font-semibold mb-2">{question.passage.title}</div>
          )}
          <div className="whitespace-pre-wrap text-base leading-relaxed">
            {question.passage.contentText}
          </div>
        </div>
      )}

      {/* Question Image (if exists - standalone) */}
      {hasQuestionImage && (
        <ImageViewer
          src={question.mediaUrl!}
          alt="問題画像"
          title={`問題 ${questionNumber}`}
        />
      )}

      {/* Question Text */}
      <div className="space-y-3">
        <div className="text-lg leading-relaxed">
          {question.blankPosition ? (
            // Cloze test with blank position
            <div className="space-y-2">
              <div className="whitespace-pre-wrap">
                {renderClozeText(question.questionText, question.blankPosition)}
              </div>
              <div className="text-sm text-muted-foreground">
                （下線部 {question.blankPosition} に入る最も適切なものを選びなさい）
              </div>
            </div>
          ) : (
            <div className="whitespace-pre-wrap">{question.questionText}</div>
          )}
        </div>

        {/* Answer Choices */}
        <div className="space-y-2 mt-4">
          {shuffledChoices.map((choice, displayIndex) => (
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
                  {displayIndex + 1}
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
