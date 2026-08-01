import { GameSession, Investment } from '@/app/game/MonthlyDecisionClient'

export interface AchievementDef {
  code: string
  name: string
  emoji: string
  description: string
  check: (params: {
    session: GameSession
    investments: Investment[]
    hasInsurance: boolean
    hasEmergencyFund: boolean
  }) => boolean
}

export const ACHIEVEMENTS: AchievementDef[] = [
  {
    code: 'debt_free',
    name: 'Debt Free',
    emoji: '🏆',
    description: 'Completely eliminate all debt by Month 3 or later.',
    check: ({ session }) => Number(session.debt) === 0 && session.month_number >= 3,
  },
  {
    code: 'diversified_investor',
    name: 'Diversified Investor',
    emoji: '📊',
    description: 'Own at least 3 distinct types of investment assets.',
    check: ({ investments }) => {
      const distinctTypes = new Set(investments.map((inv) => inv.type))
      return distinctTypes.size >= 3
    },
  },
  {
    code: 'six_figure_saver',
    name: 'Six-Figure Saver',
    emoji: '💰',
    description: 'Accumulate ₹1,00,000 or more in savings reserves.',
    check: ({ session }) => Number(session.savings) >= 100000,
  },
  {
    code: 'half_millionaire',
    name: 'Half-Millionaire',
    emoji: '💎',
    description: 'Grow your total net worth to ₹5,00,000 or higher.',
    check: ({ session }) => Number(session.net_worth) >= 500000,
  },
  {
    code: 'survivor',
    name: 'Long-Term Survivor',
    emoji: '⌛',
    description: 'Navigate career and markets to reach Month 12.',
    check: ({ session }) => session.month_number >= 12,
  },
  {
    code: 'high_scorer',
    name: 'High Financial Score',
    emoji: '🌟',
    description: 'Achieve a top-tier Financial Score of 80 or above.',
    check: ({ session }) => session.financial_score >= 80,
  },
  {
    code: 'insured',
    name: 'Risk Protected',
    emoji: '🛡️',
    description: 'Purchase health insurance to safeguard your financial health.',
    check: ({ hasInsurance }) => hasInsurance,
  },
  {
    code: 'emergency_ready',
    name: 'Emergency Ready',
    emoji: '🔒',
    description: 'Lock 3 months of living expenses into an emergency fund.',
    check: ({ hasEmergencyFund, session }) => {
      const livingExp = Math.round(Number(session.salary) * 0.5)
      return hasEmergencyFund || Number(session.savings) >= livingExp * 3
    },
  },
]
