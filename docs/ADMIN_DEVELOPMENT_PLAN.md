# Admin Dashboard - Development Plan

## Overview

Dokumen ini berisi rencana pengembangan detail untuk rombak admin dashboard GengoBot menggunakan template Shadboard.

**Reference Documents**:

- [ADMIN_SITEMAP_FLOW.md](./ADMIN_SITEMAP_FLOW.md) - Sitemap dan User Flows

---

## Project Summary

| Item             | Detail                                                         |
| ---------------- | -------------------------------------------------------------- |
| Template         | [Shadboard by Qualiora](https://github.com/Qualiora/shadboard) |
| Total Pages      | 15 pages                                                       |
| Total Phases     | 5 phases                                                       |
| New Features     | Admin auth, Role-based access, Voice settings, API alerts      |
| Removed Features | Characters page, Google OAuth for admin                        |

---

## Phase 1: Foundation & Setup

### Objectives

- Setup Shadboard template integration
- Implement admin authentication system
- Create admin database model
- Setup base layout and navigation

### Tasks

#### 1.1 Template Setup

```
Files to create/modify:
├── src/app/admin/
│   ├── layout.tsx (update with Shadboard layout)
│   └── AdminLayoutClient.tsx (update)
├── src/components/admin/
│   ├── AdminSidebar.tsx (new - from Shadboard)
│   ├── AdminHeader.tsx (update)
│   └── AdminFooter.tsx (new)
├── src/styles/
│   └── admin-theme.css (new)
└── src/config/
    └── admin-navigation.ts (new)
```

**Deliverables**:

- [ ] Clone Shadboard full-kit structure
- [ ] Integrate Shadboard layout components
- [ ] Setup admin theme configuration
- [ ] Configure sidebar navigation with new menu structure

**Shadboard References**:

- [Layout](https://github.com/Qualiora/shadboard/tree/main/full-kit/src/components/layout)
- [Sidebar](https://github.com/Qualiora/shadboard/tree/main/full-kit/src/navigation/sidebar)

---

#### 1.2 Admin Authentication System

```
Files to create:
├── src/app/admin/auth/
│   ├── login/page.tsx
│   └── forgot-password/page.tsx
├── src/lib/auth/
│   └── admin-auth.ts (new - separate from user auth)
├── src/app/api/admin/auth/
│   ├── login/route.ts
│   ├── logout/route.ts
│   ├── forgot-password/route.ts
│   └── reset-password/route.ts
└── prisma/
    └── schema.prisma (update Admin model)
```

**Deliverables**:

- [ ] Create Admin model in Prisma schema
- [ ] Implement email/password auth (no Google OAuth)
- [ ] Create login page with Shadboard auth template
- [ ] Implement forgot password flow
- [ ] Setup session management for admins
- [ ] Create auth middleware for admin routes

**Database Schema**:

```prisma
model Admin {
  id        String   @id @default(cuid())
  email     String   @unique
  password  String
  name      String
  role      AdminRole @default(ADMIN)
  isActive  Boolean  @default(true)
  lastLogin DateTime?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

enum AdminRole {
  SUPER_ADMIN
  ADMIN
  VIEWER
}
```

**Shadboard References**:

- [Auth Pages](<https://github.com/Qualiora/shadboard/tree/main/full-kit/src/app/%5Blang%5D/(plain-layout)>)

---

#### 1.3 Role-Based Access Control

```
Files to create:
├── src/lib/auth/
│   └── admin-rbac.ts (new)
├── src/middleware/
│   └── admin-auth.ts (update)
└── src/hooks/
    └── useAdminRole.ts (new)
```

**Deliverables**:

- [ ] Create RBAC middleware
- [ ] Implement permission checking utilities
- [ ] Create useAdminRole hook for client-side checks
- [ ] Setup route protection based on roles

**Permission Matrix Implementation**:

```typescript
const permissions = {
  SUPER_ADMIN: ['*'],
  ADMIN: [
    'dashboard.view',
    'statistik.view',
    'statistik.export',
    'pengguna.view',
    'tasks.manage',
    'categories.manage',
    'decks.manage',
  ],
  VIEWER: ['dashboard.view', 'statistik.view', 'statistik.export', 'pengguna.view'],
};
```

---

#### 1.4 Dependencies Update

```
package.json additions:
├── react: "19.x" (if upgrading)
├── next: "15.x" (if upgrading)
├── recharts: "2.x"
├── @tanstack/react-table: "8.x"
├── xlsx: "latest" (for Excel export)
├── bcryptjs: "latest" (for password hashing)
└── zustand: "5.x" (state management)
```

**Deliverables**:

- [ ] Update/add required dependencies
- [ ] Resolve any version conflicts
- [ ] Test build after dependency updates

---

### Phase 1 Checklist

| Task                 | Priority | Status |
| -------------------- | -------- | ------ |
| Template setup       | High     | ⬜     |
| Admin model creation | High     | ⬜     |
| Login page           | High     | ⬜     |
| Forgot password      | Medium   | ⬜     |
| RBAC implementation  | High     | ⬜     |
| Sidebar navigation   | High     | ⬜     |
| Dependencies update  | High     | ⬜     |

---

## Phase 2: Dashboard & Analytics

### Objectives

- Build main dashboard with analytics summary
- Implement multi-tab Statistik page
- Setup Excel export functionality
- Implement API usage alerts

### Tasks

#### 2.1 Dashboard Page (`/admin`)

```
Files to create/modify:
├── src/app/admin/page.tsx (complete rewrite)
├── src/components/admin/dashboard/
│   ├── RevenueCard.tsx
│   ├── SubscriberChart.tsx
│   ├── ActiveUsersCard.tsx
│   ├── UserByLevelChart.tsx
│   ├── UserByDomicileChart.tsx
│   ├── EarningReportsCard.tsx
│   ├── APIUsageAlert.tsx
│   └── RecentSubscribers.tsx
└── src/app/api/admin/analytics/
    └── dashboard/route.ts
```

**Deliverables**:

- [ ] Revenue metrics card (Rupiah)
- [ ] Subscribers by tier chart (Free/Basic/Pro)
- [ ] Active users card (30d)
- [ ] User by level pie/bar chart (N5-N1)
- [ ] User by domicile map/bar chart
- [ ] Earnings, Profit, Expense cards
- [ ] API usage alert (>80% warning)
- [ ] Recent subscribers table (last 10)

**Shadboard References**:

- [Analytics Dashboard](<https://github.com/Qualiora/shadboard/tree/main/full-kit/src/app/%5Blang%5D/(dashboard-layout)/dashboards/analytics>)
- [Dashboard Components](https://github.com/Qualiora/shadboard/tree/main/full-kit/src/components/dashboards)

---

#### 2.2 Statistik Page (`/admin/statistik`)

```
Files to create:
├── src/app/admin/statistik/page.tsx
├── src/components/admin/statistik/
│   ├── UserAnalyticsTab.tsx
│   ├── EarningReportsTab.tsx
│   ├── PracticeStatsTab.tsx
│   ├── ResearchTab.tsx
│   ├── DetailedUserTable.tsx
│   └── ExportButton.tsx
└── src/app/api/admin/analytics/
    ├── users/route.ts
    ├── earnings/route.ts
    ├── practices/route.ts
    └── export/route.ts
```

**Deliverables**:

**Tab 1: Pengguna**

- [ ] User demographics charts (proficiency, age, gender, domicile, institution)
- [ ] Learning profile charts
- [ ] Japan experience data
- [ ] Detailed user table with filters
- [ ] Export to Excel button

**Tab 2: Pendapatan**

- [ ] Revenue metrics with charts
- [ ] Expense breakdown (API usage)
- [ ] Subscription metrics by tier
- [ ] Recent subscribers table
- [ ] Export to Excel button

**Tab 3: Praktik**

- [ ] Roleplay task statistics table
- [ ] Chat practice stats (Free chat, Realtime)
- [ ] Deck statistics (Admin vs User)

**Tab 4: Riset**

- [ ] Export buttons for all data types
- [ ] Placeholder for future features

---

#### 2.3 Excel Export Service

```
Files to create:
├── src/lib/admin/
│   └── excel-export.ts
└── src/app/api/admin/analytics/
    └── export/route.ts
```

**Deliverables**:

- [ ] User analytics export (demographics, metrics)
- [ ] Earnings export (revenue, expenses, subscribers)
- [ ] Practice stats export
- [ ] Formatted Excel with multiple sheets

---

#### 2.4 API Usage Alert System

```
Files to create:
├── src/lib/admin/
│   └── api-usage-tracker.ts
└── src/components/admin/
    └── APIUsageAlert.tsx
```

**Deliverables**:

- [ ] Track OpenAI API token usage
- [ ] Calculate cost in Rupiah
- [ ] Alert component for >80% threshold
- [ ] Display on dashboard

---

### Phase 2 Checklist

| Task                     | Priority | Status |
| ------------------------ | -------- | ------ |
| Dashboard page           | High     | ⬜     |
| Revenue/Subscriber cards | High     | ⬜     |
| User demographics charts | Medium   | ⬜     |
| Statistik tabs           | High     | ⬜     |
| User analytics tab       | High     | ⬜     |
| Earning reports tab      | High     | ⬜     |
| Practice stats tab       | Medium   | ⬜     |
| Excel export             | High     | ⬜     |
| API usage alert          | Medium   | ⬜     |

---

## Phase 3: Content Management

### Objectives

- Implement new Task editor with prompt & voice
- Update Category management (move to Roleplay submenu)
- Update Deck management (admin only)
- Setup audio file management

### Tasks

#### 3.1 Roleplay Tasks (`/admin/roleplay/tasks`)

```
Files to create/modify:
├── src/app/admin/roleplay/
│   ├── tasks/
│   │   ├── page.tsx
│   │   ├── new/page.tsx
│   │   └── [taskId]/
│   │       └── edit/page.tsx
│   └── category/
│       └── page.tsx
├── src/components/admin/
│   ├── TaskEditorForm.tsx (major update)
│   ├── VoiceSelector.tsx (new)
│   ├── AudioUploader.tsx (new)
│   └── PromptEditor.tsx (new)
└── prisma/
    └── schema.prisma (update Task model)
```

**Database Schema Update**:

```prisma
model Task {
  // existing fields...

  // Remove
  // characterId String?

  // Add
  prompt        String    @db.Text
  voice         String    @default("alloy")
  speakingSpeed Float     @default(1.0)
  audioExample  String?   // path to audio file
}
```

**Deliverables**:

- [ ] Update Task model (remove characterId, add prompt/voice/speed)
- [ ] Create new TaskEditorForm with 12 fields
- [ ] Implement VoiceSelector with audio preview
- [ ] Create AudioUploader for conversation example
- [ ] Setup PromptEditor with syntax highlighting
- [ ] Remove statistics from task list
- [ ] Migration script for existing tasks

---

#### 3.2 Voice Selector Component

```
Files to create:
├── src/components/admin/
│   └── VoiceSelector.tsx
└── public/audio/voices/
    ├── alloy-sample.mp3
    ├── ash-sample.mp3
    ├── ballad-sample.mp3
    ├── coral-sample.mp3
    ├── echo-sample.mp3
    ├── fable-sample.mp3
    ├── nova-sample.mp3
    ├── onyx-sample.mp3
    ├── sage-sample.mp3
    └── shimmer-sample.mp3
```

**Deliverables**:

- [ ] Voice dropdown with 10 OpenAI voices
- [ ] Audio preview player for each voice
- [ ] Speaking speed slider (0.25 - 4.0)
- [ ] Voice description tooltips

**Voice Samples Required** (to be provided by user):

- alloy-sample.mp3
- ash-sample.mp3
- ballad-sample.mp3
- coral-sample.mp3
- echo-sample.mp3
- fable-sample.mp3
- nova-sample.mp3
- onyx-sample.mp3
- sage-sample.mp3
- shimmer-sample.mp3

---

#### 3.3 Category Management (`/admin/roleplay/category`)

```
Files to modify:
├── src/app/admin/roleplay/category/page.tsx (move from /admin/categories)
└── src/components/admin/
    └── CategoryTree.tsx (update)
```

**Deliverables**:

- [ ] Move categories to roleplay submenu
- [ ] Update navigation
- [ ] Keep existing functionality

---

#### 3.4 Deck Management (`/admin/dek`)

```
Files to create/modify:
├── src/app/admin/dek/
│   ├── page.tsx (update - filter admin only)
│   ├── new/page.tsx
│   └── [deckId]/
│       └── edit/page.tsx
└── src/app/api/admin/decks/
    └── route.ts (update filter)
```

**Deliverables**:

- [ ] Filter to show only admin-created decks
- [ ] Remove statistics from list
- [ ] Keep existing CRUD functionality
- [ ] Update API to filter by creator

---

### Phase 3 Checklist

| Task                     | Priority | Status |
| ------------------------ | -------- | ------ |
| Task model update        | High     | ⬜     |
| TaskEditorForm rewrite   | High     | ⬜     |
| VoiceSelector component  | High     | ⬜     |
| Voice sample files       | High     | ⬜     |
| AudioUploader component  | Medium   | ⬜     |
| PromptEditor component   | High     | ⬜     |
| Move categories          | Medium   | ⬜     |
| Deck filter (admin only) | Medium   | ⬜     |
| Migration script         | High     | ⬜     |

---

## Phase 4: Business Features

### Objectives

- Implement subscription tier price editor
- Move vouchers to subscription submenu
- Create admin management system
- Setup pengguna read-only view

### Tasks

#### 4.1 Subscription Settings (`/admin/subskripsi/setting`)

```
Files to create:
├── src/app/admin/subskripsi/
│   ├── page.tsx (redirect to setting)
│   ├── setting/page.tsx
│   └── voucher/
│       ├── page.tsx (move from /admin/vouchers)
│       ├── new/page.tsx
│       └── [id]/page.tsx
├── src/components/admin/
│   └── TierPriceEditor.tsx
├── src/app/api/admin/subscription/
│   └── tiers/route.ts
└── prisma/
    └── schema.prisma (add SubscriptionTier model)
```

**Database Schema**:

```prisma
model SubscriptionTier {
  id           String   @id @default(cuid())
  name         TierName @unique
  priceMonthly Int      // in Rupiah
  priceAnnual  Int      // in Rupiah
  features     String[] // feature list
  isActive     Boolean  @default(true)
  updatedAt    DateTime @updatedAt
}

enum TierName {
  FREE
  BASIC
  PRO
}
```

**Deliverables**:

- [ ] Create SubscriptionTier model
- [ ] Tier price editor page
- [ ] Monthly/Annual price inputs
- [ ] Features checklist editor
- [ ] Move voucher pages to subskripsi/voucher
- [ ] Update navigation

**Shadboard References**:

- [Pricing Page](<https://github.com/Qualiora/shadboard/tree/main/full-kit/src/app/%5Blang%5D/(dashboard-layout)/pages/pricing>)

---

#### 4.2 Admin Management (`/admin/admins`)

```
Files to create:
├── src/app/admin/admins/
│   ├── list/page.tsx
│   └── profile/page.tsx
├── src/components/admin/
│   ├── AdminList.tsx
│   ├── AdminForm.tsx
│   └── ProfileSettings.tsx
└── src/app/api/admin/admins/
    ├── route.ts
    ├── [id]/route.ts
    ├── profile/route.ts
    └── change-password/route.ts
```

**Deliverables**:

- [ ] Admin list page with table
- [ ] Create admin form (Super Admin only)
- [ ] Edit admin (roles, status)
- [ ] Delete admin (with protection)
- [ ] My profile page
- [ ] Change password functionality
- [ ] Role-based UI (hide create for non-super-admin)

**Shadboard References**:

- [Profile Page](<https://github.com/Qualiora/shadboard/tree/main/full-kit/src/app/%5Blang%5D/(dashboard-layout)/pages/account/profile>)
- [Settings Page](<https://github.com/Qualiora/shadboard/tree/main/full-kit/src/app/%5Blang%5D/(dashboard-layout)/pages/account/settings>)

---

#### 4.3 Pengguna Page (`/admin/pengguna`)

```
Files to create:
├── src/app/admin/pengguna/page.tsx
└── src/components/admin/
    └── UserReadOnlyTable.tsx
```

**Deliverables**:

- [ ] Read-only user list
- [ ] Quick stats (total, active, new)
- [ ] Filters (search, level, tier, date)
- [ ] No edit actions

---

### Phase 4 Checklist

| Task                   | Priority | Status |
| ---------------------- | -------- | ------ |
| SubscriptionTier model | High     | ⬜     |
| Tier price editor      | High     | ⬜     |
| Move vouchers          | Medium   | ⬜     |
| Admin list page        | High     | ⬜     |
| Create admin form      | High     | ⬜     |
| Profile page           | Medium   | ⬜     |
| Change password        | Medium   | ⬜     |
| Pengguna page          | Medium   | ⬜     |

---

## Phase 5: Polish & Testing

### Objectives

- Remove deprecated features
- Responsive optimization
- Performance tuning
- Comprehensive testing
- Documentation update

### Tasks

#### 5.1 Remove Deprecated Features

```
Files to delete:
├── src/app/admin/characters/ (entire folder)
├── src/app/admin/users/ (rename to pengguna or remove)
├── src/app/admin/analytics/ (merged to statistik)
├── src/app/admin/settings/ (replaced by profile)
└── src/components/admin/
    └── CharacterForm.tsx (if exists)
```

**Deliverables**:

- [ ] Delete characters page and components
- [ ] Remove old analytics page
- [ ] Remove old settings page
- [ ] Update all imports and references
- [ ] Clean up unused API routes

---

#### 5.2 Responsive Optimization

```
Files to review:
├── All admin pages
├── All admin components
└── Mobile navigation
```

**Deliverables**:

- [ ] Test all pages on mobile/tablet
- [ ] Optimize tables for mobile
- [ ] Collapsible sidebar on mobile
- [ ] Touch-friendly controls

---

#### 5.3 Performance Tuning

```
Areas to optimize:
├── Chart loading (lazy load)
├── Table pagination
├── Image optimization
└── API response caching
```

**Deliverables**:

- [ ] Implement lazy loading for charts
- [ ] Add pagination to all tables
- [ ] Optimize API queries
- [ ] Add loading states
- [ ] Implement caching where appropriate

---

#### 5.4 Testing

```
Test coverage:
├── Unit tests for utilities
├── Integration tests for API
├── E2E tests for critical flows
└── RBAC permission tests
```

**Critical Flows to Test**:

- [ ] Admin login/logout
- [ ] Create/edit task with new fields
- [ ] Role-based access (all 3 roles)
- [ ] Excel export
- [ ] Subscription price update
- [ ] Admin CRUD operations

---

#### 5.5 Documentation Update

```
Files to update:
├── docs/ADMIN_SITEMAP_FLOW.md (final review)
├── docs/README.md (add admin section)
└── docs/API.md (add admin endpoints)
```

**Deliverables**:

- [ ] Update sitemap with final routes
- [ ] Document all API endpoints
- [ ] Add deployment notes
- [ ] Create admin user guide

---

### Phase 5 Checklist

| Task                     | Priority | Status |
| ------------------------ | -------- | ------ |
| Remove characters        | High     | ✅     |
| Remove old pages         | High     | ✅     |
| Responsive testing       | High     | ✅     |
| Performance optimization | Medium   | ✅     |
| Unit tests               | Medium   | ✅     |
| E2E tests                | High     | ✅     |
| RBAC tests               | High     | ✅     |
| Documentation            | Medium   | ✅     |

---

## Migration Checklist

### Database Migrations

| Migration              | Phase | Description                                          |
| ---------------------- | ----- | ---------------------------------------------------- |
| CreateAdminModel       | 1     | Create Admin table with roles                        |
| UpdateTaskModel        | 3     | Add prompt, voice, speakingSpeed; remove characterId |
| CreateSubscriptionTier | 4     | Create tier pricing table                            |
| SeedDefaultTiers       | 4     | Seed FREE, BASIC, PRO tiers                          |
| MigrateExistingTasks   | 3     | Set default prompt/voice for existing tasks          |

### Data Migration Scripts

```bash
# Phase 1: Create first super admin
npx prisma db seed -- --admin

# Phase 3: Migrate existing tasks
npx tsx scripts/migrate-tasks-to-prompts.ts

# Phase 4: Seed subscription tiers
npx tsx scripts/seed-subscription-tiers.ts
```

---

## Risk Assessment

| Risk                        | Impact | Mitigation                                     |
| --------------------------- | ------ | ---------------------------------------------- |
| Shadboard version conflicts | High   | Lock dependency versions                       |
| Existing task data loss     | High   | Backup before migration, test migration script |
| Auth system conflicts       | High   | Separate admin auth from user auth             |
| Performance degradation     | Medium | Implement lazy loading, pagination             |
| Role-based bugs             | High   | Comprehensive RBAC testing                     |

---

## Success Criteria

### Phase Completion Requirements

**Phase 1**: ✅ when

- Admin can login with email/password
- Sidebar shows new menu structure
- RBAC blocks unauthorized access

**Phase 2**: ✅ when

- Dashboard shows all metrics
- All 4 statistik tabs functional
- Excel export works

**Phase 3**: ✅ when

- Task editor has all 12 fields
- Voice selector plays samples
- Audio upload works
- Existing tasks migrated

**Phase 4**: ✅ when

- Tier prices editable
- Admin CRUD works
- Profile/password change works

**Phase 5**: ✅ when

- All deprecated pages removed
- All tests pass
- Responsive on all devices

---

## Dependencies & Prerequisites

### Before Starting

1. **Voice Samples**: 10 MP3 files needed from user
2. **Shadboard License**: MIT (free to use)
3. **Database Backup**: Full backup before any migration
4. **Environment Setup**: Separate admin auth credentials

### External Dependencies

| Service    | Purpose            | Required |
| ---------- | ------------------ | -------- |
| OpenAI TTS | Voice generation   | Yes      |
| Midtrans   | Payment processing | Existing |
| Supabase   | Database           | Existing |

---

## Version

- **Document Version**: 1.0
- **Last Updated**: 2024-11-24
- **Author**: GengoBot Team
- **Status**: Ready for Implementation
