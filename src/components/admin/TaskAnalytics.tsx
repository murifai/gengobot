'use client';

import React from 'react';

interface TaskAnalyticsData {
  totalTasks: number;
  activeTasks: number;
  totalAttempts: number;
  completedAttempts: number;
  averageCompletionRate: number;
  averageScore: number;
  topPerformingTasks: Array<{
    id: string;
    title: string;
    category: string;
    averageScore: number;
    completionRate: number;
    usageCount: number;
  }>;
  categoryBreakdown: Array<{
    category: string;
    count: number;
    averageScore: number;
  }>;
  difficultyBreakdown: Array<{
    difficulty: string;
    count: number;
    averageScore: number;
  }>;
}

interface TaskAnalyticsProps {
  data: TaskAnalyticsData;
}

export default function TaskAnalytics({ data }: TaskAnalyticsProps) {
  const getDifficultyColor = (difficulty: string) => {
    const colors: Record<string, string> = {
      N5: 'bg-tertiary-green',
      N4: 'bg-secondary',
      N3: 'bg-tertiary-yellow',
      N2: 'bg-primary',
      N1: 'bg-tertiary-purple',
    };
    return colors[difficulty] || 'bg-gray-500';
  };

  return (
    <div className="space-y-6">
      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-primary rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white text-sm opacity-90">Total Tasks</p>
              <p className="text-white text-3xl font-bold mt-2">{data.totalTasks}</p>
              <p className="text-white text-sm opacity-75 mt-1">{data.activeTasks} active</p>
            </div>
            <div className="text-4xl">📚</div>
          </div>
        </div>

        <div className="bg-secondary rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white text-sm opacity-90">Total Attempts</p>
              <p className="text-white text-3xl font-bold mt-2">{data.totalAttempts}</p>
              <p className="text-white text-sm opacity-75 mt-1">{data.completedAttempts} completed</p>
            </div>
            <div className="text-4xl">🎯</div>
          </div>
        </div>

        <div className="bg-tertiary-green rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white text-sm opacity-90">Completion Rate</p>
              <p className="text-white text-3xl font-bold mt-2">{data.averageCompletionRate}%</p>
              <p className="text-white text-sm opacity-75 mt-1">across all tasks</p>
            </div>
            <div className="text-4xl">✅</div>
          </div>
        </div>

        <div className="bg-tertiary-yellow rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-dark text-sm opacity-90">Average Score</p>
              <p className="text-dark text-3xl font-bold mt-2">{data.averageScore}%</p>
              <p className="text-dark text-sm opacity-75 mt-1">overall performance</p>
            </div>
            <div className="text-4xl">⭐</div>
          </div>
        </div>
      </div>

      {/* Top Performing Tasks */}
      <div className="bg-tertiary-purple rounded-lg shadow-lg p-6">
        <h3 className="text-white font-semibold text-lg mb-4">Top Performing Tasks</h3>
        <div className="space-y-3">
          {data.topPerformingTasks.map((task, index) => (
            <div key={task.id} className="bg-dark rounded-lg p-4 flex items-center justify-between">
              <div className="flex items-center gap-4 flex-1">
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-primary to-secondary flex items-center justify-center text-white font-bold">
                  {index + 1}
                </div>
                <div className="flex-1">
                  <h4 className="text-white font-medium">{task.title}</h4>
                  <p className="text-gray-400 text-sm">{task.category}</p>
                </div>
              </div>
              <div className="flex items-center gap-6">
                <div className="text-center">
                  <p className="text-gray-400 text-xs">Avg Score</p>
                  <p className="text-tertiary-green font-semibold">{task.averageScore}%</p>
                </div>
                <div className="text-center">
                  <p className="text-gray-400 text-xs">Completion</p>
                  <p className="text-secondary font-semibold">{task.completionRate}%</p>
                </div>
                <div className="text-center">
                  <p className="text-gray-400 text-xs">Uses</p>
                  <p className="text-white font-semibold">{task.usageCount}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Category and Difficulty Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Breakdown */}
        <div className="bg-tertiary-purple rounded-lg shadow-lg p-6">
          <h3 className="text-white font-semibold text-lg mb-4">Tasks by Category</h3>
          <div className="space-y-3">
            {data.categoryBreakdown.map(cat => (
              <div key={cat.category} className="bg-dark rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-white font-medium">{cat.category}</h4>
                  <div className="flex items-center gap-4">
                    <span className="text-gray-400 text-sm">{cat.count} tasks</span>
                    <span className="text-tertiary-green font-semibold">{cat.averageScore}%</span>
                  </div>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-primary to-secondary h-2 rounded-full transition-all"
                    style={{ width: `${(cat.count / data.totalTasks) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Difficulty Breakdown */}
        <div className="bg-tertiary-purple rounded-lg shadow-lg p-6">
          <h3 className="text-white font-semibold text-lg mb-4">Tasks by Difficulty</h3>
          <div className="space-y-3">
            {data.difficultyBreakdown.map(diff => (
              <div key={diff.difficulty} className="bg-dark rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <span className={`${getDifficultyColor(diff.difficulty)} text-white px-3 py-1 rounded text-sm`}>
                      {diff.difficulty}
                    </span>
                    <span className="text-gray-400 text-sm">{diff.count} tasks</span>
                  </div>
                  <span className="text-tertiary-green font-semibold">{diff.averageScore}%</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div
                    className={`${getDifficultyColor(diff.difficulty)} h-2 rounded-full transition-all`}
                    style={{ width: `${(diff.count / data.totalTasks) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
