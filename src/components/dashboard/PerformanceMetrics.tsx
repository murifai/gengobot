'use client';

import React from 'react';

interface PerformanceMetricsProps {
  taskAchievement: number;
  fluency: number;
  vocabularyGrammarAccuracy: number;
  politeness: number;
}

export default function PerformanceMetrics({
  taskAchievement,
  fluency,
  vocabularyGrammarAccuracy,
  politeness,
}: PerformanceMetricsProps) {
  const metrics = [
    {
      name: 'Task Achievement',
      value: taskAchievement,
      description: 'タスク達成度',
      color: 'from-primary to-pink-500',
    },
    {
      name: 'Fluency',
      value: fluency,
      description: '流暢さ',
      color: 'from-secondary to-blue-400',
    },
    {
      name: 'Accuracy',
      value: vocabularyGrammarAccuracy,
      description: '語彙・文法的正確さ',
      color: 'from-tertiary-green to-green-400',
    },
    {
      name: 'Politeness',
      value: politeness,
      description: '丁寧さ',
      color: 'from-tertiary-yellow to-yellow-400',
    },
  ];

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-tertiary-green';
    if (score >= 60) return 'text-tertiary-yellow';
    return 'text-primary';
  };

  return (
    <div className="bg-tertiary-purple rounded-lg shadow-lg p-6">
      <h3 className="text-white font-semibold text-lg mb-6">Performance Metrics</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {metrics.map((metric, index) => (
          <div key={index} className="bg-dark rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h4 className="text-white font-medium text-sm">{metric.name}</h4>
                <p className="text-gray-400 text-xs">{metric.description}</p>
              </div>
              <div className={`text-2xl font-bold ${getScoreColor(metric.value)}`}>
                {metric.value}%
              </div>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div
                className={`bg-gradient-to-r ${metric.color} h-2 rounded-full transition-all duration-500`}
                style={{ width: `${metric.value}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Overall Score */}
      <div className="mt-6 bg-dark rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-white font-medium">Overall Score</h4>
            <p className="text-gray-400 text-sm">Average of all metrics</p>
          </div>
          <div className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            {Math.round((taskAchievement + fluency + vocabularyGrammarAccuracy + politeness) / 4)}%
          </div>
        </div>
      </div>
    </div>
  );
}
