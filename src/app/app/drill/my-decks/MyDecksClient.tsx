'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Plus,
  Edit,
  Trash2,
  BookOpen,
  Download,
  ChevronLeft,
  Search,
  Eye,
  Heart,
  Share2,
  Play,
  Clock,
  ChevronDown,
  ChevronUp,
  Check,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
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
  uniqueHafal?: number;
  uniqueBelumHafal?: number;
  createdAt: string;
  updatedAt: string;
  shareToken?: string | null;
  lastStudied?: string;
  isFavorite?: boolean;
  creatorName?: string;
}

export function MyDecksClient() {
  const router = useRouter();
  const [myDecks, setMyDecks] = useState<Deck[]>([]);
  const [favoriteDecks, setFavoriteDecks] = useState<Deck[]>([]);
  const [studyingDecks, setStudyingDecks] = useState<Deck[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    studying: true,
    favorites: true,
    myDecks: true,
  });
  const [copiedShareLink, setCopiedShareLink] = useState<string | null>(null);

  const fetchAllDecks = async () => {
    try {
      setLoading(true);

      // Fetch all data in parallel
      const [myDecksRes, favoritesRes, studyingRes] = await Promise.all([
        fetch('/api/decks?myDecks=true&limit=100'),
        fetch('/api/decks/favorites'),
        fetch('/api/decks/studying'),
      ]);

      if (myDecksRes.ok) {
        const data = await myDecksRes.json();
        setMyDecks(data.decks || []);
      }

      if (favoritesRes.ok) {
        const data = await favoritesRes.json();
        setFavoriteDecks(data.decks || []);
      }

      if (studyingRes.ok) {
        const data = await studyingRes.json();
        setStudyingDecks(data.decks || []);
      }
    } catch (error) {
      console.error('Error fetching decks:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllDecks();
  }, []);

  const handleDelete = async (deckId: string, deckName: string) => {
    const confirmDelete = window.confirm(
      `Hapus "${deckName}"?\n\n` +
        'Ini akan menghapus:\n' +
        '• Deck dan semua kartu\n' +
        '• Semua sesi belajar\n\n' +
        'Tindakan ini tidak bisa dibatalkan!'
    );

    if (!confirmDelete) return;

    try {
      setDeleting(deckId);
      const response = await fetch(`/api/decks/${deckId}`, { method: 'DELETE' });

      if (response.ok) {
        fetchAllDecks();
      } else {
        const data = await response.json();
        alert(`Gagal menghapus: ${data.error}`);
      }
    } catch (error) {
      console.error('Error deleting deck:', error);
      alert('Gagal menghapus deck');
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
      }
    } catch (error) {
      console.error('Error exporting deck:', error);
      alert('Gagal export deck');
    }
  };

  const handleToggleFavorite = async (deckId: string, isFavorite: boolean) => {
    try {
      if (isFavorite) {
        await fetch(`/api/decks/${deckId}/favorite`, { method: 'DELETE' });
      } else {
        await fetch(`/api/decks/${deckId}/favorite`, { method: 'POST' });
      }
      fetchAllDecks();
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
        await navigator.clipboard.writeText(fullUrl);
        setCopiedShareLink(deckId);
        setTimeout(() => setCopiedShareLink(null), 2000);
        fetchAllDecks();
      }
    } catch (error) {
      console.error('Error sharing deck:', error);
      alert('Gagal membuat link share');
    }
  };

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const filterDecks = (decks: Deck[]) => {
    if (!searchQuery) return decks;
    return decks.filter(
      deck =>
        deck.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        deck.description?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  };

  const formatLastStudied = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Hari ini';
    if (diffDays === 1) return 'Kemarin';
    if (diffDays < 7) return `${diffDays} hari lalu`;
    return date.toLocaleDateString('id-ID');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <LoadingState type="spinner" size="lg" />
      </div>
    );
  }

  const renderDeckCard = (deck: Deck, showOwnerActions: boolean) => (
    <Card key={deck.id} className="p-4 hover:shadow-md transition-all">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-semibold text-foreground truncate">{deck.name}</h3>
            {deck.category && (
              <span className="px-2 py-0.5 text-xs rounded-full bg-secondary/10 text-secondary shrink-0">
                {deck.category}
              </span>
            )}
            {deck.difficulty && (
              <span className="px-2 py-0.5 text-xs rounded-full bg-primary/10 text-primary shrink-0">
                {deck.difficulty}
              </span>
            )}
          </div>
          {deck.description && (
            <p className="text-sm text-muted-foreground line-clamp-1 mb-2">{deck.description}</p>
          )}
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span>{deck.totalCards} kartu</span>
            {deck.uniqueHafal !== undefined && (
              <span className="text-tertiary-green">{deck.uniqueHafal} hafal</span>
            )}
            {deck.uniqueBelumHafal !== undefined && deck.uniqueBelumHafal > 0 && (
              <span className="text-primary">{deck.uniqueBelumHafal} belum</span>
            )}
            {deck.lastStudied && (
              <span className="flex items-center gap-1">
                <Clock size={14} />
                {formatLastStudied(deck.lastStudied)}
              </span>
            )}
            {deck.creatorName && (
              <span className="text-muted-foreground">oleh {deck.creatorName}</span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push(`/app/drill/decks/${deck.id}/study`)}
            title="Belajar"
            className="text-tertiary-green hover:text-tertiary-green"
          >
            <Play size={18} />
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleToggleFavorite(deck.id, deck.isFavorite || false)}
            title={deck.isFavorite ? 'Hapus dari favorit' : 'Tambah ke favorit'}
          >
            <Heart size={18} className={deck.isFavorite ? 'fill-red-500 text-red-500' : ''} />
          </Button>

          {showOwnerActions && (
            <>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push(`/app/drill/decks/${deck.id}`)}
                title="Kelola Kartu"
              >
                <Eye size={18} />
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push(`/app/drill/decks/${deck.id}/edit`)}
                title="Edit"
              >
                <Edit size={18} />
              </Button>

              <Button variant="ghost" size="sm" onClick={() => handleShare(deck.id)} title="Share">
                {copiedShareLink === deck.id ? (
                  <Check size={18} className="text-tertiary-green" />
                ) : (
                  <Share2 size={18} />
                )}
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleExport(deck.id, deck.name)}
                title="Export"
              >
                <Download size={18} />
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleDelete(deck.id, deck.name)}
                title="Hapus"
                disabled={deleting === deck.id}
              >
                <Trash2 size={18} className="text-red-500" />
              </Button>
            </>
          )}
        </div>
      </div>
    </Card>
  );

  const renderSection = (
    id: string,
    title: string,
    icon: React.ReactNode,
    decks: Deck[],
    emptyMessage: string,
    showOwnerActions: boolean
  ) => {
    const filteredList = filterDecks(decks);
    const isExpanded = expandedSections[id];

    return (
      <div className="mb-8">
        <button
          onClick={() => toggleSection(id)}
          className="w-full flex items-center justify-between p-3 bg-muted/50 rounded-lg hover:bg-muted transition-colors mb-3"
        >
          <div className="flex items-center gap-3">
            {icon}
            <span className="font-semibold text-foreground">{title}</span>
            <span className="text-sm text-muted-foreground">({filteredList.length})</span>
          </div>
          {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </button>

        {isExpanded && (
          <div className="space-y-3">
            {filteredList.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">{emptyMessage}</div>
            ) : (
              filteredList.map(deck => renderDeckCard(deck, showOwnerActions))
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-card border-b-2 border-border px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push('/app/drill')}
            className="p-2 hover:bg-accent rounded-base transition-colors"
            aria-label="Go back"
          >
            <ChevronLeft className="w-7 h-7 text-foreground" />
          </button>
          <h1 className="text-2xl font-bold">Dek Saya</h1>
        </div>
        <Link href="/app/drill/decks/new">
          <Button variant="default" className="gap-2">
            <Plus size={20} />
            Buat Deck Baru
          </Button>
        </Link>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Search */}
        <div className="mb-6">
          <div className="relative">
            <Search
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground"
              size={20}
            />
            <Input
              type="text"
              placeholder="Cari deck..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Sections */}
        {renderSection(
          'studying',
          'Sedang Dipelajari',
          <BookOpen size={20} className="text-tertiary-green" />,
          studyingDecks,
          'Belum ada deck yang sedang dipelajari. Mulai belajar untuk menambahkan deck ke sini.',
          false
        )}

        {renderSection(
          'favorites',
          'Favorit',
          <Heart size={20} className="text-red-500" />,
          favoriteDecks,
          'Belum ada deck favorit. Klik tombol hati pada deck untuk menambahkan ke favorit.',
          false
        )}

        {renderSection(
          'myDecks',
          'Buatan Saya',
          <Edit size={20} className="text-secondary" />,
          myDecks,
          'Belum ada deck buatan Anda. Klik "Buat Deck Baru" untuk memulai.',
          true
        )}
      </div>
    </div>
  );
}
