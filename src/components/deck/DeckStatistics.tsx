'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { LoadingState } from '@/components/ui/LoadingState';
import { UI_TEXT } from '@/lib/constants/ui-text';
import { Layers, Clock, Check, X, BookOpen, RefreshCw } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

interface DeckStatsData {
  deckId: string;
  deckName: string;
  overall: {
    totalSessions: number;
    totalCardsReviewed: number;
    totalStudyTime: number; // in minutes
    studyStreak: number;
    masteredPercentage: number; // percentage of cards marked as "hafal"
    notMasteredPercentage: number; // percentage of cards marked as "belum_hafal"
    // Unique card stats
    totalCardsInDeck: number;
    uniqueHafal: number;
    uniqueBelumHafal: number;
    uniqueReviewedCards: number;
    notReviewedCards: number;
  };
  recentSessions: Array<{
    id: string;
    startTime: string;
    endTime: string;
    cardsReviewed: number;
    hafalCount: number;
    belumHafalCount: number;
    accuracy: number;
  }>;
}

interface DeckStatisticsProps {
  deckId: string;
}

export default function DeckStatistics({ deckId }: DeckStatisticsProps) {
  const [stats, setStats] = useState<DeckStatsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDeckStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [deckId]);

  const fetchDeckStats = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/decks/${deckId}/stats`);
      if (!response.ok) throw new Error('Failed to fetch deck statistics');

      const data = await response.json();
      setStats(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[300px]">
        <LoadingState type="spinner" size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <Card className="p-6 text-center">
        <p className="text-primary mb-4">{error}</p>
        <button
          onClick={fetchDeckStats}
          className="inline-flex items-center gap-2 px-4 py-2 bg-secondary text-white rounded-base border-2 border-border hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none transition-all"
        >
          <RefreshCw className="w-4 h-4" />
          Coba Lagi
        </button>
      </Card>
    );
  }

  if (!stats) return null;

  const formatTime = (minutes: number) => {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  };

  return (
    <div className="space-y-6">
      {/* Pie Chart - Outside container */}
      <div className="flex items-center justify-center">
        <div className="w-44 h-44 relative">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Tooltip
                wrapperStyle={{ zIndex: 100 }}
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="bg-background border-2 border-border rounded-base px-3 py-2 shadow-shadow">
                        <p className="font-medium text-foreground">{payload[0].name}</p>
                        <p className="text-sm text-muted-foreground">
                          {data.count} kartu ({payload[0].value}%)
                        </p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Pie
                data={[
                  {
                    name: 'Hafal',
                    value: stats.overall.masteredPercentage || 0,
                    count: stats.overall.uniqueHafal || 0,
                  },
                  {
                    name: 'Belum Hafal',
                    value: stats.overall.notMasteredPercentage || 0,
                    count: stats.overall.uniqueBelumHafal || 0,
                  },
                ]}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={80}
                paddingAngle={2}
                dataKey="value"
                strokeWidth={2}
                stroke="var(--border)"
              >
                <Cell fill="var(--chart-3)" />
                <Cell fill="var(--primary)" />
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          {/* Center Text */}
          <div
            className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none"
            style={{ zIndex: 1 }}
          >
            <span className="text-xs text-muted-foreground">Hafal</span>
            <span className="text-2xl font-bold text-foreground">
              {stats.overall.masteredPercentage}%
            </span>
          </div>
        </div>
      </div>

      {/* Statistik Per Deck - Total Kartu & Waktu Belajar */}
      <div className="grid grid-cols-2 gap-4">
        {/* Total Kartu */}
        <Card className="p-4 hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none transition-all">
          <div className="flex flex-col items-center text-center">
            <div className="w-12 h-12 rounded-base border-2 border-border bg-secondary flex items-center justify-center mb-2">
              <Layers className="w-6 h-6 text-white" />
            </div>
            <div className="text-2xl font-bold text-foreground mb-1">
              {stats.overall.totalCardsInDeck || 0}
            </div>
            <div className="text-sm text-muted-foreground">Total Kartu</div>
          </div>
        </Card>

        {/* Waktu Belajar */}
        <Card className="p-4 hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none transition-all">
          <div className="flex flex-col items-center text-center">
            <div className="w-12 h-12 rounded-base border-2 border-border bg-chart-5 flex items-center justify-center mb-2">
              <Clock className="w-6 h-6 text-white" />
            </div>
            <div className="text-2xl font-bold text-foreground mb-1">
              {formatTime(stats.overall.totalStudyTime)}
            </div>
            <div className="text-sm text-muted-foreground">{UI_TEXT.deckStats.studyTime}</div>
          </div>
        </Card>
      </div>

      {/* Recent Sessions */}
      {stats.recentSessions.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-foreground mb-4">Sesi Terakhir</h2>
          <div className="space-y-3">
            {stats.recentSessions.slice(0, 3).map(session => {
              const sessionDate = new Date(session.endTime);
              const duration = session.endTime
                ? Math.floor(
                    (new Date(session.endTime).getTime() - new Date(session.startTime).getTime()) /
                      1000 /
                      60
                  )
                : 0;

              return (
                <Card
                  key={session.id}
                  className="p-4 hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none transition-all"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-base border-2 border-border bg-secondary flex items-center justify-center">
                          <BookOpen className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <p className="font-medium text-foreground">{stats.deckName}</p>
                          <p className="text-sm text-muted-foreground">
                            {sessionDate.toLocaleDateString('id-ID', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                            })}{' '}
                            •{' '}
                            {sessionDate.toLocaleTimeString('id-ID', {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 text-sm">
                        <div className="flex items-center gap-1">
                          <Check className="w-4 h-4 text-chart-3" />
                          <span className="text-foreground">{session.hafalCount}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <X className="w-4 h-4 text-primary" />
                          <span className="text-foreground">{session.belumHafalCount}</span>
                        </div>
                        <div className="text-muted-foreground">•</div>
                        <div className="text-foreground">
                          {duration > 0 ? `${duration}m` : 'Just now'}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div
                        className={`text-2xl font-bold ${
                          session.accuracy >= 80
                            ? 'text-tertiary-green'
                            : session.accuracy >= 60
                              ? 'text-tertiary-yellow'
                              : 'text-primary'
                        }`}
                      >
                        {session.accuracy}%
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {session.cardsReviewed} kartu
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
