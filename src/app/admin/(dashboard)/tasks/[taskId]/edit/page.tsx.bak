'use client';

import { useState, useEffect } from 'react';
import { use } from 'react';
import TaskEditorForm from '@/components/admin/TaskEditorForm';

interface Task {
  id: string;
  title: string;
  description: string;
  category: string;
  difficulty: string;
  scenario: string;
  learningObjectives: string[];
  conversationExample: string;
  estimatedDuration: number;
  prerequisites: string;
  characterId: string | null;
  isActive: boolean;
}

export default function EditTaskPage({ params }: { params: Promise<{ taskId: string }> }) {
  const resolvedParams = use(params);
  const [task, setTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTask();
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
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Edit Task</h1>
          <p className="text-gray-600 dark:text-gray-400">Update task details and settings</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          <TaskEditorForm taskId={resolvedParams.taskId} initialData={task} />
        </div>
      </div>
    </div>
  );
}
