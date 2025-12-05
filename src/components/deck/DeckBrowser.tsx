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

  const handleShareSocial = (platform: string) => {
    const encodedUrl = encodeURIComponent(shareUrl);
    const text = encodeURIComponent('Cek dek flashcard ini di Gengobot!');
    let socialUrl = '';

    switch (platform) {
      case 'whatsapp':
        socialUrl = `https://wa.me/?text=${text}%20${encodedUrl}`;
        break;
      case 'telegram':
        socialUrl = `https://t.me/share/url?url=${encodedUrl}&text=${text}`;
        break;
      case 'line':
        socialUrl = `https://social-plugins.line.me/lineit/share?url=${encodedUrl}`;
        break;
      case 'twitter':
        socialUrl = `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${text}`;
        break;
      case 'facebook':
        socialUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`;
        break;
    }

    if (socialUrl) {
      window.open(socialUrl, '_blank', 'noopener,noreferrer');
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
      className="p-0 hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none transition-all overflow-hidden"
    >
      {/* Title Section */}
      <div className="px-4 pt-3 pb-5 bg-muted/30">
        <div className="flex items-center justify-between gap-2 pb-3 border-b-2 border-border">
          <h3 className="text-2xl font-bold text-foreground truncate flex-1">{deck.name}</h3>
          <div className="flex gap-2 shrink-0 mr-2">
            <button
              onClick={() => handleToggleFavorite(deck.id, deck.isFavorite || false)}
              className={`p-2 rounded-base border-2 border-border shadow-shadow transition-all hover:translate-x-1 hover:translate-y-1 hover:shadow-none ${
                deck.isFavorite ? 'bg-primary' : 'bg-secondary-background hover:bg-muted'
              }`}
              title={deck.isFavorite ? 'Hapus dari favorit' : 'Tambah ke favorit'}
            >
              <Heart
                size={16}
                className={deck.isFavorite ? 'fill-white text-white' : 'text-foreground'}
              />
            </button>
            <button
              onClick={() => handleShare(deck.id)}
              className="p-2 rounded-base border-2 border-border bg-secondary-background shadow-shadow transition-all hover:translate-x-1 hover:translate-y-1 hover:shadow-none hover:bg-muted"
              title="Bagikan"
            >
              <Share2 size={16} className="text-foreground" />
            </button>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="p-4 -mt-11 space-y-3">
        {deck.description && (
          <p className="text-sm text-muted-foreground line-clamp-2">{deck.description}</p>
        )}
        {deck.creatorName && (
          <p className="text-xs text-muted-foreground">oleh {deck.creatorName}</p>
        )}

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

        <div className="flex flex-col gap-2">
          <Link href={`/app/drill/${deck.id}`}>
            <Button variant="default" className="w-full">
              Pelajari
            </Button>
          </Link>
          <Link href={`/app/drill/decks/${deck.id}`}>
            <Button variant="secondary" className="w-full">
              Lihat Kartu
            </Button>
          </Link>
        </div>
      </div>
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
      {/* Tabs - Neo Brutalism Style */}
      <div className="flex border-b-2 border-border mb-6">
        <button
          onClick={() => setActiveTab('public')}
          className={`flex items-center gap-2 px-6 py-3 font-bold text-base transition-colors relative ${
            activeTab === 'public'
              ? 'text-foreground bg-card border-2 border-border border-b-card -mb-[2px] rounded-t-base'
              : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
          }`}
        >
          <Users size={18} />
          Dek Publik
        </button>
        <button
          onClick={() => setActiveTab('private')}
          className={`flex items-center gap-2 px-6 py-3 font-bold text-base transition-colors relative ${
            activeTab === 'private'
              ? 'text-foreground bg-card border-2 border-border border-b-card -mb-[2px] rounded-t-base'
              : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
          }`}
        >
          <BookOpen size={18} />
          Dek Pribadi
        </button>
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
        <div className="flex gap-2 mb-4">
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

        {/* SNS Share Buttons */}
        <div className="flex gap-3 justify-center">
          <button
            onClick={() => handleShareSocial('whatsapp')}
            className="p-3 rounded-base border-2 border-border bg-[#25D366] text-white shadow-shadow transition-all hover:translate-x-1 hover:translate-y-1 hover:shadow-none"
            title="WhatsApp"
          >
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
            </svg>
          </button>
          <button
            onClick={() => handleShareSocial('telegram')}
            className="p-3 rounded-base border-2 border-border bg-[#0088cc] text-white shadow-shadow transition-all hover:translate-x-1 hover:translate-y-1 hover:shadow-none"
            title="Telegram"
          >
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
            </svg>
          </button>
          <button
            onClick={() => handleShareSocial('line')}
            className="p-3 rounded-base border-2 border-border bg-[#00B900] text-white shadow-shadow transition-all hover:translate-x-1 hover:translate-y-1 hover:shadow-none"
            title="LINE"
          >
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63h2.386c.346 0 .627.285.627.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.104.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63.346 0 .628.285.628.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.282.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314" />
            </svg>
          </button>
          <button
            onClick={() => handleShareSocial('twitter')}
            className="p-3 rounded-base border-2 border-border bg-black text-white shadow-shadow transition-all hover:translate-x-1 hover:translate-y-1 hover:shadow-none"
            title="X"
          >
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
            </svg>
          </button>
          <button
            onClick={() => handleShareSocial('facebook')}
            className="p-3 rounded-base border-2 border-border bg-[#1877F2] text-white shadow-shadow transition-all hover:translate-x-1 hover:translate-y-1 hover:shadow-none"
            title="Facebook"
          >
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
            </svg>
          </button>
        </div>
      </Dialog>
    </div>
  );
}
