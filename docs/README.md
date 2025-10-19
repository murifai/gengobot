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

1. Place setup guides in `docs/setup/`
2. Development docs in `docs/development/`
3. Phase completions in `docs/phases/`
4. Security docs in `docs/security/`
5. Update this README.md index

## 📅 Latest Updates

**October 2025** - Phase 4.5: Voice Chat Implementation

- Fixed voice input validation (duration conversion)
- Implemented voice output with audio playback
- Added auto-play for voice conversations
- Improved error handling and user feedback
