# Admin Dashboard - Sitemap & User Flow (Revisi)

## Overview

Dokumen ini berisi sitemap lengkap, user flow, dan rencana implementasi untuk admin dashboard GengoBot yang dirombak menggunakan template **Shadboard**.

**Template Reference**: [Shadboard by Qualiora](https://github.com/Qualiora/shadboard)

---

## Perubahan Utama

| Aspek        | Sebelum           | Sesudah                                        |
| ------------ | ----------------- | ---------------------------------------------- |
| Dashboard    | Quick links       | Analytics summary                              |
| Analytics    | Single page       | Multi-tab (User, Earning, Practices, Research) |
| Users        | User management   | Dihapus (diganti Admins)                       |
| Tasks        | Premade character | Editable prompt + voice selection              |
| Characters   | Separate page     | Dihapus (user buat sendiri)                    |
| Subscription | Metrics only      | + Price editor + Voucher submenu               |
| Settings     | System settings   | Profile settings untuk admin                   |
| Auth         | Google OAuth      | Email/Password only                            |

---

## Sitemap Admin (Baru)

### Route Structure

```
/admin/auth                     → Admin Authentication
├── /admin/auth/login           → Login (email/password only)
└── /admin/auth/forgot-password → Reset Password

/admin                          → Dashboard (Analytics Summary)
│
├── /admin/statistik            → Statistik (Multi-tab Analytics)
│   ├── Tab: Pengguna           → User Analytics
│   ├── Tab: Pendapatan         → Earning Reports
│   ├── Tab: Praktik            → Practice Statistics
│   └── Tab: Riset              → Research (Placeholder)
│
├── /admin/pengguna             → User Read-Only View
│
├── /admin/roleplay             → Roleplay Management
│   ├── /admin/roleplay/tasks   → Task List
│   │   ├── /admin/roleplay/tasks/new       → Create Task
│   │   └── /admin/roleplay/tasks/[taskId]  → Edit Task
│   │       └── /admin/roleplay/tasks/[taskId]/edit
│   │
│   └── /admin/roleplay/category → Category Management
│
├── /admin/dek                  → Deck Management (Admin only)
│   ├── /admin/dek/new          → Create Deck
│   └── /admin/dek/[deckId]     → View/Edit Deck
│       └── /admin/dek/[deckId]/edit
│
├── /admin/subskripsi           → Subscription Management
│   ├── /admin/subskripsi/setting  → Tier Price Settings
│   └── /admin/subskripsi/voucher  → Voucher Management
│       ├── /admin/subskripsi/voucher/new    → Create Voucher
│       └── /admin/subskripsi/voucher/[id]   → Edit Voucher
│
└── /admin/admins               → Admin Management
    ├── /admin/admins/list      → Admin List
    └── /admin/admins/profile   → My Profile Settings
```

---

## Detail Setiap Section

### 1. Dashboard (`/admin`)

**Fungsi**: Analytics summary sebagai halaman utama

**Layout**: Grid dengan 4 sections utama

```
┌─────────────────────────────────────────────────────────┐
│ TOP ROW: Key Metrics Cards                              │
├─────────────┬─────────────┬─────────────┬───────────────┤
│ Total       │ Subscriber  │ Active      │ Monthly       │
│ Revenue     │ by Tier     │ Users       │ Growth        │
│ (Rupiah)    │ (Chart)     │ (30d)       │ (%)           │
└─────────────┴─────────────┴─────────────┴───────────────┘

┌─────────────────────────────────────────────────────────┐
│ SECOND ROW: User Demographics                           │
├──────────────────────────┬──────────────────────────────┤
│ User by Level            │ User by Domicile             │
│ (Pie/Bar Chart)          │ (Map or Bar Chart)           │
│ - N5, N4, N3, N2, N1     │ - Top 10 cities/regions      │
└──────────────────────────┴──────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│ THIRD ROW: Earning Reports                              │
├─────────────┬─────────────┬─────────────────────────────┤
│ Earnings    │ Profit      │ Expense (API Usage)         │
│ (Rupiah)    │ (Rupiah)    │ - OpenAI tokens             │
│             │             │ - Other services            │
│             │             │ ⚠️ Alert if >80% budget     │
└─────────────┴─────────────┴─────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│ BOTTOM ROW: Recent Activity                             │
├─────────────────────────────────────────────────────────┤
│ Recent Subscribers                                      │
│ - Name, Email, Tier, Date                               │
│ - Last 10 subscribers                                   │
└─────────────────────────────────────────────────────────┘
```

**Shadboard Reference Files**:

- Layout: [full-kit/src/app/[lang]/(dashboard-layout)/dashboards/analytics](<https://github.com/Qualiora/shadboard/tree/main/full-kit/src/app/%5Blang%5D/(dashboard-layout)/dashboards/analytics>)
- Stats Cards: [full-kit/src/components/dashboards](https://github.com/Qualiora/shadboard/tree/main/full-kit/src/components/dashboards)
- Charts: menggunakan Recharts dari Shadboard

---

### 2. Statistik (`/admin/statistik`)

**Fungsi**: Multi-tab analytics komprehensif

#### Tab 1: Pengguna (User Analytics)

**Export**: Excel (.xlsx) - User demographics, learning profile, detailed metrics

```
├── User Demographics
│   ├── proficiency (N5, N4, N3, N2, N1)
│   ├── ageRange (distribusi umur)
│   ├── gender (pie chart)
│   ├── domicile (map)
│   └── institution (sekolah/universitas/umum)
│
├── Learning Profile
│   ├── learningDuration (berapa lama belajar)
│   ├── learningGoals (tujuan belajar)
│   ├── japaneseUsageOpportunities (kesempatan pakai)
│   ├── hasAppExperience (pernah pakai app)
│   ├── previousApps (app apa saja)
│   └── conversationPracticeExp (pengalaman praktek)
│
├── Japan Experience
│   ├── hasLivedInJapan (boolean)
│   ├── japanStayDuration (durasi)
│   └── appOpinion (feedback)
│
└── Detailed User Analytics (Table)
    ├── Per person metrics:
    │   ├── Kaiwa practice time (minutes)
    │   ├── Cards reviewed (count)
    │   ├── Tasks completed (count)
    │   └── Last active
    └── Filters: Date range, Level, Activity
```

#### Tab 2: Pendapatan (Earning Reports)

**Export**: Excel (.xlsx) - Revenue, expenses, subscriber list

```
├── Revenue Metrics
│   ├── Total Earnings (all time, Rupiah)
│   ├── Monthly Earnings (chart over time)
│   ├── Profit (Earnings - Expenses)
│   └── Growth rate (%)
│
├── Expense Breakdown
│   ├── API Usage (OpenAI, etc.)
│   │   ├── Total tokens used
│   │   ├── Cost per token
│   │   └── Monthly trend
│   └── Other services
│
├── Subscription Metrics
│   ├── Total Subscribers by Tier
│   │   ├── Free (count, %)
│   │   ├── Basic (count, %, revenue)
│   │   └── Pro (count, %, revenue)
│   ├── Active Users (30d)
│   └── Churn rate
│
└── Recent Subscribers (Table)
    ├── Name
    ├── Email
    ├── Tier
    ├── Amount paid
    └── Date subscribed
```

#### Tab 3: Praktik (Practice Statistics)

```
├── Roleplay Tasks Stats
│   └── Per task:
│       ├── Task name
│       ├── Completed count
│       ├── Total minutes practiced
│       └── Average score
│
├── Chat Practice Stats
│   ├── Free Chat
│   │   ├── Total sessions
│   │   └── Total minutes practiced
│   └── Realtime Chat
│       ├── Total sessions
│       └── Total minutes practiced
│
└── Deck Statistics
    ├── Admin Decks
    │   ├── Total count
    │   └── Cards count
    └── User Decks
        ├── Total count
        └── Cards count
```

#### Tab 4: Riset (Research - Placeholder)

```
├── Research Data Export
│   ├── Export user analytics (CSV)
│   ├── Export practice data (CSV)
│   └── Export survey responses (CSV)
│
└── Future Features
    ├── Custom queries
    ├── Data visualization builder
    └── Research consent management
```

**Shadboard Reference Files**:

- Tabs: [full-kit/src/components/ui](https://github.com/Qualiora/shadboard/tree/main/full-kit/src/components/ui) (Tabs component)
- Charts: Recharts integration
- Tables: TanStack Table

---

### 3. Pengguna (`/admin/pengguna`)

**Fungsi**: Read-only view data pengguna (tidak ada management karena user tidak perlu diatur)

```
├── Quick Stats
│   ├── Total Users
│   ├── Active Users (30d)
│   └── New Users (this month)
│
├── Filters
│   ├── Search (name/email)
│   ├── Level (N5-N1)
│   ├── Tier (Free, Basic, Pro)
│   └── Date range
│
└── User Table (Read-only)
    ├── Name
    ├── Email
    ├── Level
    ├── Tier
    ├── Tasks Completed
    ├── Cards Learned
    ├── Practice Time
    └── Last Active
```

---

### 4. Roleplay Tasks (`/admin/roleplay/tasks`)

**Fungsi**: Manage roleplay/conversation tasks dengan editable prompt

**Perubahan Utama**:

- Tidak ada statistik di list (dipindah ke Statistik > Praktik)
- Menggunakan editable prompt, bukan premade character
- Ada pilihan voice untuk setiap task

```
├── Controls
│   ├── Search
│   ├── Difficulty Filter
│   ├── Category Filter
│   ├── Import Excel Button
│   ├── Export Button
│   └── Create New Task
│
└── Task Table
    ├── Title
    ├── Category
    ├── Difficulty
    ├── Voice (e.g., alloy, echo, nova)
    ├── Status (Active/Inactive)
    └── Actions (Edit, Delete)
```

#### Task Editor (`/admin/roleplay/tasks/[taskId]/edit`)

**Form Fields** (urutan sesuai UI):

```
├── 1. Title (text input) *
│   └── Judul task
│
├── 2. Description (textarea) *
│   └── Deskripsi singkat task
│
├── 3. Category & Subcategory
│   ├── Category (select) *
│   └── Subcategory (select, filtered by category)
│
├── 4. Difficulty Level (select) *
│   └── N5, N4, N3, N2, N1
│
├── 5. Scenario (textarea) *
│   └── Situasi/konteks percakapan
│
├── 6. Learning Objectives (array of text inputs) *
│   └── Multiple objectives dengan add/remove buttons
│
├── 7. Conversation Example (textarea) *
│   ├── Dialog format: T: teacher, G: student
│   └── Audio Preview (audio player) [NEW]
│       └── Upload: public/audio/tasks/[taskId]/example.mp3
│
├── 8. Estimated Duration (number input) *
│   └── Duration dalam menit
│
├── 9. Prompt (textarea, large) [NEW - replaces Character]
│   └── System prompt untuk AI
│
├── 10. Voice Settings [NEW - replaces Character]
│   ├── Voice Selection (dropdown with audio preview)
│   │   ├── alloy - Preview: public/audio/voices/alloy-sample.mp3
│   │   ├── ash - Preview: public/audio/voices/ash-sample.mp3
│   │   ├── ballad - Preview: public/audio/voices/ballad-sample.mp3
│   │   ├── coral - Preview: public/audio/voices/coral-sample.mp3
│   │   ├── echo - Preview: public/audio/voices/echo-sample.mp3
│   │   ├── fable - Preview: public/audio/voices/fable-sample.mp3
│   │   ├── nova - Preview: public/audio/voices/nova-sample.mp3
│   │   ├── onyx - Preview: public/audio/voices/onyx-sample.mp3
│   │   ├── sage - Preview: public/audio/voices/sage-sample.mp3
│   │   └── shimmer - Preview: public/audio/voices/shimmer-sample.mp3
│   └── Speaking Speed (slider: 0.25 - 4.0, default 1.0)
│
├── 11. Study Decks (multi-select)
│   └── Link ke deck terkait untuk vocabulary
│
└── 12. Active Status (checkbox)
    └── Visible to users
```

**Perubahan dari Original**:

- ❌ Dihapus: `characterId` (Character selection)
- ✅ Ditambah: `prompt` (System prompt untuk AI)
- ✅ Ditambah: `voice` (Voice selection)
- ✅ Ditambah: `speakingSpeed` (Speaking speed slider)
- ✅ Ditambah: Audio preview untuk conversation example

### Voice Sample Files Location

Simpan file sample suara di:

```
public/
└── audio/
    └── voices/
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

**OpenAI TTS Voices Reference**:
| Voice | Description | Character |
|-------|-------------|-----------|
| alloy | Neutral, balanced | General purpose |
| ash | Warm, conversational | Friendly |
| ballad | Expressive, emotional | Storytelling |
| coral | Clear, professional | Formal |
| echo | Resonant, deep | Authoritative |
| fable | Expressive, animated | Engaging |
| nova | Friendly, conversational | Casual |
| onyx | Deep, rich | Serious |
| sage | Calm, composed | Educational |
| shimmer | Soft, gentle | Approachable |

**Shadboard Reference Files**:

- Forms: [full-kit/src/components/ui](https://github.com/Qualiora/shadboard/tree/main/full-kit/src/components/ui) - Form components with React Hook Form + Zod

---

### 5. Category Management (`/admin/roleplay/category`)

**Fungsi**: Hierarchical category untuk tasks (sebagai submenu dari Roleplay)

**Konten**: Sama seperti sebelumnya

```
├── Category Tree View
│   └── Category
│       ├── Subcategory 1 (task count)
│       ├── Subcategory 2 (task count)
│       └── ...
│
└── Actions
    ├── Create Category/Subcategory
    ├── Edit
    └── Delete (prevented if has tasks)
```

---

### 6. Deck Management (`/admin/dek`)

**Fungsi**: Manage flashcard decks (hanya deck admin)

**Perubahan**:

- Tidak ada statistik di list
- Hanya menampilkan deck buatan admin (filter: `createdBy: 'admin'`)

```
├── Controls
│   ├── Search
│   ├── Difficulty Filter
│   ├── Category Filter
│   ├── Import Excel Button
│   ├── Export Button
│   └── Create New Deck
│
└── Deck Table
    ├── Name
    ├── Category
    ├── Difficulty
    ├── Card Count
    ├── Status (Active/Inactive)
    └── Actions (View, Edit, Duplicate, Export, Delete)
```

---

### 7. Subscription (`/admin/subskripsi`)

**Fungsi**: Subscription management dengan price editor

#### Setting (`/admin/subskripsi/setting`)

```
├── Tier Configuration
│   ├── Free Tier
│   │   ├── Price: Rp 0 (locked)
│   │   └── Features checklist
│   │
│   ├── Basic Tier
│   │   ├── Price (editable, Rupiah)
│   │   ├── Monthly / Annual toggle
│   │   └── Features checklist
│   │
│   └── Pro Tier
│       ├── Price (editable, Rupiah)
│       ├── Monthly / Annual toggle
│       └── Features checklist
│
├── Payment Settings
│   ├── Midtrans configuration
│   ├── Currency (IDR)
│   └── Tax settings
│
└── Trial Settings
    ├── Trial duration (days)
    └── Trial features
```

**Shadboard Reference Files**:

- Pricing: [full-kit/src/app/[lang]/(dashboard-layout)/pages/pricing](<https://github.com/Qualiora/shadboard/tree/main/full-kit/src/app/%5Blang%5D/(dashboard-layout)/pages/pricing>)
- Forms: React Hook Form + Zod

#### Voucher (`/admin/subskripsi/voucher`)

**Konten**: Sama seperti sebelumnya (dipindah sebagai submenu)

```
├── Voucher List
│   ├── Code
│   ├── Name
│   ├── Type
│   ├── Value
│   ├── Usage Count
│   ├── Status
│   └── Actions
│
└── Voucher Types
    ├── PERCENTAGE
    ├── FIXED_AMOUNT
    ├── BONUS_CREDITS
    ├── TRIAL_EXTENSION
    └── TIER_UPGRADE
```

---

### 8. Admin Management (`/admin/admins`)

**Fungsi**: Manage admin accounts

#### Admin List (`/admin/admins/list`)

```
├── Admin Table
│   ├── Name
│   ├── Email
│   ├── Role (Super Admin / Admin)
│   ├── Last Login
│   ├── Status
│   └── Actions (Edit, Deactivate, Delete)
│
└── Actions
    ├── Create New Admin
    └── Bulk actions
```

#### Create/Edit Admin

```
├── Basic Info
│   ├── Name
│   ├── Email
│   └── Role (Super Admin / Admin)
│
└── Credentials
    ├── Password
    └── Confirm Password
```

#### My Profile (`/admin/admins/profile`)

```
├── Profile Info
│   ├── Name
│   ├── Email (read-only)
│   └── Avatar
│
├── Change Password
│   ├── Current Password
│   ├── New Password
│   └── Confirm Password
│
└── Security
    ├── 2FA Settings
    └── Active Sessions
```

**Shadboard Reference Files**:

- Profile: [full-kit/src/app/[lang]/(dashboard-layout)/pages/account/profile](<https://github.com/Qualiora/shadboard/tree/main/full-kit/src/app/%5Blang%5D/(dashboard-layout)/pages/account/profile>)
- Settings: [full-kit/src/app/[lang]/(dashboard-layout)/pages/account/settings](<https://github.com/Qualiora/shadboard/tree/main/full-kit/src/app/%5Blang%5D/(dashboard-layout)/pages/account/settings>)

---

## Authentication System

### Admin Auth Flow

**Perubahan Utama**:

- Admin login dengan email/password ONLY (tidak ada Google OAuth)
- Tidak ada pendaftaran admin (harus dibuat oleh admin lain)
- Session-based authentication

```
┌─────────────────────────────────────┐
│ /admin/auth/login                   │
├─────────────────────────────────────┤
│ Email: [___________________]        │
│ Password: [___________________]     │
│                                     │
│ [Forgot Password?]                  │
│                                     │
│ [        Login        ]             │
└─────────────────────────────────────┘
```

### Auth Flow

```
Admin Login → Email/Password Auth → Session Create → Redirect to Dashboard
                                           ↓
                                    (Invalid)
                                           ↓
                                    Error Message

Create Admin → Super Admin Only → Set Email/Password → Send Credentials to Admin
```

**Shadboard Reference Files**:

- Auth: [full-kit/src/app/[lang]/(plain-layout)/(auth)](<https://github.com/Qualiora/shadboard/tree/main/full-kit/src/app/%5Blang%5D/(plain-layout)>)
- NextAuth.js integration

---

## Navigation Structure

### Sidebar Menu (Baru)

```
┌─────────────────────────┐
│ GengoBot Admin          │
├─────────────────────────┤
│ ▶ Dashboard             │
│ ▶ Statistik             │
│ ▶ Pengguna              │
│ ▶ Roleplay              │
│   ├─ Tasks              │
│   └─ Category           │
│ ▶ Dek Belajar           │
│ ▶ Subskripsi            │
│   ├─ Setting            │
│   └─ Voucher            │
│ ▶ Admins                │
│   ├─ Admin List         │
│   └─ My Profile         │
└─────────────────────────┘
```

**Shadboard Reference Files**:

- Sidebar: [full-kit/src/navigation/sidebar](https://github.com/Qualiora/shadboard/tree/main/full-kit/src/navigation/sidebar)
- Layout: [full-kit/src/components/layout](https://github.com/Qualiora/shadboard/tree/main/full-kit/src/components/layout)

---

## API Endpoints (Baru)

### Admin Auth

| Method | Endpoint                          | Description            |
| ------ | --------------------------------- | ---------------------- |
| POST   | `/api/admin/auth/login`           | Admin login            |
| POST   | `/api/admin/auth/logout`          | Admin logout           |
| POST   | `/api/admin/auth/forgot-password` | Reset password request |
| POST   | `/api/admin/auth/reset-password`  | Reset password         |

### Admin Management

| Method | Endpoint                            | Description        |
| ------ | ----------------------------------- | ------------------ |
| GET    | `/api/admin/admins`                 | List all admins    |
| POST   | `/api/admin/admins`                 | Create new admin   |
| GET    | `/api/admin/admins/[id]`            | Get admin details  |
| PUT    | `/api/admin/admins/[id]`            | Update admin       |
| DELETE | `/api/admin/admins/[id]`            | Delete admin       |
| PUT    | `/api/admin/admins/profile`         | Update own profile |
| PUT    | `/api/admin/admins/change-password` | Change password    |

### Analytics

| Method | Endpoint                         | Description         |
| ------ | -------------------------------- | ------------------- |
| GET    | `/api/admin/analytics/dashboard` | Dashboard summary   |
| GET    | `/api/admin/analytics/users`     | User analytics      |
| GET    | `/api/admin/analytics/earnings`  | Earning reports     |
| GET    | `/api/admin/analytics/practices` | Practice statistics |
| GET    | `/api/admin/analytics/export`    | Export data         |

### Subscription

| Method | Endpoint                          | Description          |
| ------ | --------------------------------- | -------------------- |
| GET    | `/api/admin/subscription/tiers`   | Get tier settings    |
| PUT    | `/api/admin/subscription/tiers`   | Update tier prices   |
| GET    | `/api/admin/subscription/metrics` | Subscription metrics |

---

## Data Models (Update)

### Admin Model

```typescript
{
  id: string;
  email: string;
  password: string; // hashed
  name: string;
  role: 'SUPER_ADMIN' | 'ADMIN' | 'VIEWER';
  isActive: boolean;
  lastLogin: Date ? createdAt : Date;
  updatedAt: Date;
}
```

### SubscriptionTier Model

```typescript
{
  id: string
  name: 'FREE' | 'BASIC' | 'PRO'
  priceMonthly: number // in Rupiah
  priceAnnual: number // in Rupiah
  features: string[]
  isActive: boolean
  updatedAt: Date
}
```

---

## Shadboard Integration Guide

### Key Files to Reference

| Feature           | Shadboard Location                                                 | Description            |
| ----------------- | ------------------------------------------------------------------ | ---------------------- |
| **Layout**        | `full-kit/src/components/layout/`                                  | Main dashboard layout  |
| **Sidebar**       | `full-kit/src/navigation/sidebar/`                                 | Navigation sidebar     |
| **Auth**          | `full-kit/src/app/[lang]/(plain-layout)/(auth)/`                   | Auth pages             |
| **Dashboard**     | `full-kit/src/app/[lang]/(dashboard-layout)/dashboards/analytics/` | Analytics dashboard    |
| **Profile**       | `full-kit/src/app/[lang]/(dashboard-layout)/pages/account/`        | Account settings       |
| **Pricing**       | `full-kit/src/app/[lang]/(dashboard-layout)/pages/pricing/`        | Pricing page           |
| **UI Components** | `full-kit/src/components/ui/`                                      | Shadcn UI components   |
| **Hooks**         | `full-kit/src/hooks/`                                              | Custom React hooks     |
| **Types**         | `full-kit/src/types/`                                              | TypeScript definitions |
| **Config**        | `full-kit/src/config/`                                             | App configuration      |

### Dependencies dari Shadboard

```json
{
  "react": "19.x",
  "next": "15.x",
  "tailwindcss": "4.x",
  "@radix-ui/*": "latest",
  "recharts": "2.x",
  "@tanstack/react-table": "8.x",
  "react-hook-form": "7.x",
  "zod": "3.x",
  "next-auth": "5.x",
  "zustand": "5.x",
  "lucide-react": "latest"
}
```

---

## User Flows (Update)

### Flow 1: Admin Login & Auth

```
/admin/auth/login → Enter Email/Password
                           ↓
                    Validate Credentials
                           ↓
              ┌─── Valid → Create Session → /admin (Dashboard)
              │
              └─── Invalid → Show Error → Stay

Forgot Password:
/admin/auth/forgot-password → Enter Email → Send Reset Link → Reset Password
```

### Flow 2: Create New Admin (Super Admin Only)

```
/admin/admins/list → Click "Create Admin"
                           ↓
                    Fill Form:
                    - Name
                    - Email
                    - Password
                    - Role (Super Admin / Admin / Viewer)
                           ↓
                    Save → New Admin in List
```

### Flow 3: Create/Edit Task

```
/admin/roleplay/tasks → Click "Create Task"
                              ↓
              /admin/roleplay/tasks/new
                              ↓
              Fill Form (12 fields):
              1. Title *
              2. Description *
              3. Category * & Subcategory
              4. Difficulty * (N5-N1)
              5. Scenario *
              6. Learning Objectives * (multiple)
              7. Conversation Example * + Audio Upload
              8. Estimated Duration *
              9. Prompt * (System prompt)
              10. Voice Settings (Voice + Speed)
              11. Study Decks
              12. Active Status
                              ↓
              Save → /admin/roleplay/tasks

Edit:
/admin/roleplay/tasks → Edit → /admin/roleplay/tasks/[taskId]/edit → Save
```

### Flow 4: Manage Categories

```
/admin/roleplay/category → View Tree
                                ↓
        ┌─── Create Category/Subcategory → Modal → Save
        ├─── Edit → Modal → Save
        └─── Delete → Check tasks → (No tasks) → Delete
                                  → (Has tasks) → Block
```

### Flow 5: Manage Decks (Admin Only)

```
/admin/dek → View Admin Decks
                   ↓
       ┌─── Create → /admin/dek/new → Save
       ├─── Edit → /admin/dek/[id]/edit → Save
       ├─── Duplicate → Copy → Edit
       ├─── Export → Download Excel
       └─── Delete → Confirm → Remove
```

### Flow 6: Edit Subscription (Super Admin Only)

```
/admin/subskripsi/setting → Select Tier (Basic/Pro)
                                    ↓
                           Edit:
                           - Monthly Price (Rupiah)
                           - Annual Price (Rupiah)
                           - Features
                                    ↓
                           Save → Prices Updated
```

### Flow 7: Manage Vouchers (Super Admin Only)

```
/admin/subskripsi/voucher → View List
                                 ↓
       ┌─── Create → /admin/subskripsi/voucher/new → Save
       ├─── Edit → /admin/subskripsi/voucher/[id] → Save
       ├─── Toggle → Active/Inactive
       └─── Delete → (No redemptions) → Delete
                   → (Has redemptions) → Block
```

### Flow 8: Export Data (All Roles)

```
/admin/statistik → Select Tab
                        ↓
       ┌─── Tab: Pengguna → Export → Excel (demographics, metrics)
       └─── Tab: Pendapatan → Export → Excel (revenue, expenses)
```

### Flow 9: View Dashboard

```
/admin → Dashboard loads
              ↓
        View Sections:
        - Top: Revenue, Subscribers, Active Users
        - Second: User by Level, Domicile
        - Third: Earnings, Profit, Expense (⚠️ >80% API Alert)
        - Bottom: Recent Subscribers
```

### Flow 10: Change Password

```
/admin/admins/profile → Change Password Section
                              ↓
                       Enter: Current, New, Confirm
                              ↓
                       Save → Re-login
```

### Flow 11: Role-Based Access

```
Login → Check Role:
        ┌─── SUPER_ADMIN → Full access
        ├─── ADMIN → Tasks, Categories, Decks, View stats
        └─── VIEWER → View only, Export data
```

---

## Keputusan Desain

| Aspek                   | Keputusan     | Detail                              |
| ----------------------- | ------------- | ----------------------------------- |
| Export Format           | Excel (.xlsx) | User stats, Earnings, Research data |
| Admin Roles             | 3 levels      | Super Admin, Admin, Viewer          |
| Notifications           | Tidak         | -                                   |
| Audit Log               | Tidak         | -                                   |
| Dashboard Customization | Tidak         | Fixed layout                        |
| Multi-language          | Tidak         | Indonesia only                      |
| Backup System           | Tidak         | -                                   |
| API Usage Alerts        | Ya            | Threshold 80%                       |

### Admin Role Permissions

| Permission                 | Super Admin | Admin | Viewer |
| -------------------------- | ----------- | ----- | ------ |
| View Dashboard             | ✅          | ✅    | ✅     |
| View Statistik             | ✅          | ✅    | ✅     |
| Export Data                | ✅          | ✅    | ✅     |
| Manage Tasks               | ✅          | ✅    | ❌     |
| Manage Categories          | ✅          | ✅    | ❌     |
| Manage Decks               | ✅          | ✅    | ❌     |
| Edit Subscription Settings | ✅          | ❌    | ❌     |
| Manage Vouchers            | ✅          | ❌    | ❌     |
| Manage Admins              | ✅          | ❌    | ❌     |
| View User List             | ✅          | ✅    | ✅     |

---

## Implementation Phases

### Phase 1: Foundation

- Setup Shadboard template
- Configure admin auth (email/password)
- Setup admin model and database

### Phase 2: Core Pages

- Dashboard dengan analytics summary
- Statistik multi-tab
- Admin management

### Phase 3: Content Management

- Roleplay tasks dengan editable prompt
- Category management
- Deck management (admin only)

### Phase 4: Business

- Subscription tier settings
- Voucher management (move to submenu)
- Earning reports

### Phase 5: Polish

- Responsive optimization
- Performance tuning
- Testing

---

## Version

- **Document Version**: 2.1
- **Last Updated**: 2024-11-24
- **Author**: GengoBot Team
- **Status**: Planning - Ready for Implementation
