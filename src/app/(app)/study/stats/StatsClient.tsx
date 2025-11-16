'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { LoadingState } from '@/components/ui/LoadingState';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

interface StudyStats {
  overview: {
    totalSessions: number;
    totalCardsReviewed: number;
    totalCardsCorrect: number;
    overallAccuracy: number;
    totalStudyTime: number;
    cardsDueToday: number;
    studyStreak: number;
  };
  ratingDistribution: {
    belumHafal: number;
    hafal: number;
  };
  recentSessions: Array<{
    id: string;
    deckName: string;
    startTime: string;
    endTime: string;
    cardsReviewed: number;
    cardsCorrect: number;
    accuracy: number;
  }>;
}

export function StatsClient() {
  const [stats, setStats] = useState<StudyStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/study-sessions/stats');
      if (!response.ok) throw new Error('Failed to fetch statistics');

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
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center min-h-[400px]">
          <LoadingState type="spinner" size="lg" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="p-6 text-center">
          <p className="text-primary mb-4">{error}</p>
          <Button onClick={fetchStats}>Try Again</Button>
        </Card>
      </div>
    );
  }

  if (!stats) return null;

  const totalRatings = stats.ratingDistribution.belumHafal + stats.ratingDistribution.hafal;
  const formatTime = (minutes: number) => {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Statistik Belajar
          </h1>
          <p className="text-gray-600 dark:text-gray-400">Lihat progress belajarmu</p>
        </div>
        <Link href="/study">
          <Button variant="secondary">Kembali</Button>
        </Link>
      </div>

      {/* Statistik Per Deck - 4 Cards Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {/* Study Streak */}
        <Card className="p-4 hover:shadow-lg transition-shadow">
          <div className="flex flex-col items-center text-center">
            <svg
              className="w-8 h-8 mb-2 text-orange-500"
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
            <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
              {stats.overview.studyStreak}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Study Streak</div>
            <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">hari</div>
          </div>
        </Card>

        {/* Kartu Dipelajari */}
        <Card className="p-4 hover:shadow-lg transition-shadow">
          <div className="flex flex-col items-center text-center">
            <svg
              className="w-8 h-8 mb-2 text-blue-500"
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
            <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
              {stats.overview.totalCardsReviewed}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Kartu Dipelajari</div>
            <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">kartu</div>
          </div>
        </Card>

        {/* Persentase Hafal */}
        <Card className="p-4 hover:shadow-lg transition-shadow">
          <div className="flex flex-col items-center text-center">
            <svg
              className="w-8 h-8 mb-2 text-green-500"
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
            <div className="text-2xl font-bold text-tertiary-green mb-1">
              {totalRatings > 0
                ? Math.round((stats.ratingDistribution.hafal / totalRatings) * 100)
                : 0}
              %
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Kartu Hafal</div>
            <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">dari total</div>
          </div>
        </Card>

        {/* Study Time */}
        <Card className="p-4 hover:shadow-lg transition-shadow">
          <div className="flex flex-col items-center text-center">
            <svg
              className="w-8 h-8 mb-2 text-purple-500"
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
            <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
              {formatTime(stats.overview.totalStudyTime)}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Study Time</div>
            <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">
              {stats.overview.totalSessions} sesi
            </div>
          </div>
        </Card>
      </div>

      {/* Progress Deck */}
      <Card className="p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Progress Deck</h2>
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
                <span className="font-medium text-gray-900 dark:text-white">Hafal</span>
              </div>
              <span className="text-lg font-semibold text-tertiary-green">
                {totalRatings > 0
                  ? Math.round((stats.ratingDistribution.hafal / totalRatings) * 100)
                  : 0}
                %
              </span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
              <div
                className="bg-tertiary-green h-3 rounded-full transition-all duration-500 ease-out"
                style={{
                  width: `${totalRatings > 0 ? (stats.ratingDistribution.hafal / totalRatings) * 100 : 0}%`,
                }}
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
                <span className="font-medium text-gray-900 dark:text-white">Belum Hafal</span>
              </div>
              <span className="text-lg font-semibold text-primary">
                {totalRatings > 0
                  ? Math.round((stats.ratingDistribution.belumHafal / totalRatings) * 100)
                  : 0}
                %
              </span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
              <div
                className="bg-primary h-3 rounded-full transition-all duration-500 ease-out"
                style={{
                  width: `${totalRatings > 0 ? (stats.ratingDistribution.belumHafal / totalRatings) * 100 : 0}%`,
                }}
              />
            </div>
          </div>
        </div>
      </Card>

      {/* Recent Sessions */}
      {stats.recentSessions.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Sesi Terakhir
          </h2>
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
                  className="p-4 hover:shadow-md transition-all hover:border-secondary"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <svg
                          className="w-6 h-6 text-blue-500"
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
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {session.deckName}
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
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
                          <span className="text-gray-700 dark:text-gray-300">
                            {session.cardsCorrect}
                          </span>
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
                          <span className="text-gray-700 dark:text-gray-300">
                            {session.cardsReviewed - session.cardsCorrect}
                          </span>
                        </div>
                        <div className="text-gray-500 dark:text-gray-400">•</div>
                        <div className="text-gray-700 dark:text-gray-300">
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
                      <div className="text-xs text-gray-500 dark:text-gray-500">
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
