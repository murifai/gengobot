'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { LoadingState } from '@/components/ui/LoadingState';

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
        <p className="text-primary">{error}</p>
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
      {/* Statistik Per Deck */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Study Streak */}
        <Card className="p-4 hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none transition-all">
          <div className="flex flex-col items-center text-center">
            <div className="w-12 h-12 rounded-base border-2 border-border bg-orange-100 flex items-center justify-center mb-2">
              <svg
                className="w-6 h-6 text-orange-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9.879 16.121A3 3 0 1012.015 11L11 14H9c0 .768.293 1.536.879 2.121z"
                />
              </svg>
            </div>
            <div className="text-2xl font-bold text-foreground mb-1">
              {stats.overall.studyStreak}
            </div>
            <div className="text-sm text-muted-foreground">Study Streak</div>
            <div className="text-xs text-muted-foreground mt-1">hari</div>
          </div>
        </Card>

        {/* Cards Reviewed */}
        <Card className="p-4 hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none transition-all">
          <div className="flex flex-col items-center text-center">
            <div className="w-12 h-12 rounded-base border-2 border-border bg-secondary/20 flex items-center justify-center mb-2">
              <svg
                className="w-6 h-6 text-secondary"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                />
              </svg>
            </div>
            <div className="text-2xl font-bold text-foreground mb-1">
              {stats.overall.totalCardsReviewed}
            </div>
            <div className="text-sm text-muted-foreground">Kartu Dipelajari</div>
            <div className="text-xs text-muted-foreground mt-1">kartu</div>
          </div>
        </Card>

        {/* Mastered Percentage */}
        <Card className="p-4 hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none transition-all">
          <div className="flex flex-col items-center text-center">
            <div className="w-12 h-12 rounded-base border-2 border-border bg-tertiary-green/20 flex items-center justify-center mb-2">
              <svg
                className="w-6 h-6 text-tertiary-green"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <div className="text-2xl font-bold text-tertiary-green mb-1">
              {stats.overall.masteredPercentage}%
            </div>
            <div className="text-sm text-muted-foreground">Kartu Hafal</div>
            <div className="text-xs text-muted-foreground mt-1">dari total</div>
          </div>
        </Card>

        {/* Study Time */}
        <Card className="p-4 hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none transition-all">
          <div className="flex flex-col items-center text-center">
            <div className="w-12 h-12 rounded-base border-2 border-border bg-tertiary-purple/20 flex items-center justify-center mb-2">
              <svg
                className="w-6 h-6 text-tertiary-purple"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <div className="text-2xl font-bold text-foreground mb-1">
              {formatTime(stats.overall.totalStudyTime)}
            </div>
            <div className="text-sm text-muted-foreground">Study Time</div>
            <div className="text-xs text-muted-foreground mt-1">
              {stats.overall.totalSessions} sesi
            </div>
          </div>
        </Card>
      </div>

      {/* Progress Deck */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold text-foreground mb-4">Progress Deck</h2>
        <div className="space-y-4">
          {/* Mastered Cards */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <div className="flex items-center gap-2">
                <svg
                  className="w-5 h-5 text-tertiary-green"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                <span className="font-medium text-foreground">Hafal</span>
              </div>
              <span className="text-lg font-semibold text-tertiary-green">
                {stats.overall.masteredPercentage}%
              </span>
            </div>
            <div className="w-full bg-secondary-background rounded-base h-3 overflow-hidden border-2 border-border">
              <div
                className="bg-tertiary-green h-full transition-all duration-500 ease-out"
                style={{ width: `${stats.overall.masteredPercentage}%` }}
              />
            </div>
          </div>

          {/* Not Mastered Cards */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <div className="flex items-center gap-2">
                <svg
                  className="w-5 h-5 text-primary"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
                <span className="font-medium text-foreground">Belum Hafal</span>
              </div>
              <span className="text-lg font-semibold text-primary">
                {stats.overall.notMasteredPercentage}%
              </span>
            </div>
            <div className="w-full bg-secondary-background rounded-base h-3 overflow-hidden border-2 border-border">
              <div
                className="bg-primary h-full transition-all duration-500 ease-out"
                style={{ width: `${stats.overall.notMasteredPercentage}%` }}
              />
            </div>
          </div>
        </div>
      </Card>

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
                        <div className="w-10 h-10 rounded-base border-2 border-border bg-secondary/20 flex items-center justify-center">
                          <svg
                            className="w-5 h-5 text-secondary"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                            />
                          </svg>
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
                          <svg
                            className="w-4 h-4 text-tertiary-green"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                          <span className="text-foreground">{session.hafalCount}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <svg
                            className="w-4 h-4 text-primary"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M6 18L18 6M6 6l12 12"
                            />
                          </svg>
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
