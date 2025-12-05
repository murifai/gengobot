'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { LoadingState } from '@/components/ui/LoadingState';
import { Dialog, DialogTitle } from '@/components/ui/Dialog';
import {
  ChevronDown,
  ChevronUp,
  Heart,
  Share2,
  X,
  Copy,
  Check,
  BookOpen,
  Users,
  Plus,
  Edit,
} from 'lucide-react';

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
  isFavorite?: boolean;
  isOwner?: boolean;
  creatorName?: string;
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

type TabType = 'public' | 'private';

export default function DeckBrowser() {
  // Public tab state
  const [publicDecks, setPublicDecks] = useState<Deck[]>([]);
  const [publicLoading, setPublicLoading] = useState(true);

  // Private tab state
  const [favoriteDecks, setFavoriteDecks] = useState<Deck[]>([]);
  const [studyingDecks, setStudyingDecks] = useState<Deck[]>([]);
  const [myDecks, setMyDecks] = useState<Deck[]>([]);
  const [privateLoading, setPrivateLoading] = useState(true);

  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('');
  const [difficultyFilter, setDifficultyFilter] = useState<string>('');
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [isDifficultyOpen, setIsDifficultyOpen] = useState(false);

  // Share modal state
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [shareUrl, setShareUrl] = useState('');
  const [copied, setCopied] = useState(false);

  // Tab state
  const [activeTab, setActiveTab] = useState<TabType>('public');

  // Section expand state for private tab
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    studying: true,
    favorites: true,
    myDecks: true,
  });

  useEffect(() => {
    if (activeTab === 'public') {
      fetchPublicDecks();
    } else {
      fetchPrivateDecks();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  // Auto-fetch when filters change (only for public tab)
  useEffect(() => {
    if (activeTab === 'public') {
      fetchPublicDecks();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categoryFilter, difficultyFilter, searchQuery]);

  const fetchPublicDecks = async () => {
    try {
      setPublicLoading(true);
      setError(null);

      const params = new URLSearchParams({
        ...(searchQuery && { search: searchQuery }),
        ...(categoryFilter && { category: categoryFilter }),
        ...(difficultyFilter && { difficulty: difficultyFilter }),
      });

      const response = await fetch(`/api/decks?${params}`);
      if (!response.ok) throw new Error('Failed to fetch decks');

      const data = await response.json();
      setPublicDecks(data.decks || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setPublicLoading(false);
    }
  };

  const fetchPrivateDecks = async () => {
    try {
      setPrivateLoading(true);
      setError(null);

      const [favoritesRes, studyingRes, myDecksRes] = await Promise.all([
        fetch('/api/decks/favorites'),
        fetch('/api/decks/studying'),
        fetch('/api/decks?myDecks=true&limit=100'),
      ]);

      if (favoritesRes.ok) {
        const data = await favoritesRes.json();
        setFavoriteDecks(data.decks || []);
      }

      if (studyingRes.ok) {
        const data = await studyingRes.json();
        setStudyingDecks(data.decks || []);
      }

      if (myDecksRes.ok) {
        const data = await myDecksRes.json();
        setMyDecks(data.decks || []);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setPrivateLoading(false);
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

  const handleToggleFavorite = async (deckId: string, isFavorite: boolean) => {
    try {
      if (isFavorite) {
        await fetch(`/api/decks/${deckId}/favorite`, { method: 'DELETE' });
      } else {
        await fetch(`/api/decks/${deckId}/favorite`, { method: 'POST' });
      }
      // Refresh data
      if (activeTab === 'public') {
        fetchPublicDecks();
      } else {
        fetchPrivateDecks();
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  };

  const handleShare = async (deckId: string) => {
    try {
      const response = await fetch(`/api/decks/${deckId}/share`, { method: 'POST' });
      const data = await response.json();

      if (response.ok && data.shareUrl) {
        const fullUrl = `${window.location.origin}${data.shareUrl}`;
        setShareUrl(fullUrl);
        setShareModalOpen(true);
        setCopied(false);
      }
    } catch (error) {
      console.error('Error sharing deck:', error);
      alert('Gagal membuat link share');
    }
  };

  const handleCopyShareUrl = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Error copying:', error);
    }
  };

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const filterDecks = (decks: Deck[]) => {
    if (!searchQuery && !categoryFilter && !difficultyFilter) return decks;
    return decks.filter(deck => {
      const matchesSearch =
        !searchQuery ||
        deck.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        deck.description?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = !categoryFilter || deck.category === categoryFilter;
      const matchesDifficulty = !difficultyFilter || deck.difficulty === difficultyFilter;
      return matchesSearch && matchesCategory && matchesDifficulty;
    });
  };

  const renderDeckCard = (deck: Deck) => (
    <Card
      key={deck.id}
      className="p-6 hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none transition-all"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h3 className="text-xl font-semibold text-foreground">{deck.name}</h3>
          {deck.description && (
            <p className="text-sm text-muted-foreground line-clamp-2">{deck.description}</p>
          )}
          {deck.creatorName && (
            <p className="text-xs text-muted-foreground mt-1">oleh {deck.creatorName}</p>
          )}
        </div>
        <div className="flex gap-1">
          <button
            onClick={() => handleToggleFavorite(deck.id, deck.isFavorite || false)}
            className="p-2 rounded-base hover:bg-muted transition-colors"
            title={deck.isFavorite ? 'Hapus dari favorit' : 'Tambah ke favorit'}
          >
            <Heart
              size={18}
              className={deck.isFavorite ? 'fill-primary text-primary' : 'text-muted-foreground'}
            />
          </button>
          <button
            onClick={() => handleShare(deck.id)}
            className="p-2 rounded-base hover:bg-muted transition-colors"
            title="Bagikan"
          >
            <Share2 size={18} className="text-muted-foreground" />
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-3">
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
      <div className="grid grid-cols-3 gap-2 mb-4">
        <div className="text-center p-2 rounded-base border-2 border-border">
          <div className="text-xs text-chart-3 mb-1">Hafal</div>
          <div className="text-lg font-semibold text-chart-3">{deck.uniqueHafal || 0}</div>
        </div>
        <div className="text-center p-2 rounded-base border-2 border-border">
          <div className="text-xs text-primary mb-1">Belum</div>
          <div className="text-lg font-semibold text-primary">{deck.uniqueBelumHafal || 0}</div>
        </div>
        <div className="text-center p-2 rounded-base border-2 border-border">
          <div className="text-xs text-tertiary-purple mb-1">Total</div>
          <div className="text-lg font-semibold text-tertiary-purple">{deck.totalCards}</div>
        </div>
      </div>

      <Link href={`/app/drill/${deck.id}`}>
        <Button variant="default" className="w-full">
          Pelajari
        </Button>
      </Link>
    </Card>
  );

  const renderSection = (
    id: string,
    title: string,
    icon: React.ReactNode,
    decks: Deck[],
    emptyMessage: string
  ) => {
    const filteredList = filterDecks(decks);
    const isExpanded = expandedSections[id];

    return (
      <div className="mb-8">
        <button
          onClick={() => toggleSection(id)}
          className="w-full flex items-center justify-between p-4 bg-card border-2 border-border rounded-base shadow-shadow hover:bg-muted transition-colors mb-4"
        >
          <div className="flex items-center gap-3">
            {icon}
            <span className="font-bold text-foreground text-lg">{title}</span>
            <span className="px-2 py-0.5 text-sm font-bold rounded-base bg-muted text-muted-foreground">
              {filteredList.length}
            </span>
          </div>
          {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </button>

        {isExpanded && (
          <>
            {filteredList.length === 0 ? (
              <Card className="p-12 text-center">
                <p className="text-muted-foreground">{emptyMessage}</p>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredList.map(deck => renderDeckCard(deck))}
              </div>
            )}
          </>
        )}
      </div>
    );
  };

  if (error) {
    return (
      <Card className="p-6 text-center">
        <p className="text-primary mb-4">{error}</p>
        <Button onClick={activeTab === 'public' ? fetchPublicDecks : fetchPrivateDecks}>
          Coba Lagi
        </Button>
      </Card>
    );
  }

  return (
    <div>
      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        <Button
          variant={activeTab === 'public' ? 'default' : 'secondary'}
          onClick={() => setActiveTab('public')}
          className="gap-2"
        >
          <Users size={18} />
          Dek Publik
        </Button>
        <Button
          variant={activeTab === 'private' ? 'default' : 'secondary'}
          onClick={() => setActiveTab('private')}
          className="gap-2"
        >
          <BookOpen size={18} />
          Dek Pribadi
        </Button>
      </div>

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
            <p className="text-sm text-muted-foreground">
              {activeTab === 'public' ? `Menampilkan ${publicDecks.length} dek` : 'Filter aktif'}
            </p>
          </div>
        )}
      </div>

      {/* Content based on active tab */}
      {activeTab === 'public' ? (
        // Public Decks Grid
        <>
          {publicLoading ? (
            <div className="flex justify-center items-center min-h-[400px]">
              <LoadingState type="spinner" size="lg" />
            </div>
          ) : publicDecks.length === 0 ? (
            <Card className="p-12 text-center">
              <p className="text-muted-foreground">Tidak ada dek ditemukan</p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {publicDecks.map(deck => renderDeckCard(deck))}
            </div>
          )}
        </>
      ) : (
        // Private Decks with Sections
        <>
          {privateLoading ? (
            <div className="flex justify-center items-center min-h-[400px]">
              <LoadingState type="spinner" size="lg" />
            </div>
          ) : (
            <>
              {renderSection(
                'studying',
                'Sedang Dipelajari',
                <BookOpen size={20} className="text-chart-3" />,
                studyingDecks,
                'Belum ada dek yang sedang dipelajari. Mulai belajar untuk menambahkan dek ke sini.'
              )}

              {renderSection(
                'favorites',
                'Favorit',
                <Heart size={20} className="text-primary fill-primary" />,
                favoriteDecks,
                'Belum ada dek favorit. Klik tombol hati pada dek untuk menambahkan ke favorit.'
              )}

              {/* Dek Saya Section with Create Button */}
              <div className="mb-8">
                <div className="flex items-center justify-between gap-4 mb-4">
                  <button
                    onClick={() => toggleSection('myDecks')}
                    className="flex-1 flex items-center justify-between p-4 bg-card border-2 border-border rounded-base shadow-shadow hover:bg-muted transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <Edit size={20} className="text-secondary" />
                      <span className="font-bold text-foreground text-lg">Dek Saya</span>
                      <span className="px-2 py-0.5 text-sm font-bold rounded-base bg-muted text-muted-foreground">
                        {filterDecks(myDecks).length}
                      </span>
                    </div>
                    {expandedSections.myDecks ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                  </button>
                  <Link href="/app/drill/decks/new">
                    <Button variant="default" className="gap-2 shrink-0">
                      <Plus size={18} />
                      Buat Dek
                    </Button>
                  </Link>
                </div>

                {expandedSections.myDecks && (
                  <>
                    {filterDecks(myDecks).length === 0 ? (
                      <Card className="p-12 text-center">
                        <p className="text-muted-foreground">
                          Belum ada dek buatan Anda. Klik &quot;Buat Dek&quot; untuk memulai.
                        </p>
                      </Card>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filterDecks(myDecks).map(deck => renderDeckCard(deck))}
                      </div>
                    )}
                  </>
                )}
              </div>
            </>
          )}
        </>
      )}

      {/* Share Modal */}
      <Dialog open={shareModalOpen} onClose={() => setShareModalOpen(false)} size="md">
        <div className="flex items-center justify-between mb-4">
          <DialogTitle>Bagikan Dek</DialogTitle>
          <button
            onClick={() => setShareModalOpen(false)}
            className="p-2 hover:bg-muted rounded-base transition-colors"
          >
            <X size={20} />
          </button>
        </div>
        <p className="text-sm text-muted-foreground mb-4">
          Salin link di bawah untuk membagikan dek ini kepada orang lain.
        </p>
        <div className="flex gap-2">
          <input
            type="text"
            value={shareUrl}
            readOnly
            className="flex-1 px-4 py-2 border-2 border-border rounded-base bg-muted text-foreground text-sm"
          />
          <Button variant="default" onClick={handleCopyShareUrl} className="gap-2">
            {copied ? <Check size={18} /> : <Copy size={18} />}
            {copied ? 'Tersalin!' : 'Salin'}
          </Button>
        </div>
      </Dialog>
    </div>
  );
}
