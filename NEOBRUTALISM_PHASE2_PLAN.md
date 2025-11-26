# Neo Brutalism Migration - Phase 2 Plan

## Overview

This plan addresses remaining UI components and files that need neo brutalism styling updates, plus font changes.

## Design Token Reference

```
ROUNDED: rounded-base (not rounded-lg, rounded-md, rounded-xl, rounded-2xl)
BORDERS: border-2 border-border (not border alone, not border-gray-*)
SHADOWS: shadow-shadow (not shadow-sm, shadow-md, shadow-lg, shadow-xl)
BACKGROUNDS: bg-main, bg-secondary-background (not bg-white, bg-gray-*)
TEXT: text-foreground, text-muted-foreground (not text-gray-*)
```

---

## Phase 2.1: Font Configuration

### Fonts to Add

1. **Sora** - For romaji/English text
   - URL: https://fonts.google.com/specimen/Sora
   - Weights: 400, 500, 600, 700

2. **Shippori Mincho** - For Japanese text
   - URL: https://fonts.google.com/specimen/Shippori+Mincho
   - Weights: 400, 500, 600, 700

### Files to Update

- [ ] `src/app/layout.tsx` - Import fonts from next/font/google
- [ ] `src/app/globals.css` - Add font-family CSS variables
- [ ] `tailwind.config.ts` - Add font families to theme

---

## Phase 2.2: Core UI Components (8 files)

### 1. `/src/components/ui/ErrorBoundary.tsx`

- [ ] Line 104: `bg-gray-50 dark:bg-gray-900` → `bg-secondary-background`
- [ ] Line 105: `bg-white dark:bg-gray-800` → `bg-background`
- [ ] Line 105: `rounded-lg` → `rounded-base`
- [ ] Line 105: `shadow-lg` → `shadow-shadow`
- [ ] Line 130: `border border-primary/30` → `border-2 border-primary/30`
- [ ] Line 130, 140: `rounded-md` → `rounded-base`
- [ ] Line 147: `bg-gray-200 dark:bg-gray-700` → `bg-secondary-background`
- [ ] Line 182: `rounded-lg` → `rounded-base`

### 2. `/src/components/ui/LoadingState.tsx`

- [ ] Line 35: `border-4 border-gray-200` → `border-2 border-border`
- [ ] Lines 49-51: `bg-gray-200 dark:bg-gray-700` → `bg-secondary-background`
- [ ] Lines 49-51: `rounded` → `rounded-base`
- [ ] Line 67: `bg-gray-200 dark:bg-gray-700` → `bg-secondary-background`
- [ ] Line 132: `bg-white dark:bg-gray-800` → `bg-background`
- [ ] Line 132: `rounded-lg` → `rounded-base`
- [ ] Line 132: `shadow-md` → `shadow-shadow`
- [ ] Lines 133-140: `bg-gray-200 dark:bg-gray-700` → `bg-secondary-background`

### 3. `/src/components/ui/Notification.tsx`

- [ ] Line 203: `rounded-lg` → `rounded-base`
- [ ] Line 203: `shadow-lg` → `shadow-shadow`
- [ ] Line 203: `border` → `border-2`
- [ ] Line 224: `text-gray-400 hover:text-gray-600` → `text-muted-foreground hover:text-foreground`

### 4. `/src/components/ui/GuidedTour.tsx`

- [ ] All `rounded-lg` → `rounded-base`
- [ ] All `shadow-xl` → `shadow-shadow`
- [ ] All `rounded-md` → `rounded-base`

### 5. `/src/components/ui/sidebar.tsx` (Admin Sidebar)

- [ ] Line ~82: `rounded-lg` → `rounded-base`
- [ ] Line ~82: `shadow-sm` → `shadow-shadow`
- [ ] All `rounded-md`, `rounded-xl` → `rounded-base`
- [ ] All `shadow-sm` → `shadow-shadow`

### 6. `/src/components/ui/message-input.tsx`

- [ ] Line 80: `rounded-xl` → `rounded-base`
- [ ] Line 86: `border` → `border-2`
- [ ] Line 86: `rounded-xl` → `rounded-base`
- [ ] All other `rounded-xl` → `rounded-base`

### 7. `/src/components/ui/file-preview.tsx`

- [ ] All `rounded-md` → `rounded-base`
- [ ] All `border` (alone) → `border-2`

### 8. `/src/components/ui/chart.tsx`

- [ ] `shadow-xl` → `shadow-shadow`
- [ ] `rounded-lg` → `rounded-base`

---

## Phase 2.3: Chat Components (6 files)

### 1. `/src/components/chat/HintButton.tsx`

- [ ] Line 84: `bg-white dark:bg-gray-800` → `bg-background`
- [ ] Line 84: `rounded-lg` → `rounded-base`
- [ ] Line 84: `shadow-lg` → `shadow-shadow`
- [ ] Line 84: `border-gray-200 dark:border-gray-700` → `border-border`
- [ ] Line 90: `rounded` → `rounded-base`
- [ ] Line 90: `bg-gray-100 dark:hover:bg-gray-700` → `bg-secondary-background hover:bg-main/20`

### 2. `/src/components/chat/StreamingChatInterface.tsx`

- [ ] All `rounded-2xl` → `rounded-base`
- [ ] All `shadow-sm` → `shadow-shadow`
- [ ] Recording indicator styles

### 3. `/src/components/chat/UnifiedChatInterface.tsx`

- [ ] `bg-gray-50 dark:bg-gray-900` → `bg-secondary-background`
- [ ] `bg-white dark:bg-gray-800` → `bg-background`
- [ ] `border-gray-200 dark:border-gray-700` → `border-border`
- [ ] `rounded-lg` → `rounded-base`
- [ ] `hover:bg-gray-100 dark:hover:bg-gray-700` → `hover:bg-main/20`

### 4. `/src/components/task/MessageLimitWarning.tsx`

- [ ] Line 27: `rounded-lg` → `rounded-base`
- [ ] Line 74: `rounded-full` → Review if needs `rounded-base`

### 5. `/src/components/task/CompletionSuggestion.tsx`

- [ ] Line 31: `rounded-lg` → `rounded-base`
- [ ] Line 31: `shadow-lg` → `shadow-shadow`
- [ ] Lines 61, 80, 87: `rounded-lg` → `rounded-base`

### 6. `/src/components/task/TaskResumeDialog.tsx`

- [ ] All `rounded-lg` → `rounded-base`
- [ ] `shadow-xl`, `shadow-sm` → `shadow-shadow`

---

## Phase 2.4: Card & Character Components (3 files)

### 1. `/src/components/character/CharacterCard.tsx`

- [ ] Line 36: `bg-white dark:bg-gray-800` → `bg-background`
- [ ] Line 36: `rounded-lg` → `rounded-base`
- [ ] Line 36: `shadow-md` → `shadow-shadow`
- [ ] Lines 42, 54, 70: `text-gray-*` → `text-muted-foreground`
- [ ] Line 45: `rounded-full` → Review
- [ ] Line 102: `bg-gray-100 dark:bg-gray-700` → `bg-secondary-background`

### 2. `/src/components/character/CharacterCreator.tsx`

- [ ] `bg-white dark:bg-gray-800` → `bg-background`
- [ ] All `rounded-lg` → `rounded-base`
- [ ] `shadow-lg` → `shadow-shadow`
- [ ] `border border-gray-300` → `border-2 border-border`
- [ ] All gray color references → theme colors

### 3. `/src/components/dashboard/stats-card.tsx`

- [ ] Line 45: `hover:shadow-lg` → `hover:shadow-shadow`

---

## Phase 2.5: Deck & Flashcard Components (5 files)

### 1. `/src/components/deck/DeckBrowser.tsx`

- [ ] `hover:shadow-lg` → `hover:shadow-shadow`

### 2. `/src/components/deck/DeckStatistics.tsx`

- [ ] All `hover:shadow-lg`, `hover:shadow-md` → `hover:shadow-shadow`

### 3. `/src/components/deck/DeckLearningWithSRS.tsx`

- [ ] `rounded-2xl` → `rounded-base`
- [ ] `shadow-xl`, `shadow-md` → `shadow-shadow`

### 4. `/src/components/deck/FlashcardEditor.tsx`

- [ ] `bg-white dark:bg-gray-800` → `bg-background`
- [ ] `rounded-lg` → `rounded-base`
- [ ] `shadow-xl` → `shadow-shadow`

### 5. `/src/components/flashcard/FlashcardSession.tsx`

- [ ] `hover:shadow-lg` → `hover:shadow-shadow`

---

## Phase 2.6: Admin & Payment Components (4 files)

### 1. `/src/components/admin/DeckSelector.tsx`

- [ ] `border border-gray-300` → `border-2 border-border`
- [ ] `rounded-lg` → `rounded-base`
- [ ] `bg-white dark:bg-gray-800` → `bg-background`
- [ ] All gray colors → theme colors

### 2. `/src/components/admin/TaskEditorForm.tsx`

- [ ] All `border-gray-300` → `border-border`
- [ ] All `rounded-lg`, `rounded-md` → `rounded-base`
- [ ] All `shadow-sm` → `shadow-shadow`
- [ ] `bg-gray-700` → theme colors

### 3. `/src/components/payment/PricingCard.tsx`

- [ ] `shadow-lg` → `shadow-shadow`

### 4. `/src/components/subscription/PricingTable.tsx`

- [ ] `shadow-md` → `shadow-shadow`

---

## Phase 2.7: Landing Page Components (3 files)

### 1. `/src/components/landing/Features.tsx`

- [ ] `hover:shadow-md` → `hover:shadow-shadow`

### 2. `/src/components/landing/Pricing.tsx`

- [ ] `shadow-lg` → `shadow-shadow`

### 3. `/src/components/landing/Hero.tsx`

- [ ] `rounded-2xl` → `rounded-base`
- [ ] `border border-primary/20` → `border-2 border-primary/20`

---

## Phase 2.8: App Profile & Settings Components (4 files)

### 1. `/src/components/app/kaiwa/ChatClient.tsx`

- [ ] `bg-gray-50 dark:bg-gray-900` → `bg-secondary-background`
- [ ] `bg-white dark:bg-gray-800` → `bg-background`
- [ ] `border-gray-200 dark:border-gray-700` → `border-border`
- [ ] `rounded-lg` → `rounded-base`

### 2. `/src/components/app/profile/ProgressClient.tsx`

- [ ] Same patterns as ChatClient.tsx

### 3. `/src/components/app/profile/SettingsClient.tsx`

- [ ] `bg-gray-50 dark:bg-gray-900` → `bg-secondary-background`
- [ ] `bg-gray-100 dark:bg-gray-800` → `bg-secondary-background`
- [ ] `border border-gray-300` → `border-2 border-border`
- [ ] `rounded-lg` → `rounded-base`

### 4. `/src/components/notifications/NotificationBell.tsx`

- [ ] `bg-white dark:bg-gray-900` → `bg-background`
- [ ] `rounded-lg` → `rounded-base`
- [ ] `shadow-lg` → `shadow-shadow`
- [ ] `border-gray-200 dark:border-gray-700` → `border-border`

---

## Phase 2.9: Vocabulary & Auth Components (2 files)

### 1. `/src/components/vocabulary/VocabularyDetail.tsx`

- [ ] `bg-white dark:bg-gray-800` → `bg-background`
- [ ] `rounded-lg` → `rounded-base`
- [ ] `shadow-xl` → `shadow-shadow`

### 2. `/src/components/auth/LoginModal.tsx`

- [ ] `border-gray-300` → `border-border`
- [ ] Review other styling

---

## Phase 2.10: Additional UI Components to Check

### Slider Component

- [ ] `/src/components/ui/slider.tsx` - Apply neo brutalism styles

### Tag Component

- [ ] Search for tag-related components
- [ ] Apply neo brutalism styles

### Search Input Components

- [ ] Check all search input implementations
- [ ] Apply neo brutalism styles

### Recording Indicator

- [ ] `/src/components/chat/` - Find and style recording indicator

### Statistics/Graph Components

- [ ] `/src/components/admin/statistik/` - Check all stat components
- [ ] Apply neo brutalism to charts and graphs

---

## Phase 2.11: Run Build & Verification

- [ ] Run `npm run build` to check for errors
- [ ] Run `npm run lint` to check for warnings
- [ ] Visual verification of all updated components

---

## Summary

| Phase     | Category   | Files         | Priority |
| --------- | ---------- | ------------- | -------- |
| 2.1       | Fonts      | 3             | HIGH     |
| 2.2       | Core UI    | 8             | HIGH     |
| 2.3       | Chat       | 6             | HIGH     |
| 2.4       | Cards      | 3             | MEDIUM   |
| 2.5       | Decks      | 5             | MEDIUM   |
| 2.6       | Admin      | 4             | MEDIUM   |
| 2.7       | Landing    | 3             | LOW      |
| 2.8       | Profile    | 4             | MEDIUM   |
| 2.9       | Other      | 2             | LOW      |
| 2.10      | Additional | ~5            | HIGH     |
| 2.11      | Build      | -             | HIGH     |
| **TOTAL** |            | **~43 files** |          |

---

## Pattern Replacement Commands (Reference)

```bash
# In each file, replace these patterns:

# Rounded
rounded-lg → rounded-base
rounded-md → rounded-base
rounded-xl → rounded-base
rounded-2xl → rounded-base
rounded-3xl → rounded-base

# Borders
border border- → border-2 border-
border-gray-100 → border-border
border-gray-200 → border-border
border-gray-300 → border-border
border-gray-700 → border-border
border-gray-800 → border-border
border-slate-* → border-border
border-neutral-* → border-border

# Shadows
shadow-sm → shadow-shadow
shadow-md → shadow-shadow
shadow-lg → shadow-shadow
shadow-xl → shadow-shadow
shadow-2xl → shadow-shadow
hover:shadow-sm → hover:shadow-shadow
hover:shadow-md → hover:shadow-shadow
hover:shadow-lg → hover:shadow-shadow

# Background Colors
bg-white → bg-background
bg-gray-50 → bg-secondary-background
bg-gray-100 → bg-secondary-background
bg-gray-200 → bg-secondary-background
bg-gray-700 → bg-secondary-background
bg-gray-800 → bg-background
bg-gray-900 → bg-background

# Text Colors
text-gray-400 → text-muted-foreground
text-gray-500 → text-muted-foreground
text-gray-600 → text-muted-foreground
text-gray-700 → text-foreground

# Hover States
hover:bg-gray-100 → hover:bg-main/20
hover:bg-gray-700 → hover:bg-main/20
dark:hover:bg-gray-700 → hover:bg-main/20
```
