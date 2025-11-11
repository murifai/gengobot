# Kuromoji Parser Test Examples

## Verb Phrase Merging Test Cases

### Test 1: Basic Polite Forms

**Input**: `今日は何をしますか？`

**Expected Tokens**:

- 今日 (noun)
- は (particle)
- 何 (pronoun)
- を (particle)
- **します** (verb - merged from し + ます)
- か (particle)

**Verification**:

```javascript
const tokens = await tokenizeJapanese('今日は何をしますか？');
const verbToken = tokens.find(t => t.word === 'します');

expect(verbToken).toBeDefined();
expect(verbToken.isGrouped).toBe(true);
expect(verbToken.originalTokens).toEqual(['し', 'ます']);
expect(verbToken.baseForm).toBe('する');
```

---

### Test 2: Te-form Progressive

**Input**: `私は今、日本語を勉強しています。`

**Expected Merged Verbs**:

- **勉強しています** (merged from 勉強 + し + て + い + ます)

**Verification**:

```javascript
const tokens = await tokenizeJapanese('私は今、日本語を勉強しています。');
const verbToken = tokens.find(t => t.word.includes('勉強して'));

expect(verbToken.isGrouped).toBe(true);
expect(verbToken.originalTokens).toContain('て');
expect(verbToken.originalTokens).toContain('い');
expect(verbToken.originalTokens).toContain('ます');
```

---

### Test 3: Past Tense

**Input**: `昨日映画を見ました。`

**Expected Merged Verbs**:

- **見ました** (merged from 見 + まし + た)

**Verification**:

```javascript
const tokens = await tokenizeJapanese('昨日映画を見ました。');
const verbToken = tokens.find(t => t.word === '見ました');

expect(verbToken).toBeDefined();
expect(verbToken.isGrouped).toBe(true);
expect(verbToken.partOfSpeech).toBe('動詞');
```

---

### Test 4: Negative Form

**Input**: `私は肉を食べません。`

**Expected Merged Verbs**:

- **食べません** (merged from 食べ + ませ + ん)

---

### Test 5: Past Negative

**Input**: `昨日は行きませんでした。`

**Expected Merged Verbs**:

- **行きませんでした** (merged from 行き + ませ + ん + でし + た)

---

### Test 6: Te-form Past Progressive

**Input**: `その時、本を読んでいました。`

**Expected Merged Verbs**:

- **読んでいました** (merged from 読ん + で + い + まし + た)

---

### Test 7: Plain Form (No Merging)

**Input**: `食べる人`

**Expected**:

- **食べる** (verb, NOT merged - plain form has no auxiliary)
- 人 (noun)

**Verification**:

```javascript
const tokens = await tokenizeJapanese('食べる人');
const verbToken = tokens.find(t => t.word === '食べる');

expect(verbToken).toBeDefined();
expect(verbToken.isGrouped).toBeUndefined(); // NOT grouped
```

---

### Test 8: Multiple Verbs

**Input**: `毎日起きて、朝ごはんを食べます。`

**Expected Merged Verbs**:

- **起きて** (merged from 起き + て)
- **食べます** (merged from 食べ + ます)

---

### Test 9: Casual Past

**Input**: `昨日友達と遊んだ。`

**Expected Merged Verbs**:

- **遊んだ** (merged from 遊ん + だ)

---

### Test 10: Plain Negative

**Input**: `これは食べない。`

**Expected Merged Verbs**:

- **食べない** (merged from 食べ + ない)

---

## Edge Cases

### Edge Case 1: Single Character Verb

**Input**: `来ます`

**Expected**:

- **来ます** (merged from 来 + ます)

---

### Edge Case 2: Particle After Verb (Should NOT Merge)

**Input**: `行くと思う`

**Expected**:

- 行く (verb - NOT merged with と)
- と (particle - separate)
- 思う (verb)

**Verification**:

```javascript
const tokens = await tokenizeJapanese('行くと思う');

// Should have at least 3 tokens
expect(tokens.length).toBeGreaterThanOrEqual(3);

// と should be separate
const particleToken = tokens.find(t => t.word === 'と');
expect(particleToken).toBeDefined();
expect(particleToken.partOfSpeech).toBe('助詞');
```

---

### Edge Case 3: Complex Honorific

**Input**: `先生がいらっしゃいます。`

**Expected**:

- **いらっしゃいます** (merged from いらっしゃい + ます)

---

## Manual Testing Scenarios

### Scenario 1: Task Conversation

Send this message to AI:

```
毎日何時に起きますか？
```

Expected AI response might be:

```
私は毎朝7時に起きます。あなたは？
```

Verify:

- **起きます** is clickable as one unit
- Shows components: [起き] [ます]
- Dictionary form shows: 起きる

---

### Scenario 2: Past Experience

Send:

```
昨日何をしましたか？
```

Expected AI response:

```
昨日は友達と映画を見ました。とても面白かったです。
```

Verify:

- **見ました** is merged
- **面白かったです** → **面白かった** + **です** (both merged separately)

---

### Scenario 3: Progressive Action

Send:

```
今何をしていますか？
```

Expected AI response:

```
今、日本語を勉強しています。
```

Verify:

- **勉強しています** is merged as one phrase
- Shows all components in popup
- Reading shows combined katakana

---

## Debugging Tips

### If Verbs Are Not Merging:

1. **Check console logs**:

   ```javascript
   console.log('Tokens before merge:', vocabInfos);
   console.log('Tokens after merge:', mergedTokens);
   ```

2. **Verify POS tags**:
   - Verb stem should have `partOfSpeech: '動詞'`
   - Auxiliary should have `partOfSpeech: '助動詞'`

3. **Check token sequence**:
   - Verb and auxiliary must be adjacent
   - No other tokens in between

### If Popup Not Showing Components:

1. Check `isGrouped` flag is true
2. Verify `originalTokens` array exists
3. Look for console errors in VocabularyDetail component

### If Wrong Tokens Merged:

1. Review `shouldMerge` logic in `mergeVerbPhrases()`
2. Add specific exclusion patterns
3. Test with edge cases

---

## Performance Benchmarks

### Expected Performance:

```
Text Length: 20 characters
Tokenization: ~50-100ms
Merging: ~5-10ms
Total: ~55-110ms
```

### Large Text:

```
Text Length: 200 characters
Tokenization: ~200-400ms
Merging: ~20-40ms
Total: ~220-440ms
```

---

## Future Test Cases to Add

1. Adjective conjugations (美しかった, 静かでした)
2. Copula conjugations (学生です, 先生でした)
3. Causative forms (食べさせる)
4. Passive forms (食べられる)
5. Potential forms (食べられます)
6. Volitional forms (行こう)
7. Conditional forms (行けば, 行ったら)
