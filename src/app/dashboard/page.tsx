import Link from 'next/link'
import { createClient } from '@/utils/supabase/server'
import Navbar from '@/components/Navbar'
import AchievementsGrid, { UserAchievementRecord } from '@/components/AchievementsGrid'
import FinancialCharts from '@/components/FinancialCharts'
import FinancialTwinDrawer from '@/components/FinancialTwinDrawer'

export default async function DashboardPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  let username = user?.email?.split('@')[0] || 'User'

  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('username')
      .eq('id', user.id)
      .single()

    if (profile?.username) {
      username = profile.username
    }
  }

  // Fetch active game session
  const { data: activeSession } = user
    ? await supabase
        .from('game_sessions')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .maybeSingle()
    : { data: null }

  // Fetch decision log history for charts
  const { data: decisionLogs } = activeSession
    ? await supabase
        .from('decisions_log')
        .select('*')
        .eq('session_id', activeSession.id)
        .order('month_number', { ascending: true })
    : { data: [] }

  // Fetch earned achievements for this user
  const { data: earnedAchievements } = user
    ? await supabase
        .from('user_achievements')
        .select('achievement_code, earned_at')
        .eq('user_id', user.id)
    : { data: [] }

  return (
    <main className="min-h-screen bg-[#080b11] bg-radial-gradient text-white">
      {/* Unified Header Navigation */}
      <Navbar userEmail={user?.email} />

      {/* Main Dashboard Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-8">
        {/* Welcome Hero Card */}
        <div className="glass-card rounded-3xl p-8 sm:p-10 border border-white/10 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none"></div>

          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-semibold mb-4">
            <span>Financial Command Center</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mb-3">
            Welcome back, <span className="bg-gradient-to-r from-indigo-400 via-purple-300 to-pink-400 bg-clip-text text-transparent">{username}</span>
          </h1>
          <p className="text-gray-400 text-xs sm:text-sm max-w-lg mb-8 leading-relaxed">
            Monitor your financial health trajectories, complete educational modules, and consult your AI Financial Twin.
          </p>

          <div className="flex flex-wrap gap-4">
            {activeSession ? (
              <Link
                href="/game"
                className="btn-primary px-6 py-3 rounded-2xl text-xs font-extrabold text-white flex items-center gap-2 shadow-xl shadow-indigo-500/25 transition-all hover:scale-[1.02]"
              >
                <span>Continue Game ({activeSession.job})</span>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </Link>
            ) : (
              <Link
                href="/game/new"
                className="btn-primary px-6 py-3 rounded-2xl text-xs font-extrabold text-white flex items-center gap-2 shadow-xl shadow-indigo-500/25 transition-all hover:scale-[1.02]"
              >
                <span>Start Your Financial Life</span>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </Link>
            )}

            <Link
              href="/learn"
              className="px-6 py-3 rounded-2xl text-xs font-semibold text-gray-300 bg-white/[0.03] hover:bg-white/10 border border-white/10 transition-all flex items-center gap-2"
            >
              <span>Learning Center</span>
              <span>📚</span>
            </Link>

            <Link
              href="/leaderboard"
              className="px-6 py-3 rounded-2xl text-xs font-semibold text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/20 transition-all flex items-center gap-2"
            >
              <span>Global Leaderboard</span>
              <span>🏆</span>
            </Link>
          </div>
        </div>

        {/* User Quick Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="glass-card p-5 rounded-2xl border border-white/10">
            <div className="text-[10px] text-gray-500 uppercase tracking-wider mb-1 font-bold">User Account</div>
            <div className="text-xs font-mono text-gray-200 truncate">{user?.email}</div>
          </div>
          <div className="glass-card p-5 rounded-2xl border border-white/10">
            <div className="text-[10px] text-gray-500 uppercase tracking-wider mb-1 font-bold">Username</div>
            <div className="text-xs font-semibold text-gray-200">{username}</div>
          </div>
          <div className="glass-card p-5 rounded-2xl border border-white/10">
            <div className="text-[10px] text-gray-500 uppercase tracking-wider mb-1 font-bold">Simulation Career</div>
            <div className="text-xs font-semibold text-indigo-400">
              {activeSession ? `${activeSession.job} (Month #${activeSession.month_number})` : 'No Active Game'}
            </div>
          </div>
        </div>

        {/* Analytics Charts */}
        {activeSession && (
          <FinancialCharts
            history={decisionLogs || []}
            currentNetWorth={Number(activeSession.net_worth)}
          />
        )}

        {/* Achievements Badge Grid */}
        <div className="glass-card rounded-3xl p-6 sm:p-8 border border-white/10">
          <AchievementsGrid earnedAchievements={(earnedAchievements || []) as UserAchievementRecord[]} />
        </div>
      </div>

      {/* Floating AI Financial Twin Drawer */}
      {activeSession && <FinancialTwinDrawer financialProfile={activeSession} />}
    </main>
  )
}
