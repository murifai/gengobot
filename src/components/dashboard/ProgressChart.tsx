'use client';

import React from 'react';

interface ProgressDataPoint {
  date: string;
  score: number;
  tasksCompleted: number;
}

interface ProgressChartProps {
  data: ProgressDataPoint[];
  title?: string;
}

export default function ProgressChart({ data, title = 'Your Progress' }: ProgressChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="bg-tertiary-purple rounded-lg shadow-lg p-6">
        <h3 className="text-white font-semibold text-lg mb-4">{title}</h3>
        <div className="text-gray-400 text-center py-8">
          No progress data available yet. Complete tasks to see your progress!
        </div>
      </div>
    );
  }

  const maxScore = Math.max(...data.map(d => d.score));
  const minScore = Math.min(...data.map(d => d.score));

  return (
    <div className="bg-tertiary-purple rounded-lg shadow-lg p-6">
      <h3 className="text-white font-semibold text-lg mb-6">{title}</h3>

      {/* Chart Area */}
      <div className="relative h-64">
        {/* Y-axis labels */}
        <div className="absolute left-0 top-0 bottom-0 w-12 flex flex-col justify-between text-xs text-gray-400">
          <span>100</span>
          <span>75</span>
          <span>50</span>
          <span>25</span>
          <span>0</span>
        </div>

        {/* Chart content */}
        <div className="ml-14 h-full relative">
          {/* Grid lines */}
          <div className="absolute inset-0 flex flex-col justify-between">
            {[0, 1, 2, 3, 4].map(i => (
              <div key={i} className="border-t border-gray-700" />
            ))}
          </div>

          {/* Data visualization */}
          <div className="absolute inset-0 flex items-end justify-around">
            {data.map((point, index) => {
              const height = (point.score / 100) * 100;
              return (
                <div key={index} className="flex-1 mx-1 flex flex-col items-center justify-end">
                  {/* Bar */}
                  <div
                    className="w-full bg-gradient-to-t from-primary to-secondary rounded-t-lg transition-all hover:opacity-80 cursor-pointer relative group"
                    style={{ height: `${height}%` }}
                  >
                    {/* Tooltip */}
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block">
                      <div className="bg-dark text-white text-xs rounded py-1 px-2 whitespace-nowrap">
                        <div className="font-semibold">{point.score}%</div>
                        <div className="text-gray-400">{point.tasksCompleted} tasks</div>
                      </div>
                    </div>
                  </div>
                  {/* Date label */}
                  <div className="text-xs text-gray-400 mt-2 transform -rotate-45 origin-top-left">
                    {new Date(point.date).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="mt-6 flex items-center justify-center gap-6 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-gradient-to-r from-primary to-secondary rounded"></div>
          <span className="text-gray-300">Average Score</span>
        </div>
      </div>
    </div>
  );
}
