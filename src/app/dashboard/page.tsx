'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  ProgressChart,
  TaskHistory,
  JLPTProgress,
  PerformanceMetrics,
  SkillTracking,
  TaskRecommendations,
  StreakTracker,
} from '@/components/dashboard';

interface TaskAttempt {
  id: string;
  taskId: string;
  taskTitle: string;
  category: string;
  difficulty: string;
  startTime: Date;
  endTime?: Date;
  isCompleted: boolean;
  taskAchievement?: number;
  fluency?: number;
  vocabularyGrammarAccuracy?: number;
  politeness?: number;
  overallScore?: number;
}

interface UserStats {
  tasksCompleted: number;
  currentLevel: string;
  tasksInProgress: number;
  averageScore: number;
  streak: number;
  longestStreak: number;
}

interface ProgressDataPoint {
  date: string;
  score: number;
  tasksCompleted: number;
}

interface SkillData {
  category: string;
  tasksCompleted: number;
  averageScore: number;
  improvement: number;
}

interface RecommendedTask {
  id: string;
  title: string;
  category: string;
  difficulty: string;
  estimatedDuration: number;
  reason: string;
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  earnedDate?: Date;
  isEarned: boolean;
}

export default function DashboardPage() {
  const router = useRouter();
  const [stats, setStats] = useState<UserStats | null>(null);
  const [recentAttempts, setRecentAttempts] = useState<TaskAttempt[]>([]);
  const [progressData, setProgressData] = useState<ProgressDataPoint[]>([]);
  const [skillData, setSkillData] = useState<SkillData[]>([]);
  const [recommendations, setRecommendations] = useState<RecommendedTask[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
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
        longestStreak: 8,
      };

      const mockAttempts: TaskAttempt[] = [
        {
          id: '1',
          taskId: 'task1',
          taskTitle: 'Order Ramen at Restaurant',
          category: 'Food & Dining',
          difficulty: 'N4',
          startTime: new Date(Date.now() - 86400000),
          endTime: new Date(Date.now() - 86000000),
          isCompleted: true,
          taskAchievement: 90,
          fluency: 72,
          vocabularyGrammarAccuracy: 85,
          politeness: 88,
          overallScore: 84,
        },
        {
          id: '2',
          taskId: 'task2',
          taskTitle: 'Buy Clothes at Department Store',
          category: 'Shopping',
          difficulty: 'N4',
          startTime: new Date(Date.now() - 172800000),
          endTime: new Date(Date.now() - 172000000),
          isCompleted: true,
          taskAchievement: 85,
          fluency: 80,
          vocabularyGrammarAccuracy: 78,
          politeness: 82,
          overallScore: 81,
        },
        {
          id: '3',
          taskId: 'task3',
          taskTitle: 'Ask for Directions',
          category: 'Travel',
          difficulty: 'N5',
          startTime: new Date(Date.now() - 259200000),
          isCompleted: false,
        },
      ];

      const mockProgressData: ProgressDataPoint[] = [
        { date: new Date(Date.now() - 604800000).toISOString(), score: 65, tasksCompleted: 2 },
        { date: new Date(Date.now() - 518400000).toISOString(), score: 70, tasksCompleted: 3 },
        { date: new Date(Date.now() - 432000000).toISOString(), score: 72, tasksCompleted: 2 },
        { date: new Date(Date.now() - 345600000).toISOString(), score: 75, tasksCompleted: 1 },
        { date: new Date(Date.now() - 259200000).toISOString(), score: 78, tasksCompleted: 2 },
        { date: new Date(Date.now() - 172800000).toISOString(), score: 81, tasksCompleted: 1 },
        { date: new Date(Date.now() - 86400000).toISOString(), score: 84, tasksCompleted: 1 },
      ];

      const mockSkillData: SkillData[] = [
        { category: 'Food & Dining', tasksCompleted: 4, averageScore: 82, improvement: 8 },
        { category: 'Shopping', tasksCompleted: 3, averageScore: 76, improvement: 5 },
        { category: 'Travel', tasksCompleted: 2, averageScore: 70, improvement: -2 },
        { category: 'Daily Conversation', tasksCompleted: 3, averageScore: 79, improvement: 12 },
      ];

      const mockRecommendations: RecommendedTask[] = [
        {
          id: 'rec1',
          title: 'Make a Hotel Reservation',
          category: 'Travel',
          difficulty: 'N4',
          estimatedDuration: 15,
          reason: 'Strengthen your travel vocabulary skills',
        },
        {
          id: 'rec2',
          title: 'Visit a Convenience Store',
          category: 'Shopping',
          difficulty: 'N5',
          estimatedDuration: 10,
          reason: 'Build confidence with everyday interactions',
        },
        {
          id: 'rec3',
          title: 'Schedule a Doctor Appointment',
          category: 'Healthcare',
          difficulty: 'N3',
          estimatedDuration: 20,
          reason: 'Challenge yourself with new vocabulary',
        },
      ];

      const mockAchievements: Achievement[] = [
        {
          id: 'ach1',
          title: 'First Steps',
          description: 'Complete your first task',
          icon: '🎯',
          earnedDate: new Date(Date.now() - 604800000),
          isEarned: true,
        },
        {
          id: 'ach2',
          title: '5 Day Streak',
          description: 'Practice for 5 days in a row',
          icon: '🔥',
          earnedDate: new Date(Date.now() - 86400000),
          isEarned: true,
        },
        {
          id: 'ach3',
          title: 'Perfect Score',
          description: 'Score 100% on a task',
          icon: '⭐',
          isEarned: false,
        },
        {
          id: 'ach4',
          title: 'Task Master',
          description: 'Complete 20 tasks',
          icon: '🏆',
          isEarned: false,
        },
      ];

      setStats(mockStats);
      setRecentAttempts(mockAttempts);
      setProgressData(mockProgressData);
      setSkillData(mockSkillData);
      setRecommendations(mockRecommendations);
      setAchievements(mockAchievements);
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
                const lastInProgress = recentAttempts.find(t => !t.isCompleted);
                if (lastInProgress) {
                  router.push(`/task-chat/${lastInProgress.taskId}`);
                } else {
                  router.push('/task-chat');
                }
              }}
              icon="▶️"
            />
          </div>
        </div>

        {/* Main Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Progress Chart */}
          <ProgressChart data={progressData} />

          {/* JLPT Progress */}
          {stats && (
            <JLPTProgress
              currentLevel={stats.currentLevel}
              progressToNextLevel={45}
              estimatedTimeToNextLevel="3 months"
              strengths={['Polite expressions', 'Restaurant vocabulary', 'Shopping phrases']}
              areasForImprovement={['Travel vocabulary', 'Casual speech', 'Complex grammar']}
            />
          )}

          {/* Performance Metrics */}
          <PerformanceMetrics
            taskAchievement={88}
            fluency={76}
            vocabularyGrammarAccuracy={81}
            politeness={85}
          />

          {/* Streak Tracker */}
          {stats && (
            <StreakTracker
              currentStreak={stats.streak}
              longestStreak={stats.longestStreak}
              achievements={achievements}
            />
          )}

          {/* Skill Tracking */}
          <SkillTracking skills={skillData} />

          {/* Task Recommendations */}
          <TaskRecommendations recommendations={recommendations} />
        </div>

        {/* Task History */}
        <TaskHistory
          tasks={recentAttempts}
          onTaskClick={taskId => router.push(`/task-chat/${taskId}`)}
        />
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
