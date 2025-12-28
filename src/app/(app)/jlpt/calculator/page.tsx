'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ChevronLeft, History } from 'lucide-react';
import CalculatorForm from '@/components/jlpt/calculator/CalculatorForm';
import CalculatorResults from '@/components/jlpt/calculator/CalculatorResults';
import { Button } from '@/components/ui/Button';
import type { MondaiScoreInput } from '@/components/jlpt/calculator/CalculatorForm';
import type { JLPTLevel, SectionType, ReferenceGrade } from '@/lib/jlpt/types';

interface SectionResult {
  sectionType: SectionType;
  rawScore: number;
  weightedScore: number;
  rawMaxScore: number;
  normalizedScore: number;
  isPassed: boolean;
  referenceGrade: ReferenceGrade;
  mondaiBreakdown: {
    mondaiNumber: number;
    correct: number;
    total: number;
    weightedScore: number;
    maxScore: number;
  }[];
}

interface CalculationResult {
  level: JLPTLevel;
  totalScore: number;
  isPassed: boolean;
  sectionResults: SectionResult[];
  failureReasons?: string[];
}

interface CalculationData {
  level: JLPTLevel;
  source: string;
  userNote: string;
  mondaiScores: MondaiScoreInput[];
}

export default function CalculatorPage() {
  const [isCalculating, setIsCalculating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [result, setResult] = useState<CalculationResult | null>(null);
  const [calculationData, setCalculationData] = useState<CalculationData | null>(null);

  const handleCalculate = async (data: CalculationData) => {
    setIsCalculating(true);
    setCalculationData(data);

    try {
      const response = await fetch('/api/jlpt/calculator/calculate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const json = await response.json();

      if (!response.ok) {
        throw new Error(json.error || 'Failed to calculate');
      }

      setResult(json.results);
    } catch (error) {
      console.error('Calculate error:', error);
      alert('Gagal menghitung nilai. Silakan coba lagi.');
    } finally {
      setIsCalculating(false);
    }
  };

  const handleSave = async () => {
    if (!result || !calculationData) return;

    setIsSaving(true);

    try {
      const response = await fetch('/api/jlpt/calculator/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          level: result.level,
          source: calculationData.source,
          userNote: calculationData.userNote,
          totalScore: result.totalScore,
          isPassed: result.isPassed,
          sectionResults: result.sectionResults,
          rawInputs: calculationData.mondaiScores,
        }),
      });

      const json = await response.json();

      if (!response.ok) {
        throw new Error(json.error || 'Failed to save');
      }

      alert('Hasil berhasil disimpan!');
    } catch (error) {
      console.error('Save error:', error);
      alert('Gagal menyimpan hasil. Silakan coba lagi.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDownload = () => {
    if (!result || !calculationData) return;

    // Create CSV content
    const csvLines: string[] = [];
    csvLines.push(`Level,${result.level}`);
    if (calculationData.source) {
      csvLines.push(`Source,${calculationData.source}`);
    }
    if (calculationData.userNote) {
      csvLines.push(`Note,${calculationData.userNote}`);
    }
    csvLines.push(`Total Score,${result.totalScore}`);
    csvLines.push(`Status,${result.isPassed ? 'LULUS' : 'TIDAK LULUS'}`);
    csvLines.push('');
    csvLines.push('Section,Score,Grade,Status');

    result.sectionResults.forEach((section) => {
      csvLines.push(
        `${section.sectionType},${section.normalizedScore},${section.referenceGrade},${section.isPassed ? 'Lulus' : 'Tidak Lulus'}`
      );
    });

    csvLines.push('');
    csvLines.push('Section,Mondai,Correct,Total,Percentage');

    result.sectionResults.forEach((section) => {
      section.mondaiBreakdown.forEach((mondai) => {
        const percentage = ((mondai.correct / mondai.total) * 100).toFixed(1);
        csvLines.push(
          `${section.sectionType},${mondai.mondaiNumber},${mondai.correct},${mondai.total},${percentage}%`
        );
      });
    });

    const csvContent = csvLines.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);

    link.setAttribute('href', url);
    link.setAttribute('download', `jlpt-${result.level}-calculator-${Date.now()}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleReset = () => {
    setResult(null);
    setCalculationData(null);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-card border-b-2 border-border px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/jlpt"
              className="p-2 hover:bg-accent rounded-base transition-colors"
              aria-label="Go back"
            >
              <ChevronLeft className="w-7 h-7 text-foreground" />
            </Link>
            <h1 className="text-2xl font-bold">Kalkulator Nilai JLPT</h1>
          </div>

          <Link href="/jlpt/calculator/history">
            <Button variant="outline">
              <History className="w-4 h-4 mr-2" />
              Riwayat
            </Button>
          </Link>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {!result ? (
          <>
            <div className="mb-8 text-center">
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Hitung nilai JLPT dari hasil latihan di buku seperti Sou Matome, Kanzen Master,
                atau tes sampel resmi JLPT. Masukkan jumlah jawaban benar untuk setiap mondai.
              </p>
            </div>

            <div className="rounded-base border-2 border-border bg-card p-6 md:p-8">
              <CalculatorForm onCalculate={handleCalculate} isCalculating={isCalculating} />
            </div>

            <div className="mt-8 grid md:grid-cols-2 gap-4">
              <Link
                href="/jlpt"
                className="p-4 rounded-base border-2 border-border bg-card hover:shadow-lg transition-all text-center"
              >
                <div className="font-semibold mb-1">← Kembali ke Menu Utama</div>
                <div className="text-sm text-muted-foreground">Lihat fitur JLPT lainnya</div>
              </Link>

              <Link
                href="/jlpt/tryout"
                className="p-4 rounded-base border-2 border-primary/20 bg-primary/5 hover:shadow-lg transition-all text-center"
              >
                <div className="font-semibold mb-1">Coba Tryout Online →</div>
                <div className="text-sm text-muted-foreground">Simulasi tes JLPT lengkap</div>
              </Link>
            </div>
          </>
        ) : (
          <CalculatorResults
            level={result.level}
            totalScore={result.totalScore}
            isPassed={result.isPassed}
            sectionResults={result.sectionResults}
            source={calculationData?.source}
            userNote={calculationData?.userNote}
            failureReasons={result.failureReasons}
            onSave={handleSave}
            onDownload={handleDownload}
            onReset={handleReset}
            isSaving={isSaving}
          />
        )}
      </div>
    </div>
  );
}
