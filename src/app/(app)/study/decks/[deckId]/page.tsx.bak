'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Edit, Download, Plus, Trash2, Edit2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import FlashcardEditor from '@/components/deck/FlashcardEditor';
import { CardType } from '@/types/deck';

interface DeckViewPageProps {
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
  studyCount: number;
  isActive: boolean;
  createdAt: string;
  creator: {
    name: string | null;
    email: string;
  };
  flashcards: Flashcard[];
}

export default function DeckViewPage({ params }: DeckViewPageProps) {
  const resolvedParams = use(params);
  const router = useRouter();
  const [deck, setDeck] = useState<Deck | null>(null);
  const [loading, setLoading] = useState(true);
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
        alert('Failed to load deck');
        router.push('/study/my-decks');
      }
    } catch (error) {
      console.error('Error fetching deck:', error);
      alert('Failed to load deck');
      router.push('/study/my-decks');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDeck();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resolvedParams.deckId]);

  const handleExport = async () => {
    if (!deck) return;

    try {
      const response = await fetch(`/api/decks/${deck.id}/export`);
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${deck.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.xlsx`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (error) {
      console.error('Error exporting deck:', error);
      alert('Failed to export deck');
    }
  };

  const handleDeleteCard = async (cardId: string) => {
    if (!window.confirm('Delete this flashcard?')) return;

    try {
      const response = await fetch(`/api/flashcards/${cardId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        alert('Flashcard deleted successfully');
        fetchDeck();
      } else {
        const data = await response.json();
        alert(`Failed to delete flashcard: ${data.error}`);
      }
    } catch (error) {
      console.error('Error deleting flashcard:', error);
      alert('Failed to delete flashcard');
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
            <div className="text-4xl font-bold mb-2">{card.kanji}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">{card.kanjiMeaning}</div>
          </>
        );
      case 'vocabulary':
        return (
          <>
            <div className="text-2xl font-bold mb-1">{card.word}</div>
            <div className="text-sm text-gray-500 dark:text-gray-500 mb-1">{card.reading}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">{card.wordMeaning}</div>
          </>
        );
      case 'grammar':
        return (
          <>
            <div className="text-xl font-bold mb-2">{card.grammarPoint}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">{card.grammarMeaning}</div>
          </>
        );
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-600 dark:text-gray-400">Loading...</div>
      </div>
    );
  }

  if (!deck) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-600 dark:text-gray-400">Deck not found</div>
      </div>
    );
  }

  const filteredCards = deck.flashcards.filter(
    card => filterCardType === 'all' || card.cardType === filterCardType
  );

  const cardTypes = Array.from(new Set(deck.flashcards.map(c => c.cardType)));

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            className="mb-4 gap-2"
            onClick={() => router.push('/study/my-decks')}
          >
            <ArrowLeft size={20} />
            Back to My Decks
          </Button>

          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{deck.name}</h1>
              {deck.description && (
                <p className="text-gray-600 dark:text-gray-400 mb-4">{deck.description}</p>
              )}
              <div className="flex flex-wrap gap-2">
                {deck.category && (
                  <span className="px-2 py-1 text-xs font-semibold rounded-full bg-secondary/10 text-secondary">
                    {deck.category}
                  </span>
                )}
                {deck.difficulty && (
                  <span className="px-2 py-1 text-xs font-semibold rounded-full bg-tertiary-green/10 text-tertiary-green">
                    {deck.difficulty}
                  </span>
                )}
                <span
                  className={`px-2 py-1 text-xs font-semibold rounded-full ${
                    deck.isPublic
                      ? 'bg-secondary/10 text-secondary'
                      : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                  }`}
                >
                  {deck.isPublic ? 'Public' : 'Private'}
                </span>
              </div>
            </div>

            <div className="flex gap-2">
              <Button variant="secondary" className="gap-2" onClick={handleExport}>
                <Download size={20} />
                Export
              </Button>
              <Button
                variant="default"
                className="gap-2"
                onClick={() => router.push(`/study/decks/${deck.id}/edit`)}
              >
                <Edit size={20} />
                Edit Deck
              </Button>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
            <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total Cards</div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {deck.totalCards}
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
            <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Study Sessions</div>
            <div className="text-2xl font-bold text-primary">{deck.studyCount}</div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
            <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Created</div>
            <div className="text-sm font-medium text-gray-900 dark:text-white">
              {new Date(deck.createdAt).toLocaleDateString()}
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm mb-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex gap-2 flex-wrap">
              <span className="text-sm text-gray-600 dark:text-gray-400 self-center">
                Card Type:
              </span>
              <Button
                variant={filterCardType === 'all' ? 'default' : 'secondary'}
                size="sm"
                onClick={() => setFilterCardType('all')}
              >
                All ({deck.flashcards.length})
              </Button>
              {cardTypes.map(type => (
                <Button
                  key={type}
                  variant={filterCardType === type ? 'default' : 'secondary'}
                  size="sm"
                  onClick={() => setFilterCardType(type)}
                >
                  {type.charAt(0).toUpperCase() + type.slice(1)} (
                  {deck.flashcards.filter(c => c.cardType === type).length})
                </Button>
              ))}
            </div>

            <Button variant="default" className="gap-2" onClick={handleCreateCard}>
              <Plus size={20} />
              Add Card
            </Button>
          </div>
        </div>

        {/* Flashcards */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            Flashcards ({filteredCards.length})
          </h2>

          {filteredCards.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-500 mb-4">
                No flashcards found. Add some flashcards to get started!
              </div>
              <Button variant="default" className="gap-2" onClick={handleCreateCard}>
                <Plus size={20} />
                Add Your First Card
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredCards.map(card => (
                <div
                  key={card.id}
                  className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between mb-3">
                    <span className="px-2 py-1 text-xs font-semibold rounded bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200">
                      {card.cardType}
                    </span>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditCard(card)}
                        className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
                        title="Edit card"
                      >
                        <Edit2 size={16} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteCard(card.id)}
                        className="text-red-500 hover:text-red-700"
                        title="Delete card"
                      >
                        <Trash2 size={16} />
                      </Button>
                    </div>
                  </div>

                  <div className="mb-3">{getCardContent(card)}</div>

                  {card.exampleSentence && (
                    <div className="text-xs text-gray-500 dark:text-gray-400 border-t border-gray-200 dark:border-gray-700 pt-2 mt-2">
                      <div className="font-medium mb-1">Example:</div>
                      <div>{card.exampleSentence}</div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Help Text */}
        <div className="mt-6 bg-secondary/10 border border-secondary/30 rounded-lg p-4">
          <h3 className="font-semibold text-secondary mb-2">Managing Flashcards</h3>
          <ul className="text-sm text-foreground space-y-1 list-disc list-inside">
            <li>Click &quot;Add Card&quot; to create new flashcards manually</li>
            <li>Click the edit icon on any card to modify it</li>
            <li>Click the delete icon to remove a card (cannot be undone)</li>
            <li>Use the card type filters to view specific types of cards</li>
            <li>Export your deck to Excel for backup or sharing</li>
          </ul>
        </div>

        {/* Flashcard Editor Modal */}
        {showEditor && (
          <FlashcardEditor
            deckId={deck.id}
            flashcard={editingCard}
            onSave={handleEditorSave}
            onCancel={handleEditorCancel}
          />
        )}
      </div>
    </div>
  );
}
