'use client';

import { User } from '@/types/user';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

interface Task {
  id: string;
  title: string;
  description: string;
  category: string;
  difficulty: string;
  estimatedDuration: number;
}

interface TasksClientProps {
  user: User;
}

export default function TasksClient({}: TasksClientProps) {
  const router = useRouter();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filteredTasks, setFilteredTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('All');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  useEffect(() => {
    fetchTasks();
  }, []);

  useEffect(() => {
    filterTasks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tasks, selectedDifficulty, selectedCategory]);

  const fetchTasks = async () => {
    try {
      const response = await fetch('/api/tasks');
      if (!response.ok) throw new Error('Failed to fetch tasks');
      const data = await response.json();
      // API returns { tasks: [...], pagination: {...} }
      setTasks(data.tasks || []);
      setFilteredTasks(data.tasks || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const filterTasks = () => {
    let filtered = tasks;

    if (selectedDifficulty !== 'All') {
      filtered = filtered.filter(task => task.difficulty === selectedDifficulty);
    }

    if (selectedCategory !== 'All') {
      filtered = filtered.filter(task => task.category === selectedCategory);
    }

    setFilteredTasks(filtered);
  };

  const startTask = (taskId: string) => {
    // Navigate to pre-task study page
    router.push(`/dashboard/tasks/${taskId}/pre-study`);
  };

  // Get unique difficulties and categories from tasks
  const difficulties = ['All', ...Array.from(new Set(tasks.map(task => task.difficulty)))];
  const categories = ['All', ...Array.from(new Set(tasks.map(task => task.category)))];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <nav className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">Task-Based Learning</h1>
            <Button onClick={() => router.push('/dashboard')} variant="secondary">
              Back to Dashboard
            </Button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filter Section */}
        <div className="mb-6 bg-white dark:bg-gray-800 rounded-lg p-4 shadow">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Filter Tasks</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                By Difficulty
              </label>
              <div className="flex flex-wrap gap-2">
                {difficulties.map(difficulty => (
                  <button
                    key={difficulty}
                    onClick={() => setSelectedDifficulty(difficulty)}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                      selectedDifficulty === difficulty
                        ? 'bg-primary-600 text-white'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                  >
                    {difficulty}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                By Category
              </label>
              <div className="flex flex-wrap gap-2">
                {categories.map(category => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                      selectedCategory === category
                        ? 'bg-secondary-600 text-white'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>
          </div>
          {(selectedDifficulty !== 'All' || selectedCategory !== 'All') && (
            <div className="mt-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Showing {filteredTasks.length} of {tasks.length} tasks
              </p>
            </div>
          )}
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">Loading tasks...</p>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-primary">{error}</p>
            <Button onClick={fetchTasks} className="mt-4">
              Try Again
            </Button>
          </div>
        ) : tasks.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600 dark:text-gray-400">No tasks available yet.</p>
          </div>
        ) : filteredTasks.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600 dark:text-gray-400">
              No tasks match your selected filters. Try adjusting your selection.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTasks.map(task => (
              <Card key={task.id} className="p-6">
                <div className="mb-4">
                  <span className="inline-block px-2 py-1 text-xs font-semibold text-blue-600 bg-secondary/10 dark:text-blue-300 rounded">
                    {task.category}
                  </span>
                  <span className="ml-2 inline-block px-2 py-1 text-xs font-semibold text-gray-600 bg-gray-100 dark:bg-gray-700 dark:text-gray-300 rounded">
                    {task.difficulty}
                  </span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  {task.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                  {task.description}
                </p>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    ~{task.estimatedDuration} min
                  </span>
                  <Button onClick={() => startTask(task.id)}>Start</Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
