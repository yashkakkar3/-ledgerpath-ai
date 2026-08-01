import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/utils/supabase/server'
import Navbar from '@/components/Navbar'
import { LESSONS } from '@/lib/lessons'
import LessonQuizClient from './LessonQuizClient'

export default async function LessonDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const lesson = LESSONS.find((l) => l.slug === slug)
  if (!lesson) {
    notFound()
  }

  // Fetch completed questions for this user
  const { data: attempts } = await supabase
    .from('quiz_attempts')
    .select('question_slug')
    .eq('user_id', user.id)
    .eq('is_correct', true)

  const completedQuestionIds = attempts?.map((a) => a.question_slug) || []

  return (
    <main className="min-h-screen bg-[#080b11] bg-radial-gradient text-white">
      {/* Unified Top Navigation */}
      <Navbar userEmail={user.email} />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-8">
        {/* Breadcrumb Header */}
        <div className="flex items-center justify-between pb-2 border-b border-white/10">
          <Link
            href="/learn"
            className="text-xs font-semibold text-gray-400 hover:text-white transition-colors flex items-center gap-1.5"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span>Back to Learning Center</span>
          </Link>
        </div>

        {/* Lesson Header Banner */}
        <div className="glass-card rounded-3xl p-8 sm:p-10 border border-white/10 relative overflow-hidden">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-14 h-14 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 text-3xl flex items-center justify-center shadow-lg shadow-indigo-500/10">
              {lesson.emoji}
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400">Financial Guide</span>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">{lesson.title}</h1>
            </div>
          </div>
          <p className="text-xs text-gray-400 leading-relaxed max-w-2xl">{lesson.shortDescription}</p>
        </div>

        {/* Lesson Article Body */}
        <article className="glass-card rounded-3xl p-8 sm:p-10 border border-white/10 space-y-6 text-sm text-gray-300 leading-relaxed">
          {lesson.paragraphs.map((p, idx) => (
            <p key={idx}>{p}</p>
          ))}
        </article>

        {/* Interactive Quiz Section */}
        <LessonQuizClient
          questions={lesson.questions}
          userId={user.id}
          initialCompletedQuestionIds={completedQuestionIds}
        />
      </div>
    </main>
  )
}
