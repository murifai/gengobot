'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
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
  Kanji: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
  Vocabulary: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  Grammar: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
  Mixed: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
};

const difficultyColors: Record<string, string> = {
  N5: 'bg-green-50 text-green-700 border-green-200 dark:bg-green-950 dark:text-green-300 dark:border-green-800',
  N4: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-800',
  N3: 'bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-950 dark:text-yellow-300 dark:border-yellow-800',
  N2: 'bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-950 dark:text-orange-300 dark:border-orange-800',
  N1: 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950 dark:text-red-300 dark:border-red-800',
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
        <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
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
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Search
              </label>
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search decks..."
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Category
              </label>
              <select
                value={categoryFilter}
                onChange={e => setCategoryFilter(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Categories</option>
                <option value="Kanji">Kanji</option>
                <option value="Vocabulary">Vocabulary</option>
                <option value="Grammar">Grammar</option>
                <option value="Mixed">Mixed</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Difficulty
              </label>
              <select
                value={difficultyFilter}
                onChange={e => setDifficultyFilter(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
          <p className="text-gray-600 dark:text-gray-400">No decks found</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {decks.map(deck => (
            <Card key={deck.id} className="p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                    {deck.name}
                  </h3>
                  {deck.description && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                      {deck.description}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex flex-wrap gap-2 mb-4">
                {deck.category && (
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      categoryColors[deck.category] || categoryColors.Mixed
                    }`}
                  >
                    {deck.category}
                  </span>
                )}
                {deck.difficulty && (
                  <span
                    className={`px-3 py-1 rounded-lg text-xs font-medium border ${
                      difficultyColors[deck.difficulty] || difficultyColors.N5
                    }`}
                  >
                    {deck.difficulty}
                  </span>
                )}
              </div>

              {/* Statistics Grid */}
              <div className="grid grid-cols-4 gap-2 mb-4">
                <div className="text-center p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <div className="text-xs text-blue-600 dark:text-blue-400 mb-1">Due</div>
                  <div className="text-lg font-semibold text-blue-700 dark:text-blue-300">
                    {deck.dueCards}
                  </div>
                </div>
                <div className="text-center p-2 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <div className="text-xs text-green-600 dark:text-green-400 mb-1">New</div>
                  <div className="text-lg font-semibold text-green-700 dark:text-green-300">
                    {deck.newCards}
                  </div>
                </div>
                <div className="text-center p-2 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                  <div className="text-xs text-purple-600 dark:text-purple-400 mb-1">Total</div>
                  <div className="text-lg font-semibold text-purple-700 dark:text-purple-300">
                    {deck.totalCards}
                  </div>
                </div>
                <div className="text-center p-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">Studies</div>
                  <div className="text-lg font-semibold text-gray-700 dark:text-gray-300">
                    {deck.studyCount}
                  </div>
                </div>
              </div>

              <Link href={`/study/${deck.id}`}>
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
