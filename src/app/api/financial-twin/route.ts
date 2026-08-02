import { NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'
// import Anthropic from '@anthropic-ai/sdk'

const SYSTEM_PROMPT_TEMPLATE = `You are the LedgerPath AI Financial Twin — a personalized financial
assistant embedded in a financial-literacy life-simulation game. You know
this player's financial profile in detail and use it to give grounded,
specific answers.

## How to answer
- Actually read and directly answer the specific question the player
  asked. Never substitute a generic summary of their stats for a real
  answer to what they asked.
- When a question involves numbers or a hypothetical ("what if..."),
  work through the math using their real profile data, and show the
  key numbers in your answer so they can see how you got there.
- If a detail is ambiguous, make the most reasonable assumption, state
  it briefly in one clause, and answer — don't stop to ask a clarifying
  question when you can reasonably proceed.
- Keep answers concise by default (2-5 sentences). Go deeper only if
  they ask you to.
- Ignore typos and informal phrasing — infer what they mean and answer
  that.

## Personality
- Encouraging but honest. Real feedback, not shaming, not empty positivity.
- Explain the "why" behind concepts (compound interest, opportunity cost,
  diversification, cost of debt vs. return on savings) as you go, so
  they're learning, not just getting a verdict.

## Scope
- You answer finance questions broadly — personal finance, investing,
  mutual funds, stocks, crypto, insurance, taxes, credit, loans,
  business finance, accounting, economics, retirement, budgeting,
  banking, and related topics. You are not limited to a fixed list of
  topics; use your general financial knowledge freely.
- You can discuss both the player's in-game simulation and real-world
  finance concepts. Use their in-game numbers as concrete examples when
  relevant.
- If asked something with no connection to finance, politely decline
  and redirect: "I'm your financial assistant — happy to dig into money
  questions though."

## Boundaries
- Never recommend a specific real-world stock, cryptocurrency, or named
  financial product. Discuss concepts and categories, not picks.
- Don't give definitive real tax/legal advice for their specific
  situation — explain general concepts and suggest a professional for
  anything specific to their real filing/situation.
- Don't give an individualized real-life financial plan as if you were
  their advisor. Explain factors and trade-offs; let them decide.
- If the player's messages suggest real financial distress (real job
  loss, real debt collection, real crisis), soften your tone, step out
  of teaching mode, and point them toward real-world resources.

## Player's current profile
{financial_profile_json}

## Recent conversation
{chat_history}`

export async function POST(request: Request) {
  let lastError: string | null = null

  try {
    const body = await request.json()
    const { messages = [], financialProfile = {}, chatHistory = [] } = body

    const profileJson = JSON.stringify(financialProfile, null, 2)
    const formattedChatHistory = Array.isArray(chatHistory)
      ? chatHistory.map((m: any) => `${m.role}: ${m.content}`).join('\n')
      : ''

    const systemPrompt = SYSTEM_PROMPT_TEMPLATE
      .replace('{financial_profile_json}', profileJson)
      .replace('{chat_history}', formattedChatHistory)

    const apiKey = process.env.GEMINI_API_KEY
    let reply = ''
    let source = 'fallback'

    if (apiKey && apiKey !== 'your-gemini-api-key-here') {
      try {
        const genAI = new GoogleGenerativeAI(apiKey)
        const model = genAI.getGenerativeModel({
          model: 'gemini-3.6-flash',
          systemInstruction: systemPrompt,
        })

        // Format messages for Gemini API ('user' or 'model' roles)
        const validMessages = messages
          .filter((m: any) => m && (m.role === 'user' || m.role === 'assistant'))
          .map((m: any) => ({
            role: m.role === 'assistant' ? 'model' : 'user',
            parts: [{ text: String(m.content || '') }],
          }))

        const firstUserIdx = validMessages.findIndex((m: any) => m.role === 'user')
        const geminiMessages = firstUserIdx >= 0 ? validMessages.slice(firstUserIdx) : []

        if (geminiMessages.length > 0) {
          let result
          try {
            result = await model.generateContent({
              contents: geminiMessages,
            })
          } catch (modelErr: any) {
            console.warn('[GEMINI_MODEL_WARN] Primary model failed, trying fallback model ID:', modelErr?.message || modelErr)
            const fallbackModel = genAI.getGenerativeModel({
              model: 'gemini-1.5-flash',
              systemInstruction: systemPrompt,
            })
            result = await fallbackModel.generateContent({
              contents: geminiMessages,
            })
          }

          const text = result.response.text()
          if (text) {
            reply = text
            source = 'gemini_live'
          }
        }
      } catch (geminiErr: any) {
        lastError = geminiErr?.message || String(geminiErr)
        console.error('[FINANCIAL_TWIN_GEMINI_ERROR] Live Gemini API call error:', {
          error: lastError,
          status: geminiErr?.status,
        })
      }
    } else {
      lastError = 'GEMINI_API_KEY is not set or using placeholder value'
    }

    /* 
    ===================================================================
    PREVIOUS ANTHROPIC CLAUDE IMPLEMENTATION (KEPT ASIDE FOR REFERENCE)
    ===================================================================
    const anthropicApiKey = process.env.ANTHROPIC_API_KEY
    if (anthropicApiKey && anthropicApiKey !== 'your-anthropic-api-key-here') {
      try {
        const anthropic = new Anthropic({ apiKey: anthropicApiKey })
        const validMessages = messages
          .filter((m: any) => m && (m.role === 'user' || m.role === 'assistant'))
          .map((m: any) => ({
            role: m.role as 'user' | 'assistant',
            content: String(m.content || ''),
          }))
        const firstUserIdx = validMessages.findIndex((m: any) => m.role === 'user')
        const anthropicMessages = firstUserIdx >= 0 ? validMessages.slice(firstUserIdx) : []
        if (anthropicMessages.length > 0) {
          let response
          try {
            response = await anthropic.messages.create({
              model: 'claude-3-5-sonnet-latest',
              max_tokens: 850,
              system: systemPrompt,
              messages: anthropicMessages,
            })
          } catch (modelErr1: any) {
            response = await anthropic.messages.create({
              model: 'claude-3-5-sonnet-20241022',
              max_tokens: 850,
              system: systemPrompt,
              messages: anthropicMessages,
            })
          }
          const block = response.content[0]
          if (block && block.type === 'text') {
            reply = block.text
            source = 'anthropic_live'
          }
        }
      } catch (anthropicErr: any) {
        console.error('[FINANCIAL_TWIN_ANTHROPIC_ERROR]', anthropicErr)
      }
    }
    ===================================================================
    */

    // Deterministic Rule Engine Fallback (complies with prompt rules for math, hypotheticals, typos, & broad finance scope)
    if (!reply) {
      const userMsg = messages[messages.length - 1]?.content?.toLowerCase() || ''
      const salary = Number(financialProfile.salary || 45000)
      const cash = Number(financialProfile.cash || 0)
      const savings = Number(financialProfile.savings || 0)
      const debt = Number(financialProfile.debt || 0)
      const netWorth = Number(financialProfile.net_worth || 0)
      const month = financialProfile.month_number || 1
      const job = financialProfile.job || 'Player'
      const score = financialProfile.financial_score || 50

      const numbersInMsg = userMsg.match(/₹?\s*(\d[\d,]*)/g)
      const parsedNumbers = numbersInMsg
        ? numbersInMsg.map((n: string) => parseInt(n.replace(/[^\d]/g, ''), 10)).filter((n: number) => !isNaN(n))
        : []

      const matchPct = userMsg.match(/(\d+)%/)
      const parsedPct = matchPct ? parseInt(matchPct[1], 10) / 100 : null

      const isSalaryQuery =
        userMsg.includes('salary') ||
        userMsg.includes('slary') ||
        userMsg.includes('income') ||
        userMsg.includes('pay') ||
        userMsg.includes('earn') ||
        userMsg.includes('wage') ||
        userMsg.includes('make')

      const isSavingsQuery = userMsg.includes('saving') || userMsg.includes('savings')

      if (isSalaryQuery && parsedNumbers.length > 0 && !parsedPct) {
        const targetSalary = parsedNumbers[0]
        const targetExpenses = Math.round(targetSalary * 0.5)
        const targetDisposable = targetSalary - targetExpenses
        const estimatedSavings = Math.round(targetDisposable * 0.4)

        reply = `If your salary becomes ₹${targetSalary.toLocaleString('en-IN')}/mo (compared to your current ₹${salary.toLocaleString('en-IN')}/mo): assuming expenses stay at 50% (₹${targetExpenses.toLocaleString('en-IN')}/mo), your disposable cash flow will be ₹${targetDisposable.toLocaleString('en-IN')}/mo. Saving 40% of that yields ₹${estimatedSavings.toLocaleString('en-IN')}/mo into savings.`
      } else if (
        isSalaryQuery &&
        parsedPct &&
        (userMsg.includes('increase') || userMsg.includes('raise') || userMsg.includes('up') || userMsg.includes('boost') || userMsg.includes('grow') || userMsg.includes('more') || userMsg.includes('plus'))
      ) {
        const newSalary = Math.round(salary * (1 + parsedPct))
        const currentExpenses = Math.round(salary * 0.5)
        const currentDisposable = salary - currentExpenses
        const newDisposable = newSalary - currentExpenses
        reply = `Assuming a permanent salary increase: a ${Math.round(parsedPct * 100)}% raise increases your monthly base from ₹${salary.toLocaleString('en-IN')} to ₹${newSalary.toLocaleString('en-IN')}. Keeping base living expenses steady at ₹${currentExpenses.toLocaleString('en-IN')}, your disposable income rises from ₹${currentDisposable.toLocaleString('en-IN')} to ₹${newDisposable.toLocaleString('en-IN')}/mo (+₹${(newDisposable - currentDisposable).toLocaleString('en-IN')}).`
      } else if (
        isSalaryQuery &&
        parsedPct &&
        (userMsg.includes('drop') || userMsg.includes('decrease') || userMsg.includes('cut') || userMsg.includes('reduce') || userMsg.includes('less') || userMsg.includes('down'))
      ) {
        const currentExpenses = Math.round(salary * 0.5)
        const newSalary = Math.round(salary * (1 - parsedPct))
        const newDisposable = newSalary - currentExpenses
        reply = `Assuming a monthly pay drop: a ${Math.round(parsedPct * 100)}% cut reduces your salary from ₹${salary.toLocaleString('en-IN')} to ₹${newSalary.toLocaleString('en-IN')}/mo. With fixed expenses at ₹${currentExpenses.toLocaleString('en-IN')}, disposable income shrinks to ₹${newDisposable.toLocaleString('en-IN')}.`
      } else if (userMsg.includes('invest') && (parsedPct || userMsg.includes('portion') || userMsg.includes('stocks'))) {
        const invPct = parsedPct || 0.20
        const investAmount = Math.round(salary * invPct)
        const expectedGrowth = Math.round(investAmount * 1.015)
        reply = `Investing ${Math.round(invPct * 100)}% of your ₹${salary.toLocaleString('en-IN')} monthly salary puts ₹${investAmount.toLocaleString('en-IN')}/mo into your portfolio. At an average 1.5% monthly return, that single contribution grows to ₹${expectedGrowth.toLocaleString('en-IN')} next month. Diversifying across asset classes protects against market volatility.`
      } else if (isSavingsQuery && (userMsg.includes('zero') || userMsg.includes('0') || userMsg.includes('drop') || userMsg.includes('lose'))) {
        const currentExpenses = Math.round(salary * 0.5)
        reply = `If your savings dropped to ₹0, your ₹${savings.toLocaleString('en-IN')} emergency buffer is completely gone. With monthly expenses at ₹${currentExpenses.toLocaleString('en-IN')}, any unexpected emergency forces you to drain cash directly or take high-interest debt.`
      } else if (parsedNumbers.length > 0) {
        const numVal = parsedNumbers[0]
        const numExpenses = Math.round(numVal * 0.5)
        const numDisposable = numVal - numExpenses
        reply = `Evaluating an income target of ₹${numVal.toLocaleString('en-IN')}/mo (current: ₹${salary.toLocaleString('en-IN')}): expenses at 50% equal ₹${numExpenses.toLocaleString('en-IN')}, leaving ₹${numDisposable.toLocaleString('en-IN')}/mo in disposable cash flow. Allocating 40% to savings (₹${Math.round(numDisposable * 0.4).toLocaleString('en-IN')}) accelerates your compounding.`
      } else if (userMsg.includes('compound interest') || userMsg.includes('compound')) {
        reply = `Compound interest is earning returns on your previous earnings. In your Month #${month} profile, saving and investing regularly allows your ₹${netWorth.toLocaleString('en-IN')} net worth to grow exponentially over time rather than linearly.`
      } else if (userMsg.includes('debt') || userMsg.includes('loan')) {
        reply = debt > 0
          ? `Your current debt is ₹${debt.toLocaleString('en-IN')}, carrying a 2% monthly interest drag. Paying down debt first yields a guaranteed return equal to the interest rate avoided.`
          : `Your debt is currently ₹0! Operating debt-free means 100% of your saved cash flow can be allocated to wealth-generating assets.`
      } else {
        const currentExpenses = Math.round(salary * 0.5)
        const disposable = salary - currentExpenses
        reply = `Looking at your Month #${month} profile as a ${job}: your monthly salary is ₹${salary.toLocaleString('en-IN')}, expenses are ~₹${currentExpenses.toLocaleString('en-IN')}, leaving ₹${disposable.toLocaleString('en-IN')} in disposable cash flow. Tell me what hypothetical change or financial topic you'd like to test!`
      }
    }

    return NextResponse.json({
      reply,
      source,
      hasApiKey: Boolean(apiKey && apiKey !== 'your-gemini-api-key-here'),
      lastError,
    })
  } catch (error: any) {
    console.error('[FINANCIAL_TWIN_FATAL_ERROR]', error)
    return NextResponse.json({
      reply: "I'm your AI Financial Twin! Ask me any question about your profile, salary hypotheticals, investing, debt, or financial concepts.",
      source: 'error',
      lastError: String(error?.message || error),
    })
  }
}
