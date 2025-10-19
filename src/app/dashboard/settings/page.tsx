import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import SettingsClient from './SettingsClient'

export default async function SettingsPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Get user data from database
  const dbUser = await prisma.user.findUnique({
    where: { email: user.email! },
    select: {
      id: true,
      name: true,
      email: true,
      proficiency: true,
      preferredTaskCategories: true,
    },
  })

  return <SettingsClient user={user} dbUser={dbUser} />
}
