# PLAN-05: Admin Enhancements

## Overview

Perbaikan admin panel termasuk charts neobrutalism, deck editing dengan difficulty, dan user tier synchronization.

**Priority**: MEDIUM
**Complexity**: Medium
**Sessions**: 2

---

## Current State Analysis

### Issues Identified:

1. **Admin charts bukan neobrutalism** - menggunakan default Recharts styling
2. **Deck edit tidak spesifik di difficulty** - difficulty tidak tersimpan dengan benar
3. **User memiliki dua kolom tier** - di User dan di Subscription, harusnya nyambung
4. **Setting subscription belum nyambung ke frontend**

### Current Admin Features:

- Dashboard dengan statistics
- User management
- Task management
- Deck management
- Voucher management
- Subscription tier config

---

## Session 1: Charts Neobrutalism Styling

### Tasks:

#### 1.1 Create Custom Chart Theme

**File**: `src/lib/constants/chart-theme.ts`

```typescript
export const NEOBRUTALISM_CHART_THEME = {
  // Colors from globals.css
  colors: {
    primary: '#ff5e75',
    secondary: '#1dcddc',
    tertiary: '#7fbf50',
    quaternary: '#f2eda0',
    quinary: '#d99ad5',
  },

  // Chart specific colors
  chart: {
    background: 'transparent',
    gridColor: '#000000',
    gridColorDark: '#fafafa',
    textColor: '#000000',
    textColorDark: '#fafafa',
  },

  // Tooltip styling
  tooltip: {
    backgroundColor: '#ffffff',
    borderColor: '#000000',
    borderWidth: 3,
    borderRadius: 5,
    boxShadow: '4px 4px 0px 0px #000000',
  },

  // Legend styling
  legend: {
    iconType: 'square',
    iconSize: 12,
  },
};

// Recharts color array
export const CHART_COLORS = [
  '#ff5e75', // primary
  '#1dcddc', // secondary
  '#7fbf50', // tertiary
  '#f2eda0', // quaternary
  '#d99ad5', // quinary
];

// JLPT level colors
export const JLPT_COLORS = {
  N5: '#22c55e', // green
  N4: '#84cc16', // lime
  N3: '#eab308', // yellow
  N2: '#f97316', // orange
  N1: '#ef4444', // red
};

// Subscription tier colors
export const TIER_COLORS = {
  FREE: '#94a3b8', // slate
  BASIC: '#3b82f6', // blue
  PRO: '#8b5cf6', // violet
};
```

#### 1.2 Custom Neobrutalism Tooltip Component

**File**: `src/components/admin/charts/NeoTooltip.tsx`

```tsx
import { TooltipProps } from 'recharts';

export function NeoTooltip({ active, payload, label }: TooltipProps<number, string>) {
  if (!active || !payload?.length) return null;

  return (
    <div className="bg-background border-3 border-border rounded-md p-3 shadow-neo">
      <p className="font-semibold text-sm mb-2">{label}</p>
      {payload.map((entry, index) => (
        <div key={index} className="flex items-center gap-2 text-sm">
          <div
            className="w-3 h-3 rounded-sm border border-border"
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-muted-foreground">{entry.name}:</span>
          <span className="font-medium">{entry.value}</span>
        </div>
      ))}
    </div>
  );
}
```

#### 1.3 Update Subscriber Chart (Pie)

**File**: `src/components/admin/dashboard/SubscriberChart.tsx`

```tsx
import { PieChart, Pie, Cell, Legend, ResponsiveContainer, Tooltip } from 'recharts';
import { TIER_COLORS, NEOBRUTALISM_CHART_THEME } from '@/lib/constants/chart-theme';
import { NeoTooltip } from '../charts/NeoTooltip';

export function SubscriberChart({ data }: SubscriberChartProps) {
  const chartData = [
    { name: 'Free', value: data.free, color: TIER_COLORS.FREE },
    { name: 'Basic', value: data.basic, color: TIER_COLORS.BASIC },
    { name: 'Pro', value: data.pro, color: TIER_COLORS.PRO },
  ];

  return (
    <div className="p-4 border-3 border-border rounded-lg bg-card shadow-neo">
      <h3 className="font-bold text-lg mb-4">Subscriber</h3>
      <ResponsiveContainer width="100%" height={250}>
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius={50}
            outerRadius={80}
            paddingAngle={2}
            dataKey="value"
            stroke="#000000"
            strokeWidth={2}
          >
            {chartData.map((entry, index) => (
              <Cell key={index} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip content={<NeoTooltip />} />
          <Legend iconType="square" wrapperStyle={{ paddingTop: 20 }} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
```

#### 1.4 Update User by JLPT Level Chart (Bar)

**File**: `src/components/admin/dashboard/UserByLevelChart.tsx`

```tsx
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { JLPT_COLORS } from '@/lib/constants/chart-theme';
import { NeoTooltip } from '../charts/NeoTooltip';

export function UserByLevelChart({ data }: UserByLevelChartProps) {
  return (
    <div className="p-4 border-3 border-border rounded-lg bg-card shadow-neo">
      <h3 className="font-bold text-lg mb-4">User by JLPT Level</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#000000" strokeOpacity={0.2} />
          <XAxis type="number" stroke="#000000" />
          <YAxis dataKey="level" type="category" stroke="#000000" />
          <Tooltip content={<NeoTooltip />} />
          <Bar dataKey="count" barSize={30} stroke="#000000" strokeWidth={2}>
            {data.map((entry, index) => (
              <Cell key={index} fill={JLPT_COLORS[entry.level as keyof typeof JLPT_COLORS]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
```

#### 1.5 Update All Admin Charts

Apply neobrutalism styling to:

- `RevenueChart.tsx`
- `UserByDomicileChart.tsx`
- `PracticeStatsChart.tsx`
- `EarningsChart.tsx`

**Common styling pattern:**

```tsx
// Card wrapper
<div className="p-4 border-3 border-border rounded-lg bg-card shadow-neo">
  {/* Chart content */}
</div>

// CartesianGrid
<CartesianGrid strokeDasharray="3 3" stroke="#000000" strokeOpacity={0.2} />

// Axes
<XAxis stroke="#000000" />
<YAxis stroke="#000000" />

// Bars/Lines with border
<Bar stroke="#000000" strokeWidth={2} />
<Line stroke="#000000" strokeWidth={2} />
```

### Checklist Session 1:

- [ ] Create chart theme constants
- [ ] Create NeoTooltip component
- [ ] Update SubscriberChart
- [ ] Update UserByLevelChart
- [ ] Update UserByDomicileChart
- [ ] Update RevenueChart (if exists)
- [ ] Update PracticeStatsChart
- [ ] Test all charts in dark mode

---

## Session 2: Deck Editing & Tier Sync

### Tasks:

#### 2.1 Fix Deck Difficulty in Admin Edit

**File**: `src/app/admin/(dashboard)/dek/[deckId]/edit/page.tsx`

```tsx
// Ensure difficulty is properly saved
const handleSubmit = async (data: DeckFormData) => {
  const response = await fetch(`/api/decks/${deckId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: data.name,
      description: data.description,
      category: data.category,
      difficulty: data.difficulty, // Make sure this is included!
      isPublic: data.isPublic,
      isActive: data.isActive,
    }),
  });
  // ...
};

// Add difficulty selector
<FormField
  control={form.control}
  name="difficulty"
  render={({ field }) => (
    <FormItem>
      <FormLabel>Difficulty (JLPT Level)</FormLabel>
      <Select onValueChange={field.onChange} value={field.value || ''}>
        <SelectTrigger>
          <SelectValue placeholder="Pilih level" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="N5">N5 - Pemula</SelectItem>
          <SelectItem value="N4">N4 - Dasar</SelectItem>
          <SelectItem value="N3">N3 - Menengah</SelectItem>
          <SelectItem value="N2">N2 - Lanjutan</SelectItem>
          <SelectItem value="N1">N1 - Mahir</SelectItem>
          <SelectItem value="mixed">Campuran</SelectItem>
        </SelectContent>
      </Select>
      <FormMessage />
    </FormItem>
  )}
/>;
```

#### 2.2 Update Deck API to Handle Difficulty

**File**: `src/app/api/decks/[deckId]/route.ts`

```typescript
export async function PUT(request: Request, { params }: { params: { deckId: string } }) {
  // ... auth check

  const body = await request.json();
  const { name, description, category, difficulty, isPublic, isActive } = body;

  const deck = await prisma.deck.update({
    where: { id: params.deckId },
    data: {
      name,
      description,
      category,
      difficulty, // Make sure this is updated!
      isPublic,
      isActive,
    },
  });

  // Log admin action
  await prisma.adminLog.create({
    data: {
      adminId: session.user.id,
      action: 'UPDATE_DECK',
      entityType: 'DECK',
      entityId: deck.id,
      details: JSON.stringify({ name, difficulty }),
    },
  });

  return NextResponse.json(deck);
}
```

#### 2.3 User Tier Synchronization

**Problem**: User has `subscriptionPlan` field AND Subscription model with `tier`.

**Solution**: Single source of truth - use Subscription model, remove/deprecate User.subscriptionPlan.

**File**: `src/lib/subscription/tier-sync.ts`

```typescript
import { prisma } from '../prisma';

// Sync user tier from subscription
export async function syncUserTier(userId: string): Promise<void> {
  const subscription = await prisma.subscription.findUnique({
    where: { userId },
  });

  if (!subscription) {
    // No subscription = FREE tier
    await prisma.user.update({
      where: { id: userId },
      data: { subscriptionPlan: 'free' },
    });
    return;
  }

  // Map subscription tier to user field
  const tierMap: Record<string, string> = {
    FREE: 'free',
    BASIC: 'basic',
    PRO: 'pro',
  };

  await prisma.user.update({
    where: { id: userId },
    data: { subscriptionPlan: tierMap[subscription.tier] || 'free' },
  });
}

// Get effective tier (always from subscription)
export async function getEffectiveTier(userId: string): Promise<string> {
  const subscription = await prisma.subscription.findUnique({
    where: { userId },
    select: { tier: true, status: true },
  });

  // Only return paid tier if subscription is active
  if (subscription && subscription.status === 'ACTIVE') {
    return subscription.tier;
  }

  return 'FREE';
}
```

#### 2.4 Update All Tier Checks

Search and replace all `user.subscriptionPlan` with proper tier check:

**Before:**

```typescript
if (user.subscriptionPlan === 'pro') {
  // allow feature
}
```

**After:**

```typescript
import { getEffectiveTier } from '@/lib/subscription/tier-sync';

const tier = await getEffectiveTier(user.id);
if (tier === 'PRO') {
  // allow feature
}
```

#### 2.5 Admin Subscription Settings Connection

**File**: `src/app/admin/(dashboard)/subskripsi/page.tsx`

Ensure tier config changes are reflected in frontend:

```tsx
// When admin updates tier config
const handleSaveTierConfig = async (tierConfig: TierConfig) => {
  await fetch('/api/admin/subscription/tiers', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(tierConfig),
  });

  // Invalidate cache to refresh frontend
  await fetch('/api/subscription/invalidate-cache', { method: 'POST' });
};
```

**File**: `src/app/api/subscription/route.ts`

Use SubscriptionTierConfig from database:

```typescript
export async function GET() {
  // Get tier config from database (set by admin)
  const tierConfigs = await prisma.subscriptionTierConfig.findMany();

  // Return configs to frontend
  return NextResponse.json({
    tiers: tierConfigs.map(config => ({
      id: config.tier,
      name: config.displayName,
      price: config.price,
      credits: config.monthlyCredits,
      features: config.features,
    })),
  });
}
```

### Checklist Session 2:

- [ ] Fix deck difficulty editing in admin
- [ ] Update deck API to save difficulty
- [ ] Create tier sync utility
- [ ] Update all tier checks to use Subscription model
- [ ] Connect admin subscription settings to frontend
- [ ] Test tier changes reflect immediately
- [ ] Add admin logging for tier config changes

---

## Database Changes

### Migration: Add Difficulty Options

```sql
-- If difficulty values need to be constrained
ALTER TABLE "Deck" ADD CONSTRAINT check_difficulty
CHECK (difficulty IN ('N5', 'N4', 'N3', 'N2', 'N1', 'mixed', NULL));
```

### Data Migration: Sync Existing Users

```typescript
// scripts/sync-user-tiers.ts
async function syncAllUserTiers() {
  const users = await prisma.user.findMany();

  for (const user of users) {
    await syncUserTier(user.id);
    console.log(`Synced tier for user ${user.id}`);
  }
}
```

---

## Files to Modify

### Create:

- [ ] `src/lib/constants/chart-theme.ts`
- [ ] `src/components/admin/charts/NeoTooltip.tsx`
- [ ] `src/lib/subscription/tier-sync.ts`
- [ ] `scripts/sync-user-tiers.ts`

### Modify:

- [ ] `src/components/admin/dashboard/SubscriberChart.tsx`
- [ ] `src/components/admin/dashboard/UserByLevelChart.tsx`
- [ ] `src/components/admin/dashboard/UserByDomicileChart.tsx`
- [ ] `src/app/admin/(dashboard)/dek/[deckId]/edit/page.tsx`
- [ ] `src/app/api/decks/[deckId]/route.ts`
- [ ] `src/app/api/subscription/route.ts`
- [ ] Multiple files using `user.subscriptionPlan`

---

## Testing Checklist

### Charts:

- [ ] All charts have neobrutalism styling
- [ ] Tooltips display correctly
- [ ] Dark mode compatible
- [ ] Responsive on all screen sizes

### Deck Editing:

- [ ] Difficulty saves correctly
- [ ] Difficulty displays in deck list
- [ ] Filter by difficulty works

### Tier Sync:

- [ ] User tier matches subscription
- [ ] Tier changes reflect immediately
- [ ] FREE users handled correctly
- [ ] Expired subscriptions fall back to FREE

---

## Definition of Done

- [ ] All admin charts use neobrutalism style
- [ ] Custom tooltip component created
- [ ] Deck difficulty editable and saves
- [ ] User tier syncs with subscription
- [ ] Admin subscription settings work
- [ ] No tier mismatches in system
- [ ] Dark mode compatible

---

_Plan Version: 1.0_
_Created: 2025-11-27_
