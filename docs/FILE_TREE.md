# Gengobot - File Tree Documentation

> AI-powered Japanese language learning platform

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS + shadcn/ui
- **Database**: PostgreSQL + Prisma ORM
- **Auth**: NextAuth.js (OAuth + Credentials)
- **AI**: OpenAI (GPT-4, Whisper, TTS)

---

## Directory Structure

```
gengobot/
├── .github/                    # GitHub configurations
│   └── workflows/              # CI/CD pipelines
│
├── docs/                       # Project documentation
│   ├── FILE_TREE.md           # This file
│   └── SITEMAP.md             # Route documentation
│
├── prisma/                     # Database layer
│   ├── migrations/            # Database migrations
│   └── schema.prisma          # Database schema (14 models)
│
├── public/                     # Static assets
│   ├── avatars/               # Character avatar images
│   ├── icons/                 # App icons
│   ├── images/                # General images
│   └── uploads/               # User uploaded files
│       └── avatars/           # User avatar uploads
│
├── src/                       # Source code
│   ├── app/                   # Next.js App Router
│   ├── components/            # React components
│   ├── hooks/                 # Custom React hooks
│   ├── lib/                   # Utilities & services
│   ├── providers/             # React context providers
│   ├── styles/                # Global styles
│   └── types/                 # TypeScript definitions
│
├── .env.example               # Environment template
├── .eslintrc.json            # ESLint configuration
├── .gitignore                # Git ignore rules
├── components.json           # shadcn/ui config
├── jest.config.js            # Jest test config
├── middleware.ts             # Next.js middleware (auth)
├── next.config.ts            # Next.js configuration
├── package.json              # Dependencies
├── postcss.config.mjs        # PostCSS config
├── tailwind.config.ts        # Tailwind CSS config
└── tsconfig.json             # TypeScript config
```

---

## Source Code Structure (`/src`)

### `/src/app` - Pages & API Routes

```
app/
├── (auth)/                    # Auth pages (grouped)
│   ├── login/                # Login page
│   │   └── page.tsx
│   ├── register/             # Registration page
│   │   └── page.tsx
│   ├── verify-email/         # Email verification
│   │   └── page.tsx
│   ├── forgot-password/      # Password reset request
│   │   └── page.tsx
│   └── reset-password/       # Password reset form
│       └── page.tsx
│
├── admin/                     # Admin dashboard
│   ├── page.tsx              # Admin home
│   ├── layout.tsx            # Admin layout
│   ├── users/                # User management
│   │   └── page.tsx
│   ├── analytics/            # Analytics dashboard
│   │   └── page.tsx
│   ├── scenarios/            # Scenario management
│   │   ├── page.tsx
│   │   └── [id]/
│   │       └── edit/
│   │           └── page.tsx
│   └── settings/             # Admin settings
│       └── page.tsx
│
├── app/                       # Main app (protected)
│   ├── page.tsx              # App dashboard
│   ├── layout.tsx            # App layout
│   │
│   ├── kaiwa/                # Conversation module
│   │   ├── page.tsx          # Mode selection
│   │   ├── bebas/            # Free conversation
│   │   │   ├── page.tsx
│   │   │   └── FreeConversationClient.tsx
│   │   ├── roleplay/         # Task-based roleplay
│   │   │   ├── page.tsx
│   │   │   └── [conversationId]/
│   │   │       └── page.tsx
│   │   └── topic/            # Topic discussion
│   │       └── page.tsx
│   │
│   ├── fukushuu/             # Review/Flashcards
│   │   ├── page.tsx          # Review home
│   │   ├── drill/            # Flashcard drill
│   │   │   └── page.tsx
│   │   └── study-deck/       # Study deck system
│   │       └── page.tsx
│   │
│   ├── profile/              # User profile
│   │   ├── page.tsx          # Profile overview
│   │   ├── settings/         # User settings
│   │   │   └── page.tsx
│   │   └── characters/       # Character management
│   │       ├── page.tsx
│   │       ├── new/
│   │       │   └── page.tsx
│   │       └── [id]/
│   │           └── edit/
│   │               └── page.tsx
│   │
│   ├── history/              # Conversation history
│   │   └── page.tsx
│   │
│   ├── onboarding/           # User onboarding
│   │   └── page.tsx
│   │
│   └── scenarios/            # Scenario browsing
│       ├── page.tsx
│       └── [id]/
│           └── page.tsx
│
├── api/                       # API routes
│   ├── auth/                 # Authentication
│   │   ├── [...nextauth]/    # NextAuth handler
│   │   │   └── route.ts
│   │   ├── register/
│   │   │   └── route.ts
│   │   ├── verify-email/
│   │   │   └── route.ts
│   │   ├── resend-verification/
│   │   │   └── route.ts
│   │   ├── forgot-password/
│   │   │   └── route.ts
│   │   └── reset-password/
│   │       └── route.ts
│   │
│   ├── admin/                # Admin APIs
│   │   ├── users/
│   │   │   └── route.ts
│   │   ├── analytics/
│   │   │   └── route.ts
│   │   └── scenarios/
│   │       ├── route.ts
│   │       └── [id]/
│   │           └── route.ts
│   │
│   ├── chat/                 # Chat/AI APIs
│   │   ├── route.ts          # Main chat endpoint
│   │   ├── stream/           # SSE streaming
│   │   │   └── route.ts
│   │   ├── roleplay/         # Roleplay chat
│   │   │   └── route.ts
│   │   └── topic/            # Topic chat
│   │       └── route.ts
│   │
│   ├── conversations/        # Conversation CRUD
│   │   ├── route.ts
│   │   └── [id]/
│   │       ├── route.ts
│   │       └── messages/
│   │           └── route.ts
│   │
│   ├── flashcards/           # Flashcard system
│   │   ├── route.ts
│   │   ├── [id]/
│   │   │   └── route.ts
│   │   ├── review/
│   │   │   └── route.ts
│   │   ├── due/
│   │   │   └── route.ts
│   │   └── stats/
│   │       └── route.ts
│   │
│   ├── study-decks/          # Study deck APIs
│   │   ├── route.ts
│   │   └── [id]/
│   │       └── route.ts
│   │
│   ├── scenarios/            # Scenario APIs
│   │   ├── route.ts
│   │   └── [id]/
│   │       ├── route.ts
│   │       └── start/
│   │           └── route.ts
│   │
│   ├── characters/           # Character APIs
│   │   ├── route.ts
│   │   └── [id]/
│   │       └── route.ts
│   │
│   ├── voice/                # Voice processing
│   │   ├── transcribe/       # Speech-to-text
│   │   │   └── route.ts
│   │   └── synthesize/       # Text-to-speech
│   │       └── route.ts
│   │
│   ├── user/                 # User APIs
│   │   ├── route.ts          # Profile CRUD
│   │   ├── progress/
│   │   │   └── route.ts
│   │   ├── stats/
│   │   │   └── route.ts
│   │   ├── onboarding/
│   │   │   └── route.ts
│   │   └── settings/
│   │       └── route.ts
│   │
│   └── upload/               # File uploads
│       └── avatar/
│           └── route.ts
│
├── globals.css               # Global styles
├── layout.tsx                # Root layout
├── page.tsx                  # Landing page
└── not-found.tsx             # 404 page
```

---

### `/src/components` - React Components

```
components/
├── ui/                        # Base UI (shadcn/ui)
│   ├── button.tsx
│   ├── card.tsx
│   ├── dialog.tsx
│   ├── dropdown-menu.tsx
│   ├── input.tsx
│   ├── label.tsx
│   ├── select.tsx
│   ├── textarea.tsx
│   ├── toast.tsx
│   ├── toaster.tsx
│   ├── avatar.tsx
│   ├── avatar-picker.tsx     # Custom avatar picker
│   ├── badge.tsx
│   ├── progress.tsx
│   ├── skeleton.tsx
│   ├── slider.tsx
│   ├── switch.tsx
│   ├── tabs.tsx
│   └── tooltip.tsx
│
├── app/                       # App-specific components
│   ├── kaiwa/                # Conversation components
│   │   ├── ChatInterface.tsx
│   │   ├── ChatMessage.tsx
│   │   ├── ChatInput.tsx
│   │   ├── MessageList.tsx
│   │   ├── ConversationHeader.tsx
│   │   ├── VoiceInput.tsx
│   │   ├── AudioPlayer.tsx
│   │   ├── ModeSelector.tsx
│   │   ├── CharacterSelector.tsx
│   │   ├── TopicSelector.tsx
│   │   └── FeedbackPanel.tsx
│   │
│   ├── fukushuu/             # Review components
│   │   ├── FlashcardDeck.tsx
│   │   ├── FlashcardItem.tsx
│   │   ├── ReviewStats.tsx
│   │   ├── DeckSelector.tsx
│   │   ├── StudyDeckManager.tsx
│   │   └── ProgressChart.tsx
│   │
│   ├── scenarios/            # Scenario components
│   │   ├── ScenarioCard.tsx
│   │   ├── ScenarioList.tsx
│   │   ├── ScenarioDetail.tsx
│   │   ├── ScenarioFilters.tsx
│   │   └── DifficultyBadge.tsx
│   │
│   ├── profile/              # Profile components
│   │   ├── ProfileHeader.tsx
│   │   ├── ProfileStats.tsx
│   │   ├── SettingsForm.tsx
│   │   ├── CharactersTab.tsx
│   │   ├── CharactersClient.tsx
│   │   ├── CharacterForm.tsx
│   │   └── LevelProgress.tsx
│   │
│   ├── history/              # History components
│   │   ├── HistoryList.tsx
│   │   ├── HistoryItem.tsx
│   │   └── HistoryFilters.tsx
│   │
│   └── onboarding/           # Onboarding components
│       ├── OnboardingWizard.tsx
│       ├── StepIndicator.tsx
│       ├── LevelSelector.tsx
│       └── GoalSelector.tsx
│
├── admin/                     # Admin components
│   ├── AdminNav.tsx
│   ├── AdminSidebar.tsx
│   ├── UserTable.tsx
│   ├── AnalyticsChart.tsx
│   ├── ScenarioEditor.tsx
│   └── StatsCard.tsx
│
├── layout/                    # Layout components
│   ├── Navbar.tsx
│   ├── Footer.tsx
│   ├── Sidebar.tsx
│   ├── MobileNav.tsx
│   ├── AppShell.tsx
│   └── PageHeader.tsx
│
├── common/                    # Shared components
│   ├── LoadingSpinner.tsx
│   ├── ErrorBoundary.tsx
│   ├── EmptyState.tsx
│   ├── ConfirmDialog.tsx
│   ├── Pagination.tsx
│   └── SearchBar.tsx
│
└── auth/                      # Auth components
    ├── LoginForm.tsx
    ├── RegisterForm.tsx
    ├── SocialButtons.tsx
    └── ProtectedRoute.tsx
```

---

### `/src/lib` - Utilities & Services

```
lib/
├── prisma.ts                  # Prisma client singleton
├── auth.ts                    # NextAuth configuration
├── utils.ts                   # General utilities
│
├── ai/                        # AI services
│   ├── openai.ts             # OpenAI client
│   ├── chat-service.ts       # Chat completion
│   ├── assessment.ts         # Language assessment
│   ├── prompts/              # System prompts
│   │   ├── roleplay.ts
│   │   ├── free-chat.ts
│   │   └── feedback.ts
│   └── voice/                # Voice processing
│       ├── transcribe.ts
│       └── synthesize.ts
│
├── character/                 # Character services
│   └── character-service.ts  # Character CRUD
│
├── conversation/              # Conversation services
│   ├── conversation-service.ts
│   └── message-service.ts
│
├── flashcard/                 # Flashcard services
│   ├── flashcard-service.ts
│   ├── spaced-repetition.ts  # SM-2 algorithm
│   └── deck-service.ts
│
├── scenario/                  # Scenario services
│   └── scenario-service.ts
│
├── user/                      # User services
│   ├── user-service.ts
│   ├── progress-service.ts
│   └── stats-service.ts
│
├── email/                     # Email services
│   ├── email-service.ts
│   └── templates/
│       ├── verification.ts
│       └── password-reset.ts
│
├── upload/                    # File upload
│   └── upload-service.ts
│
└── validators/                # Validation schemas
    ├── auth.ts
    ├── user.ts
    ├── character.ts
    └── flashcard.ts
```

---

### `/src/hooks` - Custom React Hooks

```
hooks/
├── useAuth.ts                 # Authentication state
├── useUser.ts                 # User data & profile
├── useConversation.ts         # Conversation management
├── useFlashcards.ts           # Flashcard operations
├── useVoice.ts                # Voice input/output
├── useAudio.ts                # Audio playback
├── useToast.ts                # Toast notifications
├── useDebounce.ts             # Input debouncing
├── useLocalStorage.ts         # Local storage
├── useMounted.ts              # Mount state
├── useMediaQuery.ts           # Responsive detection
└── useIntersectionObserver.ts # Scroll detection
```

---

### `/src/types` - TypeScript Definitions

```
types/
├── index.ts                   # Main exports
├── auth.ts                    # Auth types
├── user.ts                    # User types
├── conversation.ts            # Conversation types
├── message.ts                 # Message types
├── character.ts               # Character types
├── scenario.ts                # Scenario types
├── flashcard.ts               # Flashcard types
└── api.ts                     # API response types
```

---

### `/src/providers` - React Context

```
providers/
├── AuthProvider.tsx           # NextAuth session
├── ThemeProvider.tsx          # Theme context
├── ToastProvider.tsx          # Toast notifications
└── index.tsx                  # Combined providers
```

---

## Database Schema (Prisma)

### Models

| Model                | Description                   |
| -------------------- | ----------------------------- |
| `User`               | User accounts & profiles      |
| `Account`            | OAuth accounts (Google, etc.) |
| `Session`            | User sessions                 |
| `VerificationToken`  | Email verification            |
| `PasswordResetToken` | Password reset                |
| `Character`          | AI conversation partners      |
| `Scenario`           | Roleplay scenarios            |
| `Conversation`       | Chat conversations            |
| `Message`            | Chat messages                 |
| `Flashcard`          | Vocabulary flashcards         |
| `StudyDeck`          | Flashcard collections         |
| `UserProgress`       | Learning progress             |
| `UserSettings`       | User preferences              |

### Key Relations

```
User
├── Characters (1:many)
├── Conversations (1:many)
├── Flashcards (1:many)
├── StudyDecks (1:many)
├── UserProgress (1:1)
└── UserSettings (1:1)

Conversation
├── User (many:1)
├── Character (many:1)
├── Scenario (many:1, optional)
└── Messages (1:many)

Flashcard
├── User (many:1)
└── StudyDeck (many:1, optional)
```

---

## Key Features

### 1. Conversation System

- **Free Chat**: Open-ended Japanese practice
- **Roleplay**: Task-based scenarios
- **Topic Discussion**: Structured conversations
- **Voice I/O**: Push-to-talk with STT/TTS

### 2. Assessment System

- Grammar accuracy scoring
- Vocabulary appropriateness
- Cultural context awareness
- Fluency evaluation

### 3. Flashcard System

- Spaced repetition (SM-2)
- Study deck organization
- Due card tracking
- Progress statistics

### 4. Character System

- Custom AI personalities
- Avatar customization
- Personality traits
- Speaking styles

### 5. Admin Dashboard

- User management
- Analytics & metrics
- Scenario CRUD
- System settings

---

## Development Commands

```bash
# Install dependencies
npm install

# Development server
npm run dev

# Build production
npm run build

# Run tests
npm test

# Linting
npm run lint

# Database
npx prisma migrate dev    # Run migrations
npx prisma studio         # Open Prisma Studio
npx prisma generate       # Generate client
```

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

# Email (optional)
SMTP_HOST=
SMTP_PORT=
SMTP_USER=
SMTP_PASS=
EMAIL_FROM=
```

---

_Last updated: November 2024_
