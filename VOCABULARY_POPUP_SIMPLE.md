# Vocabulary Popup - Simple & Clean UI

## Overview

UI kosakata telah diubah menjadi **popup sederhana** yang tidak menghalangi konten lain, dengan fokus pada 3 informasi utama:

1. **Kosakata** - Kata dalam bahasa Jepang
2. **Cara Baca** - Hiragana dan romaji
3. **Arti** - Terjemahan bahasa Indonesia (opsional)

## Perubahan Utama

### ❌ Dihapus

- ~~Modal backdrop~~ (overlay gelap yang menghalangi)
- ~~Header "Detail Kosakata"~~
- ~~Bentuk Kamus~~
- ~~Jenis Kata~~
- ~~Konjugasi~~
- ~~Verb Phrase Components~~
- ~~Pesan "Klik di luar untuk menutup"~~

### ✅ Ditambahkan

- **Popup compact** (tidak modal, tidak menghalangi)
- **Auto-close** on click outside atau ESC key
- **Noun+Verb merging** (勉強 + します → 勉強します)
- **Indonesian meaning** field (opsional)

## UI Design

### Format Baru

```
┌─────────────────────┐
│                     │
│    勉強します        │  ← Kosakata
│    べんきょうします   │  ← Cara baca (hiragana)
│    (benkyoushimasu) │  ← Cara baca (romaji)
│  ─────────────────  │
│   "belajar"         │  ← Arti (Indonesian)
│                     │
└─────────────────────┘
```

### Karakteristik

- **No backdrop**: Tidak ada overlay, user bisa lihat konten lain
- **Compact size**: 200-280px width, auto height
- **Positioned**: Muncul di bawah kata yang diklik
- **Light border**: Border biru tipis untuk visibility
- **Shadow**: Soft shadow untuk depth
- **Auto-close**: Click outside atau ESC untuk tutup

## Noun+Verb Compound Merging

### Problem

Kata seperti **勉強します** (benkyoushimasu - belajar) di-tokenize menjadi:

- 勉強 (noun - study)
- し (verb stem)
- ます (auxiliary)

### Solution

Menggabungkan noun + する verb patterns:

```typescript
勉強 + し + ます → 勉強します
仕事 + し + ます → 仕事します
質問 + し + た → 質問した
散歩 + し + て + い + ます → 散歩しています
```

### Implementation

**Detection Pattern**:

```typescript
if (
  token.partOfSpeech === '名詞' && // Current is noun
  nextToken.partOfSpeech === '動詞' && // Next is verb
  nextToken.baseForm === 'する' // Verb is する
) {
  // Merge noun + verb + auxiliaries
}
```

**Examples**:

| Original Tokens            | Merged Result      | Meaning         |
| -------------------------- | ------------------ | --------------- |
| 勉強 + し + ます           | **勉強します**     | belajar         |
| 勉強 + し + て + い + ます | **勉強しています** | sedang belajar  |
| 質問 + し + た             | **質問した**       | bertanya (past) |
| 仕事 + し + ません         | **仕事しません**   | tidak bekerja   |
| 散歩 + し + ましょう       | **散歩しましょう** | ayo jalan-jalan |

## Popup Behavior

### Positioning

- **Primary**: Di bawah kata yang diklik (+10px)
- **Viewport aware**: Tidak keluar dari screen
- **Max width**: 280px
- **Min width**: 200px

### Closing Triggers

1. **Click outside**: Click di mana saja di luar popup
2. **ESC key**: Tekan tombol Escape
3. **Click another word**: Buka popup lain

### Z-index

- **Popup**: `z-50` (di atas konten chat)
- **No backdrop**: Tidak ada overlay

## Indonesian Meaning

### Structure

```typescript
interface VocabularyInfo {
  word: string; // "勉強します"
  reading: string; // "ベンキョウシマス"
  meaning?: string; // "belajar" (optional)
}
```

### Display

- **With meaning**: Shows with border and italic style
- **Without meaning**: Section tidak muncul
- **Quote marks**: Menggunakan &ldquo; dan &rdquo;

## Technical Implementation

### Files Modified

1. **[VocabularyDetail.tsx](src/components/vocabulary/VocabularyDetail.tsx)**
   - Removed backdrop
   - Removed header
   - Simplified to 3-line display
   - Added auto-close handlers
   - Added meaning display

2. **[kuromoji-parser.ts](src/lib/utils/kuromoji-parser.ts)**
   - Added `meaning?` field to VocabularyInfo
   - Enhanced `mergeVerbPhrases()` untuk noun+verb compounds
   - Detects 名詞 + する patterns

### Code Changes

**Popup Structure**:

```tsx
<div ref={popupRef} className="fixed z-50 bg-white ...">
  {/* Kosakata */}
  <div>{vocab.word}</div>

  {/* Cara Baca */}
  <div>{hiragana}</div>
  <div>({romaji})</div>

  {/* Arti (optional) */}
  {vocab.meaning && <div>&ldquo;{vocab.meaning}&rdquo;</div>}
</div>
```

**Auto-close Logic**:

```tsx
// Click outside
useEffect(() => {
  function handleClickOutside(event: MouseEvent) {
    if (popupRef.current && !popupRef.current.contains(event.target)) {
      onClose();
    }
  }
  document.addEventListener('mousedown', handleClickOutside);
  return () => document.removeEventListener('mousedown', handleClickOutside);
}, [onClose]);

// ESC key
useEffect(() => {
  function handleEscape(event: KeyboardEvent) {
    if (event.key === 'Escape') onClose();
  }
  document.addEventListener('keydown', handleEscape);
  return () => document.removeEventListener('keydown', handleEscape);
}, [onClose]);
```

**Noun+Verb Merging**:

```tsx
// Check for noun + する pattern
if (
  current.partOfSpeech === '名詞' &&
  nextToken.partOfSpeech === '動詞' &&
  nextToken.baseForm === 'する'
) {
  // Merge noun + verb stem
  mergedWord = noun.word + verb.word;

  // Continue merging auxiliaries (ます, た, etc.)
  while (hasAuxiliary) {
    mergedWord += auxiliary.word;
  }

  return {
    word: mergedWord, // "勉強します"
    baseForm: noun.word + 'する', // "勉強する"
    partOfSpeech: '動詞',
    isGrouped: true,
  };
}
```

## Testing

### Manual Test Cases

#### Test 1: Basic Noun+Verb

```
Input: 私は日本語を勉強します。
Expected:
  Click "勉強します" → Shows popup:
    勉強します
    べんきょうします
    (benkyoushimasu)
```

#### Test 2: Progressive Form

```
Input: 今、日本語を勉強しています。
Expected:
  Click "勉強しています" → Shows:
    勉強しています
    べんきょうしています
    (benkyoushiteimasu)
```

#### Test 3: With Meaning (Future Feature)

```
Input: (Same as above, but with meaning added)
Expected:
  Click "勉強します" → Shows:
    勉強します
    べんきょうします
    (benkyoushimasu)
    ─────────────
    "belajar"
```

#### Test 4: Auto-close

```
Actions:
  1. Click word → popup opens
  2. Click outside popup → popup closes
  3. Click word → popup opens
  4. Press ESC key → popup closes
```

#### Test 5: Multiple Words

```
Input: 質問して仕事します
Expected:
  - Click "質問して" → merged popup
  - Click "仕事します" → new popup, old closes
```

## Common Patterns Merged

### Suru-verb Compounds

| Noun | Verb Pattern | Merged Form |
| ---- | ------------ | ----------- |
| 勉強 | します       | 勉強します  |
| 質問 | します       | 質問します  |
| 仕事 | します       | 仕事します  |
| 散歩 | します       | 散歩します  |
| 旅行 | します       | 旅行します  |
| 運動 | します       | 運動します  |
| 掃除 | します       | 掃除します  |
| 料理 | します       | 料理します  |

### With Auxiliaries

| Pattern                    | Merged Result  | Meaning     |
| -------------------------- | -------------- | ----------- |
| 勉強 + し + ます           | 勉強します     | study       |
| 勉強 + し + た             | 勉強した       | studied     |
| 勉強 + し + て + い + ます | 勉強しています | is studying |
| 勉強 + し + ませ + ん      | 勉強しません   | don't study |
| 勉強 + し + ましょ + う    | 勉強しましょう | let's study |

## Future Enhancements

### Dictionary Integration

Add actual Indonesian translations from dictionary:

```typescript
const dictionary: Record<string, string> = {
  勉強します: 'belajar',
  質問します: 'bertanya',
  仕事します: 'bekerja',
  // ...
};

// In tokenization
vocab.meaning = dictionary[vocab.baseForm];
```

### API Integration

```typescript
// Fetch translation from API
async function getTranslation(word: string): Promise<string> {
  const response = await fetch(`/api/translate?word=${word}`);
  return response.json();
}
```

### JLPT Level Badge

```tsx
{
  vocab.jlptLevel && <span className="badge">JLPT {vocab.jlptLevel}</span>;
}
```

### Example Sentences

```tsx
{
  vocab.examples && (
    <div className="examples">
      {vocab.examples.map(ex => (
        <div>{ex}</div>
      ))}
    </div>
  );
}
```

## Related Files

- [VocabularyDetail.tsx](src/components/vocabulary/VocabularyDetail.tsx) - Popup component
- [TokenizedText.tsx](src/components/vocabulary/TokenizedText.tsx) - Tokenization rendering
- [kuromoji-parser.ts](src/lib/utils/kuromoji-parser.ts) - Parsing and merging logic
- [VOCABULARY_UI_INDONESIAN.md](VOCABULARY_UI_INDONESIAN.md) - Previous UI documentation
- [VERB_PHRASE_GROUPING.md](VERB_PHRASE_GROUPING.md) - Verb merging feature

## Credits

- Clean popup design inspired by modern tooltips
- Noun+verb merging addresses common Japanese compound verb patterns
- Indonesian-first approach for target audience
