# PLAN-03: Statistics & Dashboard

## Overview

Perbaikan sistem statistik dan dashboard untuk akurasi data dan UX yang lebih baik.

**Priority**: HIGH
**Complexity**: High
**Sessions**: 2-3

---

## Current State Analysis

### Issues Identified:

1. **Kaiwa minutes calculation salah** - dihitung ketika user AFK, seharusnya hanya active chatting
2. **Roleplay dan kaiwa bebas warna sama** - perlu dibedakan
3. **Container cards dan kaiwa tidak dipisahkan**
4. **Streak belajar tidak perlu** - hapus
5. **Recent activity terlalu kompleks** - sederhanakan
6. **Timestamp di bawah** - pindah ke kanan
7. **Roleplay feedback bukan Bahasa Indonesia**
8. **Deck statistics salah** - ubah ke: Baru, Hafal, Belum hafal, Total kartu

### Current API Endpoints:

- `/api/stats/kaiwa` - Kaiwa statistics
- `/api/stats/drill` - Drill statistics
- `/api/stats/weekly` - Weekly activity
- `/api/activity/recent` - Recent activity

---

## Session 1: Kaiwa Minutes Fix & Activity Calculation

### Tasks:

#### 1.1 Fix Kaiwa Minutes Calculation

**Problem**: Menghitung waktu AFK, bukan active chatting time.

**Solution**: Track message timestamps, calculate active time between messages.

**File**: `src/app/api/stats/kaiwa/route.ts`

```typescript
// Current (wrong) - just endTime - startTime
const totalMinutes = sessions.reduce((acc, session) => {
  return acc + differenceInMinutes(session.endTime, session.startTime);
}, 0);

// New (correct) - calculate from actual message activity
const calculateActiveMinutes = (conversationHistory: Message[]) => {
  let activeMinutes = 0;
  const MAX_GAP_MINUTES = 5; // Max gap considered "active"

  for (let i = 1; i < conversationHistory.length; i++) {
    const gap = differenceInMinutes(
      conversationHistory[i].timestamp,
      conversationHistory[i - 1].timestamp
    );
    // Only count if gap is less than MAX_GAP
    if (gap <= MAX_GAP_MINUTES) {
      activeMinutes += gap;
    }
  }

  return activeMinutes;
};
```

#### 1.2 Update TaskAttempt Model (if needed)

**File**: `prisma/schema.prisma`

Add field for active time tracking:

```prisma
model TaskAttempt {
  // existing fields...
  activeMinutes     Int?      // Calculated active chatting time
  lastActivityAt    DateTime? // Last message timestamp
}
```

#### 1.3 Track Activity in Real-time

**File**: `src/app/api/task-attempts/[attemptId]/message/route.ts`

```typescript
// When user sends message, update lastActivityAt
await prisma.taskAttempt.update({
  where: { id: attemptId },
  data: {
    lastActivityAt: new Date(),
  },
});
```

#### 1.4 Calculate Active Time on Complete

**File**: `src/app/api/task-attempts/[attemptId]/complete/route.ts`

```typescript
// Calculate active minutes from conversation history
const conversationHistory = attempt.conversationHistory as Message[];
const activeMinutes = calculateActiveMinutes(conversationHistory);

await prisma.taskAttempt.update({
  where: { id: attemptId },
  data: {
    activeMinutes,
    endTime: new Date(),
    isCompleted: true,
  },
});
```

### Checklist Session 1:

- [ ] Create calculateActiveMinutes utility function
- [ ] Update kaiwa stats API to use active minutes
- [ ] Add activeMinutes field to TaskAttempt (migration)
- [ ] Track lastActivityAt on message send
- [ ] Calculate active time on task complete
- [ ] Test with real conversation data

---

## Session 2: UI Improvements

### Tasks:

#### 2.1 Differentiate Roleplay vs Kaiwa Bebas Colors

**File**: `src/components/app/dashboard/AppDashboard.tsx`

```typescript
// Activity type colors
const ACTIVITY_COLORS = {
  roleplay: {
    bg: 'bg-primary/10', // Pink background
    icon: 'text-primary', // Pink icon
    badge: 'bg-primary', // Pink badge
  },
  kaiwa_bebas: {
    bg: 'bg-secondary/10', // Cyan background
    icon: 'text-secondary', // Cyan icon
    badge: 'bg-secondary', // Cyan badge
  },
  drill: {
    bg: 'bg-green-100',
    icon: 'text-green-600',
    badge: 'bg-green-500',
  },
};
```

#### 2.2 Separate Container Cards vs Kaiwa

**File**: `src/components/app/dashboard/AppDashboard.tsx`

```tsx
// Current: Mixed in one grid
// New: Separate sections

<div className="space-y-6">
  {/* Flashcard/Drill Section */}
  <section>
    <h2 className="text-lg font-semibold mb-4">Drill & Flashcard</h2>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <StatsCard
        title="Kartu yang Sudah Hafal"
        value={drillStats.masteredCards}
        // ...
      />
      <StatsCard
        title="Total Kartu Dipelajari"
        value={drillStats.totalReviewed}
        // ...
      />
    </div>
  </section>

  {/* Kaiwa Section */}
  <section>
    <h2 className="text-lg font-semibold mb-4">Percakapan</h2>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <StatsCard
        title="Menit Roleplay"
        value={kaiwaStats.roleplayMinutes}
        icon={MessageSquare}
        className="border-primary/20"
      />
      <StatsCard
        title="Menit Kaiwa Bebas"
        value={kaiwaStats.freeChatMinutes}
        icon={MessageCircle}
        className="border-secondary/20"
      />
    </div>
  </section>
</div>
```

#### 2.3 Remove Streak Belajar

**File**: `src/components/app/dashboard/AppDashboard.tsx`

Remove the streak card entirely:

```tsx
// DELETE THIS SECTION
<StatsCard
  title="Streak Belajar"
  value={`${streak} hari`}
  icon={GraduationCap}
  // ...
/>
```

#### 2.4 Simplify Recent Activity

**File**: `src/components/app/dashboard/AppDashboard.tsx`

```tsx
// Simplified activity item
interface ActivityItem {
  type: 'roleplay' | 'kaiwa_bebas' | 'drill';
  title: string;
  timestamp: Date;
}

// Simpler display
<div className="flex items-center justify-between py-2">
  <div className="flex items-center gap-3">
    <ActivityIcon type={activity.type} />
    <span className="text-sm">{activity.title}</span>
  </div>
  <span className="text-xs text-muted-foreground">{formatRelativeTime(activity.timestamp)}</span>
</div>;
```

#### 2.5 Move Timestamp to Right Side

Already done in simplified version above - timestamp on the right.

### Checklist Session 2:

- [x] Add activity type color constants
- [x] Separate drill and kaiwa sections
- [x] Remove streak belajar card
- [x] Simplify recent activity component
- [x] Move timestamp to right side
- [x] Test responsive layout

---

## Session 3: Deck Statistics & API Updates

### Tasks:

#### 3.1 Update Deck Statistics Display

**File**: `src/components/deck/DeckStatistics.tsx`

**Current stats**: Study Streak, Cards Reviewed, Mastery %, Study Time
**New stats**: Baru (New), Hafal (Memorized), Belum Hafal (Not Memorized), Total

```tsx
interface DeckStatsProps {
  newCards: number; // Kartu Baru
  memorizedCards: number; // Hafal
  notMemorizedCards: number; // Belum Hafal
  totalCards: number; // Total
}

export function DeckStatistics({ stats }: { stats: DeckStatsProps }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <StatCard label="Baru" value={stats.newCards} icon={Sparkles} color="blue" />
      <StatCard label="Hafal" value={stats.memorizedCards} icon={CheckCircle} color="green" />
      <StatCard label="Belum Hafal" value={stats.notMemorizedCards} icon={XCircle} color="red" />
      <StatCard label="Total Kartu" value={stats.totalCards} icon={Layers} color="gray" />
    </div>
  );
}
```

#### 3.2 Update Deck Stats API

**File**: `src/app/api/decks/[deckId]/stats/route.ts`

```typescript
export async function GET(req: Request, { params }: { params: { deckId: string } }) {
  const { deckId } = params;
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Get all flashcards in deck
  const flashcards = await prisma.flashcard.findMany({
    where: { deckId },
  });

  // Get user's review history for this deck
  const reviews = await prisma.flashcardReview.findMany({
    where: {
      userId: session.user.id,
      flashcard: { deckId },
    },
    orderBy: { reviewedAt: 'desc' },
  });

  // Calculate stats
  const reviewedCardIds = new Set(reviews.map(r => r.flashcardId));

  const stats = {
    newCards: flashcards.filter(f => !reviewedCardIds.has(f.id)).length,
    memorizedCards: flashcards.filter(f => {
      const lastReview = reviews.find(r => r.flashcardId === f.id);
      return lastReview?.rating === 'hafal';
    }).length,
    notMemorizedCards: flashcards.filter(f => {
      const lastReview = reviews.find(r => r.flashcardId === f.id);
      return lastReview?.rating === 'belum_hafal';
    }).length,
    totalCards: flashcards.length,
  };

  return NextResponse.json(stats);
}
```

#### 3.3 Weekly Stats API Update

**File**: `src/app/api/stats/weekly/route.ts`

Separate roleplay and kaiwa bebas:

```typescript
interface WeeklyStats {
  dates: string[];
  roleplayMinutes: number[];
  kaiwaBetasMinutes: number[];
  cardsLearned: number[];
}
```

#### 3.4 Kaiwa Stats API Update

**File**: `src/app/api/stats/kaiwa/route.ts`

```typescript
interface KaiwaStats {
  roleplay: {
    totalMinutes: number;
    sessionsCount: number;
    averageScore: number;
  };
  kaiwaBebas: {
    totalMinutes: number;
    conversationsCount: number;
    messagesCount: number;
  };
}
```

### Checklist Session 3:

- [ ] Update DeckStatistics component
- [ ] Update deck stats API endpoint
- [ ] Update weekly stats API (separate roleplay/kaiwa)
- [ ] Update kaiwa stats API (separate roleplay/kaiwa bebas)
- [ ] Test all statistics calculations
- [ ] Verify dashboard displays correctly

---

## Database Migrations

### Migration 1: Add activeMinutes to TaskAttempt

```sql
ALTER TABLE "TaskAttempt" ADD COLUMN "activeMinutes" INTEGER;
ALTER TABLE "TaskAttempt" ADD COLUMN "lastActivityAt" TIMESTAMP;
```

### Migration 2: Update FlashcardReview rating enum (if needed)

```sql
-- Ensure rating field supports 'hafal' and 'belum_hafal'
ALTER TYPE "FlashcardRating" ADD VALUE IF NOT EXISTS 'hafal';
ALTER TYPE "FlashcardRating" ADD VALUE IF NOT EXISTS 'belum_hafal';
```

---

## API Changes Summary

| Endpoint                           | Change                                                 |
| ---------------------------------- | ------------------------------------------------------ |
| `/api/stats/kaiwa`                 | Add roleplay/kaiwaBebas split, fix minutes calculation |
| `/api/stats/weekly`                | Add roleplayMinutes, kaiwaBetasMinutes arrays          |
| `/api/stats/drill`                 | Update to return new/hafal/belum_hafal/total           |
| `/api/decks/[deckId]/stats`        | Return new stats structure                             |
| `/api/task-attempts/[id]/message`  | Track lastActivityAt                                   |
| `/api/task-attempts/[id]/complete` | Calculate activeMinutes                                |

---

## Component Changes Summary

| Component            | Changes                                      |
| -------------------- | -------------------------------------------- |
| `AppDashboard.tsx`   | Remove streak, separate sections, new colors |
| `activity-chart.tsx` | Update for roleplay/kaiwa split              |
| `DeckStatistics.tsx` | New stats: Baru, Hafal, Belum Hafal, Total   |
| `stats-card.tsx`     | Add color variants                           |

---

## Testing Checklist

### Data Accuracy:

- [ ] Kaiwa minutes only counts active time
- [ ] Deck stats accurately reflect card status
- [ ] Weekly stats show correct breakdown
- [ ] Roleplay vs Kaiwa Bebas properly differentiated

### UI Testing:

- [ ] Dashboard sections properly separated
- [ ] Colors differentiate activity types
- [ ] Timestamps on right side
- [ ] No streak card displayed
- [ ] Simplified recent activity

### Edge Cases:

- [ ] User with no activity
- [ ] Deck with no cards
- [ ] Very long conversations (>1 hour)
- [ ] Multiple sessions in one day

---

## Definition of Done

- [ ] Kaiwa minutes calculated from active chatting only
- [ ] Roleplay and Kaiwa Bebas have different colors
- [ ] Cards and Kaiwa sections separated
- [ ] Streak removed
- [ ] Recent activity simplified
- [ ] Timestamps on right
- [ ] Deck stats show: Baru, Hafal, Belum Hafal, Total
- [ ] All APIs updated
- [ ] Database migrations applied
- [ ] Tests passing

---

_Plan Version: 1.0_
_Created: 2025-11-27_
