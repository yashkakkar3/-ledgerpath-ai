'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/utils/supabase/client'
import Navbar from '@/components/Navbar'
import { rollRandomLifeEvent } from '@/utils/lifeEvents'
import { ACHIEVEMENTS } from '@/utils/achievements'
import AchievementsGrid, { UserAchievementRecord } from '@/components/AchievementsGrid'
import FinancialCharts from '@/components/FinancialCharts'
import FinancialTwinDrawer from '@/components/FinancialTwinDrawer'

export interface GameSession {
  id: string
  user_id: string
  job: string
  salary: number
  cash: number
  savings: number
  debt: number
  net_worth: number
  happiness: number
  financial_score: number
  month_number: number
  status: string
  created_at?: string
  updated_at?: string
}

export interface Investment {
  id: string
  session_id: string
  type: string
  amount: number
  purchase_month: number
  current_value: number
}

const INVESTMENT_TYPES = [
  { id: 'Stocks', name: 'Stocks', risk: 'High Risk / High Return', returnRate: 0.015, emoji: '📈', minCash: 0 },
  { id: 'Mutual Funds', name: 'Mutual Funds', risk: 'Medium Risk / Moderate Return', returnRate: 0.008, emoji: '📊', minCash: 0 },
  { id: 'Gold', name: 'Gold', risk: 'Low Risk / Inflation Hedge', returnRate: 0.004, emoji: '🪙', minCash: 0 },
  { id: 'Crypto', name: 'Crypto', risk: 'Very High Risk / Volatile', returnRate: 0.025, emoji: '⚡', minCash: 0 },
  { id: 'Real Estate', name: 'Real Estate', risk: 'Low Liquidity / Steady Growth', returnRate: 0.005, emoji: '🏢', minCash: 200000 },
]

export default function MonthlyDecisionClient({
  session: initialSession,
  investments: initialInvestments,
  earnedAchievements: initialEarnedAchievements = [],
  initialAiFeedback,
  initialLifeEvent,
  initialHistory = [],
  userEmail,
}: {
  session: GameSession
  investments: Investment[]
  earnedAchievements?: UserAchievementRecord[]
  initialAiFeedback?: string | null
  initialLifeEvent?: { title: string; emoji: string; description: string } | null
  initialHistory?: any[]
  userEmail?: string
}) {
  const [session, setSession] = useState<GameSession>(initialSession)
  const [investments, setInvestments] = useState<Investment[]>(initialInvestments)
  const [earnedAchievements, setEarnedAchievements] = useState<UserAchievementRecord[]>(initialEarnedAchievements)
  const [history, setHistory] = useState<any[]>(initialHistory)
  const [loading, setLoading] = useState(false)
  const [aiLoading, setAiLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [achievementToast, setAchievementToast] = useState<string | null>(null)

  // Latest Event & AI Feedback
  const [latestLifeEvent, setLatestLifeEvent] = useState<{ title: string; emoji: string; description: string } | null>(initialLifeEvent || null)
  const [aiFeedback, setAiFeedback] = useState<string | null>(initialAiFeedback || null)

  const router = useRouter()
  const salary = Number(session.salary)
  const livingExpenses = Math.round(salary * 0.5)
  const disposableIncome = salary - livingExpenses

  // Decision States
  const [savePct, setSavePct] = useState<number>(40)
  const [investPct, setInvestPct] = useState<number>(40)
  const [spendPct, setSpendPct] = useState<number>(20)
  const [selectedInvestmentType, setSelectedInvestmentType] = useState<string>('Stocks')

  // Optional Action Toggles
  const [takeLoan, setTakeLoan] = useState<boolean>(false)
  const [loanAmount, setLoanAmount] = useState<number>(25000)
  const [buyInsurance, setBuyInsurance] = useState<boolean>(false)
  const [buyEmergencyFund, setBuyEmergencyFund] = useState<boolean>(false)

  // Calculated Allocations in ₹
  const saveAmount = Math.round((disposableIncome * savePct) / 100)
  const investAmount = Math.round((disposableIncome * investPct) / 100)
  const spendAmount = Math.round((disposableIncome * spendPct) / 100)

  // Slider controls
  const handleSaveChange = (val: number) => {
    setSavePct(val)
    const remaining = 100 - val
    setInvestPct(Math.round(remaining * 0.65))
    setSpendPct(100 - val - Math.round(remaining * 0.65))
  }

  const handleInvestChange = (val: number) => {
    setInvestPct(val)
    const remaining = 100 - val
    setSavePct(Math.round(remaining * 0.65))
    setSpendPct(100 - val - Math.round(remaining * 0.65))
  }

  const handleSpendChange = (val: number) => {
    setSpendPct(val)
    const remaining = 100 - val
    setSavePct(Math.round(remaining * 0.5))
    setInvestPct(100 - val - Math.round(remaining * 0.5))
  }

  const totalInvestmentValue = investments.reduce((acc, inv) => acc + Number(inv.current_value), 0)
  const emergencyFundRequired = Math.round(livingExpenses * 3)
  const insuranceMonthlyCost = Math.round(salary * 0.05)

  // ADVANCE MONTH HANDLER WITH ACHIEVEMENTS, LIFE EVENTS & AI COACH
  const handleAdvanceMonth = async () => {
    setLoading(true)
    setAiLoading(true)
    setMessage(null)
    setLatestLifeEvent(null)

    const supabase = createClient()

    try {
      const beforeStats = {
        cash: session.cash,
        savings: session.savings,
        debt: session.debt,
        net_worth: session.net_worth,
        happiness: session.happiness,
        financial_score: session.financial_score,
      }

      const loanAddedCash = takeLoan ? loanAmount : 0
      const insuranceCost = buyInsurance ? insuranceMonthlyCost : 0
      const emergencyFundLocked = buyEmergencyFund ? emergencyFundRequired : 0

      if (buyEmergencyFund && session.cash < emergencyFundRequired) {
        throw new Error(`Insufficient cash to lock 3 months Emergency Fund (₹${emergencyFundRequired.toLocaleString('en-IN')}).`)
      }

      // 1. Initial Cash Flow from Decisions
      let currentSalary = salary
      let currentLivingExpenses = livingExpenses
      let newCash = Number(session.cash) + currentSalary - currentLivingExpenses - insuranceCost + loanAddedCash - saveAmount - investAmount - emergencyFundLocked
      newCash = Math.max(0, Math.round(newCash))

      let newSavings = Number(session.savings) + saveAmount + emergencyFundLocked
      newSavings = Math.round(newSavings)

      let newDebt = (Number(session.debt) + loanAddedCash) * 1.02
      newDebt = Math.round(newDebt)

      // 2. Base Investment Growth
      const updatedInvestmentsList: Investment[] = []
      let updatedTotalInvestments = 0

      for (const inv of investments) {
        const typeConfig = INVESTMENT_TYPES.find((t) => t.id === inv.type)
        const returnFactor = typeConfig ? typeConfig.returnRate : 0.005
        const updatedVal = Math.round(Number(inv.current_value) * (1 + returnFactor))
        updatedInvestmentsList.push({ ...inv, current_value: updatedVal })
        updatedTotalInvestments += updatedVal
      }

      if (investAmount > 0) {
        const { data: newInvRow } = await supabase
          .from('investments')
          .insert([
            {
              session_id: session.id,
              type: selectedInvestmentType,
              amount: investAmount,
              purchase_month: session.month_number,
              current_value: investAmount,
            },
          ])
          .select('*')
          .single()

        if (newInvRow) {
          updatedInvestmentsList.push(newInvRow)
          updatedTotalInvestments += investAmount
        }
      }

      let newHappiness = Number(session.happiness)
      if (spendAmount > 0) {
        newHappiness = Math.min(100, newHappiness + 5)
      }

      // 3. ROLL RANDOM LIFE EVENT
      const { event: rolledEvent, impact: eventImpact } = rollRandomLifeEvent({
        job: session.job,
        salary: currentSalary,
        cash: newCash,
        hasInsurance: buyInsurance,
      })

      let lifeEventRecord: { title: string; emoji: string; description: string } | null = null

      if (rolledEvent && eventImpact) {
        lifeEventRecord = {
          title: rolledEvent.title,
          emoji: rolledEvent.emoji,
          description: eventImpact.description,
        }

        if (eventImpact.salaryMultiplier) {
          currentSalary = Math.round(currentSalary * eventImpact.salaryMultiplier)
        }
        if (eventImpact.salarySetZeroThisMonth) {
          newCash = Math.max(0, newCash - salary)
        }
        if (eventImpact.cashDelta) {
          newCash = Math.max(0, newCash + eventImpact.cashDelta)
        }
        if (eventImpact.happinessDelta) {
          newHappiness = Math.min(100, Math.max(0, newHappiness + eventImpact.happinessDelta))
        }
        if (eventImpact.investmentCrashPct) {
          updatedTotalInvestments = 0
          for (let i = 0; i < updatedInvestmentsList.length; i++) {
            const inv = updatedInvestmentsList[i]
            if (inv.type === 'Stocks' || inv.type === 'Crypto') {
              inv.current_value = Math.round(inv.current_value * (1 - eventImpact.investmentCrashPct))
            }
            updatedTotalInvestments += inv.current_value
          }
        }

        await supabase.from('life_events_log').insert([
          {
            session_id: session.id,
            month_number: session.month_number,
            event_type: rolledEvent.type,
            event_detail: { title: rolledEvent.title, emoji: rolledEvent.emoji },
            impact: {
              cash_delta: eventImpact.cashDelta || 0,
              happiness_delta: eventImpact.happinessDelta || 0,
              salary_multiplier: eventImpact.salaryMultiplier || 1,
            },
          },
        ])
      }

      setLatestLifeEvent(lifeEventRecord)

      // 4. Update Investments in DB
      for (const inv of updatedInvestmentsList) {
        if (inv.id) {
          await supabase.from('investments').update({ current_value: inv.current_value }).eq('id', inv.id)
        }
      }

      // 5. Final Net Worth & Score
      const newNetWorth = newCash + newSavings + updatedTotalInvestments - newDebt
      const savingsScore = Math.min(40, Math.round((newSavings / (currentSalary * 6)) * 40))
      const debtPenalty = Math.min(30, Math.round((newDebt / currentSalary) * 10))
      const debtScore = Math.max(0, 30 - debtPenalty)
      const netWorthScore = Math.min(30, Math.round((newNetWorth / currentSalary) * 5))
      const newFinancialScore = Math.min(100, Math.max(10, savingsScore + debtScore + netWorthScore))

      const nextMonthNumber = session.month_number + 1

      const updatedSessionFields: GameSession = {
        ...session,
        salary: currentSalary,
        cash: newCash,
        savings: newSavings,
        debt: newDebt,
        net_worth: newNetWorth,
        happiness: newHappiness,
        financial_score: newFinancialScore,
        month_number: nextMonthNumber,
        updated_at: new Date().toISOString(),
      }

      const afterStats = {
        cash: newCash,
        savings: newSavings,
        debt: newDebt,
        net_worth: newNetWorth,
        happiness: newHappiness,
        financial_score: newFinancialScore,
      }

      const decisionDetail = {
        save_amount: saveAmount,
        invest_amount: investAmount,
        spend_amount: spendAmount,
        investment_type: investAmount > 0 ? selectedInvestmentType : null,
        loan_taken: takeLoan ? loanAmount : 0,
        insurance_active: buyInsurance,
        emergency_fund_created: buyEmergencyFund,
      }

      const newLogItem = {
        session_id: session.id,
        month_number: session.month_number,
        decision_type: 'monthly_allocation',
        decision_detail: decisionDetail,
        outcome: afterStats,
        ai_feedback: null,
      }

      await supabase.from('decisions_log').insert([newLogItem])

      await supabase
        .from('game_sessions')
        .update(updatedSessionFields)
        .eq('id', session.id)

      // 6. CHECK & UNLOCK NEW ACHIEVEMENTS
      const earnedCodesSet = new Set(earnedAchievements.map((item) => item.achievement_code))
      const newUnlockedList: UserAchievementRecord[] = [...earnedAchievements]
      let newlyUnlockedName: string | null = null

      for (const achDef of ACHIEVEMENTS) {
        if (!earnedCodesSet.has(achDef.code)) {
          const isEligible = achDef.check({
            session: updatedSessionFields,
            investments: updatedInvestmentsList,
            hasInsurance: buyInsurance,
            hasEmergencyFund: buyEmergencyFund,
          })

          if (isEligible) {
            const earnedAt = new Date().toISOString()
            await supabase.from('user_achievements').insert([
              {
                user_id: session.user_id,
                achievement_code: achDef.code,
                session_id: session.id,
                earned_at: earnedAt,
              },
            ])

            newUnlockedList.push({ achievement_code: achDef.code, earned_at: earnedAt })
            newlyUnlockedName = `${achDef.emoji} ${achDef.name}`
          }
        }
      }

      if (newlyUnlockedName) {
        setAchievementToast(`🏆 Achievement Unlocked: ${newlyUnlockedName}!`)
        setTimeout(() => setAchievementToast(null), 5000)
      }

      setEarnedAchievements(newUnlockedList)
      setSession(updatedSessionFields)
      setInvestments(updatedInvestmentsList)
      setHistory((prev) => [...prev, newLogItem])
      setTakeLoan(false)
      setBuyEmergencyFund(false)

      setMessage({ type: 'success', text: `Month ${session.month_number} processed! Advanced to Month ${nextMonthNumber}.` })
      setLoading(false)

      // 7. CALL AI COACH
      try {
        const res = await fetch('/api/ai-coach', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sessionId: session.id,
            monthNumber: session.month_number,
            job: session.job,
            decisionDetail,
            lifeEvent: lifeEventRecord,
            beforeStats,
            afterStats,
          }),
        })

        const aiData = await res.json()
        if (aiData.feedback) {
          setAiFeedback(aiData.feedback)
        }
      } catch (aiErr) {
        console.warn('AI Coach response notice:', aiErr)
      } finally {
        setAiLoading(false)
      }
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Error processing month' })
      setLoading(false)
      setAiLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-[#080b11] bg-radial-gradient text-white">
      {/* Unified Top Navigation */}
      <Navbar userEmail={userEmail} />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-8">
        {/* ACHIEVEMENT CELEBRATION TOAST POPUP */}
        {achievementToast && (
          <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/20 via-yellow-500/20 to-amber-500/20 border border-amber-500/40 text-amber-300 font-bold text-sm shadow-2xl shadow-amber-500/20 flex items-center justify-between animate-bounce">
            <div className="flex items-center gap-3">
              <span className="text-2xl">✨</span>
              <span>{achievementToast}</span>
            </div>
            <button onClick={() => setAchievementToast(null)} className="text-amber-400 hover:text-white">✕</button>
          </div>
        )}

        {/* Feedback Banner */}
        {message && (
          <div
            className={`p-4 rounded-xl text-xs font-semibold flex items-center justify-between border ${
              message.type === 'success'
                ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                : 'bg-rose-500/10 border-rose-500/20 text-rose-400'
            }`}
          >
            <span>{message.text}</span>
            <button onClick={() => setMessage(null)} className="text-gray-400 hover:text-white">✕</button>
          </div>
        )}

        {/* LATEST LIFE EVENT BANNER */}
        {latestLifeEvent && (
          <div className="p-5 rounded-2xl bg-gradient-to-r from-purple-900/30 via-indigo-900/30 to-slate-900/30 border border-indigo-500/30 shadow-xl flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/20 border border-indigo-500/30 text-2xl flex items-center justify-center shrink-0">
              {latestLifeEvent.emoji}
            </div>
            <div>
              <div className="text-xs font-bold text-indigo-400 uppercase tracking-wider mb-0.5">
                Life Event Occurred: {latestLifeEvent.title}
              </div>
              <p className="text-xs text-gray-200 leading-relaxed font-medium">
                {latestLifeEvent.description}
              </p>
            </div>
          </div>
        )}

        {/* AI COACH'S NOTE CARD */}
        {(aiLoading || aiFeedback) && (
          <div className="glass-card rounded-3xl p-6 sm:p-7 border border-indigo-500/40 relative overflow-hidden shadow-2xl shadow-indigo-500/10 bg-gradient-to-r from-indigo-950/20 via-purple-950/20 to-slate-950/20">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-500 text-white font-bold flex items-center justify-center text-xl shrink-0 shadow-lg shadow-indigo-500/25">
                🤖
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-white tracking-tight">Coach&apos;s Note</h3>
                    <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                      Coach Feedback
                    </span>
                  </div>
                  {aiLoading && (
                    <div className="flex items-center gap-1.5 text-xs text-indigo-400 font-medium">
                      <svg className="animate-spin h-3.5 w-3.5 text-indigo-400" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span>Analyzing month...</span>
                    </div>
                  )}
                </div>

                {aiLoading ? (
                  <div className="space-y-2 py-2">
                    <div className="h-3.5 bg-white/10 rounded-lg animate-pulse w-3/4"></div>
                    <div className="h-3.5 bg-white/10 rounded-lg animate-pulse w-1/2"></div>
                  </div>
                ) : (
                  <p className="text-xs text-gray-200 leading-relaxed font-normal">
                    {aiFeedback}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* 1. TOP STATS CARDS GRID */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
          <div className="glass-card p-4 rounded-2xl border border-white/10 flex flex-col justify-between">
            <div className="text-[10px] uppercase font-semibold text-gray-400 tracking-wider">Month</div>
            <div className="text-2xl font-black text-indigo-400 font-mono">#{session.month_number}</div>
          </div>

          <div className="glass-card p-4 rounded-2xl border border-white/10 flex flex-col justify-between">
            <div className="text-[10px] uppercase font-semibold text-gray-400 tracking-wider">Cash</div>
            <div className="text-lg font-bold text-white font-mono">₹{Number(session.cash).toLocaleString('en-IN')}</div>
          </div>

          <div className="glass-card p-4 rounded-2xl border border-white/10 flex flex-col justify-between">
            <div className="text-[10px] uppercase font-semibold text-gray-400 tracking-wider">Savings</div>
            <div className="text-lg font-bold text-indigo-300 font-mono">₹{Number(session.savings).toLocaleString('en-IN')}</div>
          </div>

          <div className="glass-card p-4 rounded-2xl border border-white/10 flex flex-col justify-between">
            <div className="text-[10px] uppercase font-semibold text-gray-400 tracking-wider">Debt</div>
            <div className="text-lg font-bold text-rose-400 font-mono">₹{Number(session.debt).toLocaleString('en-IN')}</div>
          </div>

          <div className="glass-card p-4 rounded-2xl border border-white/10 flex flex-col justify-between">
            <div className="text-[10px] uppercase font-semibold text-gray-400 tracking-wider">Net Worth</div>
            <div className="text-lg font-bold text-emerald-400 font-mono">₹{Number(session.net_worth).toLocaleString('en-IN')}</div>
          </div>

          <div className="glass-card p-4 rounded-2xl border border-white/10 flex flex-col justify-between">
            <div className="flex items-center justify-between text-[10px] uppercase font-semibold text-gray-400">
              <span>Happiness</span>
              <span>{session.happiness}%</span>
            </div>
            <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden border border-white/10 mt-2">
              <div className="bg-amber-400 h-full transition-all duration-300" style={{ width: `${session.happiness}%` }}></div>
            </div>
          </div>

          <div className="glass-card p-4 rounded-2xl border border-white/10 flex flex-col justify-between">
            <div className="flex items-center justify-between text-[10px] uppercase font-semibold text-gray-400">
              <span>Score</span>
              <span>{session.financial_score}/100</span>
            </div>
            <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden border border-white/10 mt-2">
              <div className="bg-emerald-400 h-full transition-all duration-300" style={{ width: `${session.financial_score}%` }}></div>
            </div>
          </div>
        </div>

        {/* 2. MAIN DECISIONS PANEL */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="glass-card rounded-3xl p-6 sm:p-8 border border-white/10">
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/10">
                <div>
                  <h2 className="text-xl font-bold text-white tracking-tight">This Month&apos;s Decisions</h2>
                  <p className="text-xs text-gray-400 mt-0.5">Allocate your monthly disposable income after living expenses.</p>
                </div>
                <div className="text-right">
                  <div className="text-[10px] font-semibold text-gray-500 uppercase">Disposable Income</div>
                  <div className="text-lg font-extrabold text-emerald-400 font-mono">₹{disposableIncome.toLocaleString('en-IN')}</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-8 p-4 rounded-2xl bg-white/[0.02] border border-white/10 text-xs">
                <div>
                  <span className="text-gray-500">Monthly Salary:</span>{' '}
                  <span className="font-bold text-white font-mono">₹{salary.toLocaleString('en-IN')}</span>
                </div>
                <div>
                  <span className="text-gray-500">Living Expenses (50%):</span>{' '}
                  <span className="font-bold text-amber-400 font-mono">₹{livingExpenses.toLocaleString('en-IN')}</span>
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <div className="flex justify-between items-center mb-2 text-xs">
                    <span className="font-semibold text-indigo-300 flex items-center gap-1.5">
                      <span>🏦</span> Save ({savePct}%)
                    </span>
                    <span className="font-bold font-mono text-white">₹{saveAmount.toLocaleString('en-IN')}</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={savePct}
                    onChange={(e) => handleSaveChange(Number(e.target.value))}
                    className="w-full accent-indigo-500 cursor-pointer h-2 bg-white/10 rounded-lg"
                  />
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2 text-xs">
                    <span className="font-semibold text-emerald-400 flex items-center gap-1.5">
                      <span>📈</span> Invest ({investPct}%)
                    </span>
                    <span className="font-bold font-mono text-white">₹{investAmount.toLocaleString('en-IN')}</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={investPct}
                    onChange={(e) => handleInvestChange(Number(e.target.value))}
                    className="w-full accent-emerald-500 cursor-pointer h-2 bg-white/10 rounded-lg"
                  />
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2 text-xs">
                    <span className="font-semibold text-amber-400 flex items-center gap-1.5">
                      <span>🛍️</span> Spend ({spendPct}%)
                    </span>
                    <span className="font-bold font-mono text-white">₹{spendAmount.toLocaleString('en-IN')}</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={spendPct}
                    onChange={(e) => handleSpendChange(Number(e.target.value))}
                    className="w-full accent-amber-500 cursor-pointer h-2 bg-white/10 rounded-lg"
                  />
                </div>
              </div>

              {investAmount > 0 && (
                <div className="mt-8 pt-6 border-t border-white/10">
                  <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-3">
                    Choose Investment Vehicle
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {INVESTMENT_TYPES.map((type) => {
                      const isSelected = selectedInvestmentType === type.id
                      const isDisabled = type.minCash > 0 && session.cash < type.minCash

                      return (
                        <button
                          key={type.id}
                          type="button"
                          disabled={isDisabled}
                          onClick={() => setSelectedInvestmentType(type.id)}
                          className={`p-3.5 rounded-xl border text-left transition-all text-xs cursor-pointer flex items-center justify-between ${
                            isDisabled
                              ? 'opacity-40 cursor-not-allowed bg-white/[0.01] border-white/5'
                              : isSelected
                              ? 'bg-indigo-500/15 border-indigo-500 text-white shadow-md shadow-indigo-500/10'
                              : 'bg-white/[0.03] border-white/10 hover:border-white/20 text-gray-300'
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            <span className="text-base">{type.emoji}</span>
                            <div>
                              <div className="font-bold">{type.name}</div>
                              <div className="text-[10px] text-gray-400">{type.risk}</div>
                            </div>
                          </div>
                          {isDisabled && (
                            <span className="text-[9px] text-rose-400 font-semibold uppercase">Needs ₹2L</span>
                          )}
                        </button>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>

            <div className="glass-card rounded-3xl p-6 sm:p-8 border border-white/10 space-y-4">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-2">Optional Actions</h3>

              <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/10 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <span className="text-xl">💳</span>
                  <div>
                    <div className="text-xs font-bold text-white">Take a Personal Loan</div>
                    <div className="text-[11px] text-gray-400">Adds cash immediately. Debt accrues 2% monthly interest.</div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {takeLoan && (
                    <select
                      value={loanAmount}
                      onChange={(e) => setLoanAmount(Number(e.target.value))}
                      className="glass-input px-2.5 py-1.5 rounded-lg text-xs font-mono"
                    >
                      <option value={10000} className="bg-gray-900">₹10,000</option>
                      <option value={25000} className="bg-gray-900">₹25,000</option>
                      <option value={50000} className="bg-gray-900">₹50,000</option>
                      <option value={100000} className="bg-gray-900">₹1,00,000</option>
                    </select>
                  )}
                  <input
                    type="checkbox"
                    checked={takeLoan}
                    onChange={(e) => setTakeLoan(e.target.checked)}
                    className="w-5 h-5 accent-indigo-500 rounded cursor-pointer"
                  />
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/10 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <span className="text-xl">🛡️</span>
                  <div>
                    <div className="text-xs font-bold text-white">Buy Health Insurance</div>
                    <div className="text-[11px] text-gray-400">Costs ₹{insuranceMonthlyCost.toLocaleString('en-IN')}/mo (5% salary). Protects against medical events.</div>
                  </div>
                </div>

                <input
                  type="checkbox"
                  checked={buyInsurance}
                  onChange={(e) => setBuyInsurance(e.target.checked)}
                  className="w-5 h-5 accent-indigo-500 rounded cursor-pointer"
                />
              </div>

              <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/10 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <span className="text-xl">🔒</span>
                  <div>
                    <div className="text-xs font-bold text-white">Lock Emergency Fund</div>
                    <div className="text-[11px] text-gray-400">Locks ₹{emergencyFundRequired.toLocaleString('en-IN')} (3 months expenses) into protected savings.</div>
                  </div>
                </div>

                <input
                  type="checkbox"
                  checked={buyEmergencyFund}
                  onChange={(e) => setBuyEmergencyFund(e.target.checked)}
                  disabled={session.cash < emergencyFundRequired}
                  className="w-5 h-5 accent-indigo-500 rounded cursor-pointer disabled:opacity-40"
                />
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="glass-card rounded-3xl p-6 border border-white/10">
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/10">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Investments Portfolio</h3>
                <span className="text-xs font-bold text-emerald-400 font-mono">₹{totalInvestmentValue.toLocaleString('en-IN')}</span>
              </div>

              {investments.length === 0 ? (
                <div className="text-center py-6 text-xs text-gray-500">
                  No investments held yet. Allocate money to &quot;Invest&quot; above to build your portfolio.
                </div>
              ) : (
                <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                  {investments.map((inv) => (
                    <div key={inv.id} className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.05] flex items-center justify-between text-xs">
                      <div>
                        <div className="font-bold text-white">{inv.type}</div>
                        <div className="text-[10px] text-gray-500">Purchased Month #{inv.purchase_month}</div>
                      </div>
                      <div className="text-right font-mono font-bold text-emerald-400">
                        ₹{Number(inv.current_value).toLocaleString('en-IN')}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="glass-card rounded-3xl p-6 border border-white/10 relative overflow-hidden shadow-2xl">
              <div className="text-xs text-gray-400 mb-4">
                Ready to progress to Month #{session.month_number + 1}? Life events will roll and your AI Financial Coach will evaluate your strategy.
              </div>

              <button
                onClick={handleAdvanceMonth}
                disabled={loading}
                className="w-full btn-primary py-4 rounded-2xl text-sm font-extrabold text-white cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-xl shadow-indigo-500/25"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Simulating Month...</span>
                  </>
                ) : (
                  <>
                    <span>Advance Month</span>
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* 3. FINANCIAL CHARTS */}
        <FinancialCharts
          history={history}
          currentNetWorth={Number(session.net_worth)}
        />

        {/* 4. ACHIEVEMENTS BADGE GRID SECTION */}
        <div className="glass-card rounded-3xl p-6 sm:p-8 border border-white/10">
          <AchievementsGrid earnedAchievements={earnedAchievements} />
        </div>
      </div>

      {/* Floating AI Financial Twin Drawer */}
      <FinancialTwinDrawer financialProfile={session} />
    </main>
  )
}
