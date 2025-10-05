'use client';

import React from 'react';

interface JLPTProgressProps {
  currentLevel: string;
  progressToNextLevel: number;
  estimatedTimeToNextLevel?: string;
  strengths?: string[];
  areasForImprovement?: string[];
}

export default function JLPTProgress({
  currentLevel,
  progressToNextLevel,
  estimatedTimeToNextLevel,
  strengths = [],
  areasForImprovement = [],
}: JLPTProgressProps) {
  const jlptLevels = ['N5', 'N4', 'N3', 'N2', 'N1'];
  const currentIndex = jlptLevels.indexOf(currentLevel);
  const nextLevel = currentIndex < jlptLevels.length - 1 ? jlptLevels[currentIndex + 1] : null;

  const getLevelColor = (level: string) => {
    const colors: Record<string, string> = {
      N5: 'bg-tertiary-green',
      N4: 'bg-secondary',
      N3: 'bg-tertiary-yellow',
      N2: 'bg-primary',
      N1: 'bg-tertiary-purple',
    };
    return colors[level] || 'bg-gray-500';
  };

  return (
    <div className="bg-tertiary-purple rounded-lg shadow-lg p-6">
      <h3 className="text-white font-semibold text-lg mb-6">JLPT Level Progress</h3>

      {/* Current Level Display */}
      <div className="flex items-center justify-center mb-8">
        <div
          className={`${getLevelColor(currentLevel)} rounded-full w-32 h-32 flex items-center justify-center`}
        >
          <div className="text-center">
            <div className="text-white text-4xl font-bold">{currentLevel}</div>
            <div className="text-white text-sm opacity-90">Current Level</div>
          </div>
        </div>
      </div>

      {/* Level Timeline */}
      <div className="mb-8">
        <div className="flex items-center justify-between relative">
          {jlptLevels.map((level, index) => {
            const isCompleted = index < currentIndex;
            const isCurrent = index === currentIndex;

            return (
              <div key={level} className="flex flex-col items-center flex-1">
                {/* Connection line */}
                {index < jlptLevels.length - 1 && (
                  <div
                    className={`absolute h-1 ${isCompleted ? 'bg-secondary' : 'bg-gray-700'}`}
                    style={{
                      left: `${(index / (jlptLevels.length - 1)) * 100}%`,
                      right: `${100 - ((index + 1) / (jlptLevels.length - 1)) * 100}%`,
                      top: '12px',
                    }}
                  />
                )}

                {/* Level indicator */}
                <div
                  className={`w-6 h-6 rounded-full border-2 ${
                    isCurrent
                      ? 'bg-primary border-primary'
                      : isCompleted
                        ? 'bg-secondary border-secondary'
                        : 'bg-gray-700 border-gray-600'
                  } z-10 mb-2`}
                />
                <span
                  className={`text-xs ${
                    isCurrent || isCompleted ? 'text-white font-semibold' : 'text-gray-500'
                  }`}
                >
                  {level}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Progress to Next Level */}
      {nextLevel && (
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-white text-sm">Progress to {nextLevel}</span>
            <span className="text-white text-sm font-semibold">{progressToNextLevel}%</span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-3">
            <div
              className="bg-gradient-to-r from-primary to-secondary h-3 rounded-full transition-all"
              style={{ width: `${progressToNextLevel}%` }}
            />
          </div>
          {estimatedTimeToNextLevel && (
            <p className="text-gray-400 text-xs mt-2">Estimated time: {estimatedTimeToNextLevel}</p>
          )}
        </div>
      )}

      {/* Strengths and Areas for Improvement */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Strengths */}
        {strengths.length > 0 && (
          <div>
            <h4 className="text-white font-medium text-sm mb-2 flex items-center gap-2">
              <span className="text-tertiary-green">✓</span>
              Strengths
            </h4>
            <ul className="space-y-1">
              {strengths.map((strength, index) => (
                <li key={index} className="text-gray-300 text-xs flex items-start gap-2">
                  <span className="text-tertiary-green">•</span>
                  {strength}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Areas for Improvement */}
        {areasForImprovement.length > 0 && (
          <div>
            <h4 className="text-white font-medium text-sm mb-2 flex items-center gap-2">
              <span className="text-tertiary-yellow">⚡</span>
              Focus Areas
            </h4>
            <ul className="space-y-1">
              {areasForImprovement.map((area, index) => (
                <li key={index} className="text-gray-300 text-xs flex items-start gap-2">
                  <span className="text-tertiary-yellow">•</span>
                  {area}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
