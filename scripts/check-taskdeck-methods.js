const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

console.log('Checking TaskDeck methods...\n');

const methods = [
  'findMany',
  'findUnique',
  'findFirst',
  'create',
  'createMany',
  'update',
  'updateMany',
  'delete',
  'deleteMany',
  'count'
];

methods.forEach(method => {
  const exists = typeof prisma.taskDeck[method] === 'function';
  console.log(`${exists ? '✅' : '❌'} prisma.taskDeck.${method}: ${exists ? 'available' : 'NOT FOUND'}`);
});

prisma.$disconnect();
