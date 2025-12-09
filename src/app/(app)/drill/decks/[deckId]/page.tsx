'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ChevronLeft, Plus, Edit2, Trash2, Search, Settings } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { LoadingState } from '@/components/ui/LoadingState';
import FlashcardEditor from '@/components/deck/FlashcardEditor';
import { CardType } from '@/types/deck';

interface DeckCardsPageProps {
  params: Promise<{ deckId: string }>;
}

interface Flashcard {
  id: string;
  cardType: CardType;
  kanji?: string;
  kanjiMeaning?: string;
  onyomi?: string;
  kunyomi?: string;
  word?: string;
  wordMeaning?: string;
  reading?: string;
  partOfSpeech?: string;
  grammarPoint?: string;
  grammarMeaning?: string;
  usageNote?: string;
  exampleSentence?: string;
  exampleTranslation?: string;
  notes?: string;
  tags?: string[];
  position: number;
  isActive: boolean;
}

interface Deck {
  id: string;
  name: string;
  description?: string;
  category?: string;
  difficulty?: string;
  isPublic: boolean;
  totalCards: number;
  isOwner: boolean;
  flashcards: Flashcard[];
}

export default function DeckCardsPage({ params }: DeckCardsPageProps) {
  const resolvedParams = use(params);
  const router = useRouter();
  const [deck, setDeck] = useState<Deck | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCardType, setFilterCardType] = useState<string>('all');
  const [showEditor, setShowEditor] = useState(false);
  const [editingCard, setEditingCard] = useState<Flashcard | undefined>();

  const fetchDeck = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/decks/${resolvedParams.deckId}`);
      if (response.ok) {
        const data = await response.json();
        setDeck(data);
      } else {
        router.push('/drill');
      }
    } catch (error) {
      console.error('Error fetching deck:', error);
      router.push('/drill');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDeck();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resolvedParams.deckId]);

  const handleDeleteCard = async (cardId: string) => {
    if (!window.confirm('Hapus kartu ini? Tindakan ini tidak dapat dibatalkan.')) return;

    try {
      const response = await fetch(`/api/flashcards/${cardId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        fetchDeck();
      } else {
        const data = await response.json();
        alert(`Gagal menghapus kartu: ${data.error}`);
      }
    } catch (error) {
      console.error('Error deleting flashcard:', error);
      alert('Gagal menghapus kartu');
    }
  };

  const handleCreateCard = () => {
    setEditingCard(undefined);
    setShowEditor(true);
  };

  const handleEditCard = (card: Flashcard) => {
    setEditingCard(card);
    setShowEditor(true);
  };

  const handleEditorSave = () => {
    setShowEditor(false);
    setEditingCard(undefined);
    fetchDeck();
  };

  const handleEditorCancel = () => {
    setShowEditor(false);
    setEditingCard(undefined);
  };

  const getCardContent = (card: Flashcard) => {
    switch (card.cardType) {
      case 'kanji':
        return (
          <>
            <div className="text-4xl font-bold mb-2 text-foreground">{card.kanji}</div>
            <div className="text-sm text-muted-foreground">{card.kanjiMeaning}</div>
            {(card.onyomi || card.kunyomi) && (
              <div className="text-xs text-muted-foreground mt-1">
                {card.onyomi && <span>音: {card.onyomi}</span>}
                {card.onyomi && card.kunyomi && ' | '}
                {card.kunyomi && <span>訓: {card.kunyomi}</span>}
              </div>
            )}
          </>
        );
      case 'vocabulary':
        return (
          <>
            <div className="text-2xl font-bold mb-1 text-foreground">{card.word}</div>
            <div className="text-sm text-muted-foreground mb-1">{card.reading}</div>
            <div className="text-sm text-foreground">{card.wordMeaning}</div>
            {card.partOfSpeech && (
              <div className="text-xs text-muted-foreground mt-1">{card.partOfSpeech}</div>
            )}
          </>
        );
      case 'grammar':
        return (
          <>
            <div className="text-xl font-bold mb-2 text-foreground">{card.grammarPoint}</div>
            <div className="text-sm text-foreground">{card.grammarMeaning}</div>
            {card.usageNote && (
              <div className="text-xs text-muted-foreground mt-1">{card.usageNote}</div>
            )}
          </>
        );
      default:
        return null;
    }
  };

  const getCardTypeLabel = (type: CardType) => {
    switch (type) {
      case 'kanji':
        return 'Kanji';
      case 'vocabulary':
        return 'Kosakata';
      case 'grammar':
        return 'Tata Bahasa';
      default:
        return type;
    }
  };

  const getCardTypeColor = (type: CardType) => {
    switch (type) {
      case 'kanji':
        return 'bg-[var(--card-kanji)]';
      case 'vocabulary':
        return 'bg-[var(--card-vocabulary)]';
      case 'grammar':
        return 'bg-[var(--card-grammar)]';
      default:
        return 'bg-muted';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <LoadingState type="spinner" size="lg" />
      </div>
    );
  }

  if (!deck) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-muted-foreground">Dek tidak ditemukan</div>
      </div>
    );
  }

  // Filter cards
  const filteredCards = deck.flashcards.filter(card => {
    const matchesType = filterCardType === 'all' || card.cardType === filterCardType;
    const matchesSearch =
      searchQuery === '' ||
      card.kanji?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      card.kanjiMeaning?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      card.word?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      card.wordMeaning?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      card.reading?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      card.grammarPoint?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      card.grammarMeaning?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesType && matchesSearch;
  });

  const cardTypes = Array.from(new Set(deck.flashcards.map(c => c.cardType)));

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-card border-b-2 border-border px-4 py-4">
        <div className="container mx-auto">
          <div className="flex items-center gap-4">
            <Link
              href="/drill"
              className="p-2 hover:bg-accent rounded-base transition-colors"
              aria-label="Kembali"
            >
              <ChevronLeft className="w-7 h-7 text-foreground" />
            </Link>
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-foreground">{deck.name}</h1>
              <p className="text-sm text-muted-foreground">{deck.totalCards} kartu</p>
            </div>
            <div className="flex gap-2">
              {deck.isOwner && (
                <Link href={`/app/drill/decks/${deck.id}/edit`}>
                  <Button variant="secondary" className="gap-2">
                    <Settings size={18} />
                    Edit Detail
                  </Button>
                </Link>
              )}
              <Link href={`/app/drill/${deck.id}`}>
                <Button variant="default">Pelajari</Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        {/* Search and Filter */}
        <Card className="p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Cari kartu..."
                  className="w-full pl-10 pr-4 py-2 border-2 border-border rounded-base bg-card text-foreground font-medium focus:ring-2 focus:ring-primary focus:border-primary"
                />
              </div>
            </div>

            {/* Type Filter */}
            <div className="flex gap-2 flex-wrap">
              <Button
                variant={filterCardType === 'all' ? 'default' : 'secondary'}
                size="sm"
                onClick={() => setFilterCardType('all')}
              >
                Semua ({deck.flashcards.length})
              </Button>
              {cardTypes.map(type => (
                <Button
                  key={type}
                  variant={filterCardType === type ? 'default' : 'secondary'}
                  size="sm"
                  onClick={() => setFilterCardType(type)}
                >
                  {getCardTypeLabel(type)} (
                  {deck.flashcards.filter(c => c.cardType === type).length})
                </Button>
              ))}
            </div>

            {/* Add Card Button (only for owner) */}
            {deck.isOwner && (
              <Button variant="default" className="gap-2" onClick={handleCreateCard}>
                <Plus size={20} />
                Tambah Kartu
              </Button>
            )}
          </div>
        </Card>

        {/* Cards Grid */}
        {filteredCards.length === 0 ? (
          <Card className="p-12 text-center">
            {deck.flashcards.length === 0 ? (
              <>
                <p className="text-muted-foreground mb-4">Belum ada kartu dalam dek ini.</p>
                {deck.isOwner && (
                  <Button variant="default" className="gap-2" onClick={handleCreateCard}>
                    <Plus size={20} />
                    Tambah Kartu Pertama
                  </Button>
                )}
              </>
            ) : (
              <p className="text-muted-foreground">Tidak ada kartu yang cocok dengan pencarian.</p>
            )}
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredCards.map(card => (
              <Card
                key={card.id}
                className="p-4 hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none transition-all"
              >
                <div className="flex items-start justify-between mb-3">
                  <span
                    className={`px-2 py-1 text-xs font-bold rounded-base border-2 border-border ${getCardTypeColor(card.cardType)}`}
                  >
                    {getCardTypeLabel(card.cardType)}
                  </span>
                  {deck.isOwner && (
                    <div className="flex gap-1">
                      <button
                        onClick={() => handleEditCard(card)}
                        className="p-1.5 rounded-base hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
                        title="Edit kartu"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={() => handleDeleteCard(card.id)}
                        className="p-1.5 rounded-base hover:bg-primary/10 transition-colors text-muted-foreground hover:text-primary"
                        title="Hapus kartu"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  )}
                </div>

                <div className="mb-3">{getCardContent(card)}</div>

                {card.exampleSentence && (
                  <div className="text-xs text-muted-foreground border-t-2 border-border pt-2 mt-2">
                    <div className="font-bold mb-1">Contoh:</div>
                    <div className="text-foreground">{card.exampleSentence}</div>
                    {card.exampleTranslation && (
                      <div className="text-muted-foreground mt-1">{card.exampleTranslation}</div>
                    )}
                  </div>
                )}

                {card.tags && card.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {card.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="px-2 py-0.5 text-xs bg-muted text-muted-foreground rounded-base"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </Card>
            ))}
          </div>
        )}

        {/* Results count */}
        {searchQuery && filteredCards.length > 0 && (
          <p className="text-sm text-muted-foreground mt-4 text-center">
            Menampilkan {filteredCards.length} dari {deck.flashcards.length} kartu
          </p>
        )}
      </div>

      {/* Flashcard Editor Modal */}
      {showEditor && deck.isOwner && (
        <FlashcardEditor
          deckId={deck.id}
          flashcard={editingCard}
          onSave={handleEditorSave}
          onCancel={handleEditorCancel}
        />
      )}
    </div>
  );
}
