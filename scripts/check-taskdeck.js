const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

console.log('TaskDeck model available:', typeof prisma.taskDeck);

if (prisma.taskDeck) {
  console.log('✅ TaskDeck model is available in Prisma Client');
  console.log('Available methods:', Object.getOwnPropertyNames(Object.getPrototypeOf(prisma.taskDeck))
    .filter(m => !m.startsWith('_'))
    .join(', '));
} else {
  console.log('❌ TaskDeck model NOT found in Prisma Client');
}

prisma.$disconnect();
