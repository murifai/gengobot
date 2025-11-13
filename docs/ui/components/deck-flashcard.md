# Deck & Flashcard Components

> Components for flashcard management and spaced repetition learning

[← Back to Index](../README.md)

---

## Overview

Deck and flashcard components are located in `/src/components/deck/` and `/src/components/flashcard/` and provide interfaces for creating, studying, and managing flashcard decks with SRS (Spaced Repetition System).

**Components:** 5

---

## DeckBrowser

**File:** `/src/components/deck/DeckBrowser.tsx`

Browse and discover flashcard decks.

### Features
- Grid/list view toggle
- Filter by category
- Filter by JLPT level
- Search functionality
- Sort options (popular, recent, difficulty)
- Deck preview cards showing:
  - Card count
  - Due cards
  - Completion progress
  - Difficulty level
  - Category
- Add to library button
- Start studying button

### Usage

```tsx
import { DeckBrowser } from '@/components/deck/DeckBrowser'

<DeckBrowser
  onSelectDeck={(deckId) => router.push(`/study/${deckId}`)}
  onAddToLibrary={(deckId) => addDeckToLibrary(deckId)}
  view="grid"
  filters={{
    category: 'vocabulary',
    level: 'N5',
  }}
/>

// With search
<DeckBrowser
  searchQuery={searchQuery}
  onSearch={setSearchQuery}
  onSelectDeck={handleSelectDeck}
/>
```

### Props

```typescript
interface DeckBrowserProps {
  onSelectDeck: (deckId: string) => void
  onAddToLibrary?: (deckId: string) => void
  view?: 'grid' | 'list'
  filters?: {
    category?: string
    level?: 'N5' | 'N4' | 'N3' | 'N2' | 'N1'
    tags?: string[]
  }
  searchQuery?: string
  onSearch?: (query: string) => void
  sortBy?: 'popular' | 'recent' | 'difficulty' | 'title'
}
```

---

## DeckLearning

**File:** `/src/components/deck/DeckLearning.tsx`

Basic flashcard learning interface without SRS.

### Features
- Card flip animation
- Front/back display
- Navigation controls (next, previous)
- Progress indicator
- Shuffle option
- Study mode selection:
  - Recognition (Japanese → English)
  - Recall (English → Japanese)
  - Both sides
- Audio playback
- Mark as known/unknown
- Study session statistics

### Usage

```tsx
import { DeckLearning } from '@/components/deck/DeckLearning'

<DeckLearning
  deckId={deckId}
  mode="recognition"
  onComplete={(stats) => {
    console.log('Session complete:', stats)
    router.push('/dashboard')
  }}
/>

// With shuffle
<DeckLearning
  deckId={deckId}
  shuffle={true}
  showProgress={true}
/>
```

### Props

```typescript
interface DeckLearningProps {
  deckId: string
  mode?: 'recognition' | 'recall' | 'both'
  shuffle?: boolean
  showProgress?: boolean
  onComplete?: (stats: SessionStats) => void
  onExit?: () => void
}

interface SessionStats {
  totalCards: number
  cardsStudied: number
  known: number
  unknown: number
  duration: number
}
```

---

## DeckLearningWithSRS

**File:** `/src/components/deck/DeckLearningWithSRS.tsx`

Advanced flashcard learning with Spaced Repetition System.

### Features
- SRS algorithm integration (Anki-style)
- Card intervals and due dates
- Difficulty rating buttons:
  - Again (< 1 min)
  - Hard (< 10 min)
  - Good (1 day)
  - Easy (4 days)
- Learning queue management
- Review vs. new card distinction
- Card scheduling
- Retention statistics
- Heatmap calendar
- Study streak tracking
- Daily goal progress

### Usage

```tsx
import { DeckLearningWithSRS } from '@/components/deck/DeckLearningWithSRS'

<DeckLearningWithSRS
  deckId={deckId}
  onComplete={(stats) => {
    updateUserProgress(stats)
    router.push('/dashboard')
  }}
/>

// With daily limit
<DeckLearningWithSRS
  deckId={deckId}
  dailyNewCardLimit={20}
  dailyReviewLimit={200}
  onDailyLimitReached={() => {
    showNotification({
      type: 'info',
      message: 'Daily limit reached! Great job today.',
    })
  }}
/>
```

### Props

```typescript
interface DeckLearningWithSRSProps {
  deckId: string
  dailyNewCardLimit?: number
  dailyReviewLimit?: number
  onComplete?: (stats: SRSStats) => void
  onExit?: () => void
  showCalendar?: boolean
  showStats?: boolean
}

interface SRSStats extends SessionStats {
  newCards: number
  reviewCards: number
  relearningCards: number
  averageInterval: number
  retention: number
}
```

### SRS Algorithm

The component implements a modified Anki algorithm:

```typescript
// Rating effects on intervals
Again: interval = 1 min, mark as lapsed
Hard: interval *= 1.2
Good: interval *= ease (default 2.5)
Easy: interval *= ease * 1.3

// Ease factor adjustments
Again: ease -= 0.2
Hard: ease -= 0.15
Easy: ease += 0.15
```

---

## FlashcardEditor

**File:** `/src/components/deck/FlashcardEditor.tsx`

Create and edit individual flashcards.

### Features
- Front/back text editing
- Rich text support (markdown)
- Furigana input for Japanese text
- Audio upload/record
- Image upload
- Example sentences
- Tags
- Difficulty setting
- Notes field
- Preview mode
- Duplicate card detection

### Usage

```tsx
import { FlashcardEditor } from '@/components/deck/FlashcardEditor'

// Create new card
<FlashcardEditor
  deckId={deckId}
  onSave={(cardData) => {
    createFlashcard(deckId, cardData)
    router.back()
  }}
  onCancel={() => router.back()}
/>

// Edit existing card
<FlashcardEditor
  deckId={deckId}
  cardId={cardId}
  initialData={cardData}
  onSave={(cardData) => {
    updateFlashcard(cardId, cardData)
  }}
  onCancel={() => router.back()}
/>
```

### Props

```typescript
interface FlashcardEditorProps {
  deckId: string
  cardId?: string
  initialData?: Partial<Flashcard>
  onSave: (data: FlashcardData) => void
  onCancel: () => void
  mode?: 'create' | 'edit'
}

interface FlashcardData {
  front: string
  back: string
  furigana?: string
  audioUrl?: string
  imageUrl?: string
  examples?: string[]
  tags?: string[]
  difficulty?: 'easy' | 'medium' | 'hard'
  notes?: string
}
```

---

## FlashcardSession

**File:** `/src/components/flashcard/FlashcardSession.tsx`

Complete flashcard study session with analytics.

### Features
- Session management
- Time tracking
- Performance metrics
- Break reminders
- Session pause/resume
- Auto-save progress
- Session summary on completion
- Export session data
- Leaderboard integration

### Usage

```tsx
import { FlashcardSession } from '@/components/flashcard/FlashcardSession'

<FlashcardSession
  deckId={deckId}
  sessionType="timed"
  duration={1800} // 30 minutes
  onComplete={(summary) => {
    saveSessionData(summary)
    showSessionSummary(summary)
  }}
/>

// Quick review session
<FlashcardSession
  deckId={deckId}
  sessionType="quick"
  cardLimit={10}
/>
```

### Props

```typescript
interface FlashcardSessionProps {
  deckId: string
  sessionType?: 'standard' | 'timed' | 'quick' | 'review'
  duration?: number // seconds
  cardLimit?: number
  breakInterval?: number // minutes
  onComplete?: (summary: SessionSummary) => void
  onPause?: () => void
  onResume?: () => void
}

interface SessionSummary {
  duration: number
  cardsStudied: number
  accuracy: number
  newCards: number
  reviewCards: number
  streak: number
  points: number
}
```

---

## Study Modes

### Recognition Mode
Show Japanese → Test English knowledge

### Recall Mode
Show English → Test Japanese production

### Both Sides
Randomly show either side

### Review Mode
Only show cards that are due for review

### Cram Mode
Study all cards regardless of scheduling

---

## SRS Schedule Visualization

```tsx
import { DeckLearningWithSRS } from '@/components/deck/DeckLearningWithSRS'

<DeckLearningWithSRS
  deckId={deckId}
  showCalendar={true}
  calendarView="year"
  onDateClick={(date) => {
    showCardsForDate(date)
  }}
/>
```

---

## Related Components

- [Progress Components](./task.md) - Progress tracking
- [Vocabulary Components](./vocabulary.md) - Japanese text features

### Related Hooks
- [useTaskProgress](../hooks.md#usetaskprogress)

---

[← Back to Index](../README.md)
