'use client';

import { User } from '@supabase/supabase-js';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import UnifiedChatInterface from '@/components/chat/UnifiedChatInterface';

interface TaskAttempt {
  id: string;
  userId: string;
  taskId: string;
  startTime: string;
  endTime: string | null;
  taskAchievement: number | null;
  fluency: number | null;
  vocabularyGrammarAccuracy: number | null;
  politeness: number | null;
  overallScore: number | null;
  feedback: string | null;
  conversationHistory: {
    messages: Array<{
      role: string;
      content: string;
      timestamp: string;
    }>;
    startedAt: string;
  };
  isCompleted: boolean;
  retryCount: number;
  task?: {
    id: string;
    title: string;
    description: string;
    category: string;
    difficulty: string;
    scenario: string;
    learningObjectives: string[];
    successCriteria: string[];
    estimatedDuration: number;
  };
}

interface TaskAttemptClientProps {
  user: User;
  taskId: string;
  attemptId: string;
}

export default function TaskAttemptClient({ user, taskId, attemptId }: TaskAttemptClientProps) {
  const router = useRouter();
  const [attempt, setAttempt] = useState<TaskAttempt | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    fetchAttempt();
  }, [attemptId]);

  const fetchAttempt = async () => {
    try {
      const response = await fetch(`/api/task-attempts/${attemptId}`);
      if (!response.ok) throw new Error('Failed to fetch task attempt');
      const data = await response.json();
      setAttempt(data.attempt);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async (messageText: string) => {
    if (!messageText.trim() || sending) return;

    setSending(true);
    try {
      const response = await fetch(`/api/task-attempts/${attemptId}/message`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: messageText.trim() }),
      });

      if (!response.ok) throw new Error('Failed to send message');

      const data = await response.json();
      setAttempt(data.attempt);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const handleVoiceRecording = async (audioBlob: Blob) => {
    if (sending) return;

    setSending(true);
    try {
      // Create FormData for audio upload
      const formData = new FormData();
      formData.append('audio', audioBlob, 'recording.webm');

      const response = await fetch(`/api/task-attempts/${attemptId}/voice`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('Failed to process voice input');

      const data = await response.json();

      // Refresh the attempt to get updated conversation
      await fetchAttempt();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to process voice input');
    } finally {
      setSending(false);
    }
  };

  const completeAttempt = async () => {
    try {
      const response = await fetch(`/api/task-attempts/${attemptId}/complete`, {
        method: 'POST',
      });

      if (!response.ok) throw new Error('Failed to complete task');

      const data = await response.json();
      setAttempt(data.attempt);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to complete task');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading task attempt...</p>
        </div>
      </div>
    );
  }

  if (error || !attempt) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <nav className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">Task Attempt</h1>
              <Button onClick={() => router.push('/dashboard/tasks')} variant="secondary">
                Back to Tasks
              </Button>
            </div>
          </div>
        </nav>
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-12">
            <p className="text-red-600 dark:text-red-400">{error || 'Task attempt not found'}</p>
            <Button onClick={() => router.push('/dashboard/tasks')} className="mt-4">
              Back to Tasks
            </Button>
          </div>
        </main>
      </div>
    );
  }

  // Convert conversation messages to Message format
  const messages = attempt.conversationHistory.messages.map((msg, idx) => ({
    id: `${attemptId}-${idx}`,
    content: msg.content,
    isUser: msg.role === 'user',
    timestamp: new Date(msg.timestamp),
  }));

  // Create sidebar content
  const sidebarContent = (
    <div className="p-6">
      <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Task Information</h2>

      {attempt.task && (
        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Scenario</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">{attempt.task.scenario}</p>
          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Learning Objectives
            </h3>
            <ul className="list-disc list-inside text-sm text-gray-600 dark:text-gray-400 space-y-1">
              {attempt.task.learningObjectives.map((obj, idx) => (
                <li key={idx}>{obj}</li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Success Criteria
            </h3>
            <ul className="list-disc list-inside text-sm text-gray-600 dark:text-gray-400 space-y-1">
              {attempt.task.successCriteria.map((criteria, idx) => (
                <li key={idx}>{criteria}</li>
              ))}
            </ul>
          </div>

          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Estimated Duration:{' '}
              <span className="font-medium">{attempt.task.estimatedDuration} minutes</span>
            </p>
          </div>
        </div>
      )}

      {attempt.isCompleted && (
        <div className="mt-6 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
          <h3 className="text-sm font-medium text-green-800 dark:text-green-300 mb-2">
            Assessment Results
          </h3>
          <div className="space-y-2 text-sm">
            {attempt.taskAchievement !== null && (
              <div className="flex justify-between">
                <span className="text-gray-700 dark:text-gray-300">Task Achievement:</span>
                <span className="font-medium">{attempt.taskAchievement}/100</span>
              </div>
            )}
            {attempt.fluency !== null && (
              <div className="flex justify-between">
                <span className="text-gray-700 dark:text-gray-300">Fluency:</span>
                <span className="font-medium">{attempt.fluency}/100</span>
              </div>
            )}
            {attempt.vocabularyGrammarAccuracy !== null && (
              <div className="flex justify-between">
                <span className="text-gray-700 dark:text-gray-300">Accuracy:</span>
                <span className="font-medium">{attempt.vocabularyGrammarAccuracy}/100</span>
              </div>
            )}
            {attempt.politeness !== null && (
              <div className="flex justify-between">
                <span className="text-gray-700 dark:text-gray-300">Politeness:</span>
                <span className="font-medium">{attempt.politeness}/100</span>
              </div>
            )}
            {attempt.overallScore !== null && (
              <div className="flex justify-between pt-2 border-t border-green-200 dark:border-green-700">
                <span className="font-medium text-gray-900 dark:text-white">Overall Score:</span>
                <span className="font-bold">{attempt.overallScore}/100</span>
              </div>
            )}
          </div>
          {attempt.feedback && (
            <div className="mt-4 pt-4 border-t border-green-200 dark:border-green-700">
              <p className="text-sm text-gray-700 dark:text-gray-300">{attempt.feedback}</p>
            </div>
          )}
        </div>
      )}

      {!attempt.isCompleted && (
        <div className="mt-6">
          <Button onClick={completeAttempt} variant="secondary" className="w-full">
            Complete Task
          </Button>
        </div>
      )}

      {attempt.isCompleted && (
        <div className="mt-6 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg text-center">
          <p className="text-green-800 dark:text-green-300 font-medium text-sm">
            Task Completed! Check your results above.
          </p>
        </div>
      )}
    </div>
  );

  return (
    <UnifiedChatInterface
      title={attempt.task?.title || 'Task Attempt'}
      subtitle={attempt.task ? `${attempt.task.category} • ${attempt.task.difficulty}` : undefined}
      onBack={() => router.push('/dashboard/tasks')}
      messages={messages}
      loading={sending}
      onSendMessage={sendMessage}
      onVoiceRecording={handleVoiceRecording}
      placeholder="Type your message in Japanese..."
      disabled={attempt.isCompleted || sending}
      enableVoice={!attempt.isCompleted}
      sidebar={sidebarContent}
      emptyStateMessage="No messages yet. Start the conversation!"
    />
  );
}
