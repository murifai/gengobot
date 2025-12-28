'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ChevronLeft, Trash2, Download, TrendingUp, Calendar, FileText } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { JLPTLevel, ReferenceGrade } from '@/lib/jlpt/types';

interface HistoryItem {
  id: string;
  level: JLPTLevel;
  source?: string;
  userNote?: string;
  totalScore: number;
  isPassed: boolean;
  createdAt: string;
  sectionScores: {
    sectionType: string;
    normalizedScore: number;
    isPassed: boolean;
    referenceGrade: ReferenceGrade;
  }[];
}

const LEVEL_OPTIONS = ['All', 'N5', 'N4', 'N3', 'N2', 'N1'];

const SECTION_LABELS: Record<string, string> = {
  vocabulary: 'Kosakata',
  grammar_reading: 'Tata Bahasa',
  listening: 'Mendengarkan',
};

export default function CalculatorHistoryPage() {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [filteredHistory, setFilteredHistory] = useState<HistoryItem[]>([]);
  const [levelFilter, setLevelFilter] = useState<string>('All');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchHistory();
  }, []);

  useEffect(() => {
    if (levelFilter === 'All') {
      setFilteredHistory(history);
    } else {
      setFilteredHistory(history.filter(item => item.level === levelFilter));
    }
  }, [levelFilter, history]);

  const fetchHistory = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/jlpt/calculator/history');
      const json = await response.json();

      if (response.ok) {
        setHistory(json.history);
      } else {
        console.error('Failed to fetch history:', json.error);
      }
    } catch (error) {
      console.error('Fetch history error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Yakin ingin menghapus hasil ini?')) {
      return;
    }

    try {
      const response = await fetch(`/api/jlpt/calculator/history?id=${id}`, {
        method: 'DELETE',
      });

      const json = await response.json();

      if (response.ok) {
        setHistory(prev => prev.filter(item => item.id !== id));
        alert('Hasil berhasil dihapus');
      } else {
        throw new Error(json.error);
      }
    } catch (error) {
      console.error('Delete error:', error);
      alert('Gagal menghapus hasil');
    }
  };

  const handleExportCSV = () => {
    if (filteredHistory.length === 0) return;

    const csvLines: string[] = [];
    csvLines.push('Date,Level,Source,Total Score,Status,Vocab Score,Grammar Score,Listening Score');

    filteredHistory.forEach(item => {
      const vocabScore =
        item.sectionScores.find(s => s.sectionType === 'vocabulary')?.normalizedScore || 0;
      const grammarScore =
        item.sectionScores.find(s => s.sectionType === 'grammar_reading')?.normalizedScore || 0;
      const listeningScore =
        item.sectionScores.find(s => s.sectionType === 'listening')?.normalizedScore || 0;

      csvLines.push(
        `${new Date(item.createdAt).toLocaleDateString()},${item.level},"${item.source || ''}",${item.totalScore},${item.isPassed ? 'LULUS' : 'TIDAK LULUS'},${vocabScore},${grammarScore},${listeningScore}`
      );
    });

    const csvContent = csvLines.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);

    link.setAttribute('href', url);
    link.setAttribute('download', `jlpt-calculator-history-${Date.now()}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-card border-b-2 border-border px-4 py-4">
        <div className="flex items-center gap-4">
          <Link
            href="/jlpt/calculator"
            className="p-2 hover:bg-accent rounded-base transition-colors"
            aria-label="Go back"
          >
            <ChevronLeft className="w-7 h-7 text-foreground" />
          </Link>
          <h1 className="text-2xl font-bold">Riwayat Kalkulator</h1>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Filters and Actions */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <Select value={levelFilter} onValueChange={setLevelFilter}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Filter Level" />
            </SelectTrigger>
            <SelectContent>
              {LEVEL_OPTIONS.map(level => (
                <SelectItem key={level} value={level}>
                  {level === 'All' ? 'Semua Level' : level}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button
            onClick={handleExportCSV}
            variant="outline"
            disabled={filteredHistory.length === 0}
            className="sm:ml-auto"
          >
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
        </div>

        {/* Stats Summary */}
        {filteredHistory.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <Card className="p-4">
              <div className="text-sm text-muted-foreground mb-1">Total Perhitungan</div>
              <div className="text-2xl font-bold">{filteredHistory.length}</div>
            </Card>

            <Card className="p-4">
              <div className="text-sm text-muted-foreground mb-1">Rata-rata Nilai</div>
              <div className="text-2xl font-bold">
                {(
                  filteredHistory.reduce((sum, item) => sum + item.totalScore, 0) /
                  filteredHistory.length
                ).toFixed(1)}
              </div>
            </Card>

            <Card className="p-4">
              <div className="text-sm text-muted-foreground mb-1">Lulus</div>
              <div className="text-2xl font-bold text-green-600">
                {filteredHistory.filter(item => item.isPassed).length}
              </div>
            </Card>

            <Card className="p-4">
              <div className="text-sm text-muted-foreground mb-1">Tidak Lulus</div>
              <div className="text-2xl font-bold text-red-600">
                {filteredHistory.filter(item => !item.isPassed).length}
              </div>
            </Card>
          </div>
        )}

        {/* History List */}
        {isLoading ? (
          <div className="text-center py-12">
            <div className="text-muted-foreground">Memuat riwayat...</div>
          </div>
        ) : filteredHistory.length === 0 ? (
          <Card className="p-12 text-center">
            <div className="text-6xl mb-4">📊</div>
            <h3 className="text-xl font-bold mb-2">Belum Ada Riwayat</h3>
            <p className="text-muted-foreground mb-6">
              Riwayat perhitungan kamu akan muncul di sini
            </p>
            <Link href="/jlpt/calculator">
              <Button>Mulai Hitung Nilai</Button>
            </Link>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredHistory.map(item => (
              <Card key={item.id} className="p-6">
                <div className="flex flex-col md:flex-row md:items-center gap-4">
                  {/* Date and Level */}
                  <div className="flex-shrink-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Calendar className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">
                        {new Date(item.createdAt).toLocaleDateString('id-ID', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </span>
                    </div>
                    <div className="text-lg font-bold">Level {item.level}</div>
                    {item.source && (
                      <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                        <FileText className="w-3 h-3" />
                        {item.source}
                      </div>
                    )}
                  </div>

                  {/* Score */}
                  <div className="flex-shrink-0 text-center md:mx-8">
                    <div className="text-3xl font-bold">{item.totalScore.toFixed(1)}</div>
                    <div className="text-sm text-muted-foreground">/ 180</div>
                    <div
                      className={`text-sm font-semibold mt-1 ${item.isPassed ? 'text-green-600' : 'text-red-600'}`}
                    >
                      {item.isPassed ? 'LULUS' : 'TIDAK LULUS'}
                    </div>
                  </div>

                  {/* Section Scores */}
                  <div className="flex-1 grid grid-cols-3 gap-4">
                    {item.sectionScores.map(section => (
                      <div key={section.sectionType} className="text-center">
                        <div className="text-xs text-muted-foreground mb-1">
                          {SECTION_LABELS[section.sectionType]}
                        </div>
                        <div className="font-bold">{section.normalizedScore.toFixed(1)}</div>
                        <div
                          className={`text-xs ${section.isPassed ? 'text-green-600' : 'text-red-600'}`}
                        >
                          {section.referenceGrade}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Actions */}
                  <div className="flex-shrink-0">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(item.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {item.userNote && (
                  <div className="mt-4 pt-4 border-t text-sm text-muted-foreground">
                    <span className="font-semibold">Catatan:</span> {item.userNote}
                  </div>
                )}
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
