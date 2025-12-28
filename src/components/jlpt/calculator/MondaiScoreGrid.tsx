'use client';

import { useState, useEffect } from 'react';
import { JLPTLevel, SectionType } from '@/lib/jlpt/types';
import { MONDAI_CONFIG } from '@/config/jlpt-mondai';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/label';
import { CheckCircle2, Circle } from 'lucide-react';
import type { MondaiScoreInput } from './CalculatorForm';

interface MondaiScoreGridProps {
  level: JLPTLevel;
  sectionType: SectionType;
  onChange: (scoreInput: MondaiScoreInput) => void;
  scores: Record<string, MondaiScoreInput>;
}

const SECTION_LABELS: Record<SectionType, { title: string; icon: string }> = {
  vocabulary: { title: '文字・語彙 (Kanji & Kosakata)', icon: '📝' },
  grammar_reading: { title: '文法・読解 (Tata Bahasa & Bacaan)', icon: '📖' },
  listening: { title: '聴解 (Mendengarkan)', icon: '🎧' },
};

export default function MondaiScoreGrid({
  level,
  sectionType,
  onChange,
  scores,
}: MondaiScoreGridProps) {
  const config = MONDAI_CONFIG[level][sectionType];
  const sectionLabel = SECTION_LABELS[sectionType];

  return (
    <div className="rounded-base border-2 border-border bg-card p-6">
      <div className="flex items-center gap-3 mb-4">
        <span className="text-2xl">{sectionLabel.icon}</span>
        <h4 className="text-lg font-semibold">{sectionLabel.title}</h4>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {config.mondai.map(mondai => {
          const key = `${sectionType}-${mondai.number}`;
          const currentScore = scores[key];
          const isFilled = currentScore && currentScore.correct >= 0 && currentScore.total > 0;

          return (
            <MondaiScoreInput
              key={key}
              mondaiNumber={mondai.number}
              defaultTotalQuestions={mondai.questions_count}
              weight={mondai.weight}
              sectionType={sectionType}
              value={currentScore}
              onChange={onChange}
              isFilled={isFilled}
            />
          );
        })}
      </div>
    </div>
  );
}

interface MondaiScoreInputProps {
  mondaiNumber: number;
  defaultTotalQuestions: number;
  weight: number;
  sectionType: SectionType;
  value?: MondaiScoreInput;
  onChange: (scoreInput: MondaiScoreInput) => void;
  isFilled?: boolean;
}

function MondaiScoreInput({
  mondaiNumber,
  defaultTotalQuestions,
  weight,
  sectionType,
  value,
  onChange,
  isFilled,
}: MondaiScoreInputProps) {
  const [correct, setCorrect] = useState<string>(value?.correct?.toString() || '');
  const [total, setTotal] = useState<string>(value?.total?.toString() || defaultTotalQuestions.toString());

  useEffect(() => {
    setCorrect(value?.correct?.toString() || '');
    setTotal(value?.total?.toString() || defaultTotalQuestions.toString());
  }, [value, defaultTotalQuestions]);

  const handleCorrectChange = (newCorrect: string) => {
    setCorrect(newCorrect);

    const correctNum = parseInt(newCorrect, 10);
    const totalNum = parseInt(total, 10);

    if (newCorrect === '' || isNaN(correctNum) || isNaN(totalNum)) {
      return;
    }

    // Validate range
    if (correctNum < 0 || correctNum > totalNum) {
      return;
    }

    onChange({
      sectionType,
      mondaiNumber,
      correct: correctNum,
      total: totalNum,
    });
  };

  const handleTotalChange = (newTotal: string) => {
    setTotal(newTotal);

    const totalNum = parseInt(newTotal, 10);
    const correctNum = parseInt(correct, 10);

    if (newTotal === '' || isNaN(totalNum)) {
      return;
    }

    // Validate minimum
    if (totalNum < 1) {
      return;
    }

    // Update if we have a valid correct value
    if (correct !== '' && !isNaN(correctNum)) {
      // Adjust correct if it exceeds new total
      const adjustedCorrect = Math.min(correctNum, totalNum);
      setCorrect(adjustedCorrect.toString());

      onChange({
        sectionType,
        mondaiNumber,
        correct: adjustedCorrect,
        total: totalNum,
      });
    }
  };

  const totalNum = parseInt(total, 10);
  const correctNum = parseInt(correct, 10);
  const isValid =
    correct !== '' &&
    total !== '' &&
    !isNaN(correctNum) &&
    !isNaN(totalNum) &&
    correctNum >= 0 &&
    correctNum <= totalNum &&
    totalNum >= 1;

  return (
    <div className={`p-4 rounded-base border-2 transition-all ${
      isFilled ? 'border-primary/30 bg-primary/5' : 'border-border bg-background'
    }`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-muted-foreground">問題 {mondaiNumber}</span>
          {weight > 1 && (
            <span className="text-xs px-1.5 py-0.5 rounded bg-accent text-accent-foreground">
              ×{weight}
            </span>
          )}
        </div>
        {isFilled ? (
          <CheckCircle2 className="w-4 h-4 text-primary" />
        ) : (
          <Circle className="w-4 h-4 text-muted-foreground/30" />
        )}
      </div>

      <div className="space-y-3">
        <div>
          <Label
            htmlFor={`mondai-correct-${sectionType}-${mondaiNumber}`}
            className="text-xs text-muted-foreground"
          >
            Jumlah Benar
          </Label>
          <Input
            id={`mondai-correct-${sectionType}-${mondaiNumber}`}
            type="number"
            min={0}
            max={totalNum}
            value={correct}
            onChange={e => handleCorrectChange(e.target.value)}
            placeholder="0"
            className={`mt-1 text-center font-semibold ${
              !isValid && correct !== '' ? 'border-destructive' : ''
            }`}
          />
        </div>

        <div>
          <Label
            htmlFor={`mondai-total-${sectionType}-${mondaiNumber}`}
            className="text-xs text-muted-foreground"
          >
            Total Soal
          </Label>
          <Input
            id={`mondai-total-${sectionType}-${mondaiNumber}`}
            type="number"
            min={1}
            value={total}
            onChange={e => handleTotalChange(e.target.value)}
            placeholder={defaultTotalQuestions.toString()}
            className={`mt-1 text-center font-semibold ${
              total !== '' && (isNaN(totalNum) || totalNum < 1) ? 'border-destructive' : ''
            }`}
          />
          <p className="text-xs text-muted-foreground mt-1">Default: {defaultTotalQuestions}</p>
        </div>

        {!isValid && (correct !== '' || total !== '') && (
          <p className="text-xs text-destructive">
            {totalNum < 1
              ? 'Total soal minimal 1'
              : correctNum > totalNum
                ? `Benar tidak boleh lebih dari ${totalNum}`
                : 'Input tidak valid'}
          </p>
        )}
      </div>
    </div>
  );
}
