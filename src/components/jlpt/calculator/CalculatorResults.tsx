'use client';

import { SectionType, ReferenceGrade, JLPTLevel } from '@/lib/jlpt/types';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { CheckCircle2, XCircle, TrendingUp, Download, Save } from 'lucide-react';

interface SectionResult {
  sectionType: SectionType;
  rawScore: number;
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

interface CalculatorResultsProps {
  level: JLPTLevel;
  totalScore: number;
  isPassed: boolean;
  sectionResults: SectionResult[];
  source?: string;
  userNote?: string;
  failureReasons?: string[];
  onSave?: () => void;
  onDownload?: () => void;
  onReset?: () => void;
  isSaving?: boolean;
}

const SECTION_LABELS: Record<SectionType, { title: string; shortTitle: string; icon: string }> = {
  vocabulary: {
    title: '文字・語彙 (Kanji & Kosakata)',
    shortTitle: 'Kosakata',
    icon: '📝',
  },
  grammar_reading: {
    title: '文法・読解 (Tata Bahasa & Bacaan)',
    shortTitle: 'Tata Bahasa',
    icon: '📖',
  },
  listening: {
    title: '聴解 (Mendengarkan)',
    shortTitle: 'Mendengarkan',
    icon: '🎧',
  },
};

const GRADE_COLORS: Record<ReferenceGrade, string> = {
  A: 'text-green-600 bg-green-50 border-green-200',
  B: 'text-yellow-600 bg-yellow-50 border-yellow-200',
  C: 'text-red-600 bg-red-50 border-red-200',
};

export default function CalculatorResults({
  level,
  totalScore,
  isPassed,
  sectionResults,
  source,
  userNote,
  failureReasons,
  onSave,
  onDownload,
  onReset,
  isSaving = false,
}: CalculatorResultsProps) {
  return (
    <div className="space-y-6">
      {/* Header Info */}
      {(source || userNote) && (
        <Card className="p-4 bg-accent/30">
          {source && (
            <div className="text-sm">
              <span className="font-semibold">Sumber:</span>{' '}
              <span className="text-muted-foreground">{source}</span>
            </div>
          )}
          {userNote && (
            <div className="text-sm mt-1">
              <span className="font-semibold">Catatan:</span>{' '}
              <span className="text-muted-foreground">{userNote}</span>
            </div>
          )}
        </Card>
      )}

      {/* Overall Score Card */}
      <Card className="p-8 text-center">
        <div className="flex items-center justify-center gap-3 mb-4">
          {isPassed ? (
            <CheckCircle2 className="w-12 h-12 text-green-600" />
          ) : (
            <XCircle className="w-12 h-12 text-red-600" />
          )}
          <div>
            <div
              className={`text-lg font-bold ${isPassed ? 'text-green-600' : 'text-red-600'}`}
            >
              {isPassed ? 'LULUS' : 'TIDAK LULUS'}
            </div>
            <div className="text-sm text-muted-foreground">Level {level}</div>
          </div>
        </div>

        <div className="text-6xl font-bold mb-2">{totalScore.toFixed(1)}</div>
        <div className="text-lg text-muted-foreground mb-4">/ 180 Poin</div>

        {failureReasons && failureReasons.length > 0 && (
          <div className="mt-4 p-4 rounded-base bg-destructive/10 text-left">
            <div className="font-semibold text-sm mb-2">Alasan Tidak Lulus:</div>
            <ul className="space-y-1 text-sm text-muted-foreground">
              {failureReasons.map((reason, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="text-destructive mt-0.5">•</span>
                  <span>{reason}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </Card>

      {/* Section Breakdown */}
      <div className="grid md:grid-cols-3 gap-4">
        {sectionResults.map(section => {
          const label = SECTION_LABELS[section.sectionType];
          return (
            <Card key={section.sectionType} className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-2xl">{label.icon}</span>
                <div className="flex-1">
                  <div className="font-semibold text-sm">{label.shortTitle}</div>
                  <div
                    className={`text-xs ${section.isPassed ? 'text-green-600' : 'text-red-600'}`}
                  >
                    {section.isPassed ? 'Lulus' : 'Tidak Lulus'}
                  </div>
                </div>
                <div
                  className={`px-2 py-1 rounded border text-xs font-bold ${
                    GRADE_COLORS[section.referenceGrade]
                  }`}
                >
                  {section.referenceGrade}
                </div>
              </div>

              <div className="text-center">
                <div className="text-3xl font-bold mb-1">{section.normalizedScore.toFixed(1)}</div>
                <div className="text-sm text-muted-foreground">/ 60 Poin</div>
              </div>

              <div className="mt-4 pt-4 border-t text-xs text-muted-foreground">
                <div className="flex justify-between">
                  <span>Benar:</span>
                  <span className="font-semibold">
                    {section.rawScore} /{' '}
                    {section.mondaiBreakdown.reduce((sum, m) => sum + m.total, 0)}
                  </span>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Detailed Mondai Breakdown */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5" />
          Rincian Per Mondai
        </h3>

        <div className="space-y-6">
          {sectionResults.map(section => {
            const label = SECTION_LABELS[section.sectionType];
            return (
              <div key={section.sectionType}>
                <div className="flex items-center gap-2 mb-3">
                  <span>{label.icon}</span>
                  <h4 className="font-semibold text-sm">{label.shortTitle}</h4>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
                  {section.mondaiBreakdown.map(mondai => {
                    const percentage = (mondai.correct / mondai.total) * 100;
                    return (
                      <div
                        key={mondai.mondaiNumber}
                        className="p-3 rounded-base border bg-card text-center"
                      >
                        <div className="text-xs text-muted-foreground mb-1">
                          問題 {mondai.mondaiNumber}
                        </div>
                        <div className="font-semibold">
                          {mondai.correct}/{mondai.total}
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">
                          {percentage.toFixed(0)}%
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3">
        {onSave && (
          <Button onClick={onSave} disabled={isSaving} className="flex-1">
            <Save className="w-4 h-4 mr-2" />
            {isSaving ? 'Menyimpan...' : 'Simpan ke Riwayat'}
          </Button>
        )}
        {onDownload && (
          <Button onClick={onDownload} variant="outline" className="flex-1">
            <Download className="w-4 h-4 mr-2" />
            Download CSV
          </Button>
        )}
        {onReset && (
          <Button onClick={onReset} variant="outline" className="flex-1">
            Hitung Ulang
          </Button>
        )}
      </div>
    </div>
  );
}
