import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import MonthlyDecisionClient, { GameSession, Investment } from './MonthlyDecisionClient'
import { UserAchievementRecord } from '@/components/AchievementsGrid'

export default async function GamePage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Fetch active session for logged-in user
  const { data: session } = await supabase
    .from('game_sessions')
    .select('*')
    .eq('user_id', user.id)
    .eq('status', 'active')
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (!session) {
    redirect('/game/new')
  }

  // Fetch investments portfolio for this active session
  const { data: investments } = await supabase
    .from('investments')
    .select('*')
    .eq('session_id', session.id)
    .order('created_at', { ascending: true })

  // Fetch earned achievements for this user
  const { data: earnedAchievements } = await supabase
    .from('user_achievements')
    .select('achievement_code, earned_at')
    .eq('user_id', user.id)

  // Fetch decisions history for charts
  const { data: history } = await supabase
    .from('decisions_log')
    .select('*')
    .eq('session_id', session.id)
    .order('month_number', { ascending: true })

  // Fetch most recent decision log with ai_feedback
  const { data: latestDecision } = await supabase
    .from('decisions_log')
    .select('ai_feedback')
    .eq('session_id', session.id)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  // Fetch most recent life event
  const { data: latestEventRow } = await supabase
    .from('life_events_log')
    .select('*')
    .eq('session_id', session.id)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  let initialLifeEvent = null
  if (latestEventRow && latestEventRow.event_detail) {
    initialLifeEvent = {
      title: latestEventRow.event_detail.title || latestEventRow.event_type,
      emoji: latestEventRow.event_detail.emoji || '⚡',
      description: `Life event occurred during Month #${latestEventRow.month_number}.`,
    }
  }

  return (
    <MonthlyDecisionClient
      session={session as GameSession}
      investments={(investments || []) as Investment[]}
      earnedAchievements={(earnedAchievements || []) as UserAchievementRecord[]}
      initialAiFeedback={latestDecision?.ai_feedback || null}
      initialLifeEvent={initialLifeEvent}
      initialHistory={history || []}
      userEmail={user.email}
    />
  )
}
