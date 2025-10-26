'use client';

import { User } from '@supabase/supabase-js';
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import UnifiedChatInterface from '@/components/chat/UnifiedChatInterface';
import { Message } from '@/components/conversation/ConversationContainer';

interface ChatConversationClientProps {
  conversationId: string;
  user: User;
}

interface ConversationData {
  id: string;
  characterId: string;
  userId: string;
  messages: Array<{
    role: 'user' | 'assistant';
    content: string;
    timestamp: string;
  }>;
  createdAt: string;
  updatedAt: string;
}

interface Character {
  id: string;
  name: string;
  description: string;
  personality: Record<string, unknown>;
}

export default function ChatConversationClient({ conversationId }: ChatConversationClientProps) {
  const router = useRouter();
  const [conversation, setConversation] = useState<ConversationData | null>(null);
  const [character, setCharacter] = useState<Character | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch conversation and character data
  useEffect(() => {
    fetchConversation();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversationId]);

  const fetchConversation = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch conversation
      const convResponse = await fetch(`/api/free-chat/conversations/${conversationId}`);
      if (!convResponse.ok) throw new Error('Failed to fetch conversation');
      const convData = await convResponse.json();
      setConversation(convData.conversation);

      // Fetch character
      const charResponse = await fetch(`/api/characters/${convData.conversation.characterId}`);
      if (!charResponse.ok) throw new Error('Failed to fetch character');
      const charData = await charResponse.json();
      setCharacter(charData);

      // Convert messages to Message format
      const formattedMessages: Message[] = convData.conversation.messages.map(
        (msg: { role: string; content: string; timestamp: string }, index: number) => ({
          id: `${conversationId}-${index}`,
          content: msg.content,
          isUser: msg.role === 'user',
          timestamp: new Date(msg.timestamp),
        })
      );
      setMessages(formattedMessages);
    } catch (err) {
      console.error('Error fetching conversation:', err);
      setError(err instanceof Error ? err.message : 'Failed to load conversation');
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = useCallback(
    async (content: string) => {
      if (!content.trim() || sending) return;

      try {
        setSending(true);
        setError(null);

        // Optimistically add user message
        const userMessage: Message = {
          id: `temp-${Date.now()}`,
          content,
          isUser: true,
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, userMessage]);

        // Send message to API
        const response = await fetch(`/api/free-chat/conversations/${conversationId}/messages`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ content }),
        });

        if (!response.ok) throw new Error('Failed to send message');

        const data = await response.json();

        // Update with actual conversation data
        const formattedMessages: Message[] = data.conversation.messages.map(
          (msg: { role: string; content: string; timestamp: string }, index: number) => ({
            id: `${conversationId}-${index}`,
            content: msg.content,
            isUser: msg.role === 'user',
            timestamp: new Date(msg.timestamp),
          })
        );
        setMessages(formattedMessages);
        setConversation(data.conversation);
      } catch (err) {
        console.error('Error sending message:', err);
        setError(err instanceof Error ? err.message : 'Failed to send message');
        // Remove optimistic message on error
        setMessages(prev => prev.slice(0, -1));
      } finally {
        setSending(false);
      }
    },
    [conversationId, sending]
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading conversation...</p>
        </div>
      </div>
    );
  }

  if (error || !conversation || !character) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <p className="text-red-600 dark:text-red-400 mb-4">{error || 'Conversation not found'}</p>
          <button
            onClick={() => router.push('/dashboard/chat')}
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
          >
            Back to Chat
          </button>
        </div>
      </div>
    );
  }

  return (
    <UnifiedChatInterface
      title={character.name}
      subtitle={character.description}
      onBack={() => router.push('/dashboard/chat')}
      messages={messages}
      loading={sending}
      onSendMessage={handleSendMessage}
      placeholder={`Message ${character.name}...`}
      disabled={sending}
      enableVoice={false}
      emptyStateMessage={`Start a conversation with ${character.name}!`}
      className="h-full"
    />
  );
}
