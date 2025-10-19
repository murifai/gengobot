import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import ProgressClient from './ProgressClient'

export default async function ProgressPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  return <ProgressClient user={user} />
}
