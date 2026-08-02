import { NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const {
      sessionId,
      monthNumber,
      job,
      decisionDetail,
      lifeEvent,
      beforeStats,
      afterStats,
    } = body

    const netWorthDelta = (afterStats?.net_worth || 0) - (beforeStats?.net_worth || 0)
    const saveAmt = decisionDetail?.save_amount || 0
    const investAmt = decisionDetail?.invest_amount || 0
    const debtAmt = afterStats?.debt || 0

    let netWorthExplain = netWorthDelta >= 0
      ? `Your Net Worth grew by ₹${netWorthDelta.toLocaleString('en-IN')} this month due to your disciplined savings and investment contributions.`
      : `Your Net Worth dipped by ₹${Math.abs(netWorthDelta).toLocaleString('en-IN')} due to unexpected event expenses and interest charges.`

    let strategyEvaluation = (saveAmt + investAmt) > 0
      ? `Allocating money towards savings and investments is a smart move that builds long-term wealth.`
      : `Putting zero funds into savings or investments this month slows down your wealth accumulation.`

    let cautionOrPraise = debtAmt > 0
      ? `Keep an eye on your debt (₹${debtAmt.toLocaleString('en-IN')})—it carries a 2% monthly interest drag on your net worth.`
      : `Great job keeping debt at ₹0! Operating debt-free gives you maximum flexibility.`

    let conceptLesson = investAmt > 0
      ? `Financial Concept: Diversification means spreading your money across different asset classes to balance risk and return.`
      : `Financial Concept: Compound Interest is earning interest on interest—the earlier you start saving, the faster your money grows!`

    const feedback = `Hey there! ${netWorthExplain} ${strategyEvaluation} ${cautionOrPraise} ${conceptLesson}`

    // Save feedback into decisions_log.ai_feedback for this session and month
    if (sessionId && monthNumber) {
      try {
        const cookieStore = await cookies()
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder-url.supabase.co'
        const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key'

        const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
          cookies: {
            getAll() {
              return cookieStore.getAll()
            },
            setAll(cookiesToSet) {
              try {
                cookiesToSet.forEach(({ name, value, options }) =>
                  cookieStore.set(name, value, options)
                )
              } catch {
                // Ignore if called from server component context
              }
            },
          },
        })

        await supabase
          .from('decisions_log')
          .update({ ai_feedback: feedback })
          .eq('session_id', sessionId)
          .eq('month_number', monthNumber)
      } catch (dbErr) {
        console.warn('DB update for ai_feedback notice:', dbErr)
      }
    }

    return NextResponse.json({ feedback })
  } catch (error: any) {
    console.error('AI Coach API Catch-all Error:', error)
    return NextResponse.json({
      feedback: 'Keep making consistent savings decisions! Building an emergency fund and staying debt-free is the fastest path to financial independence.'
    })
  }
}
