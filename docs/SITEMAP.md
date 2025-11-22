# GengoBot - Sitemap & User Flow Documentation

## 📋 Daftar Isi

- [Route Overview](#route-overview)
- [Struktur User States](#struktur-user-states)
- [Arsitektur Aplikasi](#arsitektur-aplikasi)
- [Sitemap Lengkap](#sitemap-lengkap)
- [API Routes](#api-routes)
- [User Flow Diagrams](#user-flow-diagrams)
- [Authentication Flow](#authentication-flow)
- [Feature Routes](#feature-routes)

---

## 📊 Route Overview

| Category        | Count | Description                                  |
| --------------- | ----- | -------------------------------------------- |
| Public Pages    | 6     | Landing, auth, legal                         |
| Protected Pages | 20+   | Main app features (kaiwa, fukushuu, profile) |
| Admin Pages     | 6     | Admin dashboard                              |
| API Routes      | 50+   | Backend endpoints                            |

---

## 🔐 Struktur User States

### 1. **Guest User (Unauthenticated)**

- Status: Belum login
- Akses: Halaman publik saja
- Redirect: Ke home page dengan modal login jika mengakses protected routes

### 2. **Regular User (Authenticated)**

- Status: Login dengan Google OAuth
- Akses: Dashboard area, study features, chat, progress tracking
- Pembatasan: Tidak bisa akses admin panel

### 3. **Admin User**

- Status: Login dengan flag `isAdmin = true`
- Akses: Semua fitur regular user + admin panel
- Spesial: Manajemen users, tasks, decks, categories, characters, analytics

---

## 🏗️ Arsitektur Aplikasi

### Layout Hierarchy

```
Root Layout (src/app/layout.tsx)
├── Public Pages
│   ├── Home Page (/)
│   ├── Login Page (/login)
│   └── Auth Error (/auth/error)
│
├── Dashboard Layout (src/app/dashboard/layout.tsx)
│   └── Protected: Regular User & Admin
│
├── Admin Layout (src/app/admin/layout.tsx)
│   └── Protected: Admin Only
│
└── Study App Layout (src/app/(app)/layout.tsx)
    └── Study features with nested layout
```

### Authentication Middleware

**File:** `src/middleware.ts`

**Protected Routes:**

- `/dashboard/*` → Requires authentication
- `/admin/*` → Requires authentication + admin role
- **Redirect Logic:** Unauthenticated → `/?login=required&returnTo={pathname}`

---

## 🗺️ Sitemap Lengkap

### **Public Routes** (Accessible by All)

```
/                           → Home/Landing Page
├── Hero Section
├── Features Overview
├── Pricing Section
├── Testimonials
├── FAQ
└── CTA Section

/login                      → Standalone Login Page
└── Google OAuth Integration

/auth/error                 → Authentication Error Page
└── Error handling untuk auth failures

/termsofservice
└── terms of service

/privacypolicy
└── privacy policy

/(auth)/login               → Login page
/(auth)/register            → Registration page
/(auth)/verify-email        → Email verification
/(auth)/forgot-password     → Password reset request
/(auth)/reset-password      → Password reset form
```

---

### **App Routes** (Authenticated Users)

```
/app                        → Main Dashboard
├── Welcome message
├── Learning statistics
├── Quick actions
└── Recent activity

/app/onboarding             → New user onboarding
├── JLPT level selection
├── Learning goals
└── Initial preferences

/app/kaiwa                  → Conversation mode selection
├── Bebas (Free conversation)
├── Roleplay (Task-based)
└── Topic (Topic discussion)

/app/kaiwa/bebas            → Free conversation
├── Character selection
├── Chat interface
├── Voice input/output
└── Feedback panel

/app/kaiwa/roleplay         → Scenario selection
├── Scenario cards
├── Difficulty filters
└── JLPT level filters

/app/kaiwa/roleplay/[id]    → Active roleplay session
├── Chat interface
├── Task objectives
├── Progress tracking
└── Assessment results

/app/kaiwa/topic            → Topic discussion
├── Topic selection
├── Discussion interface
└── Feedback panel

/app/fukushuu               → Review/Flashcard home
├── Due cards overview
├── Study decks
└── Statistics

/app/fukushuu/drill         → Flashcard drill session
├── Card interface
├── Rating buttons (1-4)
├── Progress indicator
└── Session stats

/app/fukushuu/study-deck    → Study deck manager
├── Deck list
├── Create/Edit decks
└── Card management

/app/scenarios              → Scenario browsing
├── Scenario cards
├── Filters (difficulty, JLPT)
└── Categories

/app/scenarios/[id]         → Scenario detail
├── Description
├── Objectives
├── Start button
└── Related scenarios

/app/profile                → User profile overview
├── User info
├── Statistics
├── Achievements
└── Tab navigation

/app/profile/settings       → User settings
├── Profile management
├── Preferences
├── Account settings
└── Theme selection

/app/profile/characters     → Character list
├── Character cards
├── Create new button
└── Edit/Delete actions

/app/profile/characters/new → Create character
├── Name & description
├── Avatar picker
├── Personality traits
└── Speaking style

/app/profile/characters/[id]/edit → Edit character
├── Edit form
├── Avatar change
└── Delete option

/app/history                → Conversation history
├── Conversation list
├── Filters
├── Search
└── Delete actions
```

---

### **Admin Routes** (Admin Only)

```
/admin                      → Admin Dashboard
├── System Overview
├── Quick Actions
└── Recent Activity

/admin/analytics            → Analytics & Reports
├── User Metrics
├── Usage Statistics
├── Performance Data
├── Engagement Analytics
└── User Analytics (kaiwa practice time, card learned JLPT Level)

/admin/users                → User Management
├── User List
├── Search & Filter
├── Role Management
└── User Activity Logs

/admin/tasks                → Task Administration
├── Task List
├── → /admin/tasks/new
│   └── Create New Task
└── → /admin/tasks/{taskId}
    ├── Task Details
    └── → /admin/tasks/{taskId}/edit
        ├── Edit Task Content
        ├── Configure Difficulty
        └── Manage Vocabulary

/admin/decks                → Deck Management
├── All Decks Overview
├── → /admin/decks/new
│   └── Create System Deck
└── → /admin/decks/{deckId}
    ├── Deck Analytics
    └── → /admin/decks/{deckId}/edit
        ├── Edit Deck Content
        └── Manage Cards

/admin/categories           → Category Management
├── Category List
├── Create/Edit Categories
└── Hierarchy Organization

/admin/characters           → Character Administration
├── All AI Characters
├── Character Configuration
└── Behavior Settings

/admin/settings             → System Settings
├── Application Config
├── Feature Flags
└── System Maintenance
```

---

## 🔌 API Routes

### Authentication

| Method | Endpoint                        | Description               |
| ------ | ------------------------------- | ------------------------- |
| `*`    | `/api/auth/[...nextauth]`       | NextAuth handlers         |
| `POST` | `/api/auth/register`            | User registration         |
| `POST` | `/api/auth/verify-email`        | Verify email token        |
| `POST` | `/api/auth/resend-verification` | Resend verification email |
| `POST` | `/api/auth/forgot-password`     | Request password reset    |
| `POST` | `/api/auth/reset-password`      | Reset password            |

### Chat & AI

| Method | Endpoint             | Description              |
| ------ | -------------------- | ------------------------ |
| `POST` | `/api/chat`          | Send message (free chat) |
| `POST` | `/api/chat/stream`   | SSE streaming chat       |
| `POST` | `/api/chat/roleplay` | Roleplay chat message    |
| `POST` | `/api/chat/topic`    | Topic discussion message |

### Voice

| Method | Endpoint                | Description              |
| ------ | ----------------------- | ------------------------ |
| `POST` | `/api/voice/transcribe` | Speech-to-text (Whisper) |
| `POST` | `/api/voice/synthesize` | Text-to-speech (TTS)     |

### Conversations

| Method   | Endpoint                           | Description             |
| -------- | ---------------------------------- | ----------------------- |
| `GET`    | `/api/conversations`               | List user conversations |
| `POST`   | `/api/conversations`               | Create conversation     |
| `GET`    | `/api/conversations/[id]`          | Get conversation        |
| `PUT`    | `/api/conversations/[id]`          | Update conversation     |
| `DELETE` | `/api/conversations/[id]`          | Delete conversation     |
| `GET`    | `/api/conversations/[id]/messages` | Get messages            |
| `POST`   | `/api/conversations/[id]/messages` | Add message             |

### Flashcards

| Method   | Endpoint                 | Description      |
| -------- | ------------------------ | ---------------- |
| `GET`    | `/api/flashcards`        | List flashcards  |
| `POST`   | `/api/flashcards`        | Create flashcard |
| `GET`    | `/api/flashcards/[id]`   | Get flashcard    |
| `PUT`    | `/api/flashcards/[id]`   | Update flashcard |
| `DELETE` | `/api/flashcards/[id]`   | Delete flashcard |
| `GET`    | `/api/flashcards/due`    | Get due cards    |
| `POST`   | `/api/flashcards/review` | Submit review    |
| `GET`    | `/api/flashcards/stats`  | Get statistics   |

### Study Decks

| Method   | Endpoint                | Description       |
| -------- | ----------------------- | ----------------- |
| `GET`    | `/api/study-decks`      | List study decks  |
| `POST`   | `/api/study-decks`      | Create study deck |
| `GET`    | `/api/study-decks/[id]` | Get study deck    |
| `PUT`    | `/api/study-decks/[id]` | Update study deck |
| `DELETE` | `/api/study-decks/[id]` | Delete study deck |

### Characters

| Method   | Endpoint               | Description      |
| -------- | ---------------------- | ---------------- |
| `GET`    | `/api/characters`      | List characters  |
| `POST`   | `/api/characters`      | Create character |
| `GET`    | `/api/characters/[id]` | Get character    |
| `PUT`    | `/api/characters/[id]` | Update character |
| `DELETE` | `/api/characters/[id]` | Delete character |

### Scenarios

| Method   | Endpoint                    | Description             |
| -------- | --------------------------- | ----------------------- |
| `GET`    | `/api/scenarios`            | List scenarios          |
| `POST`   | `/api/scenarios`            | Create scenario (admin) |
| `GET`    | `/api/scenarios/[id]`       | Get scenario            |
| `PUT`    | `/api/scenarios/[id]`       | Update scenario (admin) |
| `DELETE` | `/api/scenarios/[id]`       | Delete scenario (admin) |
| `POST`   | `/api/scenarios/[id]/start` | Start scenario          |

### User

| Method | Endpoint               | Description           |
| ------ | ---------------------- | --------------------- |
| `GET`  | `/api/user`            | Get current user      |
| `PUT`  | `/api/user`            | Update profile        |
| `GET`  | `/api/user/progress`   | Get learning progress |
| `PUT`  | `/api/user/progress`   | Update progress       |
| `GET`  | `/api/user/stats`      | Get user statistics   |
| `GET`  | `/api/user/settings`   | Get settings          |
| `PUT`  | `/api/user/settings`   | Update settings       |
| `POST` | `/api/user/onboarding` | Complete onboarding   |

### Upload

| Method | Endpoint             | Description         |
| ------ | -------------------- | ------------------- |
| `POST` | `/api/upload/avatar` | Upload avatar image |

### Admin APIs

| Method   | Endpoint                    | Description        |
| -------- | --------------------------- | ------------------ |
| `GET`    | `/api/admin/users`          | List all users     |
| `PUT`    | `/api/admin/users/[id]`     | Update user        |
| `DELETE` | `/api/admin/users/[id]`     | Delete user        |
| `GET`    | `/api/admin/analytics`      | Get analytics data |
| `GET`    | `/api/admin/scenarios`      | List all scenarios |
| `POST`   | `/api/admin/scenarios`      | Create scenario    |
| `PUT`    | `/api/admin/scenarios/[id]` | Update scenario    |
| `DELETE` | `/api/admin/scenarios/[id]` | Delete scenario    |

---

## 🔄 User Flow Diagrams

### **1. First-Time User Journey**

```mermaid
graph TD
    A[Landing Page /] --> B{User Action}
    B -->|Click Masuk/Mulai| C[Login Modal Opens]
    B -->|Browse Content| D[Read Landing Page]

    C --> E[Google OAuth]
    E --> F{Auth Success?}
    F -->|Yes| G[Create User Record]
    F -->|No| H[/auth/error]

    G --> I[/dashboard]
    I --> J[Onboarding Tour]
    J --> K{Choose Action}

    K -->|Start Learning| L[/dashboard/tasks]
    K -->|Explore Study Decks| M[/study]
    K -->|Try Chat| N[/dashboard/chat]
```

### **2. Task Completion Flow**

```mermaid
graph TD
    A[/dashboard/tasks] --> B[Browse Available Tasks]
    B --> C[Select Task by JLPT Level]
    C --> D[/dashboard/tasks/{taskId}/pre-study]

    D --> E[Review Context]
    E --> F[Study Vocabulary]
    F --> G[Click Start Task]

    G --> H[/dashboard/tasks/{taskId}/attempt/{attemptId}]
    H --> I[AI Character Interaction]
    I --> J[Speech Recognition Active]
    J --> K[Real-time Feedback]

    K --> L{Task Complete?}
    L -->|Yes| M[Save Attempt Results]
    L -->|No| J

    M --> N[Update Progress Stats]
    N --> O[/dashboard/progress]
    O --> P[View Achievement]
```

### **3. Study Session Flow**

```mermaid
graph TD
    A[/study] --> B{User Choice}

    B -->|Browse Decks| C[/study/my-decks]
    B -->|Create New| D[/study/decks/new]
    B -->|Quick Study| E[Select Deck]

    C --> E
    D --> F[Configure Deck]
    F --> G[Add Initial Cards]
    G --> C

    E --> H[/study/decks/{deckId}]
    H --> I{Action}

    I -->|Start Study| J[/study/{deckId}]
    I -->|Edit Deck| K[/study/decks/{deckId}/edit]
    I -->|View Stats| L[/study/stats]

    J --> M[Flashcard Session]
    M --> N[Rate Card Easy/Good/Hard/Again]
    N --> O{More Cards?}

    O -->|Yes| M
    O -->|No| P[Session Complete]
    P --> Q[Update Statistics]
    Q --> L
```

### **4. Admin Management Flow**

```mermaid
graph TD
    A[/admin] --> B{Admin Action}

    B -->|Manage Users| C[/admin/users]
    B -->|Create Content| D{Content Type}
    B -->|View Analytics| E[/admin/analytics]
    B -->|System Config| F[/admin/settings]

    D -->|New Task| G[/admin/tasks/new]
    D -->|New Deck| H[/admin/decks/new]
    D -->|New Category| I[/admin/categories]

    G --> J[Configure Task]
    J --> K[Set JLPT Level]
    K --> L[Add Vocabulary]
    L --> M[Assign Character]
    M --> N[Save Task]
    N --> O[/admin/tasks]

    H --> P[Create Deck]
    P --> Q[Add Cards]
    Q --> R[Set Visibility]
    R --> S[/admin/decks]

    C --> T{User Management}
    T -->|Search User| U[Filter & Find]
    T -->|Toggle Admin| V[Update Role]
    T -->|View Activity| W[User Logs]
```

---

## 🔐 Authentication Flow

### **Login Process**

```mermaid
sequenceDiagram
    participant U as User
    participant LP as Landing Page
    participant M as Modal/Login Page
    participant G as Google OAuth
    participant S as Server
    participant DB as Database
    participant D as Dashboard

    U->>LP: Visit /
    U->>LP: Click "Masuk" or "Mulai"
    LP->>M: Open Login Modal
    M->>G: Initiate OAuth
    G->>U: Google Login Screen
    U->>G: Authenticate
    G->>S: Return OAuth Token
    S->>DB: Check/Create User
    DB->>S: User Record
    S->>S: Create Session
    S->>D: Redirect to /dashboard
    D->>U: Show Dashboard
```

### **Protected Route Access**

```mermaid
sequenceDiagram
    participant U as User
    participant B as Browser
    participant MW as Middleware
    participant A as Auth Service
    participant T as Target Page
    participant H as Home Page

    U->>B: Navigate to /dashboard/tasks
    B->>MW: Request
    MW->>A: Check Session

    alt Authenticated
        A->>MW: Valid Session
        MW->>T: Allow Access
        T->>U: Show Page
    else Not Authenticated
        A->>MW: No Session
        MW->>H: Redirect /?login=required&returnTo=/dashboard/tasks
        H->>U: Show Home + Login Modal
    end
```

### **Admin Access Control**

```mermaid
sequenceDiagram
    participant U as User
    participant MW as Middleware
    participant A as Auth Service
    participant DB as Database
    participant AP as Admin Page
    participant D as Dashboard

    U->>MW: Request /admin
    MW->>A: Check Session
    A->>MW: Session Valid
    MW->>AP: Check Admin Role
    AP->>DB: Query isAdmin flag

    alt Is Admin
        DB->>AP: isAdmin = true
        AP->>U: Show Admin Panel
    else Not Admin
        DB->>AP: isAdmin = false
        AP->>D: Redirect /dashboard
        D->>U: Show User Dashboard
    end
```

---

## 🎯 Feature Routes

### **Core Features Overview**

| Feature Category        | Route Base                            | Key Functionality                            |
| ----------------------- | ------------------------------------- | -------------------------------------------- |
| **Authentication**      | `/`, `/login`, `/auth/error`          | Google OAuth, session management             |
| **Task-Based Learning** | `/dashboard/tasks/*`                  | AI conversation practice, JLPT-aligned tasks |
| **Study System**        | `/study/*`                            | Flashcard SRS, deck management               |
| **Chat Interface**      | `/dashboard/chat`, `/chat-webrtc`     | Text & voice AI interaction                  |
| **Progress Tracking**   | `/dashboard/progress`, `/study/stats` | Analytics, achievements                      |
| **Character System**    | `/dashboard/characters/*`             | AI persona customization                     |
| **Admin Panel**         | `/admin/*`                            | Content management, analytics                |

### **Navigation Structure**

#### **Guest User Navigation**

```
Navbar
├── Logo → /
├── Theme Toggle
└── Login Button → Opens Login Modal
```

#### **Regular User Navigation (Dashboard Sidebar)**

```
App Sidebar (Dashboard)
├── Header: GengoBot Logo → /dashboard
├── Main Menu
│   ├── Dasbor → /dashboard
│   ├── Tugas → /dashboard/tasks
│   ├── Dek Belajar → /study
│   ├── Obrolan → /dashboard/chat
│   ├── Obrolan Suara → /chat-webrtc
│   ├── Kemajuan → /dashboard/progress
│   └── Karakter → /dashboard/characters
├── Bottom Menu
│   └── Pengaturan → /dashboard/settings
└── Footer: User Profile (email, name)
```

#### **Admin Navigation (Admin Sidebar)**

```
Admin Sidebar
├── Header: Admin Panel Logo → /admin
├── Main Menu
│   ├── Dashboard → /admin
│   ├── Analytics → /admin/analytics
│   ├── Users → /admin/users
│   ├── Tasks → /admin/tasks
│   ├── Decks → /admin/decks
│   ├── Categories → /admin/categories
│   └── Characters → /admin/characters
├── Bottom Menu
│   └── Settings → /admin/settings
└── Footer: Back to Dashboard → /dashboard
```

---

## 🔗 Route Dependencies

### **Task System Dependencies**

```
/dashboard/tasks
  └── Requires: Authentication
      ├── /dashboard/tasks/{taskId}/pre-study
      │   └── Requires: Valid taskId
      │       └── /dashboard/tasks/{taskId}/attempt/{attemptId}
      │           └── Requires: Valid taskId + attemptId creation
```

### **Study System Dependencies**

```
/study
  └── Requires: Authentication (implicit via (app) layout)
      ├── /study/my-decks
      ├── /study/decks/new
      │   └── Creates new deckId
      ├── /study/decks/{deckId}
      │   └── Requires: Valid deckId + ownership/access
      │       ├── /study/decks/{deckId}/edit
      │       └── /study/{deckId} (Study Session)
      └── /study/stats
```

### **Admin System Dependencies**

```
/admin
  └── Requires: Authentication + isAdmin = true
      ├── All /admin/* routes inherit same requirements
      └── Nested CRUD routes (new, edit) require parent entity existence
```

---

## 📊 Route Statistics

### **Total Routes**

- **Public Routes:** 3
- **Dashboard Routes:** 10 (+ dynamic segments)
- **Study Routes:** 7 (+ dynamic segments)
- **Admin Routes:** 15 (+ dynamic segments)
- **Total Unique Paths:** ~35+ (including dynamic routes)

### **Protection Levels**

- **No Auth Required:** 3 routes
- **Auth Required:** 17+ routes
- **Admin Required:** 15+ routes

---

## 🎨 UI/UX Notes

### **Common Patterns**

1. **Modal-First Login:** Landing page uses modal instead of redirect for better UX
2. **Return URL Preservation:** Middleware preserves intended destination after login
3. **Sidebar Navigation:** Consistent left sidebar for authenticated experiences
4. **Breadcrumb Navigation:** (To be implemented for nested routes)
5. **Theme Support:** Dark/Light mode available throughout

### **Mobile Considerations**

- Responsive sidebar (collapsible)
- Touch-friendly buttons and navigation
- Optimized for mobile chat/voice interfaces

---

## 🚀 Future Route Expansion

### **Planned Routes** (Not yet implemented)

```
/dashboard/achievements    → Achievement system
/dashboard/leaderboard     → Competitive ranking
/study/community          → Community-shared decks
/admin/reports            → Detailed reporting system
/api/webhooks             → Webhook management for integrations
```

---

## 📝 Notes for Development

### **Route Naming Conventions**

- **Dashboard routes:** User-facing Indonesian labels ("Dasbor", "Tugas")
- **Admin routes:** English labels ("Dashboard", "Analytics")
- **URL paths:** English, kebab-case (`/dashboard/tasks`)

### **Dynamic Route Parameters**

- `{taskId}` - UUID for task identification
- `{attemptId}` - UUID for attempt tracking
- `{deckId}` - UUID/slug for deck identification
- `{id}` - Generic UUID for character/entity IDs

### **Layout Nesting Strategy**

- Root layout: Global providers (Auth, Theme)
- Dashboard layout: User-specific sidebar + header
- Admin layout: Admin sidebar + header + role check
- Study app layout: Study-specific navigation

---

**Last Updated:** 2025-11-23
**Version:** 2.0
**Maintainer:** GengoBot Team
