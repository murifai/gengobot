import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // Default super admin credentials
  const email = process.env.ADMIN_EMAIL || 'admin@gengobot.com';
  const password = process.env.ADMIN_PASSWORD || 'admin123456';
  const name = process.env.ADMIN_NAME || 'Super Admin';

  console.log('Creating super admin...');
  console.log(`Email: ${email}`);

  // Check if admin already exists
  const existingAdmin = await prisma.admin.findUnique({
    where: { email },
  });

  if (existingAdmin) {
    console.log('Admin already exists with this email. Updating password...');

    const hashedPassword = await bcrypt.hash(password, 12);

    await prisma.admin.update({
      where: { email },
      data: {
        password: hashedPassword,
        name,
        role: 'SUPER_ADMIN',
        isActive: true,
      },
    });

    console.log('Admin password updated successfully!');
  } else {
    // Create new admin
    const hashedPassword = await bcrypt.hash(password, 12);

    await prisma.admin.create({
      data: {
        email,
        password: hashedPassword,
        name,
        role: 'SUPER_ADMIN',
        isActive: true,
      },
    });

    console.log('Super admin created successfully!');
  }

  console.log('\n=== Admin Credentials ===');
  console.log(`Email: ${email}`);
  console.log(`Password: ${password}`);
  console.log('========================\n');
  console.log('IMPORTANT: Change this password after first login!');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async e => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
