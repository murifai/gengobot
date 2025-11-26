'use client';

import { Character, RelationshipType } from '@/types/character';

interface CharacterCardProps {
  character: Character;
  onSelect: (character: Character) => void;
  onEdit?: (character: Character) => void;
  onDelete?: (characterId: string) => void;
}

export function CharacterCard({ character, onSelect, onEdit, onDelete }: CharacterCardProps) {
  const relationshipColors: Record<RelationshipType, string> = {
    teman: 'bg-tertiary-green',
    guru: 'bg-secondary',
    atasan: 'bg-tertiary-purple',
    pacar: 'bg-primary',
    keluarga: 'bg-tertiary-yellow text-dark',
    lainnya: 'bg-gray-500',
  };

  const relationshipLabels: Record<RelationshipType, string> = {
    teman: 'Teman',
    guru: 'Guru',
    atasan: 'Atasan',
    pacar: 'Pacar',
    keluarga: 'Keluarga',
    lainnya: character.relationshipCustom || 'Lainnya',
  };

  const relationshipColor = relationshipColors[character.relationshipType] || 'bg-gray-500';
  const relationshipLabel =
    relationshipLabels[character.relationshipType] || character.relationshipType;

  return (
    <div className="bg-background rounded-base border-2 border-border shadow-shadow p-6 hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none transition-all">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-xl font-bold text-foreground">{character.name}</h3>
          {character.nameRomaji && character.nameRomaji !== character.name && (
            <p className="text-sm text-muted-foreground">{character.nameRomaji}</p>
          )}
          <span
            className={`inline-block mt-2 px-3 py-1 ${relationshipColor} text-white text-sm rounded-base border-2 border-border`}
          >
            {relationshipLabel}
          </span>
        </div>
        <div className="flex gap-2">
          {onEdit && character.isUserCreated && (
            <button
              onClick={() => onEdit(character)}
              className="p-2 text-muted-foreground hover:text-secondary transition-colors"
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
              className="p-2 text-muted-foreground hover:text-primary transition-colors"
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
      {character.description && (
        <p className="text-muted-foreground mb-4">{character.description}</p>
      )}

      {/* Speaking Style */}
      {character.speakingStyle && (
        <div className="mb-4">
          <span className="text-sm font-medium text-foreground">Gaya Bicara:</span>
          <p className="text-sm text-muted-foreground mt-1">{character.speakingStyle}</p>
        </div>
      )}

      {/* Voice */}
      <div className="mb-4">
        <span className="text-sm font-medium text-foreground">Suara:</span>
        <span className="ml-2 px-2 py-1 bg-secondary-background rounded-base border-2 border-border text-sm capitalize">
          {character.voice}
        </span>
      </div>

      {/* Chat Button */}
      <button
        onClick={() => onSelect(character)}
        className="mt-4 w-full px-4 py-3 bg-primary text-white rounded-base border-2 border-border shadow-shadow font-medium hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none transition-all"
      >
        Mulai Percakapan
      </button>

      {/* Preset Badge */}
      {!character.isUserCreated && (
        <div className="mt-3 text-center">
          <span className="text-xs text-muted-foreground">Karakter Preset</span>
        </div>
      )}
    </div>
  );
}
