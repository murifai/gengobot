'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Search, Edit, Trash2, Eye, Download, Upload, Copy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Deck } from '@/types/deck';

interface DeckWithDetails extends Deck {
  creator: {
    id: string;
    name: string | null;
    email: string;
  };
  _count?: {
    flashcards: number;
  };
}

export default function AdminDecksPage() {
  const router = useRouter();
  const [decks, setDecks] = useState<DeckWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterDifficulty, setFilterDifficulty] = useState<string>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [importing, setImporting] = useState(false);
  const [importResults, setImportResults] = useState<{
    success: boolean;
    deckId?: string;
    cardsImported: number;
    errors: Array<{ row: number; message: string }>;
  } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchDecks();
  }, []);

  const fetchDecks = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/decks?limit=100');
      if (response.ok) {
        const data = await response.json();
        setDecks(data.decks || []);
      }
    } catch (error) {
      console.error('Error fetching decks:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (deckId: string, deckName: string) => {
    const confirmDelete = window.confirm(
      `⚠️ WARNING: Delete "${deckName}"?\n\n` +
        'This will permanently delete:\n' +
        '• The deck\n' +
        '• All flashcards in this deck\n' +
        '• All study sessions for this deck\n\n' +
        'This action CANNOT be undone!\n\n' +
        'Click OK to confirm deletion.'
    );

    if (!confirmDelete) return;

    try {
      const response = await fetch(`/api/decks/${deckId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        alert('Deck deleted successfully');
        fetchDecks();
      } else {
        const data = await response.json();
        alert(`Failed to delete deck: ${data.error}`);
      }
    } catch (error) {
      console.error('Error deleting deck:', error);
      alert('Failed to delete deck. Please try again.');
    }
  };

  const handleDuplicate = async (deckId: string, deckName: string) => {
    const newName = window.prompt(`Enter a name for the duplicated deck:`, `${deckName} (Copy)`);

    if (!newName) return;

    try {
      const response = await fetch(`/api/decks/${deckId}/duplicate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: newName }),
      });

      if (response.ok) {
        alert('Deck duplicated successfully');
        fetchDecks();
      } else {
        const data = await response.json();
        alert(`Failed to duplicate deck: ${data.error}`);
      }
    } catch (error) {
      console.error('Error duplicating deck:', error);
      alert('Failed to duplicate deck. Please try again.');
    }
  };

  const handleExport = async (deckId: string, deckName: string) => {
    try {
      const response = await fetch(`/api/decks/${deckId}/export`);
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${deckName.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.xlsx`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (error) {
      console.error('Error exporting deck:', error);
      alert('Failed to export deck');
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
        a.download = 'deck-import-template.xlsx';
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

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const deckName = window.prompt('Enter a name for the imported deck:');
    if (!deckName) return;

    setImporting(true);
    setImportResults(null);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('name', deckName);

      const response = await fetch('/api/decks/import', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        setImportResults(data);
        fetchDecks();
      } else {
        alert(`Import failed: ${data.error}`);
      }
    } catch (error) {
      console.error('Error importing deck:', error);
      alert('Failed to import deck');
    } finally {
      setImporting(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const filteredDecks = decks.filter(deck => {
    const matchesSearch =
      deck.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (deck.description && deck.description.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesDifficulty = filterDifficulty === 'all' || deck.difficulty === filterDifficulty;
    const matchesCategory = filterCategory === 'all' || deck.category === filterCategory;
    return matchesSearch && matchesDifficulty && matchesCategory;
  });

  const categories = Array.from(new Set(decks.map(d => d.category).filter(Boolean)));
  const difficulties = ['N5', 'N4', 'N3', 'N2', 'N1'];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-600 dark:text-gray-400">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Deck Management</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage flashcard decks for vocabulary, kanji, and grammar study
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
            <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total Decks</div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">{decks.length}</div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
            <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Active</div>
            <div className="text-2xl font-bold text-primary">
              {decks.filter(d => d.isActive).length}
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
            <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total Cards</div>
            <div className="text-2xl font-bold text-secondary">
              {decks.reduce((sum, d) => sum + d.totalCards, 0)}
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
            <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Public Decks</div>
            <div className="text-2xl font-bold text-tertiary-green">
              {decks.filter(d => d.isPublic).length}
            </div>
          </div>
        </div>

        {/* Filters & Actions */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm mb-6">
          <div className="flex flex-col md:flex-row gap-4 mb-4">
            <div className="flex-1 relative">
              <Search
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                size={20}
              />
              <Input
                type="text"
                placeholder="Search decks..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <Button variant="secondary" className="gap-2" onClick={handleDownloadTemplate}>
                <Download size={20} />
                Download Template
              </Button>
              <Button
                variant="secondary"
                className="gap-2"
                onClick={handleImportClick}
                disabled={importing}
              >
                <Upload size={20} />
                {importing ? 'Importing...' : 'Import Excel'}
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx,.xls"
                onChange={handleFileChange}
                className="hidden"
              />
              <Button
                variant="default"
                className="gap-2"
                onClick={() => router.push('/admin/decks/new')}
              >
                <Plus size={20} />
                Create Deck
              </Button>
            </div>
          </div>

          {/* Import Results */}
          {importResults && (
            <div className="mb-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
                Import Results
              </h3>
              <div className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                <p className="text-green-600 dark:text-green-400">
                  Successfully imported: {importResults.cardsImported} cards
                </p>
                {importResults.errors.length > 0 && (
                  <>
                    <p className="text-red-600 dark:text-red-400">
                      Errors: {importResults.errors.length}
                    </p>
                    <div className="mt-2 max-h-40 overflow-y-auto">
                      <p className="font-semibold mb-1">Error details:</p>
                      {importResults.errors.map((err, idx) => (
                        <p key={idx} className="text-xs">
                          Row {err.row}: {err.message}
                        </p>
                      ))}
                    </div>
                  </>
                )}
              </div>
              <button
                onClick={() => setImportResults(null)}
                className="mt-2 text-xs text-blue-600 dark:text-blue-400 hover:underline"
              >
                Dismiss
              </button>
            </div>
          )}

          <div className="flex flex-wrap gap-2">
            <div className="flex gap-2">
              <span className="text-sm text-gray-600 dark:text-gray-400 self-center">
                Difficulty:
              </span>
              <Button
                variant={filterDifficulty === 'all' ? 'default' : 'secondary'}
                size="sm"
                onClick={() => setFilterDifficulty('all')}
              >
                All
              </Button>
              {difficulties.map(diff => (
                <Button
                  key={diff}
                  variant={filterDifficulty === diff ? 'default' : 'secondary'}
                  size="sm"
                  onClick={() => setFilterDifficulty(diff)}
                >
                  {diff}
                </Button>
              ))}
            </div>

            {categories.length > 0 && (
              <div className="flex gap-2 ml-4">
                <span className="text-sm text-gray-600 dark:text-gray-400 self-center">
                  Category:
                </span>
                <Button
                  variant={filterCategory === 'all' ? 'default' : 'secondary'}
                  size="sm"
                  onClick={() => setFilterCategory('all')}
                >
                  All
                </Button>
                {categories.map(cat => (
                  <Button
                    key={cat}
                    variant={filterCategory === cat ? 'default' : 'secondary'}
                    size="sm"
                    onClick={() => setFilterCategory(cat)}
                  >
                    {cat}
                  </Button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Decks List */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Deck
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Difficulty
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Cards
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Visibility
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {filteredDecks.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                      No decks found
                    </td>
                  </tr>
                ) : (
                  filteredDecks.map(deck => (
                    <tr key={deck.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {deck.name}
                          </div>
                          {deck.description && (
                            <div className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2">
                              {deck.description}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {deck.category ? (
                          <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                            {deck.category}
                          </span>
                        ) : (
                          <span className="text-sm text-gray-400">—</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {deck.difficulty ? (
                          <span
                            className={`px-2 py-1 text-xs font-semibold rounded-full ${
                              deck.difficulty === 'N5' || deck.difficulty === 'N4'
                                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                : deck.difficulty === 'N3'
                                  ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                                  : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                            }`}
                          >
                            {deck.difficulty}
                          </span>
                        ) : (
                          <span className="text-sm text-gray-400">—</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {deck.totalCards}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 py-1 text-xs font-semibold rounded-full ${
                            deck.isPublic
                              ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                              : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                          }`}
                        >
                          {deck.isPublic ? 'Public' : 'Private'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 py-1 text-xs font-semibold rounded-full ${
                            deck.isActive
                              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                              : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                          }`}
                        >
                          {deck.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => router.push(`/admin/decks/${deck.id}`)}
                            title="View"
                          >
                            <Eye size={16} />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => router.push(`/admin/decks/${deck.id}/edit`)}
                            title="Edit"
                          >
                            <Edit size={16} />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDuplicate(deck.id, deck.name)}
                            title="Duplicate"
                          >
                            <Copy size={16} />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleExport(deck.id, deck.name)}
                            title="Export"
                          >
                            <Download size={16} />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(deck.id, deck.name)}
                            title="Delete"
                          >
                            <Trash2 size={16} className="text-red-500" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
