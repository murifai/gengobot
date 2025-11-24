'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Plus, Edit, Trash2, BookOpen, Download, ArrowLeft, Search, Eye } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { LoadingState } from '@/components/ui/LoadingState';

interface Deck {
  id: string;
  name: string;
  description: string | null;
  category: string | null;
  difficulty: string | null;
  isPublic: boolean;
  totalCards: number;
  dueCards: number;
  newCards: number;
  studyCount: number;
  createdAt: string;
  updatedAt: string;
}

export function MyDecksClient() {
  const router = useRouter();
  const [decks, setDecks] = useState<Deck[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterDifficulty, setFilterDifficulty] = useState<string>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');

  const fetchMyDecks = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/decks?myDecks=true&limit=100');
      if (response.ok) {
        const data = await response.json();
        setDecks(data.decks);
      } else {
        console.error('Failed to fetch decks');
      }
    } catch (error) {
      console.error('Error fetching decks:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyDecks();
  }, []);

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
      setDeleting(deckId);
      const response = await fetch(`/api/decks/${deckId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        alert('Deck deleted successfully');
        fetchMyDecks();
      } else {
        const data = await response.json();
        alert(`Failed to delete deck: ${data.error}`);
      }
    } catch (error) {
      console.error('Error deleting deck:', error);
      alert('Failed to delete deck. Please try again.');
    } finally {
      setDeleting(null);
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
        a.download = `${deckName.replace(/[^a-z0-9]/gi, '_')}.xlsx`;
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
      <div className="min-h-screen bg-background flex items-center justify-center">
        <LoadingState type="spinner" size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Button variant="ghost" className="mb-4 gap-2" onClick={() => router.push('/app/drill')}>
            <ArrowLeft size={20} />
            Back to Study Decks
          </Button>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">My Decks</h1>
              <p className="text-muted-foreground">Manage your custom flashcard decks</p>
            </div>
            <Link href="/app/drill/decks/new">
              <Button variant="default" className="gap-2">
                <Plus size={20} />
                Create New Deck
              </Button>
            </Link>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-card rounded-lg p-4 shadow-sm">
            <div className="text-sm text-muted-foreground mb-1">Total Decks</div>
            <div className="text-2xl font-bold text-foreground">{decks.length}</div>
          </div>
          <div className="bg-card rounded-lg p-4 shadow-sm">
            <div className="text-sm text-muted-foreground mb-1">Public Decks</div>
            <div className="text-2xl font-bold text-secondary">
              {decks.filter(d => d.isPublic).length}
            </div>
          </div>
          <div className="bg-card rounded-lg p-4 shadow-sm">
            <div className="text-sm text-muted-foreground mb-1">Total Cards</div>
            <div className="text-2xl font-bold text-tertiary-green">
              {decks.reduce((sum, d) => sum + d.totalCards, 0)}
            </div>
          </div>
          <div className="bg-card rounded-lg p-4 shadow-sm">
            <div className="text-sm text-muted-foreground mb-1">Cards Due</div>
            <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
              {decks.reduce((sum, d) => sum + d.dueCards, 0)}
            </div>
          </div>
        </div>

        {/* Search & Filters */}
        <div className="bg-card rounded-lg p-4 shadow-sm mb-6">
          <div className="flex flex-col md:flex-row gap-4 mb-4">
            <div className="flex-1 relative">
              <Search
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground"
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
          </div>

          <div className="flex flex-wrap gap-2">
            <div className="flex gap-2">
              <span className="text-sm text-muted-foreground self-center">Difficulty:</span>
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
                <span className="text-sm text-muted-foreground self-center">Category:</span>
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
                    onClick={() => setFilterCategory(cat || '')}
                  >
                    {cat}
                  </Button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Decks List */}
        {filteredDecks.length === 0 ? (
          <div className="bg-card rounded-lg shadow-sm p-12 text-center">
            <div className="max-w-md mx-auto">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                <BookOpen size={32} className="text-muted-foreground" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">
                {searchQuery || filterDifficulty !== 'all' || filterCategory !== 'all'
                  ? 'No decks match your filters'
                  : 'No decks yet'}
              </h3>
              <p className="text-muted-foreground mb-6">
                {searchQuery || filterDifficulty !== 'all' || filterCategory !== 'all'
                  ? 'Try adjusting your search or filters'
                  : 'Create your first deck to start building your custom flashcard collection'}
              </p>
              {!searchQuery && filterDifficulty === 'all' && filterCategory === 'all' && (
                <Link href="/app/drill/decks/new">
                  <Button variant="default" className="gap-2">
                    <Plus size={20} />
                    Create Your First Deck
                  </Button>
                </Link>
              )}
            </div>
          </div>
        ) : (
          <div className="bg-card rounded-lg shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Deck
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Category
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Difficulty
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Cards
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Due / New
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Visibility
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-card divide-y divide-border">
                  {filteredDecks.map(deck => (
                    <tr key={deck.id} className="hover:bg-muted/50">
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <div className="text-sm font-medium text-foreground">{deck.name}</div>
                          {deck.description && (
                            <div className="text-sm text-muted-foreground line-clamp-2">
                              {deck.description}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {deck.category ? (
                          <span className="px-2 py-1 text-xs font-semibold rounded-full bg-secondary/10 text-secondary">
                            {deck.category}
                          </span>
                        ) : (
                          <span className="text-sm text-muted-foreground">—</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {deck.difficulty ? (
                          <span
                            className={`px-2 py-1 text-xs font-semibold rounded-full ${
                              deck.difficulty === 'N5' || deck.difficulty === 'N4'
                                ? 'bg-tertiary-green/10 text-tertiary-green'
                                : deck.difficulty === 'N3'
                                  ? 'bg-tertiary-yellow/10 text-foreground'
                                  : 'bg-primary/10 text-primary'
                            }`}
                          >
                            {deck.difficulty}
                          </span>
                        ) : (
                          <span className="text-sm text-muted-foreground">—</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">
                        {deck.totalCards}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <div className="flex gap-2">
                          <span className="text-secondary">{deck.dueCards}</span>
                          <span className="text-muted-foreground">/</span>
                          <span className="text-tertiary-green">{deck.newCards}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 py-1 text-xs font-semibold rounded-full ${
                            deck.isPublic
                              ? 'bg-tertiary-green/10 text-tertiary-green'
                              : 'bg-muted text-muted-foreground'
                          }`}
                        >
                          {deck.isPublic ? 'Public' : 'Private'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => router.push(`/app/drill/decks/${deck.id}`)}
                            title="Manage Cards"
                          >
                            <Eye size={16} />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => router.push(`/app/drill/decks/${deck.id}/edit`)}
                            title="Edit Settings"
                          >
                            <Edit size={16} />
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
                            disabled={deleting === deck.id}
                          >
                            <Trash2 size={16} className="text-red-500" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Help Text */}
        {filteredDecks.length > 0 && (
          <div className="mt-6 bg-secondary/10 border border-secondary/30 rounded-lg p-4">
            <h3 className="font-semibold text-secondary mb-2">Managing Your Decks</h3>
            <ul className="text-sm text-foreground space-y-1 list-disc list-inside">
              <li>Click the eye icon to view and manage flashcards</li>
              <li>Click the edit icon to modify deck settings and metadata</li>
              <li>Click the download icon to export your deck as an Excel file</li>
              <li>Public decks are visible to all users in the study decks browser</li>
              <li>Private decks are only visible to you</li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
