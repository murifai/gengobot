'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface Character {
  id: string;
  name: string;
  description: string;
  relationshipType: string;
  isUserCreated: boolean;
}

export default function FreeChatPage() {
  const router = useRouter();
  const [characters, setCharacters] = useState<Character[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCharacters();
  }, []);

  const loadCharacters = async () => {
    try {
      // TODO: Replace with actual API call
      const mockCharacters: Character[] = [
        {
          id: '1',
          name: 'さくら (Sakura)',
          description: 'A friendly Japanese college student who loves to help others learn',
          relationshipType: 'friend',
          isUserCreated: false,
        },
        {
          id: '2',
          name: 'たけし (Takeshi)',
          description: 'A businessman who enjoys casual conversations',
          relationshipType: 'colleague',
          isUserCreated: false,
        },
        {
          id: '3',
          name: 'ゆうこ (Yuko)',
          description: 'A kind shop owner with patience for language learners',
          relationshipType: 'stranger',
          isUserCreated: false,
        },
      ];

      setCharacters(mockCharacters);
    } catch (error) {
      console.error('Failed to load characters:', error);
    } finally {
      setLoading(false);
    }
  };

  const startChat = (characterId: string) => {
    router.push(`/free-chat/${characterId}`);
  };

  const createCharacter = () => {
    router.push('/free-chat/create');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-dark flex items-center justify-center">
        <div className="text-secondary text-xl">Loading characters...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Free Chat Mode</h1>
            <p className="text-gray-400">Choose a character for open conversation practice</p>
          </div>
          <button
            onClick={createCharacter}
            className="bg-secondary hover:bg-secondary/90 text-white px-6 py-3 rounded-lg font-semibold"
          >
            + Create Character
          </button>
        </div>

        {/* Info Banner */}
        <div className="bg-tertiary-purple border border-secondary/30 rounded-lg p-4 mb-8">
          <p className="text-gray-300 text-sm">
            💡 <span className="font-semibold">Tip:</span> Free chat mode allows you to have
            open-ended conversations without specific task objectives. Perfect for practicing
            natural conversation flow!
          </p>
        </div>

        {/* Character Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {characters.map(character => (
            <CharacterCard
              key={character.id}
              character={character}
              onStart={() => startChat(character.id)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

// Character Card Component
function CharacterCard({ character, onStart }: { character: Character; onStart: () => void }) {
  const getRelationshipColor = (type: string) => {
    switch (type) {
      case 'friend':
        return 'bg-tertiary-green';
      case 'colleague':
        return 'bg-secondary';
      case 'stranger':
        return 'bg-tertiary-yellow';
      case 'family':
        return 'bg-primary';
      default:
        return 'bg-gray-500';
    }
  };

  const getRelationshipIcon = (type: string) => {
    switch (type) {
      case 'friend':
        return '👥';
      case 'colleague':
        return '💼';
      case 'stranger':
        return '🤝';
      case 'family':
        return '👨‍👩‍👧';
      default:
        return '💬';
    }
  };

  return (
    <div className="bg-tertiary-purple rounded-lg shadow-lg p-6 flex flex-col">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-white font-semibold text-xl mb-1">{character.name}</h3>
          <div className="flex items-center gap-2">
            <span
              className={`${getRelationshipColor(character.relationshipType)} text-white text-xs px-2 py-1 rounded-full`}
            >
              {getRelationshipIcon(character.relationshipType)} {character.relationshipType}
            </span>
            {character.isUserCreated && (
              <span className="bg-primary text-white text-xs px-2 py-1 rounded-full">Custom</span>
            )}
          </div>
        </div>
      </div>

      <p className="text-gray-400 text-sm mb-6 flex-1">{character.description}</p>

      <button
        onClick={onStart}
        className="w-full bg-secondary hover:bg-secondary/90 text-white py-3 rounded-lg font-semibold transition-all"
      >
        Start Conversation
      </button>
    </div>
  );
}
