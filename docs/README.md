# Gengobot Documentation

AI-powered Japanese language learning platform.

## Quick Links

- [Sitemap](./SITEMAP.md) - Routes & navigation
- [Project Structure](./FILE_TREE.md) - Codebase organization
- [Admin Dashboard](./ADMIN_SITEMAP_FLOW.md) - Admin features
- [Subscription](./SUBSCRIPTION_CREDITS.md) - Credit system

---

## Features

### Kaiwa (Conversation)

AI-powered conversation practice with task-based roleplay scenarios.

- **Roleplay Mode**: Structured tasks with learning objectives
- **Free Chat**: Open conversation practice
- **Voice Support**: Speech-to-text (Whisper) and text-to-speech
- **Real-time Feedback**: Grammar, vocabulary, and fluency assessment

### Drill (Flashcards)

Spaced repetition system for vocabulary and kanji.

- Deck management (create, import, share)
- SRS algorithm for optimal review timing
- Progress tracking and statistics

### Subscription

Credit-based billing system with Midtrans payment.

- **Free**: Trial period with limited features
- **Basic**: Voice + unlimited text chat
- **Pro**: Realtime voice + all features

---

## Tech Stack

| Layer    | Technology                       |
| -------- | -------------------------------- |
| Frontend | Next.js 15, React 19, TypeScript |
| Styling  | Tailwind CSS, shadcn/ui          |
| Backend  | Next.js API Routes, Prisma       |
| Database | PostgreSQL                       |
| Auth     | NextAuth.js (Google OAuth)       |
| AI       | OpenAI GPT-4, Whisper, TTS       |
| Payment  | Midtrans                         |

---

## Getting Started

```bash
# Install dependencies
npm install

# Setup database
npx prisma migrate dev
npx prisma db seed

# Start development
npm run dev
```

---

## Documentation Structure

```
docs/
├── README.md              # This file
├── SITEMAP.md             # Routes documentation
├── FILE_TREE.md           # Project structure
├── ADMIN_SITEMAP_FLOW.md  # Admin dashboard
├── SUBSCRIPTION_CREDITS.md # Credit system
└── deployment/            # Deployment guides
```

---

**Last Updated:** 2025-12
