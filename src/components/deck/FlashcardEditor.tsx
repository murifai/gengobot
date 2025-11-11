'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { CardType } from '@/types/deck';
import { X } from 'lucide-react';

interface FlashcardEditorProps {
  deckId: string;
  flashcard?: {
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
  };
  onSave: () => void;
  onCancel: () => void;
}

export default function FlashcardEditor({
  deckId,
  flashcard,
  onSave,
  onCancel,
}: FlashcardEditorProps) {
  const [cardType, setCardType] = useState<CardType>(flashcard?.cardType || 'vocabulary');
  const [saving, setSaving] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  // Kanji fields
  const [kanji, setKanji] = useState(flashcard?.kanji || '');
  const [kanjiMeaning, setKanjiMeaning] = useState(flashcard?.kanjiMeaning || '');
  const [onyomi, setOnyomi] = useState(flashcard?.onyomi || '');
  const [kunyomi, setKunyomi] = useState(flashcard?.kunyomi || '');

  // Vocabulary fields
  const [word, setWord] = useState(flashcard?.word || '');
  const [wordMeaning, setWordMeaning] = useState(flashcard?.wordMeaning || '');
  const [reading, setReading] = useState(flashcard?.reading || '');
  const [partOfSpeech, setPartOfSpeech] = useState(flashcard?.partOfSpeech || '');

  // Grammar fields
  const [grammarPoint, setGrammarPoint] = useState(flashcard?.grammarPoint || '');
  const [grammarMeaning, setGrammarMeaning] = useState(flashcard?.grammarMeaning || '');
  const [usageNote, setUsageNote] = useState(flashcard?.usageNote || '');

  // Common fields
  const [exampleSentence, setExampleSentence] = useState(flashcard?.exampleSentence || '');
  const [exampleTranslation, setExampleTranslation] = useState(flashcard?.exampleTranslation || '');
  const [notes, setNotes] = useState(flashcard?.notes || '');
  const [tags, setTags] = useState(flashcard?.tags?.join(', ') || '');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const baseData = {
        deckId,
        cardType,
        exampleSentence: exampleSentence || undefined,
        exampleTranslation: exampleTranslation || undefined,
        notes: notes || undefined,
        tags: tags ? tags.split(',').map(t => t.trim()) : undefined,
      };

      let cardData: Record<string, unknown> = { ...baseData };

      // Add type-specific fields
      switch (cardType) {
        case 'kanji':
          if (!kanji || !kanjiMeaning) {
            alert('Kanji and Meaning are required for kanji cards');
            setSaving(false);
            return;
          }
          cardData = {
            ...cardData,
            kanji,
            kanjiMeaning,
            onyomi: onyomi || undefined,
            kunyomi: kunyomi || undefined,
          };
          break;

        case 'vocabulary':
          if (!word || !wordMeaning || !reading) {
            alert('Word, Meaning, and Reading are required for vocabulary cards');
            setSaving(false);
            return;
          }
          cardData = {
            ...cardData,
            word,
            wordMeaning,
            reading,
            partOfSpeech: partOfSpeech || undefined,
          };
          break;

        case 'grammar':
          if (!grammarPoint || !grammarMeaning) {
            alert('Grammar Point and Meaning are required for grammar cards');
            setSaving(false);
            return;
          }
          cardData = {
            ...cardData,
            grammarPoint,
            grammarMeaning,
            usageNote: usageNote || undefined,
          };
          break;
      }

      const url = flashcard ? `/api/flashcards/${flashcard.id}` : '/api/flashcards';
      const method = flashcard ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(cardData),
      });

      if (response.ok) {
        alert(flashcard ? 'Flashcard updated successfully!' : 'Flashcard created successfully!');
        onSave();
      } else {
        const data = await response.json();
        alert(`Failed to save flashcard: ${data.error}`);
      }
    } catch (error) {
      console.error('Error saving flashcard:', error);
      alert('Failed to save flashcard. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const renderPreview = () => {
    return (
      <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-6 border-2 border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Card Preview</h3>
          <span className="px-2 py-1 text-xs font-semibold rounded bg-secondary/10 text-foreground">
            {cardType}
          </span>
        </div>

        {/* Front of card */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-8 mb-4 min-h-[200px] flex items-center justify-center">
          <div className="text-center">
            {cardType === 'kanji' && (
              <>
                <div className="text-6xl font-bold mb-2 text-gray-900 dark:text-white">
                  {kanji || '?'}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  {kanjiMeaning || 'Meaning'}
                </div>
              </>
            )}
            {cardType === 'vocabulary' && (
              <>
                <div className="text-4xl font-bold mb-2 text-gray-900 dark:text-white">
                  {word || '?'}
                </div>
                <div className="text-lg text-gray-500 dark:text-gray-400 mb-1">
                  {reading || 'Reading'}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {wordMeaning || 'Meaning'}
                </div>
              </>
            )}
            {cardType === 'grammar' && (
              <>
                <div className="text-3xl font-bold mb-2 text-gray-900 dark:text-white">
                  {grammarPoint || '?'}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {grammarMeaning || 'Meaning'}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Additional info */}
        {exampleSentence && (
          <div className="bg-secondary/10 rounded p-3 text-sm">
            <div className="font-medium text-secondary mb-1">Example:</div>
            <div className="text-foreground mb-1">{exampleSentence}</div>
            {exampleTranslation && (
              <div className="text-blue-600 dark:text-blue-300 text-xs">{exampleTranslation}</div>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            {flashcard ? 'Edit Flashcard' : 'Create Flashcard'}
          </h2>
          <button
            onClick={onCancel}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          {/* Card Type Selector */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Card Type *
            </label>
            <div className="flex gap-2">
              <Button
                type="button"
                variant={cardType === 'kanji' ? 'default' : 'secondary'}
                size="sm"
                onClick={() => setCardType('kanji')}
              >
                Kanji
              </Button>
              <Button
                type="button"
                variant={cardType === 'vocabulary' ? 'default' : 'secondary'}
                size="sm"
                onClick={() => setCardType('vocabulary')}
              >
                Vocabulary
              </Button>
              <Button
                type="button"
                variant={cardType === 'grammar' ? 'default' : 'secondary'}
                size="sm"
                onClick={() => setCardType('grammar')}
              >
                Grammar
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column - Form Fields */}
            <div className="space-y-4">
              {/* Kanji Card Fields */}
              {cardType === 'kanji' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Kanji *
                    </label>
                    <Input
                      type="text"
                      value={kanji}
                      onChange={e => setKanji(e.target.value)}
                      placeholder="日"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Meaning *
                    </label>
                    <Input
                      type="text"
                      value={kanjiMeaning}
                      onChange={e => setKanjiMeaning(e.target.value)}
                      placeholder="sun, day"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Onyomi (On Reading)
                    </label>
                    <Input
                      type="text"
                      value={onyomi}
                      onChange={e => setOnyomi(e.target.value)}
                      placeholder="ニチ、ジツ"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Kunyomi (Kun Reading)
                    </label>
                    <Input
                      type="text"
                      value={kunyomi}
                      onChange={e => setKunyomi(e.target.value)}
                      placeholder="ひ、か"
                    />
                  </div>
                </>
              )}

              {/* Vocabulary Card Fields */}
              {cardType === 'vocabulary' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Word *
                    </label>
                    <Input
                      type="text"
                      value={word}
                      onChange={e => setWord(e.target.value)}
                      placeholder="食べる"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Meaning *
                    </label>
                    <Input
                      type="text"
                      value={wordMeaning}
                      onChange={e => setWordMeaning(e.target.value)}
                      placeholder="to eat"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Reading (Furigana) *
                    </label>
                    <Input
                      type="text"
                      value={reading}
                      onChange={e => setReading(e.target.value)}
                      placeholder="たべる"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Part of Speech
                    </label>
                    <select
                      value={partOfSpeech}
                      onChange={e => setPartOfSpeech(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent"
                    >
                      <option value="">Select (optional)</option>
                      <option value="Noun">Noun</option>
                      <option value="Verb (Ichidan)">Verb (Ichidan)</option>
                      <option value="Verb (Godan)">Verb (Godan)</option>
                      <option value="Verb (Irregular)">Verb (Irregular)</option>
                      <option value="い-Adjective">い-Adjective</option>
                      <option value="な-Adjective">な-Adjective</option>
                      <option value="Adverb">Adverb</option>
                      <option value="Particle">Particle</option>
                      <option value="Counter">Counter</option>
                    </select>
                  </div>
                </>
              )}

              {/* Grammar Card Fields */}
              {cardType === 'grammar' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Grammar Point *
                    </label>
                    <Input
                      type="text"
                      value={grammarPoint}
                      onChange={e => setGrammarPoint(e.target.value)}
                      placeholder="〜ています"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Meaning *
                    </label>
                    <Input
                      type="text"
                      value={grammarMeaning}
                      onChange={e => setGrammarMeaning(e.target.value)}
                      placeholder="To be doing something (continuous action)"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Usage Note
                    </label>
                    <textarea
                      value={usageNote}
                      onChange={e => setUsageNote(e.target.value)}
                      placeholder="Verb て-form + います"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent"
                      rows={2}
                    />
                  </div>
                </>
              )}

              {/* Common Fields */}
              <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                  Additional Information (Optional)
                </h3>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Example Sentence
                    </label>
                    <textarea
                      value={exampleSentence}
                      onChange={e => setExampleSentence(e.target.value)}
                      placeholder="今日は良い天気です。"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent"
                      rows={2}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Example Translation
                    </label>
                    <Input
                      type="text"
                      value={exampleTranslation}
                      onChange={e => setExampleTranslation(e.target.value)}
                      placeholder="Today's weather is good."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Notes
                    </label>
                    <textarea
                      value={notes}
                      onChange={e => setNotes(e.target.value)}
                      placeholder="Additional notes or mnemonics..."
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent"
                      rows={2}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Tags (comma-separated)
                    </label>
                    <Input
                      type="text"
                      value={tags}
                      onChange={e => setTags(e.target.value)}
                      placeholder="JLPT N5, common, daily life"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Preview */}
            <div className="lg:sticky lg:top-6 h-fit">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Preview</h3>
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => setShowPreview(!showPreview)}
                >
                  {showPreview ? 'Hide' : 'Show'} Preview
                </Button>
              </div>
              {showPreview && renderPreview()}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
            <Button type="submit" variant="default" disabled={saving} className="flex-1">
              {saving ? 'Saving...' : flashcard ? 'Update Card' : 'Create Card'}
            </Button>
            <Button type="button" variant="secondary" onClick={onCancel} disabled={saving}>
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
