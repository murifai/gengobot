'use client';

import { User } from '@supabase/supabase-js';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import PreTaskStudy from '@/components/task/PreTaskStudy';

interface Task {
  id: string;
  title: string;
  description: string;
  category: string;
  difficulty: string;
  scenario: string;
  learningObjectives: string[];
  successCriteria: string[];
}

interface VocabularyCard {
  id: string;
  front: string;
  back: string;
  reading?: string;
}

interface PreTaskStudyClientProps {
  user: User;
  taskId: string;
}

export default function PreTaskStudyClient({ user, taskId }: PreTaskStudyClientProps) {
  const router = useRouter();
  const [task, setTask] = useState<Task | null>(null);
  const [vocabularyCards, setVocabularyCards] = useState<VocabularyCard[]>([]);
  const [grammarCards, setGrammarCards] = useState<VocabularyCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchTaskAndCards();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [taskId]);

  const fetchTaskAndCards = async () => {
    try {
      // Fetch task details
      const taskResponse = await fetch(`/api/tasks/${taskId}`);
      if (!taskResponse.ok) throw new Error('Failed to fetch task');
      const taskData = await taskResponse.json();
      setTask(taskData); // API returns task directly, not wrapped in { task: ... }

      // TODO: Fetch associated vocabulary and grammar cards
      // For now, using mock data
      // In the future, this should fetch from the deck system based on task.vocabDeckId and task.grammarDeckId
      setVocabularyCards([
        {
          id: '1',
          front: 'こんにちは',
          back: 'Hello, Good afternoon',
          reading: 'konnichiwa',
        },
        {
          id: '2',
          front: 'ありがとう',
          back: 'Thank you',
          reading: 'arigatou',
        },
      ]);

      setGrammarCards([
        {
          id: '1',
          front: '〜ています',
          back: 'Present continuous tense (currently doing)',
          reading: '〜teimasu',
        },
      ]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = async () => {
    await startTaskAttempt();
  };

  const handleComplete = async () => {
    await startTaskAttempt();
  };

  const startTaskAttempt = async () => {
    try {
      const response = await fetch('/api/task-attempts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ taskId, userId: user.id }),
      });

      if (!response.ok) throw new Error('Failed to start task');

      const data = await response.json();
      router.push(`/dashboard/tasks/${taskId}/attempt/${data.attempt.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start task');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  if (error || !task) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 dark:text-red-400">{error || 'Task not found'}</p>
          <button
            onClick={() => router.push('/dashboard/tasks')}
            className="mt-4 px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
          >
            Back to Tasks
          </button>
        </div>
      </div>
    );
  }

  return (
    <PreTaskStudy
      taskId={taskId}
      taskTitle={task.title}
      taskScenario={task.scenario}
      learningObjectives={task.learningObjectives}
      successCriteria={task.successCriteria}
      vocabularyCards={vocabularyCards}
      grammarCards={grammarCards}
      onSkip={handleSkip}
      onComplete={handleComplete}
    />
  );
}
