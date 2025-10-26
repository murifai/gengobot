# Gengobot Documentation

Complete documentation for the Gengobot Japanese language learning platform.

## 📚 Documentation Structure

### 🔧 Setup & Configuration

**Location:** `docs/setup/`

- [Database Setup](./setup/DATABASE_SETUP_COMPLETE.md) - Database configuration and initialization
- [Get Database URL](./setup/GET_DATABASE_URL.md) - Instructions for obtaining database connection strings
- [Admin Setup](./setup/ADMIN_SETUP.md) - Admin panel configuration and management
- [Reseed Guide](./setup/RESEED_GUIDE.md) - Database seeding and data reset procedures
- [Test Accounts](./setup/TEST_ACCOUNTS.md) - Test user credentials for development

### 💻 Development

**Location:** `docs/development/`

- [Development Plan](./development/Gengobot-app-dev-plan.md) - Overall project development roadmap
- [Application Documentation](./development/Gengobot-app-doc.md) - Comprehensive app architecture and features
- [Authentication Summary](./development/AUTH_SUMMARY.md) - Authentication system overview
- [Restart Dev Server](./development/RESTART_DEV_SERVER.md) - Development server troubleshooting
- [Study Deck Implementation](./development/STUDY_DECK_IMPLEMENTATION.md) - Flashcard system implementation details

### 🎯 Feature Documentation

**Location:** `docs/features/`

- [Interactive Japanese Text](./features/INTERACTIVE_JAPANESE_TEXT.md) - Japanese text rendering and interaction
- [Clickable Words Guide](./features/CLICKABLE_WORDS_GUIDE.md) - Word lookup functionality
- [Offline Dictionary](./features/OFFLINE_DICTIONARY.md) - Local dictionary integration
- [Furigana Usage](./features/FURIGANA_USAGE.md) - Reading aids implementation

### 📘 Setup Guides

**Location:** `docs/guides/`

- [Dictionary Setup Guide](./guides/DICTIONARY_SETUP_GUIDE.md) - Setting up offline dictionary
- [Furigana Setup Summary](./guides/FURIGANA_SETUP_SUMMARY.md) - Configuring furigana system
- [Furigana Test](./guides/FURIGANA_TEST.md) - Testing furigana functionality
- [AI Response Improvements](./guides/AI_RESPONSE_IMPROVEMENTS.md) - Optimizing AI responses
- [Task Attempt Guide](./guides/TASK_ATTEMPT_GUIDE.md) - Task-based learning workflow

### 🔄 Migration & Implementation

**Location:** Root of `docs/`

- [Anki Deck Learning Implementation](./ANKI_DECK_LEARNING_IMPLEMENTATION.md) - Flashcard system details
- [Deck Implementation Summary](./DECK_IMPLEMENTATION_SUMMARY.md) - Deck feature overview
- [Deck Quick Start](./DECK_QUICK_START.md) - Getting started with decks
- [Flashcard Editor Complete](./FLASHCARD_EDITOR_COMPLETE.md) - Editor implementation
- [Migration Complete](./MIGRATION_COMPLETE.md) - Database migration status
- [Migration Instructions](./MIGRATION_INSTRUCTIONS.md) - How to run migrations
- [Migration Success](./MIGRATION_SUCCESS.md) - Migration verification
- [Final Status](./FINAL_STATUS.md) - Overall project status

### 📊 Phase Completions

**Location:** `docs/phases/`

- [Phase 1 Summary](./phases/Phase-1-Summary.md) - Initial setup and core infrastructure
- [Phase 2.1 Completion](./phases/phase-2.1-completion.md) - Character system implementation
- [Phase 2.2 Completion](./phases/PHASE-2.2-COMPLETION.md) - Free chat functionality
- [Phase 2.3 Completion](./phases/PHASE-2.3-COMPLETION.md) - Conversation management
- [Phase 3.1 Completion](./phases/PHASE-3.1-COMPLETION.md) - Task-based learning system
- [Phase 3.2 Completion](./phases/PHASE-3.2-COMPLETION.md) - Chat integration
- [Phase 3.3 Completion](./phases/PHASE-3.3-COMPLETION.md) - Voice interaction system
- [Phase 4.5 UX Enhancement](./phases/phase-4.5-ux-enhancement-guide.md) - User experience improvements

### 🔒 Security

**Location:** `docs/security/`

- [Security Guidelines](./security/SECURITY.md) - Security best practices and implementation

## 🚀 Quick Start

1. **Setup**: Start with [Database Setup](./setup/DATABASE_SETUP_COMPLETE.md)
2. **Development**: Review [Development Plan](./development/Gengobot-app-dev-plan.md)
3. **Testing**: Use [Test Accounts](./setup/TEST_ACCOUNTS.md) for development

## 📖 Features

### Core Systems

- **Authentication & User Management** - Supabase-based auth with JLPT level tracking
- **Character System** - AI characters with personalities and relationships
- **Free Chat** - Real-time conversations with AI characters
- **Task-Based Learning** - Structured learning with scenarios and objectives
- **Voice Integration** - Speech-to-text and text-to-speech for immersive learning
- **Admin Panel** - Character and task management interface

### Recent Additions (Phase 4.5)

- ✅ Voice input/output for task-based chat
- ✅ Unified chat interface for all conversation types
- ✅ Enhanced error handling and validation
- ✅ Auto-play voice responses
- ✅ Toggle between voice and text modes

## 🛠️ Tech Stack

- **Frontend**: Next.js 15, React, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, Prisma ORM
- **Database**: PostgreSQL (Supabase)
- **Authentication**: Supabase Auth
- **AI Services**: OpenAI GPT-4, Whisper, TTS
- **Voice Processing**: Web Audio API, MediaRecorder API

## 📝 Contributing

When updating documentation:

1. **Setup guides** → `docs/setup/` - Database, admin, configuration
2. **Development docs** → `docs/development/` - Architecture, implementation details
3. **Feature docs** → `docs/features/` - Japanese text, dictionary, furigana
4. **User guides** → `docs/guides/` - Setup instructions, testing, workflows
5. **Phase completions** → `docs/phases/` - Development milestones
6. **Security docs** → `docs/security/` - Security best practices
7. **Migration/Implementation** → Root of `docs/` - Major feature implementations
8. Always update this README.md index

## 🛠️ Available Scripts

See project root [package.json](../package.json) for all available scripts, organized by category:

**Development:**

- `npm run dev` - Start development server with Turbopack
- `npm run build` - Build production bundle
- `npm start` - Start production server

**Code Quality:**

- `npm run lint` / `npm run lint:fix` - ESLint checks
- `npm run format:check` / `npm run format:write` - Prettier formatting
- `npm run type-check` - TypeScript validation

**Testing:**

- `npm test` - Run Jest unit tests
- `npm run test:watch` - Jest in watch mode
- `npm run test:coverage` - Generate coverage report
- `npm run test:e2e` - Run Playwright E2E tests

**Database:**

- `npm run db:generate` - Generate Prisma client
- `npm run db:migrate` - Run migrations (dev)
- `npm run db:migrate:deploy` - Run migrations (production)
- `npm run db:seed` - Seed database
- `npm run db:reset` - Reset database
- `npm run db:studio` - Open Prisma Studio

**User Management:**

- `npm run user:create` - Create test users
- `npm run user:create-db` - Create DB users
- `npm run user:list` - List all users
- `npm run user:set-admin` - Set admin privileges

**Setup:**

- `npm run setup:furigana` - Setup furigana dictionary

## 📅 Latest Updates

**October 2025** - Phase 4.5: Voice Chat Implementation

- Fixed voice input validation (duration conversion)
- Implemented voice output with audio playback
- Added auto-play for voice conversations
- Improved error handling and user feedback
