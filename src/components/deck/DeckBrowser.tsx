'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { LoadingState } from '@/components/ui/LoadingState';
import { ChevronDown } from 'lucide-react';

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

const categories = [
  { value: '', label: 'Semua' },
  { value: 'Kanji', label: 'Kanji' },
  { value: 'Vocabulary', label: 'Kosakata' },
  { value: 'Grammar', label: 'Bunpo' },
  { value: 'Mixed', label: 'Campur' },
];

const difficulties = [
  { value: '', label: 'Semua' },
  { value: 'N5', label: 'N5' },
  { value: 'N4', label: 'N4' },
  { value: 'N3', label: 'N3' },
  { value: 'N2', label: 'N2' },
  { value: 'N1', label: 'N1' },
];

export default function DeckBrowser() {
  const [decks, setDecks] = useState<Deck[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('');
  const [difficultyFilter, setDifficultyFilter] = useState<string>('');
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [isDifficultyOpen, setIsDifficultyOpen] = useState(false);

  useEffect(() => {
    fetchDecks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Auto-fetch when filters change
  useEffect(() => {
    fetchDecks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categoryFilter, difficultyFilter, searchQuery]);

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

  const getCategoryLabel = () => {
    const found = categories.find(c => c.value === categoryFilter);
    return found ? found.label : 'Semua';
  };

  const getDifficultyLabel = () => {
    const found = difficulties.find(d => d.value === difficultyFilter);
    return found ? found.label : 'Semua';
  };

  if (error) {
    return (
      <Card className="p-6 text-center">
        <p className="text-primary mb-4">{error}</p>
        <Button onClick={fetchDecks}>Coba Lagi</Button>
      </Card>
    );
  }

  return (
    <div>
      {/* Filters - Neo Brutalism Style */}
      <div className="mb-6 bg-card border-2 border-border rounded-base p-4 shadow-shadow">
        <h2 className="text-lg font-bold text-foreground mb-4">Filter</h2>
        <div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search Input */}
            <div>
              <label className="block text-sm font-bold text-foreground mb-2">Cari</label>
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Cari dek..."
                className="w-full px-4 py-2 border-2 border-border rounded-base bg-card text-foreground font-bold text-sm focus:ring-2 focus:ring-primary focus:border-primary shadow-shadow"
              />
            </div>

            {/* Category Filter - Dropdown */}
            <div>
              <label className="block text-sm font-bold text-foreground mb-2">Kategori</label>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIsCategoryOpen(!isCategoryOpen)}
                  className={`w-full px-4 py-2 rounded-base text-sm font-bold border-2 border-border transition-all flex items-center justify-between ${
                    categoryFilter !== ''
                      ? 'bg-primary text-primary-foreground shadow-shadow translate-x-boxShadowX translate-y-boxShadowY'
                      : 'bg-card text-foreground hover:bg-muted shadow-shadow'
                  }`}
                >
                  <span>{getCategoryLabel()}</span>
                  <ChevronDown
                    className={`w-4 h-4 transition-transform ${isCategoryOpen ? 'rotate-180' : ''}`}
                  />
                </button>
                {isCategoryOpen && (
                  <div className="absolute z-10 mt-2 w-full bg-card border-2 border-border rounded-base shadow-shadow max-h-60 overflow-auto">
                    {categories.map(category => (
                      <button
                        key={category.value}
                        type="button"
                        onClick={() => {
                          setCategoryFilter(category.value);
                          setIsCategoryOpen(false);
                        }}
                        className={`w-full px-4 py-2 text-sm font-bold text-left transition-colors border-b border-border last:border-b-0 ${
                          categoryFilter === category.value
                            ? 'bg-primary text-primary-foreground'
                            : 'text-foreground hover:bg-muted'
                        }`}
                      >
                        {category.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Difficulty Filter - Dropdown */}
            <div>
              <label className="block text-sm font-bold text-foreground mb-2">Level</label>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIsDifficultyOpen(!isDifficultyOpen)}
                  className={`w-full px-4 py-2 rounded-base text-sm font-bold border-2 border-border transition-all flex items-center justify-between ${
                    difficultyFilter !== ''
                      ? 'bg-primary text-primary-foreground shadow-shadow translate-x-boxShadowX translate-y-boxShadowY'
                      : 'bg-card text-foreground hover:bg-muted shadow-shadow'
                  }`}
                >
                  <span>{getDifficultyLabel()}</span>
                  <ChevronDown
                    className={`w-4 h-4 transition-transform ${isDifficultyOpen ? 'rotate-180' : ''}`}
                  />
                </button>
                {isDifficultyOpen && (
                  <div className="absolute z-10 mt-2 w-full bg-card border-2 border-border rounded-base shadow-shadow max-h-60 overflow-auto">
                    {difficulties.map(difficulty => (
                      <button
                        key={difficulty.value}
                        type="button"
                        onClick={() => {
                          setDifficultyFilter(difficulty.value);
                          setIsDifficultyOpen(false);
                        }}
                        className={`w-full px-4 py-2 text-sm font-bold text-left transition-colors border-b border-border last:border-b-0 ${
                          difficultyFilter === difficulty.value
                            ? 'bg-primary text-primary-foreground'
                            : 'text-foreground hover:bg-muted'
                        }`}
                      >
                        {difficulty.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        {(categoryFilter !== '' || difficultyFilter !== '' || searchQuery !== '') && (
          <div className="mt-4">
            <p className="text-sm text-muted-foreground">Menampilkan {decks.length} dek</p>
          </div>
        )}
      </div>

      {/* Deck Grid */}
      {loading ? (
        <div className="flex justify-center items-center min-h-[400px]">
          <LoadingState type="spinner" size="lg" />
        </div>
      ) : decks.length === 0 ? (
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
