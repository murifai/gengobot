/**
 * Export current database data to seed files
 *
 * This script exports data from the production/current database
 * and generates TypeScript seed files that can be used to
 * populate a fresh database.
 *
 * Usage: npx tsx scripts/export-db-to-seed.ts
 *
 * Tables exported:
 * - TaskCategory & TaskSubcategory
 * - SubscriptionTierConfig
 * - Task (with related data)
 * - Deck & Flashcard (public/system decks only)
 */

import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

const OUTPUT_DIR = path.join(process.cwd(), 'prisma', 'seeds');

// Ensure output directory exists
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

async function exportCategories() {
  console.log('📦 Exporting TaskCategory & TaskSubcategory...');

  const categories = await prisma.taskCategory.findMany({
    include: {
      subcategories: true,
    },
    orderBy: { name: 'asc' },
  });

  const data = categories.map(cat => ({
    id: cat.id,
    name: cat.name,
    subcategories: cat.subcategories.map(sub => ({
      id: sub.id,
      name: sub.name,
    })),
  }));

  const content = `// Auto-generated from database export
// Generated at: ${new Date().toISOString()}

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const categoriesData = ${JSON.stringify(data, null, 2)};

export async function seedCategories() {
  console.log('Seeding categories and subcategories...');

  for (const categoryData of categoriesData) {
    const category = await prisma.taskCategory.upsert({
      where: { id: categoryData.id },
      update: { name: categoryData.name },
      create: {
        id: categoryData.id,
        name: categoryData.name,
      },
    });
    console.log(\`✓ Category: \${category.name}\`);

    for (const sub of categoryData.subcategories) {
      await prisma.taskSubcategory.upsert({
        where: { id: sub.id },
        update: {
          name: sub.name,
          categoryId: category.id,
        },
        create: {
          id: sub.id,
          name: sub.name,
          categoryId: category.id,
        },
      });
      console.log(\`  ✓ Subcategory: \${sub.name}\`);
    }
  }

  console.log('✅ Categories seeded successfully!');
}

// Run if executed directly
if (require.main === module) {
  seedCategories()
    .catch(e => {
      console.error(e);
      process.exit(1);
    })
    .finally(() => prisma.$disconnect());
}
`;

  fs.writeFileSync(path.join(OUTPUT_DIR, 'categories.ts'), content);
  console.log(
    `  ✅ Exported ${categories.length} categories with ${data.reduce((acc, c) => acc + c.subcategories.length, 0)} subcategories`
  );
}

async function exportSubscriptionTiers() {
  console.log('📦 Exporting SubscriptionTierConfig...');

  const tiers = await prisma.subscriptionTierConfig.findMany({
    orderBy: { priceMonthly: 'asc' },
  });

  const data = tiers.map(tier => ({
    name: tier.name,
    priceMonthly: tier.priceMonthly,
    credits: tier.credits,
    discount3Months: tier.discount3Months,
    discount6Months: tier.discount6Months,
    discount12Months: tier.discount12Months,
    features: tier.features,
    isActive: tier.isActive,
  }));

  const content = `// Auto-generated from database export
// Generated at: ${new Date().toISOString()}

import { PrismaClient, SubscriptionTier } from '@prisma/client';

const prisma = new PrismaClient();

export const tiersData: Array<{
  name: SubscriptionTier;
  priceMonthly: number;
  credits: number;
  discount3Months: number;
  discount6Months: number;
  discount12Months: number;
  features: string[];
  isActive: boolean;
}> = ${JSON.stringify(data, null, 2)};

export async function seedSubscriptionTiers() {
  console.log('Seeding subscription tiers...');

  for (const tier of tiersData) {
    await prisma.subscriptionTierConfig.upsert({
      where: { name: tier.name },
      update: {
        priceMonthly: tier.priceMonthly,
        credits: tier.credits,
        features: tier.features,
        discount3Months: tier.discount3Months,
        discount6Months: tier.discount6Months,
        discount12Months: tier.discount12Months,
        isActive: tier.isActive,
      },
      create: {
        name: tier.name,
        priceMonthly: tier.priceMonthly,
        credits: tier.credits,
        features: tier.features,
        discount3Months: tier.discount3Months,
        discount6Months: tier.discount6Months,
        discount12Months: tier.discount12Months,
        isActive: tier.isActive,
      },
    });
    console.log(\`✓ Tier: \${tier.name}\`);
  }

  console.log('✅ Subscription tiers seeded successfully!');
}

// Run if executed directly
if (require.main === module) {
  seedSubscriptionTiers()
    .catch(e => {
      console.error(e);
      process.exit(1);
    })
    .finally(() => prisma.$disconnect());
}
`;

  fs.writeFileSync(path.join(OUTPUT_DIR, 'subscription-tiers.ts'), content);
  console.log(`  ✅ Exported ${tiers.length} subscription tiers`);
}

async function exportTasks() {
  console.log('📦 Exporting Tasks...');

  const tasks = await prisma.task.findMany({
    where: { isActive: true },
    include: {
      studyDecks: {
        include: {
          deck: {
            select: { id: true, name: true },
          },
        },
      },
    },
    orderBy: [{ category: 'asc' }, { difficulty: 'asc' }, { title: 'asc' }],
  });

  const data = tasks.map(task => ({
    id: task.id,
    title: task.title,
    description: task.description,
    category: task.category,
    subcategoryId: task.subcategoryId,
    difficulty: task.difficulty,
    scenario: task.scenario,
    learningObjectives: task.learningObjectives,
    conversationExample: task.conversationExample,
    estimatedDuration: task.estimatedDuration,
    maxMessages: task.maxMessages,
    prompt: task.prompt,
    voice: task.voice,
    speakingSpeed: task.speakingSpeed,
    audioExample: task.audioExample,
    deckIds: task.studyDecks.map(td => td.deckId),
  }));

  const content = `// Auto-generated from database export
// Generated at: ${new Date().toISOString()}

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const tasksData = ${JSON.stringify(data, null, 2)};

export async function seedTasks() {
  console.log('Seeding tasks...');

  for (const taskData of tasksData) {
    const { deckIds, ...task } = taskData;

    const created = await prisma.task.upsert({
      where: { id: task.id },
      update: {
        title: task.title,
        description: task.description,
        category: task.category,
        subcategoryId: task.subcategoryId,
        difficulty: task.difficulty,
        scenario: task.scenario,
        learningObjectives: task.learningObjectives,
        conversationExample: task.conversationExample,
        estimatedDuration: task.estimatedDuration,
        maxMessages: task.maxMessages,
        prompt: task.prompt,
        voice: task.voice,
        speakingSpeed: task.speakingSpeed,
        audioExample: task.audioExample,
        isActive: true,
      },
      create: {
        id: task.id,
        title: task.title,
        description: task.description,
        category: task.category,
        subcategoryId: task.subcategoryId,
        difficulty: task.difficulty,
        scenario: task.scenario,
        learningObjectives: task.learningObjectives,
        conversationExample: task.conversationExample,
        estimatedDuration: task.estimatedDuration,
        maxMessages: task.maxMessages,
        prompt: task.prompt,
        voice: task.voice,
        speakingSpeed: task.speakingSpeed,
        audioExample: task.audioExample,
        isActive: true,
      },
    });

    // Link decks if any
    if (deckIds && deckIds.length > 0) {
      for (const deckId of deckIds) {
        await prisma.taskDeck.upsert({
          where: {
            taskId_deckId: {
              taskId: created.id,
              deckId: deckId,
            },
          },
          update: {},
          create: {
            taskId: created.id,
            deckId: deckId,
          },
        });
      }
    }

    console.log(\`✓ Task: \${created.title}\`);
  }

  console.log(\`✅ \${tasksData.length} tasks seeded successfully!\`);
}

// Run if executed directly
if (require.main === module) {
  seedTasks()
    .catch(e => {
      console.error(e);
      process.exit(1);
    })
    .finally(() => prisma.$disconnect());
}
`;

  fs.writeFileSync(path.join(OUTPUT_DIR, 'tasks.ts'), content);
  console.log(`  ✅ Exported ${tasks.length} tasks`);
}

async function exportPublicDecks() {
  console.log('📦 Exporting Public/System Decks...');

  const decks = await prisma.deck.findMany({
    where: {
      OR: [{ isPublic: true }, { category: { in: ['Hiragana', 'Katakana'] } }],
    },
    include: {
      flashcards: {
        where: { isActive: true },
        orderBy: { position: 'asc' },
      },
      creator: {
        select: { email: true, isAdmin: true },
      },
    },
    orderBy: [{ category: 'asc' }, { name: 'asc' }],
  });

  const data = decks.map(deck => ({
    id: deck.id,
    name: deck.name,
    description: deck.description,
    category: deck.category,
    difficulty: deck.difficulty,
    isPublic: deck.isPublic,
    totalCards: deck.totalCards,
    creatorEmail: deck.creator.email,
    flashcards: deck.flashcards.map(fc => ({
      id: fc.id,
      cardType: fc.cardType,
      character: fc.character,
      romaji: fc.romaji,
      strokeSvg: fc.strokeSvg,
      kanji: fc.kanji,
      kanjiMeaning: fc.kanjiMeaning,
      onyomi: fc.onyomi,
      kunyomi: fc.kunyomi,
      word: fc.word,
      wordMeaning: fc.wordMeaning,
      reading: fc.reading,
      partOfSpeech: fc.partOfSpeech,
      grammarPoint: fc.grammarPoint,
      grammarMeaning: fc.grammarMeaning,
      usageNote: fc.usageNote,
      exampleSentence: fc.exampleSentence,
      exampleTranslation: fc.exampleTranslation,
      notes: fc.notes,
      tags: fc.tags,
      audioUrl: fc.audioUrl,
      exampleAudioUrl: fc.exampleAudioUrl,
      position: fc.position,
    })),
  }));

  const content = `// Auto-generated from database export
// Generated at: ${new Date().toISOString()}

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const decksData = ${JSON.stringify(data, null, 2)};

export async function seedDecks() {
  console.log('Seeding public/system decks...');

  // Find admin user for deck ownership
  const adminUser = await prisma.user.findFirst({
    where: { isAdmin: true },
  });

  if (!adminUser) {
    console.log('⚠️ No admin user found. Please create an admin first.');
    return;
  }

  for (const deckData of decksData) {
    const { flashcards, creatorEmail, ...deck } = deckData;

    // Find creator or use admin
    let creator = await prisma.user.findUnique({
      where: { email: creatorEmail },
    });

    if (!creator) {
      creator = adminUser;
    }

    const created = await prisma.deck.upsert({
      where: { id: deck.id },
      update: {
        name: deck.name,
        description: deck.description,
        category: deck.category,
        difficulty: deck.difficulty,
        isPublic: deck.isPublic,
        totalCards: deck.totalCards,
        isActive: true,
      },
      create: {
        id: deck.id,
        name: deck.name,
        description: deck.description,
        category: deck.category,
        difficulty: deck.difficulty,
        isPublic: deck.isPublic,
        totalCards: deck.totalCards,
        createdBy: creator.id,
        isActive: true,
      },
    });

    // Create flashcards
    for (const fc of flashcards) {
      await prisma.flashcard.upsert({
        where: { id: fc.id },
        update: {
          deckId: created.id,
          cardType: fc.cardType,
          character: fc.character,
          romaji: fc.romaji,
          strokeSvg: fc.strokeSvg,
          kanji: fc.kanji,
          kanjiMeaning: fc.kanjiMeaning,
          onyomi: fc.onyomi,
          kunyomi: fc.kunyomi,
          word: fc.word,
          wordMeaning: fc.wordMeaning,
          reading: fc.reading,
          partOfSpeech: fc.partOfSpeech,
          grammarPoint: fc.grammarPoint,
          grammarMeaning: fc.grammarMeaning,
          usageNote: fc.usageNote,
          exampleSentence: fc.exampleSentence,
          exampleTranslation: fc.exampleTranslation,
          notes: fc.notes,
          tags: fc.tags,
          audioUrl: fc.audioUrl,
          exampleAudioUrl: fc.exampleAudioUrl,
          position: fc.position,
          isActive: true,
        },
        create: {
          id: fc.id,
          deckId: created.id,
          cardType: fc.cardType,
          character: fc.character,
          romaji: fc.romaji,
          strokeSvg: fc.strokeSvg,
          kanji: fc.kanji,
          kanjiMeaning: fc.kanjiMeaning,
          onyomi: fc.onyomi,
          kunyomi: fc.kunyomi,
          word: fc.word,
          wordMeaning: fc.wordMeaning,
          reading: fc.reading,
          partOfSpeech: fc.partOfSpeech,
          grammarPoint: fc.grammarPoint,
          grammarMeaning: fc.grammarMeaning,
          usageNote: fc.usageNote,
          exampleSentence: fc.exampleSentence,
          exampleTranslation: fc.exampleTranslation,
          notes: fc.notes,
          tags: fc.tags,
          audioUrl: fc.audioUrl,
          exampleAudioUrl: fc.exampleAudioUrl,
          position: fc.position,
          isActive: true,
        },
      });
    }

    console.log(\`✓ Deck: \${created.name} (\${flashcards.length} cards)\`);
  }

  console.log(\`✅ \${decksData.length} decks seeded successfully!\`);
}

// Run if executed directly
if (require.main === module) {
  seedDecks()
    .catch(e => {
      console.error(e);
      process.exit(1);
    })
    .finally(() => prisma.$disconnect());
}
`;

  fs.writeFileSync(path.join(OUTPUT_DIR, 'decks.ts'), content);
  console.log(
    `  ✅ Exported ${decks.length} decks with ${data.reduce((acc, d) => acc + d.flashcards.length, 0)} flashcards`
  );
}

async function createMainSeedFile() {
  console.log('📦 Creating main seed file...');

  const content = `// Auto-generated main seed file
// Generated at: ${new Date().toISOString()}
//
// Usage: npx tsx prisma/seeds/index.ts
// Or via package.json: npm run db:seed

import { PrismaClient } from '@prisma/client';
import { seedCategories } from './categories';
import { seedSubscriptionTiers } from './subscription-tiers';
import { seedTasks } from './tasks';
import { seedDecks } from './decks';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');
  console.log('');

  // Seed in order (respect foreign key dependencies)
  await seedCategories();
  console.log('');

  await seedSubscriptionTiers();
  console.log('');

  await seedDecks();
  console.log('');

  await seedTasks();
  console.log('');

  console.log('🎉 Database seed completed!');
}

main()
  .catch(e => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
`;

  fs.writeFileSync(path.join(OUTPUT_DIR, 'index.ts'), content);
  console.log('  ✅ Created prisma/seeds/index.ts');
}

async function main() {
  console.log('🚀 Database Export Script');
  console.log('========================');
  console.log(`Output directory: ${OUTPUT_DIR}`);
  console.log('');

  try {
    await exportCategories();
    await exportSubscriptionTiers();
    await exportTasks();
    await exportPublicDecks();
    await createMainSeedFile();

    console.log('');
    console.log('🎉 Export completed!');
    console.log('');
    console.log('Generated files:');
    console.log('  - prisma/seeds/categories.ts');
    console.log('  - prisma/seeds/subscription-tiers.ts');
    console.log('  - prisma/seeds/tasks.ts');
    console.log('  - prisma/seeds/decks.ts');
    console.log('  - prisma/seeds/index.ts');
    console.log('');
    console.log('To seed a new database, run:');
    console.log('  npx tsx prisma/seeds/index.ts');
  } catch (error) {
    console.error('❌ Export failed:', error);
    process.exit(1);
  }
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
