// Auto-generated main seed file
// Generated at: 2025-12-09T14:24:53.468Z
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
