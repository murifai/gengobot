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
  uniqueHafal: number;
  uniqueBelumHafal: number;
  studyCount: number;
  isPublic: boolean;
}

const categoryColors: Record<string, string> = {
  Kanji: 'bg-[var(--card-kanji)] text-foreground',
  Vocabulary: 'bg-[var(--card-vocabulary)] text-foreground',
  Grammar: 'bg-[var(--card-grammar)] text-foreground',
  Mixed: 'bg-chart-5 text-foreground',
};

const difficultyColors: Record<string, string> = {
  N5: 'bg-background text-foreground',
  N4: 'bg-background text-foreground',
  N3: 'bg-background text-foreground',
  N2: 'bg-background text-foreground',
  N1: 'bg-background text-foreground',
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
              <label className="block text-sm font-medium text-foreground mb-2">Cari</label>
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Cari dek..."
                className="w-full px-4 py-2 border-2 border-border rounded-base bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-primary"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Kategori</label>
              <select
                value={categoryFilter}
                onChange={e => setCategoryFilter(e.target.value)}
                className="w-full px-4 py-2 border-2 border-border rounded-base bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-primary"
              >
                <option value="">Semua</option>
                <option value="Kanji">Kanji</option>
                <option value="Vocabulary">Kosakata</option>
                <option value="Grammar">Bunpo</option>
                <option value="Mixed">Campur</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Level</label>
              <select
                value={difficultyFilter}
                onChange={e => setDifficultyFilter(e.target.value)}
                className="w-full px-4 py-2 border-2 border-border rounded-base bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-primary"
              >
                <option value="">Semua</option>
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
              Filter
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
              Reset
            </Button>
          </div>
        </form>
      </Card>

      {/* Deck Grid */}
      {decks.length === 0 ? (
        <Card className="p-12 text-center">
          <p className="text-muted-foreground">Tidak ada dek ditemukan</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {decks.map(deck => (
            <Card
              key={deck.id}
              className="p-6 hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none transition-all"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-foreground">{deck.name}</h3>
                  {deck.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2">{deck.description}</p>
                  )}
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
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
              <div className="grid grid-cols-3 gap-2">
                <div className="text-center p-2 rounded-base border-2 border-border">
                  <div className="text-xs text-chart-3 mb-1">Hafal</div>
                  <div className="text-lg font-semibold text-chart-3">{deck.uniqueHafal}</div>
                </div>
                <div className="text-center p-2 rounded-base border-2 border-border">
                  <div className="text-xs text-primary mb-1">Belum</div>
                  <div className="text-lg font-semibold text-primary">{deck.uniqueBelumHafal}</div>
                </div>
                <div className="text-center p-2 rounded-base border-2 border-border">
                  <div className="text-xs text-tertiary-purple mb-1">Total</div>
                  <div className="text-lg font-semibold text-tertiary-purple">
                    {deck.totalCards}
                  </div>
                </div>
              </div>

              <Link href={`/app/drill/${deck.id}`}>
                <Button variant="default" className="w-full">
                  Pelajari
                </Button>
              </Link>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
