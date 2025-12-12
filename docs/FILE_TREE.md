# Gengobot - Project Structure

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS + shadcn/ui
- **Database**: PostgreSQL + Prisma ORM
- **Auth**: NextAuth.js (Google OAuth) + Admin Auth
- **AI**: OpenAI GPT-4, Whisper, TTS
- **State**: TanStack Query + Zustand
- **Payment**: Midtrans

---

## Directory Structure

```
gengobot/
├── prisma/
│   ├── migrations/         # Database migrations
│   └── schema.prisma       # Database schema
│
├── public/
│   ├── avatars/           # Character avatars
│   ├── audio/             # Voice samples
│   └── images/            # Static images
│
├── src/
│   ├── app/               # Next.js App Router
│   ├── components/        # React components
│   ├── hooks/             # Custom hooks
│   ├── lib/               # Utilities
│   ├── types/             # TypeScript types
│   └── contexts/          # React contexts
│
├── docs/                  # Documentation
└── scripts/               # Utility scripts
```

---

## App Routes (`/src/app`)

```
app/
├── (app)/                 # User routes (protected)
│   ├── layout.tsx
│   ├── page.tsx           # Dashboard
│   ├── kaiwa/             # Conversation
│   │   ├── bebas/         # Free chat
│   │   └── roleplay/      # Task-based
│   ├── drill/             # Flashcards
│   ├── profile/           # User profile
│   ├── billing/           # Subscription
│   └── onboarding/        # New user setup
│
├── (admin)/admin/         # Admin routes
│   ├── layout.tsx
│   ├── page.tsx           # Dashboard
│   ├── auth/login/        # Admin login
│   ├── statistik/         # Analytics
│   ├── pengguna/          # User list
│   ├── roleplay/tasks/    # Task management
│   ├── dek/               # Deck management
│   ├── subskripsi/        # Subscription settings
│   └── admins/            # Admin management
│
├── (auth)/                # Auth pages
│   └── login/
│
└── api/                   # API routes (80+)
    ├── auth/              # Authentication
    ├── tasks/             # Task CRUD
    ├── task-attempts/     # Learning attempts
    ├── decks/             # Deck CRUD
    ├── flashcards/        # Card operations
    ├── voice/             # STT/TTS
    ├── subscription/      # Billing
    ├── payment/           # Payments
    └── admin/             # Admin APIs
```

---

## Components (`/src/components`)

```
components/
├── ui/                    # shadcn/ui base components
├── chat/                  # Chat interface
├── task/                  # Task attempt UI
├── deck/                  # Flashcard components
├── kaiwa/                 # Roleplay components
├── subscription/          # Billing UI
├── admin/                 # Admin components
└── layout/                # Navigation, sidebar
```

---

## Libraries (`/src/lib`)

```
lib/
├── prisma.ts              # Prisma client
├── auth.ts                # NextAuth config
├── utils.ts               # Utilities
├── ai/                    # OpenAI integration
├── voice/                 # Voice processing
├── subscription/          # Credit system
└── validators/            # Zod schemas
```

---

## Database Models

| Model        | Description           |
| ------------ | --------------------- |
| User         | User accounts         |
| Task         | Learning tasks        |
| TaskAttempt  | User attempt history  |
| Conversation | Chat history          |
| Deck         | Flashcard collections |
| Flashcard    | Individual cards      |
| Character    | AI personalities      |
| Subscription | User subscriptions    |
| Payment      | Payment records       |
| Voucher      | Discount codes        |
| Admin        | Admin accounts        |

---

## Environment Variables

```bash
# Database
DATABASE_URL=

# NextAuth
NEXTAUTH_SECRET=
NEXTAUTH_URL=

# OAuth
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

# OpenAI
OPENAI_API_KEY=

# Midtrans
MIDTRANS_SERVER_KEY=
MIDTRANS_CLIENT_KEY=
```

---

## Scripts

```bash
npm run dev          # Development server
npm run build        # Production build
npm run lint         # ESLint
npx prisma migrate   # Database migrations
npx prisma studio    # Database GUI
```

---

**Last Updated:** 2025-12
