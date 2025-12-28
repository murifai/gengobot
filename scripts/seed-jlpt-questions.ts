/**
 * Seed JLPT Tryout Questions
 *
 * Creates sample test questions matching official JLPT test specifications.
 * Question counts per mondai match docs/jlpttest/02-test-level-details.md
 *
 * Usage: npx tsx scripts/seed-jlpt-questions.ts
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Official JLPT test structure per level
const JLPT_STRUCTURE = {
  N5: {
    vocabulary: [
      { mondai: 1, count: 12, desc: 'Kanji reading' },
      { mondai: 2, count: 8, desc: 'Orthography' },
      { mondai: 3, count: 10, desc: 'Contextual usage' },
      { mondai: 4, count: 5, desc: 'Paraphrase' },
    ],
    grammar_reading: [
      { mondai: 1, count: 16, desc: 'Sentence grammar' },
      { mondai: 2, count: 5, desc: 'Text grammar' },
      { mondai: 3, count: 5, desc: 'Sentence composition' },
      { mondai: 4, count: 3, desc: 'Reading comprehension' },
      { mondai: 5, count: 2, desc: 'Reading comprehension' },
      { mondai: 6, count: 1, desc: 'Info graphic' },
    ],
    listening: [
      { mondai: 1, count: 7, desc: 'Task-based comprehension' },
      { mondai: 2, count: 6, desc: 'Point comprehension' },
      { mondai: 3, count: 5, desc: 'Utterance expressions' },
      { mondai: 4, count: 6, desc: 'Quick response' },
    ],
  },
  N4: {
    vocabulary: [
      { mondai: 1, count: 9, desc: 'Kanji reading' },
      { mondai: 2, count: 6, desc: 'Orthography' },
      { mondai: 3, count: 10, desc: 'Contextual usage' },
      { mondai: 4, count: 5, desc: 'Paraphrase' },
      { mondai: 5, count: 5, desc: 'Usage' },
    ],
    grammar_reading: [
      { mondai: 1, count: 15, desc: 'Sentence grammar' },
      { mondai: 2, count: 5, desc: 'Text grammar' },
      { mondai: 3, count: 5, desc: 'Sentence composition' },
      { mondai: 4, count: 4, desc: 'Short reading' },
      { mondai: 5, count: 4, desc: 'Medium reading' },
      { mondai: 6, count: 2, desc: 'Info graphic' },
    ],
    listening: [
      { mondai: 1, count: 8, desc: 'Task-based comprehension' },
      { mondai: 2, count: 7, desc: 'Point comprehension' },
      { mondai: 3, count: 5, desc: 'Verbal expressions' },
      { mondai: 4, count: 8, desc: 'Quick response' },
    ],
  },
  N3: {
    vocabulary: [
      { mondai: 1, count: 8, desc: 'Kanji reading' },
      { mondai: 2, count: 6, desc: 'Orthography' },
      { mondai: 3, count: 11, desc: 'Contextual usage' },
      { mondai: 4, count: 5, desc: 'Paraphrase' },
      { mondai: 5, count: 5, desc: 'Usage' },
    ],
    grammar_reading: [
      { mondai: 1, count: 13, desc: 'Reading comprehension' },
      { mondai: 2, count: 5, desc: 'Short reading' },
      { mondai: 3, count: 5, desc: 'Cloze test' },
      { mondai: 4, count: 4, desc: 'Sentence grammar' },
      { mondai: 5, count: 6, desc: 'Text grammar' },
      { mondai: 6, count: 4, desc: 'Sentence composition' },
      { mondai: 7, count: 2, desc: 'Info graphic' },
    ],
    listening: [
      { mondai: 1, count: 6, desc: 'Task-based comprehension' },
      { mondai: 2, count: 6, desc: 'Point comprehension' },
      { mondai: 3, count: 4, desc: 'Utterance expressions' },
      { mondai: 4, count: 9, desc: 'Quick response' },
    ],
  },
  N2: {
    vocabulary: [
      { mondai: 1, count: 5, desc: 'Kanji reading' },
      { mondai: 2, count: 5, desc: 'Orthography' },
      { mondai: 3, count: 5, desc: 'Contextually-defined expressions' },
      { mondai: 4, count: 7, desc: 'Paraphrase' },
      { mondai: 5, count: 5, desc: 'Usage' },
      { mondai: 6, count: 5, desc: 'N2 new pattern' },
      { mondai: 7, count: 12, desc: 'Cloze test (standalone)' },
      { mondai: 8, count: 5, desc: 'N2 pattern' },
      { mondai: 9, count: 5, desc: 'N2 pattern' },
    ],
    grammar_reading: [
      { mondai: 10, count: 5, desc: 'Grammar' },
      { mondai: 11, count: 9, desc: 'Reading comprehension' },
      { mondai: 12, count: 2, desc: 'A-B comparison' },
      { mondai: 13, count: 3, desc: 'Long reading' },
      { mondai: 14, count: 2, desc: 'Info graphic' },
    ],
    listening: [
      { mondai: 1, count: 5, desc: 'Task-based comprehension' },
      { mondai: 2, count: 6, desc: 'Point comprehension' },
      { mondai: 3, count: 5, desc: 'Utterance expressions' },
      { mondai: 4, count: 12, desc: 'Quick response' },
      { mondai: 5, count: 4, desc: 'Integrated comprehension' },
    ],
  },
  N1: {
    vocabulary: [
      { mondai: 1, count: 6, desc: 'Kanji reading' },
      { mondai: 2, count: 7, desc: 'Orthography' },
      { mondai: 3, count: 6, desc: 'Contextually-defined expressions' },
      { mondai: 4, count: 6, desc: 'Paraphrase' },
      { mondai: 5, count: 10, desc: 'Usage' },
      { mondai: 6, count: 5, desc: 'N1 pattern' },
      { mondai: 7, count: 5, desc: 'Cloze test (standalone)' },
    ],
    grammar_reading: [
      { mondai: 8, count: 4, desc: 'Grammar' },
      { mondai: 9, count: 9, desc: 'Reading comprehension' },
      { mondai: 10, count: 4, desc: 'Long reading' },
      { mondai: 11, count: 2, desc: 'A-B comparison' },
      { mondai: 12, count: 4, desc: 'Long reading' },
      { mondai: 13, count: 2, desc: 'Info graphic' },
    ],
    listening: [
      { mondai: 1, count: 6, desc: 'Task-based comprehension' },
      { mondai: 2, count: 7, desc: 'Point comprehension' },
      { mondai: 3, count: 6, desc: 'Utterance expressions' },
      { mondai: 4, count: 14, desc: 'Quick response' },
      { mondai: 5, count: 4, desc: 'Integrated comprehension' },
    ],
  },
};

// Simple test questions with single letters
async function seedQuestions() {
  console.log('Starting JLPT question seeding...\n');
  console.log('Question counts match official JLPT specifications');
  console.log('Reference: docs/jlpttest/02-test-level-details.md\n');

  // Get or create an admin for createdBy
  let admin = await prisma.admin.findFirst();
  if (!admin) {
    console.log('No admin found, creating seed admin...');
    const bcrypt = require('bcryptjs');
    admin = await prisma.admin.create({
      data: {
        email: 'admin@gengobot.com',
        password: await bcrypt.hash('admin123456', 12),
        name: 'Seed Admin',
        role: 'ADMIN',
        isActive: true,
      },
    });
    console.log('Admin created.\n');
  }

  // Clear existing questions
  console.log('Clearing existing JLPT questions...');
  try {
    await prisma.jLPTUserAnswer.deleteMany();
    await prisma.jLPTUnitQuestion.deleteMany();
    await prisma.jLPTQuestionUnit.deleteMany();
    await prisma.jLPTAnswerChoice.deleteMany();
    await prisma.jLPTQuestionAnalytics.deleteMany();
    await prisma.jLPTQuestion.deleteMany();
    await prisma.jLPTPassage.deleteMany();
    console.log('Cleared existing questions.\n');
  } catch (error: any) {
    if (error.code === 'P2021') {
      console.log('Tables do not exist yet. Run prisma migrate or prisma db push first.\n');
    } else {
      throw error;
    }
  }

  const levels = ['N5', 'N4', 'N3', 'N2', 'N1'] as const;

  // Audio files for listening questions
  const audioFiles = [
    '/audio/alloy.mp3',
    '/audio/echo.mp3',
    '/audio/nova.mp3',
    '/audio/shimmer.mp3',
    '/audio/fable.mp3',
    '/audio/onyx.mp3',
    '/audio/coral.mp3',
    '/audio/sage.mp3',
    '/audio/verse.mp3',
    '/audio/ballad.mp3',
  ];

  let charCode = 65; // Start with 'A'

  for (const level of levels) {
    console.log(`\n=== Seeding ${level} Questions ===\n`);
    const structure = JLPT_STRUCTURE[level];
    let levelTotal = 0;

    // VOCABULARY SECTION
    console.log(`📝 Vocabulary Section (${level}):`);
    for (const { mondai, count, desc } of structure.vocabulary) {
      for (let i = 1; i <= count; i++) {
        const question = await prisma.jLPTQuestion.create({
          data: {
            level,
            sectionType: 'vocabulary',
            mondaiNumber: mondai,
            questionNumber: i,
            questionText: String.fromCharCode(charCode++),
            questionType: 'standard',
            correctAnswer: ((i - 1) % 4) + 1,
            difficulty: 'medium',
            createdBy: admin.id,
            isActive: true,
          },
        });

        // Create 4 answer choices
        for (let choiceNum = 1; choiceNum <= 4; choiceNum++) {
          await prisma.jLPTAnswerChoice.create({
            data: {
              questionId: question.id,
              choiceNumber: choiceNum,
              choiceType: 'text',
              choiceText: String.fromCharCode(96 + choiceNum), // a, b, c, d
              orderIndex: choiceNum - 1,
            },
          });
        }

        // Create analytics
        await prisma.jLPTQuestionAnalytics.create({
          data: {
            questionId: question.id,
            timesPresented: 0,
            timesCorrect: 0,
            isTooEasy: false,
            isTooHard: false,
            needsReview: false,
          },
        });
      }
      console.log(`  ✓ 問題${mondai}: ${count} questions (${desc})`);
      levelTotal += count;
    }

    // GRAMMAR/READING SECTION
    console.log(`\n📚 Grammar/Reading Section (${level}):`);
    for (const { mondai, count, desc } of structure.grammar_reading) {
      // Create passages for reading questions
      const needsPassage = desc.includes('reading') || desc.includes('graphic');
      let passage = null;

      if (needsPassage) {
        passage = await prisma.jLPTPassage.create({
          data: {
            contentType: 'text',
            contentText: `${level} ${desc} passage for 問題${mondai}`,
            title: `${level} 問題${mondai}`,
            createdBy: admin.id,
            isActive: true,
          },
        });
      }

      for (let i = 1; i <= count; i++) {
        const question = await prisma.jLPTQuestion.create({
          data: {
            level,
            sectionType: 'grammar_reading',
            mondaiNumber: mondai,
            questionNumber: i,
            questionText: String.fromCharCode(charCode++),
            questionType: needsPassage ? 'reading_comp' : 'standard',
            correctAnswer: ((i - 1) % 4) + 1,
            difficulty: 'medium',
            passageId: passage?.id,
            createdBy: admin.id,
            isActive: true,
          },
        });

        for (let choiceNum = 1; choiceNum <= 4; choiceNum++) {
          await prisma.jLPTAnswerChoice.create({
            data: {
              questionId: question.id,
              choiceNumber: choiceNum,
              choiceType: 'text',
              choiceText: String.fromCharCode(96 + choiceNum),
              orderIndex: choiceNum - 1,
            },
          });
        }

        await prisma.jLPTQuestionAnalytics.create({
          data: {
            questionId: question.id,
            timesPresented: 0,
            timesCorrect: 0,
            isTooEasy: false,
            isTooHard: false,
            needsReview: false,
          },
        });
      }
      console.log(`  ✓ 問題${mondai}: ${count} questions (${desc})`);
      levelTotal += count;
    }

    // LISTENING SECTION
    console.log(`\n🎧 Listening Section (${level}):`);
    let audioIndex = 0;
    for (const { mondai, count, desc } of structure.listening) {
      for (let i = 1; i <= count; i++) {
        const audioUrl = audioFiles[audioIndex % audioFiles.length];
        audioIndex++;

        const question = await prisma.jLPTQuestion.create({
          data: {
            level,
            sectionType: 'listening',
            mondaiNumber: mondai,
            questionNumber: i,
            questionText: String.fromCharCode(charCode++),
            questionType: 'audio',
            mediaUrl: audioUrl,
            mediaType: 'audio',
            correctAnswer: ((i - 1) % 4) + 1,
            difficulty: 'medium',
            createdBy: admin.id,
            isActive: true,
          },
        });

        for (let choiceNum = 1; choiceNum <= 4; choiceNum++) {
          await prisma.jLPTAnswerChoice.create({
            data: {
              questionId: question.id,
              choiceNumber: choiceNum,
              choiceType: 'text',
              choiceText: String.fromCharCode(96 + choiceNum),
              orderIndex: choiceNum - 1,
            },
          });
        }

        await prisma.jLPTQuestionAnalytics.create({
          data: {
            questionId: question.id,
            timesPresented: 0,
            timesCorrect: 0,
            isTooEasy: false,
            isTooHard: false,
            needsReview: false,
          },
        });
      }
      console.log(`  ✓ 問題${mondai}: ${count} questions (${desc})`);
      levelTotal += count;
    }

    console.log(`\n✅ Completed ${level}: ${levelTotal} total questions\n`);
  }

  // Summary
  const totalQuestions = await prisma.jLPTQuestion.count();
  const totalChoices = await prisma.jLPTAnswerChoice.count();
  const totalPassages = await prisma.jLPTPassage.count();

  console.log('\n╔════════════════════════════════════════╗');
  console.log('║       SEEDING SUMMARY                  ║');
  console.log('╚════════════════════════════════════════╝\n');
  console.log(`Total Questions: ${totalQuestions}`);
  console.log(`Total Answer Choices: ${totalChoices}`);
  console.log(`Total Passages: ${totalPassages}\n`);
  console.log('Breakdown by level:\n');

  for (const level of levels) {
    const vocabCount = await prisma.jLPTQuestion.count({
      where: { level, sectionType: 'vocabulary' },
    });
    const grammarCount = await prisma.jLPTQuestion.count({
      where: { level, sectionType: 'grammar_reading' },
    });
    const listeningCount = await prisma.jLPTQuestion.count({
      where: { level, sectionType: 'listening' },
    });
    const total = vocabCount + grammarCount + listeningCount;

    console.log(`${level}:`);
    console.log(`  📝 Vocabulary: ${vocabCount}`);
    console.log(`  📚 Grammar/Reading: ${grammarCount}`);
    console.log(`  🎧 Listening: ${listeningCount}`);
    console.log(`  ═══════════════════`);
    console.log(`  📊 Total: ${total}\n`);
  }

  console.log('═══════════════════════════════════════════');
  console.log('Question format: Single letter (A-Z)');
  console.log('Answer choices: a, b, c, d');
  console.log('Audio files: Using existing /audio/*.mp3');
  console.log('═══════════════════════════════════════════');
  console.log('\n✨ Seeding completed successfully!\n');
}

async function main() {
  try {
    await seedQuestions();
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
