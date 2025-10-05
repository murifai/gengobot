'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

interface Task {
  id: string;
  title: string;
  description: string;
  category: string;
  difficulty: string;
  estimatedDuration: number;
  usageCount: number;
  averageScore?: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface TaskLibraryProps {
  tasks: Task[];
  onEdit: (taskId: string) => void;
  onDelete: (taskId: string) => Promise<void>;
  onDuplicate: (taskId: string) => Promise<void>;
  onToggleActive: (taskId: string) => Promise<void>;
}

export default function TaskLibrary({
  tasks,
  onEdit,
  onDelete,
  onDuplicate,
  onToggleActive,
}: TaskLibraryProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [difficultyFilter, setDifficultyFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [sortBy, setSortBy] = useState<'title' | 'usage' | 'score' | 'recent'>('recent');

  const categories = ['all', 'Restaurant', 'Shopping', 'Travel', 'Business', 'Healthcare', 'Education', 'Daily Life', 'Emergency', 'Social Events', 'Technology'];
  const difficulties = ['all', 'N5', 'N4', 'N3', 'N2', 'N1'];

  // Filter and sort tasks
  const filteredTasks = tasks
    .filter(task => {
      const matchesSearch =
        task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        task.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = categoryFilter === 'all' || task.category === categoryFilter;
      const matchesDifficulty = difficultyFilter === 'all' || task.difficulty === difficultyFilter;
      const matchesStatus =
        statusFilter === 'all' ||
        (statusFilter === 'active' && task.isActive) ||
        (statusFilter === 'inactive' && !task.isActive);

      return matchesSearch && matchesCategory && matchesDifficulty && matchesStatus;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'title':
          return a.title.localeCompare(b.title);
        case 'usage':
          return b.usageCount - a.usageCount;
        case 'score':
          return (b.averageScore || 0) - (a.averageScore || 0);
        case 'recent':
        default:
          return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
      }
    });

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
      {/* Filters and Search */}
      <div className="bg-tertiary-purple rounded-lg shadow-lg p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Search */}
          <div className="lg:col-span-2">
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search tasks..."
              className="w-full bg-dark text-white border border-gray-700 rounded px-4 py-2 focus:outline-none focus:border-primary"
            />
          </div>

          {/* Category Filter */}
          <select
            value={categoryFilter}
            onChange={e => setCategoryFilter(e.target.value)}
            className="bg-dark text-white border border-gray-700 rounded px-4 py-2 focus:outline-none focus:border-primary"
          >
            {categories.map(cat => (
              <option key={cat} value={cat}>
                {cat === 'all' ? 'All Categories' : cat}
              </option>
            ))}
          </select>

          {/* Difficulty Filter */}
          <select
            value={difficultyFilter}
            onChange={e => setDifficultyFilter(e.target.value)}
            className="bg-dark text-white border border-gray-700 rounded px-4 py-2 focus:outline-none focus:border-primary"
          >
            {difficulties.map(diff => (
              <option key={diff} value={diff}>
                {diff === 'all' ? 'All Levels' : diff}
              </option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value as 'all' | 'active' | 'inactive')}
            className="bg-dark text-white border border-gray-700 rounded px-4 py-2 focus:outline-none focus:border-primary"
          >
            <option value="all">All Status</option>
            <option value="active">Active Only</option>
            <option value="inactive">Inactive Only</option>
          </select>
        </div>

        {/* Sort Options */}
        <div className="mt-4 flex items-center gap-4">
          <span className="text-gray-400 text-sm">Sort by:</span>
          <div className="flex gap-2">
            {[
              { value: 'recent', label: 'Recent' },
              { value: 'title', label: 'Title' },
              { value: 'usage', label: 'Usage' },
              { value: 'score', label: 'Score' },
            ].map(option => (
              <button
                key={option.value}
                onClick={() => setSortBy(option.value as typeof sortBy)}
                className={`px-3 py-1 rounded text-sm transition-colors ${
                  sortBy === option.value
                    ? 'bg-primary text-white'
                    : 'bg-dark text-gray-400 hover:text-white'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Results Summary */}
      <div className="flex items-center justify-between">
        <p className="text-gray-400">
          Showing {filteredTasks.length} of {tasks.length} tasks
        </p>
        <button
          onClick={() => router.push('/admin/tasks/create')}
          className="bg-gradient-to-r from-primary to-secondary text-white font-semibold py-2 px-6 rounded hover:opacity-90 transition-opacity"
        >
          + Create New Task
        </button>
      </div>

      {/* Task List */}
      <div className="space-y-4">
        {filteredTasks.length > 0 ? (
          filteredTasks.map(task => (
            <div
              key={task.id}
              className="bg-tertiary-purple rounded-lg shadow-lg p-6 hover:bg-tertiary-purple/90 transition-colors"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-white font-semibold text-lg">{task.title}</h3>
                    <span className={`${getDifficultyColor(task.difficulty)} text-white px-3 py-1 rounded text-sm`}>
                      {task.difficulty}
                    </span>
                    {!task.isActive && (
                      <span className="bg-gray-600 text-white px-3 py-1 rounded text-sm">Inactive</span>
                    )}
                  </div>
                  <p className="text-gray-300 text-sm mb-2">{task.description}</p>
                  <div className="flex items-center gap-4 text-sm text-gray-400">
                    <span>{task.category}</span>
                    <span>•</span>
                    <span>{task.estimatedDuration} min</span>
                    <span>•</span>
                    <span>{task.usageCount} uses</span>
                    {task.averageScore && (
                      <>
                        <span>•</span>
                        <span className="text-tertiary-green">{task.averageScore}% avg score</span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2 border-t border-gray-700 pt-4">
                <button
                  onClick={() => onEdit(task.id)}
                  className="px-4 py-2 bg-secondary text-white rounded hover:bg-secondary/90 text-sm"
                >
                  Edit
                </button>
                <button
                  onClick={() => onDuplicate(task.id)}
                  className="px-4 py-2 bg-tertiary-yellow text-dark rounded hover:bg-tertiary-yellow/90 text-sm"
                >
                  Duplicate
                </button>
                <button
                  onClick={() => onToggleActive(task.id)}
                  className="px-4 py-2 bg-tertiary-green text-white rounded hover:bg-tertiary-green/90 text-sm"
                >
                  {task.isActive ? 'Deactivate' : 'Activate'}
                </button>
                <button
                  onClick={() => {
                    if (confirm(`Are you sure you want to delete "${task.title}"?`)) {
                      onDelete(task.id);
                    }
                  }}
                  className="px-4 py-2 bg-primary text-white rounded hover:bg-primary/90 text-sm ml-auto"
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="bg-tertiary-purple rounded-lg shadow-lg p-12 text-center">
            <p className="text-gray-400 text-lg">No tasks found matching your criteria.</p>
            <button
              onClick={() => {
                setSearchQuery('');
                setCategoryFilter('all');
                setDifficultyFilter('all');
                setStatusFilter('all');
              }}
              className="mt-4 text-secondary hover:text-secondary/80"
            >
              Clear Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
