# Interactive Japanese Text Feature

## Overview

An interactive Japanese text learning feature that allows users to click on any word to see:

- **Reading** (Furigana/Hiragana)
- **Indonesian Translation** (AI-powered)
- **Part of Speech** (Grammar type)

This replaces the previous static furigana display with a more educational, on-demand learning experience.

## Features

### 📖 Click-to-Learn Interface

- Click **content words only** (nouns, verbs, adjectives, adverbs) to see details
- Particles and grammar markers are **not clickable** (は, を, に, です, ます, etc.)
- Only meaningful vocabulary words are highlighted on hover
- Beautiful popup shows reading and Indonesian meaning
- Context-aware translations using AI
- Smooth, responsive UI

### 🤖 AI-Powered Translation

- Uses OpenAI GPT-4o-mini for accurate Japanese → Indonesian translation
- Context-aware: considers full sentence for better accuracy
- Caches translations per word to avoid redundant API calls
- Concise translations (1-3 words) optimized for learning

### 📝 Word Tokenization

- Powered by Kuroshiro + Kuromoji
- Accurate word boundary detection
- Automatic reading generation
- Part of speech identification (noun, verb, adjective, etc.)

## How It Works

### User Experience

1. **Enable Interactive Mode**
   - Messages with Japanese kanji show a 📖 button
   - Click to enable interactive word lookup

2. **Click Any Word**
   - Clickable words have dotted underline on hover
   - Click to see popup with details

3. **View Details**
   - **Word**: The original Japanese text
   - **Reading**: Hiragana pronunciation
   - **Indonesian**: AI-translated meaning
   - **Part of Speech**: Grammar classification

4. **Close Popup**
   - Click anywhere outside popup to close

### Technical Flow

```
User Message with Kanji
    ↓
Click 📖 Button
    ↓
Kuroshiro Tokenizes Text → [word1, word2, word3...]
    ↓
Render Clickable Words
    ↓
User Clicks Word
    ↓
Show Popup (Reading visible immediately)
    ↓
Fetch Indonesian Translation via API
    ↓
Update Popup with Translation
```

## Implementation Details

### Components

**1. InteractiveJapaneseText** (`src/components/conversation/InteractiveJapaneseText.tsx`)

- Main component for rendering interactive text
- Handles tokenization, click events, and popup display
- Manages translation fetching and caching

**2. WordPopup** (Internal to InteractiveJapaneseText)

- Popup UI component showing word details
- Displays reading, meaning, and part of speech
- Loading state while translation fetches

### API Endpoint

**POST /api/translate**

```typescript
Request: {
  word: string,      // Japanese word
  reading: string,   // Hiragana reading (optional)
  context: string    // Full sentence (optional)
}

Response: {
  word: string,
  reading: string,
  translation: string  // Indonesian meaning
}
```

### Utilities

**japanese-parser.ts** (`src/lib/utils/japanese-parser.ts`)

- `parseJapaneseText()`: Tokenize Japanese text into words
- `getIndonesianTranslation()`: Fetch translation from API
- `enrichTokensWithMeanings()`: Batch translation fetching

## Usage Examples

### Basic Usage

```typescript
import InteractiveJapaneseText from '@/components/conversation/InteractiveJapaneseText';

<InteractiveJapaneseText
  text="今日は良い天気です"
  className="my-custom-class"
/>
```

### In MessageBubble

The feature is automatically enabled for messages containing kanji:

```typescript
// Auto-detects kanji and enables interactive mode
{contentHasKanji && !contentHasFurigana ? (
  <InteractiveJapaneseText text={content} />
) : (
  <p>{content}</p>
)}
```

## Example Interaction

**Input Text:** `今日は良い天気です`

**What's Clickable:**

- `今日` ✅ (noun - hari ini)
- `は` ❌ (particle - not clickable)
- `良い` ✅ (adjective - baik)
- `天気` ✅ (noun - cuaca)
- `です` ❌ (copula - not clickable)

**After Clicking 今日:**

```
┌─────────────────────┐
│ 今日                 │  ← Word
│                      │
│ Reading: きょう      │  ← Hiragana reading
│ ──────────────────   │
│ Indonesian: hari ini │  ← Translation
│                      │
│ noun                 │  ← Part of speech
└─────────────────────┘
```

**Why This Design?**

- ✅ Focus on **vocabulary learning** (meaningful words)
- ✅ Reduce **visual clutter** (no underlines on every character)
- ✅ Learn **content words** that carry meaning
- ❌ Particles (は, を, に) are grammar, not vocabulary

## Configuration

### Translation Model

Edit `src/app/api/translate/route.ts` to change the AI model:

```typescript
const completion = await openai.chat.completions.create({
  model: 'gpt-4o-mini', // Change model here
  temperature: 0.3, // Adjust creativity
  max_tokens: 50, // Max translation length
});
```

### Dictionary Path

If dictionary files are in a different location, update `src/lib/utils/japanese-parser.ts`:

```typescript
await kuroshiroInstance.init(
  new KuromojiAnalyzer({
    dictPath: '/dict/', // Change path here
  })
);
```

## Performance

### Optimization Strategies

1. **Lazy Loading**: Interactive mode only activates on button click
2. **Token Caching**: Parsed tokens stored in component state
3. **Translation Caching**: Translations cached per word
4. **On-Demand API**: Only fetches translation when word is clicked

### Performance Metrics

- **Initial Parse**: ~500ms-1s (first time loading dictionary)
- **Subsequent Parses**: <100ms (dictionary cached)
- **Translation Fetch**: ~500ms-2s (depends on API)
- **Popup Display**: <50ms (instant)

## Troubleshooting

### Popup Not Showing

**Check:**

- Dictionary files in `/public/dict/`
- Console for JavaScript errors
- Network tab for API failures

### Translation Not Loading

**Causes:**

- OpenAI API key not set (`OPENAI_API_KEY` in `.env.local`)
- API rate limits exceeded
- Network connectivity issues

**Solution:**

```bash
# Check API key
echo $OPENAI_API_KEY

# Test API endpoint
curl -X POST http://localhost:3000/api/translate \
  -H "Content-Type: application/json" \
  -d '{"word":"今日","reading":"きょう"}'
```

### Incorrect Word Boundaries

**Cause:** Kuromoji dictionary parsing limitations

**Solution:** Use manual furigana notation for specific words:

```
今日[きょう]は良[よ]い天気[てんき]です
```

## Future Enhancements

- [ ] Add English translations alongside Indonesian
- [ ] Save clicked words to user's vocabulary list
- [ ] Show example sentences for each word
- [ ] Add pronunciation audio (text-to-speech)
- [ ] Offline dictionary for common words
- [ ] User-customizable translation language
- [ ] Spaced repetition for clicked words
- [ ] Export vocabulary to Anki/flashcards

## Comparison: Static vs Interactive

### Previous (Static Furigana)

- ✅ Always visible
- ❌ Cluttered display
- ❌ No Indonesian meaning
- ❌ Can't focus on specific words

### New (Interactive)

- ✅ Clean, on-demand display
- ✅ Indonesian translations
- ✅ Learn only what you need
- ✅ Better for focused learning
- ✅ Less visual noise

## Best Practices

1. **Enable When Needed**: Only activate interactive mode when studying
2. **Click Unfamiliar Words**: Build vocabulary organically
3. **Review Context**: Translations consider full sentence
4. **Check Part of Speech**: Understand grammar patterns
5. **Use Both Modes**: Static furigana for reading, interactive for learning
