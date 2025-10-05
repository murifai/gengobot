'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface Character {
  id: string;
  name: string;
  description: string;
  relationshipType: string;
}

export default function FreeChatConversationPage() {
  const router = useRouter();
  const params = useParams();
  const characterId = params?.characterId as string;

  const [character, setCharacter] = useState<Character | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadCharacter();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [characterId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadCharacter = async () => {
    try {
      // TODO: Replace with actual API call
      const mockCharacter: Character = {
        id: characterId,
        name: 'さくら (Sakura)',
        description: 'A friendly Japanese college student',
        relationshipType: 'friend',
      };

      const welcomeMessage: Message = {
        id: 'welcome',
        role: 'assistant',
        content:
          'こんにちは！今日は何について話したいですか？(Hello! What would you like to talk about today?)',
        timestamp: new Date(),
      };

      setCharacter(mockCharacter);
      setMessages([welcomeMessage]);
    } catch (error) {
      console.error('Failed to load character:', error);
    } finally {
      setLoading(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const sendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputMessage,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');

    // TODO: Call API to get AI response
    setTimeout(() => {
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: "そうですね！面白いですね。(I see! That's interesting.)",
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, aiResponse]);
    }, 1000);
  };

  const toggleRecording = () => {
    setIsRecording(!isRecording);
    // TODO: Implement voice recording
  };

  const endConversation = () => {
    router.push('/free-chat');
  };

  if (loading || !character) {
    return (
      <div className="min-h-screen bg-dark flex items-center justify-center">
        <div className="text-secondary text-xl">Loading conversation...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark flex flex-col">
      {/* Header */}
      <div className="bg-tertiary-purple border-b border-gray-700 px-4 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => router.push('/free-chat')}
              className="text-gray-400 hover:text-white"
            >
              ← Back
            </button>
            <div>
              <h1 className="text-white font-semibold">{character.name}</h1>
              <p className="text-gray-400 text-sm capitalize">{character.relationshipType}</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <button onClick={endConversation} className="text-gray-400 hover:text-white text-sm">
              End Chat
            </button>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="max-w-4xl mx-auto space-y-4">
          {messages.map(message => (
            <MessageBubble key={message.id} message={message} />
          ))}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area */}
      <div className="border-t border-gray-700 bg-tertiary-purple p-4">
        <div className="max-w-4xl mx-auto flex items-center space-x-3">
          <button
            onClick={toggleRecording}
            className={`p-3 rounded-full ${
              isRecording ? 'bg-primary animate-pulse' : 'bg-gray-700 hover:bg-gray-600'
            }`}
          >
            🎤
          </button>
          <input
            type="text"
            value={inputMessage}
            onChange={e => setInputMessage(e.target.value)}
            onKeyPress={e => e.key === 'Enter' && sendMessage()}
            placeholder="Type your message in Japanese..."
            className="flex-1 bg-dark text-white px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary"
          />
          <button
            onClick={sendMessage}
            disabled={!inputMessage.trim()}
            className="bg-secondary hover:bg-secondary/90 disabled:bg-gray-700 disabled:cursor-not-allowed text-white px-6 py-3 rounded-lg transition-all"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}

// Message Bubble Component
function MessageBubble({ message }: { message: Message }) {
  const isUser = message.role === 'user';

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-[70%] rounded-lg p-4 ${
          isUser ? 'bg-primary text-white' : 'bg-tertiary-purple text-white'
        }`}
      >
        <p className="whitespace-pre-wrap">{message.content}</p>
        <p className="text-xs opacity-70 mt-2">
          {new Date(message.timestamp).toLocaleTimeString()}
        </p>
      </div>
    </div>
  );
}
