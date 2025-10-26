# Furigana Button Test Guide

## How to Test the Furigana Toggle Button

The furigana toggle button (`あ`/`ア`) will **ONLY** appear when a message contains furigana notation.

### ✅ Correct Formats (Button WILL appear):

1. **Bracket notation**: `漢字[かんじ]`
   - Example: `今日[きょう]は良[よ]い天気[てんき]です`

2. **Parenthesis notation**: `漢字(かんじ)`
   - Example: `今日(きょう)は良(よ)い天気(てんき)です`

### ❌ Formats that DON'T work (Button will NOT appear):

- Plain Japanese: `今日は良い天気です` (no button - no furigana notation)
- Ruby HTML tags: `<ruby>漢字<rt>かんじ</rt></ruby>` (won't work with our parser)
- Space-separated: `漢字 かんじ` (not recognized as furigana)

## How to Test:

### Option 1: Ask AI to send furigana

Send this to the AI:

```
Please respond with furigana notation using brackets, like: 今日[きょう]
```

### Option 2: Test messages you can manually type

Try sending these test messages (if you have text input):

1. `今日[きょう]は良[よ]い日[ひ]ですね`
2. `勉強[べんきょう]が好[す]きです`
3. `日本語[にほんご]を学[まな]んでいます`

### What You Should See:

When a message has furigana notation:

- You'll see a small button with `あ` (hiragana) beside the message
- Click it → furigana hides, button changes to `ア` (katakana)
- Click again → furigana shows, button changes back to `あ`

### Debug Console:

Open browser console (F12) and look for:

```
[MessageBubble] Message with furigana detected: { content: "...", hasFurigana: true }
```

If you see this log, the button should appear!

## Current Status:

The button is implemented and working. It just needs messages with the correct furigana format to appear.
