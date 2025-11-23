'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

export const dynamic = 'force-dynamic';

export default function NewDeckPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    difficulty: '',
    isPublic: false,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      alert('Deck name is required');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/decks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const deck = await response.json();
        alert('Deck created successfully!');
        router.push(`/admin/decks/${deck.id}/edit`);
      } else {
        const data = await response.json();
        alert(`Failed to create deck: ${data.error}`);
      }
    } catch (error) {
      console.error('Error creating deck:', error);
      alert('Failed to create deck. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            className="mb-4 gap-2"
            onClick={() => router.push('/admin/decks')}
          >
            <ArrowLeft size={20} />
            Back to Decks
          </Button>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Create New Deck</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Create a new flashcard deck for studying Japanese
          </p>
        </div>

        {/* Form */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Deck Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Deck Name *
              </label>
              <Input
                type="text"
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., JLPT N5 Vocabulary"
                required
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={e => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe the content and purpose of this deck..."
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent"
                rows={4}
              />
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Category
              </label>
              <select
                value={formData.category}
                onChange={e => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="">Select a category (optional)</option>
                <option value="Kanji">Kanji</option>
                <option value="Vocabulary">Vocabulary</option>
                <option value="Grammar">Grammar</option>
                <option value="Mixed">Mixed</option>
              </select>
            </div>

            {/* Difficulty */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Difficulty (JLPT Level)
              </label>
              <select
                value={formData.difficulty}
                onChange={e => setFormData({ ...formData, difficulty: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="">Select a difficulty (optional)</option>
                <option value="N5">N5 (Beginner)</option>
                <option value="N4">N4</option>
                <option value="N3">N3 (Intermediate)</option>
                <option value="N2">N2</option>
                <option value="N1">N1 (Advanced)</option>
              </select>
            </div>

            {/* Public/Private */}
            <div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.isPublic}
                  onChange={e => setFormData({ ...formData, isPublic: e.target.checked })}
                  className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Make this deck public (visible to all users)
                </span>
              </label>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 ml-6">
                Public decks can be viewed and studied by all users
              </p>
            </div>

            {/* Submit Buttons */}
            <div className="flex gap-4 pt-4">
              <Button type="submit" variant="default" disabled={loading} className="flex-1">
                {loading ? 'Creating...' : 'Create Deck'}
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={() => router.push('/admin/decks')}
                disabled={loading}
              >
                Cancel
              </Button>
            </div>
          </form>
        </div>

        {/* Help Text */}
        <div className="mt-6 bg-secondary/10 border border-secondary/30 rounded-lg p-4">
          <h3 className="font-semibold text-secondary mb-2">Next Steps</h3>
          <ul className="text-sm text-foreground space-y-1 list-disc list-inside">
            <li>After creating the deck, you&apos;ll be redirected to the deck editor</li>
            <li>Add flashcards manually or import them from an Excel file</li>
            <li>Supported card types: Kanji, Vocabulary, and Grammar</li>
            <li>You can mix different card types in one deck</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
