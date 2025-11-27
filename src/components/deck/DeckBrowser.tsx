'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { LoadingState } from '@/components/ui/LoadingState';

interface Deck {
  id: string;
  name: string;
  description: string | null;
  category: string | null;
  difficulty: string | null;
  totalCards: number;
  dueCards: number;
  newCards: number;
  studyCount: number;
  isPublic: boolean;
}

const categoryColors: Record<string, string> = {
  Kanji: 'bg-tertiary-purple/10 text-tertiary-purple',
  Vocabulary: 'bg-tertiary-green/10 text-tertiary-green',
  Grammar: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
  Mixed: 'bg-secondary/10 text-secondary',
};

const difficultyColors: Record<string, string> = {
  N5: 'bg-tertiary-green/10 text-tertiary-green border-tertiary-green/30',
  N4: 'bg-secondary/10 text-secondary border-secondary/30',
  N3: 'bg-tertiary-yellow/10 text-foreground border-tertiary-yellow/30',
  N2: 'bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-950 dark:text-orange-300 dark:border-orange-800',
  N1: 'bg-primary/10 text-primary border-primary/30',
};

export default function DeckBrowser() {
  const [decks, setDecks] = useState<Deck[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('');
  const [difficultyFilter, setDifficultyFilter] = useState<string>('');

  useEffect(() => {
    fetchDecks();
  }, []);

  const fetchDecks = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams({
        ...(searchQuery && { search: searchQuery }),
        ...(categoryFilter && { category: categoryFilter }),
        ...(difficultyFilter && { difficulty: difficultyFilter }),
      });

      const response = await fetch(`/api/decks?${params}`);
      if (!response.ok) throw new Error('Failed to fetch decks');

      const data = await response.json();
      setDecks(data.decks || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchDecks();
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <LoadingState type="spinner" size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <Card className="p-6 text-center">
        <p className="text-primary mb-4">{error}</p>
        <Button onClick={fetchDecks}>Try Again</Button>
      </Card>
    );
  }

  return (
    <div>
      {/* Filters */}
      <Card className="p-6 mb-6">
        <form onSubmit={handleSearch} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Search</label>
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search decks..."
                className="w-full px-4 py-2 border-2 border-border rounded-base bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-primary"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Category</label>
              <select
                value={categoryFilter}
                onChange={e => setCategoryFilter(e.target.value)}
                className="w-full px-4 py-2 border-2 border-border rounded-base bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-primary"
              >
                <option value="">All Categories</option>
                <option value="Kanji">Kanji</option>
                <option value="Vocabulary">Vocabulary</option>
                <option value="Grammar">Grammar</option>
                <option value="Mixed">Mixed</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Difficulty</label>
              <select
                value={difficultyFilter}
                onChange={e => setDifficultyFilter(e.target.value)}
                className="w-full px-4 py-2 border-2 border-border rounded-base bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-primary"
              >
                <option value="">All Levels</option>
                <option value="N5">N5</option>
                <option value="N4">N4</option>
                <option value="N3">N3</option>
                <option value="N2">N2</option>
                <option value="N1">N1</option>
              </select>
            </div>
          </div>

          <div className="flex gap-2">
            <Button type="submit" variant="default">
              Apply Filters
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                setSearchQuery('');
                setCategoryFilter('');
                setDifficultyFilter('');
                fetchDecks();
              }}
            >
              Clear
            </Button>
          </div>
        </form>
      </Card>

      {/* Deck Grid */}
      {decks.length === 0 ? (
        <Card className="p-12 text-center">
          <p className="text-muted-foreground">No decks found</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {decks.map(deck => (
            <Card
              key={deck.id}
              className="p-6 hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none transition-all"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-foreground mb-2">{deck.name}</h3>
                  {deck.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2">{deck.description}</p>
                  )}
                </div>
              </div>

              <div className="flex flex-wrap gap-2 mb-4">
                {deck.category && (
                  <span
                    className={`px-3 py-1 rounded-base text-xs font-medium border-2 border-border ${
                      categoryColors[deck.category] || categoryColors.Mixed
                    }`}
                  >
                    {deck.category}
                  </span>
                )}
                {deck.difficulty && (
                  <span
                    className={`px-3 py-1 rounded-base text-xs font-medium border-2 border-border ${
                      difficultyColors[deck.difficulty] || difficultyColors.N5
                    }`}
                  >
                    {deck.difficulty}
                  </span>
                )}
              </div>

              {/* Statistics Grid */}
              <div className="grid grid-cols-4 gap-2 mb-4">
                <div className="text-center p-2 bg-secondary/10 rounded-base border-2 border-border">
                  <div className="text-xs text-secondary mb-1">Due</div>
                  <div className="text-lg font-semibold text-secondary">{deck.dueCards}</div>
                </div>
                <div className="text-center p-2 bg-tertiary-green/10 rounded-base border-2 border-border">
                  <div className="text-xs text-tertiary-green mb-1">New</div>
                  <div className="text-lg font-semibold text-tertiary-green">{deck.newCards}</div>
                </div>
                <div className="text-center p-2 bg-tertiary-purple/10 rounded-base border-2 border-border">
                  <div className="text-xs text-tertiary-purple mb-1">Total</div>
                  <div className="text-lg font-semibold text-tertiary-purple">
                    {deck.totalCards}
                  </div>
                </div>
                <div className="text-center p-2 bg-secondary-background rounded-base border-2 border-border">
                  <div className="text-xs text-muted-foreground mb-1">Studies</div>
                  <div className="text-lg font-semibold text-foreground">{deck.studyCount}</div>
                </div>
              </div>

              <Link href={`/app/drill/${deck.id}`}>
                <Button variant="default" className="w-full">
                  Study Deck
                </Button>
              </Link>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
