#!/usr/bin/env tsx
/**
 * Fix test attempts that have all sections submitted but status is still 'in_progress'
 * Run with: npx tsx scripts/fix-completed-tests.ts
 */

import { prisma } from '../src/lib/prisma';

async function fixCompletedTests() {
  try {
    console.log('🔍 Finding tests with all sections submitted but status = in_progress...\n');

    // Find all in-progress tests
    const inProgressTests = await prisma.jLPTTestAttempt.findMany({
      where: {
        status: 'in_progress',
      },
      include: {
        sectionSubmissions: {
          select: {
            sectionType: true,
            submittedAt: true,
          },
        },
      },
    });

    console.log(`Found ${inProgressTests.length} in-progress tests\n`);

    const allSections = ['vocabulary', 'grammar_reading', 'listening'];
    const testsToFix = inProgressTests.filter(test => {
      const submittedSections = new Set(test.sectionSubmissions.map(s => s.sectionType));
      return allSections.every(section => submittedSections.has(section));
    });

    console.log(`Found ${testsToFix.length} tests that need fixing:\n`);

    for (const test of testsToFix) {
      console.log(`  Test ID: ${test.id}`);
      console.log(`  Level: ${test.level}`);
      console.log(`  Started: ${test.startedAt.toISOString()}`);
      console.log(`  Sections: ${test.sectionSubmissions.map(s => s.sectionType).join(', ')}`);

      // Find the last submission time
      const lastSubmission = test.sectionSubmissions.reduce((latest, sub) => {
        return sub.submittedAt > latest ? sub.submittedAt : latest;
      }, test.sectionSubmissions[0].submittedAt);

      console.log(`  Last submission: ${lastSubmission.toISOString()}`);

      // Update the test to completed
      await prisma.jLPTTestAttempt.update({
        where: { id: test.id },
        data: {
          status: 'completed',
          completedAt: lastSubmission,
        },
      });

      console.log(`  ✅ Updated to completed\n`);
    }

    if (testsToFix.length === 0) {
      console.log('✨ No tests need fixing - all good!\n');
    } else {
      console.log(`✅ Successfully fixed ${testsToFix.length} test(s)\n`);
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

fixCompletedTests();
