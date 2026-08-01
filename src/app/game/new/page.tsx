import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import JobSelectionClient from './JobSelectionClient'

export default async function NewGamePage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Check if user already has an active game session
  const { data: activeSession } = await supabase
    .from('game_sessions')
    .select('id')
    .eq('user_id', user.id)
    .eq('status', 'active')
    .maybeSingle()

  if (activeSession) {
    redirect('/game')
  }

  return <JobSelectionClient userId={user.id} />
}
