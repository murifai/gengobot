'use client';

import React from 'react';

interface SkillData {
  category: string;
  tasksCompleted: number;
  averageScore: number;
  improvement: number;
}

interface SkillTrackingProps {
  skills: SkillData[];
}

export default function SkillTracking({ skills }: SkillTrackingProps) {
  const getImprovementColor = (improvement: number) => {
    if (improvement > 0) return 'text-tertiary-green';
    if (improvement < 0) return 'text-primary';
    return 'text-gray-400';
  };

  const getImprovementIcon = (improvement: number) => {
    if (improvement > 0) return '↗';
    if (improvement < 0) return '↘';
    return '→';
  };

  return (
    <div className="bg-tertiary-purple rounded-lg shadow-lg p-6">
      <h3 className="text-white font-semibold text-lg mb-6">Skill Improvement by Category</h3>

      {skills.length > 0 ? (
        <div className="space-y-4">
          {skills.map((skill, index) => (
            <div key={index} className="bg-dark rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex-1">
                  <h4 className="text-white font-medium">{skill.category}</h4>
                  <p className="text-gray-400 text-sm">{skill.tasksCompleted} tasks completed</p>
                </div>
                <div className="text-right">
                  <div className="text-white font-semibold text-lg">{skill.averageScore}%</div>
                  <div className={`text-sm font-medium ${getImprovementColor(skill.improvement)}`}>
                    {getImprovementIcon(skill.improvement)} {Math.abs(skill.improvement)}%
                  </div>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-primary to-secondary h-2 rounded-full transition-all"
                  style={{ width: `${skill.averageScore}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-gray-400 text-center py-8">
          Complete tasks in different categories to track your skill improvement!
        </div>
      )}
    </div>
  );
}
