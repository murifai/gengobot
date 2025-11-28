# PLAN-07: Exam/UJIAN System (NEW FEATURE)

## Overview

Implementasi fitur UJIAN baru yang mencakup flashcard drill integration, JLPT nilai checker, tryout JLPT, dan statistik kesiapan.

**Priority**: LOW (tapi kompleks)
**Complexity**: Very High
**Sessions**: 3-4

**Dependencies**: Phase 3 (Statistics), Phase 4 (Dictionary)

---

## Feature Overview

### UJIAN memiliki 4 sub-fitur:

1. **Flashcard Drill Integration** - Koneksi flashcard ke drill deck untuk study
2. **Cek Nilai JLPT** - Input hasil test JLPT offline
3. **Tryout JLPT** - Full tryout dengan timer dan scoring
4. **Statistik Kesiapan** - Seberapa siap ikut JLPT berdasarkan data

---

## Database Schema

**File**: `prisma/schema.prisma`

```prisma
// JLPT Exam Attempt (Tryout)
model JlptExam {
  id            String   @id @default(cuid())
  level         String   // N5, N4, N3, N2, N1
  title         String
  description   String?
  timeLimit     Int      // in minutes
  totalQuestions Int

  // Sections
  sections      JlptExamSection[]

  // Attempts
  attempts      JlptExamAttempt[]

  isActive      Boolean  @default(true)
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  @@index([level])
}

model JlptExamSection {
  id            String   @id @default(cuid())
  examId        String
  exam          JlptExam @relation(fields: [examId], references: [id], onDelete: Cascade)

  name          String   // 文字・語彙, 文法, 読解, 聴解
  nameId        String   // Kosakata, Tata Bahasa, Membaca, Mendengar
  order         Int
  timeLimit     Int?     // Section time limit (optional)
  totalPoints   Int

  questions     JlptQuestion[]

  @@index([examId])
}

model JlptQuestion {
  id            String   @id @default(cuid())
  sectionId     String
  section       JlptExamSection @relation(fields: [sectionId], references: [id], onDelete: Cascade)

  questionType  JlptQuestionType
  order         Int
  points        Int      @default(1)

  // Question content (JSON for flexibility)
  content       Json     // { text, image?, audio?, options, correctAnswer }

  // Related vocabulary (for study recommendation)
  relatedWords  String[] // Array of dictionary entry IDs

  answers       JlptAnswer[]

  @@index([sectionId])
}

enum JlptQuestionType {
  VOCABULARY      // 語彙問題
  KANJI_READING   // 漢字読み
  KANJI_MEANING   // 漢字意味
  GRAMMAR         // 文法問題
  SENTENCE_ORDER  // 文の組み立て
  READING         // 読解問題
  LISTENING       // 聴解問題
}

model JlptExamAttempt {
  id            String   @id @default(cuid())
  userId        String
  user          User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  examId        String
  exam          JlptExam @relation(fields: [examId], references: [id], onDelete: Cascade)

  // Timing
  startTime     DateTime
  endTime       DateTime?
  timeSpent     Int?     // in seconds

  // Results
  answers       JlptAnswer[]
  score         Float?   // 0-180 scale (like real JLPT)
  sectionScores Json?    // { vocabulary: 60, grammar: 60, reading: 60 }
  isPassed      Boolean?
  status        ExamAttemptStatus @default(IN_PROGRESS)

  createdAt     DateTime @default(now())

  @@index([userId])
  @@index([examId])
}

enum ExamAttemptStatus {
  IN_PROGRESS
  COMPLETED
  ABANDONED
  TIMED_OUT
}

model JlptAnswer {
  id            String   @id @default(cuid())
  attemptId     String
  attempt       JlptExamAttempt @relation(fields: [attemptId], references: [id], onDelete: Cascade)
  questionId    String
  question      JlptQuestion @relation(fields: [questionId], references: [id], onDelete: Cascade)

  answer        String   // User's selected answer
  isCorrect     Boolean
  timeSpent     Int?     // Time spent on this question (seconds)

  @@unique([attemptId, questionId])
  @@index([attemptId])
}

// Offline JLPT Score Entry
model JlptOfflineScore {
  id            String   @id @default(cuid())
  userId        String
  user          User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  level         String   // N5, N4, N3, N2, N1
  testDate      DateTime
  totalScore    Int      // 0-180
  isPassed      Boolean

  // Section scores
  vocabularyScore Int?   // 言語知識(文字・語彙)
  grammarScore    Int?   // 言語知識(文法)・読解
  listeningScore  Int?   // 聴解

  // Certificate info (optional)
  certificateNumber String?
  certificateImage  String?  // URL to uploaded image

  notes         String?
  createdAt     DateTime @default(now())

  @@index([userId])
  @@index([level])
}

// JLPT Readiness Assessment
model JlptReadinessScore {
  id            String   @id @default(cuid())
  userId        String   @unique
  user          User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  // Current estimated level
  estimatedLevel String  // N5, N4, N3, N2, N1

  // Readiness scores by level (0-100%)
  n5Readiness   Float    @default(0)
  n4Readiness   Float    @default(0)
  n3Readiness   Float    @default(0)
  n2Readiness   Float    @default(0)
  n1Readiness   Float    @default(0)

  // Component scores
  vocabularyScore Float  @default(0)
  kanjiScore      Float  @default(0)
  grammarScore    Float  @default(0)
  readingScore    Float  @default(0)
  listeningScore  Float  @default(0)

  // Last calculation
  lastCalculated DateTime @default(now())
  calculationBasis Json   // { flashcards, tryouts, conversations, etc. }

  updatedAt     DateTime @updatedAt
}
```

---

## Session 1: Database & Core APIs

### Tasks:

#### 1.1 Create Database Migration

Run after adding schema:

```bash
npx prisma migrate dev --name add_jlpt_exam_system
```

#### 1.2 Create JLPT Constants

**File**: `src/lib/constants/jlpt.ts`

```typescript
export const JLPT_LEVELS = ['N5', 'N4', 'N3', 'N2', 'N1'] as const;
export type JlptLevel = (typeof JLPT_LEVELS)[number];

export const JLPT_SECTIONS = {
  VOCABULARY: { ja: '言語知識(文字・語彙)', id: 'Kosakata' },
  GRAMMAR: { ja: '言語知識(文法)・読解', id: 'Tata Bahasa & Membaca' },
  READING: { ja: '読解', id: 'Membaca' },
  LISTENING: { ja: '聴解', id: 'Mendengar' },
};

// Passing scores (based on official JLPT)
export const JLPT_PASSING_SCORES: Record<JlptLevel, number> = {
  N5: 80, // out of 180
  N4: 90,
  N3: 95,
  N2: 90,
  N1: 100,
};

// Section minimum scores
export const JLPT_SECTION_MINIMUMS: Record<
  JlptLevel,
  { vocabulary: number; grammar: number; listening: number }
> = {
  N5: { vocabulary: 38, grammar: 38, listening: 38 },
  N4: { vocabulary: 38, grammar: 38, listening: 38 },
  N3: { vocabulary: 19, grammar: 19, listening: 19 },
  N2: { vocabulary: 19, grammar: 19, listening: 19 },
  N1: { vocabulary: 19, grammar: 19, listening: 19 },
};

// Time limits (in minutes)
export const JLPT_TIME_LIMITS: Record<JlptLevel, number> = {
  N5: 80,
  N4: 95,
  N3: 120,
  N2: 155,
  N1: 170,
};

// Total questions (approximate)
export const JLPT_QUESTION_COUNTS: Record<JlptLevel, number> = {
  N5: 80,
  N4: 95,
  N3: 100,
  N2: 110,
  N1: 120,
};
```

#### 1.3 Create Exam Service

**File**: `src/lib/exam/exam-service.ts`

```typescript
import { prisma } from '../prisma';
import { JLPT_PASSING_SCORES, JLPT_SECTION_MINIMUMS } from '../constants/jlpt';

export async function getAvailableExams(level?: string) {
  return prisma.jlptExam.findMany({
    where: {
      isActive: true,
      ...(level && { level }),
    },
    include: {
      sections: {
        orderBy: { order: 'asc' },
      },
      _count: {
        select: { attempts: true },
      },
    },
    orderBy: { level: 'asc' },
  });
}

export async function startExamAttempt(userId: string, examId: string) {
  // Check for existing in-progress attempt
  const existing = await prisma.jlptExamAttempt.findFirst({
    where: {
      userId,
      examId,
      status: 'IN_PROGRESS',
    },
  });

  if (existing) {
    return existing;
  }

  return prisma.jlptExamAttempt.create({
    data: {
      userId,
      examId,
      startTime: new Date(),
      status: 'IN_PROGRESS',
    },
    include: {
      exam: {
        include: {
          sections: {
            include: {
              questions: true,
            },
            orderBy: { order: 'asc' },
          },
        },
      },
    },
  });
}

export async function submitAnswer(
  attemptId: string,
  questionId: string,
  answer: string,
  timeSpent: number
) {
  // Get correct answer
  const question = await prisma.jlptQuestion.findUnique({
    where: { id: questionId },
  });

  if (!question) {
    throw new Error('Question not found');
  }

  const content = question.content as { correctAnswer: string };
  const isCorrect = answer === content.correctAnswer;

  return prisma.jlptAnswer.upsert({
    where: {
      attemptId_questionId: { attemptId, questionId },
    },
    create: {
      attemptId,
      questionId,
      answer,
      isCorrect,
      timeSpent,
    },
    update: {
      answer,
      isCorrect,
      timeSpent,
    },
  });
}

export async function completeExam(attemptId: string) {
  const attempt = await prisma.jlptExamAttempt.findUnique({
    where: { id: attemptId },
    include: {
      exam: true,
      answers: {
        include: {
          question: {
            include: { section: true },
          },
        },
      },
    },
  });

  if (!attempt) {
    throw new Error('Attempt not found');
  }

  // Calculate scores
  const scores = calculateExamScores(attempt);

  // Determine if passed
  const level = attempt.exam.level as keyof typeof JLPT_PASSING_SCORES;
  const isPassed =
    scores.totalScore >= JLPT_PASSING_SCORES[level] &&
    scores.sectionScores.vocabulary >= JLPT_SECTION_MINIMUMS[level].vocabulary &&
    scores.sectionScores.grammar >= JLPT_SECTION_MINIMUMS[level].grammar &&
    scores.sectionScores.listening >= JLPT_SECTION_MINIMUMS[level].listening;

  // Update attempt
  return prisma.jlptExamAttempt.update({
    where: { id: attemptId },
    data: {
      endTime: new Date(),
      timeSpent: Math.round((Date.now() - attempt.startTime.getTime()) / 1000),
      score: scores.totalScore,
      sectionScores: scores.sectionScores,
      isPassed,
      status: 'COMPLETED',
    },
  });
}

function calculateExamScores(attempt: any) {
  // Group answers by section
  const sectionScores: Record<string, { correct: number; total: number; points: number }> = {};

  for (const answer of attempt.answers) {
    const sectionName = answer.question.section.name;
    if (!sectionScores[sectionName]) {
      sectionScores[sectionName] = { correct: 0, total: 0, points: 0 };
    }
    sectionScores[sectionName].total++;
    if (answer.isCorrect) {
      sectionScores[sectionName].correct++;
      sectionScores[sectionName].points += answer.question.points;
    }
  }

  // Convert to JLPT scale (0-60 per section, 0-180 total)
  const vocabulary = Math.round(
    (sectionScores['文字・語彙']?.correct / sectionScores['文字・語彙']?.total || 0) * 60
  );
  const grammar = Math.round(
    (sectionScores['文法']?.correct / sectionScores['文法']?.total || 0) * 60
  );
  const listening = Math.round(
    (sectionScores['聴解']?.correct / sectionScores['聴解']?.total || 0) * 60
  );

  return {
    totalScore: vocabulary + grammar + listening,
    sectionScores: {
      vocabulary,
      grammar,
      listening,
    },
    details: sectionScores,
  };
}
```

#### 1.4 Create Exam API Routes

**File**: `src/app/api/exam/route.ts`

```typescript
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/config';
import { getAvailableExams } from '@/lib/exam/exam-service';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const level = searchParams.get('level');

  const exams = await getAvailableExams(level || undefined);

  return NextResponse.json({ exams });
}
```

**File**: `src/app/api/exam/[examId]/start/route.ts`

```typescript
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/config';
import { startExamAttempt } from '@/lib/exam/exam-service';

export async function POST(request: Request, { params }: { params: { examId: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const attempt = await startExamAttempt(session.user.id, params.examId);

  return NextResponse.json({ attempt });
}
```

### Checklist Session 1:

- [ ] Add exam models to schema
- [ ] Run database migration
- [ ] Create JLPT constants
- [ ] Create exam service
- [ ] Create exam API routes
- [ ] Create answer submission API
- [ ] Create exam completion API

---

## Session 2: Tryout UI

### Tasks:

#### 2.1 Create Exam List Page

**File**: `src/app/app/ujian/page.tsx`

```tsx
'use client';

import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Clock, FileQuestion, Trophy } from 'lucide-react';
import Link from 'next/link';
import { JLPT_TIME_LIMITS } from '@/lib/constants/jlpt';

export default function UjianPage() {
  const { data: exams, isLoading } = useQuery({
    queryKey: ['exams'],
    queryFn: () => fetch('/api/exam').then(r => r.json()),
  });

  return (
    <div className="container max-w-4xl py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">UJIAN JLPT</h1>
        <p className="text-muted-foreground">Uji kemampuan bahasa Jepangmu dengan tryout JLPT</p>
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <QuickLinkCard
          href="/app/ujian/nilai"
          icon={Trophy}
          title="Cek Nilai"
          description="Input hasil JLPT offline"
        />
        <QuickLinkCard
          href="/app/ujian/statistik"
          icon={FileQuestion}
          title="Statistik"
          description="Kesiapan JLPT"
        />
        {/* ... more quick links */}
      </div>

      {/* Exam List */}
      <h2 className="text-xl font-bold mb-4">Tryout Tersedia</h2>
      <div className="space-y-4">
        {exams?.exams?.map((exam: any) => (
          <ExamCard key={exam.id} exam={exam} />
        ))}
      </div>
    </div>
  );
}

function ExamCard({ exam }: { exam: any }) {
  return (
    <Card className="border-3 border-border shadow-neo hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all">
      <CardContent className="flex items-center justify-between p-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Badge variant="secondary">{exam.level}</Badge>
            <span className="font-bold text-lg">{exam.title}</span>
          </div>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              {exam.timeLimit} menit
            </span>
            <span className="flex items-center gap-1">
              <FileQuestion className="h-4 w-4" />
              {exam.totalQuestions} soal
            </span>
          </div>
        </div>
        <Button asChild>
          <Link href={`/app/ujian/tryout/${exam.id}`}>Mulai</Link>
        </Button>
      </CardContent>
    </Card>
  );
}
```

#### 2.2 Create Tryout Page (Exam Taking)

**File**: `src/app/app/ujian/tryout/[examId]/page.tsx`

```tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Clock, ChevronLeft, ChevronRight, Flag } from 'lucide-react';

export default function TryoutPage({ params }: { params: { examId: string } }) {
  const router = useRouter();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [timeLeft, setTimeLeft] = useState(0);

  // Start exam attempt
  const { data: attempt, isLoading } = useQuery({
    queryKey: ['exam-attempt', params.examId],
    queryFn: async () => {
      const res = await fetch(`/api/exam/${params.examId}/start`, { method: 'POST' });
      return res.json();
    },
  });

  // Submit answer mutation
  const submitAnswer = useMutation({
    mutationFn: async ({ questionId, answer }: { questionId: string; answer: string }) => {
      return fetch(`/api/exam/attempt/${attempt?.attempt?.id}/answer`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ questionId, answer, timeSpent: 0 }),
      });
    },
  });

  // Complete exam mutation
  const completeExam = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/exam/attempt/${attempt?.attempt?.id}/complete`, {
        method: 'POST',
      });
      return res.json();
    },
    onSuccess: data => {
      router.push(`/app/ujian/hasil/${data.id}`);
    },
  });

  // Timer
  useEffect(() => {
    if (attempt?.attempt?.exam?.timeLimit) {
      setTimeLeft(attempt.attempt.exam.timeLimit * 60); // Convert to seconds
    }
  }, [attempt]);

  useEffect(() => {
    if (timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          completeExam.mutate();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft]);

  const questions = attempt?.attempt?.exam?.sections?.flatMap((s: any) => s.questions) || [];
  const currentQ = questions[currentQuestion];

  const handleAnswer = (answer: string) => {
    setAnswers({ ...answers, [currentQ.id]: answer });
    submitAnswer.mutate({ questionId: currentQ.id, answer });
  };

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  if (isLoading) return <ExamSkeleton />;

  return (
    <div className="min-h-screen bg-background">
      {/* Header with Timer */}
      <header className="sticky top-0 z-50 bg-background border-b-3 border-border p-4">
        <div className="container max-w-4xl flex items-center justify-between">
          <div>
            <p className="font-bold">{attempt?.attempt?.exam?.title}</p>
            <p className="text-sm text-muted-foreground">
              Soal {currentQuestion + 1} dari {questions.length}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div
              className={`flex items-center gap-2 font-mono text-lg ${
                timeLeft < 300 ? 'text-red-500 animate-pulse' : ''
              }`}
            >
              <Clock className="h-5 w-5" />
              {formatTime(timeLeft)}
            </div>
            <Button variant="destructive" onClick={() => completeExam.mutate()}>
              <Flag className="h-4 w-4 mr-2" />
              Selesai
            </Button>
          </div>
        </div>
      </header>

      {/* Progress */}
      <div className="container max-w-4xl py-4">
        <Progress value={((currentQuestion + 1) / questions.length) * 100} />
      </div>

      {/* Question */}
      <main className="container max-w-4xl py-8">
        {currentQ && (
          <Card className="border-3 border-border shadow-neo">
            <CardContent className="p-8">
              {/* Question Content */}
              <div className="mb-8">
                <p className="text-lg font-medium mb-4">{(currentQ.content as any).text}</p>
                {(currentQ.content as any).image && (
                  <img
                    src={(currentQ.content as any).image}
                    alt="Question"
                    className="max-w-md mx-auto mb-4 border-2 border-border rounded"
                  />
                )}
                {(currentQ.content as any).audio && (
                  <audio controls src={(currentQ.content as any).audio} className="w-full mb-4" />
                )}
              </div>

              {/* Options */}
              <RadioGroup
                value={answers[currentQ.id] || ''}
                onValueChange={handleAnswer}
                className="space-y-3"
              >
                {(currentQ.content as any).options?.map((option: string, i: number) => (
                  <div
                    key={i}
                    className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                      answers[currentQ.id] === option
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:bg-muted'
                    }`}
                    onClick={() => handleAnswer(option)}
                  >
                    <RadioGroupItem value={option} id={`option-${i}`} />
                    <Label htmlFor={`option-${i}`} className="ml-3 cursor-pointer flex-1">
                      {option}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </CardContent>
          </Card>
        )}

        {/* Navigation */}
        <div className="flex justify-between mt-8">
          <Button
            variant="outline"
            onClick={() => setCurrentQuestion(Math.max(0, currentQuestion - 1))}
            disabled={currentQuestion === 0}
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            Sebelumnya
          </Button>
          <Button
            onClick={() => setCurrentQuestion(Math.min(questions.length - 1, currentQuestion + 1))}
            disabled={currentQuestion === questions.length - 1}
          >
            Selanjutnya
            <ChevronRight className="h-4 w-4 ml-2" />
          </Button>
        </div>

        {/* Question Navigator */}
        <div className="mt-8 p-4 border-2 border-border rounded-lg">
          <p className="font-medium mb-3">Navigasi Soal:</p>
          <div className="flex flex-wrap gap-2">
            {questions.map((q: any, i: number) => (
              <button
                key={q.id}
                onClick={() => setCurrentQuestion(i)}
                className={`w-8 h-8 rounded border-2 text-sm font-medium transition-colors ${
                  i === currentQuestion
                    ? 'border-primary bg-primary text-primary-foreground'
                    : answers[q.id]
                      ? 'border-green-500 bg-green-100'
                      : 'border-border hover:bg-muted'
                }`}
              >
                {i + 1}
              </button>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
```

#### 2.3 Create Result Page

**File**: `src/app/app/ujian/hasil/[attemptId]/page.tsx`

```tsx
'use client';

import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Trophy, XCircle, Clock, Target } from 'lucide-react';
import Link from 'next/link';

export default function ResultPage({ params }: { params: { attemptId: string } }) {
  const { data: result, isLoading } = useQuery({
    queryKey: ['exam-result', params.attemptId],
    queryFn: () => fetch(`/api/exam/attempt/${params.attemptId}`).then(r => r.json()),
  });

  if (isLoading) return <ResultSkeleton />;

  const attempt = result?.attempt;
  const isPassed = attempt?.isPassed;

  return (
    <div className="container max-w-4xl py-8">
      {/* Result Header */}
      <Card
        className={`border-3 shadow-neo mb-8 ${
          isPassed ? 'border-green-500 bg-green-50' : 'border-red-500 bg-red-50'
        }`}
      >
        <CardContent className="flex items-center gap-6 p-8">
          <div className={`p-4 rounded-full ${isPassed ? 'bg-green-500' : 'bg-red-500'}`}>
            {isPassed ? (
              <Trophy className="h-12 w-12 text-white" />
            ) : (
              <XCircle className="h-12 w-12 text-white" />
            )}
          </div>
          <div>
            <h1 className="text-3xl font-bold mb-2">
              {isPassed ? 'Selamat! Kamu Lulus!' : 'Belum Lulus'}
            </h1>
            <p className="text-xl">
              Skor: <span className="font-bold">{attempt?.score}/180</span>
            </p>
            <Badge variant={isPassed ? 'default' : 'destructive'} className="mt-2">
              {attempt?.exam?.level}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Section Scores */}
      <Card className="border-3 border-border shadow-neo mb-8">
        <CardHeader>
          <CardTitle>Skor Per Bagian</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <ScoreBar
            label="Kosakata (語彙)"
            score={attempt?.sectionScores?.vocabulary || 0}
            max={60}
          />
          <ScoreBar
            label="Tata Bahasa (文法)"
            score={attempt?.sectionScores?.grammar || 0}
            max={60}
          />
          <ScoreBar
            label="Mendengar (聴解)"
            score={attempt?.sectionScores?.listening || 0}
            max={60}
          />
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        <StatCard
          icon={Clock}
          label="Waktu"
          value={`${Math.round((attempt?.timeSpent || 0) / 60)} menit`}
        />
        <StatCard
          icon={Target}
          label="Akurasi"
          value={`${Math.round((attempt?.score / 180) * 100)}%`}
        />
      </div>

      {/* Actions */}
      <div className="flex gap-4">
        <Button asChild variant="outline" className="flex-1">
          <Link href="/app/ujian">Kembali</Link>
        </Button>
        <Button asChild className="flex-1">
          <Link href={`/app/ujian/review/${params.attemptId}`}>Review Jawaban</Link>
        </Button>
      </div>
    </div>
  );
}

function ScoreBar({ label, score, max }: { label: string; score: number; max: number }) {
  const percentage = (score / max) * 100;
  return (
    <div>
      <div className="flex justify-between mb-2">
        <span className="font-medium">{label}</span>
        <span className="font-bold">
          {score}/{max}
        </span>
      </div>
      <Progress value={percentage} className={percentage >= 50 ? '' : 'bg-red-200'} />
    </div>
  );
}
```

### Checklist Session 2:

- [ ] Create exam list page
- [ ] Create tryout taking page
- [ ] Create result page
- [ ] Create review page
- [ ] Add timer functionality
- [ ] Add question navigation
- [ ] Test full exam flow

---

## Session 3: Offline Score & Readiness

### Tasks:

#### 3.1 Create Offline Score Input Page

**File**: `src/app/app/ujian/nilai/page.tsx`

```tsx
'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Plus, Trophy, Calendar } from 'lucide-react';
import { JLPT_PASSING_SCORES } from '@/lib/constants/jlpt';

export default function NilaiPage() {
  const [isOpen, setIsOpen] = useState(false);
  const queryClient = useQueryClient();

  const { data: scores } = useQuery({
    queryKey: ['offline-scores'],
    queryFn: () => fetch('/api/exam/offline').then(r => r.json()),
  });

  const addScore = useMutation({
    mutationFn: (data: any) =>
      fetch('/api/exam/offline', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['offline-scores'] });
      setIsOpen(false);
    },
  });

  return (
    <div className="container max-w-4xl py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold">Cek Nilai JLPT</h1>
          <p className="text-muted-foreground">Input hasil test JLPT offline kamu</p>
        </div>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Tambah Nilai
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Input Nilai JLPT</DialogTitle>
            </DialogHeader>
            <OfflineScoreForm onSubmit={data => addScore.mutate(data)} />
          </DialogContent>
        </Dialog>
      </div>

      {/* Score History */}
      <div className="space-y-4">
        {scores?.scores?.map((score: any) => (
          <ScoreCard key={score.id} score={score} />
        ))}

        {(!scores?.scores || scores.scores.length === 0) && (
          <Card className="border-3 border-border shadow-neo">
            <CardContent className="py-12 text-center text-muted-foreground">
              Belum ada nilai. Tambahkan hasil JLPT kamu!
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

function ScoreCard({ score }: { score: any }) {
  const passingScore = JLPT_PASSING_SCORES[score.level as keyof typeof JLPT_PASSING_SCORES];
  const isPassed = score.totalScore >= passingScore;

  return (
    <Card className={`border-3 shadow-neo ${isPassed ? 'border-green-500' : 'border-border'}`}>
      <CardContent className="flex items-center justify-between p-6">
        <div className="flex items-center gap-4">
          <div className={`p-3 rounded-lg ${isPassed ? 'bg-green-100' : 'bg-muted'}`}>
            <Trophy
              className={`h-6 w-6 ${isPassed ? 'text-green-600' : 'text-muted-foreground'}`}
            />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <Badge variant={isPassed ? 'default' : 'secondary'}>{score.level}</Badge>
              <span className="font-bold text-lg">{score.totalScore}/180</span>
              {isPassed && (
                <Badge variant="outline" className="text-green-600">
                  LULUS
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
              <Calendar className="h-3 w-3" />
              {new Date(score.testDate).toLocaleDateString('id-ID')}
            </div>
          </div>
        </div>
        <div className="text-sm text-muted-foreground">
          <p>語彙: {score.vocabularyScore}</p>
          <p>文法: {score.grammarScore}</p>
          <p>聴解: {score.listeningScore}</p>
        </div>
      </CardContent>
    </Card>
  );
}

function OfflineScoreForm({ onSubmit }: { onSubmit: (data: any) => void }) {
  const [formData, setFormData] = useState({
    level: '',
    testDate: '',
    totalScore: '',
    vocabularyScore: '',
    grammarScore: '',
    listeningScore: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      totalScore: parseInt(formData.totalScore),
      vocabularyScore: parseInt(formData.vocabularyScore),
      grammarScore: parseInt(formData.grammarScore),
      listeningScore: parseInt(formData.listeningScore),
      isPassed:
        parseInt(formData.totalScore) >=
        JLPT_PASSING_SCORES[formData.level as keyof typeof JLPT_PASSING_SCORES],
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Level JLPT</Label>
          <Select
            value={formData.level}
            onValueChange={v => setFormData({ ...formData, level: v })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Pilih level" />
            </SelectTrigger>
            <SelectContent>
              {['N5', 'N4', 'N3', 'N2', 'N1'].map(level => (
                <SelectItem key={level} value={level}>
                  {level}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Tanggal Test</Label>
          <Input
            type="date"
            value={formData.testDate}
            onChange={e => setFormData({ ...formData, testDate: e.target.value })}
          />
        </div>
      </div>

      <div>
        <Label>Total Skor (0-180)</Label>
        <Input
          type="number"
          min="0"
          max="180"
          value={formData.totalScore}
          onChange={e => setFormData({ ...formData, totalScore: e.target.value })}
        />
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <Label>Kosakata (0-60)</Label>
          <Input
            type="number"
            min="0"
            max="60"
            value={formData.vocabularyScore}
            onChange={e => setFormData({ ...formData, vocabularyScore: e.target.value })}
          />
        </div>
        <div>
          <Label>Tata Bahasa (0-60)</Label>
          <Input
            type="number"
            min="0"
            max="60"
            value={formData.grammarScore}
            onChange={e => setFormData({ ...formData, grammarScore: e.target.value })}
          />
        </div>
        <div>
          <Label>Mendengar (0-60)</Label>
          <Input
            type="number"
            min="0"
            max="60"
            value={formData.listeningScore}
            onChange={e => setFormData({ ...formData, listeningScore: e.target.value })}
          />
        </div>
      </div>

      <Button type="submit" className="w-full">
        Simpan
      </Button>
    </form>
  );
}
```

#### 3.2 Create Readiness Statistics Page

**File**: `src/app/app/ujian/statistik/page.tsx`

```tsx
'use client';

import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer } from 'recharts';
import { JLPT_LEVELS } from '@/lib/constants/jlpt';

export default function StatistikPage() {
  const { data: readiness } = useQuery({
    queryKey: ['jlpt-readiness'],
    queryFn: () => fetch('/api/exam/readiness').then(r => r.json()),
  });

  return (
    <div className="container max-w-4xl py-8">
      <h1 className="text-2xl font-bold mb-6">Statistik Kesiapan JLPT</h1>

      {/* Estimated Level */}
      <Card className="border-3 border-border shadow-neo mb-8">
        <CardContent className="p-8 text-center">
          <p className="text-muted-foreground mb-2">Level Estimasi Kamu</p>
          <Badge className="text-4xl py-4 px-8">{readiness?.estimatedLevel || 'N5'}</Badge>
          <p className="mt-4 text-muted-foreground">
            Berdasarkan flashcard yang hafal dan hasil tryout
          </p>
        </CardContent>
      </Card>

      {/* Readiness by Level */}
      <Card className="border-3 border-border shadow-neo mb-8">
        <CardHeader>
          <CardTitle>Kesiapan Per Level</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {JLPT_LEVELS.map(level => {
            const readinessKey = `${level.toLowerCase()}Readiness` as keyof typeof readiness;
            const percentage = readiness?.[readinessKey] || 0;
            return (
              <div key={level}>
                <div className="flex justify-between mb-1">
                  <span className="font-medium">{level}</span>
                  <span className="font-bold">{Math.round(percentage)}%</span>
                </div>
                <Progress
                  value={percentage}
                  className={
                    percentage >= 70
                      ? 'bg-green-200'
                      : percentage >= 40
                        ? 'bg-yellow-200'
                        : 'bg-red-200'
                  }
                />
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Skills Radar */}
      <Card className="border-3 border-border shadow-neo mb-8">
        <CardHeader>
          <CardTitle>Kemampuan Per Skill</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart
                data={[
                  { skill: 'Kosakata', value: readiness?.vocabularyScore || 0 },
                  { skill: 'Kanji', value: readiness?.kanjiScore || 0 },
                  { skill: 'Tata Bahasa', value: readiness?.grammarScore || 0 },
                  { skill: 'Membaca', value: readiness?.readingScore || 0 },
                  { skill: 'Mendengar', value: readiness?.listeningScore || 0 },
                ]}
              >
                <PolarGrid stroke="#000" />
                <PolarAngleAxis dataKey="skill" />
                <Radar dataKey="value" stroke="#ff5e75" fill="#ff5e75" fillOpacity={0.5} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Calculation Basis */}
      <Card className="border-3 border-border shadow-neo">
        <CardHeader>
          <CardTitle>Dasar Perhitungan</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <p className="text-3xl font-bold">
                {readiness?.calculationBasis?.flashcardsMemorized || 0}
              </p>
              <p className="text-sm text-muted-foreground">Flashcard Hafal</p>
            </div>
            <div>
              <p className="text-3xl font-bold">
                {readiness?.calculationBasis?.tryoutsCompleted || 0}
              </p>
              <p className="text-sm text-muted-foreground">Tryout Selesai</p>
            </div>
            <div>
              <p className="text-3xl font-bold">
                {readiness?.calculationBasis?.conversationsCompleted || 0}
              </p>
              <p className="text-sm text-muted-foreground">Kaiwa Selesai</p>
            </div>
            <div>
              <p className="text-3xl font-bold">
                {readiness?.calculationBasis?.offlineScores || 0}
              </p>
              <p className="text-sm text-muted-foreground">Nilai Offline</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
```

#### 3.3 Create Readiness Calculation Service

**File**: `src/lib/exam/readiness-service.ts`

```typescript
import { prisma } from '../prisma';
import { JLPT_LEVELS, JlptLevel } from '../constants/jlpt';

interface ReadinessInput {
  flashcardsMemorized: { level: string; count: number }[];
  tryoutScores: { level: string; score: number }[];
  conversationScores: { level: string; avgScore: number }[];
  offlineScores: { level: string; score: number }[];
}

export async function calculateReadiness(userId: string) {
  // Gather all data
  const input = await gatherReadinessData(userId);

  // Calculate readiness for each level
  const readiness: Record<string, number> = {};
  for (const level of JLPT_LEVELS) {
    readiness[level] = calculateLevelReadiness(level, input);
  }

  // Estimate current level
  const estimatedLevel = estimateLevel(readiness);

  // Calculate skill scores
  const skills = calculateSkillScores(input);

  // Save to database
  await prisma.jlptReadinessScore.upsert({
    where: { userId },
    update: {
      estimatedLevel,
      n5Readiness: readiness.N5,
      n4Readiness: readiness.N4,
      n3Readiness: readiness.N3,
      n2Readiness: readiness.N2,
      n1Readiness: readiness.N1,
      vocabularyScore: skills.vocabulary,
      kanjiScore: skills.kanji,
      grammarScore: skills.grammar,
      readingScore: skills.reading,
      listeningScore: skills.listening,
      lastCalculated: new Date(),
      calculationBasis: {
        flashcardsMemorized: input.flashcardsMemorized.reduce((a, b) => a + b.count, 0),
        tryoutsCompleted: input.tryoutScores.length,
        conversationsCompleted: input.conversationScores.length,
        offlineScores: input.offlineScores.length,
      },
    },
    create: {
      userId,
      estimatedLevel,
      n5Readiness: readiness.N5,
      n4Readiness: readiness.N4,
      n3Readiness: readiness.N3,
      n2Readiness: readiness.N2,
      n1Readiness: readiness.N1,
      vocabularyScore: skills.vocabulary,
      kanjiScore: skills.kanji,
      grammarScore: skills.grammar,
      readingScore: skills.reading,
      listeningScore: skills.listening,
      calculationBasis: {
        flashcardsMemorized: input.flashcardsMemorized.reduce((a, b) => a + b.count, 0),
        tryoutsCompleted: input.tryoutScores.length,
        conversationsCompleted: input.conversationScores.length,
        offlineScores: input.offlineScores.length,
      },
    },
  });

  return prisma.jlptReadinessScore.findUnique({ where: { userId } });
}

async function gatherReadinessData(userId: string): Promise<ReadinessInput> {
  // Get memorized flashcards by JLPT level
  const flashcards = await prisma.flashcardReview.findMany({
    where: { userId, rating: 'hafal' },
    include: { flashcard: { include: { deck: true } } },
  });

  const flashcardsMemorized = JLPT_LEVELS.map(level => ({
    level,
    count: flashcards.filter(f => f.flashcard.deck.difficulty === level).length,
  }));

  // Get tryout scores
  const tryouts = await prisma.jlptExamAttempt.findMany({
    where: { userId, status: 'COMPLETED' },
    include: { exam: true },
  });

  const tryoutScores = tryouts.map(t => ({
    level: t.exam.level,
    score: t.score || 0,
  }));

  // Get conversation scores
  const conversations = await prisma.taskAttempt.findMany({
    where: { userId, isCompleted: true },
    include: { task: true },
  });

  // Group by difficulty and calculate average
  const conversationScores = JLPT_LEVELS.map(level => {
    const levelConvs = conversations.filter(c => c.task.difficulty === level);
    const avgScore =
      levelConvs.length > 0
        ? levelConvs.reduce((a, b) => a + (JSON.parse(b.feedback || '{}').score || 0), 0) /
          levelConvs.length
        : 0;
    return { level, avgScore };
  });

  // Get offline scores
  const offline = await prisma.jlptOfflineScore.findMany({
    where: { userId },
  });

  const offlineScores = offline.map(o => ({
    level: o.level,
    score: o.totalScore,
  }));

  return { flashcardsMemorized, tryoutScores, conversationScores, offlineScores };
}

function calculateLevelReadiness(level: JlptLevel, input: ReadinessInput): number {
  // Weight factors
  const weights = {
    flashcards: 0.3,
    tryouts: 0.35,
    conversations: 0.15,
    offline: 0.2,
  };

  // Vocabulary requirements by level
  const vocabRequirements: Record<JlptLevel, number> = {
    N5: 800,
    N4: 1500,
    N3: 3000,
    N2: 6000,
    N1: 10000,
  };

  // Calculate each component
  const flashcardScore = Math.min(
    100,
    ((input.flashcardsMemorized.find(f => f.level === level)?.count || 0) /
      vocabRequirements[level]) *
      100
  );

  const tryoutScore = input.tryoutScores
    .filter(t => t.level === level)
    .reduce((max, t) => Math.max(max, (t.score / 180) * 100), 0);

  const conversationScore = input.conversationScores.find(c => c.level === level)?.avgScore || 0;

  const offlineScore = input.offlineScores
    .filter(o => o.level === level)
    .reduce((max, o) => Math.max(max, (o.score / 180) * 100), 0);

  // Weighted average
  return (
    flashcardScore * weights.flashcards +
    tryoutScore * weights.tryouts +
    conversationScore * weights.conversations +
    offlineScore * weights.offline
  );
}

function estimateLevel(readiness: Record<string, number>): JlptLevel {
  // Find highest level with >= 70% readiness
  for (const level of [...JLPT_LEVELS].reverse()) {
    if (readiness[level] >= 70) {
      return level;
    }
  }
  return 'N5';
}

function calculateSkillScores(input: ReadinessInput) {
  // Simplified skill calculation
  // In reality, this would analyze specific card types, question types, etc.
  const total = input.flashcardsMemorized.reduce((a, b) => a + b.count, 0);

  return {
    vocabulary: Math.min(100, (total / 5000) * 100),
    kanji: Math.min(100, (total / 2000) * 100),
    grammar: Math.min(100, (total / 1000) * 100),
    reading: 50, // Placeholder
    listening: 50, // Placeholder
  };
}
```

### Checklist Session 3:

- [ ] Create offline score input page
- [ ] Create offline score API
- [ ] Create readiness statistics page
- [ ] Create readiness calculation service
- [ ] Create readiness API
- [ ] Test full readiness calculation
- [ ] Add navigation links

---

## Session 4: Polish & Integration

### Tasks:

#### 4.1 Add UJIAN to Navigation

#### 4.2 Seed Sample Exam Data

#### 4.3 Connect Flashcard to Exam Recommendations

#### 4.4 Add Exam-related Notifications

#### 4.5 Testing & Bug Fixes

---

## Definition of Done

- [ ] Exam list page working
- [ ] Tryout taking flow complete
- [ ] Timer and auto-submit working
- [ ] Result page shows scores
- [ ] Offline score input working
- [ ] Readiness statistics calculating
- [ ] Navigation integrated
- [ ] Mobile responsive
- [ ] All APIs secured

---

_Plan Version: 1.0_
_Created: 2025-11-27_
