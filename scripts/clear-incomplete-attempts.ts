/**
 * Script to clear incomplete task attempts
 * Use this if you want to start tasks fresh without resuming previous attempts
 *
 * WARNING: This will delete all incomplete task attempts and their conversation history!
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function clearIncompleteAttempts() {
  try {
    console.log('⚠️  WARNING: This will delete all incomplete task attempts!\n');

    // Get incomplete attempts
    const incompleteAttempts = await prisma.taskAttempt.findMany({
      where: {
        isCompleted: false,
      },
      include: {
        task: {
          select: {
            title: true,
          },
        },
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });

    if (incompleteAttempts.length === 0) {
      console.log('✅ No incomplete attempts found - nothing to clear!');
      return;
    }

    console.log(`Found ${incompleteAttempts.length} incomplete attempts:\n`);

    incompleteAttempts.forEach((attempt, index) => {
      const conversationHistory = attempt.conversationHistory as {
        messages?: unknown[];
      };
      const messageCount = conversationHistory?.messages?.length || 0;

      console.log(`${index + 1}. Task: ${attempt.task.title}`);
      console.log(`   User: ${attempt.user.name || attempt.user.email}`);
      console.log(`   Messages: ${messageCount}`);
      console.log(`   Started: ${new Date(attempt.startTime).toLocaleString()}`);
    });

    console.log('\n🗑️  Deleting incomplete attempts...');

    // Delete all incomplete attempts
    const result = await prisma.taskAttempt.deleteMany({
      where: {
        isCompleted: false,
      },
    });

    console.log(`✅ Deleted ${result.count} incomplete attempts`);

    // Clear currentTaskId for all users
    await prisma.user.updateMany({
      data: {
        currentTaskId: null,
      },
    });

    console.log('✅ Cleared currentTaskId for all users');
  } catch (error) {
    console.error('Error clearing incomplete attempts:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
clearIncompleteAttempts()
  .then(() => {
    console.log('\n✅ Script completed successfully');
    console.log('ℹ️  You can now start tasks fresh without resuming previous attempts.');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Script failed:', error);
    process.exit(1);
  });
