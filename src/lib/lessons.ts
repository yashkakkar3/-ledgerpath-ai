export interface QuizQuestion {
  id: string
  question: string
  options: string[]
  correctIndex: number
  explanation: string
}

export interface Lesson {
  slug: string
  title: string
  emoji: string
  shortDescription: string
  paragraphs: string[]
  questions: QuizQuestion[]
}

export const LESSONS: Lesson[] = [
  {
    slug: 'compound-interest',
    title: 'Compound Interest',
    emoji: '📈',
    shortDescription: 'Discover how your money generates earnings on top of previous earnings to grow exponentially.',
    paragraphs: [
      'Compound interest is often called the eighth wonder of the world. Unlike simple interest, which only calculates returns on your initial principal, compound interest allows you to earn interest on both your principal AND the accumulated interest from previous periods.',
      'The key to unlocking compound growth is time. Starting early—even with small monthly contributions—allows compound growth to accelerate exponentially over decades, turning modest savings into substantial wealth.',
      'To make compound interest work for you, consistency is essential. Reinvesting your returns and maintaining a long-term investment horizon maximizes the snowball effect.',
    ],
    questions: [
      {
        id: 'ci-q1',
        question: 'What is the primary difference between simple interest and compound interest?',
        options: [
          'Simple interest pays higher rates than compound interest',
          'Compound interest earns returns on both initial principal and previous accumulated interest',
          'Compound interest is only used for personal loans',
          'Simple interest compounds every single day',
        ],
        correctIndex: 1,
        explanation: 'Compound interest calculates returns on both your starting principal and all previous interest earned, creating a snowball growth effect.',
      },
      {
        id: 'ci-q2',
        question: 'Which factor has the greatest impact on maximizing compound growth?',
        options: [
          'Waiting until age 40 to start investing',
          'Time and starting as early as possible',
          'Withdrawing earnings every month',
          'Investing only in zero-interest checking accounts',
        ],
        correctIndex: 1,
        explanation: 'Time is the most critical component of compound interest. The longer your money remains invested, the more powerful the compounding effect becomes.',
      },
    ],
  },
  {
    slug: 'diversification',
    title: 'Diversification',
    emoji: '📊',
    shortDescription: 'Learn why spreading investments across different asset classes reduces risk without sacrificing growth.',
    paragraphs: [
      'Diversification is the classic financial strategy of "not putting all your eggs in one basket." By spreading your capital across various asset classes—such as stocks, mutual funds, gold, and real estate—you reduce your overall portfolio risk.',
      'Different assets react differently to economic events. When stock markets experience volatility, stable assets like gold or fixed deposits often hold their value or appreciate, balancing out temporary losses.',
      'A well-diversified portfolio aims to achieve steady growth while shielding your life savings from catastrophic losses if any single company or asset class underperforms.',
    ],
    questions: [
      {
        id: 'div-q1',
        question: 'Why is diversification important for an investor?',
        options: [
          'It guarantees 100% risk-free profits in all market conditions',
          'It spreads risk across multiple assets so one loss doesn’t ruin your portfolio',
          'It allows you to invest only in cryptocurrency',
          'It eliminates the need to pay taxes on capital gains',
        ],
        correctIndex: 1,
        explanation: 'Diversification balances risk across asset types so that market declines in one sector do not destroy your entire portfolio.',
      },
      {
        id: 'div-q2',
        question: 'Which combination demonstrates proper asset diversification?',
        options: [
          'Buying shares in 5 different technology stocks only',
          'Holding a mix of stocks, mutual funds, gold, and cash reserves',
          'Putting 100% of your savings into a single cryptocurrency token',
          'Keeping all money under your mattress in cash',
        ],
        correctIndex: 1,
        explanation: 'Holding a balanced mix of equities, index funds, commodities (gold), and liquid cash creates true multi-asset diversification.',
      },
    ],
  },
  {
    slug: 'emergency-funds',
    title: 'Emergency Funds',
    emoji: '🛡️',
    shortDescription: 'Build a safety net of 3-6 months of living expenses to handle surprise life events stress-free.',
    paragraphs: [
      'An emergency fund is your financial shock absorber. It is a dedicated pool of liquid cash meant exclusively to cover unexpected life surprises like medical emergencies, car repairs, or sudden job disruptions.',
      'Financial advisors recommend keeping 3 to 6 months worth of essential living expenses stored safely in high-yield savings accounts or liquid funds where it can be accessed immediately.',
      'Having an active emergency fund prevents you from taking high-interest personal debt or liquidating long-term investments at a loss when unexpected bills arise.',
    ],
    questions: [
      {
        id: 'ef-q1',
        question: 'How many months of living expenses should a healthy emergency fund cover?',
        options: [
          '1 week of grocery expenses',
          '3 to 6 months of essential living expenses',
          '10 years of luxury vacation expenses',
          'Zero—you should invest 100% of all cash immediately',
        ],
        correctIndex: 1,
        explanation: 'A standard emergency fund buffer covers 3 to 6 months of basic living costs to safeguard your financial stability during unexpected events.',
      },
      {
        id: 'ef-q2',
        question: 'Where is the best place to keep an emergency fund?',
        options: [
          'High-risk volatile cryptocurrency tokens',
          'A liquid, easily accessible savings account or liquid fund',
          'Illiquid real estate property that takes months to sell',
          'Locked in a 5-year non-redeemable bond',
        ],
        correctIndex: 1,
        explanation: 'Emergency funds must be liquid and easily accessible on short notice without penalty or loss of principal.',
      },
    ],
  },
  {
    slug: 'debt-management',
    title: 'Debt Management',
    emoji: '💳',
    shortDescription: 'Understand the difference between good debt and bad debt, and master high-interest payoff strategies.',
    paragraphs: [
      'Not all debt is created equal. Good debt—like low-interest mortgages or education loans—helps you acquire appreciating assets or increase your earning potential over time.',
      'Bad debt—such as credit card debt or high-interest personal loans—carries steep interest rates (often 18%-36% annually) that quickly erode your wealth and strain your monthly cash flow.',
      'Effective debt management involves prioritizing high-interest debt payoff (the Avalanche Method) while maintaining a strict budget to ensure debt payments never exceed 30% of your net income.',
    ],
    questions: [
      {
        id: 'dm-q1',
        question: 'Which of the following is considered high-interest "bad debt"?',
        options: [
          'A subsidized low-interest student education loan',
          'Unpaid credit card balances carrying 24% annual interest',
          'A home mortgage on an appreciating primary residence',
          'A zero-interest family loan with no strict deadline',
        ],
        correctIndex: 1,
        explanation: 'Credit card debt and high-interest consumer loans drain your income quickly due to compounding high interest rates.',
      },
      {
        id: 'dm-q2',
        question: 'What is the debt avalanche method for debt payoff?',
        options: [
          'Paying off the smallest balance debt first regardless of interest rate',
          'Paying off debts with the highest interest rates first to minimize total interest paid',
          'Ignoring debt until it gets sent to collection agencies',
          'Taking on new high-interest loans to pay off old ones',
        ],
        correctIndex: 1,
        explanation: 'The debt avalanche method targets the debt with the highest interest rate first, saving you the most money in overall interest.',
      },
    ],
  },
  {
    slug: 'budgeting-basics',
    title: 'Budgeting Basics',
    emoji: '⚖️',
    shortDescription: 'Master the 50/30/20 rule to balance essential needs, personal wants, and future savings effortless.',
    paragraphs: [
      'A budget is not a financial straightjacket—it is a roadmap for your money. The 50/30/20 rule is a simple, intuitive framework for managing your monthly net salary.',
      'Under this framework: 50% of your income goes to Needs (rent, food, utilities), 30% goes to Wants (dining, entertainment, hobbies), and 20% is earmarked for Savings & Wealth Building.',
      'By automating your 20% savings allocation as soon as your paycheck arrives ("paying yourself first"), you guarantee steady financial progress while still enjoying your lifestyle guilt-free.',
    ],
    questions: [
      {
        id: 'bb-q1',
        question: 'In the 50/30/20 budgeting rule, what does the 20% allocation represent?',
        options: [
          'Dining out and entertainment',
          'Savings, investments, and debt reduction',
          'Rent and monthly utility bills',
          'Income tax payments',
        ],
        correctIndex: 1,
        explanation: 'The 20% portion is designated specifically for savings, building your emergency fund, and investing for long-term goals.',
      },
      {
        id: 'bb-q2',
        question: 'What does "paying yourself first" mean in personal finance?',
        options: [
          'Buying luxury items before paying rent',
          'Automating savings and investments out of your salary before spending on discretionary items',
          'Giving yourself a cash bonus at the end of the year',
          'Paying off your lowest bill first',
        ],
        correctIndex: 1,
        explanation: 'Paying yourself first means prioritizing your savings and investment goals immediately upon receiving income, rather than saving whatever happens to be left over.',
      },
    ],
  },
  {
    slug: 'understanding-inflation',
    title: 'Understanding Inflation',
    emoji: '🏷️',
    shortDescription: 'Learn how inflation erodes purchasing power over time and how equity/gold hedges protect wealth.',
    paragraphs: [
      'Inflation is the gradual increase in prices over time, which reduces the purchasing power of your money. A cup of coffee or house rent that cost ₹50 ten years ago may cost ₹100 today.',
      'If your cash savings sit in a zero-interest account while inflation runs at 6% annually, your real wealth shrinks every year because your money buys fewer goods and services.',
      'To beat inflation, your investments must generate returns higher than the prevailing inflation rate. Assets like equities, real estate, and gold historically outperform inflation and preserve real purchasing power.',
    ],
    questions: [
      {
        id: 'inf-q1',
        question: 'What is the main effect of inflation on uninvested cash savings?',
        options: [
          'It automatically doubles the cash amount every 5 years',
          'It erodes the purchasing power of cash over time',
          'It eliminates all taxes on savings accounts',
          'It increases the value of physical cash bills',
        ],
        correctIndex: 1,
        explanation: 'Inflation causes goods and services to become more expensive, meaning idle cash buys less in the future than it does today.',
      },
      {
        id: 'inf-q2',
        question: 'Which asset class historically acts as an effective hedge against inflation?',
        options: [
          'Paper cash stored under a mattress',
          'Equities, real estate, and commodities like gold',
          'Low-yield checking accounts paying 0.1% interest',
          'Expired store gift cards',
        ],
        correctIndex: 1,
        explanation: 'Growth assets like stocks, real estate, and gold generally appreciate faster than inflation, protecting and growing your real wealth.',
      },
    ],
  },
]
