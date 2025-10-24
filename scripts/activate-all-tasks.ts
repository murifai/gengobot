/**
 * Script to activate all tasks in the database
 * This ensures all tasks have isActive = true
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function activateAllTasks() {
  try {
    console.log('Checking tasks...');

    // Get all tasks
    const tasks = await prisma.task.findMany({
      select: {
        id: true,
        title: true,
        isActive: true,
      },
    });

    console.log(`\nFound ${tasks.length} tasks:`);
    tasks.forEach((task) => {
      console.log(`- ${task.title}: ${task.isActive ? '✅ Active' : '❌ Inactive'}`);
    });

    // Count inactive tasks
    const inactiveTasks = tasks.filter((task) => !task.isActive);
    console.log(`\n${inactiveTasks.length} inactive tasks found.`);

    if (inactiveTasks.length > 0) {
      console.log('\nActivating all tasks...');

      const result = await prisma.task.updateMany({
        where: {
          isActive: false,
        },
        data: {
          isActive: true,
        },
      });

      console.log(`✅ Activated ${result.count} tasks`);
    } else {
      console.log('\n✅ All tasks are already active!');
    }

    // Verify all tasks are now active
    const verifyTasks = await prisma.task.findMany({
      where: {
        isActive: false,
      },
    });

    if (verifyTasks.length === 0) {
      console.log('\n✅ Success! All tasks are now active.');
    } else {
      console.error(`\n❌ Error: ${verifyTasks.length} tasks are still inactive.`);
    }
  } catch (error) {
    console.error('Error activating tasks:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
activateAllTasks()
  .then(() => {
    console.log('\n✅ Script completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Script failed:', error);
    process.exit(1);
  });
