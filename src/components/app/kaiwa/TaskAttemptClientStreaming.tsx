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
import { RotateCcw, Check, Loader2 } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

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
  const [isGeneratingFeedback, setIsGeneratingFeedback] = useState(false);
  const [showIncompleteDialog, setShowIncompleteDialog] = useState(false);

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
    resetMessages,
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
          setShowPostTaskReview(true); // Show feedback page on refresh
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

      // STEP 2: Send transcript to streaming API with voice flag
      // sendMessage() will add both user message and AI response
      console.log('🤖 Sending transcript to AI...');
      await sendMessage(transcript, true); // true = voice message, generate TTS
    } catch (err) {
      console.error('Voice recording error:', err);
      if (err instanceof Error && !voiceError) {
        setVoiceError(err.message);
      }
    }
  };

  const handleCompleteClick = () => {
    if (!taskProgress.allObjectivesCompleted) {
      setShowIncompleteDialog(true);
    } else {
      completeAttempt();
    }
  };

  const completeAttempt = async () => {
    try {
      setShowIncompleteDialog(false);
      setIsGeneratingFeedback(true);
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
    } finally {
      setIsGeneratingFeedback(false);
    }
  };

  const resetChat = async () => {
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
      resetMessages(); // Clear streaming messages without page reload
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reset chat');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent"></div>
          <p className="mt-4 text-muted-foreground">Loading task attempt...</p>
        </div>
      </div>
    );
  }

  if (error || !attempt) {
    return (
      <div className="min-h-screen bg-background">
        <nav className="bg-card border-b border-border">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <h1 className="text-xl font-bold text-foreground">Task Attempt</h1>
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

  // Show loading overlay when generating feedback
  if (isGeneratingFeedback) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
          <p className="mt-4 text-lg font-medium text-foreground">Generating Feedback...</p>
          <p className="mt-2 text-sm text-muted-foreground">
            Please wait while we analyze your conversation
          </p>
        </div>
      </div>
    );
  }

  // Show post-task review modal
  if (showPostTaskReview && attempt.isCompleted && assessment) {
    return (
      <div className="min-h-screen bg-background">
        <SimplifiedPostTaskReview
          assessment={assessment}
          onRetry={async () => {
            // Create a new attempt for retry
            const response = await fetch('/api/task-attempts', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                userId: attempt.userId,
                taskId: attempt.taskId,
                forceNew: true,
              }),
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
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  title="Reset Chat"
                  aria-label="Reset Chat"
                  disabled={isStreaming || isGeneratingFeedback}
                >
                  <RotateCcw className="h-4 w-4" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Reset Conversation?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to reset this conversation? All messages will be cleared
                    and you will start from the beginning.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={resetChat}>Reset</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
            <Button
              onClick={handleCompleteClick}
              variant="default"
              size="icon"
              disabled={isStreaming || isGeneratingFeedback}
              title="Complete Task"
              aria-label="Complete Task"
            >
              {isGeneratingFeedback ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Check className="h-4 w-4" />
              )}
            </Button>
            {/* Alert dialog for incomplete task */}
            <AlertDialog open={showIncompleteDialog} onOpenChange={setShowIncompleteDialog}>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Task Not Complete</AlertDialogTitle>
                  <AlertDialogDescription>
                    You haven&apos;t completed all learning objectives yet (
                    {taskProgress.completedObjectivesCount}/{taskProgress.totalObjectivesCount}{' '}
                    completed). Are you sure you want to finish and get feedback now?
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Continue Practice</AlertDialogCancel>
                  <AlertDialogAction onClick={completeAttempt}>Finish Anyway</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
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
      emptyStateMessage="Start your conversation to practice the task scenario!"
      error={streamingError}
      onClearError={clearStreamingError}
      attemptId={attemptId}
      hintConfig={
        !attempt.isCompleted
          ? {
              type: 'task',
              attemptId: attemptId,
              currentObjective: taskProgress.objectives.find(obj => obj.status === 'pending')
                ?.objectiveText,
            }
          : undefined
      }
      taskProgress={!attempt.isCompleted ? taskProgress : undefined}
      onCompleteTask={completeAttempt}
      onDismissCompletionSuggestion={dismissCompletionSuggestion}
    />
  );
}
