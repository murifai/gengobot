# Admin Dashboard

## Routes

```
/admin                     → Dashboard (analytics summary)
/admin/auth/login          → Admin login

/admin/statistik           → Analytics (multi-tab)
  ├── Tab: Pengguna        → User demographics
  ├── Tab: Pendapatan      → Revenue reports
  └── Tab: Praktik         → Practice statistics

/admin/pengguna            → User list (read-only)

/admin/roleplay/tasks      → Task management
  ├── /new                 → Create task
  └── /[taskId]/edit       → Edit task

/admin/dek                 → Deck management
  ├── /new                 → Create deck
  └── /[deckId]/edit       → Edit deck

/admin/subskripsi/voucher  → Voucher management

/admin/admins              → Admin account management
```

---

## Dashboard (`/admin`)

Analytics summary with key metrics:

- Total revenue
- Subscriber count by tier
- Active users (30d)
- Recent subscribers

---

## Statistik (`/admin/statistik`)

### Tab: Pengguna

- User demographics (JLPT level, age, domicile)
- Learning profiles
- Export to Excel

### Tab: Pendapatan

- Revenue metrics
- Expense breakdown (API usage)
- Subscription metrics
- Export to Excel

### Tab: Praktik

- Roleplay task statistics
- Chat practice stats
- Deck statistics

---

## Task Editor

Form fields:

1. Title
2. Description
3. Category & Subcategory
4. Difficulty (N5-N1)
5. Scenario
6. Learning Objectives
7. Conversation Example
8. Duration
9. System Prompt
10. Voice Settings (voice + speed)
11. Study Decks
12. Active Status

---

## Admin Roles

| Permission      | Super Admin | Admin | Viewer |
| --------------- | ----------- | ----- | ------ |
| View Dashboard  | ✅          | ✅    | ✅     |
| View Statistics | ✅          | ✅    | ✅     |
| Export Data     | ✅          | ✅    | ✅     |
| Manage Tasks    | ✅          | ✅    | ❌     |
| Manage Decks    | ✅          | ✅    | ❌     |
| Manage Vouchers | ✅          | ❌    | ❌     |
| Manage Admins   | ✅          | ❌    | ❌     |

---

## Sidebar Navigation

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

## API Endpoints

### Admin Auth

| Method | Endpoint                 | Description  |
| ------ | ------------------------ | ------------ |
| POST   | `/api/admin/auth/login`  | Admin login  |
| POST   | `/api/admin/auth/logout` | Admin logout |

### Analytics

| Method | Endpoint                         | Description     |
| ------ | -------------------------------- | --------------- |
| GET    | `/api/admin/analytics/dashboard` | Dashboard stats |
| GET    | `/api/admin/analytics/users`     | User analytics  |
| GET    | `/api/admin/analytics/earnings`  | Revenue reports |

### Admin Management

| Method | Endpoint                 | Description  |
| ------ | ------------------------ | ------------ |
| GET    | `/api/admin/admins`      | List admins  |
| POST   | `/api/admin/admins`      | Create admin |
| PUT    | `/api/admin/admins/[id]` | Update admin |
| DELETE | `/api/admin/admins/[id]` | Delete admin |

---

**Last Updated:** 2025-12
