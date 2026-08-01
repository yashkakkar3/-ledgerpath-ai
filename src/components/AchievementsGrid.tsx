import { ACHIEVEMENTS } from '@/utils/achievements'

export interface UserAchievementRecord {
  achievement_code: string
  earned_at?: string
}

export default function AchievementsGrid({
  earnedAchievements = [],
}: {
  earnedAchievements: UserAchievementRecord[]
}) {
  const earnedSet = new Map<string, string | undefined>(
    earnedAchievements.map((item) => [item.achievement_code, item.earned_at])
  )

  const earnedCount = earnedSet.size

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
            <span>🏆 Achievements Unlocked</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 font-mono">
              {earnedCount} / {ACHIEVEMENTS.length}
            </span>
          </h3>
          <p className="text-xs text-gray-400">Earn badges by hitting key financial milestones in your life simulation.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {ACHIEVEMENTS.map((ach) => {
          const isEarned = earnedSet.has(ach.code)
          const earnedAtDate = earnedSet.get(ach.code)

          return (
            <div
              key={ach.code}
              className={`p-4 rounded-2xl border transition-all duration-200 flex flex-col justify-between ${
                isEarned
                  ? 'glass-card bg-indigo-500/10 border-indigo-500/40 shadow-lg shadow-indigo-500/10'
                  : 'bg-white/[0.01] border-white/5 opacity-50 grayscale hover:opacity-75 hover:grayscale-0'
              }`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-xl shadow-inner">
                  {ach.emoji}
                </div>
                <span
                  className={`text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                    isEarned
                      ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                      : 'bg-white/5 text-gray-500 border-white/10'
                  }`}
                >
                  {isEarned ? 'Unlocked' : 'Locked 🔒'}
                </span>
              </div>

              <div>
                <h4 className="text-xs font-bold text-white mb-1">{ach.name}</h4>
                <p className="text-[11px] text-gray-400 leading-relaxed">{ach.description}</p>
              </div>

              {isEarned && earnedAtDate && (
                <div className="mt-3 pt-2 border-t border-white/10 text-[9px] font-mono text-gray-500">
                  Earned {new Date(earnedAtDate).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
