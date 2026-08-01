export interface LifeEventImpact {
  salaryMultiplier?: number
  salarySetZeroThisMonth?: boolean
  cashDelta?: number
  happinessDelta?: number
  investmentCrashPct?: number
  inflationDeltaPct?: number
  description: string
}

export interface LifeEvent {
  type: string
  title: string
  emoji: string
  getImpact: (params: {
    job: string
    salary: number
    cash: number
    hasInsurance: boolean
  }) => LifeEventImpact
}

export const LIFE_EVENTS_POOL: LifeEvent[] = [
  {
    type: 'PROMOTION',
    title: 'Promotion & Pay Raise',
    emoji: '🎉',
    getImpact: ({ salary }) => ({
      salaryMultiplier: 1.1, // +10% salary
      happinessDelta: +10,
      description: `Your hard work paid off! You received a promotion and a 10% raise to ₹${Math.round(salary * 1.1).toLocaleString('en-IN')}/mo.`,
    }),
  },
  {
    type: 'JOB_LOSS',
    title: 'Temporary Job Disruption',
    emoji: '📉',
    getImpact: () => ({
      salarySetZeroThisMonth: true,
      happinessDelta: -20,
      description: 'Unexpected lay-offs disrupted your employment! No salary earned this month and happiness dropped by 20.',
    }),
  },
  {
    type: 'MEDICAL_EMERGENCY',
    title: 'Medical Emergency',
    emoji: '🏥',
    getImpact: ({ cash, hasInsurance }) => {
      const pct = hasInsurance ? 0.05 : 0.15
      const cost = Math.round(cash * pct)
      return {
        cashDelta: -cost,
        description: hasInsurance
          ? `A sudden health issue occurred, but your health insurance covered 67%! Out-of-pocket cost: ₹${cost.toLocaleString('en-IN')} (5% of cash).`
          : `A medical emergency occurred without insurance! Out-of-pocket cost: ₹${cost.toLocaleString('en-IN')} (15% of cash).`,
      }
    },
  },
  {
    type: 'STOCK_CRASH',
    title: 'Market Volatility Drop',
    emoji: '💥',
    getImpact: () => ({
      investmentCrashPct: 0.25, // 25% loss on Stocks & Crypto
      description: 'A market downturn hit high-risk assets! Your Stocks and Crypto investments lost 25% of their value.',
    }),
  },
  {
    type: 'BONUS',
    title: 'Performance Bonus',
    emoji: '💰',
    getImpact: ({ salary }) => {
      const bonus = Math.round(salary * 0.2)
      return {
        cashDelta: bonus,
        happinessDelta: +5,
        description: `Exceeded targets this quarter! Earned a bonus payout of ₹${bonus.toLocaleString('en-IN')} (20% of salary).`,
      }
    },
  },
  {
    type: 'INFLATION',
    title: 'Inflation Spike',
    emoji: '🏷️',
    getImpact: () => ({
      inflationDeltaPct: 0.1, // +10% living expenses
      description: 'Surging costs of utilities and groceries increased living expenses by 10% starting next month.',
    }),
  },
  {
    type: 'CAR_REPAIR',
    title: 'Unexpected Vehicle Repair',
    emoji: '🚗',
    getImpact: () => ({
      cashDelta: -8000,
      description: 'Vehicle breakdown required urgent mechanical repairs costing ₹8,000.',
    }),
  },
  {
    type: 'WEDDING',
    title: 'Family Wedding Celebration',
    emoji: '💒',
    getImpact: () => ({
      cashDelta: -30000,
      happinessDelta: +15,
      description: 'Celebrated a close family wedding! Spent ₹30,000 on gifts & travel, boosting happiness by +15.',
    }),
  },
  {
    type: 'SCHOLARSHIP',
    title: 'Academic Merit Scholarship',
    emoji: '🎓',
    getImpact: () => ({
      cashDelta: +15000,
      happinessDelta: +10,
      description: 'Awarded a competitive merit scholarship grant of ₹15,000 for your studies!',
    }),
  },
  {
    type: 'TAX_REFUND',
    title: 'Government Tax Refund',
    emoji: '🧾',
    getImpact: () => ({
      cashDelta: +10000,
      description: 'Received an unexpected tax refund deposit of ₹10,000 from tax filing.',
    }),
  },
]

export function rollRandomLifeEvent(params: {
  job: string
  salary: number
  cash: number
  hasInsurance: boolean
}): { event: LifeEvent | null; impact: LifeEventImpact | null } {
  // 30% chance of NO event happening
  const roll = Math.random()
  if (roll < 0.3) {
    return { event: null, impact: null }
  }

  // Filter pool (Scholarship only valid for Student Intern)
  const validEvents = LIFE_EVENTS_POOL.filter((evt) => {
    if (evt.type === 'SCHOLARSHIP' && params.job !== 'Student Intern') {
      return false
    }
    return true
  })

  const selectedEvent = validEvents[Math.floor(Math.random() * validEvents.length)]
  const impact = selectedEvent.getImpact(params)

  return { event: selectedEvent, impact }
}
