'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Trash2, Plus, Download } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

interface DeckEditPageProps {
  params: Promise<{ deckId: string }>;
}

export default function DeckEditPage({ params }: DeckEditPageProps) {
  const resolvedParams = use(params);
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    difficulty: '',
    isPublic: false,
  });

  const fetchDeck = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/decks/${resolvedParams.deckId}`);
      if (response.ok) {
        const deck = await response.json();
        setFormData({
          name: deck.name,
          description: deck.description || '',
          category: deck.category || '',
          difficulty: deck.difficulty || '',
          isPublic: deck.isPublic,
        });
      } else {
        alert('Failed to load deck');
        router.push('/study');
      }
    } catch (error) {
      console.error('Error fetching deck:', error);
      alert('Failed to load deck');
      router.push('/study');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDeck();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resolvedParams.deckId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      alert('Deck name is required');
      return;
    }

    setSaving(true);

    try {
      const response = await fetch(`/api/decks/${resolvedParams.deckId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        alert('Deck updated successfully!');
        router.push('/study');
      } else {
        const data = await response.json();
        alert(`Failed to update deck: ${data.error}`);
      }
    } catch (error) {
      console.error('Error updating deck:', error);
      alert('Failed to update deck. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    const confirmDelete = window.confirm(
      `⚠️ WARNING: Delete "${formData.name}"?\n\n` +
        'This will permanently delete:\n' +
        '• The deck\n' +
        '• All flashcards in this deck\n' +
        '• All study sessions for this deck\n\n' +
        'This action CANNOT be undone!\n\n' +
        'Click OK to confirm deletion.'
    );

    if (!confirmDelete) return;

    try {
      const response = await fetch(`/api/decks/${resolvedParams.deckId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        alert('Deck deleted successfully');
        router.push('/study');
      } else {
        const data = await response.json();
        alert(`Failed to delete deck: ${data.error}`);
      }
    } catch (error) {
      console.error('Error deleting deck:', error);
      alert('Failed to delete deck. Please try again.');
    }
  };

  const handleExport = async () => {
    try {
      const response = await fetch(`/api/decks/${resolvedParams.deckId}/export`);
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${formData.name.replace(/[^a-z0-9]/gi, '_')}.xlsx`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        alert('Failed to export deck');
      }
    } catch (error) {
      console.error('Error exporting deck:', error);
      alert('Failed to export deck');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-600 dark:text-gray-400">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        {/* Header */}
        <div className="mb-8">
          <Button variant="ghost" className="mb-4 gap-2" onClick={() => router.push('/study')}>
            <ArrowLeft size={20} />
            Back to Study Decks
          </Button>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Edit Deck</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Modify your deck settings and manage flashcards
          </p>
        </div>

        {/* Quick Actions */}
        <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          <Button
            variant="secondary"
            className="gap-2"
            onClick={() => router.push(`/study/decks/${resolvedParams.deckId}`)}
          >
            <Plus size={16} />
            Manage Flashcards
          </Button>
          <Button variant="secondary" className="gap-2" onClick={handleExport}>
            <Download size={16} />
            Export to Excel
          </Button>
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
                placeholder="e.g., My JLPT N5 Vocabulary"
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
              <Button type="submit" variant="default" disabled={saving} className="flex-1">
                {saving ? 'Saving...' : 'Save Changes'}
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={() => router.push('/study')}
                disabled={saving}
              >
                Cancel
              </Button>
            </div>
          </form>

          {/* Danger Zone */}
          <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-red-600 dark:text-red-400 mb-4">
              Danger Zone
            </h3>
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-medium text-red-900 dark:text-red-100">Delete this deck</h4>
                  <p className="text-sm text-red-700 dark:text-red-300 mt-1">
                    Permanently delete this deck and all its flashcards. This action cannot be
                    undone.
                  </p>
                </div>
                <Button
                  variant="secondary"
                  onClick={handleDelete}
                  className="ml-4 gap-2 bg-red-600 hover:bg-red-700 text-white"
                >
                  <Trash2 size={16} />
                  Delete Deck
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Help Text */}
        <div className="mt-6 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
            Managing Your Deck
          </h3>
          <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1 list-disc list-inside">
            <li>Click &quot;Manage Flashcards&quot; to add, edit, or delete cards in this deck</li>
            <li>Export your deck to Excel format for backup or sharing</li>
            <li>Supported card types: Kanji, Vocabulary, and Grammar</li>
            <li>Public decks are visible to all users in the study browser</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
