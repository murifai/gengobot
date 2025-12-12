# GengoBot - Sitemap & Routes

## Overview

| Category   | Count | Description                        |
| ---------- | ----- | ---------------------------------- |
| Public     | 4     | Landing, auth, legal pages         |
| User App   | 15+   | Kaiwa, drill, profile, billing     |
| Admin      | 10+   | Dashboard, tasks, decks, analytics |
| API Routes | 80+   | Backend endpoints                  |

---

## Public Routes

```
/                       → Landing page
/login                  → Login page
/termsofservice         → Terms of service
/privacypolicy          → Privacy policy
/auth/error             → Auth error page
```

---

## User App Routes (`/app`)

### Main

```
/app                    → Dashboard
/app/onboarding         → New user onboarding
```

### Kaiwa (Conversation)

```
/app/kaiwa              → Mode selection
/app/kaiwa/bebas        → Free conversation
/app/kaiwa/roleplay     → Task-based roleplay
```

### Drill (Flashcards)

```
/app/drill              → Deck browser
/app/drill/decks/[deckId]/study  → Study session
```

### Profile

```
/app/profile            → Profile overview
/app/profile/settings   → User settings
/app/profile/progress   → Learning progress
/app/profile/characters → Character management
```

### Billing

```
/app/billing            → Subscription management
/app/choose-plan        → Plan selection
/app/upgrade            → Upgrade page
/app/payment/success    → Payment success
/app/payment/pending    → Payment pending
/app/payment/failed     → Payment failed
```

---

## Admin Routes (`/admin`)

```
/admin                  → Dashboard (analytics summary)
/admin/auth/login       → Admin login

/admin/statistik        → Analytics (multi-tab)
/admin/pengguna         → User list (read-only)

/admin/roleplay/tasks   → Task management
/admin/roleplay/tasks/new           → Create task
/admin/roleplay/tasks/[taskId]/edit → Edit task

/admin/dek              → Deck management
/admin/dek/new          → Create deck
/admin/dek/[deckId]/edit → Edit deck

/admin/subskripsi/voucher  → Voucher management
/admin/admins           → Admin management
```

---

## API Routes

### Authentication

| Method | Endpoint                  | Description |
| ------ | ------------------------- | ----------- |
| `*`    | `/api/auth/[...nextauth]` | NextAuth    |
| `POST` | `/api/admin/auth/login`   | Admin login |

### Tasks & Learning

| Method | Endpoint                           | Description       |
| ------ | ---------------------------------- | ----------------- |
| `GET`  | `/api/tasks`                       | List tasks        |
| `POST` | `/api/tasks`                       | Create task       |
| `GET`  | `/api/task-attempts`               | List attempts     |
| `POST` | `/api/task-attempts`               | Start attempt     |
| `GET`  | `/api/task-attempts/[id]/stream`   | Chat stream (SSE) |
| `POST` | `/api/task-attempts/[id]/message`  | Send message      |
| `POST` | `/api/task-attempts/[id]/complete` | Complete task     |

### Decks & Flashcards

| Method | Endpoint                 | Description   |
| ------ | ------------------------ | ------------- |
| `GET`  | `/api/decks`             | List decks    |
| `POST` | `/api/decks`             | Create deck   |
| `GET`  | `/api/flashcards`        | List cards    |
| `POST` | `/api/flashcards/review` | Submit review |

### Voice

| Method | Endpoint                | Description    |
| ------ | ----------------------- | -------------- |
| `POST` | `/api/voice/transcribe` | Speech-to-text |
| `POST` | `/api/voice/synthesize` | Text-to-speech |

### Subscription

| Method | Endpoint                    | Description      |
| ------ | --------------------------- | ---------------- |
| `GET`  | `/api/subscription/status`  | Current status   |
| `POST` | `/api/subscription/upgrade` | Upgrade tier     |
| `POST` | `/api/payment/checkout`     | Create payment   |
| `POST` | `/api/voucher/validate`     | Validate voucher |

### Admin

| Method | Endpoint                         | Description     |
| ------ | -------------------------------- | --------------- |
| `GET`  | `/api/admin/analytics/dashboard` | Dashboard stats |
| `GET`  | `/api/admin/analytics/users`     | User analytics  |
| `GET`  | `/api/admin/analytics/earnings`  | Revenue reports |
| `*`    | `/api/admin/admins`              | Admin CRUD      |
| `*`    | `/api/admin/vouchers`            | Voucher CRUD    |

---

## Authentication

### User Auth

- Google OAuth via NextAuth.js
- Session-based authentication

### Admin Auth

- Email/password only
- Separate session from user auth
- Role-based access (Super Admin, Admin, Viewer)

---

## Navigation

### User Sidebar

```
├── Dashboard       → /app
├── Kaiwa          → /app/kaiwa
├── Drill          → /app/drill
├── Profile        → /app/profile
└── Billing        → /app/billing
```

### Admin Sidebar

```
├── Dashboard      → /admin
├── Statistik      → /admin/statistik
├── Pengguna       → /admin/pengguna
├── Roleplay
│   └── Tasks      → /admin/roleplay/tasks
├── Dek Belajar    → /admin/dek
├── Subskripsi
│   └── Voucher    → /admin/subskripsi/voucher
└── Admins         → /admin/admins
```

---

**Last Updated:** 2025-12
