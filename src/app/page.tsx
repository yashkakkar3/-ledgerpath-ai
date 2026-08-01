import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/utils/supabase/server'

export default async function LandingPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  // If user is already authenticated, redirect straight to dashboard
  if (user) {
    redirect('/dashboard')
  }

  return (
    <main className="min-h-screen bg-[#080b11] text-white selection:bg-indigo-500 selection:text-white relative overflow-hidden">
      {/* Background Mesh Gradients */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-gradient-to-tr from-indigo-600/20 via-purple-600/10 to-transparent rounded-full blur-3xl pointer-events-none -mt-40"></div>
      <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-indigo-900/10 rounded-full blur-3xl pointer-events-none -mb-32"></div>

      {/* Top Header / Brand */}
      <header className="max-w-6xl mx-auto px-6 h-20 flex items-center justify-between relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-500 text-white font-extrabold flex items-center justify-center text-lg shadow-lg shadow-indigo-500/25">
            ⚡
          </div>
          <span className="text-lg font-bold tracking-tight text-white">
            LedgerPath <span className="text-indigo-400 font-mono text-xs uppercase px-2 py-0.5 rounded bg-indigo-500/10 border border-indigo-500/20">AI</span>
          </span>
        </div>

        <div className="flex items-center gap-4">
          <Link
            href="/login"
            className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-300 hover:text-white hover:bg-white/5 border border-transparent transition-all"
          >
            Sign In
          </Link>
          <Link
            href="/signup"
            className="btn-primary px-5 py-2 rounded-xl text-xs font-extrabold text-white shadow-lg shadow-indigo-500/25 transition-all"
          >
            Get Started
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-5xl mx-auto px-6 pt-16 pb-24 text-center relative z-10 space-y-8">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-semibold tracking-wide">
          <span>🎮 Personal Financial Life Simulation</span>
        </div>

        <h1 className="text-5xl sm:text-7xl font-extrabold text-white tracking-tight leading-[1.1]">
          Learn money by <br className="hidden sm:inline" />
          <span className="bg-gradient-to-r from-indigo-400 via-purple-300 to-pink-400 bg-clip-text text-transparent">
            living it in real time.
          </span>
        </h1>

        <p className="text-lg sm:text-xl text-gray-400 max-w-2xl mx-auto font-normal leading-relaxed">
          Experience career choices, market investments, and random life events in a risk-free financial simulation guided by your personal AI coach.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <Link
            href="/signup"
            className="w-full sm:w-auto btn-primary px-8 py-4 rounded-2xl text-base font-extrabold text-white flex items-center justify-center gap-2 shadow-2xl shadow-indigo-500/30 transition-all hover:scale-[1.02]"
          >
            <span>Start Your Financial Life</span>
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </Link>

          <Link
            href="/login"
            className="w-full sm:w-auto px-8 py-4 rounded-2xl text-base font-semibold text-gray-300 bg-white/[0.03] hover:bg-white/10 border border-white/10 transition-all"
          >
            I Already Have an Account
          </Link>
        </div>
      </section>

      {/* Core Features Grid */}
      <section className="max-w-6xl mx-auto px-6 py-16 relative z-10 border-t border-white/10">
        <div className="text-center max-w-xl mx-auto mb-12">
          <h2 className="text-xs font-bold uppercase tracking-widest text-indigo-400 mb-2">Core Features</h2>
          <h3 className="text-3xl font-extrabold text-white tracking-tight">Master Wealth-Building Dynamics</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Feature 1 */}
          <div className="glass-card rounded-3xl p-6 border border-white/10 space-y-4 hover:border-indigo-500/40 transition-all">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-2xl flex items-center justify-center">
              🎮
            </div>
            <h4 className="text-lg font-bold text-white">Monthly Engine</h4>
            <p className="text-xs text-gray-400 leading-relaxed">
              Balance living expenses, savings, stock investments, crypto, and health insurance in a realistic monthly lifecycle.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="glass-card rounded-3xl p-6 border border-white/10 space-y-4 hover:border-indigo-500/40 transition-all">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-2xl flex items-center justify-center">
              🤖
            </div>
            <h4 className="text-lg font-bold text-white">AI Financial Coach</h4>
            <p className="text-xs text-gray-400 leading-relaxed">
              Powered by Anthropic Claude. Receives your monthly metrics, provides tailored feedback, and teaches key financial concepts.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="glass-card rounded-3xl p-6 border border-white/10 space-y-4 hover:border-indigo-500/40 transition-all">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-2xl flex items-center justify-center">
              🏆
            </div>
            <h4 className="text-lg font-bold text-white">Achievements & Ranks</h4>
            <p className="text-xs text-gray-400 leading-relaxed">
              Earn milestone badges like Debt Free & Half-Millionaire while competing on the global financial leaderboard.
            </p>
          </div>

          {/* Feature 4 */}
          <div className="glass-card rounded-3xl p-6 border border-white/10 space-y-4 hover:border-indigo-500/40 transition-all">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-2xl flex items-center justify-center">
              📚
            </div>
            <h4 className="text-lg font-bold text-white">Learning Center</h4>
            <p className="text-xs text-gray-400 leading-relaxed">
              Bite-sized modules on Compound Interest, Emergency Funds, Inflation, and Debt with instant interactive quizzes.
            </p>
          </div>
        </div>
      </section>

      {/* 3-Step "How It Works" Section */}
      <section className="max-w-5xl mx-auto px-6 py-16 relative z-10 border-t border-white/10">
        <div className="text-center max-w-xl mx-auto mb-16">
          <h2 className="text-xs font-bold uppercase tracking-widest text-indigo-400 mb-2">Simple Workflow</h2>
          <h3 className="text-3xl font-extrabold text-white tracking-tight">How LedgerPath AI Works</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="glass-card rounded-3xl p-8 border border-white/10 relative">
            <div className="text-3xl font-black font-mono text-indigo-500/30 absolute top-4 right-6">01</div>
            <div className="text-2xl mb-4">💼</div>
            <h4 className="text-base font-bold text-white mb-2">Choose Your Life</h4>
            <p className="text-xs text-gray-400 leading-relaxed">
              Pick your starting career—from Student Intern to Junior Developer—and initialize your baseline financial stats.
            </p>
          </div>

          <div className="glass-card rounded-3xl p-8 border border-white/10 relative">
            <div className="text-3xl font-black font-mono text-indigo-500/30 absolute top-4 right-6">02</div>
            <div className="text-2xl mb-4">⚙️</div>
            <h4 className="text-base font-bold text-white mb-2">Make Monthly Decisions</h4>
            <p className="text-xs text-gray-400 leading-relaxed">
              Use visual sliders to allocate disposable income, hedge against random life events, and manage debt.
            </p>
          </div>

          <div className="glass-card rounded-3xl p-8 border border-white/10 relative">
            <div className="text-3xl font-black font-mono text-indigo-500/30 absolute top-4 right-6">03</div>
            <div className="text-2xl mb-4">🎯</div>
            <h4 className="text-base font-bold text-white mb-2">Learn & Level Up</h4>
            <p className="text-xs text-gray-400 leading-relaxed">
              Receive AI coaching notes, complete knowledge quizzes, unlock achievement badges, and top the leaderboard.
            </p>
          </div>
        </div>
      </section>

      {/* Footer CTA */}
      <footer className="border-t border-white/10 py-12 text-center text-xs text-gray-500 relative z-10">
        <div className="max-w-6xl mx-auto px-6 space-y-4">
          <div className="text-white font-bold text-sm">LedgerPath AI</div>
          <p>© 2026 LedgerPath AI Financial Life Simulator. Built for modern financial literacy.</p>
        </div>
      </footer>
    </main>
  )
}
