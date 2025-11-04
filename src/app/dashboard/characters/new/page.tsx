'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select } from '@/components/ui/select';
import { Card } from '@/components/ui/Card';
import { ArrowLeft } from 'lucide-react';

// OpenAI TTS voices
const OPENAI_VOICES = [
  { value: 'alloy', label: 'Alloy', description: 'Neutral and balanced' },
  { value: 'echo', label: 'Echo', description: 'Clear and resonant' },
  { value: 'fable', label: 'Fable', description: 'Warm and expressive' },
  { value: 'onyx', label: 'Onyx', description: 'Deep and authoritative' },
  { value: 'nova', label: 'Nova', description: 'Bright and energetic' },
  { value: 'shimmer', label: 'Shimmer', description: 'Soft and gentle' },
];

const PERSONALITY_TYPES = [
  'Service Professional',
  'Retail Professional',
  'Friend',
  'Teacher',
  'Business Professional',
  'Family Member',
  'Custom',
];

const COMMON_TRAITS = [
  'polite',
  'helpful',
  'patient',
  'friendly',
  'attentive',
  'knowledgeable',
  'courteous',
  'enthusiastic',
  'professional',
  'casual',
  'formal',
  'playful',
];

export default function NewCharacterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    voice: 'alloy',
    personalityType: 'Friend',
    traits: [] as string[],
    speakingStyle: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      // Validate required fields
      if (!formData.name.trim()) {
        throw new Error('Character name is required');
      }

      if (formData.traits.length === 0) {
        throw new Error('Please select at least one personality trait');
      }

      const response = await fetch('/api/characters', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          description: formData.description,
          voice: formData.voice,
          personality: {
            type: formData.personalityType,
            traits: formData.traits,
            speakingStyle: formData.speakingStyle,
          },
          speakingStyle: formData.speakingStyle,
          taskSpecific: false, // Dashboard is only for free chat
          relationshipType: 'friend', // Default relationship type for free chat
          isUserCreated: true,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to create character');
      }

      router.push('/dashboard/characters');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const toggleTrait = (trait: string) => {
    setFormData(prev => ({
      ...prev,
      traits: prev.traits.includes(trait)
        ? prev.traits.filter(t => t !== trait)
        : [...prev.traits, trait],
    }));
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <nav className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">Create Character</h1>
            <Button onClick={() => router.push('/dashboard/characters')} variant="secondary">
              <ArrowLeft className="mr-2" size={16} />
              Back to Characters
            </Button>
          </div>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Info */}
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Basic Information
              </h2>

              <div>
                <Label htmlFor="name">Character Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Tanaka-san"
                  required
                />
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Brief description of the character..."
                  rows={3}
                />
              </div>
            </div>

            {/* Voice Selection */}
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Voice</h2>

              <div>
                <Label htmlFor="voice">Select Voice *</Label>
                <select
                  id="voice"
                  value={formData.voice}
                  onChange={e => setFormData({ ...formData, voice: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  {OPENAI_VOICES.map(voice => (
                    <option key={voice.value} value={voice.value}>
                      {voice.label} - {voice.description}
                    </option>
                  ))}
                </select>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  This voice will be used for text-to-speech in conversations
                </p>
              </div>
            </div>

            {/* Personality */}
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Personality</h2>

              <div>
                <Label htmlFor="personalityType">Personality Type</Label>
                <select
                  id="personalityType"
                  value={formData.personalityType}
                  onChange={e => setFormData({ ...formData, personalityType: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  {PERSONALITY_TYPES.map(type => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <Label>Personality Traits *</Label>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 mt-2">
                  {COMMON_TRAITS.map(trait => (
                    <button
                      key={trait}
                      type="button"
                      onClick={() => toggleTrait(trait)}
                      className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                        formData.traits.includes(trait)
                          ? 'bg-primary text-white'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                      }`}
                    >
                      {trait}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <Label htmlFor="speakingStyle">Speaking Style</Label>
                <Textarea
                  id="speakingStyle"
                  value={formData.speakingStyle}
                  onChange={e => setFormData({ ...formData, speakingStyle: e.target.value })}
                  placeholder="e.g., Formal Japanese with polite expressions, uses keigo..."
                  rows={3}
                />
              </div>
            </div>

            {/* Error Display */}
            {error && (
              <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
                <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
              </div>
            )}

            {/* Submit */}
            <div className="flex gap-4 pt-4">
              <Button type="submit" disabled={loading} className="flex-1">
                {loading ? 'Creating...' : 'Create Character'}
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={() => router.push('/dashboard/characters')}
                disabled={loading}
              >
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      </main>
    </div>
  );
}
