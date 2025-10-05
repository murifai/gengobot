'use client';

import React from 'react';
import { useRouter } from 'next/navigation';

interface RecommendedTask {
  id: string;
  title: string;
  category: string;
  difficulty: string;
  estimatedDuration: number;
  reason: string;
}

interface TaskRecommendationsProps {
  recommendations: RecommendedTask[];
}

export default function TaskRecommendations({ recommendations }: TaskRecommendationsProps) {
  const router = useRouter();

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
      <h3 className="text-white font-semibold text-lg mb-6">Recommended Tasks</h3>

      {recommendations.length > 0 ? (
        <div className="space-y-3">
          {recommendations.map((task, index) => (
            <div
              key={task.id}
              onClick={() => router.push(`/task-chat/${task.id}`)}
              className="bg-dark rounded-lg p-4 cursor-pointer hover:bg-dark/80 transition-colors"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <h4 className="text-white font-medium mb-1">{task.title}</h4>
                  <div className="flex items-center gap-2 text-sm mb-2">
                    <span className="text-gray-400">{task.category}</span>
                    <span className="text-gray-600">•</span>
                    <span
                      className={`${getDifficultyColor(task.difficulty)} text-white px-2 py-0.5 rounded text-xs`}
                    >
                      {task.difficulty}
                    </span>
                    <span className="text-gray-600">•</span>
                    <span className="text-gray-400 text-xs">{task.estimatedDuration} min</span>
                  </div>
                  <p className="text-gray-400 text-xs italic">{task.reason}</p>
                </div>
              </div>

              <button className="w-full mt-2 bg-gradient-to-r from-primary to-secondary text-white font-medium py-2 px-4 rounded hover:opacity-90 transition-opacity">
                Start Task
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-gray-400 text-center py-8">
          Complete more tasks to get personalized recommendations!
        </div>
      )}
    </div>
  );
}
