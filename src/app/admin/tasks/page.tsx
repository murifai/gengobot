'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Search, Edit, Trash2, Eye } from 'lucide-react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';

interface Task {
  id: string;
  title: string;
  description: string;
  category: string;
  difficulty: string;
  isActive: boolean;
  usageCount: number;
  averageScore: number | null;
  createdAt: string;
  character?: {
    id: string;
    name: string;
  };
  _count?: {
    taskAttempts: number;
    conversations: number;
  };
}

export default function AdminTasksPage() {
  const router = useRouter();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterDifficulty, setFilterDifficulty] = useState<string>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/tasks?limit=100');
      if (response.ok) {
        const data = await response.json();
        setTasks(data.tasks || []);
      }
    } catch (error) {
      console.error('Error fetching tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (taskId: string) => {
    if (!confirm('Are you sure you want to deactivate this task?')) return;

    try {
      const response = await fetch(`/api/tasks/${taskId}?deletedBy=admin`, {
        method: 'DELETE',
      });

      if (response.ok) {
        fetchTasks();
      }
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  };

  const filteredTasks = tasks.filter(task => {
    const matchesSearch =
      task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDifficulty = filterDifficulty === 'all' || task.difficulty === filterDifficulty;
    const matchesCategory = filterCategory === 'all' || task.category === filterCategory;
    return matchesSearch && matchesDifficulty && matchesCategory;
  });

  const categories = Array.from(new Set(tasks.map(t => t.category)));
  const difficulties = ['N5', 'N4', 'N3', 'N2', 'N1'];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-600 dark:text-gray-400">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Task Management</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage conversation tasks for task-based chat mode
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
            <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total Tasks</div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">{tasks.length}</div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
            <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Active</div>
            <div className="text-2xl font-bold text-primary">
              {tasks.filter(t => t.isActive).length}
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
            <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total Attempts</div>
            <div className="text-2xl font-bold text-secondary">
              {tasks.reduce((sum, t) => sum + (t._count?.taskAttempts || 0), 0)}
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
            <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Avg Score</div>
            <div className="text-2xl font-bold text-tertiary-green">
              {tasks.length > 0
                ? (tasks.reduce((sum, t) => sum + (t.averageScore || 0), 0) / tasks.length).toFixed(
                    1
                  )
                : '0'}
            </div>
          </div>
        </div>

        {/* Filters & Actions */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm mb-6">
          <div className="flex flex-col md:flex-row gap-4 mb-4">
            <div className="flex-1 relative">
              <Search
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                size={20}
              />
              <Input
                type="text"
                placeholder="Search tasks..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button
              variant="primary"
              className="gap-2"
              onClick={() => router.push('/admin/tasks/new')}
            >
              <Plus size={20} />
              Create Task
            </Button>
          </div>

          <div className="flex flex-wrap gap-2">
            <div className="flex gap-2">
              <span className="text-sm text-gray-600 dark:text-gray-400 self-center">
                Difficulty:
              </span>
              <Button
                variant={filterDifficulty === 'all' ? 'primary' : 'secondary'}
                size="sm"
                onClick={() => setFilterDifficulty('all')}
              >
                All
              </Button>
              {difficulties.map(diff => (
                <Button
                  key={diff}
                  variant={filterDifficulty === diff ? 'primary' : 'secondary'}
                  size="sm"
                  onClick={() => setFilterDifficulty(diff)}
                >
                  {diff}
                </Button>
              ))}
            </div>

            {categories.length > 0 && (
              <div className="flex gap-2 ml-4">
                <span className="text-sm text-gray-600 dark:text-gray-400 self-center">
                  Category:
                </span>
                <Button
                  variant={filterCategory === 'all' ? 'primary' : 'secondary'}
                  size="sm"
                  onClick={() => setFilterCategory('all')}
                >
                  All
                </Button>
                {categories.map(cat => (
                  <Button
                    key={cat}
                    variant={filterCategory === cat ? 'primary' : 'secondary'}
                    size="sm"
                    onClick={() => setFilterCategory(cat)}
                  >
                    {cat}
                  </Button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Tasks List */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Task
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Difficulty
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Character
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Attempts
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {filteredTasks.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                      No tasks found
                    </td>
                  </tr>
                ) : (
                  filteredTasks.map(task => (
                    <tr key={task.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {task.title}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2">
                            {task.description}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                          {task.category}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 py-1 text-xs font-semibold rounded-full ${
                            task.difficulty === 'N5' || task.difficulty === 'N4'
                              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                              : task.difficulty === 'N3'
                                ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                                : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                          }`}
                        >
                          {task.difficulty}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {task.character?.name || 'None'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {task._count?.taskAttempts || 0}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 py-1 text-xs font-semibold rounded-full ${
                            task.isActive
                              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                              : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                          }`}
                        >
                          {task.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => router.push(`/admin/tasks/${task.id}`)}
                          >
                            <Eye size={16} />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => router.push(`/admin/tasks/${task.id}/edit`)}
                          >
                            <Edit size={16} />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => handleDelete(task.id)}>
                            <Trash2 size={16} className="text-red-500" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
