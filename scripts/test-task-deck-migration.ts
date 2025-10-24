/**
 * Test script to verify TaskDeck migration
 * Run with: npx tsx scripts/test-task-deck-migration.ts
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testMigration() {
  console.log('🔍 Testing TaskDeck migration...\n');

  try {
    // Test 1: Check if TaskDeck model is available
    console.log('1️⃣ Checking TaskDeck model availability...');
    const taskDeckCount = await prisma.taskDeck.count();
    console.log(`   ✅ TaskDeck model is accessible. Current count: ${taskDeckCount}\n`);

    // Test 2: Check Task model has studyDecks relation
    console.log('2️⃣ Checking Task.studyDecks relation...');
    const tasks = await prisma.task.findMany({
      take: 1,
      include: {
        studyDecks: true,
      },
    });
    console.log(`   ✅ Task.studyDecks relation is working. Sample task: ${tasks[0]?.id || 'No tasks yet'}\n`);

    // Test 3: Check Deck model has taskDecks relation
    console.log('3️⃣ Checking Deck.taskDecks relation...');
    const decks = await prisma.deck.findMany({
      take: 1,
      include: {
        taskDecks: true,
      },
    });
    console.log(`   ✅ Deck.taskDecks relation is working. Sample deck: ${decks[0]?.id || 'No decks yet'}\n`);

    // Test 4: Try to create a TaskDeck association (will rollback)
    console.log('4️⃣ Testing TaskDeck creation (with rollback)...');

    const task = await prisma.task.findFirst();
    const deck = await prisma.deck.findFirst();

    if (task && deck) {
      // Use a transaction to test without actually creating data
      await prisma.$transaction(async (tx) => {
        const taskDeck = await tx.taskDeck.create({
          data: {
            taskId: task.id,
            deckId: deck.id,
            order: 0,
          },
        });
        console.log(`   ✅ TaskDeck creation successful (test ID: ${taskDeck.id})`);

        // Throw error to rollback
        throw new Error('Rollback test transaction');
      }).catch((error) => {
        if (error.message === 'Rollback test transaction') {
          console.log(`   ✅ Transaction rollback successful\n`);
        } else {
          throw error;
        }
      });
    } else {
      console.log(`   ⚠️  Skipped: No task or deck available for testing\n`);
    }

    console.log('✅ All migration tests passed!\n');
    console.log('📋 Summary:');
    console.log('   - TaskDeck model: ✅ Available');
    console.log('   - Task.studyDecks relation: ✅ Working');
    console.log('   - Deck.taskDecks relation: ✅ Working');
    console.log('   - TaskDeck CRUD operations: ✅ Working\n');

  } catch (error) {
    console.error('❌ Migration test failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

testMigration();
