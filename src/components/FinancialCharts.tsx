'use client'

import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts'

export interface DecisionHistoryItem {
  month_number: number
  decision_detail?: {
    save_amount?: number
    invest_amount?: number
    spend_amount?: number
  }
  outcome?: {
    net_worth?: number
    cash?: number
    savings?: number
    debt?: number
  }
}

export default function FinancialCharts({
  history = [],
  currentNetWorth = 0,
}: {
  history: DecisionHistoryItem[]
  currentNetWorth?: number
}) {
  // Format data for charts
  const chartData = history.map((item) => {
    const netWorth = item.outcome?.net_worth ?? 0
    const saveAmt = item.decision_detail?.save_amount ?? 0
    const investAmt = item.decision_detail?.invest_amount ?? 0
    const spendAmt = item.decision_detail?.spend_amount ?? 0

    return {
      month: `Month #${item.month_number}`,
      netWorth,
      saveAmt,
      investAmt,
      spendAmt,
    }
  })

  // Fallback if no history yet
  if (chartData.length === 0) {
    chartData.push({
      month: 'Month #1',
      netWorth: currentNetWorth,
      saveAmt: 0,
      investAmt: 0,
      spendAmt: 0,
    })
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* 1. Net Worth Trajectory Line Chart */}
      <div className="glass-card rounded-3xl p-6 border border-white/10 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
              <span>📈 Net Worth Growth Trajectory</span>
            </h3>
            <p className="text-xs text-gray-400">Track your portfolio value over simulation months</p>
          </div>
        </div>

        <div className="h-64 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="netWorthGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="month" stroke="#6b7280" fontSize={11} tickLine={false} />
              <YAxis
                stroke="#6b7280"
                fontSize={11}
                tickLine={false}
                tickFormatter={(val) => `₹${(val / 1000).toFixed(0)}k`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#090d16',
                  borderColor: 'rgba(255,255,255,0.15)',
                  borderRadius: '12px',
                  color: '#fff',
                  fontSize: '12px',
                }}
                formatter={(value: any) => [`₹${Number(value).toLocaleString('en-IN')}`, 'Net Worth']}
              />
              <Area
                type="monotone"
                dataKey="netWorth"
                stroke="#818cf8"
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#netWorthGrad)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 2. Monthly Cash Flow Allocation Bar Chart */}
      <div className="glass-card rounded-3xl p-6 border border-white/10 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
              <span>📊 Income Allocation Breakdown</span>
            </h3>
            <p className="text-xs text-gray-400">Save vs Invest vs Spend split per month</p>
          </div>
        </div>

        <div className="h-64 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="month" stroke="#6b7280" fontSize={11} tickLine={false} />
              <YAxis
                stroke="#6b7280"
                fontSize={11}
                tickLine={false}
                tickFormatter={(val) => `₹${(val / 1000).toFixed(0)}k`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#090d16',
                  borderColor: 'rgba(255,255,255,0.15)',
                  borderRadius: '12px',
                  color: '#fff',
                  fontSize: '12px',
                }}
                formatter={(val: any, name: any) => [
                  `₹${Number(val).toLocaleString('en-IN')}`,
                  name === 'saveAmt' ? 'Saved' : name === 'investAmt' ? 'Invested' : 'Spent',
                ]}
              />
              <Bar dataKey="saveAmt" name="Saved" fill="#6366f1" radius={[4, 4, 0, 0]} />
              <Bar dataKey="investAmt" name="Invested" fill="#10b981" radius={[4, 4, 0, 0]} />
              <Bar dataKey="spendAmt" name="Spent" fill="#f59e0b" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}
