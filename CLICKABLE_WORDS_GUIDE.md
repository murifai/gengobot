# Clickable Words Guide

## What Gets Highlighted

Only **content words** (vocabulary with meaning) are clickable. Grammar particles and markers are not.

## Content Words (Clickable ✅)

### Nouns (名詞)

Words that represent things, people, places, concepts.

**Examples:**

- `今日` (hari ini)
- `天気` (cuaca)
- `学校` (sekolah)
- `先生` (guru)
- `本` (buku)

### Verbs (動詞)

Action words and state-of-being.

**Examples:**

- `食べる` (makan)
- `行く` (pergi)
- `見る` (melihat)
- `勉強する` (belajar)

**Note:** Conjugated forms are also clickable:

- `食べます` ✅ (verb stem + polite marker - still shows as verb)
- `食べた` ✅ (past tense)
- `食べている` ✅ (progressive)

### Adjectives (形容詞)

Describing words.

**Examples:**

- `美味しい` (enak)
- `大きい` (besar)
- `綺麗` (cantik)
- `面白い` (menarik)

### Adverbs (副詞)

Words that modify verbs, adjectives, or other adverbs.

**Examples:**

- `とても` (sangat)
- `ゆっくり` (perlahan)
- `よく` (sering)

## Grammar Words (NOT Clickable ❌)

### Particles (助詞)

Grammar markers that show relationships.

**Examples:**

- `は` (topic marker)
- `が` (subject marker)
- `を` (object marker)
- `に` (direction/location)
- `で` (location of action)
- `と` (and/with)
- `から` (from)
- `まで` (until)
- `の` (possessive)
- `も` (also)
- `や` (and - incomplete list)
- `か` (question marker)
- `ね` (confirmation)
- `よ` (emphasis)

### Auxiliary Verbs (助動詞)

Grammar helpers attached to verbs.

**Examples:**

- `です` (copula)
- `だ` (plain copula)
- `ます` (polite marker)
- `ました` (polite past)
- `ません` (polite negative)
- `た` (past tense)
- `ない` (negative - when auxiliary)
- `られる` (passive/potential)
- `せる` (causative)

### Conjunctions (接続詞)

Simple connectors between clauses.

**Examples:**

- `そして` (dan kemudian)
- `しかし` (tetapi)
- `でも` (tetapi)

**Note:** Some conjunctions may still be clickable if they're considered content words.

## Visual Examples

### Example 1: Simple Sentence

```
今日は良い天気です
^─^ ─ ^─^ ^─^  ──
 ✅  ❌  ✅  ✅   ❌

今日 = clickable (noun)
は = not clickable (particle)
良い = clickable (adjective)
天気 = clickable (noun)
です = not clickable (copula)
```

### Example 2: Verb Sentence

```
私は毎日学校へ行きます
^─ ─ ^─^ ^─^ ─ ^──^──
✅  ❌  ✅  ✅  ❌  ✅

私 = clickable (noun)
は = not clickable (particle)
毎日 = clickable (noun - "every day")
学校 = clickable (noun)
へ = not clickable (particle)
行きます = clickable (verb)
```

### Example 3: Complex Sentence

```
美味しいご飯を食べました
^──^──  ^─^ を ^──^──^
  ✅     ✅  ❌   ✅

美味しい = clickable (adjective)
ご飯 = clickable (noun)
を = not clickable (particle)
食べました = clickable (verb)
```

### Example 4: Question

```
これは何ですか
^─^ ─ ^─ ──  ─
 ✅  ❌  ✅  ❌  ❌

これ = clickable (pronoun/noun)
は = not clickable (particle)
何 = clickable (question word/noun)
です = not clickable (copula)
か = not clickable (question particle)
```

## Why This Design?

### Benefits

1. **Less Clutter** - Only important words are highlighted
2. **Focus on Vocabulary** - Learn words that carry meaning
3. **Natural Reading** - Particles don't distract from content
4. **Efficient Learning** - Click words you don't know, skip grammar markers

### Pedagogy

- **Content words** = vocabulary to memorize
- **Particles** = grammar patterns to learn through context
- Students should focus on **what words mean**, not memorizing particles

## Edge Cases

### When Particles Might Be Clickable

If a particle has kanji and is detected as a content word by the parser, it might be clickable. This is rare but can happen with:

- `為` (ため - for the sake of)
- `故` (ゆえ - therefore)

These are acceptable to be clickable as they do have meaning.

### Compound Verbs

Some compound verbs might be split:

```
勉強します
^──^──^
   ✅

Detected as one verb unit - clickable
```

Or:

```
勉強します
^──^ ──^
 ✅   ❌

勉強 = clickable (noun form)
します = not clickable (auxiliary)
```

Both are acceptable depending on how the parser tokenizes it.

## Configuration

If you want to make particles clickable for some reason, edit:

**File:** `src/components/conversation/InteractiveJapaneseText.tsx`

**Line:** ~173-177

```typescript
// Change this:
const isContentWord =
  token.partOfSpeech === 'noun' ||
  token.partOfSpeech === 'verb' ||
  token.partOfSpeech === 'adjective' ||
  token.partOfSpeech === 'adverb';

// To this (to include particles):
const isContentWord =
  token.partOfSpeech === 'noun' ||
  token.partOfSpeech === 'verb' ||
  token.partOfSpeech === 'adjective' ||
  token.partOfSpeech === 'adverb' ||
  token.partOfSpeech === 'particle'; // ← Added
```

**Not recommended** - will make the interface too cluttered!

## Testing Examples

Try these sentences to see what's clickable:

```
✅ 今日は良い天気です
✅ 私は日本語を勉強しています
✅ このラーメンはとても美味しいです
✅ 明日学校へ行きますか
✅ 彼女は綺麗な花を買いました
```

Expected behavior:

- Nouns, verbs, adjectives → Clickable with dotted underline on hover
- は, を, に, です, か → Not clickable, no underline

---

**Perfect for vocabulary-focused learning!** 📚
