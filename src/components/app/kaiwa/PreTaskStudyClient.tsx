'use client';

import { User } from '@/types/user';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import PreTaskStudy from '@/components/task/PreTaskStudy';
import TaskResumeDialog from '@/components/task/TaskResumeDialog';

interface Task {
  id: string;
  title: string;
  description: string;
  category: string;
  difficulty: string;
  scenario: string;
  learningObjectives: string[];
  conversationExample: string[];
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

interface ExistingAttempt {
  id: string;
  conversationHistory: {
    messages: unknown[];
  };
}

export default function PreTaskStudyClient({ user, taskId }: PreTaskStudyClientProps) {
  const router = useRouter();
  const [task, setTask] = useState<Task | null>(null);
  const [decks, setDecks] = useState<Deck[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [existingAttempt, setExistingAttempt] = useState<ExistingAttempt | null>(null);
  const [showResumeDialog, setShowResumeDialog] = useState(false);

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

      // Check for existing incomplete attempt
      await checkExistingAttempt();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const checkExistingAttempt = async () => {
    try {
      const response = await fetch(
        `/api/task-attempts?userId=${user.id}&taskId=${taskId}&incomplete=true`
      );
      if (!response.ok) return;

      const data = await response.json();
      if (data.attempts && data.attempts.length > 0) {
        const attempt = data.attempts[0];
        const messageCount = attempt.conversationHistory?.messages?.length || 0;

        // Only show dialog if there are messages (actual progress)
        if (messageCount > 0) {
          setExistingAttempt(attempt);
          setShowResumeDialog(true);
        }
      }
    } catch (err) {
      console.error('[PreTaskStudy] Error checking existing attempt:', err);
      // Don't block the flow if this fails
    }
  };

  const handleContinueExisting = () => {
    if (existingAttempt) {
      console.log('[PreTaskStudy] Continuing existing attempt:', existingAttempt.id);
      router.push(`/app/kaiwa/roleplay/${taskId}/attempt/${existingAttempt.id}`);
    }
  };

  const handleStartNew = () => {
    // Clear localStorage for the old attempt before starting new
    if (existingAttempt) {
      const storageKey = `chat_messages_${existingAttempt.id}`;
      try {
        localStorage.removeItem(storageKey);
        console.log('[PreTaskStudy] Cleared localStorage for old attempt:', existingAttempt.id);
      } catch (error) {
        console.error('[PreTaskStudy] Failed to clear localStorage:', error);
      }
    }

    setShowResumeDialog(false);
    setExistingAttempt(null);
    // User will go through pre-task steps and then create new attempt
  };

  const handleCancelResume = () => {
    router.push('/app/kaiwa/roleplay');
  };

  const handleCancel = () => {
    // Navigate back to task selection
    router.push('/app/kaiwa/roleplay');
  };

  const handleSkip = async () => {
    // Pass forceNew=true if user chose to start new from dialog
    await startTaskAttempt(existingAttempt === null);
  };

  const handleComplete = async () => {
    // Pass forceNew=true if user chose to start new from dialog
    await startTaskAttempt(existingAttempt === null);
  };

  const startTaskAttempt = async (forceNew = false) => {
    try {
      console.log('[PreTaskStudy] Starting task attempt:', {
        taskId,
        userId: user.id,
        forceNew,
      });

      const response = await fetch('/api/task-attempts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          taskId,
          userId: user.id,
          forceNew,
        }),
      });

      if (!response.ok) {
        let errorData;
        try {
          errorData = await response.json();
        } catch {
          errorData = { error: `Server error: ${response.status} ${response.statusText}` };
        }
        console.error('[PreTaskStudy] Failed to start task:', errorData);
        throw new Error(
          errorData.error || errorData.details || `Failed to start task (${response.status})`
        );
      }

      const data = await response.json();
      console.log('[PreTaskStudy] Task attempt response:', {
        isExisting: data.isExisting,
        attemptId: data.attempt.id,
        messageCount: data.attempt.conversationHistory?.messages?.length || 0,
        message: data.message,
      });

      if (data.isExisting) {
        console.log(
          '[PreTaskStudy] Resuming existing attempt with',
          data.attempt.conversationHistory?.messages?.length || 0,
          'messages'
        );
      }

      router.push(`/app/kaiwa/roleplay/${taskId}/attempt/${data.attempt.id}`);
    } catch (err) {
      console.error('[PreTaskStudy] Error:', err);
      setError(err instanceof Error ? err.message : 'Failed to start task');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (error || !task) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-destructive">{error || 'Task not found'}</p>
          <button
            onClick={() => router.push('/app/kaiwa/roleplay')}
            className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
          >
            Back to Tasks
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Resume Dialog */}
      {existingAttempt && (
        <TaskResumeDialog
          isOpen={showResumeDialog}
          taskTitle={task?.title || 'Task'}
          onContinue={handleContinueExisting}
          onStartNew={handleStartNew}
          onCancel={handleCancelResume}
        />
      )}

      {/* Pre-Task Study Steps */}
      <PreTaskStudy
        taskId={taskId}
        taskTitle={task.title}
        taskScenario={task.scenario}
        learningObjectives={task.learningObjectives}
        conversationExample={
          Array.isArray(task.conversationExample)
            ? task.conversationExample.join('\n')
            : task.conversationExample
        }
        decks={decks}
        onSkip={handleSkip}
        onCancel={handleCancel}
        onComplete={handleComplete}
      />
    </>
  );
}
