# Furigana Feature Documentation

## Overview

The chat interface now supports automatic furigana (ruby text) generation for Japanese text using the Kuroshiro library.

## Setup

### Dictionary Files

The Kuromoji dictionary files are required for automatic furigana generation. They are located in `/public/dict/` and are automatically loaded by the application.

**If dictionary files are missing:**

```bash
# Copy dictionary files from node_modules to public folder
mkdir -p public/dict
cp -r node_modules/kuromoji/dict/*.dat.gz public/dict/
```

The dictionary files (~17MB total) must be accessible via the web server for Kuroshiro to function.

## Features

### 1. **Automatic Furigana Detection**

- Messages with kanji characters will show a furigana toggle button
- Three modes available:
  - **Off** (🈚): No furigana displayed
  - **Manual** (あ): Shows furigana from manual notation (e.g., `漢字[かんじ]`)
  - **Auto** (A): Automatically generates furigana for all kanji

### 2. **Manual Furigana Notation**

You can still use manual furigana notation in messages:

- Format: `漢字[かんじ]` or `漢字(かんじ)`
- Example: `今日[きょう]は良い天気[てんき]ですね`

### 3. **Automatic Furigana Generation**

Click the toggle button to cycle through modes:

- Messages with kanji will automatically get furigana added
- Powered by Kuroshiro + Kuromoji for accurate readings
- Supports all Japanese text including particles and grammar

## Usage in Code

### Using the Hook

```typescript
import { useFurigana } from '@/hooks';

function MyComponent() {
  const { isReady, convertToFurigana, convertToRomaji } = useFurigana();

  // Convert text to furigana
  const converted = await convertToFurigana('今日は良い天気です');
  // Returns: HTML with ruby tags
}
```

### Using the Utility Functions

```typescript
import { convertToRubyAuto, hasKanji, hasFurigana } from '@/lib/utils/furigana';

// Check if text has kanji
if (hasKanji('漢字')) {
  // Auto-generate furigana
  const html = await convertToRubyAuto('今日は良い天気です');
}

// Check if text has manual furigana notation
if (hasFurigana('今日[きょう]')) {
  // Process manual furigana
}
```

## Implementation Details

### Toggle Button States

- **🈚** (Empty/None): Furigana is off
- **あ** (Hiragana): Manual furigana mode
- **A** (Auto): Automatic furigana mode

### Performance

- Kuroshiro initializes once on first use (singleton pattern)
- Auto-generated furigana is cached per message
- Loading indicator shown during generation

### CSS Styling

Ruby text styling is defined in `src/app/globals.css`:

- Furigana appears above kanji
- Smaller font size (0.5em)
- Extra line height for proper spacing
- User-select disabled for cleaner copying

## Installation & Setup

### First Time Setup

After cloning the repository or installing dependencies:

```bash
# Install npm dependencies (includes kuroshiro)
npm install

# Setup dictionary files for automatic furigana
npm run setup:furigana
```

The setup script will copy ~17MB of dictionary files from `node_modules/kuromoji/dict/` to `public/dict/`.

### Manual Setup

If the npm script doesn't work on your system:

```bash
mkdir -p public/dict
cp -r node_modules/kuromoji/dict/*.dat.gz public/dict/
```

## Testing

To test the furigana feature:

1. **Ensure dictionary files are set up** (see Installation & Setup above)
2. Start the development server: `npm run dev`
3. Navigate to the chat interface
4. Send a message with Japanese kanji (e.g., `今日は良い天気です`)
5. Click the furigana toggle button to cycle through modes
6. Observe the furigana appearing above kanji characters

### Expected Behavior

- **First click** (🈚 → あ or A): Shows furigana (manual if available, otherwise auto)
- **Second click** (あ → A): If both manual and auto are available, switches to auto mode
- **Third click** (A or あ → 🈚): Hides furigana

## Examples

### Example 1: Simple Kanji

**Input:** `今日は良い天気です`

**Auto Mode Output:**

```html
<ruby>今日<rt>きょう</rt></ruby
>は<ruby>良<rt>よ</rt></ruby
>い<ruby>天気<rt>てんき</rt></ruby
>です
```

### Example 2: Mixed Text

**Input:** `私は日本語を勉強しています`

**Auto Mode Output:**

```html
<ruby>私<rt>わたし</rt></ruby
>は<ruby>日本語<rt>にほんご</rt></ruby
>を<ruby>勉強<rt>べんきょう</rt></ruby
>しています
```

### Example 3: Manual Notation

**Input:** `漢字[かんじ]を勉強[べんきょう]する`

**Manual Mode Output:**

```html
<ruby>漢字<rt>かんじ</rt></ruby
>を<ruby>勉強<rt>べんきょう</rt></ruby
>する
```

## Troubleshooting

### Furigana not showing

- Check that the message contains kanji characters
- Ensure kuroshiro has initialized (check console for errors)
- Try clicking the toggle button multiple times to cycle modes

### Slow performance

- First initialization takes 1-2 seconds (loading dictionaries)
- Subsequent conversions are fast (<100ms)
- Consider showing loading indicator

### Incorrect readings

- Kuroshiro uses statistical analysis for kanji readings
- For specific readings, use manual notation: `読む[よむ]`
- Some proper nouns may have incorrect readings

## Future Enhancements

Potential improvements:

- [ ] Global furigana toggle in settings
- [ ] Remember user's preferred furigana mode
- [ ] Support for different furigana styles (katakana, romaji)
- [ ] Custom dictionary for proper nouns
- [ ] Furigana in other UI components (task descriptions, etc.)
