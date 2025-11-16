'use client';

import { User } from '@/types/user';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import StreamingChatInterface from '@/components/chat/StreamingChatInterface';
import { useStreamingChat } from '@/hooks/useStreamingChat';

interface ConversationSession {
  id: string;
  userId: string;
  startTime: string;
  endTime: string | null;
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
}

interface FreeConversationClientProps {
  user: User;
}

export default function FreeConversationClient({ user }: FreeConversationClientProps) {
  const router = useRouter();
  const [session, setSession] = useState<ConversationSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [voiceError, setVoiceError] = useState<string | null>(null);

  // Initialize streaming chat
  const {
    messages: streamingMessages,
    isStreaming,
    error: streamingError,
    sendMessage,
    clearError: clearStreamingError,
  } = useStreamingChat(
    session?.id || '',
    session?.conversationHistory.messages.map(msg => ({
      role: msg.role as 'user' | 'assistant',
      content: msg.content,
      timestamp: msg.timestamp,
      audioUrl: msg.voiceMetadata?.audioUrl,
    })) || []
  );

  useEffect(() => {
    initializeSession();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const initializeSession = async () => {
    try {
      // Create or get active free conversation session
      const response = await fetch('/api/free-conversation/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id }),
      });

      if (!response.ok) {
        throw new Error('Failed to initialize conversation session');
      }

      const data = await response.json();
      setSession(data.session);
    } catch (err) {
      console.error('Error initializing session:', err);
      setError(err instanceof Error ? err.message : 'Failed to initialize session');
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

      console.log('🎤 Transcribing audio...', { size: audioBlob.size, duration });

      // Transcribe audio
      const transcribeResponse = await fetch('/api/whisper/transcribe', {
        method: 'POST',
        body: formData,
      });

      if (!transcribeResponse.ok) {
        throw new Error('Failed to transcribe audio');
      }

      const { transcript } = await transcribeResponse.json();
      console.log('✅ Transcription complete:', transcript);

      // Send transcript to AI
      await sendMessage(transcript);
    } catch (err) {
      console.error('Voice recording error:', err);
      if (err instanceof Error && !voiceError) {
        setVoiceError(err.message);
      }
    }
  };

  const resetChat = async () => {
    if (
      !confirm(
        '会話をリセットしますか？すべてのメッセージが削除されます。\nReset conversation? All messages will be cleared.'
      )
    ) {
      return;
    }

    try {
      const response = await fetch(`/api/free-conversation/session/${session?.id}`, {
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

      window.location.reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reset chat');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">
            会話を準備中... / Loading conversation...
          </p>
        </div>
      </div>
    );
  }

  if (error || !session) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <nav className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">Kaiwa Bebas</h1>
              <Button onClick={() => router.push('/app/kaiwa')} variant="secondary">
                Back to Kaiwa
              </Button>
            </div>
          </div>
        </nav>
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-12">
            <p className="text-primary">
              {error || 'セッションが見つかりません / Session not found'}
            </p>
            <Button onClick={() => router.push('/app/kaiwa')} className="mt-4">
              Kaiwaに戻る / Back to Kaiwa
            </Button>
          </div>
        </main>
      </div>
    );
  }

  // Sidebar content
  const sidebarContent = (
    <div className="p-6">
      {/* Voice Error Display */}
      {voiceError && (
        <div className="mb-4 p-3 bg-primary/10 border border-primary/30 rounded-lg">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-sm font-medium text-red-800 dark:text-red-300 mb-1">
                音声入力エラー / Voice Input Error
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

      {/* Free Conversation Tips */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          自由会話のヒント / Free Conversation Tips
        </h3>

        <div>
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            話題の例 / Topic Examples
          </h4>
          <ul className="list-disc list-inside text-sm text-gray-600 dark:text-gray-400 space-y-1">
            <li>日常生活について / Daily life</li>
            <li>趣味や興味 / Hobbies and interests</li>
            <li>旅行の経験 / Travel experiences</li>
            <li>文化や習慣 / Culture and customs</li>
          </ul>
        </div>

        <div>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            自然な会話を楽しんでください！ / Enjoy natural conversation!
          </p>
        </div>

        <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
          <p className="text-xs text-gray-500 dark:text-gray-500">
            メッセージ数: {streamingMessages.length}
          </p>
        </div>
      </div>
    </div>
  );

  return (
    <StreamingChatInterface
      title="自由会話 / Free Conversation"
      subtitle="日本語で自由に話しましょう / Let's talk freely in Japanese"
      onBack={() => router.push('/app/kaiwa')}
      headerActions={
        <Button onClick={resetChat} variant="outline" size="sm">
          リセット / Reset
        </Button>
      }
      messages={streamingMessages}
      isStreaming={isStreaming}
      onSendMessage={sendMessage}
      onVoiceRecording={handleVoiceRecording}
      placeholder="日本語でメッセージを入力... / Type your message in Japanese..."
      disabled={false}
      enableVoice={true}
      sidebar={sidebarContent}
      sidebarDefaultOpen={false}
      emptyStateMessage="自由に会話を始めましょう！ / Start your free conversation!"
      error={streamingError}
      onClearError={clearStreamingError}
      attemptId={session.id}
    />
  );
}
