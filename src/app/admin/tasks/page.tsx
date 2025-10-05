'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface Task {
  id: string;
  title: string;
  category: string;
  difficulty: string;
  isActive: boolean;
  usageCount: number;
  averageScore: number | null;
}

export default function AdminTasksPage() {
  const router = useRouter();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterDifficulty, setFilterDifficulty] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    try {
      // TODO: Replace with actual API call
      const mockTasks: Task[] = [
        {
          id: '1',
          title: 'Order Ramen at Restaurant',
          category: 'Restaurant',
          difficulty: 'N5',
          isActive: true,
          usageCount: 145,
          averageScore: 78.5,
        },
        {
          id: '2',
          title: 'Buy Clothes at Department Store',
          category: 'Shopping',
          difficulty: 'N4',
          isActive: true,
          usageCount: 98,
          averageScore: 82.3,
        },
        {
          id: '3',
          title: 'Business Meeting Introduction',
          category: 'Business',
          difficulty: 'N2',
          isActive: true,
          usageCount: 54,
          averageScore: 75.8,
        },
      ];

      setTasks(mockTasks);
    } catch (error) {
      console.error('Failed to load tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = filterCategory === 'all' || task.category === filterCategory;
    const matchesDifficulty = filterDifficulty === 'all' || task.difficulty === filterDifficulty;
    return matchesSearch && matchesCategory && matchesDifficulty;
  });

  const toggleTaskStatus = async (taskId: string) => {
    // TODO: API call to toggle status
    setTasks(
      tasks.map(task => (task.id === taskId ? { ...task, isActive: !task.isActive } : task))
    );
  };

  const deleteTask = async (taskId: string) => {
    if (confirm('Are you sure you want to delete this task?')) {
      // TODO: API call to delete
      setTasks(tasks.filter(task => task.id !== taskId));
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-dark flex items-center justify-center">
        <div className="text-secondary text-xl">Loading tasks...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Task Management</h1>
            <p className="text-gray-400">Create and manage learning tasks</p>
          </div>
          <button
            onClick={() => router.push('/admin/tasks/create')}
            className="bg-primary hover:bg-primary/90 text-white px-6 py-3 rounded-lg font-semibold"
          >
            + Create Task
          </button>
        </div>

        {/* Filters */}
        <div className="bg-tertiary-purple rounded-lg p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <input
              type="text"
              placeholder="Search tasks..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="bg-dark text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <select
              value={filterCategory}
              onChange={e => setFilterCategory(e.target.value)}
              className="bg-dark text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="all">All Categories</option>
              <option value="Restaurant">Restaurant</option>
              <option value="Shopping">Shopping</option>
              <option value="Travel">Travel</option>
              <option value="Business">Business</option>
            </select>
            <select
              value={filterDifficulty}
              onChange={e => setFilterDifficulty(e.target.value)}
              className="bg-dark text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="all">All Difficulties</option>
              <option value="N5">N5</option>
              <option value="N4">N4</option>
              <option value="N3">N3</option>
              <option value="N2">N2</option>
              <option value="N1">N1</option>
            </select>
          </div>
        </div>

        {/* Task List */}
        <div className="bg-tertiary-purple rounded-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-dark">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Task
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Difficulty
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Usage
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Avg Score
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {filteredTasks.map(task => (
                <tr key={task.id} className="hover:bg-dark/50">
                  <td className="px-6 py-4 whitespace-nowrap text-white">{task.title}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-400">{task.category}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 py-1 text-xs rounded-full bg-secondary text-white">
                      {task.difficulty}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-400">{task.usageCount}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-400">
                    {task.averageScore ? `${task.averageScore.toFixed(1)}%` : 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => toggleTaskStatus(task.id)}
                      className={`px-3 py-1 rounded-full text-xs ${
                        task.isActive ? 'bg-tertiary-green text-white' : 'bg-gray-600 text-gray-300'
                      }`}
                    >
                      {task.isActive ? 'Active' : 'Inactive'}
                    </button>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <button
                      onClick={() => router.push(`/admin/tasks/${task.id}`)}
                      className="text-secondary hover:text-secondary/80 mr-3"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => deleteTask(task.id)}
                      className="text-primary hover:text-primary/80"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
