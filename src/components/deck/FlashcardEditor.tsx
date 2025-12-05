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
  const [showPreview, setShowPreview] = useState(true);

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
            alert('Kanji dan Arti wajib diisi untuk kartu kanji');
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
            alert('Kata, Arti, dan Cara Baca wajib diisi untuk kartu kosakata');
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
            alert('Pola Tata Bahasa dan Arti wajib diisi untuk kartu tata bahasa');
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
        alert(flashcard ? 'Kartu berhasil diperbarui!' : 'Kartu berhasil dibuat!');
        onSave();
      } else {
        const data = await response.json();
        alert(`Gagal menyimpan kartu: ${data.error}`);
      }
    } catch (error) {
      console.error('Error saving flashcard:', error);
      alert('Gagal menyimpan kartu. Silakan coba lagi.');
    } finally {
      setSaving(false);
    }
  };

  const CARD_COLORS: Record<string, { front: string; back: string; accent: string }> = {
    kanji: {
      front: 'var(--card-kanji)',
      back: 'var(--card-kanji-back)',
      accent: '#FF9800',
    },
    vocabulary: {
      front: 'var(--card-vocabulary)',
      back: 'var(--card-vocabulary-back)',
      accent: '#4CAF50',
    },
    grammar: {
      front: 'var(--card-grammar)',
      back: 'var(--card-grammar-back)',
      accent: '#FF5722',
    },
  };

  const renderPreview = () => {
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

    const cardColors = CARD_COLORS[cardType] || CARD_COLORS.vocabulary;

    return (
      <div className="space-y-4">
        {/* Card Preview - Neo Brutalism Style */}
        <div
          className="relative min-h-[280px] p-6"
          style={{
            backgroundColor: cardColors.front,
            border: '3px solid #000',
            boxShadow: '4px 4px 0px 0px #000',
          }}
        >
          {/* Card type badge */}
          <div
            className="absolute top-3 left-3 px-3 py-1 text-xs font-bold uppercase tracking-wider"
            style={{
              backgroundColor: cardColors.accent,
              color: 'white',
              border: '2px solid #000',
              boxShadow: '2px 2px 0px 0px #000',
            }}
          >
            {getCardTypeLabel(cardType)}
          </div>

          {/* Front of card content */}
          <div className="flex items-center justify-center min-h-[200px] pt-8">
            <div className="text-center">
              {cardType === 'kanji' && (
                <>
                  <div className="text-7xl font-bold mb-2 text-black font-jp-mincho">
                    {kanji || '漢'}
                  </div>
                </>
              )}
              {cardType === 'vocabulary' && (
                <>
                  <div className="text-5xl font-bold mb-2 text-black font-jp-mincho">
                    {word || '言葉'}
                  </div>
                  {reading && <div className="text-xl text-black/70">{reading}</div>}
                </>
              )}
              {cardType === 'grammar' && (
                <div className="text-3xl font-bold text-black font-jp-mincho">
                  {grammarPoint || '〜文法'}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Back Preview - Meaning & Details */}
        <div
          className="p-4 space-y-3"
          style={{
            backgroundColor: cardColors.back,
            border: '3px solid #000',
            boxShadow: '4px 4px 0px 0px #000',
          }}
        >
          {/* Meaning Section */}
          <div
            className="p-3 bg-white"
            style={{
              border: '2px solid #000',
              boxShadow: '2px 2px 0px 0px #000',
            }}
          >
            <h4 className="text-xs font-bold uppercase tracking-wider text-black/60 mb-1">Arti</h4>
            <p className="text-base font-bold text-black">
              {cardType === 'kanji'
                ? kanjiMeaning || 'Arti kanji'
                : cardType === 'vocabulary'
                  ? wordMeaning || 'Arti kata'
                  : grammarMeaning || 'Arti pola'}
            </p>
          </div>

          {/* Kanji readings */}
          {cardType === 'kanji' && (onyomi || kunyomi) && (
            <div className="grid grid-cols-2 gap-2">
              {onyomi && (
                <div
                  className="p-2 bg-white"
                  style={{
                    border: '2px solid #000',
                    boxShadow: '2px 2px 0px 0px #000',
                  }}
                >
                  <h4 className="text-[10px] font-bold uppercase text-black/60 mb-0.5">
                    On&apos;yomi
                  </h4>
                  <p className="text-sm font-bold text-black">{onyomi}</p>
                </div>
              )}
              {kunyomi && (
                <div
                  className="p-2 bg-white"
                  style={{
                    border: '2px solid #000',
                    boxShadow: '2px 2px 0px 0px #000',
                  }}
                >
                  <h4 className="text-[10px] font-bold uppercase text-black/60 mb-0.5">
                    Kun&apos;yomi
                  </h4>
                  <p className="text-sm font-bold text-black">{kunyomi}</p>
                </div>
              )}
            </div>
          )}

          {/* Part of speech for vocabulary */}
          {cardType === 'vocabulary' && partOfSpeech && (
            <div
              className="inline-block px-2 py-0.5 bg-white text-xs font-bold"
              style={{
                border: '2px solid #000',
                boxShadow: '2px 2px 0px 0px #000',
              }}
            >
              {partOfSpeech}
            </div>
          )}

          {/* Usage note for grammar */}
          {cardType === 'grammar' && usageNote && (
            <div
              className="p-2 bg-white"
              style={{
                border: '2px solid #000',
                boxShadow: '2px 2px 0px 0px #000',
              }}
            >
              <h4 className="text-[10px] font-bold uppercase text-black/60 mb-0.5">
                Catatan Penggunaan
              </h4>
              <p className="text-xs text-black whitespace-pre-wrap">{usageNote}</p>
            </div>
          )}

          {/* Example Sentence */}
          {exampleSentence && (
            <div
              className="p-2 bg-white"
              style={{
                border: '2px solid #000',
                boxShadow: '2px 2px 0px 0px #000',
              }}
            >
              <h4 className="text-[10px] font-bold uppercase text-black/60 mb-1">Contoh</h4>
              <p className="text-sm font-medium text-black mb-0.5">{exampleSentence}</p>
              {exampleTranslation && <p className="text-xs text-black/70">{exampleTranslation}</p>}
            </div>
          )}

          {/* Notes */}
          {notes && (
            <div
              className="p-2"
              style={{
                backgroundColor: cardColors.accent + '20',
                border: '2px solid #000',
                borderLeft: `4px solid ${cardColors.accent}`,
              }}
            >
              <h4 className="text-[10px] font-bold uppercase text-black/60 mb-0.5">Catatan</h4>
              <p className="text-xs text-black whitespace-pre-wrap">{notes}</p>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            {flashcard ? 'Edit Kartu' : 'Buat Kartu'}
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
              Jenis Kartu *
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
                Kosakata
              </Button>
              <Button
                type="button"
                variant={cardType === 'grammar' ? 'default' : 'secondary'}
                size="sm"
                onClick={() => setCardType('grammar')}
              >
                Tata Bahasa
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
                      Arti *
                    </label>
                    <Input
                      type="text"
                      value={kanjiMeaning}
                      onChange={e => setKanjiMeaning(e.target.value)}
                      placeholder="matahari, hari"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Onyomi (Bacaan On)
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
                      Kunyomi (Bacaan Kun)
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
                      Kata *
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
                      Arti *
                    </label>
                    <Input
                      type="text"
                      value={wordMeaning}
                      onChange={e => setWordMeaning(e.target.value)}
                      placeholder="makan"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Cara Baca (Furigana) *
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
                      Kelas Kata
                    </label>
                    <select
                      value={partOfSpeech}
                      onChange={e => setPartOfSpeech(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent"
                    >
                      <option value="">Pilih (opsional)</option>
                      <option value="Noun">Kata Benda</option>
                      <option value="Verb (Ichidan)">Kata Kerja (Ichidan)</option>
                      <option value="Verb (Godan)">Kata Kerja (Godan)</option>
                      <option value="Verb (Irregular)">Kata Kerja (Tidak Beraturan)</option>
                      <option value="い-Adjective">Kata Sifat-i</option>
                      <option value="な-Adjective">Kata Sifat-na</option>
                      <option value="Adverb">Kata Keterangan</option>
                      <option value="Particle">Partikel</option>
                      <option value="Counter">Kata Satuan</option>
                    </select>
                  </div>
                </>
              )}

              {/* Grammar Card Fields */}
              {cardType === 'grammar' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Pola Tata Bahasa *
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
                      Arti *
                    </label>
                    <Input
                      type="text"
                      value={grammarMeaning}
                      onChange={e => setGrammarMeaning(e.target.value)}
                      placeholder="Sedang melakukan sesuatu (aksi berkelanjutan)"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Catatan Penggunaan
                    </label>
                    <textarea
                      value={usageNote}
                      onChange={e => setUsageNote(e.target.value)}
                      placeholder="Kata kerja bentuk-て + います"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent"
                      rows={2}
                    />
                  </div>
                </>
              )}

              {/* Common Fields */}
              <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                  Informasi Tambahan (Opsional)
                </h3>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Contoh Kalimat
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
                      Terjemahan Contoh
                    </label>
                    <Input
                      type="text"
                      value={exampleTranslation}
                      onChange={e => setExampleTranslation(e.target.value)}
                      placeholder="Cuaca hari ini bagus."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Catatan
                    </label>
                    <textarea
                      value={notes}
                      onChange={e => setNotes(e.target.value)}
                      placeholder="Catatan tambahan atau cara mengingat..."
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent"
                      rows={2}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Tag (pisahkan dengan koma)
                    </label>
                    <Input
                      type="text"
                      value={tags}
                      onChange={e => setTags(e.target.value)}
                      placeholder="JLPT N5, umum, kehidupan sehari-hari"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Preview */}
            <div className="lg:sticky lg:top-6 h-fit">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Pratinjau</h3>
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => setShowPreview(!showPreview)}
                >
                  {showPreview ? 'Sembunyikan' : 'Tampilkan'}
                </Button>
              </div>
              {showPreview && renderPreview()}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
            <Button type="submit" variant="default" disabled={saving} className="flex-1">
              {saving ? 'Menyimpan...' : flashcard ? 'Perbarui Kartu' : 'Buat Kartu'}
            </Button>
            <Button type="button" variant="secondary" onClick={onCancel} disabled={saving}>
              Batal
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
