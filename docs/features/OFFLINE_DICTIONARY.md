# Offline Dictionary System

## Overview

A **hybrid translation system** that minimizes costs by using an offline Japanese-Indonesian dictionary first, falling back to ChatGPT API only when necessary.

## Cost Savings

### Without Offline Dictionary

- Every word click = 1 API call
- 100 word clicks = 100 API calls
- Estimated cost: ~$0.001-0.003 per word
- **Monthly cost for 10,000 words: $10-30**

### With Offline Dictionary (Current System)

- Common words (80%): FREE (offline dictionary)
- Rare words (20%): Paid (ChatGPT API)
- **Monthly cost for 10,000 words: $2-6** 💰

### Cost Reduction: **70-80% savings!**

## How It Works

```
User clicks word
    ↓
1. Check in-memory cache (instant, free)
    ↓ (if not found)
2. Check offline dictionary JSON (instant, free)
    ↓ (if not found)
3. Call ChatGPT API (1-2s, costs money)
    ↓
4. Cache result for future use
```

## Architecture

### Files

**1. Dictionary Data**

- `src/lib/dictionaries/ja-id-dictionary.json` - Main offline dictionary
- Currently: ~250 common words
- **You can add more words here!**

**2. Dictionary Logic**

- `src/lib/utils/offline-dictionary.ts` - Hybrid translation system
- Functions:
  - `lookupOffline()` - Search in JSON dictionary
  - `getTranslation()` - Smart hybrid lookup
  - `getDictionaryStats()` - Track usage stats

**3. Integration**

- `InteractiveJapaneseText.tsx` - Uses hybrid system
- `japanese-parser.ts` - Helper functions

## Adding More Words

### Option 1: Manually Edit JSON

Open `src/lib/dictionaries/ja-id-dictionary.json`:

```json
{
  "新しい単語": "kata baru",
  "別の単語": "kata lain"
}
```

### Option 2: Bulk Import

If you have a CSV or database:

```bash
# Example Python script to convert CSV to JSON
import csv
import json

words = {}
with open('dictionary.csv', 'r') as f:
    reader = csv.DictReader(f)
    for row in reader:
        words[row['japanese']] = row['indonesian']

with open('ja-id-dictionary.json', 'w') as f:
    json.dump(words, f, ensure_ascii=False, indent=2)
```

### Option 3: Learn from AI Translations

The system caches AI translations. You can export them:

```typescript
// In browser console
import { getDictionaryStats } from '@/lib/utils/offline-dictionary';
console.log(getDictionaryStats());

// Export cached translations to add to dictionary
```

## Configuration

### Disable AI Fallback (Offline Only)

In `InteractiveJapaneseText.tsx`, change:

```typescript
const translation = await getTranslation(
  word.surface,
  word.reading,
  word.baseForm,
  text,
  false // Disable AI fallback - offline only
);
```

**Pros:**

- Zero API costs
- Instant responses
- Works offline

**Cons:**

- Only works for words in dictionary
- Unknown words show no translation

### Enable AI Fallback (Current Default)

```typescript
const translation = await getTranslation(
  word.surface,
  word.reading,
  word.baseForm,
  text,
  true // Enable AI fallback
);
```

**Pros:**

- All words get translations
- Better user experience
- Learns new words automatically

**Cons:**

- Costs money for unknown words
- Requires internet connection

## Dictionary Coverage

### Current Dictionary

- **Size**: ~250 words
- **Coverage**: Basic conversation (JLPT N5-N4 level)
- **Categories**: Greetings, numbers, time, family, food, actions, adjectives

### Recommended Growth

- **500 words**: Cover 60% of daily conversation
- **1,000 words**: Cover 75% of daily conversation
- **2,000 words**: Cover 85% of daily conversation
- **5,000 words**: Cover 95% of general text

### Priority Words to Add

1. **JLPT N5-N4 vocabulary** (~800 words)
2. **Common verbs and adjectives** (~300 words)
3. **Everyday nouns** (~500 words)
4. **Indonesian learning context** (specific words your users encounter)

## Dictionary Format

### Standard Entry

```json
{
  "日本語": "bahasa Indonesia"
}
```

### Tips

- Use **dictionary form** for verbs (食べる not 食べます)
- Include **common variations** if needed
- Keep translations **concise** (1-3 words max)
- Use **natural Indonesian** (not literal translation)

### Examples

**Good:**

```json
{
  "食べる": "makan",
  "美味しい": "enak",
  "ありがとう": "terima kasih"
}
```

**Avoid:**

```json
{
  "食べます": "makan", // Use 食べる (dictionary form)
  "美味しい": "rasa yang enak", // Too wordy
  "ありがとう": "thank you" // Wrong language!
}
```

## Monitoring

### Check Dictionary Usage

Add this to your component:

```typescript
import { getDictionaryStats } from '@/lib/utils/offline-dictionary';

// In useEffect or button click
const stats = getDictionaryStats();
console.log('Offline words:', stats.offlineWords);
console.log('Cached translations:', stats.cachedTranslations);
console.log('Total available:', stats.totalAvailable);
```

### Track API Usage

Monitor your OpenAI API dashboard:

- **Low usage** (<100 calls/day): Good dictionary coverage!
- **High usage** (>1000 calls/day): Need to expand dictionary

## Performance

### Lookup Speed

- **In-memory cache**: <1ms
- **Offline dictionary**: <5ms
- **ChatGPT API**: 500-2000ms

### Memory Usage

- **250 words**: ~10KB
- **1,000 words**: ~40KB
- **5,000 words**: ~200KB
- **10,000 words**: ~400KB

All sizes are negligible for modern browsers!

## Best Practices

### 1. Start with Common Words

Add the most frequently used words first. Use JLPT N5-N4 lists as a guide.

### 2. Update Regularly

After using the app for a week, check which words triggered AI calls most often. Add those to the dictionary.

### 3. Balance Coverage vs. Size

- For student apps: 1,000-2,000 words is optimal
- For general use: 3,000-5,000 words
- For comprehensive: 10,000+ words

### 4. Cache Efficiently

The system automatically caches AI translations in memory. These are lost on page refresh, so consider:

- Adding frequently AI-translated words to the JSON dictionary
- Implementing localStorage persistence for cache

## Troubleshooting

### Translation Not Found

1. Check if word is in dictionary: Open `ja-id-dictionary.json`
2. Check AI fallback: Is `useAI` set to `true`?
3. Check API key: Is `OPENAI_API_KEY` set in `.env.local`?

### Slow Translations

- **First time**: Dictionary loading (~500ms) - normal
- **Every time**: AI fallback being used - add more words to dictionary

### Wrong Translations

- **Offline dictionary**: Update the JSON file
- **AI translations**: Check context, consider manual override in dictionary

## Future Enhancements

- [ ] Export AI-cached words to JSON automatically
- [ ] Import from external dictionary databases
- [ ] User-contributed translations
- [ ] Frequency-based dictionary optimization
- [ ] Multi-level dictionaries (N5, N4, N3, etc.)
- [ ] LocalStorage persistence for AI cache

## Resources

### Where to Find Japanese-Indonesian Dictionaries

1. **Tatoeba Project** - Free sentence pairs
2. **Kamus Jepang** - Online dictionaries
3. **JMdict** - Japanese-Multilingual (convert from English)
4. **Your own data** - Build from your course content!

### JLPT Word Lists

- JLPT N5: ~800 words (essential)
- JLPT N4: ~1,500 words (basic conversation)
- JLPT N3: ~3,000 words (intermediate)

Add these progressively based on your users' level.

---

**Remember**: The offline dictionary is a **living document**. Keep adding words based on actual usage patterns to maximize cost savings while maintaining great UX!
