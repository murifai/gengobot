'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

interface Deck {
  id: string;
  name: string;
  description: string | null;
  category: string | null;
  difficulty: string | null;
  totalCards: number;
  _count?: {
    flashcards: number;
  };
}

interface SelectedDeck extends Deck {
  order: number;
}

interface DeckSelectorProps {
  selectedDeckIds: string[];
  onChange: (deckIds: string[]) => void;
}

export default function DeckSelector({ selectedDeckIds, onChange }: DeckSelectorProps) {
  const [availableDecks, setAvailableDecks] = useState<Deck[]>([]);
  const [selectedDecks, setSelectedDecks] = useState<SelectedDeck[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showDeckList, setShowDeckList] = useState(false);

  useEffect(() => {
    fetchDecks();
  }, []);

  useEffect(() => {
    // When selectedDeckIds change from parent, update selectedDecks
    if (availableDecks.length > 0) {
      const decks = selectedDeckIds
        .map((id, index) => {
          const deck = availableDecks.find(d => d.id === id);
          return deck ? { ...deck, order: index } : null;
        })
        .filter(Boolean) as SelectedDeck[];
      setSelectedDecks(decks);
    }
  }, [selectedDeckIds, availableDecks]);

  const fetchDecks = async () => {
    try {
      setLoading(true);
      // Fetch only task decks (decks marked for task prerequisites)
      const response = await fetch('/api/decks?limit=100&isTaskDeck=true');
      if (response.ok) {
        const data = await response.json();
        const decksWithCount = data.decks.map((deck: Deck) => ({
          ...deck,
          totalCards: deck._count?.flashcards || 0,
        }));
        setAvailableDecks(decksWithCount);
      }
    } catch (error) {
      console.error('Error fetching decks:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddDeck = (deck: Deck) => {
    if (selectedDecks.find(d => d.id === deck.id)) {
      return; // Already selected
    }

    const newDeck: SelectedDeck = { ...deck, order: selectedDecks.length };
    const newSelectedDecks = [...selectedDecks, newDeck];
    setSelectedDecks(newSelectedDecks);
    onChange(newSelectedDecks.map(d => d.id));
    setShowDeckList(false);
    setSearchTerm('');
  };

  const handleRemoveDeck = (deckId: string) => {
    const newSelectedDecks = selectedDecks
      .filter(d => d.id !== deckId)
      .map((d, index) => ({ ...d, order: index }));
    setSelectedDecks(newSelectedDecks);
    onChange(newSelectedDecks.map(d => d.id));
  };

  const moveDeck = (deckId: string, direction: 'up' | 'down') => {
    const index = selectedDecks.findIndex(d => d.id === deckId);
    if (
      (direction === 'up' && index === 0) ||
      (direction === 'down' && index === selectedDecks.length - 1)
    ) {
      return;
    }

    const newDecks = [...selectedDecks];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    [newDecks[index], newDecks[targetIndex]] = [newDecks[targetIndex], newDecks[index]];
    const reorderedDecks = newDecks.map((d, i) => ({ ...d, order: i }));
    setSelectedDecks(reorderedDecks);
    onChange(reorderedDecks.map(d => d.id));
  };

  const filteredDecks = availableDecks.filter(
    deck =>
      deck.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      deck.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Study Decks (Optional)
        </label>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
          Select decks that students should study before starting this task
        </p>

        {/* Selected Decks */}
        {selectedDecks.length > 0 && (
          <div className="space-y-2 mb-4">
            {selectedDecks.map((deck, index) => (
              <div
                key={deck.id}
                className="flex items-center gap-2 p-3 bg-secondary/10 rounded-lg border border-secondary/30"
              >
                <div className="flex-1">
                  <div className="font-medium text-gray-900 dark:text-white">{deck.name}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {deck.totalCards} cards
                    {deck.category && ` • ${deck.category}`}
                    {deck.difficulty && ` • ${deck.difficulty}`}
                  </div>
                </div>
                <div className="flex gap-1">
                  <button
                    type="button"
                    onClick={() => moveDeck(deck.id, 'up')}
                    disabled={index === 0}
                    className="p-1 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white disabled:opacity-30"
                    title="Move up"
                  >
                    ↑
                  </button>
                  <button
                    type="button"
                    onClick={() => moveDeck(deck.id, 'down')}
                    disabled={index === selectedDecks.length - 1}
                    className="p-1 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white disabled:opacity-30"
                    title="Move down"
                  >
                    ↓
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRemoveDeck(deck.id)}
                    className="p-1 text-primary hover:text-red-700 dark:hover:text-red-300"
                    title="Remove"
                  >
                    ✕
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Add Deck Button */}
        {!showDeckList && (
          <Button
            type="button"
            variant="secondary"
            onClick={() => setShowDeckList(true)}
            className="w-full"
          >
            + Add Study Deck
          </Button>
        )}

        {/* Deck Selection List */}
        {showDeckList && (
          <div className="border border-gray-300 dark:border-gray-600 rounded-lg p-4 bg-white dark:bg-gray-800">
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-medium text-gray-900 dark:text-white">Select a Deck</h3>
              <button
                type="button"
                onClick={() => {
                  setShowDeckList(false);
                  setSearchTerm('');
                }}
                className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
              >
                ✕
              </button>
            </div>

            <Input
              type="text"
              placeholder="Search decks..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="mb-3"
            />

            <div className="max-h-64 overflow-y-auto space-y-2">
              {loading ? (
                <p className="text-gray-500 dark:text-gray-400 text-center py-4">Loading...</p>
              ) : filteredDecks.length === 0 ? (
                <p className="text-gray-500 dark:text-gray-400 text-center py-4">No decks found</p>
              ) : (
                filteredDecks.map(deck => {
                  const isSelected = selectedDecks.some(d => d.id === deck.id);
                  return (
                    <button
                      key={deck.id}
                      type="button"
                      onClick={() => handleAddDeck(deck)}
                      disabled={isSelected}
                      className={`w-full text-left p-3 rounded-lg border transition-colors ${
                        isSelected
                          ? 'bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 opacity-50 cursor-not-allowed'
                          : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-400 hover:bg-secondary/10/20'
                      }`}
                    >
                      <div className="font-medium text-gray-900 dark:text-white">
                        {deck.name}
                        {isSelected && (
                          <span className="ml-2 text-sm text-tertiary-green">✓ Selected</span>
                        )}
                      </div>
                      {deck.description && (
                        <div className="text-sm text-gray-600 dark:text-gray-400 line-clamp-1">
                          {deck.description}
                        </div>
                      )}
                      <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                        {deck.totalCards} cards
                        {deck.category && ` • ${deck.category}`}
                        {deck.difficulty && ` • ${deck.difficulty}`}
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
