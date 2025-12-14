'use client';

import { User } from '@/types/user';
import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import StreamingChatInterface from '@/components/chat/StreamingChatInterface';
import { useStreamingChat } from '@/hooks/useStreamingChat';
import { EmptyCharacterState } from '@/components/kaiwa/bebas/empty-character-state';
import { CharacterChatHistoryDialog } from '@/components/kaiwa/bebas/CharacterChatHistoryDialog';
import {
  RotateCcw,
  Plus,
  Settings,
  Mic,
  MessageSquare,
  Trash2,
  Clock,
  History,
  ChevronLeft,
} from 'lucide-react';
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import useWebRTCAudioSession from '@/hooks/use-webrtc';
import { Tool } from '@/types/conversation';
import { motion } from 'framer-motion';

// Chat session from history API
interface ChatSession {
  id: string;
  characterId: string | null;
  character: {
    id: string;
    name: string;
    avatar: string | null;
    voice: string | null;
  } | null;
  messageCount: number;
  lastMessage: {
    content: string;
    role: string;
    timestamp: string;
  } | null;
  startTime: string;
  updatedAt: string;
}

// Chatroom limit info
interface ChatroomLimit {
  limit: number; // 0 = unlimited
  used: number;
  canCreate: boolean;
  tier: string;
}

// Helper function to format relative time
function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Baru saja';
  if (diffMins < 60) return `${diffMins} menit lalu`;
  if (diffHours < 24) return `${diffHours} jam lalu`;
  if (diffDays < 7) return `${diffDays} hari lalu`;
  return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
}

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
  const [wasIdleStopped, setWasIdleStopped] = useState(false);
  const idleTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const stopSessionRef = useRef<(() => void) | null>(null);

  // Chat history state
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([]);
  const [chatroomLimit, setChatroomLimit] = useState<ChatroomLimit>({
    limit: 5,
    used: 0,
    canCreate: true,
    tier: 'FREE',
  });
  const [deletingSessionId, setDeletingSessionId] = useState<string | null>(null);

  // Dialog state for character chat history
  const [dialogCharacter, setDialogCharacter] = useState<Character | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

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
    stopSession,
    conversation: webrtcConversation,
    clearConversation,
    isPushToTalkActive,
    startPushToTalk,
    stopPushToTalk,
  } = useWebRTCAudioSession(
    selectedCharacter?.voice || 'alloy',
    webrtcTools,
    selectedCharacter
      ? {
          name: selectedCharacter.name,
          description: selectedCharacter.description,
          speakingStyle: selectedCharacter.speakingStyle,
          relationshipType: selectedCharacter.relationshipType,
        }
      : undefined
  );

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

  // Keep stopSession ref updated
  useEffect(() => {
    stopSessionRef.current = stopSession;
  }, [stopSession]);

  // Idle timeout - stop session after 1 minute of inactivity
  const resetIdleTimeout = useCallback(() => {
    if (idleTimeoutRef.current) {
      clearTimeout(idleTimeoutRef.current);
    }
    if (isSessionActive && chatMode === 'realtime') {
      idleTimeoutRef.current = setTimeout(() => {
        console.log('Session idle timeout - stopping session');
        setWasIdleStopped(true);
        stopSessionRef.current?.();
      }, 60000); // 1 minute
    }
  }, [isSessionActive, chatMode]);

  // Reset idle timeout when conversation changes (new message) or PTT activity
  useEffect(() => {
    if (isSessionActive && chatMode === 'realtime') {
      resetIdleTimeout();
    }
    return () => {
      if (idleTimeoutRef.current) {
        clearTimeout(idleTimeoutRef.current);
      }
    };
  }, [isSessionActive, chatMode, webrtcConversation.length, isPushToTalkActive, resetIdleTimeout]);

  // Cleanup WebRTC session on back button or component unmount
  useEffect(() => {
    const handlePopState = () => {
      if (stopSessionRef.current) {
        stopSessionRef.current();
      }
    };

    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('popstate', handlePopState);
      // Cleanup on unmount
      if (idleTimeoutRef.current) {
        clearTimeout(idleTimeoutRef.current);
      }
    };
  }, []);

  const loadCharacters = useCallback(async () => {
    try {
      // Fetch user's characters (API returns user characters + preset characters)
      const response = await fetch('/api/characters');

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
  }, []);

  // Load chat sessions (history)
  const loadChatSessions = useCallback(async () => {
    try {
      const response = await fetch(`/api/free-conversation/sessions?userId=${user.id}`);
      if (!response.ok) {
        throw new Error('Failed to load chat sessions');
      }
      const data = await response.json();
      setChatSessions(data.sessions || []);
      setChatroomLimit({
        limit: data.limit,
        used: data.used,
        canCreate: data.canCreate,
        tier: data.tier,
      });
    } catch (err) {
      console.error('Error loading chat sessions:', err);
    }
  }, [user.id]);

  // Load available characters and chat sessions on mount
  useEffect(() => {
    loadCharacters();
    loadChatSessions();
  }, [loadCharacters, loadChatSessions]);

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
        // Handle chatroom limit error specifically
        if (response.status === 403 && errorData.error === 'Chatroom limit reached') {
          throw new Error(
            `Batas chatroom tercapai (${errorData.used}/${errorData.limit}). Hapus chatroom lama atau upgrade ke Pro.`
          );
        }
        throw new Error(errorData.error || 'Failed to initialize conversation session');
      }

      const data = await response.json();
      setSession(data.session);
      // Refresh sessions list after creating new session
      loadChatSessions();
    } catch (err) {
      console.error('Error initializing session:', err);
      setError(err instanceof Error ? err.message : 'Failed to initialize session');
      setSelectedCharacter(null);
    } finally {
      setLoading(false);
    }
  };

  // Open an existing chat session from history
  const handleOpenSession = async (chatSession: ChatSession) => {
    if (!chatSession.character) return;

    setLoading(true);
    setError(null);
    setChatMode('normal');

    try {
      // Fetch the full session data
      const response = await fetch(`/api/free-conversation/sessions?userId=${user.id}`);
      if (!response.ok) throw new Error('Failed to load session');

      // Find the character and set it
      const character = characters.find(c => c.id === chatSession.characterId);
      if (character) {
        setSelectedCharacter(character);
      }

      // Use the session endpoint to get or create the session (will return existing)
      const sessionResponse = await fetch('/api/free-conversation/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          characterId: chatSession.characterId,
        }),
      });

      if (!sessionResponse.ok) {
        throw new Error('Failed to open session');
      }

      const data = await sessionResponse.json();
      setSession(data.session);
    } catch (err) {
      console.error('Error opening session:', err);
      setError(err instanceof Error ? err.message : 'Failed to open session');
    } finally {
      setLoading(false);
    }
  };

  // Delete a chat session
  const handleDeleteSession = async (sessionId: string) => {
    if (!confirm('Hapus chatroom ini? Semua riwayat chat akan dihapus permanen.')) {
      return;
    }

    setDeletingSessionId(sessionId);

    try {
      const response = await fetch(`/api/free-conversation/session/${sessionId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete session');
      }

      // Refresh the sessions list
      await loadChatSessions();
    } catch (err) {
      console.error('Error deleting session:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete session');
    } finally {
      setDeletingSessionId(null);
    }
  };

  const handleBackToCharacterSelect = () => {
    // Stop WebRTC session if active
    if (isSessionActive && chatMode === 'realtime') {
      stopSession();
    }
    setSession(null);
    setSelectedCharacter(null);
  };

  // Open dialog when clicking Chat button on character card
  const handleChatClick = (character: Character) => {
    setDialogCharacter(character);
    setIsDialogOpen(true);
  };

  // Close dialog
  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setDialogCharacter(null);
  };

  // Handle starting a new chat from dialog (always normal mode)
  const handleStartNewChatFromDialog = (character: Character) => {
    setIsDialogOpen(false);
    handleCharacterSelect(character, 'normal');
  };

  // Handle opening existing session from dialog
  const handleOpenSessionFromDialog = (chatSession: ChatSession) => {
    setIsDialogOpen(false);
    handleOpenSession(chatSession);
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
            <Button onClick={() => router.push('/kaiwa')} className="mt-4">
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
        {/* Header */}
        <div className="bg-card border-b-2 border-border px-4 py-4 flex items-center gap-4">
          <button
            onClick={() => router.push('/kaiwa')}
            className="p-2 hover:bg-accent rounded-base transition-colors"
            aria-label="Go back"
          >
            <ChevronLeft className="w-7 h-7 text-foreground" />
          </button>
          <h1 className="text-2xl font-bold">Percakapan Bebas</h1>
        </div>

        <div className="container mx-auto px-4 py-8 max-w-7xl">
          {characters.length === 0 ? (
            <EmptyCharacterState />
          ) : (
            <>
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-xl font-bold text-foreground">Daftar Karakter</h2>
                <div className="flex items-center gap-2">
                  <Link href="/profile/characters/new?from=free-chat">
                    <Button size="sm" className="gap-2">
                      <Plus className="h-4 w-4" />
                      Buat Karakter
                    </Button>
                  </Link>
                  <Link href="/profile/characters">
                    <Button size="sm" variant="outline" className="gap-2">
                      <Settings className="h-4 w-4" />
                      Kelola
                    </Button>
                  </Link>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {characters.map(character => {
                  // Check if this character has existing chat sessions
                  const characterSessionCount = chatSessions.filter(
                    s => s.characterId === character.id
                  ).length;

                  return (
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
                        {/* Badge for existing chats */}
                        {characterSessionCount > 0 && (
                          <div className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs font-medium rounded-full w-5 h-5 flex items-center justify-center">
                            {characterSessionCount}
                          </div>
                        )}
                      </div>
                      <span className="text-sm font-medium text-foreground text-center truncate w-full mb-3">
                        {character.name}
                      </span>
                      <div className="flex flex-col gap-2 w-full">
                        <Button
                          onClick={() => handleChatClick(character)}
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
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span className="w-full">
                              <Button
                                disabled={true}
                                size="sm"
                                className="w-full gap-1 opacity-50 cursor-not-allowed"
                              >
                                <Mic className="h-3 w-3" />
                                Realtime
                              </Button>
                            </span>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Fitur sedang dalam pengembangan</p>
                          </TooltipContent>
                        </Tooltip>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Chat History Section */}
              <div className="mt-10 pt-8 border-t border-border">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <History className="h-5 w-5 text-muted-foreground" />
                    <h2 className="text-xl font-bold text-foreground">Riwayat Chat</h2>
                  </div>
                  <span className="text-sm text-muted-foreground px-3 py-1 bg-muted rounded-full">
                    {chatroomLimit.limit === 0
                      ? 'Unlimited'
                      : `${chatroomLimit.used}/${chatroomLimit.limit} chatroom`}
                  </span>
                </div>

                {chatSessions.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <MessageSquare className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p>Belum ada riwayat chat.</p>
                    <p className="text-sm mt-1">Mulai chat dengan karakter di atas!</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {chatSessions.map(chatSession => (
                      <div
                        key={chatSession.id}
                        className="flex items-center gap-4 p-4 rounded-lg border bg-card hover:bg-accent/30 transition-colors"
                      >
                        {/* Character Avatar */}
                        <Avatar className="w-12 h-12 rounded-md shrink-0">
                          {chatSession.character?.avatar && (
                            <AvatarImage
                              src={chatSession.character.avatar}
                              alt={chatSession.character.name}
                              className="rounded-md"
                            />
                          )}
                          <AvatarFallback className="bg-primary/10 text-primary font-medium rounded-md">
                            {chatSession.character ? getInitials(chatSession.character.name) : '?'}
                          </AvatarFallback>
                        </Avatar>

                        {/* Chat Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-foreground truncate">
                              {chatSession.character?.name || 'Unknown'}
                            </span>
                            <span className="text-xs text-muted-foreground shrink-0">
                              {chatSession.messageCount} pesan
                            </span>
                          </div>
                          {chatSession.lastMessage && (
                            <p className="text-sm text-muted-foreground truncate mt-1">
                              {chatSession.lastMessage.role === 'user' ? 'Anda: ' : ''}
                              {chatSession.lastMessage.content}
                            </p>
                          )}
                          <div className="flex items-center gap-1 mt-1">
                            <Clock className="h-3 w-3 text-muted-foreground" />
                            <span className="text-xs text-muted-foreground">
                              {formatRelativeTime(chatSession.updatedAt)}
                            </span>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2 shrink-0">
                          <Button
                            onClick={() => handleOpenSession(chatSession)}
                            size="sm"
                            variant="outline"
                            disabled={loading}
                          >
                            Buka
                          </Button>
                          <Button
                            onClick={() => handleDeleteSession(chatSession.id)}
                            size="sm"
                            variant="ghost"
                            className="text-destructive hover:text-destructive hover:bg-destructive/10"
                            disabled={deletingSessionId === chatSession.id}
                          >
                            {deletingSessionId === chatSession.id ? (
                              <div className="h-4 w-4 animate-spin rounded-full border-2 border-solid border-current border-r-transparent"></div>
                            ) : (
                              <Trash2 className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Upgrade prompt for users at limit */}
                {chatroomLimit.limit > 0 && !chatroomLimit.canCreate && (
                  <div className="mt-4 p-4 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
                    <p className="text-sm text-amber-800 dark:text-amber-200">
                      Batas chatroom tercapai. Hapus chatroom lama atau{' '}
                      <Link
                        href="/profile?tab=subscription"
                        className="font-medium underline hover:no-underline"
                      >
                        upgrade ke Pro
                      </Link>{' '}
                      untuk unlimited chatroom.
                    </p>
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* Character Chat History Dialog */}
        <CharacterChatHistoryDialog
          isOpen={isDialogOpen}
          onClose={handleCloseDialog}
          character={dialogCharacter}
          chatSessions={chatSessions}
          chatroomLimit={chatroomLimit}
          onStartNewChat={handleStartNewChatFromDialog}
          onOpenSession={handleOpenSessionFromDialog}
          onDeleteSession={handleDeleteSession}
          isLoading={loading}
          deletingSessionId={deletingSessionId}
        />
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
          <div className="bg-card border-b-2 border-border px-4 py-4 flex items-center gap-4 shrink-0">
            <button
              onClick={handleBackToCharacterSelect}
              className="p-2 hover:bg-accent rounded-base transition-colors"
              aria-label="Go back"
            >
              <ChevronLeft className="w-7 h-7 text-foreground" />
            </button>
            <div className="flex-1">
              <h2 className="text-xl font-bold text-foreground">{selectedCharacter.name}と会話</h2>
              <p className="text-sm text-muted-foreground">
                リアルタイム音声会話 / Realtime Voice Chat
              </p>
            </div>
            {/* Reset Button */}
            <Button
              onClick={() => {
                if (confirm('Reset percakapan? Semua pesan akan dihapus.')) {
                  clearConversation();
                }
              }}
              variant="outline"
              size="icon"
              title="Reset"
              aria-label="Reset"
              disabled={webrtcConversation.length === 0}
            >
              <RotateCcw className="h-4 w-4" />
            </Button>
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
                onClick={() => {
                  setWasIdleStopped(false);
                  handleStartStopClick();
                }}
                className="w-full h-12 text-lg font-semibold"
                variant="default"
              >
                <Mic className="mr-2 h-5 w-5" />
                {wasIdleStopped ? 'Lanjutkan Session' : 'Mulai Session'}
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
          title={`Ngobrol sama ${session.character.name}`}
          onBack={handleBackToCharacterSelect}
          headerActions={
            <Button
              onClick={resetChat}
              variant="outline"
              size="icon"
              title="Reset"
              aria-label="Reset"
            >
              <RotateCcw className="h-4 w-4" />
            </Button>
          }
          messages={streamingMessages}
          isStreaming={isStreaming}
          onSendMessage={sendMessage}
          onVoiceRecording={handleVoiceRecording}
          placeholder="Tulis pesan kamu pake bahasa Jepang..."
          disabled={false}
          enableVoice={true}
          emptyStateMessage="Ayo mulai ngobrol!"
          error={streamingError}
          onClearError={clearStreamingError}
          attemptId={session.id}
          hintConfig={{
            type: 'free-chat',
            sessionId: session.id,
          }}
        />
      </>
    );
  }

  // Fallback - should not reach here
  return null;
}
