import Link from 'next/link'
import { createClient } from '@/utils/supabase/server'
import Navbar from '@/components/Navbar'

export default async function LeaderboardPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Query top 20 active or high score game sessions
  const { data: topSessions } = await supabase
    .from('game_sessions')
    .select('id, user_id, job, salary, net_worth, financial_score, month_number, created_at')
    .order('financial_score', { ascending: false })
    .order('net_worth', { ascending: false })
    .limit(20)

  // Query user profiles for username lookup
  const userIds = Array.from(new Set(topSessions?.map((s) => s.user_id) || []))
  let usernameMap = new Map<string, string>()

  if (userIds.length > 0) {
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, username')
      .in('id', userIds)

    if (profiles) {
      profiles.forEach((p) => {
        if (p.username) usernameMap.set(p.id, p.username)
      })
    }
  }

  return (
    <main className="min-h-screen bg-[#080b11] bg-radial-gradient text-white">
      {/* Unified Navbar Header */}
      <Navbar userEmail={user?.email} />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-8">
        {/* Page Hero Header */}
        <div className="flex items-center justify-between pb-2 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/30 text-amber-400 font-bold flex items-center justify-center text-lg shadow-lg shadow-amber-500/10">
              🏆
            </div>
            <div>
              <h1 className="text-xl font-extrabold text-white tracking-tight">Global Financial Leaderboard</h1>
              <p className="text-xs text-gray-400">Top financial strategists ranked by Financial Score & Net Worth</p>
            </div>
          </div>
        </div>

        {/* Leaderboard Table Card */}
        <div className="glass-card rounded-3xl p-6 sm:p-8 border border-white/10 shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-gray-300 border-collapse">
              <thead>
                <tr className="border-b border-white/10 text-[10px] uppercase font-bold tracking-wider text-gray-400">
                  <th className="py-3 px-4">Rank</th>
                  <th className="py-3 px-4">Player</th>
                  <th className="py-3 px-4">Career</th>
                  <th className="py-3 px-4">Month</th>
                  <th className="py-3 px-4 text-right">Net Worth</th>
                  <th className="py-3 px-4 text-right">Financial Score</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {(!topSessions || topSessions.length === 0) && (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-gray-500">
                      No game sessions logged yet. Start playing at /game/new!
                    </td>
                  </tr>
                )}

                {topSessions?.map((sess, idx) => {
                  const rank = idx + 1
                  const isCurrentUser = user && sess.user_id === user.id
                  const username = usernameMap.get(sess.user_id) || `Player_${sess.user_id.slice(0, 5)}`

                  let rankBadge = `#${rank}`
                  if (rank === 1) rankBadge = '🥇 #1'
                  if (rank === 2) rankBadge = '🥈 #2'
                  if (rank === 3) rankBadge = '🥉 #3'

                  return (
                    <tr
                      key={sess.id}
                      className={`transition-colors ${
                        isCurrentUser
                          ? 'bg-indigo-500/15 border-l-4 border-l-indigo-500 text-white font-bold'
                          : 'hover:bg-white/[0.02]'
                      }`}
                    >
                      <td className="py-3.5 px-4 font-mono font-bold text-sm">
                        <span
                          className={`inline-block ${
                            rank === 1
                              ? 'text-amber-400'
                              : rank === 2
                              ? 'text-slate-300'
                              : rank === 3
                              ? 'text-amber-600'
                              : 'text-gray-500'
                          }`}
                        >
                          {rankBadge}
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-white flex items-center gap-2">
                          <span>{username}</span>
                          {isCurrentUser && (
                            <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-indigo-500 text-white">
                              You
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-gray-400">{sess.job}</td>

                      <td className="py-3.5 px-4 font-mono text-gray-400">Month #{sess.month_number}</td>

                      <td className="py-3.5 px-4 text-right font-mono font-extrabold text-emerald-400 text-sm">
                        ₹{Number(sess.net_worth).toLocaleString('en-IN')}
                      </td>

                      <td className="py-3.5 px-4 text-right font-mono font-extrabold text-indigo-400 text-sm">
                        {sess.financial_score}/100
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </main>
  )
}
