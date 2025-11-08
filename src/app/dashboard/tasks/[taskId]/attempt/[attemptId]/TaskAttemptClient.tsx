'use client';

import { User } from '@/types/user';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import UnifiedChatInterface from '@/components/chat/UnifiedChatInterface';
import PostTaskReview from '@/components/task/PostTaskReview';

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

export default function TaskAttemptClient({ attemptId }: TaskAttemptClientProps) {
  const router = useRouter();
  const [attempt, setAttempt] = useState<TaskAttempt | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [voiceError, setVoiceError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [showPostTaskReview, setShowPostTaskReview] = useState(false);

  useEffect(() => {
    fetchAttempt();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [attemptId]);

  const fetchAttempt = async () => {
    try {
      console.log('[TaskAttemptClient] Fetching attempt:', attemptId);
      const response = await fetch(`/api/task-attempts/${attemptId}`);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        console.error('[TaskAttemptClient] Failed to fetch attempt:', {
          status: response.status,
          statusText: response.statusText,
          error: errorData,
        });
        throw new Error(
          errorData.error ||
            errorData.details ||
            `Failed to fetch task attempt (${response.status})`
        );
      }

      const data = await response.json();
      console.log('[TaskAttemptClient] Loaded attempt:', {
        attemptId: data.attempt.id,
        messageCount: data.attempt.conversationHistory?.messages?.length || 0,
        isCompleted: data.attempt.isCompleted,
        progress: data.progress,
      });
      setAttempt(data.attempt);
    } catch (err) {
      console.error('[TaskAttemptClient] Error loading attempt:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async (messageText: string) => {
    if (!messageText.trim() || sending || !attempt) return;

    // Optimistic UI update - add user message immediately
    const userMessage = {
      role: 'user',
      content: messageText.trim(),
      timestamp: new Date().toISOString(),
    };

    const optimisticAttempt = {
      ...attempt,
      conversationHistory: {
        ...attempt.conversationHistory,
        messages: [...attempt.conversationHistory.messages, userMessage],
      },
    };

    setAttempt(optimisticAttempt as TaskAttempt);
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
      // Revert optimistic update on error
      setAttempt(attempt);
      setError(err instanceof Error ? err.message : 'Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const handleVoiceRecording = async (audioBlob: Blob, duration: number) => {
    if (sending) return;

    // Clear previous voice error
    setVoiceError(null);
    setSending(true);

    try {
      // Create FormData for audio upload
      const formData = new FormData();
      formData.append('audio', audioBlob, 'recording.webm');

      console.log('Sending voice recording:', {
        size: audioBlob.size,
        type: audioBlob.type,
        duration,
        attemptId,
      });

      const response = await fetch(`/api/task-attempts/${attemptId}/voice`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const responseText = await response.text();
        console.error('Voice API error response:', {
          status: response.status,
          statusText: response.statusText,
          body: responseText,
        });

        let errorData;
        try {
          errorData = JSON.parse(responseText);
        } catch {
          errorData = { error: responseText || 'Failed to process voice input' };
        }

        // Show user-friendly error messages
        const errorMessage = errorData.error || `Server error: ${response.status}`;
        const warnings = errorData.warnings || [];

        if (warnings.length > 0) {
          setVoiceError(`${errorMessage}\n${warnings.join('\n')}`);
        } else {
          setVoiceError(errorMessage);
        }

        throw new Error(errorMessage);
      }

      const data = await response.json();
      console.log('Voice response:', data);

      // Refresh the attempt to get updated conversation
      await fetchAttempt();
    } catch (err) {
      console.error('Voice recording error:', err);
      // Error already set above if it was a response error
      if (err instanceof Error && !voiceError) {
        setVoiceError(err.message);
      }
    } finally {
      setSending(false);
    }
  };

  const completeAttempt = async () => {
    try {
      setSending(true);

      // First, generate the assessment using AI
      console.log('[TaskAttemptClient] Generating assessment for attempt:', attemptId);
      const assessmentResponse = await fetch('/api/assessments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ attemptId }),
      });

      if (!assessmentResponse.ok) {
        const errorData = await assessmentResponse.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to generate assessment');
      }

      const assessmentData = await assessmentResponse.json();
      console.log('[TaskAttemptClient] Assessment generated:', assessmentData.assessment);

      // Refresh the attempt to get the updated data with scores
      await fetchAttempt();

      // Show post-task review
      setShowPostTaskReview(true);
    } catch (err) {
      console.error('[TaskAttemptClient] Error completing task:', err);
      setError(err instanceof Error ? err.message : 'Failed to complete task');
    } finally {
      setSending(false);
    }
  };

  const resetChat = async () => {
    if (
      !confirm('Are you sure you want to reset this conversation? All messages will be cleared.')
    ) {
      return;
    }

    try {
      // Reset the conversation history by updating the attempt
      const response = await fetch(`/api/task-attempts/${attemptId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversationHistory: {
            messages: [],
            startedAt: new Date().toISOString(),
          },
        }),
      });

      if (!response.ok) throw new Error('Failed to reset chat');

      const data = await response.json();
      setAttempt(data.attempt);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reset chat');
    }
  };

  const handleAddToReviewQueue = async (words: string[]) => {
    // TODO: Implement API call to add words to user's review queue
    console.log('Adding words to review queue:', words);
    alert(`${words.length} words will be added to your review queue!`);
  };

  const handleContinueFromReview = () => {
    setShowPostTaskReview(false);
    router.push('/dashboard/tasks');
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
    audioUrl:
      msg.role === 'assistant'
        ? (msg as { voiceMetadata?: { audioUrl?: string } }).voiceMetadata?.audioUrl
        : undefined,
  }));

  // Create sidebar content
  const sidebarContent = (
    <div className="p-6">
      {/* Voice Error Display */}
      {voiceError && (
        <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-sm font-medium text-red-800 dark:text-red-300 mb-1">
                Voice Input Error
              </h3>
              <p className="text-sm text-red-600 dark:text-red-400 whitespace-pre-line">
                {voiceError}
              </p>
            </div>
            <button
              onClick={() => setVoiceError(null)}
              className="text-red-800 dark:text-red-300 hover:text-red-900 dark:hover:text-red-200"
              aria-label="Dismiss error"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Task Information */}
      {attempt.task && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Task Information</h3>

          <div>
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Scenario</h4>
            <p className="text-sm text-gray-600 dark:text-gray-400">{attempt.task.scenario}</p>
          </div>

          <div>
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Learning Objectives
            </h4>
            <ul className="list-disc list-inside text-sm text-gray-600 dark:text-gray-400 space-y-1">
              {attempt.task.learningObjectives.map((obj, idx) => (
                <li key={idx}>{obj}</li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Success Criteria
            </h4>
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
        <>
          <div className="mb-4 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
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

          {!showPostTaskReview && (
            <Button
              onClick={() => setShowPostTaskReview(true)}
              variant="secondary"
              className="w-full"
            >
              View Vocabulary Review
            </Button>
          )}
        </>
      )}
    </div>
  );

  // Show post-task review modal
  if (showPostTaskReview && attempt.isCompleted) {
    // Mock data - TODO: Get actual data from task attempt
    const vocabularyUsed = [
      {
        word: 'こんにちは',
        reading: 'konnichiwa',
        meaning: 'Hello, Good afternoon',
        used: true,
        timesUsed: 2,
      },
      {
        word: 'ありがとう',
        reading: 'arigatou',
        meaning: 'Thank you',
        used: true,
        timesUsed: 1,
      },
    ];

    const missedOpportunities = [
      {
        word: 'すみません',
        reading: 'sumimasen',
        meaning: 'Excuse me, Sorry',
        used: false,
      },
    ];

    const newWordsEncountered = ['お願いします', 'どうも'];

    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="mb-4">
            <Button onClick={() => setShowPostTaskReview(false)} variant="secondary">
              Back to Results
            </Button>
          </div>
          <PostTaskReview
            vocabularyUsed={vocabularyUsed}
            missedOpportunities={missedOpportunities}
            newWordsEncountered={newWordsEncountered}
            onAddToReviewQueue={handleAddToReviewQueue}
            onContinue={handleContinueFromReview}
          />
        </div>
      </div>
    );
  }

  return (
    <UnifiedChatInterface
      title={attempt.task?.title || 'Task Attempt'}
      subtitle={attempt.task ? `${attempt.task.category} • ${attempt.task.difficulty}` : undefined}
      onBack={() => router.push('/dashboard/tasks')}
      headerActions={
        !attempt.isCompleted ? (
          <>
            <Button onClick={resetChat} variant="outline" size="sm">
              Reset Chat
            </Button>
            <Button onClick={completeAttempt} variant="default" size="sm">
              Complete Task
            </Button>
          </>
        ) : null
      }
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
