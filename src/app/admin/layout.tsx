import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import AdminLayoutClient from './AdminLayoutClient'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Check admin status
  const dbUser = await prisma.user.findUnique({
    where: { email: user.email! },
    select: { isAdmin: true, name: true, email: true },
  })

  if (!dbUser?.isAdmin) {
    redirect('/dashboard')
  }

  return <AdminLayoutClient user={dbUser}>{children}</AdminLayoutClient>
}
