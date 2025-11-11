# Gengotalk

Aplikasi pembelajaran bahasa Jepang berbasis AI yang meningkatkan kemampuan berbicara melalui percakapan roleplay interaktif berbasis tugas.

## 🌟 Fitur Utama

- **Task-Based Chat**: Skenario pembelajaran terstruktur dengan manajemen tugas komprehensif
- **Flashcard System**: Sistem SRS dengan kartu kanji, kosakata, dan tata bahasa
- **Voice Processing**: Integrasi OpenAI Whisper untuk speech-to-text dan TTS dengan push-to-talk
- **Japanese Learning Assessment**: Evaluasi berdasarkan 4 kriteria (タスク達成度, 流暢さ, 語彙・文法的正確さ, 丁寧さ)
- **JLPT Level Tracking**: Pelacakan kemajuan dari N5 hingga N1
- **Character System**: Karakter AI dengan personalitas untuk percakapan imersif

## 🛠️ Tech Stack

- **Frontend**: Next.js 15, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, Prisma ORM
- **Database**: PostgreSQL
- **Authentication**: NextAuth.js
- **AI**: OpenAI GPT-4, Whisper, TTS
- **Testing**: Jest, Playwright

## 📋 Prerequisites

- Node.js 22+
- PostgreSQL
- OpenAI API Key

## 🚀 Getting Started

### 1. Clone dan Install Dependencies

```bash
git clone https://github.com/yourusername/gengobot.git
cd gengobot
npm install
```

### 2. Setup Environment Variables

```bash
cp .env.example .env.local
```

Edit `.env.local` dengan kredensial Anda:

```env
DATABASE_URL=your_postgresql_url
OPENAI_API_KEY=your_openai_key
NEXTAUTH_SECRET=your_nextauth_secret
NEXTAUTH_URL=http://localhost:3000
```

### 3. Setup Database

```bash
# Generate Prisma Client
npm run db:generate

# Run migrations
npm run db:migrate

# Seed database dengan data contoh
npm run db:seed
```

### 4. Run Development Server

```bash
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000) di browser Anda.

## 📝 Available Scripts

```bash
npm run dev              # Start development server
npm run build            # Build untuk production
npm start                # Start production server
npm run lint             # Run ESLint
npm run lint:fix         # Fix ESLint errors
npm run format:check     # Check Prettier formatting
npm run format:write     # Format code dengan Prettier
npm run type-check       # TypeScript type checking
npm run test             # Run unit tests
npm run test:watch       # Run tests dalam watch mode
npm run test:coverage    # Generate coverage report
npm run test:e2e         # Run E2E tests dengan Playwright
npm run db:migrate       # Create dan apply migration
npm run db:seed          # Seed database
npm run db:studio        # Open Prisma Studio
npm run db:generate      # Generate Prisma Client
```

## 🐳 Docker Development

```bash
# Build dan start services
docker-compose up -d

# Stop services
docker-compose down

# View logs
docker-compose logs -f
```

## 🧪 Testing

```bash
# Run semua tests
npm test

# Run specific test file
npm test -- __tests__/setup/config.test.ts

# Run tests dengan coverage
npm run test:coverage

# Run E2E tests
npm run test:e2e
```

## 📁 Project Structure

```
gengobot/
├── src/
│   ├── app/                 # Next.js App Router
│   ├── components/          # React components
│   │   ├── ui/             # UI components
│   │   ├── voice/          # Voice processing
│   │   ├── chat/           # Chat interface
│   │   ├── admin/          # Admin panels
│   │   └── layout/         # Layout components
│   ├── lib/                # Utility libraries
│   │   ├── ai/             # OpenAI integration
│   │   ├── auth/           # Authentication
│   │   ├── db/             # Database utilities
│   │   └── utils/          # Helper functions
│   ├── types/              # TypeScript types
│   └── hooks/              # React hooks
├── prisma/                 # Database schema & migrations
├── __tests__/              # Test files
├── public/                 # Static assets
└── docs/                   # Documentation

```

## 🎨 Custom Colors

```css
--primary: #ff5e75;
--secondary: #1dcddc;
--tertiary-yellow: #fdf29d;
--tertiary-green: #8bd17b;
--tertiary-purple: #4a3e72;
--dark: #0c1231;
```

## 📖 Documentation

Lihat [Documentation](./docs/README.md) untuk panduan lengkap:

- [Setup Guide](./docs/setup/DATABASE_SETUP_COMPLETE.md) - Database dan environment setup
- [Development Plan](./docs/development/Gengobot-app-dev-plan.md) - Roadmap pengembangan
- [Deployment Guide](./docs/deployment/QUICK_START.md) - Panduan deployment
- [User Guides](./docs/guides/) - Panduan penggunaan

## 🤝 Contributing

1. Fork repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'feat: Add AmazingFeature'`)
4. Push ke branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

## 📄 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- Next.js Team
- OpenAI
- Supabase
- Prisma
