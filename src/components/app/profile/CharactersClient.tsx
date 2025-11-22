'use client';

import { User } from '@/types/user';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

interface Character {
  id: string;
  name: string;
  description: string;
  personality: Record<string, unknown>;
  speakingStyle: string;
  isUserCreated: boolean;
}

interface CharactersClientProps {
  user: User;
}

export default function CharactersClient({}: CharactersClientProps) {
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

  const deleteCharacter = async (id: string) => {
    if (!confirm('Are you sure you want to delete this character?')) return;

    try {
      const response = await fetch(`/api/characters/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete character');

      setCharacters(characters.filter(c => c.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete character');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <nav className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">Manage Characters</h1>
            <div className="flex gap-4">
              <Button onClick={() => router.push('/app/profile/characters/new')}>
                Create Character
              </Button>
              <Button onClick={() => router.push('/dashboard')} variant="secondary">
                Back to Dashboard
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">Loading characters...</p>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-primary">{error}</p>
            <Button onClick={fetchCharacters} className="mt-4">
              Try Again
            </Button>
          </div>
        ) : characters.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              No characters yet. Create your first character!
            </p>
            <Button onClick={() => router.push('/app/profile/characters/new')}>
              Create Character
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {characters.map(character => (
              <Card key={character.id} className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {character.name}
                  </h3>
                  {character.isUserCreated && (
                    <span className="px-2 py-1 text-xs font-semibold text-tertiary-green bg-tertiary-green/10 rounded">
                      Custom
                    </span>
                  )}
                </div>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  {character.description || 'No description available'}
                </p>
                {character.speakingStyle && (
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                    Style: {character.speakingStyle}
                  </p>
                )}
                <div className="flex gap-2">
                  <Button
                    onClick={() => router.push(`/app/profile/characters/${character.id}/edit`)}
                    variant="secondary"
                    className="flex-1"
                  >
                    Edit
                  </Button>
                  {character.isUserCreated && (
                    <Button
                      onClick={() => deleteCharacter(character.id)}
                      variant="destructive"
                      className="flex-1"
                    >
                      Delete
                    </Button>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
