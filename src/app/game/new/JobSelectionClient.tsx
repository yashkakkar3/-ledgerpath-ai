'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/utils/supabase/client'

interface JobOption {
  id: string
  title: string
  emoji: string
  salary: number
  description: string
  badge: string
}

const JOBS: JobOption[] = [
  {
    id: 'student-intern',
    title: 'Student Intern',
    emoji: '🎓',
    salary: 15000,
    description: 'Part-time intern balancing learning and initial income generation.',
    badge: 'Entry Level',
  },
  {
    id: 'junior-developer',
    title: 'Junior Developer',
    emoji: '💻',
    salary: 45000,
    description: 'Software developer crafting code and building tech products.',
    badge: 'High Growth',
  },
  {
    id: 'teacher',
    title: 'Teacher',
    emoji: '📚',
    salary: 35000,
    description: 'Educator shaping minds with steady income and predictable hours.',
    badge: 'Stable',
  },
  {
    id: 'sales-associate',
    title: 'Sales Associate',
    emoji: '📈',
    salary: 30000,
    description: 'Client relationship specialist focused on performance & commissions.',
    badge: 'Dynamic',
  },
  {
    id: 'freelancer',
    title: 'Freelancer',
    emoji: '🎨',
    salary: 25000,
    description: 'Independent creator with flexible client projects and base revenue.',
    badge: 'Flexible',
  },
]

export default function JobSelectionClient({ userId }: { userId: string }) {
  const [selectedJobId, setSelectedJobId] = useState<string>(JOBS[1].id) // Default to Junior Developer
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const selectedJob = JOBS.find((j) => j.id === selectedJobId) || JOBS[0]

  const handleStartGame = async () => {
    setLoading(true)
    setError(null)

    const salary = selectedJob.salary
    const cash = salary * 2
    const savings = salary * 1
    const debt = 0
    const net_worth = cash + savings
    const happiness = 70
    const financial_score = 50
    const month_number = 1
    const status = 'active'

    const supabase = createClient()

    try {
      const { error: insertError } = await supabase.from('game_sessions').insert([
        {
          user_id: userId,
          job: selectedJob.title,
          salary,
          cash,
          savings,
          debt,
          net_worth,
          happiness,
          financial_score,
          month_number,
          status,
        },
      ])

      if (insertError) {
        throw insertError
      }

      router.push('/game')
      router.refresh()
    } catch (err: any) {
      setError(err.message || 'Failed to create game session')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-[#090d16] bg-radial-gradient py-12 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between mb-8">
          <Link
            href="/dashboard"
            className="text-xs font-semibold text-gray-400 hover:text-white transition-colors flex items-center gap-1.5"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span>Back to Dashboard</span>
          </Link>
          <span className="text-xs text-gray-500 font-mono">Step 1 of 1 • Life Setup</span>
        </div>

        {/* Main Title Card */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold mb-4">
            <span>🚀 Financial Simulation</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mb-3">
            Choose Your Starting Life
          </h1>
          <p className="text-gray-400 text-sm max-w-xl mx-auto leading-relaxed">
            Select your starting career path. Your initial salary will determine your starting cash buffer, savings reserves, and monthly income stream.
          </p>
        </div>

        {error && (
          <div className="mb-8 p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-medium flex items-center gap-2">
            <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{error}</span>
          </div>
        )}

        {/* Job Selection Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-10">
          {JOBS.map((job) => {
            const isSelected = job.id === selectedJobId

            return (
              <div
                key={job.id}
                onClick={() => setSelectedJobId(job.id)}
                className={`glass-card rounded-2xl p-6 cursor-pointer transition-all duration-200 relative overflow-hidden flex flex-col justify-between ${
                  isSelected
                    ? 'border-indigo-500 bg-indigo-500/10 shadow-lg shadow-indigo-500/20 scale-[1.02]'
                    : 'border-white/10 hover:border-white/20 hover:bg-white/[0.05]'
                }`}
              >
                {/* Selection indicator pill */}
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-2xl shadow-inner">
                    {job.emoji}
                  </div>
                  <span
                    className={`text-[10px] font-semibold uppercase tracking-wider px-2.5 py-1 rounded-full border ${
                      isSelected
                        ? 'bg-indigo-500 text-white border-indigo-400'
                        : 'bg-white/5 text-gray-400 border-white/10'
                    }`}
                  >
                    {job.badge}
                  </span>
                </div>

                <div>
                  <h3 className="text-lg font-bold text-white mb-1">{job.title}</h3>
                  <p className="text-xs text-gray-400 mb-4 line-clamp-2 leading-relaxed">
                    {job.description}
                  </p>
                </div>

                <div className="pt-4 border-t border-white/10 flex items-center justify-between mt-auto">
                  <span className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Salary</span>
                  <span className="text-sm font-extrabold text-emerald-400 font-mono">
                    ₹{job.salary.toLocaleString('en-IN')}/mo
                  </span>
                </div>

                {/* Selected Checkmark overlay */}
                {isSelected && (
                  <div className="absolute top-2 right-2 w-3 h-3 rounded-full bg-indigo-400 animate-ping opacity-75"></div>
                )}
              </div>
            )
          })}
        </div>

        {/* Selected Job Overview & Action Bar */}
        <div className="glass-card rounded-2xl p-6 sm:p-8 border border-white/10 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-2xl">
          <div>
            <div className="text-xs text-indigo-400 font-semibold uppercase tracking-wider mb-1">
              Selected Path: {selectedJob.title}
            </div>
            <div className="flex flex-wrap items-center gap-x-6 gap-y-1 text-xs text-gray-300">
              <div>Starting Cash: <span className="text-white font-bold font-mono">₹{(selectedJob.salary * 2).toLocaleString('en-IN')}</span></div>
              <div>Savings: <span className="text-white font-bold font-mono">₹{(selectedJob.salary * 1).toLocaleString('en-IN')}</span></div>
              <div>Net Worth: <span className="text-emerald-400 font-bold font-mono">₹{(selectedJob.salary * 3).toLocaleString('en-IN')}</span></div>
            </div>
          </div>

          <button
            onClick={handleStartGame}
            disabled={loading}
            className="w-full sm:w-auto btn-primary px-8 py-3.5 rounded-xl text-sm font-bold text-white cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shrink-0"
          >
            {loading ? (
              <>
                <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Creating Life Session...</span>
              </>
            ) : (
              <>
                <span>Start My Financial Life</span>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </>
            )}
          </button>
        </div>
      </div>
    </main>
  )
}
