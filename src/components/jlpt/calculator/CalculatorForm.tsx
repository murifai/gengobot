'use client';

import { useState } from 'react';
import { JLPTLevel, SectionType } from '@/lib/jlpt/types';
import { MONDAI_CONFIG } from '@/config/jlpt-mondai';
import MondaiScoreGrid from './MondaiScoreGrid';
import { Button } from '@/components/ui/Button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/Input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Calculator, RotateCcw } from 'lucide-react';

export interface MondaiScoreInput {
  sectionType: SectionType;
  mondaiNumber: number;
  correct: number;
  total: number;
}

interface CalculatorFormProps {
  onCalculate: (data: {
    level: JLPTLevel;
    source: string;
    userNote: string;
    mondaiScores: MondaiScoreInput[];
  }) => void;
  isCalculating?: boolean;
}

const LEVEL_OPTIONS: { value: JLPTLevel; label: string; description: string }[] = [
  { value: 'N5', label: 'N5', description: 'Pemula - Basic' },
  { value: 'N4', label: 'N4', description: 'Dasar - Elementary' },
  { value: 'N3', label: 'N3', description: 'Menengah - Intermediate' },
  { value: 'N2', label: 'N2', description: 'Lanjutan - Advanced' },
  { value: 'N1', label: 'N1', description: 'Ahli - Expert' },
];

export default function CalculatorForm({ onCalculate, isCalculating = false }: CalculatorFormProps) {
  const [level, setLevel] = useState<JLPTLevel>('N5');
  const [source, setSource] = useState('');
  const [userNote, setUserNote] = useState('');
  const [mondaiScores, setMondaiScores] = useState<Record<string, MondaiScoreInput>>({});

  const handleMondaiScoreChange = (scoreInput: MondaiScoreInput) => {
    const key = `${scoreInput.sectionType}-${scoreInput.mondaiNumber}`;
    setMondaiScores(prev => ({
      ...prev,
      [key]: scoreInput,
    }));
  };

  const handleReset = () => {
    setSource('');
    setUserNote('');
    setMondaiScores({});
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Convert mondaiScores object to array
    const scoresArray = Object.values(mondaiScores);

    onCalculate({
      level,
      source,
      userNote,
      mondaiScores: scoresArray,
    });
  };

  // Check if all mondai have been filled
  const getTotalMondaiCount = () => {
    const config = MONDAI_CONFIG[level];
    let count = 0;
    (['vocabulary', 'grammar_reading', 'listening'] as SectionType[]).forEach(section => {
      count += config[section].mondai.length;
    });
    return count;
  };

  const getFilledMondaiCount = () => {
    return Object.keys(mondaiScores).length;
  };

  const isFormComplete = getFilledMondaiCount() === getTotalMondaiCount();

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Level Selection */}
      <div className="space-y-2">
        <Label htmlFor="level" className="text-base font-semibold">
          Level JLPT
        </Label>
        <Select value={level} onValueChange={(value: JLPTLevel) => setLevel(value)}>
          <SelectTrigger id="level" className="w-full">
            <SelectValue placeholder="Pilih level" />
          </SelectTrigger>
          <SelectContent>
            {LEVEL_OPTIONS.map(option => (
              <SelectItem key={option.value} value={option.value}>
                <div className="flex items-center gap-3">
                  <span className="font-bold text-primary">{option.label}</span>
                  <span className="text-sm text-muted-foreground">{option.description}</span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Source Input */}
      <div className="space-y-2">
        <Label htmlFor="source" className="text-base font-semibold">
          Sumber Tes <span className="text-muted-foreground text-sm font-normal">(opsional)</span>
        </Label>
        <Input
          id="source"
          type="text"
          value={source}
          onChange={e => setSource(e.target.value)}
          placeholder="Contoh: Sou Matome, Kanzen Master, Tes Sampel Resmi"
          className="w-full"
        />
        <p className="text-xs text-muted-foreground">
          Tulis nama buku atau sumber latihan yang kamu gunakan
        </p>
      </div>

      {/* User Note */}
      <div className="space-y-2">
        <Label htmlFor="userNote" className="text-base font-semibold">
          Catatan <span className="text-muted-foreground text-sm font-normal">(opsional)</span>
        </Label>
        <Input
          id="userNote"
          type="text"
          value={userNote}
          onChange={e => setUserNote(e.target.value)}
          placeholder="Contoh: Latihan Minggu ke-2, Persiapan Ujian Desember"
          className="w-full"
        />
        <p className="text-xs text-muted-foreground">Tambahkan catatan untuk mengingat konteks tes ini</p>
      </div>

      {/* Mondai Score Grids */}
      <div className="space-y-6 mt-8">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Input Nilai Per Mondai</h3>
          <div className="text-sm text-muted-foreground">
            {getFilledMondaiCount()} / {getTotalMondaiCount()} mondai terisi
          </div>
        </div>

        <MondaiScoreGrid
          level={level}
          sectionType="vocabulary"
          onChange={handleMondaiScoreChange}
          scores={mondaiScores}
        />

        <MondaiScoreGrid
          level={level}
          sectionType="grammar_reading"
          onChange={handleMondaiScoreChange}
          scores={mondaiScores}
        />

        <MondaiScoreGrid
          level={level}
          sectionType="listening"
          onChange={handleMondaiScoreChange}
          scores={mondaiScores}
        />
      </div>

      {/* Action Buttons */}
      <div className="flex gap-4 pt-6 border-t">
        <Button
          type="button"
          variant="outline"
          onClick={handleReset}
          disabled={isCalculating}
          className="flex-1"
        >
          <RotateCcw className="w-4 h-4 mr-2" />
          Reset
        </Button>
        <Button type="submit" disabled={!isFormComplete || isCalculating} className="flex-1">
          <Calculator className="w-4 h-4 mr-2" />
          {isCalculating ? 'Menghitung...' : 'Hitung Nilai'}
        </Button>
      </div>

      {/* Validation Feedback */}
      {!isFormComplete && getFilledMondaiCount() > 0 && (
        <div className="p-4 rounded-base bg-accent/50 text-sm">
          <p className="text-muted-foreground">
            Mohon lengkapi semua mondai untuk melanjutkan perhitungan.{' '}
            <span className="font-semibold">
              {getTotalMondaiCount() - getFilledMondaiCount()} mondai
            </span>{' '}
            belum terisi.
          </p>
        </div>
      )}
    </form>
  );
}
