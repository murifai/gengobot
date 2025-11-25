'use client';

import { Button } from '@/components/ui/Button';
import { Dialog, DialogTitle, DialogDescription } from '@/components/ui/Dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { MessageSquare, Plus, Trash2, Clock, AlertCircle } from 'lucide-react';

// Chat session interface
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

// Character interface
interface Character {
  id: string;
  name: string;
  description: string | null;
  avatar: string | null;
  voice: string | null;
  speakingStyle: string | null;
  relationshipType: string | null;
}

// Chatroom limit info
interface ChatroomLimit {
  limit: number;
  used: number;
  canCreate: boolean;
  tier: string;
}

interface CharacterChatHistoryDialogProps {
  isOpen: boolean;
  onClose: () => void;
  character: Character | null;
  chatSessions: ChatSession[];
  chatroomLimit: ChatroomLimit;
  onStartNewChat: (character: Character) => void;
  onOpenSession: (session: ChatSession) => void;
  onDeleteSession: (sessionId: string) => void;
  isLoading: boolean;
  deletingSessionId: string | null;
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

export function CharacterChatHistoryDialog({
  isOpen,
  onClose,
  character,
  chatSessions,
  chatroomLimit,
  onStartNewChat,
  onOpenSession,
  onDeleteSession,
  isLoading,
  deletingSessionId,
}: CharacterChatHistoryDialogProps) {
  if (!character) return null;

  // Filter sessions for this character only
  const characterSessions = chatSessions.filter(session => session.characterId === character.id);

  const handleStartNewChat = () => {
    onStartNewChat(character);
  };

  const handleDeleteClick = (e: React.MouseEvent, sessionId: string) => {
    e.stopPropagation();
    if (confirm('Hapus chatroom ini? Semua riwayat chat akan dihapus permanen.')) {
      onDeleteSession(sessionId);
    }
  };

  // Check if user can create new chatroom
  const canCreateNew = chatroomLimit.canCreate || chatroomLimit.limit === 0;

  return (
    <Dialog open={isOpen} onClose={onClose} size="lg">
      <div className="flex items-start gap-4 mb-4">
        {/* Character Avatar */}
        <Avatar className="w-16 h-16 rounded-lg shrink-0">
          {character.avatar && (
            <AvatarImage src={character.avatar} alt={character.name} className="rounded-lg" />
          )}
          <AvatarFallback className="bg-primary/10 text-primary font-medium text-xl rounded-lg">
            {getInitials(character.name)}
          </AvatarFallback>
        </Avatar>

        <div className="flex-1 min-w-0">
          <DialogTitle className="mb-1">{character.name}</DialogTitle>
          {character.description && (
            <DialogDescription className="mb-0 line-clamp-2">
              {character.description}
            </DialogDescription>
          )}
          {character.relationshipType && (
            <span className="inline-block text-xs bg-primary/10 text-primary px-2 py-0.5 rounded mt-1">
              {character.relationshipType}
            </span>
          )}
        </div>
      </div>

      {/* New Chat Section */}
      <div className="bg-muted/50 rounded-lg p-4 mb-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-medium text-foreground">Mulai Chat Baru</h3>
          {!canCreateNew && (
            <span className="text-xs text-amber-600 dark:text-amber-400 flex items-center gap-1">
              <AlertCircle className="h-3 w-3" />
              Batas tercapai
            </span>
          )}
        </div>

        <Button
          onClick={handleStartNewChat}
          disabled={isLoading || !canCreateNew}
          className="w-full gap-2"
        >
          {isLoading ? (
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-solid border-current border-r-transparent" />
          ) : (
            <Plus className="h-4 w-4" />
          )}
          Mulai Chat Baru
        </Button>

        {!canCreateNew && (
          <p className="text-xs text-muted-foreground mt-2 text-center">
            Hapus chatroom lama atau upgrade ke Pro untuk unlimited
          </p>
        )}
      </div>

      {/* Chat History Section */}
      <div>
        <h3 className="font-medium text-foreground mb-3 flex items-center gap-2">
          <Clock className="h-4 w-4 text-muted-foreground" />
          Riwayat Chat ({characterSessions.length})
        </h3>

        {characterSessions.length === 0 ? (
          <div className="text-center py-6 text-muted-foreground">
            <MessageSquare className="h-10 w-10 mx-auto mb-2 opacity-50" />
            <p className="text-sm">Belum ada riwayat chat dengan {character.name}.</p>
          </div>
        ) : (
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {characterSessions.map(session => (
              <div
                key={session.id}
                className="flex items-center gap-3 p-3 rounded-lg border bg-card hover:bg-accent/30 transition-colors cursor-pointer"
                onClick={() => onOpenSession(session)}
              >
                {/* Chat Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-foreground">
                      {session.messageCount} pesan
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {formatRelativeTime(session.updatedAt)}
                    </span>
                  </div>
                  {session.lastMessage && (
                    <p className="text-xs text-muted-foreground truncate mt-0.5">
                      {session.lastMessage.role === 'user' ? 'Anda: ' : ''}
                      {session.lastMessage.content}
                    </p>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 shrink-0">
                  <Button
                    onClick={e => {
                      e.stopPropagation();
                      onOpenSession(session);
                    }}
                    size="sm"
                    variant="outline"
                    disabled={isLoading}
                  >
                    Lanjutkan
                  </Button>
                  <Button
                    onClick={e => handleDeleteClick(e, session.id)}
                    size="sm"
                    variant="ghost"
                    className="text-destructive hover:text-destructive hover:bg-destructive/10"
                    disabled={deletingSessionId === session.id}
                  >
                    {deletingSessionId === session.id ? (
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-solid border-current border-r-transparent" />
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Close Button */}
      <div className="flex justify-end mt-4 pt-4 border-t border-border">
        <Button variant="outline" onClick={onClose}>
          Tutup
        </Button>
      </div>
    </Dialog>
  );
}
