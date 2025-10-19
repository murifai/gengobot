import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import CharactersClient from './CharactersClient'

export default async function CharactersPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  return <CharactersClient user={user} />
}
