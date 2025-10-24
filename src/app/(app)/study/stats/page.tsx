'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { LoadingState } from '@/components/ui/LoadingState';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';

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
    again: number;
    hard: number;
    good: number;
    easy: number;
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
  deckStats: Array<{
    deckName: string;
    category: string | null;
    difficulty: string | null;
    sessions: number;
    cardsReviewed: number;
    cardsCorrect: number;
    accuracy: number;
  }>;
}

export default function StudyStatsPage() {
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
          <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
          <Button onClick={fetchStats}>Try Again</Button>
        </Card>
      </div>
    );
  }

  if (!stats) return null;

  const totalRatings =
    stats.ratingDistribution.again +
    stats.ratingDistribution.hard +
    stats.ratingDistribution.good +
    stats.ratingDistribution.easy;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Study Statistics
          </h1>
          <p className="text-gray-600 dark:text-gray-400">Track your learning progress</p>
        </div>
        <Link href="/study">
          <Button variant="secondary">Back to Decks</Button>
        </Link>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Study Streak</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">
                {stats.overview.studyStreak}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">days</p>
            </div>
            <div className="text-4xl">🔥</div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Cards Due Today</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">
                {stats.overview.cardsDueToday}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">cards</p>
            </div>
            <div className="text-4xl">📚</div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total Reviews</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">
                {stats.overview.totalCardsReviewed}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">cards</p>
            </div>
            <div className="text-4xl">✅</div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Overall Accuracy</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">
                {stats.overview.overallAccuracy}%
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                {stats.overview.totalCardsCorrect} / {stats.overview.totalCardsReviewed}
              </p>
            </div>
            <div className="text-4xl">🎯</div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Study Time */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Study Time</h2>
          <div className="text-center">
            <p className="text-5xl font-bold text-blue-600 dark:text-blue-400 mb-2">
              {stats.overview.totalStudyTime}
            </p>
            <p className="text-gray-600 dark:text-gray-400">minutes</p>
            <p className="text-sm text-gray-500 dark:text-gray-500 mt-4">
              Across {stats.overview.totalSessions} sessions
            </p>
          </div>
        </Card>

        {/* Rating Distribution */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Rating Distribution
          </h2>
          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-red-600 dark:text-red-400">❌ Again</span>
                <span className="text-gray-600 dark:text-gray-400">
                  {stats.ratingDistribution.again} (
                  {totalRatings > 0
                    ? Math.round((stats.ratingDistribution.again / totalRatings) * 100)
                    : 0}
                  %)
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div
                  className="bg-red-600 dark:bg-red-500 h-2 rounded-full"
                  style={{
                    width: `${totalRatings > 0 ? (stats.ratingDistribution.again / totalRatings) * 100 : 0}%`,
                  }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-orange-600 dark:text-orange-400">🤔 Hard</span>
                <span className="text-gray-600 dark:text-gray-400">
                  {stats.ratingDistribution.hard} (
                  {totalRatings > 0
                    ? Math.round((stats.ratingDistribution.hard / totalRatings) * 100)
                    : 0}
                  %)
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div
                  className="bg-orange-600 dark:bg-orange-500 h-2 rounded-full"
                  style={{
                    width: `${totalRatings > 0 ? (stats.ratingDistribution.hard / totalRatings) * 100 : 0}%`,
                  }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-green-600 dark:text-green-400">✅ Good</span>
                <span className="text-gray-600 dark:text-gray-400">
                  {stats.ratingDistribution.good} (
                  {totalRatings > 0
                    ? Math.round((stats.ratingDistribution.good / totalRatings) * 100)
                    : 0}
                  %)
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div
                  className="bg-green-600 dark:bg-green-500 h-2 rounded-full"
                  style={{
                    width: `${totalRatings > 0 ? (stats.ratingDistribution.good / totalRatings) * 100 : 0}%`,
                  }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-blue-600 dark:text-blue-400">🎯 Easy</span>
                <span className="text-gray-600 dark:text-gray-400">
                  {stats.ratingDistribution.easy} (
                  {totalRatings > 0
                    ? Math.round((stats.ratingDistribution.easy / totalRatings) * 100)
                    : 0}
                  %)
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div
                  className="bg-blue-600 dark:bg-blue-500 h-2 rounded-full"
                  style={{
                    width: `${totalRatings > 0 ? (stats.ratingDistribution.easy / totalRatings) * 100 : 0}%`,
                  }}
                />
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Deck Statistics */}
      {stats.deckStats.length > 0 && (
        <Card className="p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Deck Performance
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-400">
                    Deck
                  </th>
                  <th className="text-center py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-400">
                    Sessions
                  </th>
                  <th className="text-center py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-400">
                    Cards
                  </th>
                  <th className="text-center py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-400">
                    Accuracy
                  </th>
                </tr>
              </thead>
              <tbody>
                {stats.deckStats.map((deck, idx) => (
                  <tr
                    key={idx}
                    className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800"
                  >
                    <td className="py-3 px-4">
                      <div className="font-medium text-gray-900 dark:text-white">
                        {deck.deckName}
                      </div>
                      {deck.category && (
                        <div className="text-xs text-gray-500 dark:text-gray-500">
                          {deck.category} {deck.difficulty && `• ${deck.difficulty}`}
                        </div>
                      )}
                    </td>
                    <td className="text-center py-3 px-4 text-gray-900 dark:text-white">
                      {deck.sessions}
                    </td>
                    <td className="text-center py-3 px-4 text-gray-900 dark:text-white">
                      {deck.cardsReviewed}
                    </td>
                    <td className="text-center py-3 px-4">
                      <span
                        className={`inline-block px-2 py-1 rounded text-sm font-medium ${
                          deck.accuracy >= 80
                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                            : deck.accuracy >= 60
                              ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                              : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                        }`}
                      >
                        {Math.round(deck.accuracy)}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Recent Sessions */}
      {stats.recentSessions.length > 0 && (
        <Card className="p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Recent Sessions (Last 7 Days)
          </h2>
          <div className="space-y-3">
            {stats.recentSessions.map(session => (
              <div
                key={session.id}
                className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg"
              >
                <div className="flex-1">
                  <p className="font-medium text-gray-900 dark:text-white">{session.deckName}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {new Date(session.endTime).toLocaleDateString()} at{' '}
                    {new Date(session.endTime).toLocaleTimeString()}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">
                    {session.accuracy}%
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {session.cardsReviewed} cards
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
