'use client';

import { CheckCircle2, Circle } from 'lucide-react';
import { TaskFeedbackProgress } from '@/hooks/useTaskFeedbackProgress';

interface ProgressHeaderProps {
  progress: TaskFeedbackProgress;
}

export function ProgressHeader({ progress }: ProgressHeaderProps) {
  const { objectives, completedObjectivesCount, totalObjectivesCount } = progress;

  const progressPercentage =
    totalObjectivesCount > 0 ? (completedObjectivesCount / totalObjectivesCount) * 100 : 0;

  return (
    <div className="border-b bg-white dark:bg-gray-800 shadow-sm">
      <div className="max-w-4xl mx-auto px-4 py-3">
        {/* Objectives Row */}
        <div className="flex items-center gap-2 mb-3">
          {objectives.map((obj, index) => (
            <div key={obj.objectiveId} className="group relative" title={obj.objectiveText}>
              {obj.status === 'completed' ? (
                <CheckCircle2
                  className="w-7 h-7 text-green-500 transition-transform hover:scale-110"
                  strokeWidth={2}
                />
              ) : (
                <Circle
                  className="w-7 h-7 text-gray-300 dark:text-gray-600 transition-transform hover:scale-110"
                  strokeWidth={2}
                />
              )}
              <span
                className={`absolute -top-1 -right-1 w-4 h-4 rounded-full text-xs flex items-center justify-center font-semibold ${
                  obj.status === 'completed'
                    ? 'bg-green-500 text-white'
                    : 'bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300'
                }`}
              >
                {index + 1}
              </span>

              {/* Tooltip */}
              <div className="absolute left-1/2 -translate-x-1/2 top-full mt-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 whitespace-nowrap shadow-lg">
                {obj.objectiveText}
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-b-4 border-transparent border-b-gray-900" />
              </div>
            </div>
          ))}
        </div>

        {/* Progress Bar */}
        <div className="relative">
          <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-500 to-green-500 transition-all duration-500 ease-out"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
          <div className="mt-1">
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {completedObjectivesCount} of {totalObjectivesCount} completed
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
