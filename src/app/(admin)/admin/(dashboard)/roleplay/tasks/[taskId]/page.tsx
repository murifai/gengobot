'use client';

import { useState, useEffect } from 'react';
import { use } from 'react';
import { useRouter } from 'next/navigation';
import { Edit, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export const dynamic = 'force-dynamic';

interface Task {
  id: string;
  title: string;
  description: string;
  category: string;
  difficulty: string;
  scenario: string;
  learningObjectives: string[];
  conversationExample: string[];
  estimatedDuration: number;
  prerequisites: string;
  isActive: boolean;
  usageCount: number;
  averageScore: number | null;
  createdAt: string;
  updatedAt: string;
  character?: {
    id: string;
    name: string;
    description: string;
  };
  _count?: {
    taskAttempts: number;
    conversations: number;
  };
}

export default function ViewTaskPage({ params }: { params: Promise<{ taskId: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const [task, setTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTask();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchTask = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/tasks/${resolvedParams.taskId}`);
      if (response.ok) {
        const data = await response.json();
        setTask(data);
      }
    } catch (error) {
      console.error('Error fetching task:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-600 dark:text-gray-400">Loading...</div>
      </div>
    );
  }

  if (!task) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-red-600">Task not found</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push('/admin/roleplay/tasks')}
            className="mb-4"
          >
            <ArrowLeft size={16} className="mr-2" />
            Back to Tasks
          </Button>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                {task.title}
              </h1>
              <div className="flex gap-2">
                <span
                  className={`px-2 py-1 text-xs font-semibold rounded-full ${
                    task.isActive
                      ? 'bg-tertiary-green/10 text-tertiary-green'
                      : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                  }`}
                >
                  {task.isActive ? 'Active' : 'Inactive'}
                </span>
                <span className="px-2 py-1 text-xs font-semibold rounded-full bg-secondary/10 text-secondary">
                  {task.category}
                </span>
                <span
                  className={`px-2 py-1 text-xs font-semibold rounded-full ${
                    task.difficulty === 'N5' || task.difficulty === 'N4'
                      ? 'bg-tertiary-green/10 text-tertiary-green'
                      : task.difficulty === 'N3'
                        ? 'bg-tertiary-yellow/10 text-foreground'
                        : 'bg-primary/10 text-primary'
                  }`}
                >
                  {task.difficulty}
                </span>
              </div>
            </div>
            <Button
              variant="default"
              onClick={() => router.push(`/admin/roleplay/tasks/${task.id}/edit`)}
            >
              <Edit size={16} className="mr-2" />
              Edit Task
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
            <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Attempts</div>
            <div className="text-2xl font-bold text-primary">{task._count?.taskAttempts || 0}</div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
            <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Conversations</div>
            <div className="text-2xl font-bold text-secondary">
              {task._count?.conversations || 0}
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
            <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Average Score</div>
            <div className="text-2xl font-bold text-tertiary-green">
              {task.averageScore ? task.averageScore.toFixed(1) : 'N/A'}
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
            <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Duration</div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {task.estimatedDuration}min
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Description */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Description
              </h2>
              <p className="text-gray-700 dark:text-gray-300">{task.description}</p>
            </div>

            {/* Scenario */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Scenario</h2>
              <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                {task.scenario}
              </p>
            </div>

            {/* Learning Objectives */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Learning Objectives
              </h2>
              <ul className="list-disc list-inside space-y-2">
                {task.learningObjectives.map((objective, index) => (
                  <li key={index} className="text-gray-700 dark:text-gray-300">
                    {objective}
                  </li>
                ))}
              </ul>
            </div>

            {/* Conversation Example */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Conversation Example
              </h2>
              <div className="bg-gray-50 dark:bg-gray-900 rounded p-4 font-mono text-sm whitespace-pre-wrap">
                {task.conversationExample}
              </div>
            </div>

            {/* Prerequisites */}
            {task.prerequisites && (
              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                  Prerequisites
                </h2>
                <p className="text-gray-700 dark:text-gray-300">{task.prerequisites}</p>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Character Info */}
            {task.character && (
              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Character
                </h2>
                <div className="space-y-2">
                  <div className="text-sm text-gray-600 dark:text-gray-400">Name</div>
                  <div className="font-medium text-gray-900 dark:text-white">
                    {task.character.name}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400 mt-3">Description</div>
                  <div className="text-sm text-gray-700 dark:text-gray-300">
                    {task.character.description}
                  </div>
                </div>
              </div>
            )}

            {/* Metadata */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Metadata</h2>
              <div className="space-y-3">
                <div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Created</div>
                  <div className="text-sm text-gray-900 dark:text-white">
                    {new Date(task.createdAt).toLocaleDateString()}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Last Updated</div>
                  <div className="text-sm text-gray-900 dark:text-white">
                    {new Date(task.updatedAt).toLocaleDateString()}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Task ID</div>
                  <div className="text-xs text-gray-700 dark:text-gray-300 font-mono">
                    {task.id}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
