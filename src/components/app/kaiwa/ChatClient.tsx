'use client';

import { User } from '@/types/user';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { UI_TEXT } from '@/lib/constants/ui-text';

interface Character {
  id: string;
  name: string;
  description: string;
  speakingStyle?: string;
  relationshipType?: string;
}

interface ChatClientProps {
  user: User;
}

export default function ChatClient({ user }: ChatClientProps) {
  const router = useRouter();
  const [characters, setCharacters] = useState<Character[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchCharacters();
  }, []);

  const fetchCharacters = async () => {
    try {
      const response = await fetch('/api/characters');
      if (!response.ok) throw new Error('Failed to fetch characters');
      const data = await response.json();
      setCharacters(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const startChat = async (characterId: string) => {
    try {
      const response = await fetch('/api/free-chat/conversations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ characterId, userId: user.id }),
      });

      if (!response.ok) throw new Error('Failed to start chat');

      const conversation = await response.json();
      router.push(`/app/kaiwa/bebas/${conversation.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start chat');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <nav className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                {UI_TEXT.kaiwa.chatMode}
              </h1>
              <span className="text-sm text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-full">
                {UI_TEXT.kaiwa.textVoiceEnabled}
              </span>
            </div>
            <Button onClick={() => router.push('/dashboard')} variant="secondary">
              {UI_TEXT.common.backToDashboard}
            </Button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">
              {UI_TEXT.kaiwa.loadingCharacters}
            </p>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-primary">{error}</p>
            <Button onClick={fetchCharacters} className="mt-4">
              {UI_TEXT.common.tryAgain}
            </Button>
          </div>
        ) : characters.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600 dark:text-gray-400">
              {UI_TEXT.kaiwa.noCharactersAvailable}
            </p>
            <Button onClick={() => router.push('/profile/characters')} className="mt-4">
              {UI_TEXT.kaiwa.createCharacter}
            </Button>
          </div>
        ) : (
          <>
            <div className="mb-6">
              <p className="text-gray-600 dark:text-gray-400">{UI_TEXT.kaiwa.selectCharacter}</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {characters.map(character => (
                <Card key={character.id} className="p-6 hover:shadow-lg transition-shadow">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {character.name}
                    </h3>
                    <div className="flex gap-1">
                      <span
                        className="text-xs bg-secondary/10 text-foreground px-2 py-1 rounded"
                        title="Text chat enabled"
                      >
                        💬
                      </span>
                      <span
                        className="text-xs bg-tertiary-purple/10 text-tertiary-purple px-2 py-1 rounded"
                        title="Voice chat enabled"
                      >
                        🎙️
                      </span>
                    </div>
                  </div>
                  <p className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-3">
                    {character.description || UI_TEXT.kaiwa.noDescription}
                  </p>
                  <Button onClick={() => startChat(character.id)} className="w-full">
                    {UI_TEXT.kaiwa.startConversation}
                  </Button>
                </Card>
              ))}
            </div>
          </>
        )}
      </main>
    </div>
  );
}
