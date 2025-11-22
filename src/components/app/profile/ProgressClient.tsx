'use client';

import { User } from '@/types/user';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

interface ProgressStats {
  totalAttempts: number;
  completedTasks: number;
  averageScore: number;
  recentAttempts: Array<{
    id: string;
    taskTitle: string;
    overallScore: number;
    completedAt: string;
  }>;
}

interface ProgressClientProps {
  user: User;
}

export default function ProgressClient({ user }: ProgressClientProps) {
  const router = useRouter();
  const [stats, setStats] = useState<ProgressStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchProgress();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchProgress = async () => {
    try {
      const response = await fetch(`/api/users/${user.id}/progress`);
      if (!response.ok) {
        // If endpoint doesn't exist, show placeholder
        if (response.status === 404) {
          setStats({
            totalAttempts: 0,
            completedTasks: 0,
            averageScore: 0,
            recentAttempts: [],
          });
          setLoading(false);
          return;
        }
        throw new Error('Failed to fetch progress');
      }
      const data = await response.json();
      setStats(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <nav className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">Progress Tracking</h1>
            <Button onClick={() => router.push('/dashboard')} variant="secondary">
              Back to Dashboard
            </Button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">Loading progress...</p>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-primary">{error}</p>
            <Button onClick={fetchProgress} className="mt-4">
              Try Again
            </Button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <Card className="p-6">
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Total Attempts
                </h3>
                <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                  {stats?.totalAttempts || 0}
                </p>
              </Card>
              <Card className="p-6">
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Completed Tasks
                </h3>
                <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                  {stats?.completedTasks || 0}
                </p>
              </Card>
              <Card className="p-6">
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Average Score
                </h3>
                <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                  {stats?.averageScore?.toFixed(1) || '0.0'}%
                </p>
              </Card>
            </div>

            {stats?.recentAttempts && stats.recentAttempts.length > 0 ? (
              <Card className="p-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                  Recent Activity
                </h2>
                <div className="space-y-4">
                  {stats.recentAttempts.map(attempt => (
                    <div
                      key={attempt.id}
                      className="flex justify-between items-center border-b border-gray-200 dark:border-gray-700 pb-4"
                    >
                      <div>
                        <h3 className="font-medium text-gray-900 dark:text-white">
                          {attempt.taskTitle}
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {new Date(attempt.completedAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-semibold text-gray-900 dark:text-white">
                          {attempt.overallScore.toFixed(1)}%
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-600 dark:text-gray-400">
                  No progress data yet. Start learning to track your progress!
                </p>
                <Button onClick={() => router.push('/app/kaiwa/roleplay')} className="mt-4">
                  Start Learning
                </Button>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
