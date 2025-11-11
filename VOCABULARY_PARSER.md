# Vocabulary Parser Feature

## Overview

The Vocabulary Parser feature uses Kuromoji.js to tokenize Japanese text in AI responses, making each word clickable to display detailed information including:

- Word form (surface form)
- Reading (in hiragana and katakana)
- Dictionary/base form
- Part of speech
- Conjugation information (for verbs/adjectives)

## Features

### ✅ Implemented

1. **Japanese Tokenization** - Uses Kuromoji.js to parse Japanese text into tokens
2. **Clickable Vocabulary** - Content words (nouns, verbs, adjectives, adverbs) are highlighted on hover and clickable
3. **Vocabulary Detail Popup** - Beautiful popup card showing word information
4. **AI Response Only** - Feature is only active on AI/assistant messages, not user messages
5. **Non-blocking Loading** - Tokenization happens in the background without blocking the UI
6. **Smart Highlighting** - Only highlights content words, not particles or punctuation
7. **Position-aware Popup** - Popup appears near clicked word and stays within viewport

### 🎯 Integration Points

The feature is integrated in two chat interfaces:

1. **MessageBubble Component** - Used by `UnifiedChatInterface`
   - Location: [src/components/conversation/MessageBubble.tsx](src/components/conversation/MessageBubble.tsx:143-144)
   - Handles messages with furigana support + vocabulary parsing

2. **StreamingChatInterface Component** - Used for task-based chat
   - Location: [src/components/chat/StreamingChatInterface.tsx](src/components/chat/StreamingChatInterface.tsx:182-186)
   - Handles streaming messages with vocabulary parsing

## Architecture

### Components

```
src/components/vocabulary/
├── TokenizedText.tsx          # Main component that tokenizes and renders clickable text
└── VocabularyDetail.tsx       # Popup card showing word details
```

### Utilities

```
src/lib/utils/
└── kuromoji-parser.ts         # Kuromoji integration and helper functions
```

### Dictionary Files

```
public/dict/                   # Kuromoji dictionary files (gzipped)
├── base.dat.gz
├── check.dat.gz
├── tid.dat.gz
├── tid_map.dat.gz
├── tid_pos.dat.gz
├── unk.dat.gz
├── unk_char.dat.gz
├── unk_compat.dat.gz
├── unk_invoke.dat.gz
├── unk_map.dat.gz
└── unk_pos.dat.gz
```

## Usage

### For Users

1. Chat with the AI in Japanese
2. When the AI responds, hover over words to see them highlighted
3. Click any highlighted word to see detailed information
4. Click anywhere outside the popup to close it

### For Developers

#### Using TokenizedText Component

```tsx
import TokenizedText from '@/components/vocabulary/TokenizedText';

function MyComponent() {
  return <TokenizedText text="今日はいい天気ですね。" className="text-sm" />;
}
```

#### Component Props

**TokenizedText**

```typescript
interface TokenizedTextProps {
  text: string; // Japanese text to tokenize
  className?: string; // Additional CSS classes
}
```

**VocabularyDetail**

```typescript
interface VocabularyDetailProps {
  vocab: VocabularyInfo; // Word information to display
  onClose: () => void; // Close handler
  position?: { x: number; y: number }; // Popup position (optional)
}
```

## Technical Details

### Kuromoji Integration

- **Library**: [kuromoji.js](https://github.com/takuyaa/kuromoji.js)
- **Dictionary**: IPA dictionary (included in `public/dict/`)
- **Lazy Loading**: Tokenizer is initialized on first use and cached
- **Dictionary Path**: `/dict/` (served from `public/dict/`)

### Token Information

Each token provides:

```typescript
interface VocabularyInfo {
  word: string; // Surface form (actual text)
  reading: string; // Katakana reading
  baseForm: string; // Dictionary form
  partOfSpeech: string; // Main POS (名詞, 動詞, etc.)
  posDetail: string; // Detailed POS
  conjugation?: string; // Conjugation info (if applicable)
}
```

### Performance

- **Tokenization**: ~50-200ms for typical message (varies by length)
- **Non-blocking**: Uses async/await, doesn't block UI rendering
- **Caching**: Tokenizer is initialized once and reused
- **Lazy Loading**: Dictionary files loaded only when needed

### Highlighting Rules

Words are highlighted if their part of speech is:

- 名詞 (Noun)
- 動詞 (Verb)
- 形容詞 (Adjective)
- 副詞 (Adverb)
- 連体詞 (Adnominal)

Particles (助詞), symbols (記号), and other function words are not highlighted.

## Installation

### Dependencies

```bash
npm install kuromoji
```

### Dictionary Files

Dictionary files are already included in `public/dict/`. If you need to reinstall them:

```bash
cd public/dict
curl -L -o base.dat.gz "https://github.com/takuyaa/kuromoji.js/raw/master/dict/base.dat.gz"
curl -L -o check.dat.gz "https://github.com/takuyaa/kuromoji.js/raw/master/dict/check.dat.gz"
curl -L -o tid.dat.gz "https://github.com/takuyaa/kuromoji.js/raw/master/dict/tid.dat.gz"
curl -L -o tid_map.dat.gz "https://github.com/takuyaa/kuromoji.js/raw/master/dict/tid_map.dat.gz"
curl -L -o tid_pos.dat.gz "https://github.com/takuyaa/kuromoji.js/raw/master/dict/tid_pos.dat.gz"
curl -L -o unk.dat.gz "https://github.com/takuyaa/kuromoji.js/raw/master/dict/unk.dat.gz"
curl -L -o unk_char.dat.gz "https://github.com/takuyaa/kuromoji.js/raw/master/dict/unk_char.dat.gz"
curl -L -o unk_compat.dat.gz "https://github.com/takuyaa/kuromoji.js/raw/master/dict/unk_compat.dat.gz"
curl -L -o unk_invoke.dat.gz "https://github.com/takuyaa/kuromoji.js/raw/master/dict/unk_invoke.dat.gz"
curl -L -o unk_map.dat.gz "https://github.com/takuyaa/kuromoji.js/raw/master/dict/unk_map.dat.gz"
curl -L -o unk_pos.dat.gz "https://github.com/takuyaa/kuromoji.js/raw/master/dict/unk_pos.dat.gz"
```

## Troubleshooting

### Tokenizer Fails to Initialize

**Symptom**: Console error "Failed to build Kuromoji tokenizer"

**Solutions**:

1. Verify dictionary files exist in `public/dict/`
2. Check browser console for network errors loading dictionary files
3. Ensure Next.js is serving static files from `public/` directory

### Words Not Clickable

**Symptom**: Text appears but no words are highlighted on hover

**Possible Causes**:

1. Text is still tokenizing (check loading state)
2. Words are not content words (particles/symbols aren't clickable)
3. Tokenization failed (check console for errors)

### Popup Appears in Wrong Position

**Symptom**: Popup appears far from clicked word or off-screen

**Solutions**:

1. Position is calculated from click event - ensure event propagation isn't blocked
2. Viewport boundaries are checked - verify window dimensions are available
3. Check for CSS transforms on parent elements that might affect positioning

## Future Enhancements

Potential improvements:

1. **Caching Parsed Text** - Cache tokenized results to avoid re-parsing
2. **Dictionary Lookup** - Integrate with JLPT vocabulary database or external dictionary API
3. **Example Sentences** - Show example sentences for each word
4. **JLPT Level Indicator** - Display JLPT level badge for vocabulary
5. **Copy to Flashcards** - One-click add to user's personal flashcard deck
6. **Pronunciation Audio** - Text-to-speech for word pronunciation
7. **Multiple Definitions** - Show multiple meanings when applicable
8. **User Notes** - Allow users to add personal notes to vocabulary
9. **Progress Tracking** - Track which words user has studied

## Related Files

- [MessageBubble.tsx](src/components/conversation/MessageBubble.tsx) - Original message bubble with furigana support
- [StreamingChatInterface.tsx](src/components/chat/StreamingChatInterface.tsx) - Streaming chat interface
- [furigana.ts](src/lib/utils/furigana.ts) - Furigana parsing utility
- [globals.css](src/app/globals.css) - Global styles including furigana CSS

## Credits

- [Kuromoji.js](https://github.com/takuyaa/kuromoji.js) - Japanese morphological analyzer
- IPA Dictionary - Japanese language dictionary data
