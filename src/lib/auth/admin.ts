import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'

/**
 * Check if the current user is an admin
 */
export async function isAdmin(): Promise<boolean> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return false
  }

  // Check admin status in database
  const dbUser = await prisma.user.findUnique({
    where: { email: user.email! },
    select: { isAdmin: true },
  })

  return dbUser?.isAdmin ?? false
}

/**
 * Check if a specific user ID is an admin
 */
export async function isUserAdmin(userId: string): Promise<boolean> {
  const dbUser = await prisma.user.findUnique({
    where: { id: userId },
    select: { isAdmin: true },
  })

  return dbUser?.isAdmin ?? false
}

/**
 * Get current user with admin status
 */
export async function getCurrentUserWithRole() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return null
  }

  const dbUser = await prisma.user.findUnique({
    where: { email: user.email! },
    select: {
      id: true,
      email: true,
      name: true,
      isAdmin: true,
      proficiency: true,
    },
  })

  return dbUser
}

/**
 * Set admin status for a user (only callable by existing admins)
 */
export async function setAdminStatus(userId: string, adminStatus: boolean) {
  const currentIsAdmin = await isAdmin()

  if (!currentIsAdmin) {
    throw new Error('Only admins can modify admin status')
  }

  await prisma.user.update({
    where: { id: userId },
    data: { isAdmin: adminStatus },
  })
}
