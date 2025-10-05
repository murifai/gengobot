'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface TaskAttempt {
  id: string;
  taskId: string;
  taskTitle: string;
  startTime: Date;
  endTime?: Date;
  isCompleted: boolean;
  accuracyScore?: number;
  fluencyScore?: number;
  completionScore?: number;
}

interface UserStats {
  tasksCompleted: number;
  currentLevel: string;
  tasksInProgress: number;
  averageScore: number;
  streak: number;
}

export default function DashboardPage() {
  const router = useRouter();
  const [stats, setStats] = useState<UserStats | null>(null);
  const [recentAttempts, setRecentAttempts] = useState<TaskAttempt[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      // TODO: Replace with actual API calls
      const mockStats: UserStats = {
        tasksCompleted: 12,
        currentLevel: 'N4',
        tasksInProgress: 2,
        averageScore: 78.5,
        streak: 5,
      };

      const mockAttempts: TaskAttempt[] = [
        {
          id: '1',
          taskId: 'task1',
          taskTitle: 'Order Ramen at Restaurant',
          startTime: new Date(Date.now() - 86400000),
          endTime: new Date(Date.now() - 86000000),
          isCompleted: true,
          accuracyScore: 85,
          fluencyScore: 72,
          completionScore: 90,
        },
        {
          id: '2',
          taskId: 'task2',
          taskTitle: 'Buy Clothes at Department Store',
          startTime: new Date(Date.now() - 172800000),
          endTime: new Date(Date.now() - 172000000),
          isCompleted: true,
          accuracyScore: 78,
          fluencyScore: 80,
          completionScore: 85,
        },
      ];

      setStats(mockStats);
      setRecentAttempts(mockAttempts);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-dark flex items-center justify-center">
        <div className="text-secondary text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Dashboard</h1>
          <p className="text-gray-400">Track your Japanese learning progress</p>
        </div>

        {/* Stats Grid */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatCard
              title="Tasks Completed"
              value={stats.tasksCompleted.toString()}
              icon="✓"
              color="primary"
            />
            <StatCard
              title="Current Level"
              value={stats.currentLevel}
              icon="🎯"
              color="secondary"
            />
            <StatCard
              title="Average Score"
              value={`${stats.averageScore}%`}
              icon="📊"
              color="tertiary-green"
            />
            <StatCard
              title="Day Streak"
              value={stats.streak.toString()}
              icon="🔥"
              color="tertiary-yellow"
            />
          </div>
        )}

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-white mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <ActionCard
              title="Start Task-Based Chat"
              description="Practice Japanese with structured tasks"
              onClick={() => router.push('/task-chat')}
              icon="💬"
              primary
            />
            <ActionCard
              title="Browse Task Library"
              description="Explore available learning tasks"
              onClick={() => router.push('/task-chat')}
              icon="📚"
            />
            <ActionCard
              title="Continue Learning"
              description="Resume your last task"
              onClick={() => {
                /* TODO: Navigate to last task */
              }}
              icon="▶️"
            />
          </div>
        </div>

        {/* Recent Activity */}
        <div>
          <h2 className="text-xl font-semibold text-white mb-4">Recent Activity</h2>
          <div className="bg-tertiary-purple rounded-lg shadow-lg p-6">
            {recentAttempts.length > 0 ? (
              <div className="space-y-4">
                {recentAttempts.map(attempt => (
                  <TaskAttemptCard key={attempt.id} attempt={attempt} />
                ))}
              </div>
            ) : (
              <p className="text-gray-400 text-center py-8">
                No recent activity. Start a task to begin learning!
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Stat Card Component
function StatCard({
  title,
  value,
  icon,
  color,
}: {
  title: string;
  value: string;
  icon: string;
  color: string;
}) {
  const bgColor = {
    primary: 'bg-primary',
    secondary: 'bg-secondary',
    'tertiary-green': 'bg-tertiary-green',
    'tertiary-yellow': 'bg-tertiary-yellow',
  }[color];

  return (
    <div className={`${bgColor} rounded-lg shadow-lg p-6`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-white text-sm opacity-90">{title}</p>
          <p className="text-white text-3xl font-bold mt-2">{value}</p>
        </div>
        <div className="text-4xl">{icon}</div>
      </div>
    </div>
  );
}

// Action Card Component
function ActionCard({
  title,
  description,
  onClick,
  icon,
  primary = false,
}: {
  title: string;
  description: string;
  onClick: () => void;
  icon: string;
  primary?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={`${
        primary
          ? 'bg-primary hover:bg-primary/90'
          : 'bg-tertiary-purple hover:bg-tertiary-purple/90'
      } rounded-lg shadow-lg p-6 text-left transition-all transform hover:scale-105`}
    >
      <div className="text-3xl mb-3">{icon}</div>
      <h3 className="text-white font-semibold text-lg mb-2">{title}</h3>
      <p className="text-white opacity-80 text-sm">{description}</p>
    </button>
  );
}

// Task Attempt Card Component
function TaskAttemptCard({ attempt }: { attempt: TaskAttempt }) {
  const overallScore =
    attempt.accuracyScore && attempt.fluencyScore && attempt.completionScore
      ? Math.round((attempt.accuracyScore + attempt.fluencyScore + attempt.completionScore) / 3)
      : null;

  return (
    <div className="bg-dark rounded-lg p-4 flex items-center justify-between">
      <div className="flex-1">
        <h3 className="text-white font-medium mb-1">{attempt.taskTitle}</h3>
        <p className="text-gray-400 text-sm">{new Date(attempt.startTime).toLocaleDateString()}</p>
      </div>
      {overallScore && (
        <div className="ml-4">
          <div
            className={`px-4 py-2 rounded-full ${
              overallScore >= 80
                ? 'bg-tertiary-green'
                : overallScore >= 60
                  ? 'bg-tertiary-yellow'
                  : 'bg-primary'
            }`}
          >
            <span className="text-white font-semibold">{overallScore}%</span>
          </div>
        </div>
      )}
    </div>
  );
}
