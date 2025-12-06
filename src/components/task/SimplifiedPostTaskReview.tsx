'use client';

import React from 'react';
import { SimplifiedAssessment } from '@/types/assessment';
import {
  Clock,
  MessageSquare,
  MessageCircle,
  CheckCircle2,
  Circle,
  Lightbulb,
  ArrowRight,
  AlertCircle,
  Play,
  Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';

interface SimplifiedPostTaskReviewProps {
  assessment: SimplifiedAssessment;
  onRetry?: () => void;
  onBackToTasks?: () => void;
  onStartRecommendedTask?: (recommendation: {
    title: string;
    category?: string;
    taskId?: string;
  }) => void;
}

export function SimplifiedPostTaskReview({
  assessment,
  onRetry,
  onBackToTasks,
  onStartRecommendedTask,
}: SimplifiedPostTaskReviewProps) {
  const [loadingRecommendation, setLoadingRecommendation] = React.useState<number | null>(null);

  const handleStartRecommendedTask = async (
    recommendation: { title: string; category?: string; taskId?: string },
    index: number
  ) => {
    if (!onStartRecommendedTask) return;
    setLoadingRecommendation(index);
    try {
      await onStartRecommendedTask(recommendation);
    } finally {
      setLoadingRecommendation(null);
    }
  };

  // Format duration
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins} menit ${secs} detik`;
  };

  // Format date
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  const completedObjectives = assessment.objectives.filter(obj => obj.achieved);
  const incompleteObjectives = assessment.objectives.filter(obj => !obj.achieved);

  return (
    <div className="min-h-screen bg-background py-8 px-4 sm:px-6">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Header - Neobrutalism style */}
        <header className="text-center pb-6 border-b-3 border-border">
          <div className="inline-block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3 bg-secondary px-3 py-1 border-2 border-border rounded-base shadow-shadow">
            Feedback Percakapan
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">
            {assessment.taskTitle || assessment.scenarioName}
          </h1>
          <div className="flex flex-wrap justify-center gap-4 sm:gap-6 mt-4 text-sm text-muted-foreground">
            <div className="bg-card px-3 py-1 border-2 border-border rounded-base">
              Level: <span className="font-bold text-foreground">{assessment.difficulty}</span>
            </div>
            <div className="flex items-center gap-1 bg-card px-3 py-1 border-2 border-border rounded-base">
              <Clock className="h-4 w-4" />
              <span className="font-bold text-foreground">
                {formatDuration(assessment.statistics.duration)}
              </span>
            </div>
            <div className="bg-card px-3 py-1 border-2 border-border rounded-base">
              <span className="font-bold text-foreground">
                {formatDate(assessment.assessmentDate)}
              </span>
            </div>
          </div>
        </header>

        {/* Section: Objektif - Neobrutalism Card */}
        <section className="bg-[var(--card-vocabulary)] border-3 border-border rounded-base shadow-shadow p-6">
          <h2 className="text-lg font-bold text-foreground mb-4 pb-3 border-b-2 border-border flex items-center gap-2">
            <span className="bg-[var(--tertiary-green)] text-white p-1.5 rounded-base border-2 border-border">
              <CheckCircle2 className="h-5 w-5" />
            </span>
            Objektif Percakapan
          </h2>

          {/* Summary */}
          <div className="flex items-center gap-3 mb-4 p-3 bg-white/50 border-2 border-border rounded-base">
            <div className="text-2xl font-bold text-foreground">
              {assessment.objectivesAchieved}/{assessment.totalObjectives}
            </div>
            <div className="text-sm text-muted-foreground">objektif tercapai</div>
          </div>

          {/* Completed Objectives */}
          {completedObjectives.length > 0 && (
            <div className="space-y-3 mb-4">
              {completedObjectives.map((objective, index) => (
                <div
                  key={index}
                  className="bg-white border-2 border-border rounded-base p-4 shadow-xs"
                >
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-[var(--tertiary-green)] shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p className="font-medium text-foreground text-sm">{objective.text}</p>
                      {objective.feedback && (
                        <p className="text-muted-foreground text-xs mt-2 pl-2 border-l-2 border-[var(--tertiary-green)]">
                          {objective.feedback}
                          {objective.exampleJp && (
                            <span className="block mt-1 font-japanese text-foreground">
                              「{objective.exampleJp}」
                            </span>
                          )}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Incomplete Objectives with Suggestions */}
          {incompleteObjectives.length > 0 && (
            <div className="space-y-3">
              <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground mt-4 mb-2">
                Belum Tercapai
              </div>
              {incompleteObjectives.map((objective, index) => (
                <div
                  key={index}
                  className="bg-white/70 border-2 border-dashed border-border rounded-base p-4"
                >
                  <div className="flex items-start gap-3">
                    <Circle className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p className="font-medium text-muted-foreground text-sm">{objective.text}</p>
                      {objective.suggestion && (
                        <div className="mt-2 p-2 bg-[var(--card-kanji-back)] border-2 border-border rounded-base">
                          <div className="flex items-start gap-2">
                            <AlertCircle className="h-4 w-4 text-[var(--accent-orange,#c05621)] shrink-0 mt-0.5" />
                            <p className="text-xs text-foreground">{objective.suggestion}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Section: Perbaikan Bahasa - Neobrutalism */}
        {assessment.corrections && assessment.corrections.length > 0 && (
          <section className="bg-card border-3 border-border rounded-base shadow-shadow p-6">
            <h2 className="text-lg font-bold text-foreground mb-4 pb-3 border-b-2 border-border">
              Perbaikan Bahasa
            </h2>

            {/* Correction Table */}
            <div className="overflow-x-auto mb-6">
              <table className="w-full text-sm border-2 border-border rounded-base overflow-hidden">
                <thead>
                  <tr className="bg-foreground text-background">
                    <th className="px-4 py-3 text-left font-bold">Kamu bilang</th>
                    <th className="px-4 py-3 text-left font-bold">Seharusnya</th>
                    <th className="px-4 py-3 text-left font-bold">Penjelasan</th>
                  </tr>
                </thead>
                <tbody>
                  {assessment.corrections.map((correction, index) => (
                    <tr
                      key={index}
                      className={cn('border-t-2 border-border', index % 2 === 1 && 'bg-muted/30')}
                    >
                      <td className="px-4 py-3 text-destructive font-medium font-japanese">
                        {correction.error}
                      </td>
                      <td className="px-4 py-3 text-[var(--tertiary-green)] font-medium font-japanese">
                        {correction.correct}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground text-xs">
                        {correction.explanation}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Grammar Point Box - Poin Penting */}
            {assessment.grammarPoint && (
              <div className="bg-[var(--card-grammar-back)] border-3 border-border rounded-base p-5">
                <div className="text-sm font-bold text-foreground mb-3 flex items-center gap-2">
                  <span className="bg-[var(--card-grammar)] p-1 rounded-base border-2 border-border">
                    <Lightbulb className="h-4 w-4" />
                  </span>
                  Poin Penting: {assessment.grammarPoint.title}
                </div>
                <p className="text-sm text-muted-foreground mb-3">
                  {assessment.grammarPoint.explanation}
                </p>
                {assessment.grammarPoint.examples &&
                  assessment.grammarPoint.examples.length > 0 && (
                    <div className="bg-white border-2 border-border rounded-base p-4 space-y-2">
                      {assessment.grammarPoint.examples.map((example, index) => (
                        <div key={index} className="text-sm">
                          <code className="font-japanese text-foreground font-medium">
                            {example.japanese}
                          </code>
                          <span className="text-muted-foreground"> = {example.meaning}</span>
                        </div>
                      ))}
                    </div>
                  )}
              </div>
            )}
          </section>
        )}

        {/* Section: Tips Berbicara Lebih Natural - Neobrutalism */}
        {assessment.tips && assessment.tips.length > 0 && (
          <section className="bg-[var(--card-kanji)] border-3 border-border rounded-base shadow-shadow p-6">
            <h2 className="text-lg font-bold text-foreground mb-4 pb-3 border-b-2 border-border flex items-center gap-2">
              <span className="bg-white p-1.5 rounded-base border-2 border-border">
                <Lightbulb className="h-5 w-5" />
              </span>
              Tips Berbicara Lebih Natural
            </h2>
            <div className="space-y-4">
              {assessment.tips.map((tip, index) => (
                <div key={index} className="bg-white border-2 border-border rounded-base p-4">
                  <div className="text-xs font-bold text-muted-foreground mb-2 uppercase tracking-wide">
                    Situasi: {tip.situation}
                  </div>
                  <div className="inline-block bg-[var(--card-kanji-back)] border-2 border-border rounded-base px-4 py-2 font-japanese text-foreground font-medium">
                    {tip.expression}
                  </div>
                  {tip.note && <p className="mt-2 text-xs text-muted-foreground">{tip.note}</p>}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Section: Poin Penting Percakapan - Neobrutalism */}
        {assessment.conversationHighlights && assessment.conversationHighlights.length > 0 && (
          <section className="bg-[var(--card-katakana)] border-3 border-border rounded-base shadow-shadow p-6">
            <h2 className="text-lg font-bold text-foreground mb-4 pb-3 border-b-2 border-border flex items-center gap-2">
              <span className="bg-white p-1.5 rounded-base border-2 border-border">
                <MessageCircle className="h-5 w-5" />
              </span>
              Poin Penting Percakapan
            </h2>
            <div className="space-y-4">
              {assessment.conversationHighlights.map((highlight, index) => (
                <div key={index} className="bg-white border-2 border-border rounded-base p-4">
                  {/* Conversation exchanges */}
                  <div className="space-y-2 mb-3">
                    {highlight.exchanges.map((exchange, exIndex) => (
                      <div
                        key={exIndex}
                        className={cn(
                          'p-2 rounded-base border-2 border-border',
                          exchange.speaker === 'user'
                            ? 'bg-[var(--card-katakana-back)] ml-4'
                            : 'bg-muted mr-4'
                        )}
                      >
                        <div className="text-xs font-bold text-muted-foreground mb-1 uppercase">
                          {exchange.speaker === 'user' ? 'Kamu' : 'Partner'}
                        </div>
                        <p className="font-japanese text-foreground text-sm">{exchange.text}</p>
                      </div>
                    ))}
                  </div>
                  {/* Note/explanation */}
                  <div className="pl-3 border-l-3 border-[var(--card-katakana)]">
                    <p className="text-sm text-muted-foreground">{highlight.note}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Section: Rekomendasi Tema Percakapan - Neobrutalism (Moved to bottom) */}
        {assessment.taskRecommendations && assessment.taskRecommendations.length > 0 && (
          <section className="bg-[var(--card-hiragana)] border-3 border-border rounded-base shadow-shadow p-6">
            <h2 className="text-lg font-bold text-foreground mb-4 pb-3 border-b-2 border-border flex items-center gap-2">
              <span className="bg-white p-1.5 rounded-base border-2 border-border">
                <ArrowRight className="h-5 w-5" />
              </span>
              Rekomendasi Tema Percakapan Selanjutnya
            </h2>
            <div className="space-y-3">
              {assessment.taskRecommendations.map((rec, index) => (
                <div
                  key={index}
                  className="bg-white border-2 border-border rounded-base p-4 flex items-start gap-3"
                >
                  <span className="shrink-0 w-8 h-8 rounded-base bg-primary text-primary-foreground text-sm font-bold flex items-center justify-center border-2 border-border">
                    {index + 1}
                  </span>
                  <div className="flex-1">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-bold text-foreground">{rec.title}</p>
                        <p className="text-sm text-muted-foreground mt-1">{rec.reason}</p>
                        {rec.category && (
                          <span className="inline-block mt-2 text-xs bg-secondary px-2 py-0.5 rounded-base border border-border">
                            {rec.category}
                          </span>
                        )}
                      </div>
                      {onStartRecommendedTask && (
                        <Button
                          onClick={() =>
                            handleStartRecommendedTask(
                              { title: rec.title, category: rec.category, taskId: rec.taskId },
                              index
                            )
                          }
                          size="sm"
                          className="shrink-0 gap-1.5"
                          disabled={loadingRecommendation !== null}
                        >
                          {loadingRecommendation === index ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <Play className="h-3.5 w-3.5" />
                          )}
                          {loadingRecommendation === index ? 'Memulai...' : 'Mulai'}
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Statistics Summary - Neobrutalism */}
        <div className="flex flex-wrap justify-center gap-4 py-4">
          <div className="flex items-center gap-2 bg-card px-4 py-2 border-2 border-border rounded-base text-sm">
            <MessageSquare className="h-4 w-4 text-primary" />
            <span className="font-bold">{assessment.statistics.totalMessages}</span>
            <span className="text-muted-foreground">pesan</span>
          </div>
          <div className="flex items-center gap-2 bg-card px-4 py-2 border-2 border-border rounded-base text-sm">
            <CheckCircle2 className="h-4 w-4 text-[var(--tertiary-green)]" />
            <span className="font-bold">
              {assessment.objectivesAchieved}/{assessment.totalObjectives}
            </span>
            <span className="text-muted-foreground">objektif</span>
          </div>
        </div>

        {/* Action Buttons - Neobrutalism */}
        <div className="flex gap-4 justify-center pt-4 pb-8">
          {onRetry && (
            <Button
              onClick={onRetry}
              variant="noShadow"
              size="lg"
              className="border-2 border-border"
            >
              Coba Lagi
            </Button>
          )}
          {onBackToTasks && (
            <Button onClick={onBackToTasks} size="lg">
              Kembali ke Daftar Task
            </Button>
          )}
        </div>

        {/* Footer */}
        <footer className="text-center py-6 text-muted-foreground text-xs">
          <span className="font-bold text-foreground/70">Gengotalk</span> · AI-Powered Japanese
          Conversation Learning
        </footer>
      </div>
    </div>
  );
}
