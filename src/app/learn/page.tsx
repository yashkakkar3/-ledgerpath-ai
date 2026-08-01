import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/utils/supabase/server'
import Navbar from '@/components/Navbar'
import { LESSONS } from '@/lib/lessons'

export default async function LearnHubPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Fetch correct quiz attempts for logged-in user
  const { data: attempts } = await supabase
    .from('quiz_attempts')
    .select('question_slug, is_correct')
    .eq('user_id', user.id)
    .eq('is_correct', true)

  const correctQuestionSet = new Set(attempts?.map((a) => a.question_slug) || [])

  return (
    <main className="min-h-screen bg-[#080b11] bg-radial-gradient text-white">
      {/* Unified Top Navigation */}
      <Navbar userEmail={user.email} />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-8">
        {/* Page Hero Header */}
        <div className="flex items-center justify-between pb-2 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600/20 border border-indigo-500/30 text-indigo-400 font-bold flex items-center justify-center text-lg shadow-lg shadow-indigo-500/10">
              📚
            </div>
            <div>
              <h1 className="text-xl font-extrabold text-white tracking-tight">Financial Learning Center</h1>
              <p className="text-xs text-gray-400">Master core personal finance concepts with interactive bite-sized lessons & quizzes</p>
            </div>
          </div>
        </div>

        {/* Hero Banner */}
        <div className="glass-card rounded-3xl p-8 border border-white/10 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>

          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-semibold mb-3">
            <span>Essential Knowledge Base</span>
          </div>

          <h2 className="text-3xl font-extrabold text-white tracking-tight mb-2">
            Build Your Financial Intelligence
          </h2>
          <p className="text-gray-400 text-xs max-w-xl leading-relaxed">
            Read brief, practical guides on wealth-building fundamentals and test your mastery with instant interactive quizzes.
          </p>
        </div>

        {/* Lessons Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {LESSONS.map((lesson) => {
            const isCompleted = lesson.questions.every((q) => correctQuestionSet.has(q.id))

            return (
              <Link
                key={lesson.slug}
                href={`/learn/${lesson.slug}`}
                className="glass-card rounded-2xl p-6 border border-white/10 hover:border-indigo-500/50 hover:bg-white/[0.05] transition-all duration-200 group flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                      {lesson.emoji}
                    </div>
                    {isCompleted ? (
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                        <span>Completed</span>
                        <span>✓</span>
                      </span>
                    ) : (
                      <span className="text-[10px] font-semibold uppercase tracking-wider px-2.5 py-1 rounded-full bg-white/5 text-gray-400 border border-white/10">
                        Lesson & Quiz
                      </span>
                    )}
                  </div>

                  <h3 className="text-lg font-bold text-white mb-2 group-hover:text-indigo-400 transition-colors">
                    {lesson.title}
                  </h3>
                  <p className="text-xs text-gray-400 leading-relaxed line-clamp-3 mb-6">
                    {lesson.shortDescription}
                  </p>
                </div>

                <div className="pt-4 border-t border-white/10 flex items-center justify-between text-xs font-semibold text-indigo-400 group-hover:text-indigo-300">
                  <span>Start Module</span>
                  <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </div>
              </Link>
            )
          })}
        </div>
      </div>
    </main>
  )
}
