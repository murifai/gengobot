'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Upload, FileSpreadsheet } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

export const dynamic = 'force-dynamic';

export default function NewDeckPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [importMode, setImportMode] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    difficulty: '',
    isPublic: false,
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleDownloadTemplate = async () => {
    try {
      const response = await fetch('/api/decks/template');
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'deck_import_template.xlsx';
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (error) {
      console.error('Error downloading template:', error);
      alert('Failed to download template');
    }
  };

  const handleImport = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      alert('Deck name is required');
      return;
    }

    if (!selectedFile) {
      alert('Please select an Excel file to import');
      return;
    }

    setLoading(true);

    try {
      const importFormData = new FormData();
      importFormData.append('file', selectedFile);
      importFormData.append('name', formData.name);
      if (formData.description) importFormData.append('description', formData.description);
      if (formData.category) importFormData.append('category', formData.category);
      if (formData.difficulty) importFormData.append('difficulty', formData.difficulty);

      const response = await fetch('/api/decks/import', {
        method: 'POST',
        body: importFormData,
      });

      const data = await response.json();

      if (response.ok && data.success) {
        alert(
          `Deck imported successfully!\n${data.cardsImported} cards imported${data.errors.length > 0 ? `\n${data.errors.length} errors found` : ''}`
        );
        router.push(`/app/drill/decks/${data.deckId}/edit`);
      } else {
        alert(`Failed to import deck: ${data.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error importing deck:', error);
      alert('Failed to import deck. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (importMode) {
      return handleImport(e);
    }

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
        router.push(`/app/drill/decks/${deck.id}/edit`);
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
          <Button variant="ghost" className="mb-4 gap-2" onClick={() => router.push('/app/drill')}>
            <ArrowLeft size={20} />
            Back to Study Decks
          </Button>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Create New Deck</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Create your own flashcard deck for studying Japanese
          </p>
        </div>

        {/* Mode Toggle */}
        <div className="mb-6 flex gap-2">
          <Button
            type="button"
            variant={!importMode ? 'default' : 'secondary'}
            onClick={() => setImportMode(false)}
            className="flex-1"
          >
            Create Empty Deck
          </Button>
          <Button
            type="button"
            variant={importMode ? 'default' : 'secondary'}
            onClick={() => setImportMode(true)}
            className="flex-1 gap-2"
          >
            <Upload size={20} />
            Import from Excel
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

            {/* Import Section (only when import mode is enabled) */}
            {importMode && (
              <div className="space-y-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Upload Excel File *
                  </label>
                  <div className="flex gap-2">
                    <Input
                      type="file"
                      accept=".xlsx,.xls"
                      onChange={handleFileChange}
                      className="flex-1"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleDownloadTemplate}
                      className="gap-2"
                    >
                      <FileSpreadsheet size={16} />
                      Template
                    </Button>
                  </div>
                  {selectedFile && (
                    <p className="text-sm text-tertiary-green mt-2">
                      Selected: {selectedFile.name}
                    </p>
                  )}
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Download the template to see the required format
                  </p>
                </div>
              </div>
            )}

            {/* Submit Buttons */}
            <div className="flex gap-4 pt-4">
              <Button type="submit" variant="default" disabled={loading} className="flex-1">
                {loading
                  ? importMode
                    ? 'Importing...'
                    : 'Creating...'
                  : importMode
                    ? 'Import Deck'
                    : 'Create Deck'}
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={() => router.push('/app/drill')}
                disabled={loading}
              >
                Cancel
              </Button>
            </div>
          </form>
        </div>

        {/* Help Text */}
        <div className="mt-6 bg-secondary/10 border border-secondary/30 rounded-lg p-4">
          <h3 className="font-semibold text-secondary mb-2">
            {importMode ? 'Import Instructions' : 'Next Steps'}
          </h3>
          {importMode ? (
            <ul className="text-sm text-foreground space-y-1 list-disc list-inside">
              <li>Download the template to see the required Excel format</li>
              <li>Fill in the template with your flashcard data</li>
              <li>Supported card types: Kanji, Vocabulary, and Grammar</li>
              <li>Upload the completed Excel file to import all cards at once</li>
            </ul>
          ) : (
            <ul className="text-sm text-foreground space-y-1 list-disc list-inside">
              <li>After creating the deck, you&apos;ll be redirected to the deck editor</li>
              <li>Add flashcards manually or import them from an Excel file</li>
              <li>Supported card types: Kanji, Vocabulary, and Grammar</li>
              <li>You can mix different card types in one deck</li>
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
