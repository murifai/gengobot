'use client';

import { User } from '@/types/user';
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import StreamingChatInterface from '@/components/chat/StreamingChatInterface';
import { useStreamingChat } from '@/hooks/useStreamingChat';
import { CharacterQuickCreateModal } from '@/components/kaiwa/bebas/character-quick-create-modal';
import { EmptyCharacterState } from '@/components/kaiwa/bebas/empty-character-state';

interface Character {
  id: string;
  name: string;
  description: string | null;
  voice: string | null;
  personality: Record<string, unknown>;
  speakingStyle: string | null;
  relationshipType: string | null;
}

interface ConversationSession {
  id: string;
  userId: string;
  characterId: string;
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
  character: Character;
}

interface FreeConversationClientProps {
  user: User;
}

export default function FreeConversationClient({ user }: FreeConversationClientProps) {
  const router = useRouter();
  const [characters, setCharacters] = useState<Character[]>([]);
  const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(null);
  const [session, setSession] = useState<ConversationSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [voiceError, setVoiceError] = useState<string | null>(null);
  const [isQuickCreateOpen, setIsQuickCreateOpen] = useState(false);

  // Initialize streaming chat with custom endpoint
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
    })) || [],
    undefined, // No objective detection for free conversation
    session ? `/api/free-conversation/${session.id}/stream` : undefined
  );

  const loadCharacters = useCallback(async () => {
    try {
      // Fetch user's characters
      const response = await fetch(`/api/characters?userId=${user.id}`);

      if (!response.ok) {
        throw new Error('Failed to load characters');
      }

      const data = await response.json();
      setCharacters(data || []);
    } catch (err) {
      console.error('Error loading characters:', err);
      setError(err instanceof Error ? err.message : 'Failed to load characters');
    } finally {
      setLoading(false);
    }
  }, [user.id]);

  // Load available characters on mount
  useEffect(() => {
    loadCharacters();
  }, [loadCharacters]);

  const handleCharacterSelect = async (character: Character) => {
    setSelectedCharacter(character);
    setLoading(true);
    setError(null);

    try {
      // Create or get active free conversation session for this character
      const response = await fetch('/api/free-conversation/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          characterId: character.id,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to initialize conversation session');
      }

      const data = await response.json();
      setSession(data.session);
    } catch (err) {
      console.error('Error initializing session:', err);
      setError(err instanceof Error ? err.message : 'Failed to initialize session');
      setSelectedCharacter(null);
    } finally {
      setLoading(false);
    }
  };

  const handleBackToCharacterSelect = () => {
    setSession(null);
    setSelectedCharacter(null);
  };

  const handleCharacterCreated = async (character: Character) => {
    // Add to characters list
    setCharacters(prev => [...prev, character]);
    // Auto-select and start session
    await handleCharacterSelect(character);
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

  // Loading state
  if (loading && !session) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">
            キャラクターを読み込み中... / Loading characters...
          </p>
        </div>
      </div>
    );
  }

  // Error state
  if (error && !session) {
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
            <p className="text-primary">{error}</p>
            <Button onClick={() => router.push('/app/kaiwa')} className="mt-4">
              Kaiwaに戻る / Back to Kaiwa
            </Button>
          </div>
        </main>
      </div>
    );
  }

  // Character selection screen
  if (!session) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <nav className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                自由会話 / Free Conversation
              </h1>
              <Button onClick={() => router.push('/app/kaiwa')} variant="secondary">
                Back to Kaiwa
              </Button>
            </div>
          </div>
        </nav>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              会話相手を選んでください / Select Your Conversation Partner
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              キャラクターを選んで、自由に日本語で会話しましょう！ / Choose a character and start
              your free conversation in Japanese!
            </p>
          </div>

          {characters.length === 0 ? (
            <EmptyCharacterState onQuickCreate={() => setIsQuickCreateOpen(true)} />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {characters.map(character => (
                <div
                  key={character.id}
                  className="bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-shadow overflow-hidden"
                >
                  <div className="p-6">
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                      {character.name}
                    </h3>

                    {character.description && (
                      <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-3">
                        {character.description}
                      </p>
                    )}

                    {character.relationshipType && (
                      <div className="mb-4">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                          {character.relationshipType}
                        </span>
                      </div>
                    )}

                    {character.speakingStyle && (
                      <p className="text-xs text-gray-500 dark:text-gray-500 mb-4 italic">
                        &ldquo;{character.speakingStyle}&rdquo;
                      </p>
                    )}

                    <Button
                      onClick={() => handleCharacterSelect(character)}
                      className="w-full"
                      disabled={loading}
                    >
                      {loading && selectedCharacter?.id === character.id ? (
                        <>
                          <div className="inline-block h-4 w-4 mr-2 animate-spin rounded-full border-2 border-solid border-current border-r-transparent"></div>
                          準備中... / Loading...
                        </>
                      ) : (
                        <>会話を始める / Start Conversation</>
                      )}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Quick Create Modal */}
          <CharacterQuickCreateModal
            isOpen={isQuickCreateOpen}
            onClose={() => setIsQuickCreateOpen(false)}
            onCharacterCreated={handleCharacterCreated}
            userId={user.id}
          />
        </main>
      </div>
    );
  }

  // Chat interface (when session exists)
  const sidebarContent = (
    <div className="p-6">
      {/* Character Info */}
      {session.character && (
        <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
            会話相手 / Conversation Partner
          </h3>
          <p className="text-lg font-semibold text-blue-900 dark:text-blue-100">
            {session.character.name}
          </p>
          {session.character.relationshipType && (
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
              {session.character.relationshipType}
            </p>
          )}
        </div>
      )}

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

        <div className="pt-2">
          <Button
            onClick={handleBackToCharacterSelect}
            variant="outline"
            size="sm"
            className="w-full"
          >
            キャラクターを変更 / Change Character
          </Button>
        </div>
      </div>
    </div>
  );

  return (
    <StreamingChatInterface
      title={`${session.character.name}と会話 / Chat with ${session.character.name}`}
      subtitle="日本語で自由に話しましょう / Let's talk freely in Japanese"
      onBack={handleBackToCharacterSelect}
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
