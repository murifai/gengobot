'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface Task {
  id: string;
  title: string;
  description: string;
  category: string;
  difficulty: string;
  estimatedDuration: number;
  learningObjectives: string[];
}

interface TaskCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
  taskCount: number;
}

export default function TaskChatPage() {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');
  const [tasks, setTasks] = useState<Task[]>([]);
  const [categories, setCategories] = useState<TaskCategory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTaskLibrary();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCategory, selectedDifficulty]);

  const loadTaskLibrary = async () => {
    try {
      // TODO: Replace with actual API calls
      const mockCategories: TaskCategory[] = [
        {
          id: 'restaurant',
          name: 'Restaurant',
          description: 'Food ordering and dining scenarios',
          icon: '🍜',
          taskCount: 8,
        },
        {
          id: 'shopping',
          name: 'Shopping',
          description: 'Shopping and retail scenarios',
          icon: '🛍️',
          taskCount: 6,
        },
        {
          id: 'travel',
          name: 'Travel',
          description: 'Transportation and travel scenarios',
          icon: '✈️',
          taskCount: 7,
        },
        {
          id: 'business',
          name: 'Business',
          description: 'Professional and workplace scenarios',
          icon: '💼',
          taskCount: 5,
        },
      ];

      const mockTasks: Task[] = [
        {
          id: '1',
          title: 'Order Ramen at a Restaurant',
          description: 'Practice ordering food in Japanese at a ramen restaurant',
          category: 'restaurant',
          difficulty: 'N5',
          estimatedDuration: 15,
          learningObjectives: ['Food vocabulary', 'Polite ordering phrases', 'Menu navigation'],
        },
        {
          id: '2',
          title: 'Buy Clothes at Department Store',
          description: 'Shopping for clothing in Japanese',
          category: 'shopping',
          difficulty: 'N4',
          estimatedDuration: 20,
          learningObjectives: ['Clothing vocabulary', 'Size expressions', 'Price negotiation'],
        },
        {
          id: '3',
          title: 'Book Train Tickets',
          description: 'Purchase train tickets in Japanese',
          category: 'travel',
          difficulty: 'N4',
          estimatedDuration: 18,
          learningObjectives: ['Transportation vocabulary', 'Time expressions', 'Direction asking'],
        },
      ];

      setCategories(mockCategories);

      // Filter tasks based on selections
      let filteredTasks = mockTasks;
      if (selectedCategory) {
        filteredTasks = filteredTasks.filter(task => task.category === selectedCategory);
      }
      if (selectedDifficulty !== 'all') {
        filteredTasks = filteredTasks.filter(task => task.difficulty === selectedDifficulty);
      }

      setTasks(filteredTasks);
    } catch (error) {
      console.error('Failed to load task library:', error);
    } finally {
      setLoading(false);
    }
  };

  const startTask = (taskId: string) => {
    router.push(`/task-chat/${taskId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-dark flex items-center justify-center">
        <div className="text-secondary text-xl">Loading task library...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Task-Based Learning</h1>
          <p className="text-gray-400">Choose a task to practice Japanese conversation</p>
        </div>

        {/* Category Selection */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-white mb-4">Categories</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {categories.map(category => (
              <button
                key={category.id}
                onClick={() =>
                  setSelectedCategory(selectedCategory === category.id ? null : category.id)
                }
                className={`p-4 rounded-lg transition-all ${
                  selectedCategory === category.id
                    ? 'bg-primary text-white'
                    : 'bg-tertiary-purple text-white hover:bg-tertiary-purple/80'
                }`}
              >
                <div className="text-3xl mb-2">{category.icon}</div>
                <h3 className="font-semibold">{category.name}</h3>
                <p className="text-sm opacity-80 mt-1">{category.taskCount} tasks</p>
              </button>
            ))}
          </div>
        </div>

        {/* Difficulty Filter */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-white mb-4">Difficulty Level</h2>
          <div className="flex gap-3">
            {['all', 'N5', 'N4', 'N3', 'N2', 'N1'].map(level => (
              <button
                key={level}
                onClick={() => setSelectedDifficulty(level)}
                className={`px-4 py-2 rounded-lg transition-all ${
                  selectedDifficulty === level
                    ? 'bg-secondary text-white'
                    : 'bg-tertiary-purple text-white hover:bg-tertiary-purple/80'
                }`}
              >
                {level === 'all' ? 'All Levels' : level}
              </button>
            ))}
          </div>
        </div>

        {/* Task List */}
        <div>
          <h2 className="text-xl font-semibold text-white mb-4">
            Available Tasks ({tasks.length})
          </h2>
          {tasks.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {tasks.map(task => (
                <TaskCard key={task.id} task={task} onStart={() => startTask(task.id)} />
              ))}
            </div>
          ) : (
            <div className="bg-tertiary-purple rounded-lg p-8 text-center">
              <p className="text-gray-400">
                No tasks found for the selected filters. Try adjusting your selection.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Task Card Component
function TaskCard({ task, onStart }: { task: Task; onStart: () => void }) {
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'N5':
        return 'bg-tertiary-green';
      case 'N4':
        return 'bg-secondary';
      case 'N3':
        return 'bg-tertiary-yellow';
      case 'N2':
        return 'bg-primary';
      case 'N1':
        return 'bg-tertiary-purple';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <div className="bg-tertiary-purple rounded-lg shadow-lg p-6 flex flex-col">
      <div className="flex justify-between items-start mb-3">
        <h3 className="text-white font-semibold text-lg flex-1">{task.title}</h3>
        <span
          className={`${getDifficultyColor(task.difficulty)} text-white text-xs px-2 py-1 rounded-full ml-2`}
        >
          {task.difficulty}
        </span>
      </div>

      <p className="text-gray-400 text-sm mb-4">{task.description}</p>

      <div className="mb-4">
        <p className="text-gray-500 text-xs mb-2">Learning Objectives:</p>
        <ul className="space-y-1">
          {task.learningObjectives.slice(0, 3).map((objective, index) => (
            <li key={index} className="text-gray-400 text-sm flex items-start">
              <span className="text-secondary mr-2">•</span>
              {objective}
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-auto flex items-center justify-between">
        <span className="text-gray-400 text-sm">⏱️ {task.estimatedDuration} min</span>
        <button
          onClick={onStart}
          className="bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-lg transition-all"
        >
          Start Task
        </button>
      </div>
    </div>
  );
}
