# Gengobot Documentation

Complete documentation for Gengobot - an AI-powered Japanese language learning platform.

## 📚 Quick Links

- [Main README](../README.md) - Project overview and quick start
- [Setup Guide](./setup/DATABASE_SETUP_COMPLETE.md) - Database and environment setup
- [Deployment Guide](./deployment/QUICK_START.md) - Production deployment instructions
- [Security Guidelines](./security/SECURITY.md) - Security best practices

## 🚀 Getting Started

### For Developers

1. **Initial Setup**
   - [Database Setup](./setup/DATABASE_SETUP_COMPLETE.md)
   - [Get Database URL](./setup/GET_DATABASE_URL.md)
   - [Admin Setup](./setup/ADMIN_SETUP.md)
   - [Test Accounts](./setup/TEST_ACCOUNTS.md)

2. **Development Resources**
   - [Development Plan](./development/Gengobot-app-dev-plan.md) - Project roadmap
   - [App Documentation](./development/Gengobot-app-doc.md) - Architecture & features
   - [Authentication](./development/AUTH_SUMMARY.md) - Auth system overview
   - [Cost Optimization](./development/COST_OPTIMIZATION.md) - API cost strategies

### For Users

- [Deck Quick Start](./guides/DECK_QUICK_START.md) - Create and study flashcard decks
- [Task Attempt Guide](./guides/TASK_ATTEMPT_GUIDE.md) - How to complete learning tasks

## 🎯 Core Features

### Task-Based Learning

Structured learning scenarios with AI-powered conversations and automatic assessment based on JLPT criteria.

### Flashcard System

Spaced repetition learning with kanji, vocabulary, and grammar cards.

### Voice Integration

- Speech-to-text (OpenAI Whisper)
- Text-to-speech for Japanese responses
- Push-to-talk functionality
- See: [Push-to-Talk Features](./features/PTT_FEATURES.md)

### Character System

AI characters with personalities for immersive conversations.

## 🛠️ Tech Stack

- **Frontend**: Next.js 15, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, Prisma ORM
- **Database**: PostgreSQL
- **Authentication**: NextAuth.js
- **AI**: OpenAI GPT-4, Whisper, TTS

## 📁 Documentation Structure

```
docs/
├── README.md                    # This file
├── setup/                       # Initial setup guides
├── deployment/                  # Deployment instructions
├── development/                 # Development documentation
├── features/                    # Feature-specific docs
├── guides/                      # User guides
└── security/                    # Security documentation
```

## 🔧 Maintenance

### Database Operations

- [Reseed Guide](./setup/RESEED_GUIDE.md) - Reset and seed database

### Deployment

- [Quick Start](./deployment/QUICK_START.md) - Fast deployment
- [VPS Guide](./deployment/VPS_DEPLOYMENT_GUIDE.md) - Full VPS setup

## 🤝 Contributing

When adding documentation:

1. Place setup guides in `docs/setup/`
2. Development docs in `docs/development/`
3. Feature docs in `docs/features/`
4. User guides in `docs/guides/`
5. Update this README with links

## 📝 Notes

- Main README is in the project root
- All environment variables are documented in `.env.example`
- Test accounts are available in [TEST_ACCOUNTS.md](./setup/TEST_ACCOUNTS.md)
