# Vocabulary Popup - Base Form Display

## Overview

Popup kosakata sekarang menampilkan **kata dasar** (bentuk kamus) untuk kata kerja dan kata sifat yang telah dikonjugasi.

## UI Format

### Format Lengkap dengan Kata Dasar

```
┌──────────────────────┐
│  食べました           │  ← Kosakata (conjugated)
│  たべました           │  ← Hiragana
│  (tabemashita)       │  ← Romaji
├──────────────────────┤
│  Kata Dasar:         │  ← Label
│  食べる              │  ← Base form
├──────────────────────┤
│  "makan (past)"      │  ← Arti (optional)
└──────────────────────┘
```

## Examples

### 1. Verb - Past Tense

**Input**: `食べました`

```
┌──────────────────────┐
│  食べました           │
│  たべました           │
│  (tabemashita)       │
├──────────────────────┤
│  Kata Dasar:         │
│  食べる              │
└──────────────────────┘
```

### 2. Verb - Negative

**Input**: `食べません`

```
┌──────────────────────┐
│  食べません           │
│  たべません           │
│  (tabemasen)         │
├──────────────────────┤
│  Kata Dasar:         │
│  食べる              │
└──────────────────────┘
```

### 3. Verb - Progressive

**Input**: `食べています`

```
┌──────────────────────┐
│  食べています         │
│  たべています         │
│  (tabeteimasu)       │
├──────────────────────┤
│  Kata Dasar:         │
│  食べる              │
└──────────────────────┘
```

### 4. Noun+Verb Compound

**Input**: `勉強します`

```
┌──────────────────────┐
│  勉強します           │
│  べんきょうします     │
│  (benkyoushimasu)    │
├──────────────────────┤
│  Kata Dasar:         │
│  勉強する            │
└──────────────────────┘
```

### 5. Adjective - Past

**Input**: `美しかった`

```
┌──────────────────────┐
│  美しかった           │
│  うつくしかった       │
│  (utsukushikatta)    │
├──────────────────────┤
│  Kata Dasar:         │
│  美しい              │
└──────────────────────┘
```

### 6. Plain Verb (No Base Form Shown)

**Input**: `食べる` (already in dictionary form)

```
┌──────────────────────┐
│  食べる              │
│  たべる              │
│  (taberu)            │
└──────────────────────┘
```

_Note: Kata dasar tidak ditampilkan karena sudah sama dengan kata asli_

## When Base Form is Shown

### ✅ Shown When:

1. **Conjugated Verbs**
   - Past: 食べた → 食べる
   - Polite: 食べます → 食べる
   - Negative: 食べない → 食べる
   - Progressive: 食べている → 食べる
   - Te-form: 食べて → 食べる

2. **Conjugated Adjectives**
   - Past: 美しかった → 美しい
   - Negative: 美しくない → 美しい
   - Adverbial: 美しく → 美しい

3. **Compound Verbs**
   - 勉強します → 勉強する
   - 質問した → 質問する

### ❌ Not Shown When:

1. **Already in Dictionary Form**
   - 食べる (verb dictionary form)
   - 美しい (adjective dictionary form)
   - 学生 (noun - no base form)

2. **Particles**
   - は, が, を, に, etc.

3. **Symbols & Others**
   - 。、！？

## Technical Details

### Interface Update

```typescript
interface VocabularyDetailProps {
  vocab: {
    word: string; // "食べました"
    reading: string; // "タベマシタ"
    baseForm?: string; // "食べる" (NEW!)
    meaning?: string; // "makan" (optional)
  };
  onClose: () => void;
  position?: { x: number; y: number };
}
```

### Display Logic

```typescript
{/* Kata Dasar (Base Form) */}
{vocab.baseForm && vocab.baseForm !== vocab.word && (
  <div className="pt-2 border-t">
    <div className="text-xs text-gray-500 text-center">
      Kata Dasar:
    </div>
    <div className="text-sm font-medium text-center">
      {vocab.baseForm}
    </div>
  </div>
)}
```

**Conditions**:

1. `vocab.baseForm` exists
2. `vocab.baseForm !== vocab.word` (different from surface form)

### Data Flow

```typescript
// Kuromoji tokenization
token.basic_form = "食べる"      // From Kuromoji
token.surface_form = "食べました"  // Conjugated form

// VocabularyInfo
{
  word: "食べました",
  baseForm: "食べる",     // ✅ Passed to popup
  reading: "タベマシタ",
}

// VocabularyDetail displays:
// - Word: 食べました
// - Reading: たべました (tabemashita)
// - Base Form: 食べる  ← NEW!
```

## Styling

### CSS Classes

```tsx
{
  /* Label */
}
<div className="text-xs text-gray-500 dark:text-gray-400 text-center mb-0.5">Kata Dasar:</div>;

{
  /* Base Form */
}
<div className="text-sm font-medium text-gray-700 dark:text-gray-300 text-center">
  {vocab.baseForm}
</div>;
```

### Visual Hierarchy

1. **Kosakata** (Largest, bold) - 2xl, font-bold
2. **Hiragana** (Medium) - base, regular
3. **Romaji** (Small, italic) - sm, gray
4. **Kata Dasar Label** (Smallest) - xs, gray, light
5. **Kata Dasar** (Small, medium weight) - sm, font-medium
6. **Arti** (Small, italic) - sm, italic

## Testing

### Test Cases

#### Test 1: Past Tense Verb

```
Input: 食べました
Expected:
  ✓ Kosakata: 食べました
  ✓ Reading: たべました (tabemashita)
  ✓ Kata Dasar: 食べる
```

#### Test 2: Negative Verb

```
Input: 食べない
Expected:
  ✓ Kosakata: 食べない
  ✓ Reading: たべない (tabenai)
  ✓ Kata Dasar: 食べる
```

#### Test 3: Progressive Verb

```
Input: 食べています
Expected:
  ✓ Kosakata: 食べています
  ✓ Reading: たべています (tabeteimasu)
  ✓ Kata Dasar: 食べる
```

#### Test 4: Compound Verb

```
Input: 勉強します
Expected:
  ✓ Kosakata: 勉強します
  ✓ Reading: べんきょうします (benkyoushimasu)
  ✓ Kata Dasar: 勉強する
```

#### Test 5: Dictionary Form (No Base Form)

```
Input: 食べる
Expected:
  ✓ Kosakata: 食べる
  ✓ Reading: たべる (taberu)
  ✗ Kata Dasar: (not shown - same as word)
```

#### Test 6: Adjective Past

```
Input: 美しかった
Expected:
  ✓ Kosakata: 美しかった
  ✓ Reading: うつくしかった (utsukushikatta)
  ✓ Kata Dasar: 美しい
```

#### Test 7: Noun (No Base Form)

```
Input: 学生
Expected:
  ✓ Kosakata: 学生
  ✓ Reading: がくせい (gakusei)
  ✗ Kata Dasar: (not shown - nouns don't conjugate)
```

## Common Patterns

### Verb Conjugations

| Conjugated Form | Base Form | Pattern             |
| --------------- | --------- | ------------------- |
| 食べます        | 食べる    | Polite present      |
| 食べました      | 食べる    | Polite past         |
| 食べない        | 食べる    | Plain negative      |
| 食べなかった    | 食べる    | Plain negative past |
| 食べて          | 食べる    | Te-form             |
| 食べている      | 食べる    | Progressive         |
| 食べていた      | 食べる    | Progressive past    |
| 食べれば        | 食べる    | Conditional         |
| 食べよう        | 食べる    | Volitional          |

### Adjective Conjugations

| Conjugated Form | Base Form | Pattern      |
| --------------- | --------- | ------------ |
| 美しい          | 美しい    | Plain (same) |
| 美しかった      | 美しい    | Past         |
| 美しくない      | 美しい    | Negative     |
| 美しく          | 美しい    | Adverbial    |
| 美しければ      | 美しい    | Conditional  |

### Compound Verbs

| Compound     | Base Form | Pattern                   |
| ------------ | --------- | ------------------------- |
| 勉強します   | 勉強する  | Noun + する               |
| 質問した     | 質問する  | Noun + する (past)        |
| 仕事している | 仕事する  | Noun + する (progressive) |

## Benefits

### For Learners

1. **Dictionary Lookup**: Can look up the base form in dictionary
2. **Grammar Understanding**: See how words conjugate
3. **Vocabulary Building**: Learn both forms together
4. **Pattern Recognition**: Understand conjugation patterns

### Examples

**Scenario 1: Unknown Conjugated Verb**

```
User sees: 食べました
Clicks it, sees:
  - 食べました (conjugated)
  - 食べる (base form)

Now user can:
  ✓ Look up "食べる" in dictionary
  ✓ Understand it's past tense of "食べる"
  ✓ Learn the pattern: ます → ました (past)
```

**Scenario 2: Learning Conjugation**

```
User sees multiple forms:
  - 食べます → Base: 食べる
  - 食べた → Base: 食べる
  - 食べない → Base: 食べる

Learns: All are forms of "食べる"
```

## Files Modified

1. **[VocabularyDetail.tsx](src/components/vocabulary/VocabularyDetail.tsx)**
   - Added `baseForm?` to interface (line 10)
   - Added base form display section (lines 71-81)
   - Conditional display logic

## Future Enhancements

### 1. Conjugation Type Label

```tsx
{
  vocab.conjugationType && <span className="badge">{vocab.conjugationType}</span>;
}
// Examples: "Past", "Negative", "Progressive", "Te-form"
```

### 2. Conjugation Explanation

```tsx
<div className="text-xs text-gray-500">Past tense (polite form)</div>
```

### 3. Show Related Forms

```tsx
<div className="related-forms">
  食べる (dictionary) 食べます (polite) 食べた (past) 食べない (negative)
</div>
```

### 4. Grammar Notes

```tsx
<div className="grammar-note">Used with ました ending for polite past tense</div>
```

## Related Documentation

- [VOCABULARY_POPUP_SIMPLE.md](VOCABULARY_POPUP_SIMPLE.md) - Main popup documentation
- [VERB_PHRASE_GROUPING.md](VERB_PHRASE_GROUPING.md) - Verb merging feature
- [VOCABULARY_UI_INDONESIAN.md](VOCABULARY_UI_INDONESIAN.md) - Indonesian UI
