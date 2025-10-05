'use client';

import { Character } from '@/types/character';

interface CharacterCardProps {
  character: Character;
  onSelect: (character: Character) => void;
  onEdit?: (character: Character) => void;
  onDelete?: (characterId: string) => void;
}

export function CharacterCard({ character, onSelect, onEdit, onDelete }: CharacterCardProps) {
  const relationshipColors: Record<string, string> = {
    friend: 'bg-tertiary-green',
    colleague: 'bg-secondary',
    stranger: 'bg-tertiary-purple',
    family: 'bg-primary',
  };

  const relationshipColor = relationshipColors[character.relationshipType || 'friend'];

  return (
    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-xl font-bold text-dark">{character.name}</h3>
          {character.relationshipType && (
            <span
              className={`inline-block mt-2 px-3 py-1 ${relationshipColor} text-white text-sm rounded-full`}
            >
              {character.relationshipType.charAt(0).toUpperCase() +
                character.relationshipType.slice(1)}
            </span>
          )}
        </div>
        <div className="flex gap-2">
          {onEdit && character.isUserCreated && (
            <button
              onClick={() => onEdit(character)}
              className="p-2 text-gray-600 hover:text-secondary transition-colors"
              aria-label="Edit character"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                />
              </svg>
            </button>
          )}
          {onDelete && character.isUserCreated && (
            <button
              onClick={() => onDelete(character.id)}
              className="p-2 text-gray-600 hover:text-primary transition-colors"
              aria-label="Delete character"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Description */}
      {character.description && <p className="text-gray-600 mb-4">{character.description}</p>}

      {/* Personality */}
      <div className="space-y-3">
        <div>
          <span className="text-sm font-medium text-dark">Personality:</span>
          <span className="ml-2 px-2 py-1 bg-tertiary-yellow rounded text-sm">
            {character.personality.type.charAt(0).toUpperCase() +
              character.personality.type.slice(1)}
          </span>
        </div>

        {character.personality.traits.length > 0 && (
          <div>
            <span className="text-sm font-medium text-dark block mb-2">Traits:</span>
            <div className="flex flex-wrap gap-2">
              {character.personality.traits.slice(0, 3).map((trait, index) => (
                <span key={index} className="px-2 py-1 bg-gray-100 rounded text-sm text-gray-700">
                  {trait}
                </span>
              ))}
              {character.personality.traits.length > 3 && (
                <span className="px-2 py-1 bg-gray-100 rounded text-sm text-gray-700">
                  +{character.personality.traits.length - 3} more
                </span>
              )}
            </div>
          </div>
        )}

        {character.personality.interests.length > 0 && (
          <div>
            <span className="text-sm font-medium text-dark block mb-2">Interests:</span>
            <div className="flex flex-wrap gap-2">
              {character.personality.interests.slice(0, 3).map((interest, index) => (
                <span
                  key={index}
                  className="px-2 py-1 bg-tertiary-green/20 text-tertiary-purple rounded text-sm"
                >
                  {interest}
                </span>
              ))}
              {character.personality.interests.length > 3 && (
                <span className="px-2 py-1 bg-tertiary-green/20 text-tertiary-purple rounded text-sm">
                  +{character.personality.interests.length - 3} more
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Chat Button */}
      <button
        onClick={() => onSelect(character)}
        className="mt-6 w-full px-4 py-3 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 transition-colors"
      >
        Start Conversation
      </button>

      {/* Preset Badge */}
      {!character.isUserCreated && (
        <div className="mt-3 text-center">
          <span className="text-xs text-gray-500">Preset Character</span>
        </div>
      )}
    </div>
  );
}
