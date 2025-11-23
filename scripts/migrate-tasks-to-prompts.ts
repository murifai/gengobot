/**
 * Migration script to set default prompt/voice values for existing tasks
 *
 * This script updates all existing tasks that have empty prompt fields
 * with a default prompt based on their category and scenario.
 *
 * Run with: npx tsx scripts/migrate-tasks-to-prompts.ts
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Default prompt templates by category
const CATEGORY_PROMPTS: Record<string, string> = {
  Restaurant: `You are a friendly Japanese restaurant staff member.
Your role is to help customers order food and answer questions about the menu.

Guidelines:
- Use polite Japanese (丁寧語/keigo)
- Be patient and helpful with learners
- Naturally correct any mistakes
- Suggest popular dishes when asked
- Ask clarifying questions if needed`,

  Shopping: `You are a helpful shop clerk in Japan.
Your role is to assist customers with purchases and provide information about products.

Guidelines:
- Use polite customer service Japanese
- Explain product features clearly
- Help with sizes, colors, and prices
- Process simple transactions
- Be friendly and welcoming`,

  Travel: `You are a helpful travel service staff member in Japan.
Your role is to assist travelers with directions, tickets, and travel information.

Guidelines:
- Give clear directions
- Explain ticket options and prices
- Help with schedules and reservations
- Use simple, clear Japanese
- Be patient with confused travelers`,

  Work: `You are a Japanese colleague at a workplace.
Your role is to help with work-related conversations and tasks.

Guidelines:
- Use appropriate workplace Japanese (敬語 when needed)
- Help with work procedures and requests
- Be professional but friendly
- Assist with common workplace interactions
- Correct mistakes naturally`,

  'Daily Life': `You are a friendly Japanese person in everyday situations.
Your role is to help with common daily conversations.

Guidelines:
- Use natural, casual Japanese
- Be friendly and helpful
- Assist with everyday tasks
- Naturally correct any mistakes
- Encourage conversation practice`,
};

// Default prompt for categories not in the list
const DEFAULT_PROMPT = `You are a helpful Japanese conversation partner.
Your role is to engage in natural conversation with the learner.

Guidelines:
- Use appropriate Japanese for the context
- Be patient and encouraging
- Naturally correct any mistakes
- Ask follow-up questions
- Help the learner practice`;

async function migrateTasksToPrompts() {
  console.log('Starting task migration to prompts...\n');

  // Get all tasks with empty prompts
  const tasks = await prisma.task.findMany({
    where: {
      prompt: '',
    },
    select: {
      id: true,
      title: true,
      category: true,
      scenario: true,
    },
  });

  console.log(`Found ${tasks.length} tasks with empty prompts\n`);

  if (tasks.length === 0) {
    console.log('No tasks need migration. All tasks already have prompts.');
    return;
  }

  let updated = 0;
  let errors = 0;

  for (const task of tasks) {
    try {
      // Get prompt based on category or use default
      let prompt = CATEGORY_PROMPTS[task.category] || DEFAULT_PROMPT;

      // Customize prompt with scenario if available
      if (task.scenario) {
        prompt += `\n\nScenario:\n${task.scenario}`;
      }

      // Update the task
      await prisma.task.update({
        where: { id: task.id },
        data: {
          prompt,
          // Keep default voice and speed from schema defaults
        },
      });

      updated++;
      console.log(`✓ Updated: ${task.title} (${task.category})`);
    } catch (error) {
      errors++;
      console.error(`✗ Error updating ${task.title}:`, error);
    }
  }

  console.log(`\n--- Migration Complete ---`);
  console.log(`Updated: ${updated} tasks`);
  console.log(`Errors: ${errors} tasks`);
  console.log(`Total: ${tasks.length} tasks processed`);
}

// Run the migration
migrateTasksToPrompts()
  .catch(error => {
    console.error('Migration failed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
