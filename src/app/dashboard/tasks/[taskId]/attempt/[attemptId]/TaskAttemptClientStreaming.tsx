'use client';

import { User } from '@/types/user';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import StreamingChatInterface from '@/components/chat/StreamingChatInterface';
import { SimplifiedPostTaskReview } from '@/components/task/SimplifiedPostTaskReview';
import { SimplifiedAssessment } from '@/types/assessment';
import { useStreamingChat } from '@/hooks/useStreamingChat';
import { useTaskFeedbackProgress } from '@/hooks/useTaskFeedbackProgress';
import { initializeObjectives } from '@/lib/ai/objective-detection';

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
      voiceMetadata?: {
        audioUrl?: string;
        audioDuration?: number;
      };
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
    conversationExample: string | string[];
    estimatedDuration: number;
    maxMessages?: number; // Phase 5 - Task Feedback System
  };
}

interface TaskAttemptClientStreamingProps {
  user: User;
  taskId: string;
  attemptId: string;
}

export default function TaskAttemptClientStreaming({ attemptId }: TaskAttemptClientStreamingProps) {
  const router = useRouter();
  const [attempt, setAttempt] = useState<TaskAttempt | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [voiceError, setVoiceError] = useState<string | null>(null);
  const [showPostTaskReview, setShowPostTaskReview] = useState(false);
  const [assessment, setAssessment] = useState<SimplifiedAssessment | null>(null);

  // Initialize task feedback progress hook
  const {
    progress: taskProgress,
    updateObjectives,
    incrementMessageCount,
    dismissCompletionSuggestion,
  } = useTaskFeedbackProgress(
    attemptId,
    attempt?.task?.maxMessages || 30,
    attempt?.task?.estimatedDuration || 10,
    attempt ? initializeObjectives(attempt.task?.learningObjectives || []) : []
  );

  // Initialize streaming chat with existing messages and objective detection callback
  const {
    messages: streamingMessages,
    isStreaming,
    error: streamingError,
    sendMessage,
    clearError: clearStreamingError,
  } = useStreamingChat(
    attemptId,
    attempt?.conversationHistory.messages.map(msg => ({
      role: msg.role as 'user' | 'assistant',
      content: msg.content,
      timestamp: msg.timestamp,
      audioUrl: msg.voiceMetadata?.audioUrl,
    })) || [],
    result => {
      console.log('[TaskAttemptClientStreaming] Objectives detected:', result);
      updateObjectives(result.objectives);
    }
  );

  useEffect(() => {
    fetchAttempt();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [attemptId]);

  const fetchAttempt = async () => {
    try {
      console.log('[TaskAttemptClientStreaming] Fetching attempt:', attemptId);
      const response = await fetch(`/api/task-attempts/${attemptId}`);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        console.error('[TaskAttemptClientStreaming] Failed to fetch attempt:', {
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
      console.log('[TaskAttemptClientStreaming] Loaded attempt:', {
        attemptId: data.attempt.id,
        messageCount: data.attempt.conversationHistory?.messages?.length || 0,
        isCompleted: data.attempt.isCompleted,
        progress: data.progress,
      });
      setAttempt(data.attempt);

      // If task is completed and has feedback, try to parse the simplified assessment
      if (data.attempt.isCompleted && data.attempt.feedback) {
        try {
          const parsedAssessment = JSON.parse(data.attempt.feedback);
          setAssessment(parsedAssessment);
        } catch (parseError) {
          console.log('[TaskAttemptClientStreaming] Could not parse assessment from feedback');
        }
      }
    } catch (err) {
      console.error('[TaskAttemptClientStreaming] Error loading attempt:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleVoiceRecording = async (audioBlob: Blob, duration: number) => {
    if (isStreaming) return;

    setVoiceError(null);

    try {
      const formData = new FormData();
      formData.append('audio', audioBlob, 'recording.webm');

      console.log('🎤 Step 1: Transcribing audio...', {
        size: audioBlob.size,
        duration,
      });

      // STEP 1: Transcribe FIRST and show user message IMMEDIATELY
      const transcribeResponse = await fetch('/api/whisper/transcribe', {
        method: 'POST',
        body: formData,
      });

      if (!transcribeResponse.ok) {
        throw new Error('Failed to transcribe audio');
      }

      const { transcript } = await transcribeResponse.json();
      console.log('✅ Transcription complete:', transcript);

      // STEP 2: Send transcript to streaming API
      // sendMessage() will add both user message and AI response
      console.log('🤖 Sending transcript to AI...');
      await sendMessage(transcript);
    } catch (err) {
      console.error('Voice recording error:', err);
      if (err instanceof Error && !voiceError) {
        setVoiceError(err.message);
      }
    }
  };

  const completeAttempt = async () => {
    try {
      console.log('[TaskAttemptClientStreaming] Generating assessment for attempt:', attemptId);
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
      console.log('[TaskAttemptClientStreaming] Assessment generated:', assessmentData.assessment);

      // Store the assessment and show review
      setAssessment(assessmentData.assessment);
      await fetchAttempt();
      setShowPostTaskReview(true);
    } catch (err) {
      console.error('[TaskAttemptClientStreaming] Error completing task:', err);
      setError(err instanceof Error ? err.message : 'Failed to complete task');
    }
  };

  const resetChat = async () => {
    if (
      !confirm('Are you sure you want to reset this conversation? All messages will be cleared.')
    ) {
      return;
    }

    try {
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
      window.location.reload(); // Reload to reset streaming messages
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reset chat');
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
            <p className="text-primary">{error || 'Task attempt not found'}</p>
            <Button onClick={() => router.push('/dashboard/tasks')} className="mt-4">
              Back to Tasks
            </Button>
          </div>
        </main>
      </div>
    );
  }

  // Create sidebar content
  const sidebarContent = (
    <div className="p-6">
      {/* Voice Error Display */}
      {voiceError && (
        <div className="mb-4 p-3 bg-primary/10 border border-primary/30 rounded-lg">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-sm font-medium text-red-800 dark:text-red-300 mb-1">
                Voice Input Error
              </h3>
              <p className="text-sm text-primary whitespace-pre-line">{voiceError}</p>
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
              Conversation Example
            </h4>
            <div className="bg-gray-50 dark:bg-gray-900 rounded p-3 space-y-2">
              {(Array.isArray(attempt.task.conversationExample)
                ? attempt.task.conversationExample
                : attempt.task.conversationExample.split('\n')
              ).map((line, idx) => (
                <div key={idx} className="text-sm text-gray-600 dark:text-gray-400">
                  {line}
                </div>
              ))}
            </div>
          </div>

          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Estimated Duration:{' '}
              <span className="font-medium">{attempt.task.estimatedDuration} minutes</span>
            </p>
          </div>
        </div>
      )}

      {attempt.isCompleted && assessment && (
        <>
          <div className="mb-4 p-4 bg-tertiary-green/10 rounded-lg">
            <h3 className="text-sm font-medium text-green-800 dark:text-green-300 mb-2">
              Task Completed
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-700 dark:text-gray-300">Objectives:</span>
                <span className="font-medium">
                  {assessment.objectivesAchieved}/{assessment.totalObjectives}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-700 dark:text-gray-300">Duration:</span>
                <span className="font-medium">{assessment.statistics.durationMinutes} min</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-700 dark:text-gray-300">Messages:</span>
                <span className="font-medium">{assessment.statistics.totalMessages}</span>
              </div>
            </div>
          </div>

          {!showPostTaskReview && (
            <Button
              onClick={() => setShowPostTaskReview(true)}
              variant="secondary"
              className="w-full"
            >
              View Detailed Feedback
            </Button>
          )}
        </>
      )}
    </div>
  );

  // Show post-task review modal
  if (showPostTaskReview && attempt.isCompleted && assessment) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <SimplifiedPostTaskReview
          assessment={assessment}
          onRetry={async () => {
            // Create a new attempt for retry
            const response = await fetch('/api/task-attempts', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ taskId: attempt.taskId }),
            });
            if (response.ok) {
              const { attempt: newAttempt } = await response.json();
              router.push(`/dashboard/tasks/${attempt.taskId}/attempt/${newAttempt.id}`);
            }
          }}
          onBackToTasks={() => router.push('/dashboard/tasks')}
        />
      </div>
    );
  }

  return (
    <StreamingChatInterface
      title={attempt.task?.title || 'Task Attempt'}
      subtitle={attempt.task ? `${attempt.task.category} • ${attempt.task.difficulty}` : undefined}
      onBack={() => router.push('/dashboard/tasks')}
      headerActions={
        !attempt.isCompleted ? (
          <>
            <Button onClick={resetChat} variant="outline" size="sm">
              Reset Chat
            </Button>
            <Button onClick={completeAttempt} variant="default" size="sm" disabled={isStreaming}>
              Complete Task
            </Button>
          </>
        ) : null
      }
      messages={streamingMessages}
      isStreaming={isStreaming}
      onSendMessage={sendMessage}
      onVoiceRecording={handleVoiceRecording}
      placeholder="Type your message in Japanese..."
      disabled={attempt.isCompleted}
      enableVoice={!attempt.isCompleted}
      sidebar={sidebarContent}
      sidebarDefaultOpen={false}
      emptyStateMessage="Start your conversation to practice the task scenario!"
      error={streamingError}
      onClearError={clearStreamingError}
      attemptId={attemptId}
      taskProgress={!attempt.isCompleted ? taskProgress : undefined}
      onCompleteTask={completeAttempt}
      onDismissCompletionSuggestion={dismissCompletionSuggestion}
    />
  );
}
