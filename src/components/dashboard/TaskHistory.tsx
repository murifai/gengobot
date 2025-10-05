'use client';

import React, { useState } from 'react';

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

interface TaskHistoryProps {
  tasks: TaskAttempt[];
  onTaskClick?: (taskId: string) => void;
}

export default function TaskHistory({ tasks, onTaskClick }: TaskHistoryProps) {
  const [filter, setFilter] = useState<'all' | 'completed' | 'in-progress'>('all');
  const [sortBy, setSortBy] = useState<'date' | 'score'>('date');

  const filteredTasks = tasks.filter(task => {
    if (filter === 'completed') return task.isCompleted;
    if (filter === 'in-progress') return !task.isCompleted;
    return true;
  });

  const sortedTasks = [...filteredTasks].sort((a, b) => {
    if (sortBy === 'date') {
      return new Date(b.startTime).getTime() - new Date(a.startTime).getTime();
    } else {
      return (b.overallScore || 0) - (a.overallScore || 0);
    }
  });

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'bg-tertiary-green';
    if (score >= 60) return 'bg-tertiary-yellow';
    return 'bg-primary';
  };

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
    <div className="bg-tertiary-purple rounded-lg shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-white font-semibold text-lg">Task History</h3>

        {/* Filters */}
        <div className="flex gap-2">
          <select
            value={filter}
            onChange={e => setFilter(e.target.value as 'all' | 'completed' | 'in-progress')}
            className="bg-dark text-white rounded px-3 py-1 text-sm"
          >
            <option value="all">All Tasks</option>
            <option value="completed">Completed</option>
            <option value="in-progress">In Progress</option>
          </select>
          <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value as 'date' | 'score')}
            className="bg-dark text-white rounded px-3 py-1 text-sm"
          >
            <option value="date">Sort by Date</option>
            <option value="score">Sort by Score</option>
          </select>
        </div>
      </div>

      {/* Task List */}
      <div className="space-y-3 max-h-96 overflow-y-auto">
        {sortedTasks.length > 0 ? (
          sortedTasks.map(task => (
            <div
              key={task.id}
              onClick={() => onTaskClick?.(task.taskId)}
              className="bg-dark rounded-lg p-4 cursor-pointer hover:bg-dark/80 transition-colors"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <h4 className="text-white font-medium mb-1">{task.taskTitle}</h4>
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-gray-400">{task.category}</span>
                    <span className="text-gray-600">•</span>
                    <span
                      className={`${getDifficultyColor(task.difficulty)} text-white px-2 py-0.5 rounded text-xs`}
                    >
                      {task.difficulty}
                    </span>
                  </div>
                </div>

                {task.overallScore !== undefined && (
                  <div className={`${getScoreColor(task.overallScore)} px-4 py-2 rounded-full`}>
                    <span className="text-white font-semibold">{task.overallScore}%</span>
                  </div>
                )}
              </div>

              {/* Score Breakdown */}
              {task.isCompleted && task.taskAchievement !== undefined && (
                <div className="mt-3 grid grid-cols-4 gap-2 text-xs">
                  <div>
                    <div className="text-gray-400">Achievement</div>
                    <div className="text-white font-semibold">{task.taskAchievement}%</div>
                  </div>
                  <div>
                    <div className="text-gray-400">Fluency</div>
                    <div className="text-white font-semibold">{task.fluency}%</div>
                  </div>
                  <div>
                    <div className="text-gray-400">Accuracy</div>
                    <div className="text-white font-semibold">
                      {task.vocabularyGrammarAccuracy}%
                    </div>
                  </div>
                  <div>
                    <div className="text-gray-400">Politeness</div>
                    <div className="text-white font-semibold">{task.politeness}%</div>
                  </div>
                </div>
              )}

              {/* Timestamp */}
              <div className="mt-2 text-xs text-gray-500">
                {new Date(task.startTime).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </div>
            </div>
          ))
        ) : (
          <div className="text-gray-400 text-center py-8">
            No tasks found for the selected filter.
          </div>
        )}
      </div>
    </div>
  );
}
