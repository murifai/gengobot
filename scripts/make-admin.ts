/**
 * Script to make a user an admin
 * Usage: npx ts-node scripts/make-admin.ts <email>
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function makeAdmin(email: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { email },
    })

    if (!user) {
      // Create the user if they don't exist
      const newUser = await prisma.user.create({
        data: {
          email,
          isAdmin: true,
          proficiency: 'N5',
        },
      })
      console.log(`✅ Created new admin user: ${newUser.email}`)
      return
    }

    if (user.isAdmin) {
      console.log(`ℹ️  User ${email} is already an admin`)
      return
    }

    const updatedUser = await prisma.user.update({
      where: { email },
      data: { isAdmin: true },
    })

    console.log(`✅ Successfully made ${updatedUser.email} an admin`)
  } catch (error) {
    console.error('❌ Error:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

const email = process.argv[2]

if (!email) {
  console.error('❌ Please provide an email address')
  console.log('Usage: npx ts-node scripts/make-admin.ts <email>')
  process.exit(1)
}

makeAdmin(email)
