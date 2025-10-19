import { createClient } from '@supabase/supabase-js'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Initialize Supabase Admin client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables')
  console.error('Required: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})

async function createTestUsers() {
  console.log('🚀 Creating test users...\n')

  const users = [
    {
      email: 'admin@gengobot.com',
      password: 'admin123',
      name: 'Admin User',
      isAdmin: true,
      proficiency: 'N1',
    },
    {
      email: 'student@gengobot.com',
      password: 'student123',
      name: 'Student User',
      isAdmin: false,
      proficiency: 'N5',
      preferredTaskCategories: ['Restaurant', 'Shopping', 'Travel'],
    },
  ]

  for (const user of users) {
    try {
      console.log(`\n👤 Creating ${user.isAdmin ? 'Admin' : 'Student'} user: ${user.email}`)

      // 1. Create user in Supabase Auth
      console.log('  📧 Creating Supabase Auth user...')
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: user.email,
        password: user.password,
        email_confirm: true,
      })

      if (authError) {
        if (authError.message.includes('already registered')) {
          console.log('  ⚠️  User already exists in Supabase Auth')
        } else {
          throw authError
        }
      } else {
        console.log('  ✅ Supabase Auth user created')
      }

      // 2. Create or update user in database
      console.log('  💾 Creating database user...')
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
          preferredTaskCategories: user.preferredTaskCategories || undefined,
        },
      })
      console.log('  ✅ Database user created/updated')

      console.log(`\n✨ ${user.isAdmin ? 'Admin' : 'Student'} account ready!`)
      console.log(`   Email: ${user.email}`)
      console.log(`   Password: ${user.password}`)
      console.log(`   Role: ${user.isAdmin ? 'Administrator' : 'Student'}`)
      console.log(`   Proficiency: ${user.proficiency}`)
    } catch (error) {
      console.error(`\n❌ Error creating user ${user.email}:`, error)
    }
  }

  console.log('\n' + '='.repeat(60))
  console.log('🎉 Test user creation complete!')
  console.log('='.repeat(60))
  console.log('\n📝 Login Credentials:')
  console.log('\nAdmin Account:')
  console.log('  Email: admin@gengobot.com')
  console.log('  Password: admin123')
  console.log('  Features: Full admin panel access, task management, user management\n')
  console.log('Student Account:')
  console.log('  Email: student@gengobot.com')
  console.log('  Password: student123')
  console.log('  Features: Task learning, chat, progress tracking, settings\n')
}

createTestUsers()
  .catch((e) => {
    console.error('❌ Script failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
