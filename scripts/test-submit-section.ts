#!/usr/bin/env tsx
/**
 * Test script to debug section submission
 * Run with: npx tsx scripts/test-submit-section.ts
 */

import { prisma } from '../src/lib/prisma';

async function testSubmitSection() {
  try {
    console.log('🔍 Checking JLPT test attempts...\n');

    // Find a test attempt
    const attempt = await prisma.jLPTTestAttempt.findFirst({
      where: {
        status: 'in_progress',
      },
      include: {
        sectionSubmissions: true,
        userAnswers: true,
      },
    });

    if (!attempt) {
      console.log('❌ No in-progress test attempts found');
      console.log('Creating a test attempt...\n');

      // Find a user
      const user = await prisma.user.findFirst();
      if (!user) {
        console.log('❌ No users found in database');
        return;
      }

      // Create a test attempt
      const newAttempt = await prisma.jLPTTestAttempt.create({
        data: {
          userId: user.id,
          level: 'N5',
          testMode: 'full_test',
          questionsSnapshot: {
            vocabulary: [],
            grammar_reading: [],
            listening: [],
          },
          status: 'in_progress',
        },
      });

      console.log('✅ Created test attempt:', newAttempt.id);
      return;
    }

    console.log('✅ Found test attempt:', attempt.id);
    console.log('   User ID:', attempt.userId);
    console.log('   Level:', attempt.level);
    console.log('   Status:', attempt.status);
    console.log('   Submitted sections:', attempt.sectionSubmissions.length);
    console.log('   Answers:', attempt.userAnswers.length);
    console.log('\nSection submissions:');
    attempt.sectionSubmissions.forEach(sub => {
      console.log(`   - ${sub.sectionType}: ${sub.submittedAt.toISOString()}`);
    });

    // Check if we can load questions for vocabulary section
    console.log('\n🔍 Checking questions for vocabulary section...');
    const questions = await prisma.jLPTQuestion.findMany({
      where: {
        level: attempt.level,
        sectionType: 'vocabulary',
      },
      take: 5,
      include: {
        answerChoices: true,
      },
    });

    console.log(`✅ Found ${questions.length} questions for vocabulary section`);

    if (questions.length > 0) {
      console.log('\nFirst question:');
      console.log('   ID:', questions[0].id);
      console.log('   Mondai:', questions[0].mondaiNumber);
      console.log('   Question:', questions[0].questionNumber);
      console.log('   Choices:', questions[0].answerChoices.length);
    }

    // Test creating a section submission
    console.log('\n🧪 Testing section submission creation...');

    const vocabularySubmission = attempt.sectionSubmissions.find(
      s => s.sectionType === 'vocabulary'
    );

    if (vocabularySubmission) {
      console.log('⚠️  Vocabulary section already submitted');
    } else {
      console.log('✅ Vocabulary section not yet submitted - can test submission');

      // Simulate what the API does
      console.log('\nSimulating API submission logic:');
      console.log('1. Check if section already submitted... ✅');
      console.log('2. Save answers (if any)... ✅');
      console.log('3. Create section submission record...');

      const testSubmission = {
        testAttemptId: attempt.id,
        sectionType: 'vocabulary',
        timeSpentSeconds: 300,
      };

      console.log('   Submission data:', testSubmission);

      // Don't actually create it, just log what would happen
      console.log('   (Skipping actual DB insert for safety)');
    }

  } catch (error) {
    console.error('❌ Error:', error);
    if (error instanceof Error) {
      console.error('   Message:', error.message);
      console.error('   Stack:', error.stack);
    }
  } finally {
    await prisma.$disconnect();
  }
}

testSubmitSection();
