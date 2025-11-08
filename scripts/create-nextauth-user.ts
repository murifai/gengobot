import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Creating test users with NextAuth...');

  // Create regular test user
  const testUserPassword = await bcrypt.hash('password123', 10);
  const testUser = await prisma.user.upsert({
    where: { email: 'test@example.com' },
    update: {
      password: testUserPassword,
      name: 'Test User',
    },
    create: {
      email: 'test@example.com',
      password: testUserPassword,
      name: 'Test User',
      proficiency: 'N5',
      isAdmin: false,
    },
  });
  console.log('✅ Created test user:', testUser.email);

  // Create admin user
  const adminPassword = await bcrypt.hash('admin123', 10);
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {
      password: adminPassword,
      name: 'Admin User',
      isAdmin: true,
    },
    create: {
      email: 'admin@example.com',
      password: adminPassword,
      name: 'Admin User',
      proficiency: 'N1',
      isAdmin: true,
    },
  });
  console.log('✅ Created admin user:', adminUser.email);

  console.log('\n📝 Test Credentials:');
  console.log('Regular User:');
  console.log('  Email: test@example.com');
  console.log('  Password: password123');
  console.log('\nAdmin User:');
  console.log('  Email: admin@example.com');
  console.log('  Password: admin123');
}

main()
  .catch(e => {
    console.error('❌ Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
