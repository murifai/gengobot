# PLAN-08: Polish & Cleanup

## Overview

Final polish dan fixes untuk issues kecil yang tersisa.

**Priority**: LOW
**Complexity**: Low
**Sessions**: 1-2

**Dependencies**: All previous phases

---

## Issues to Fix

### 1. Hiragana/Katakana Animation

**Problem**: Huruf masih blank, belum ada animasi

**File**: `src/components/flashcard/FlashcardDisplay.tsx` atau equivalent

**Solution**:

```tsx
// Add stroke animation for hiragana/katakana cards
import { motion } from 'framer-motion';

interface StrokeAnimationProps {
  character: string;
  type: 'hiragana' | 'katakana';
}

export function CharacterAnimation({ character, type }: StrokeAnimationProps) {
  // Use SVG paths or canvas for stroke animation
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      className="text-6xl font-japanese"
    >
      {character}
    </motion.div>
  );
}
```

**Alternative**: Use existing libraries like `react-kana-provider` or SVG stroke animations.

### 2. Difficulty Filter

**Problem**: Filter difficulty tidak ada/tidak spesifik

**Files to check**:

- `src/app/app/drill/page.tsx`
- `src/components/deck/DeckList.tsx`

**Solution**:

```tsx
// Add difficulty filter component
<Select value={difficultyFilter} onValueChange={setDifficultyFilter}>
  <SelectTrigger>
    <SelectValue placeholder="Filter Level" />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="all">Semua Level</SelectItem>
    <SelectItem value="N5">N5 - Pemula</SelectItem>
    <SelectItem value="N4">N4 - Dasar</SelectItem>
    <SelectItem value="N3">N3 - Menengah</SelectItem>
    <SelectItem value="N2">N2 - Lanjutan</SelectItem>
    <SelectItem value="N1">N1 - Mahir</SelectItem>
    <SelectItem value="unspecified">Tanpa Level</SelectItem>
  </SelectContent>
</Select>
```

### 3. Audio Wave Input Visibility

**Problem**: Icon task chat, input audio wave warnanya sama jadi tidak terlihat

**File**: `src/components/voice/VoiceRecorder.tsx` atau `src/components/chat/ChatInput.tsx`

**Solution**:

```tsx
// Ensure contrasting color for audio wave
<div
  className={cn(
    'audio-wave-container',
    isRecording ? 'bg-secondary' : 'bg-muted' // Use secondary (cyan) for visibility
  )}
>
  <AudioWaveform
    className={cn(
      'transition-colors',
      isRecording ? 'text-secondary-foreground' : 'text-muted-foreground'
    )}
  />
</div>
```

### 4. Drill Flashcard Button Position

**Problem**: Button flip tidak di tengah, button study di atas

**File**: `src/app/app/drill/decks/[deckId]/study/page.tsx`

**Current layout:**

```
[Previous] [Next]
    [Card]
  [Flip]
[Again][Hard][Good][Easy]
```

**Target layout:**

```
    [Card]
[Previous][Flip][Next]
[Again][Hard][Good][Easy]
```

**Solution**:

```tsx
<div className="flex flex-col items-center gap-4">
  {/* Card */}
  <FlashcardDisplay card={currentCard} flipped={isFlipped} />

  {/* Navigation & Flip - Centered */}
  <div className="flex items-center gap-4">
    <Button variant="outline" onClick={handlePrevious} disabled={currentIndex === 0}>
      <ChevronLeft className="h-4 w-4" />
    </Button>
    <Button onClick={handleFlip} className="px-8">
      Balik
    </Button>
    <Button variant="outline" onClick={handleNext} disabled={currentIndex === cards.length - 1}>
      <ChevronRight className="h-4 w-4" />
    </Button>
  </div>

  {/* Rating Buttons */}
  {isFlipped && (
    <div className="flex gap-2">
      <RatingButton rating="again" onClick={() => handleRate('again')} />
      <RatingButton rating="hard" onClick={() => handleRate('hard')} />
      <RatingButton rating="good" onClick={() => handleRate('good')} />
      <RatingButton rating="easy" onClick={() => handleRate('easy')} />
    </div>
  )}
</div>
```

### 5. Mobile View Consistency

**Files to check all mobile views:**

- Dashboard
- Drill study page
- Kaiwa chat
- Profile pages

**Common fixes:**

```tsx
// Ensure proper padding and spacing
<div className="container px-4 md:px-8 py-4 md:py-8">
  {/* Content */}
</div>

// Responsive grid
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  {/* Items */}
</div>

// Responsive text
<h1 className="text-xl md:text-2xl lg:text-3xl font-bold">
  Title
</h1>

// Touch-friendly buttons
<Button className="min-h-[44px] min-w-[44px]">
  Click
</Button>
```

---

## Session 1: UI Fixes

### Tasks:

#### 1.1 Fix Character Animation

- [ ] Research best approach for kana animation
- [ ] Implement character display with animation
- [ ] Test hiragana cards
- [ ] Test katakana cards

#### 1.2 Fix Difficulty Filter

- [ ] Add filter to deck list
- [ ] Add filter to flashcard browser
- [ ] Test filtering works correctly
- [ ] Handle "unspecified" difficulty

#### 1.3 Fix Audio Wave Visibility

- [ ] Update audio wave colors
- [ ] Test visibility during recording
- [ ] Verify contrast in both themes

#### 1.4 Fix Button Positions

- [ ] Reorganize study page layout
- [ ] Center flip button
- [ ] Test on mobile

---

## Session 2: Final Testing & Cleanup

### Tasks:

#### 2.1 Mobile Testing

- [ ] Test all pages on mobile viewport
- [ ] Fix any overflow issues
- [ ] Ensure touch targets are 44px+
- [ ] Test landscape orientation

#### 2.2 Cross-Browser Testing

- [ ] Chrome
- [ ] Firefox
- [ ] Safari
- [ ] Edge

#### 2.3 Performance Check

- [ ] Run Lighthouse audit
- [ ] Check bundle size
- [ ] Verify no memory leaks
- [ ] Test with slow network

#### 2.4 Accessibility Check

- [ ] Keyboard navigation
- [ ] Screen reader compatibility
- [ ] Color contrast
- [ ] Focus indicators

#### 2.5 Code Cleanup

- [ ] Remove unused imports
- [ ] Remove console.logs
- [ ] Update TODO comments
- [ ] Run linter

---

## Files to Modify

### UI Fixes:

- [ ] `src/components/flashcard/FlashcardDisplay.tsx`
- [ ] `src/app/app/drill/page.tsx`
- [ ] `src/app/app/drill/decks/[deckId]/study/page.tsx`
- [ ] `src/components/voice/VoiceRecorder.tsx`
- [ ] `src/components/deck/DeckList.tsx`

### Mobile Fixes:

- [ ] Various layout components

---

## Testing Checklist

### Visual:

- [ ] Hiragana/Katakana display correctly
- [ ] Difficulty filter works
- [ ] Audio wave visible
- [ ] Button layout correct

### Functional:

- [ ] All features work
- [ ] No console errors
- [ ] No broken links
- [ ] Forms validate properly

### Performance:

- [ ] Load time < 3s
- [ ] No layout shifts
- [ ] Smooth animations
- [ ] Responsive interactions

---

## Definition of Done

- [ ] All identified issues fixed
- [ ] Mobile responsive
- [ ] Cross-browser compatible
- [ ] Accessibility compliant
- [ ] Performance acceptable
- [ ] Code clean and linted
- [ ] Ready for production

---

_Plan Version: 1.0_
_Created: 2025-11-27_
