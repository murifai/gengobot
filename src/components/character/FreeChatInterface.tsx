'use client';

import { Character, FreeChatMessage } from '@/types/character';
import UnifiedChatInterface from '../chat/UnifiedChatInterface';
import { Message } from '../conversation/ConversationContainer';

interface FreeChatInterfaceProps {
  character: Character;
  messages: FreeChatMessage[];
  onSendMessage: (content: string) => void;
  onVoiceRecording?: (audioBlob: Blob) => void;
  onBack: () => void;
  isLoading?: boolean;
}

export function FreeChatInterface({
  character,
  messages,
  onSendMessage,
  onVoiceRecording,
  onBack,
  isLoading = false,
}: FreeChatInterfaceProps) {
  // Convert FreeChatMessage to Message format
  const convertedMessages: Message[] = messages.map(msg => ({
    id: msg.id,
    content: msg.content,
    isUser: msg.role === 'user',
    timestamp: new Date(msg.timestamp),
  }));

  const subtitle = character.relationshipType
    ? `${character.relationshipType.charAt(0).toUpperCase() + character.relationshipType.slice(1)} • ${character.personality.type}`
    : character.personality.type;

  return (
    <UnifiedChatInterface
      title={character.name}
      subtitle={subtitle}
      onBack={onBack}
      messages={convertedMessages}
      loading={isLoading}
      onSendMessage={onSendMessage}
      onVoiceRecording={onVoiceRecording}
      placeholder="メッセージを入力... (Type a message...)"
      enableVoice={!!onVoiceRecording}
      emptyStateMessage={`Start a conversation with ${character.name}. ${character.description}`}
    />
  );
}
