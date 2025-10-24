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

interface Flashcard {
  id: string;
  cardType: string;
  // Kanji fields
  kanji?: string;
  kanjiMeaning?: string;
  onyomi?: string;
  kunyomi?: string;
  // Vocabulary fields
  word?: string;
  wordMeaning?: string;
  reading?: string;
  partOfSpeech?: string;
  // Grammar fields
  grammarPoint?: string;
  grammarMeaning?: string;
  usageNote?: string;
  // Common fields
  exampleSentence?: string;
  exampleTranslation?: string;
  notes?: string;
}

interface Deck {
  id: string;
  name: string;
  description: string | null;
  category: string | null;
  difficulty: string | null;
  flashcards: Flashcard[];
  order: number;
}

interface PreTaskStudyClientProps {
  user: User;
  taskId: string;
}

export default function PreTaskStudyClient({ user, taskId }: PreTaskStudyClientProps) {
  const router = useRouter();
  const [task, setTask] = useState<Task | null>(null);
  const [decks, setDecks] = useState<Deck[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchTaskAndDecks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [taskId]);

  const fetchTaskAndDecks = async () => {
    try {
      // Fetch task details
      const taskResponse = await fetch(`/api/tasks/${taskId}`);
      if (!taskResponse.ok) throw new Error('Failed to fetch task');
      const taskData = await taskResponse.json();
      setTask(taskData);

      // Fetch associated decks with flashcards
      const decksResponse = await fetch(`/api/tasks/${taskId}/decks`);
      if (!decksResponse.ok) throw new Error('Failed to fetch decks');
      const decksData = await decksResponse.json();
      setDecks(decksData.decks || []);
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
      console.log('[PreTaskStudy] Starting task attempt:', { taskId, userId: user.id });

      const response = await fetch('/api/task-attempts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ taskId, userId: user.id }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('[PreTaskStudy] Failed to start task:', errorData);
        throw new Error(errorData.error || errorData.details || 'Failed to start task');
      }

      const data = await response.json();
      console.log('[PreTaskStudy] Task attempt response:', {
        isExisting: data.isExisting,
        attemptId: data.attempt.id,
        messageCount: data.attempt.conversationHistory?.messages?.length || 0,
        message: data.message
      });

      if (data.isExisting) {
        console.log('[PreTaskStudy] Resuming existing attempt with', data.attempt.conversationHistory?.messages?.length || 0, 'messages');
      }

      router.push(`/dashboard/tasks/${taskId}/attempt/${data.attempt.id}`);
    } catch (err) {
      console.error('[PreTaskStudy] Error:', err);
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
      decks={decks}
      onSkip={handleSkip}
      onComplete={handleComplete}
    />
  );
}
