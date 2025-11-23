'use client';

import { useState } from 'react';
import { TrendingUp, Users, Target, Award, Calendar, Download } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export const dynamic = 'force-dynamic';

interface AnalyticsData {
  overview: {
    totalUsers: number;
    activeUsers: number;
    totalTasks: number;
    completionRate: number;
  };
  userMetrics: {
    newUsersThisMonth: number;
    retentionRate: number;
    avgSessionLength: number;
    dailyActiveUsers: number;
  };
  taskMetrics: {
    mostPopularTasks: Array<{ name: string; completions: number }>;
    avgCompletionTime: number;
    avgScore: number;
  };
  performanceMetrics: {
    avgTaskAchievement: number;
    avgFluency: number;
    avgVocabularyGrammar: number;
    avgPoliteness: number;
  };
}

export default function AdminAnalyticsPage() {
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | 'all'>('30d');
  const analytics: AnalyticsData = {
    overview: {
      totalUsers: 1247,
      activeUsers: 856,
      totalTasks: 45,
      completionRate: 78.5,
    },
    userMetrics: {
      newUsersThisMonth: 142,
      retentionRate: 68.3,
      avgSessionLength: 24.5,
      dailyActiveUsers: 342,
    },
    taskMetrics: {
      mostPopularTasks: [
        { name: 'Restaurant Ordering', completions: 1523 },
        { name: 'Shopping for Clothes', completions: 1287 },
        { name: 'Train Station Navigation', completions: 1156 },
      ],
      avgCompletionTime: 18.5,
      avgScore: 82.3,
    },
    performanceMetrics: {
      avgTaskAchievement: 85.2,
      avgFluency: 78.6,
      avgVocabularyGrammar: 81.4,
      avgPoliteness: 88.9,
    },
  };

  const exportData = () => {
    console.log('Exporting analytics data...');
    // Export logic here
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Analytics & Reporting
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              User activity, performance metrics, and system insights
            </p>
          </div>
          <div className="flex gap-3">
            <select
              value={timeRange}
              onChange={e => setTimeRange(e.target.value as '7d' | '30d' | '90d' | 'all')}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
              <option value="90d">Last 90 Days</option>
              <option value="all">All Time</option>
            </select>
            <Button variant="default" onClick={exportData} className="gap-2">
              <Download size={20} />
              Export
            </Button>
          </div>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-primary/10 rounded-lg">
                <Users className="text-primary" size={24} />
              </div>
              <div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Total Users</div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {analytics.overview.totalUsers.toLocaleString()}
                </div>
                <div className="text-xs text-tertiary-green">
                  +{analytics.userMetrics.newUsersThisMonth} this month
                </div>
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-tertiary-green/10 rounded-lg">
                <TrendingUp className="text-tertiary-green" size={24} />
              </div>
              <div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Active Users</div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {analytics.overview.activeUsers.toLocaleString()}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  {((analytics.overview.activeUsers / analytics.overview.totalUsers) * 100).toFixed(
                    1
                  )}
                  % of total
                </div>
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-secondary/10 rounded-lg">
                <Target className="text-secondary" size={24} />
              </div>
              <div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Total Tasks</div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {analytics.overview.totalTasks}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  Across all categories
                </div>
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-tertiary-yellow/10 rounded-lg">
                <Award className="text-tertiary-purple" size={24} />
              </div>
              <div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Completion Rate</div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {analytics.overview.completionRate}%
                </div>
                <div className="text-xs text-tertiary-green">+2.3% vs last month</div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* User Engagement Metrics */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              User Engagement
            </h2>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Daily Active Users</div>
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">
                    {analytics.userMetrics.dailyActiveUsers}
                  </div>
                </div>
                <Calendar className="text-primary" size={32} />
              </div>
              <div className="flex justify-between items-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Retention Rate</div>
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">
                    {analytics.userMetrics.retentionRate}%
                  </div>
                </div>
                <TrendingUp className="text-tertiary-green" size={32} />
              </div>
              <div className="flex justify-between items-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Avg Session Length</div>
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">
                    {analytics.userMetrics.avgSessionLength} min
                  </div>
                </div>
                <Target className="text-secondary" size={32} />
              </div>
            </div>
          </div>

          {/* Task Performance */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Task Performance
            </h2>
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                  Avg Completion Time
                </div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {analytics.taskMetrics.avgCompletionTime} min
                </div>
              </div>
              <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Average Score</div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {analytics.taskMetrics.avgScore}%
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2 mt-2">
                  <div
                    className="bg-primary h-2 rounded-full"
                    style={{ width: `${analytics.taskMetrics.avgScore}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Japanese Learning Assessment Metrics */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm mb-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Japanese Learning Performance (4 Evaluation Criteria)
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                Task Achievement (タスク達成度)
              </div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                {analytics.performanceMetrics.avgTaskAchievement}%
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                <div
                  className="bg-primary h-2 rounded-full"
                  style={{ width: `${analytics.performanceMetrics.avgTaskAchievement}%` }}
                />
              </div>
            </div>
            <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">Fluency (流暢さ)</div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                {analytics.performanceMetrics.avgFluency}%
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                <div
                  className="bg-secondary h-2 rounded-full"
                  style={{ width: `${analytics.performanceMetrics.avgFluency}%` }}
                />
              </div>
            </div>
            <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                Vocabulary/Grammar (語彙・文法的正確さ)
              </div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                {analytics.performanceMetrics.avgVocabularyGrammar}%
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                <div
                  className="bg-tertiary-green h-2 rounded-full"
                  style={{ width: `${analytics.performanceMetrics.avgVocabularyGrammar}%` }}
                />
              </div>
            </div>
            <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                Politeness (丁寧さ)
              </div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                {analytics.performanceMetrics.avgPoliteness}%
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                <div
                  className="bg-tertiary-purple h-2 rounded-full"
                  style={{ width: `${analytics.performanceMetrics.avgPoliteness}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Most Popular Tasks */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Most Popular Tasks
          </h2>
          <div className="space-y-3">
            {analytics.taskMetrics.mostPopularTasks.map((task, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                    <span className="text-sm font-bold text-primary">#{index + 1}</span>
                  </div>
                  <span className="text-gray-900 dark:text-white font-medium">{task.name}</span>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-gray-900 dark:text-white">
                    {task.completions.toLocaleString()}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">completions</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
