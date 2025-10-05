'use client';

import { useState } from 'react';
import { CharacterCreationData, PersonalityType, RelationshipType } from '@/types/character';

interface CharacterCreatorProps {
  onCharacterCreated: (character: CharacterCreationData) => void;
  onCancel: () => void;
}

const personalityTypes: PersonalityType[] = [
  'friendly',
  'professional',
  'casual',
  'formal',
  'playful',
  'serious',
  'helpful',
  'reserved',
];

const relationshipTypes: RelationshipType[] = ['friend', 'colleague', 'stranger', 'family'];

export function CharacterCreator({ onCharacterCreated, onCancel }: CharacterCreatorProps) {
  const [formData, setFormData] = useState<CharacterCreationData>({
    name: '',
    description: '',
    personality: {
      type: 'friendly',
      traits: [],
      speakingStyle: '',
      interests: [],
      backgroundStory: '',
    },
    relationshipType: 'friend',
    taskSpecific: false,
  });

  const [traitInput, setTraitInput] = useState('');
  const [interestInput, setInterestInput] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onCharacterCreated(formData);
  };

  const addTrait = () => {
    if (traitInput.trim()) {
      setFormData({
        ...formData,
        personality: {
          ...formData.personality,
          traits: [...formData.personality.traits, traitInput.trim()],
        },
      });
      setTraitInput('');
    }
  };

  const removeTrait = (index: number) => {
    setFormData({
      ...formData,
      personality: {
        ...formData.personality,
        traits: formData.personality.traits.filter((_, i) => i !== index),
      },
    });
  };

  const addInterest = () => {
    if (interestInput.trim()) {
      setFormData({
        ...formData,
        personality: {
          ...formData.personality,
          interests: [...formData.personality.interests, interestInput.trim()],
        },
      });
      setInterestInput('');
    }
  };

  const removeInterest = (index: number) => {
    setFormData({
      ...formData,
      personality: {
        ...formData.personality,
        interests: formData.personality.interests.filter((_, i) => i !== index),
      },
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold text-dark mb-6">Create New Character</h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <div>
          <label className="block text-sm font-medium text-dark mb-2">Character Name</label>
          <input
            type="text"
            value={formData.name}
            onChange={e => setFormData({ ...formData, name: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            placeholder="e.g., Tanaka-san"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-dark mb-2">Description</label>
          <textarea
            value={formData.description}
            onChange={e => setFormData({ ...formData, description: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            placeholder="Brief description of your character..."
            rows={3}
          />
        </div>

        {/* Relationship Type */}
        <div>
          <label className="block text-sm font-medium text-dark mb-2">Relationship Type</label>
          <select
            value={formData.relationshipType}
            onChange={e =>
              setFormData({
                ...formData,
                relationshipType: e.target.value as RelationshipType,
              })
            }
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
          >
            {relationshipTypes.map(type => (
              <option key={type} value={type}>
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </option>
            ))}
          </select>
        </div>

        {/* Personality Type */}
        <div>
          <label className="block text-sm font-medium text-dark mb-2">Personality Type</label>
          <select
            value={formData.personality.type}
            onChange={e =>
              setFormData({
                ...formData,
                personality: {
                  ...formData.personality,
                  type: e.target.value as PersonalityType,
                },
              })
            }
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
          >
            {personalityTypes.map(type => (
              <option key={type} value={type}>
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </option>
            ))}
          </select>
        </div>

        {/* Personality Traits */}
        <div>
          <label className="block text-sm font-medium text-dark mb-2">Personality Traits</label>
          <div className="flex gap-2 mb-2">
            <input
              type="text"
              value={traitInput}
              onChange={e => setTraitInput(e.target.value)}
              onKeyPress={e => e.key === 'Enter' && (e.preventDefault(), addTrait())}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder="Add a trait (e.g., patient, funny)"
            />
            <button
              type="button"
              onClick={addTrait}
              className="px-4 py-2 bg-secondary text-white rounded-lg hover:bg-secondary/90"
            >
              Add
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {formData.personality.traits.map((trait, index) => (
              <span
                key={index}
                className="inline-flex items-center gap-1 px-3 py-1 bg-tertiary-yellow rounded-full text-sm"
              >
                {trait}
                <button
                  type="button"
                  onClick={() => removeTrait(index)}
                  className="text-dark hover:text-primary"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>

        {/* Speaking Style */}
        <div>
          <label className="block text-sm font-medium text-dark mb-2">Speaking Style</label>
          <input
            type="text"
            value={formData.personality.speakingStyle}
            onChange={e =>
              setFormData({
                ...formData,
                personality: {
                  ...formData.personality,
                  speakingStyle: e.target.value,
                },
              })
            }
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            placeholder="e.g., Polite and encouraging, uses casual language"
          />
        </div>

        {/* Interests */}
        <div>
          <label className="block text-sm font-medium text-dark mb-2">Interests</label>
          <div className="flex gap-2 mb-2">
            <input
              type="text"
              value={interestInput}
              onChange={e => setInterestInput(e.target.value)}
              onKeyPress={e => e.key === 'Enter' && (e.preventDefault(), addInterest())}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder="Add an interest (e.g., cooking, sports)"
            />
            <button
              type="button"
              onClick={addInterest}
              className="px-4 py-2 bg-secondary text-white rounded-lg hover:bg-secondary/90"
            >
              Add
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {formData.personality.interests.map((interest, index) => (
              <span
                key={index}
                className="inline-flex items-center gap-1 px-3 py-1 bg-tertiary-green rounded-full text-sm"
              >
                {interest}
                <button
                  type="button"
                  onClick={() => removeInterest(index)}
                  className="text-dark hover:text-primary"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>

        {/* Background Story */}
        <div>
          <label className="block text-sm font-medium text-dark mb-2">Background Story</label>
          <textarea
            value={formData.personality.backgroundStory}
            onChange={e =>
              setFormData({
                ...formData,
                personality: {
                  ...formData.personality,
                  backgroundStory: e.target.value,
                },
              })
            }
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            placeholder="Brief background story for your character..."
            rows={4}
          />
        </div>

        {/* Actions */}
        <div className="flex gap-4">
          <button
            type="submit"
            className="flex-1 px-6 py-3 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 transition-colors"
          >
            Create Character
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-3 bg-gray-200 text-dark rounded-lg font-medium hover:bg-gray-300 transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
