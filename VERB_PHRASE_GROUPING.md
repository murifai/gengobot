# Verb Phrase Grouping for Learners

## Problem

Kuromoji tokenizer memisahkan verb conjugations menjadi beberapa token terpisah:

```
します → し (verb stem) + ます (auxiliary verb)
食べます → 食べ (verb stem) + ます (auxiliary verb)
見ています → 見 (verb) + て (particle) + い (verb) + ます (auxiliary)
行った → 行っ (verb) + た (auxiliary)
```

Ini linguistically correct, tapi membingungkan untuk learners yang ingin melihat verb sebagai satu unit.

## Solution

Implementasi **smart verb phrase grouping** yang menggabungkan:

1. **Verb stem + auxiliary verbs** → verb phrase lengkap
2. **Verb + て/で + auxiliary** → compound verb forms
3. **Original tokens tetap tersimpan** untuk edukasi

## Examples

### Basic Conjugations

| Original Tokens | Grouped  | Dictionary Form |
| --------------- | -------- | --------------- |
| し + ます       | します   | する            |
| 食べ + ます     | 食べます | 食べる          |
| 飲ま + ない     | 飲まない | 飲む            |
| 行っ + た       | 行った   | 行く            |
| 見 + た         | 見た     | 見る            |

### Compound Forms

| Original Tokens       | Grouped      | Meaning        |
| --------------------- | ------------ | -------------- |
| 食べ + て + い + ます | 食べています | is eating      |
| 見 + て + い + た     | 見ていた     | was watching   |
| 書い + て + い + ない | 書いていない | is not writing |

### Polite + Negative

| Original Tokens              | Grouped          | Meaning   |
| ---------------------------- | ---------------- | --------- |
| し + ませ + ん               | しません         | don't do  |
| 行き + ませ + ん + でし + た | 行きませんでした | didn't go |

## Implementation Details

### Algorithm

1. **Scan for verbs** (動詞)
2. **Look ahead** for auxiliary verbs (助動詞)
3. **Check て/で particles** followed by more verbs/auxiliaries
4. **Merge all components** into one clickable token
5. **Store original tokens** for educational display

### Code Flow

```typescript
mergeVerbPhrases(tokens: VocabularyInfo[]) {
  for each token:
    if token is 動詞:
      mergedWord = token.word

      while next token is 助動詞 or て/で particle:
        mergedWord += next.word
        continue scanning

      return merged token with originalTokens
}
```

### Merged Token Structure

```typescript
interface VocabularyInfo {
  word: '食べています'; // Merged surface form
  reading: 'タベテイマス'; // Combined reading
  baseForm: '食べる'; // Original dictionary form
  partOfSpeech: '動詞'; // Main POS (Verb)
  isGrouped: true; // Flag for merged tokens
  originalTokens: ['食べ', 'て', 'い', 'ます']; // Components
}
```

## User Experience

### Before (Confusing)

```
今日は何を　し　ます　か？
        [click し] → Verb stem (doesn't make sense alone)
        [click ます] → Auxiliary verb (not useful)
```

### After (Clear)

```
今日は何を　します　か？
        [click します] → Verb: する (to do)
                         Conjugation: Polite present
                         Components: し + ます
```

## Vocabulary Detail Popup

Ketika user click verb yang sudah digabungkan, popup menampilkan:

```
┌─────────────────────────────┐
│ Vocabulary Details          │
├─────────────────────────────┤
│                             │
│        します                │
│      (shimasu)              │
│                             │
├─────────────────────────────┤
│ Reading: シマス              │
│ Dictionary Form: する        │
│ Part of Speech: Verb        │
│                             │
│ Verb Phrase Components:     │
│  [し] [ます]                 │
│                             │
│ These parts were combined   │
│ for easier learning         │
└─────────────────────────────┘
```

## Benefits

### For Learners

1. **Natural Reading**: See verbs as they appear in textbooks
2. **Complete Meaning**: Understand conjugation as a whole
3. **Educational**: Can still see component breakdown
4. **Consistent**: Matches how verbs are taught in classes

### For Advanced Users

- Original tokens are preserved in `originalTokens` field
- Linguistic accuracy is maintained
- Can see morphological breakdown when needed

## Pattern Coverage

### Covered Patterns

✅ Polite forms: `ます`, `ません`, `ました`, `ませんでした`
✅ Past tense: `た`, `だ`
✅ Negative: `ない`, `ぬ`
✅ Te-form chains: `て + いる`, `て + ある`, `て + おく`
✅ Conditional: `ば`, `たら`
✅ Volitional: `よう`, `う`

### Not Covered (Intentionally)

❌ Noun modifiers: `食べる + 人` → Keep separate
❌ Particles after verbs: `行く + と` → Keep separate
❌ Conjunctions: `食べて + 飲む` → Keep separate (different verbs)

## Configuration

### Enable/Disable

Currently always enabled. To disable:

```typescript
// In tokenizeJapanese function
export async function tokenizeJapanese(
  text: string,
  options?: {
    mergeVerbPhrases?: boolean; // default: true
  }
): Promise<VocabularyInfo[]> {
  // ...
  if (options?.mergeVerbPhrases !== false) {
    return mergeVerbPhrases(vocabInfos);
  }
  return vocabInfos;
}
```

### Customization

Add more patterns in `mergeVerbPhrases()` function:

```typescript
// Current pattern
const shouldMerge =
  next.partOfSpeech === '助動詞' || // auxiliary verb
  (next.partOfSpeech === '助詞' && next.word.match(/^[てで]$/));

// Extended pattern (example)
const shouldMerge =
  next.partOfSpeech === '助動詞' || // auxiliary verb
  (next.partOfSpeech === '助詞' && next.word.match(/^[てで]$/)) ||
  (next.partOfSpeech === '助詞' && next.word === 'ば'); // conditional
```

## Testing

### Test Cases

```typescript
// Test: Basic polite form
します → { word: "します", originalTokens: ["し", "ます"] }

// Test: Te-form progressive
食べています → { word: "食べています", originalTokens: ["食べ", "て", "い", "ます"] }

// Test: Past negative
行かなかった → { word: "行かなかった", originalTokens: ["行か", "なかっ", "た"] }

// Test: Plain verb (no merging)
食べる → { word: "食べる", isGrouped: undefined }
```

### Manual Testing

1. Open chat interface
2. Get AI response with Japanese verbs:
   ```
   私は毎日日本語を勉強しています。
   昨日は映画を見ました。
   明日は友達と会います。
   ```
3. Verify merged verbs are clickable as single units
4. Check popup shows component breakdown

## Future Enhancements

### Potential Improvements

1. **Adjective Conjugations**: Same grouping for 形容詞

   ```
   美しかった → 美しい + かっ + た
   静かです → 静か + です
   ```

2. **Copula Patterns**: だ/です conjugations

   ```
   学生でした → 学生 + でし + た
   先生じゃない → 先生 + じゃ + ない
   ```

3. **Keigo (Honorifics)**: Special verb forms

   ```
   いらっしゃいます → いらっしゃい + ます
   おっしゃいます → おっしゃい + ます
   ```

4. **User Preference**: Toggle between grouped/ungrouped view
   ```
   Settings: [x] Show verb phrases as complete units
   ```

## Related Files

- [kuromoji-parser.ts](src/lib/utils/kuromoji-parser.ts) - Main implementation
- [VocabularyDetail.tsx](src/components/vocabulary/VocabularyDetail.tsx) - UI for component display
- [TokenizedText.tsx](src/components/vocabulary/TokenizedText.tsx) - Rendering logic
- [VOCABULARY_PARSER.md](VOCABULARY_PARSER.md) - Overall feature documentation

## References

- [Kuromoji.js Documentation](https://github.com/takuyaa/kuromoji.js)
- Japanese Verb Conjugation Patterns
- JLPT Grammar Points (N5-N1)
