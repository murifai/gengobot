/**
 * Script to check task attempts and identify incomplete attempts
 * Helps diagnose chat history reset issues
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkTaskAttempts() {
  try {
    console.log('Checking task attempts...\n');

    // Get all task attempts
    const attempts = await prisma.taskAttempt.findMany({
      include: {
        task: {
          select: {
            id: true,
            title: true,
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        startTime: 'desc',
      },
    });

    console.log(`Found ${attempts.length} task attempts:\n`);

    if (attempts.length === 0) {
      console.log('✅ No task attempts found - fresh start!');
      return;
    }

    // Group by completion status
    const incomplete = attempts.filter((a) => !a.isCompleted);
    const completed = attempts.filter((a) => a.isCompleted);

    console.log(`📊 Summary:`);
    console.log(`- Incomplete: ${incomplete.length}`);
    console.log(`- Completed: ${completed.length}\n`);

    if (incomplete.length > 0) {
      console.log('⚠️  Incomplete attempts (these will be resumed on task start):\n');
      incomplete.forEach((attempt) => {
        const conversationHistory = attempt.conversationHistory as {
          messages?: unknown[];
          completedObjectives?: string[];
          startedAt?: string;
        };
        const messageCount = conversationHistory?.messages?.length || 0;

        console.log(`ID: ${attempt.id}`);
        console.log(`Task: ${attempt.task.title}`);
        console.log(`User: ${attempt.user.name || attempt.user.email}`);
        console.log(`Messages: ${messageCount}`);
        console.log(`Started: ${new Date(attempt.startTime).toLocaleString()}`);
        console.log(`Retry count: ${attempt.retryCount}`);
        console.log('---');
      });
    }

    if (completed.length > 0) {
      console.log('\n✅ Completed attempts:\n');
      completed.forEach((attempt) => {
        const conversationHistory = attempt.conversationHistory as {
          messages?: unknown[];
          completedObjectives?: string[];
          startedAt?: string;
        };
        const messageCount = conversationHistory?.messages?.length || 0;

        console.log(`ID: ${attempt.id}`);
        console.log(`Task: ${attempt.task.title}`);
        console.log(`User: ${attempt.user.name || attempt.user.email}`);
        console.log(`Messages: ${messageCount}`);
        console.log(`Overall Score: ${attempt.overallScore || 'N/A'}`);
        console.log(
          `Duration: ${Math.round((new Date(attempt.endTime!).getTime() - new Date(attempt.startTime).getTime()) / 60000)} minutes`
        );
        console.log('---');
      });
    }

    // Check for any attempts with no conversation history
    const emptyAttempts = attempts.filter((a) => {
      const conversationHistory = a.conversationHistory as {
        messages?: unknown[];
      };
      return !conversationHistory?.messages || conversationHistory.messages.length === 0;
    });

    if (emptyAttempts.length > 0) {
      console.log(`\n⚠️  Found ${emptyAttempts.length} attempts with no conversation history`);
      console.log(
        'These attempts may have been created but never used, or there was an issue persisting messages.'
      );
    }
  } catch (error) {
    console.error('Error checking task attempts:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
checkTaskAttempts()
  .then(() => {
    console.log('\n✅ Script completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Script failed:', error);
    process.exit(1);
  });
