'use client';

import React from 'react';

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  earnedDate?: Date;
  isEarned: boolean;
}

interface StreakTrackerProps {
  currentStreak: number;
  longestStreak: number;
  achievements: Achievement[];
}

export default function StreakTracker({
  currentStreak,
  longestStreak,
  achievements,
}: StreakTrackerProps) {
  const earnedAchievements = achievements.filter(a => a.isEarned);
  const nextAchievement = achievements.find(a => !a.isEarned);

  return (
    <div className="bg-tertiary-purple rounded-lg shadow-lg p-6">
      <h3 className="text-white font-semibold text-lg mb-6">Streaks & Achievements</h3>

      {/* Streak Display */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-dark rounded-lg p-4 text-center">
          <div className="text-4xl mb-2">🔥</div>
          <div className="text-white text-2xl font-bold">{currentStreak}</div>
          <div className="text-gray-400 text-sm">Current Streak</div>
        </div>
        <div className="bg-dark rounded-lg p-4 text-center">
          <div className="text-4xl mb-2">🏆</div>
          <div className="text-white text-2xl font-bold">{longestStreak}</div>
          <div className="text-gray-400 text-sm">Longest Streak</div>
        </div>
      </div>

      {/* Achievements */}
      <div>
        <h4 className="text-white font-medium text-sm mb-3">
          Achievements ({earnedAchievements.length}/{achievements.length})
        </h4>

        <div className="space-y-2 max-h-64 overflow-y-auto">
          {achievements.map((achievement, index) => (
            <div
              key={achievement.id}
              className={`rounded-lg p-3 ${
                achievement.isEarned
                  ? 'bg-gradient-to-r from-primary/20 to-secondary/20 border border-secondary/30'
                  : 'bg-dark border border-gray-700'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`text-3xl ${achievement.isEarned ? '' : 'opacity-30'}`}>
                  {achievement.icon}
                </div>
                <div className="flex-1">
                  <h5
                    className={`font-medium ${achievement.isEarned ? 'text-white' : 'text-gray-500'}`}
                  >
                    {achievement.title}
                  </h5>
                  <p
                    className={`text-xs ${achievement.isEarned ? 'text-gray-300' : 'text-gray-600'}`}
                  >
                    {achievement.description}
                  </p>
                  {achievement.isEarned && achievement.earnedDate && (
                    <p className="text-xs text-secondary mt-1">
                      Earned {new Date(achievement.earnedDate).toLocaleDateString()}
                    </p>
                  )}
                </div>
                {achievement.isEarned && <div className="text-tertiary-green text-xl">✓</div>}
              </div>
            </div>
          ))}
        </div>

        {/* Next Achievement */}
        {nextAchievement && (
          <div className="mt-4 p-3 bg-dark rounded-lg border border-tertiary-yellow/30">
            <p className="text-xs text-gray-400 mb-1">Next Achievement</p>
            <div className="flex items-center gap-2">
              <span className="text-2xl opacity-50">{nextAchievement.icon}</span>
              <div className="flex-1">
                <p className="text-white text-sm font-medium">{nextAchievement.title}</p>
                <p className="text-gray-400 text-xs">{nextAchievement.description}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
