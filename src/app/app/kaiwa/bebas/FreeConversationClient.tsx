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
import { RotateCcw, Plus, Settings, Mic, MessageSquare, Radio } from 'lucide-react';
import useWebRTCAudioSession from '@/hooks/use-webrtc';
import { Tool } from '@/types/conversation';
import { Input } from '@/components/ui/Input';
import { motion } from 'framer-motion';
import { Send, ArrowLeft } from 'lucide-react';

// Chat mode type
type ChatMode = 'normal' | 'realtime';

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

// WebRTC tools (can be extended later)
const webrtcTools: Tool[] = [];

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
  const [chatMode, setChatMode] = useState<ChatMode>('normal');
  const [textInput, setTextInput] = useState('');

  // Initialize streaming chat with custom endpoint (for normal mode)
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

  // WebRTC Audio Session Hook (for realtime mode)
  const {
    isSessionActive,
    handleStartStopClick,
    conversation: webrtcConversation,
    sendTextMessage: sendWebRTCTextMessage,
    isPushToTalkActive,
    startPushToTalk,
    stopPushToTalk,
  } = useWebRTCAudioSession(selectedCharacter?.voice || 'alloy', webrtcTools);

  // Spacebar keyboard shortcut for PTT in realtime mode
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (chatMode === 'realtime' && e.code === 'Space' && isSessionActive && !isPushToTalkActive) {
        // Don't trigger if user is typing in input
        if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
          return;
        }
        e.preventDefault();
        startPushToTalk();
      }
    },
    [chatMode, isSessionActive, isPushToTalkActive, startPushToTalk]
  );

  const handleKeyUp = useCallback(
    (e: KeyboardEvent) => {
      if (chatMode === 'realtime' && e.code === 'Space' && isSessionActive && isPushToTalkActive) {
        if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
          return;
        }
        e.preventDefault();
        stopPushToTalk();
      }
    },
    [chatMode, isSessionActive, isPushToTalkActive, stopPushToTalk]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [handleKeyDown, handleKeyUp]);

  // Handle sending text in realtime mode
  const handleSendWebRTCText = (e: React.FormEvent) => {
    e.preventDefault();
    if (textInput.trim() && isSessionActive) {
      sendWebRTCTextMessage(textInput);
      setTextInput('');
    }
  };

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

  const handleCharacterSelect = async (character: Character, mode: ChatMode) => {
    setSelectedCharacter(character);
    setChatMode(mode);
    setLoading(true);
    setError(null);

    // For realtime mode, we don't need a session - just set the character
    if (mode === 'realtime') {
      setLoading(false);
      return;
    }

    try {
      // Create or get active free conversation session for this character (normal mode only)
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

      // Send transcript to AI with voice flag
      await sendMessage(transcript, true); // true = voice message, generate TTS
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
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent"></div>
          <p className="mt-4 text-muted-foreground">
            キャラクターを読み込み中... / Loading characters...
          </p>
        </div>
      </div>
    );
  }

  // Error state
  if (error && !session) {
    return (
      <div className="min-h-screen bg-background">
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-12">
            <p className="text-destructive">{error}</p>
            <Button onClick={() => router.push('/app/kaiwa')} className="mt-4">
              Kaiwaに戻る / Back to Kaiwa
            </Button>
          </div>
        </main>
      </div>
    );
  }

  // Character selection screen (show when no session AND not in realtime mode with character)
  if (!session && !(chatMode === 'realtime' && selectedCharacter)) {
    return (
      <div className="min-h-screen bg-background">
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {characters.length === 0 ? (
            <EmptyCharacterState />
          ) : (
            <>
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-xl font-bold text-foreground">Daftar Karakter</h2>
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
                    className="flex flex-col items-center p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
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
                    <span className="text-sm font-medium text-foreground text-center truncate w-full mb-3">
                      {character.name}
                    </span>
                    <div className="flex flex-col gap-2 w-full">
                      <Button
                        onClick={() => handleCharacterSelect(character, 'normal')}
                        disabled={loading && selectedCharacter?.id === character.id}
                        size="sm"
                        className="w-full gap-1"
                        variant="outline"
                      >
                        {loading &&
                        selectedCharacter?.id === character.id &&
                        chatMode === 'normal' ? (
                          <div className="h-3 w-3 animate-spin rounded-full border-2 border-solid border-current border-r-transparent"></div>
                        ) : (
                          <>
                            <MessageSquare className="h-3 w-3" />
                            Chat
                          </>
                        )}
                      </Button>
                      <Button
                        onClick={() => handleCharacterSelect(character, 'realtime')}
                        disabled={loading && selectedCharacter?.id === character.id}
                        size="sm"
                        className="w-full gap-1"
                      >
                        {loading &&
                        selectedCharacter?.id === character.id &&
                        chatMode === 'realtime' ? (
                          <div className="h-3 w-3 animate-spin rounded-full border-2 border-solid border-white border-r-transparent"></div>
                        ) : (
                          <>
                            <Radio className="h-3 w-3" />
                            Realtime
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </main>
      </div>
    );
  }

  // Realtime chat interface
  if (chatMode === 'realtime' && selectedCharacter) {
    return (
      <>
        <HideMobileNav />
        <div className="fixed inset-0 flex flex-col bg-background">
          {/* Header */}
          <div className="bg-card border-b border-border px-4 py-3 sm:py-4 flex items-center gap-2 sm:gap-4 shrink-0">
            <button
              onClick={handleBackToCharacterSelect}
              className="p-2 hover:bg-muted rounded-lg transition-colors"
              aria-label="Go back"
            >
              <ArrowLeft className="w-6 h-6 text-foreground" />
            </button>
            <div className="flex-1">
              <h2 className="text-xl font-bold text-foreground">{selectedCharacter.name}と会話</h2>
              <p className="text-sm text-muted-foreground">
                リアルタイム音声会話 / Realtime Voice Chat
              </p>
            </div>
            {isSessionActive && (
              <div className="flex items-center gap-2 px-3 py-1 bg-green-100 dark:bg-green-900/30 rounded-full">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <span className="text-xs text-green-700 dark:text-green-400 font-medium">Live</span>
              </div>
            )}
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4">
            {webrtcConversation.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground">
                <Mic className="h-16 w-16 mb-4 opacity-50" />
                <p className="text-lg font-medium">Tekan Space atau Tahan Tombol untuk Bicara</p>
                <p className="text-sm mt-2">Mode Push-to-Talk menghemat ~50-75% biaya</p>
              </div>
            ) : (
              <div className="space-y-4">
                {webrtcConversation
                  .filter(msg => {
                    if (msg.isFinal && msg.text) return true;
                    if (msg.role === 'assistant' && !msg.isFinal) return true;
                    return false;
                  })
                  .map(msg => (
                    <motion.div
                      key={msg.id}
                      initial={{ opacity: 0, x: msg.role === 'user' ? 20 : -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3 }}
                      className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[80%] rounded-2xl px-4 py-3 shadow-sm ${
                          msg.role === 'user'
                            ? 'bg-secondary text-secondary-foreground'
                            : 'bg-card text-foreground border border-border'
                        }`}
                      >
                        <p className="text-sm whitespace-pre-wrap">{msg.text || '...'}</p>
                        {!msg.isFinal && (
                          <span className="text-xs opacity-70 ml-2">
                            {msg.status === 'speaking'
                              ? '🎤'
                              : msg.status === 'processing'
                                ? '⏳'
                                : ''}
                          </span>
                        )}
                      </div>
                    </motion.div>
                  ))}
              </div>
            )}
          </div>

          {/* Controls Area */}
          <div className="bg-card border-t border-border p-4 space-y-3">
            {/* PTT Status */}
            {isSessionActive && isPushToTalkActive && (
              <div className="bg-primary/10 border border-primary/30 rounded-lg p-2 text-center">
                <div className="flex items-center justify-center gap-2">
                  <Mic className="h-4 w-4 text-primary animate-pulse" />
                  <span className="text-sm font-medium text-primary">
                    Merekam... Lepas untuk mengirim
                  </span>
                </div>
              </div>
            )}

            {/* Control Buttons */}
            {!isSessionActive ? (
              <Button
                onClick={handleStartStopClick}
                className="w-full h-12 text-lg font-semibold"
                variant="default"
              >
                <Mic className="mr-2 h-5 w-5" />
                Mulai Session
              </Button>
            ) : (
              <div className="space-y-2">
                <Button
                  onMouseDown={startPushToTalk}
                  onMouseUp={stopPushToTalk}
                  onTouchStart={startPushToTalk}
                  onTouchEnd={stopPushToTalk}
                  className="w-full h-16 text-lg font-semibold"
                  variant={isPushToTalkActive ? 'destructive' : 'default'}
                >
                  <Mic className="mr-2 h-6 w-6" />
                  {isPushToTalkActive ? 'Merekam...' : 'Tahan untuk Bicara (atau Space)'}
                </Button>
                <Button
                  onClick={handleStartStopClick}
                  className="w-full"
                  variant="outline"
                  size="sm"
                >
                  Akhiri Session
                </Button>
              </div>
            )}

            {/* Text Input */}
            {isSessionActive && (
              <motion.form
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                onSubmit={handleSendWebRTCText}
                className="flex gap-2"
              >
                <Input
                  value={textInput}
                  onChange={e => setTextInput(e.target.value)}
                  placeholder="Ketik pesan..."
                  className="flex-1"
                />
                <Button type="submit" size="icon">
                  <Send className="h-4 w-4" />
                </Button>
              </motion.form>
            )}
          </div>
        </div>
      </>
    );
  }

  // Normal chat interface (when session exists)
  if (session) {
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

  // Fallback - should not reach here
  return null;
}
