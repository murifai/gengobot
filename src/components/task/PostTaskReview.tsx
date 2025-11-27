'use client';

import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

interface VocabularyUsage {
  word: string;
  reading?: string;
  meaning: string;
  used: boolean;
  timesUsed?: number;
}

interface PostTaskReviewProps {
  vocabularyUsed: VocabularyUsage[];
  missedOpportunities: VocabularyUsage[];
  newWordsEncountered: string[];
  onAddToReviewQueue: (words: string[]) => void;
  onContinue: () => void;
}

export default function PostTaskReview({
  vocabularyUsed,
  missedOpportunities,
  newWordsEncountered,
  onAddToReviewQueue,
  onContinue,
}: PostTaskReviewProps) {
  const handleAddAllToQueue = () => {
    const wordsToAdd = [...missedOpportunities.map(v => v.word), ...newWordsEncountered];
    onAddToReviewQueue(wordsToAdd);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-foreground mb-2">Review Kosakata</h2>
        <p className="text-muted-foreground">Lihat penggunaan kosakata dan performamu</p>
      </div>

      {/* Vocabulary Used Successfully */}
      {vocabularyUsed.length > 0 && (
        <Card className="p-4">
          <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
            <span className="text-tertiary-green">✓</span>
            Kosakata yang Digunakan ({vocabularyUsed.length})
          </h3>
          <div className="space-y-2">
            {vocabularyUsed.map((vocab, idx) => (
              <div
                key={idx}
                className="p-3 bg-tertiary-green/10 rounded-lg border-l-4 border-tertiary-green"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-baseline gap-2">
                      <span className="font-bold text-foreground">{vocab.word}</span>
                      {vocab.reading && (
                        <span className="text-sm text-muted-foreground">{vocab.reading}</span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">{vocab.meaning}</p>
                  </div>
                  {vocab.timesUsed && vocab.timesUsed > 1 && (
                    <span className="text-xs bg-tertiary-green/10 text-tertiary-green px-2 py-1 rounded">
                      Digunakan {vocab.timesUsed}x
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Missed Opportunities */}
      {missedOpportunities.length > 0 && (
        <Card className="p-4">
          <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
            <span className="text-tertiary-yellow">⚠</span>
            Kesempatan yang Terlewat ({missedOpportunities.length})
          </h3>
          <p className="text-sm text-muted-foreground mb-3">
            Kata-kata ini dari deck studimu bisa digunakan dalam percakapan:
          </p>
          <div className="space-y-2">
            {missedOpportunities.map((vocab, idx) => (
              <div
                key={idx}
                className="p-3 bg-tertiary-yellow/10 rounded-lg border-l-4 border-tertiary-yellow"
              >
                <div className="flex items-baseline gap-2">
                  <span className="font-bold text-foreground">{vocab.word}</span>
                  {vocab.reading && (
                    <span className="text-sm text-muted-foreground">{vocab.reading}</span>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">{vocab.meaning}</p>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* New Words Encountered */}
      {newWordsEncountered.length > 0 && (
        <Card className="p-4">
          <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
            <span className="text-secondary">+</span>
            Kata Baru yang Ditemui ({newWordsEncountered.length})
          </h3>
          <p className="text-sm text-muted-foreground mb-3">
            Tambahkan kata-kata ini ke daftar review untuk latihan selanjutnya:
          </p>
          <div className="flex flex-wrap gap-2">
            {newWordsEncountered.map((word, idx) => (
              <span
                key={idx}
                className="px-3 py-1 bg-secondary/10 text-secondary rounded-full text-sm"
              >
                {word}
              </span>
            ))}
          </div>
        </Card>
      )}

      {/* Summary Stats */}
      <Card className="p-4 bg-secondary-background">
        <h3 className="font-semibold text-foreground mb-3">Ringkasan Performa Kosakata</h3>
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-tertiary-green">{vocabularyUsed.length}</div>
            <div className="text-xs text-muted-foreground">Digunakan</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-tertiary-yellow">
              {missedOpportunities.length}
            </div>
            <div className="text-xs text-muted-foreground">Terlewat</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-secondary">{newWordsEncountered.length}</div>
            <div className="text-xs text-muted-foreground">Kata Baru</div>
          </div>
        </div>
      </Card>

      {/* Action Buttons */}
      <div className="flex gap-4">
        {(missedOpportunities.length > 0 || newWordsEncountered.length > 0) && (
          <Button onClick={handleAddAllToQueue} variant="secondary" className="flex-1">
            Tambahkan ke Daftar Review
          </Button>
        )}
        <Button onClick={onContinue} className="flex-1">
          Lanjutkan
        </Button>
      </div>
    </div>
  );
}
