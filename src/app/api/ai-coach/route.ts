import { NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
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

    let feedback = ''

    const apiKey = process.env.ANTHROPIC_API_KEY

    if (apiKey && apiKey !== 'your-anthropic-api-key-here') {
      try {
        const anthropic = new Anthropic({ apiKey })

        const prompt = `
You are a friendly, encouraging personal financial coach for a simulation game player.

Player Context:
- Job: ${job}
- Month #${monthNumber}
- Decided Allocations: Save ₹${decisionDetail?.save_amount?.toLocaleString('en-IN') || 0}, Invest ₹${decisionDetail?.invest_amount?.toLocaleString('en-IN') || 0} (${decisionDetail?.investment_type || 'None'}), Spend ₹${decisionDetail?.spend_amount?.toLocaleString('en-IN') || 0}
- Optional Actions: Loan Taken ₹${decisionDetail?.loan_taken?.toLocaleString('en-IN') || 0}, Insurance Active: ${decisionDetail?.insurance_active ? 'Yes' : 'No'}
- Life Event Occurred: ${lifeEvent ? `${lifeEvent.title} (${lifeEvent.description})` : 'Smooth Month (No Life Event)'}
- Stats BEFORE Month: Cash ₹${beforeStats?.cash?.toLocaleString('en-IN')}, Savings ₹${beforeStats?.savings?.toLocaleString('en-IN')}, Debt ₹${beforeStats?.debt?.toLocaleString('en-IN')}, Net Worth ₹${beforeStats?.net_worth?.toLocaleString('en-IN')}, Happiness ${beforeStats?.happiness}%
- Stats AFTER Month: Cash ₹${afterStats?.cash?.toLocaleString('en-IN')}, Savings ₹${afterStats?.savings?.toLocaleString('en-IN')}, Debt ₹${afterStats?.debt?.toLocaleString('en-IN')}, Net Worth ₹${afterStats?.net_worth?.toLocaleString('en-IN')}, Happiness ${afterStats?.happiness}%

Your Task:
Write a conversational, friendly coach's note (UNDER 150 WORDS) that:
1. Briefly explains why Net Worth changed this month.
2. Evaluates if the decisions were smart.
3. Points out 1 mistake/caution if applicable (or praise if excellent).
4. Teaches ONE relevant concept (compound interest, diversification, emergency funds, debt management, or inflation) in simple terms.

Do NOT use bullet points or technical jargon. Keep it warm, direct, and under 150 words.
`

        // Try candidate model IDs for maximum compatibility
        let response
        try {
          response = await anthropic.messages.create({
            model: 'claude-3-5-sonnet-latest',
            max_tokens: 500,
            messages: [{ role: 'user', content: prompt }],
          })
        } catch {
          response = await anthropic.messages.create({
            model: 'claude-3-5-sonnet-20241022',
            max_tokens: 500,
            messages: [{ role: 'user', content: prompt }],
          })
        }

        const contentBlock = response.content[0]
        if (contentBlock && contentBlock.type === 'text') {
          feedback = contentBlock.text
        }
      } catch (anthropicErr) {
        console.warn('Anthropic API call notice, falling back to smart coach engine:', anthropicErr)
      }
    }

    // Fallback Smart Financial Coach Engine if API key is not present or API call failed
    if (!feedback) {
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

      feedback = `Hey there! ${netWorthExplain} ${strategyEvaluation} ${cautionOrPraise} ${conceptLesson}`
    }

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
