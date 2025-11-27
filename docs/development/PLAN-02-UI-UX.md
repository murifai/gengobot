# PLAN-02: UI/UX Improvements

## Overview

Perbaikan UI/UX untuk konsistensi bahasa Indonesia, font, dan komponen neobrutalism.

**Priority**: HIGH
**Complexity**: Medium
**Sessions**: 2-3

---

## Current State Analysis

### Issues Identified:

1. **UI Language belum semuanya Bahasa Indonesia**
2. **Font tidak force ke default** - banyak font yang tidak menggunakan default
3. **Switch component** - view list/grid button bagian dalam tidak perlu shadow
4. **Roleplay feedback** - perlu UI Bahasa Indonesia

### Current Font Setup:

```css
/* globals.css */
--font-sans: var(--font-sora);
--font-japanese: var(--font-shippori), 'Hiragino Kaku Gothic Pro', 'Yu Gothic';
```

---

## Session 1: Language Localization (Bahasa Indonesia)

### Tasks:

#### 1.1 Audit UI Text Locations

**Scan files untuk English text:**

```
src/app/app/ - User-facing pages
src/components/app/ - User components
src/components/dashboard/ - Dashboard text
src/components/deck/ - Deck management
src/components/task/ - Task components
src/components/subscription/ - Subscription UI
```

#### 1.2 Create Localization Constants

**File**: `src/lib/constants/ui-text.ts`

```typescript
export const UI_TEXT = {
  // Dashboard
  dashboard: {
    title: 'Dashboard',
    weeklyActivity: 'Aktivitas Mingguan',
    recentActivity: 'Aktivitas Terbaru',
    speakingMinutes: 'Menit Latihan Kaiwa',
    masteredCards: 'Kartu yang Sudah Hafal',
    learningStreak: 'Streak Belajar',
    noActivity: 'Belum ada aktivitas',
    startLearning: 'Mulai belajar sekarang!',
  },

  // Drill/Flashcard
  drill: {
    title: 'Drill',
    study: 'Belajar',
    newCards: 'Kartu Baru',
    memorized: 'Hafal',
    notMemorized: 'Belum Hafal',
    totalCards: 'Total Kartu',
    flip: 'Flip',
    again: 'Lagi',
    hard: 'Sulit',
    good: 'Bagus',
    easy: 'Mudah',
    nextCard: 'Kartu Berikutnya',
    previousCard: 'Kartu Sebelumnya',
    sessionComplete: 'Sesi Selesai!',
    accuracy: 'Akurasi',
    timeSpent: 'Waktu Belajar',
  },

  // Kaiwa/Roleplay
  kaiwa: {
    title: 'Kaiwa',
    roleplay: 'Roleplay',
    freeChat: 'Kaiwa Bebas',
    startConversation: 'Mulai Percakapan',
    endConversation: 'Akhiri Percakapan',
    sendMessage: 'Kirim Pesan',
    typeMessage: 'Ketik pesan...',
    recording: 'Merekam...',
    processing: 'Memproses...',
  },

  // Feedback
  feedback: {
    title: 'Feedback',
    achievements: 'Apa yang Kamu Capai',
    weaknesses: 'Kekurangan Kamu',
    corrections: 'Koreksi Grammar dan Vocabulary',
    recommendations: 'Rekomendasi',
    deckRecommendations: 'Deck yang Disarankan',
    taskRecommendations: 'Task yang Disarankan',
    overallScore: 'Skor Keseluruhan',
    excellent: 'Sangat Baik',
    good: 'Baik',
    needsImprovement: 'Perlu Perbaikan',
  },

  // Profile
  profile: {
    title: 'Profil',
    editProfile: 'Edit Profil',
    settings: 'Pengaturan',
    progress: 'Progress',
    subscription: 'Langganan',
    logout: 'Keluar',
  },

  // Common
  common: {
    loading: 'Memuat...',
    error: 'Terjadi kesalahan',
    retry: 'Coba Lagi',
    save: 'Simpan',
    cancel: 'Batal',
    delete: 'Hapus',
    edit: 'Edit',
    create: 'Buat',
    search: 'Cari',
    filter: 'Filter',
    sort: 'Urutkan',
    viewAll: 'Lihat Semua',
    back: 'Kembali',
    next: 'Selanjutnya',
    previous: 'Sebelumnya',
    confirm: 'Konfirmasi',
    yes: 'Ya',
    no: 'Tidak',
  },

  // Time
  time: {
    justNow: 'Baru saja',
    minutesAgo: 'menit yang lalu',
    hoursAgo: 'jam yang lalu',
    daysAgo: 'hari yang lalu',
    today: 'Hari ini',
    yesterday: 'Kemarin',
    thisWeek: 'Minggu ini',
  },

  // Difficulty
  difficulty: {
    N5: 'Pemula (N5)',
    N4: 'Dasar (N4)',
    N3: 'Menengah (N3)',
    N2: 'Lanjutan (N2)',
    N1: 'Mahir (N1)',
  },
};
```

#### 1.3 Update Components with UI_TEXT

**Priority Components to Update:**

1. **Dashboard Components**
   - `src/components/app/dashboard/AppDashboard.tsx`
   - `src/components/dashboard/activity-chart.tsx`
   - `src/components/dashboard/stats-card.tsx`

2. **Drill Components**
   - `src/components/flashcard/FlashcardSession.tsx`
   - `src/components/deck/DeckStatistics.tsx`
   - `src/app/app/drill/decks/[deckId]/study/page.tsx`

3. **Kaiwa Components**
   - `src/components/app/kaiwa/ChatClient.tsx`
   - `src/components/task/TaskFeedback.tsx`

### Checklist Session 1:

- [ ] Create `ui-text.ts` constants file
- [ ] Update AppDashboard.tsx
- [ ] Update activity-chart.tsx
- [ ] Update FlashcardSession.tsx
- [ ] Update DeckStatistics.tsx
- [ ] Update ChatClient.tsx
- [ ] Search & replace remaining English strings

---

## Session 2: Font Consistency

### Tasks:

#### 2.1 Font Audit

**File**: `src/app/globals.css`

Current font variables:

```css
--font-sans: var(--font-sora);
--font-japanese: var(--font-shippori);
--font-serif: var(--font-shippori);
--font-mono: Roboto Mono, monospace;
```

#### 2.2 Force Default Font

**File**: `tailwind.config.ts`

```typescript
theme: {
  extend: {
    fontFamily: {
      sans: ['var(--font-sora)', 'system-ui', 'sans-serif'],
      japanese: ['var(--font-shippori)', 'Hiragino Kaku Gothic Pro', 'Yu Gothic', 'sans-serif'],
      mono: ['Roboto Mono', 'monospace'],
    },
  },
},
```

#### 2.3 Global Font Reset

**File**: `src/app/globals.css`

```css
/* Force default font on all elements */
* {
  font-family: var(--font-sans);
}

/* Japanese text override */
:lang(ja),
[lang='ja'],
.font-japanese {
  font-family: var(--font-japanese);
}

/* Input elements */
input,
textarea,
select,
button {
  font-family: inherit;
}

/* Code elements */
code,
pre,
kbd,
samp {
  font-family: var(--font-mono);
}
```

#### 2.4 Component Font Classes

Add utility classes where needed:

```tsx
// For Japanese text
<span className="font-japanese">日本語テキスト</span>

// For romaji/Indonesian
<span className="font-sans">Teks Indonesia</span>
```

### Checklist Session 2:

- [x] Audit current font usage across components
- [x] Update tailwind.config.ts font families (using Tailwind v4 CSS-based config in globals.css)
- [x] Add global font reset in globals.css
- [x] Fix components using wrong fonts (FlashcardNeo.tsx)
- [ ] Test font rendering across browsers
- [ ] Verify Japanese text displays correctly

---

## Session 3: Component Fixes

### Tasks:

#### 3.1 Switch Component Fix (Grid/List View)

**File**: `src/components/ui/switch.tsx`

**Issue**: Bagian dalam tidak perlu shadow

**Fix**:

```tsx
// Before (with inner shadow)
<SwitchPrimitive.Thumb className="... shadow-sm ..." />

// After (no inner shadow)
<SwitchPrimitive.Thumb className="... shadow-none ..." />
```

#### 3.2 View Toggle Component

**File**: `src/components/ui/view-toggle.tsx` (if exists)

```tsx
interface ViewToggleProps {
  view: 'grid' | 'list';
  onViewChange: (view: 'grid' | 'list') => void;
}

export function ViewToggle({ view, onViewChange }: ViewToggleProps) {
  return (
    <div className="flex gap-1 p-1 bg-muted rounded-md border-2 border-border">
      <button
        onClick={() => onViewChange('grid')}
        className={cn(
          'p-2 rounded transition-colors',
          view === 'grid' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted-foreground/10'
        )}
      >
        <Grid className="h-4 w-4" />
      </button>
      <button
        onClick={() => onViewChange('list')}
        className={cn(
          'p-2 rounded transition-colors',
          view === 'list' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted-foreground/10'
        )}
      >
        <List className="h-4 w-4" />
      </button>
    </div>
  );
}
```

#### 3.3 Roleplay Feedback UI (Bahasa Indonesia)

**File**: `src/components/task/TaskFeedback.tsx`

Structure feedback sections:

```tsx
interface FeedbackSections {
  achievements: {
    title: 'Apa yang Kamu Capai';
    icon: Trophy;
    color: 'green';
  };
  weaknesses: {
    title: 'Kekurangan Kamu';
    icon: AlertCircle;
    color: 'orange';
  };
  corrections: {
    title: 'Koreksi Grammar dan Vocabulary';
    icon: CheckCircle;
    color: 'blue';
  };
  recommendations: {
    title: 'Rekomendasi';
    icon: Lightbulb;
    color: 'purple';
  };
}
```

#### 3.4 Audio Wave Input Visibility

**Issue**: Icon task chat, input audio wave warnanya sama jadi tidak terlihat

**Files to check**:

- `src/components/voice/VoiceRecorder.tsx`
- `src/components/chat/ChatInput.tsx`

**Fix**: Ensure contrasting colors for audio wave

```tsx
// Audio wave should use distinct color
<div className="audio-wave bg-primary/50">
  {/* wave visualization */}
</div>

// Or use accent color
<div className="audio-wave bg-secondary">
  {/* wave visualization */}
</div>
```

### Checklist Session 3:

- [x] Fix Switch component inner shadow
- [x] Create/update ViewToggle component
- [x] Update TaskFeedback with Indonesian sections (PostTaskReview.tsx)
- [x] Fix audio wave input visibility
- [x] Test all modified components (lint & typecheck pass)
- [ ] Cross-browser testing

---

## Files to Modify

### Create:

- [ ] `src/lib/constants/ui-text.ts`
- [ ] `src/components/ui/view-toggle.tsx` (if not exists)

### Modify:

- [ ] `src/app/globals.css`
- [ ] `tailwind.config.ts`
- [ ] `src/components/ui/switch.tsx`
- [ ] `src/components/app/dashboard/AppDashboard.tsx`
- [ ] `src/components/dashboard/activity-chart.tsx`
- [ ] `src/components/flashcard/FlashcardSession.tsx`
- [ ] `src/components/deck/DeckStatistics.tsx`
- [ ] `src/components/task/TaskFeedback.tsx`
- [ ] `src/components/voice/VoiceRecorder.tsx`

---

## Testing Checklist

### Visual Testing:

- [ ] All text displays in Bahasa Indonesia
- [ ] Font consistent across all pages
- [ ] Japanese text uses correct font
- [ ] Switch component has no inner shadow
- [ ] Audio wave visible during recording
- [ ] Feedback sections clearly labeled

### Browser Testing:

- [ ] Chrome
- [ ] Firefox
- [ ] Safari
- [ ] Mobile Safari
- [ ] Mobile Chrome

### Responsive Testing:

- [ ] Desktop (1920px)
- [ ] Tablet (768px)
- [ ] Mobile (375px)

---

## Definition of Done

- [ ] All user-facing text in Bahasa Indonesia
- [ ] Font family consistent across app
- [ ] Japanese text displays correctly
- [ ] Switch component fixed
- [ ] Audio wave visible
- [ ] Feedback UI in Indonesian
- [ ] No visual regressions
- [ ] Cross-browser compatible

---

_Plan Version: 1.0_
_Created: 2025-11-27_
