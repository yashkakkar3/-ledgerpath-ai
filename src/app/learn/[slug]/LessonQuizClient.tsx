'use client'

import { useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { QuizQuestion } from '@/lib/lessons'

export default function LessonQuizClient({
  questions,
  userId,
  initialCompletedQuestionIds = [],
}: {
  questions: QuizQuestion[]
  userId: string
  initialCompletedQuestionIds?: string[]
}) {
  // State for user answers: questionId -> selectedIndex
  const [userAnswers, setUserAnswers] = useState<Record<string, number>>({})
  const [submittingIds, setSubmittingIds] = useState<Record<string, boolean>>({})

  const handleSelectOption = async (question: QuizQuestion, optionIdx: number) => {
    // Prevent re-selection if already answered
    if (userAnswers[question.id] !== undefined || submittingIds[question.id]) {
      return
    }

    const isCorrect = optionIdx === question.correctIndex

    setUserAnswers((prev) => ({ ...prev, [question.id]: optionIdx }))
    setSubmittingIds((prev) => ({ ...prev, [question.id]: true }))

    try {
      const supabase = createClient()
      await supabase.from('quiz_attempts').insert([
        {
          user_id: userId,
          question_slug: question.id,
          is_correct: isCorrect,
        },
      ])
    } catch (err) {
      console.warn('Quiz attempt logging notice:', err)
    } finally {
      setSubmittingIds((prev) => ({ ...prev, [question.id]: false }))
    }
  }

  const correctCount = Object.entries(userAnswers).filter(
    ([qId, selectedIdx]) => {
      const q = questions.find((item) => item.id === qId)
      return q && selectedIdx === q.correctIndex
    }
  ).length

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between pb-4 border-b border-white/10">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <span>🧠 Knowledge Check</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 font-mono">
              2 Questions
            </span>
          </h2>
          <p className="text-xs text-gray-400 mt-1">Test your understanding to earn module completion credit.</p>
        </div>

        {Object.keys(userAnswers).length === questions.length && (
          <div className="px-4 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold font-mono">
            Score: {correctCount} / {questions.length} Correct
          </div>
        )}
      </div>

      <div className="space-y-6">
        {questions.map((q, qIdx) => {
          const selectedIdx = userAnswers[q.id]
          const isAnswered = selectedIdx !== undefined
          const isCorrect = isAnswered && selectedIdx === q.correctIndex

          return (
            <div key={q.id} className="glass-card rounded-2xl p-6 border border-white/10 space-y-4">
              <div className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-lg bg-indigo-600/20 text-indigo-400 font-bold text-xs flex items-center justify-center shrink-0 border border-indigo-500/30 font-mono">
                  Q{qIdx + 1}
                </span>
                <h3 className="text-sm font-bold text-white leading-relaxed">{q.question}</h3>
              </div>

              {/* Options Grid */}
              <div className="grid grid-cols-1 gap-2.5 pt-2">
                {q.options.map((opt, optIdx) => {
                  let btnStyle = 'bg-white/[0.03] border-white/10 hover:border-white/20 text-gray-300'

                  if (isAnswered) {
                    if (optIdx === q.correctIndex) {
                      btnStyle = 'bg-emerald-500/20 border-emerald-500 text-emerald-300 font-bold shadow-md shadow-emerald-500/10'
                    } else if (optIdx === selectedIdx && !isCorrect) {
                      btnStyle = 'bg-rose-500/20 border-rose-500 text-rose-300 font-bold'
                    } else {
                      btnStyle = 'opacity-40 bg-white/[0.01] border-white/5 text-gray-500'
                    }
                  }

                  return (
                    <button
                      key={optIdx}
                      disabled={isAnswered}
                      onClick={() => handleSelectOption(q, optIdx)}
                      className={`w-full text-left p-3.5 rounded-xl border text-xs transition-all flex items-center justify-between cursor-pointer disabled:cursor-default ${btnStyle}`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="w-5 h-5 rounded-full bg-white/5 text-[10px] font-bold font-mono flex items-center justify-center border border-white/10 shrink-0">
                          {String.fromCharCode(65 + optIdx)}
                        </span>
                        <span>{opt}</span>
                      </div>

                      {isAnswered && optIdx === q.correctIndex && (
                        <span className="text-emerald-400 font-bold">✓ Correct</span>
                      )}
                      {isAnswered && optIdx === selectedIdx && !isCorrect && (
                        <span className="text-rose-400 font-bold">✕ Incorrect</span>
                      )}
                    </button>
                  )
                })}
              </div>

              {/* Instant Explanation Box */}
              {isAnswered && (
                <div
                  className={`p-4 rounded-xl text-xs leading-relaxed border ${
                    isCorrect
                      ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300'
                      : 'bg-amber-500/10 border-amber-500/20 text-amber-300'
                  }`}
                >
                  <div className="font-bold mb-1">
                    {isCorrect ? '🎉 Excellent!' : '💡 Key Takeaway:'}
                  </div>
                  <span>{q.explanation}</span>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
