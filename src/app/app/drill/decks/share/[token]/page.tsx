'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, Heart, Play, BookOpen, User, Calendar, BarChart3 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { LoadingState } from '@/components/ui/LoadingState';

interface SharedDeck {
  id: string;
  name: string;
  description: string | null;
  category: string | null;
  difficulty: string | null;
  totalCards: number;
  studyCount: number;
  averageScore: number | null;
  createdAt: string;
  creatorName: string;
  previewCards: Array<{
    id: string;
    cardType: string;
    character?: string;
    romaji?: string;
    kanji?: string;
    kanjiMeaning?: string;
    word?: string;
    wordMeaning?: string;
    reading?: string;
    grammarPoint?: string;
    grammarMeaning?: string;
  }>;
}

export default function SharedDeckPage() {
  const router = useRouter();
  const params = useParams();
  const token = params.token as string;

  const [deck, setDeck] = useState<SharedDeck | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [favoriteLoading, setFavoriteLoading] = useState(false);

  useEffect(() => {
    fetchDeck();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const fetchDeck = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/decks/shared/${token}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to load deck');
      }

      setDeck(data.deck);

      // Check if user has favorited this deck
      const favResponse = await fetch(`/api/decks/${data.deck.id}/favorite`);
      if (favResponse.ok) {
        const favData = await favResponse.json();
        setIsFavorite(favData.isFavorite);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleFavorite = async () => {
    if (!deck) return;

    setFavoriteLoading(true);
    try {
      if (isFavorite) {
        await fetch(`/api/decks/${deck.id}/favorite`, { method: 'DELETE' });
        setIsFavorite(false);
      } else {
        await fetch(`/api/decks/${deck.id}/favorite`, { method: 'POST' });
        setIsFavorite(true);
      }
    } catch (err) {
      console.error('Failed to update favorite:', err);
    } finally {
      setFavoriteLoading(false);
    }
  };

  const handleStudy = () => {
    if (!deck) return;
    router.push(`/app/drill/decks/${deck.id}/study`);
  };

  const getCardPreview = (card: SharedDeck['previewCards'][0]) => {
    switch (card.cardType) {
      case 'hiragana':
      case 'katakana':
        return card.character || '-';
      case 'kanji':
        return card.kanji || '-';
      case 'vocabulary':
        return card.word || '-';
      case 'grammar':
        return card.grammarPoint || '-';
      default:
        return '-';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <LoadingState type="spinner" size="lg" />
      </div>
    );
  }

  if (error || !deck) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8 max-w-3xl">
          <Card className="p-8 text-center">
            <h1 className="text-2xl font-bold text-foreground mb-4">Deck Tidak Ditemukan</h1>
            <p className="text-muted-foreground mb-6">
              {error || 'Link ini tidak valid atau deck sudah tidak dibagikan lagi.'}
            </p>
            <Button onClick={() => router.push('/app/drill')}>
              <ArrowLeft size={20} className="mr-2" />
              Kembali ke Dek
            </Button>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        {/* Header */}
        <div className="mb-6">
          <Button variant="ghost" className="mb-4 gap-2" onClick={() => router.push('/app/drill')}>
            <ArrowLeft size={20} />
            Kembali
          </Button>
        </div>

        {/* Deck Info Card */}
        <Card className="p-6 mb-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-foreground mb-2">{deck.name}</h1>
              {deck.description && <p className="text-muted-foreground mb-4">{deck.description}</p>}
            </div>
            <Button
              variant={isFavorite ? 'default' : 'outline'}
              size="sm"
              onClick={handleFavorite}
              disabled={favoriteLoading}
              className="gap-2"
            >
              <Heart size={18} className={isFavorite ? 'fill-current' : ''} />
              {isFavorite ? 'Difavoritkan' : 'Favoritkan'}
            </Button>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="flex items-center gap-2 text-sm">
              <BookOpen size={16} className="text-muted-foreground" />
              <span className="text-foreground font-medium">{deck.totalCards} Kartu</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <User size={16} className="text-muted-foreground" />
              <span className="text-foreground">{deck.creatorName}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Calendar size={16} className="text-muted-foreground" />
              <span className="text-foreground">
                {new Date(deck.createdAt).toLocaleDateString('id-ID')}
              </span>
            </div>
            {deck.averageScore && (
              <div className="flex items-center gap-2 text-sm">
                <BarChart3 size={16} className="text-muted-foreground" />
                <span className="text-foreground">{Math.round(deck.averageScore)}% avg</span>
              </div>
            )}
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-2 mb-6">
            {deck.category && (
              <span className="px-3 py-1 rounded-full text-xs font-medium bg-secondary text-secondary-foreground">
                {deck.category}
              </span>
            )}
            {deck.difficulty && (
              <span className="px-3 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary">
                {deck.difficulty}
              </span>
            )}
          </div>

          {/* Action Button */}
          <Button onClick={handleStudy} className="w-full gap-2" size="lg">
            <Play size={20} />
            Mulai Belajar
          </Button>
        </Card>

        {/* Preview Cards */}
        <div>
          <h2 className="text-lg font-semibold text-foreground mb-4">
            Preview Kartu ({deck.previewCards.length} dari {deck.totalCards})
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {deck.previewCards.map(card => (
              <Card key={card.id} className="p-4 text-center hover:shadow-md transition-shadow">
                <div className="text-2xl font-bold text-foreground mb-1">
                  {getCardPreview(card)}
                </div>
                <div className="text-xs text-muted-foreground capitalize">{card.cardType}</div>
              </Card>
            ))}
          </div>
          {deck.totalCards > 10 && (
            <p className="text-center text-muted-foreground text-sm mt-4">
              ... dan {deck.totalCards - 10} kartu lainnya
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
