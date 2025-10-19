import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function createDatabaseUsers() {
  console.log('🚀 Creating database users...\n')

  const users: Array<{
    email: string
    name: string
    isAdmin: boolean
    proficiency: string
    preferredTaskCategories?: string[]
  }> = [
    {
      email: 'admin@gengobot.com',
      name: 'Admin User',
      isAdmin: true,
      proficiency: 'N1',
    },
    {
      email: 'student@gengobot.com',
      name: 'Student User',
      isAdmin: false,
      proficiency: 'N5',
      preferredTaskCategories: ['Restaurant', 'Shopping', 'Travel'],
    },
  ]

  for (const user of users) {
    try {
      console.log(`👤 Creating ${user.isAdmin ? 'Admin' : 'Student'} user: ${user.email}`)

      await prisma.user.upsert({
        where: { email: user.email },
        update: {
          name: user.name,
          isAdmin: user.isAdmin,
          proficiency: user.proficiency,
        },
        create: {
          email: user.email,
          name: user.name,
          isAdmin: user.isAdmin,
          proficiency: user.proficiency,
          preferredTaskCategories: user.preferredTaskCategories,
        },
      })
      console.log(`✅ Database user created/updated: ${user.email}\n`)
    } catch (error) {
      console.error(`❌ Error creating user ${user.email}:`, error)
    }
  }

  console.log('='.repeat(70))
  console.log('✅ Database users created successfully!')
  console.log('='.repeat(70))
  console.log('\n📋 Next Steps - Create Auth Users in Supabase:\n')
  console.log('1. Go to your Supabase Dashboard: https://ynwhzzpeeaouejimjmwo.supabase.co')
  console.log('2. Navigate to Authentication > Users')
  console.log('3. Click "Add User" and create:\n')
  console.log('   Admin Account:')
  console.log('     Email: admin@gengobot.com')
  console.log('     Password: admin123 (or your choice)')
  console.log('     ✓ Auto Confirm Email\n')
  console.log('   Student Account:')
  console.log('     Email: student@gengobot.com')
  console.log('     Password: student123 (or your choice)')
  console.log('     ✓ Auto Confirm Email\n')
  console.log('4. Login to the app with these credentials!\n')
  console.log('='.repeat(70))
  console.log('\n💡 Differences between Admin and Student:\n')
  console.log('Admin Features:')
  console.log('  • Access to /admin panel')
  console.log('  • Task management (create, edit, delete tasks)')
  console.log('  • User management')
  console.log('  • Character management (all characters)')
  console.log('  • Settings and admin logs\n')
  console.log('Student Features:')
  console.log('  • Task-based learning')
  console.log('  • Free chat mode')
  console.log('  • Progress tracking')
  console.log('  • Voice practice')
  console.log('  • Personal character management')
  console.log('  • Profile settings\n')
  console.log('  ❌ NO access to /admin panel\n')
}

createDatabaseUsers()
  .catch((e) => {
    console.error('❌ Script failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
