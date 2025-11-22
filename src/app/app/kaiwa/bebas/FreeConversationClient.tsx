'use client';

import { User } from '@/types/user';
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import StreamingChatInterface from '@/components/chat/StreamingChatInterface';
import { useStreamingChat } from '@/hooks/useStreamingChat';
import { EmptyCharacterState } from '@/components/kaiwa/bebas/empty-character-state';
import { RotateCcw, Plus, Settings } from 'lucide-react';

// Component to hide mobile navbar
function HideMobileNav() {
  useEffect(() => {
    const nav = document.querySelector('[data-mobile-nav="true"]') as HTMLElement;
    if (nav) {
      nav.style.display = 'none';
      return () => {
        nav.style.display = '';
      };
    }
  }, []);
  return null;
}

interface Character {
  id: string;
  name: string;
  description: string | null;
  avatar: string | null;
  voice: string | null;
  personality: Record<string, unknown>;
  speakingStyle: string | null;
  relationshipType: string | null;
}

// Helper function to get initials from name
function getInitials(name: string): string {
  if (!name) return '?';
  return name
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
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
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {characters.length === 0 ? (
            <EmptyCharacterState />
          ) : (
            <>
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Daftar Karakter</h2>
                <div className="flex items-center gap-2">
                  <Link href="/app/profile/characters/new">
                    <Button size="sm" className="gap-2">
                      <Plus className="h-4 w-4" />
                      Buat Karakter
                    </Button>
                  </Link>
                  <Link href="/app/profile/characters">
                    <Button size="sm" variant="outline" className="gap-2">
                      <Settings className="h-4 w-4" />
                      Kelola
                    </Button>
                  </Link>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {characters.map(character => (
                  <div
                    key={character.id}
                    className="flex flex-col items-center p-4 rounded-lg border bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    <div className="relative w-16 h-16 mb-3">
                      <Avatar className="w-full h-full rounded-md">
                        {character.avatar && (
                          <AvatarImage
                            src={character.avatar}
                            alt={character.name}
                            className="rounded-md"
                          />
                        )}
                        <AvatarFallback className="bg-primary/10 text-primary font-medium text-lg rounded-md">
                          {getInitials(character.name)}
                        </AvatarFallback>
                      </Avatar>
                    </div>
                    <span className="text-sm font-medium text-gray-900 dark:text-white text-center truncate w-full mb-3">
                      {character.name}
                    </span>
                    <Button
                      onClick={() => handleCharacterSelect(character)}
                      disabled={loading && selectedCharacter?.id === character.id}
                      size="sm"
                      className="w-full"
                    >
                      {loading && selectedCharacter?.id === character.id ? (
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-solid border-white border-r-transparent"></div>
                      ) : (
                        'Mulai Chat'
                      )}
                    </Button>
                  </div>
                ))}
              </div>
            </>
          )}
        </main>
      </div>
    );
  }

  // Chat interface (when session exists)
  return (
    <>
      <HideMobileNav />
      <StreamingChatInterface
        title={`${session.character.name}と会話 / Chat with ${session.character.name}`}
        subtitle="日本語で自由に話しましょう / Let's talk freely in Japanese"
        onBack={handleBackToCharacterSelect}
        headerActions={
          <Button
            onClick={resetChat}
            variant="outline"
            size="icon"
            title="リセット / Reset"
            aria-label="リセット / Reset"
          >
            <RotateCcw className="h-4 w-4" />
          </Button>
        }
        messages={streamingMessages}
        isStreaming={isStreaming}
        onSendMessage={sendMessage}
        onVoiceRecording={handleVoiceRecording}
        placeholder="日本語でメッセージを入力... / Type your message in Japanese..."
        disabled={false}
        enableVoice={true}
        emptyStateMessage="自由に会話を始めましょう！ / Start your free conversation!"
        error={streamingError}
        onClearError={clearStreamingError}
        attemptId={session.id}
      />
    </>
  );
}
