# Vocabulary Components

> Components for Japanese vocabulary display and learning

[← Back to Index](../README.md)

---

## Overview

Vocabulary components are located in `/src/components/vocabulary/` and provide specialized UI for displaying Japanese text with furigana, word definitions, and interactive vocabulary features.

**Components:** 2

---

## TokenizedText

**File:** `/src/components/vocabulary/TokenizedText.tsx`

Display tokenized Japanese text with furigana (reading aids).

### Features
- Automatic Japanese text tokenization
- Furigana display above kanji
- Word-level interaction
- Hover for definitions
- Click for detailed information
- JLPT level indicators
- Customizable styling
- Copy individual words
- Highlight known/unknown words
- Support for vertical text

### Usage

```tsx
import { TokenizedText } from '@/components/vocabulary/TokenizedText'

// Basic usage with furigana
<TokenizedText
  text="今日は良い天気ですね"
  showFurigana={true}
/>

// Interactive with word details
<TokenizedText
  text="お寿司を食べたいです"
  showFurigana={true}
  interactive={true}
  onWordClick={(word) => {
    showVocabularyDetail(word)
  }}
  onWordHover={(word) => {
    showQuickDefinition(word)
  }}
/>

// With JLPT level indicators
<TokenizedText
  text="勉強します"
  showFurigana={true}
  showJlptLevel={true}
  highlightNewWords={true}
  knownWords={userKnownWords}
/>

// Custom styling
<TokenizedText
  text="ありがとうございます"
  showFurigana={true}
  furiganaSize="sm"
  spacing="relaxed"
  className="text-lg"
/>
```

### Props

```typescript
interface TokenizedTextProps {
  text: string
  showFurigana?: boolean
  interactive?: boolean

  // Callbacks
  onWordClick?: (word: WordToken) => void
  onWordHover?: (word: WordToken) => void
  onWordLeave?: () => void

  // Display options
  showJlptLevel?: boolean
  highlightNewWords?: boolean
  knownWords?: Set<string>
  verticalText?: boolean

  // Styling
  furiganaSize?: 'xs' | 'sm' | 'md'
  spacing?: 'tight' | 'normal' | 'relaxed'
  className?: string
}

interface WordToken {
  surface: string // Original text
  reading: string // Reading (hiragana)
  baseForm: string // Dictionary form
  partOfSpeech: string
  jlptLevel?: 'N5' | 'N4' | 'N3' | 'N2' | 'N1'
  isKnown?: boolean
}
```

### Tokenization

The component automatically tokenizes Japanese text using a morphological analyzer to break down sentences into individual words and attach furigana.

**Example:**
```
Input: "食べます"
Output: <ruby>食<rt>た</rt></ruby>べます
```

### Styling Options

#### Furigana Sizes
- `xs` - 0.5rem
- `sm` - 0.625rem (default)
- `md` - 0.75rem

#### Spacing
- `tight` - Minimal spacing between characters
- `normal` - Standard spacing (default)
- `relaxed` - Increased spacing for readability

---

## VocabularyDetail

**File:** `/src/components/vocabulary/VocabularyDetail.tsx`

Detailed vocabulary information display.

### Features
- Word information:
  - Kanji form
  - Readings (hiragana/katakana)
  - Meanings (multiple)
  - Part of speech
  - JLPT level
- Audio pronunciation
- Pitch accent diagram
- Example sentences with translations
- Mnemonics (if available)
- Related words
- Kanji components (for kanji words)
- Usage frequency
- Add to study deck
- Mark as known/learning

### Usage

```tsx
import { VocabularyDetail } from '@/components/vocabulary/VocabularyDetail'

// Basic usage
<VocabularyDetail
  word="食べる"
/>

// Full featured
<VocabularyDetail
  word="食べる"
  showExamples={true}
  showRelated={true}
  showMnemonics={true}
  onAddToDeck={(word) => addWordToDeck(word)}
  onMarkKnown={(word) => markWordAsKnown(word)}
  onPlayAudio={(audioUrl) => playAudio(audioUrl)}
/>

// In a dialog
<Dialog>
  <DialogContent>
    <VocabularyDetail word={selectedWord} />
  </DialogContent>
</Dialog>

// In a sheet (mobile-friendly)
<Sheet>
  <SheetContent>
    <VocabularyDetail
      word={selectedWord}
      compact={true}
    />
  </SheetContent>
</Sheet>
```

### Props

```typescript
interface VocabularyDetailProps {
  word: string
  showExamples?: boolean
  showRelated?: boolean
  showMnemonics?: boolean
  compact?: boolean

  // Callbacks
  onAddToDeck?: (word: VocabularyData) => void
  onMarkKnown?: (word: string) => void
  onMarkLearning?: (word: string) => void
  onPlayAudio?: (audioUrl: string) => void
  onClose?: () => void

  // Styling
  className?: string
}

interface VocabularyData {
  word: string
  reading: string
  meanings: string[]
  partOfSpeech: string
  jlptLevel?: 'N5' | 'N4' | 'N3' | 'N2' | 'N1'
  audioUrl?: string
  pitchAccent?: PitchAccent
  examples?: Example[]
  relatedWords?: RelatedWord[]
  mnemonics?: string
  frequency?: number
  kanjiComponents?: KanjiComponent[]
}

interface Example {
  japanese: string
  reading: string
  translation: string
}

interface RelatedWord {
  word: string
  reading: string
  meaning: string
  relationship: 'synonym' | 'antonym' | 'related'
}
```

### Information Sections

#### Basic Info
- Word (kanji/kana)
- Reading
- Meanings
- Part of speech
- JLPT level badge

#### Audio
- Native speaker pronunciation
- Playback controls
- Pitch accent visualization

#### Examples
- 3-5 example sentences
- Furigana for examples
- English translations
- Context labels

#### Related Words
- Synonyms
- Antonyms
- Related vocabulary
- Click to navigate

#### Kanji Info (for kanji words)
- Individual kanji meanings
- Stroke order
- Radicals
- Related kanji

---

## Integration Examples

### In Chat Messages

```tsx
import { MessageBubble } from '@/components/conversation/MessageBubble'
import { TokenizedText } from '@/components/vocabulary/TokenizedText'
import { VocabularyDetail } from '@/components/vocabulary/VocabularyDetail'

const [selectedWord, setSelectedWord] = useState<string | null>(null)

<MessageBubble
  message={{
    content: (
      <TokenizedText
        text={message.content}
        showFurigana={showFurigana}
        interactive={true}
        onWordClick={(word) => setSelectedWord(word.surface)}
      />
    ),
    // ... other props
  }}
/>

{selectedWord && (
  <Dialog open={!!selectedWord} onOpenChange={() => setSelectedWord(null)}>
    <DialogContent>
      <VocabularyDetail
        word={selectedWord}
        onClose={() => setSelectedWord(null)}
      />
    </DialogContent>
  </Dialog>
)}
```

### In Flashcards

```tsx
<Card>
  <CardContent>
    <TokenizedText
      text={flashcard.front}
      showFurigana={true}
      verticalText={false}
      className="text-2xl text-center"
    />
  </CardContent>
</Card>
```

### In Task Hints

```tsx
import { VocabularyHints } from '@/components/task/VocabularyHints'
import { VocabularyDetail } from '@/components/vocabulary/VocabularyDetail'

<VocabularyHints
  vocabulary={hints}
  onWordClick={(word) => {
    // Show detailed view
    setDetailWord(word)
  }}
/>

<Sheet>
  <SheetContent>
    {detailWord && (
      <VocabularyDetail word={detailWord.word} />
    )}
  </SheetContent>
</Sheet>
```

---

## Furigana Display

### HTML Structure

The component uses Ruby annotations for proper furigana display:

```html
<ruby>
  漢<rt>かん</rt>
  字<rt>じ</rt>
</ruby>
```

### Browser Support

Ruby annotations are supported in all modern browsers. For older browsers, a fallback is provided:

```
漢字[かんじ]
```

---

## JLPT Level Colors

```tsx
const jlptColors = {
  N5: 'text-green-600',   // Beginner
  N4: 'text-blue-600',    // Elementary
  N3: 'text-yellow-600',  // Intermediate
  N2: 'text-orange-600',  // Upper-intermediate
  N1: 'text-red-600',     // Advanced
}
```

---

## Accessibility

### Screen Readers
- Furigana is properly announced
- Word definitions available via ARIA
- Keyboard navigation supported

### Keyboard Controls
- `Tab` - Navigate between words
- `Enter` - Show word details
- `Escape` - Close details

---

## Related Components

- [Task Components](./task.md) - Task-based learning
- [Conversation Components](./conversation.md) - Messages
- [Deck Components](./deck-flashcard.md) - Flashcards

---

[← Back to Index](../README.md)
