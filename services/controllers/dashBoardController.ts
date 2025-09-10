import { api } from "../baseApi"

const controller = "dashboard"

// Types for Student Dashboard
interface StudentSummary {
  totalBalance: number
  balanceChangePercentage: number
  monthlyIncome: number
  incomeChangePercentage: number
  monthlyExpenses: number
  expenseChangePercentage: number
  savingsGoalPercentage: number
  totalGoalTargetAmount: number
  totalGoalCurrentAmount: number
  currentJarLevel: number
}

interface Transaction {
  type: "Income" | "Expense"
  title: string
  amount: number
  createdDate: string
  categoryName: string
}

interface JarMilestone {
  level: number
  targetAmount: number
  status: "Completed" | "Active"
  completionDate: string | null
  actionTaken: string | null
}

interface CurrentJar {
  jarId: number
  targetAmount: number
  currentAmount: number
  level: number
  status: "Active"
  completionPercentage: number
  amountToNextLevel: number
  createdDate: string
  updatedDate: string
}

interface JarDetails {
  currentJar: CurrentJar | null
  milestones: JarMilestone[]
}

interface ExpenseBreakdown {
  categoryName: string
  categoryId: number
  totalAmount: number
  transactionCount: number
  percentage: number
}

interface LeaderboardUser {
  rank: number
  username: string
  score: number
  badgeTitle: string
  goalsCompleted: number
  goalCompletionRate: number
  jarLevel: number
  totalParticipants?: number
}

interface Leaderboard {
  topUsers: LeaderboardUser[]
  currentUser: LeaderboardUser
}

interface GoalProgress {
  goalId: number
  title: string
  targetAmount: number
  currentAmount: number
  targetDate: string
  status: "Active"
  completionPercentage: number
  daysLeft: number
  timelineStatus: "On Schedule"
  dailyTargetAmount: number
}

interface StudentDashboardResponse {
  success: boolean
  data: {
    summary: StudentSummary
    recentTransactions: Transaction[]
    jarDetails: JarDetails
    expenseBreakdown: ExpenseBreakdown[]
    leaderboard: Leaderboard
    goalProgress: GoalProgress[]
  }
}

// Types for Young Adult Dashboard
interface YoungAdultSummary {
  totalBalance: number
  balanceChangePercentage: number
  monthlyIncome: number
  incomeChangePercentage: number
  monthlyExpenses: number
  expenseChangePercentage: number
  savingsGoalPercentage: number
  totalGoalTargetAmount: number
  totalGoalCurrentAmount: number
}

interface PaymentReminder {
  reminderId: number
  title: string
  amount: number
  category: string
  dueDate: string
  nextDueDate: string
  remindDaysBefore: number
  frequency: "monthly"
  priority: "low priority" | "medium priority" | "high priority"
}

interface FinancialTrend {
  year: number
  month: number
  monthName: string
  income: number
  expenses: number
  savings: number
  netAmount: number
}

interface FinancialTrends {
  trends: FinancialTrend[]
  averages: {
    avgIncome: number
    avgExpenses: number
    avgSavings: number
  }
}

interface Budget {
  budgetId: number
  categoryName: string
  budgetAmount: number
  spentAmount: number
  remainingAmount: number
  percentageUsed: number
  status: "On Track" | "Over Budget" | "Near Limit"
}

interface YoungAdultDashboardResponse {
  success: boolean
  data: {
    summary: YoungAdultSummary
    recentTransactions: Transaction[]
    paymentReminders: PaymentReminder[]
    expenseBreakdown: ExpenseBreakdown[]
    financialTrends: FinancialTrends
    currentBudgets: Budget[]
  }
}

// Extend the base API with dashboard endpoints
export const dashboardApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getStudentDashboard: builder.query<StudentDashboardResponse, void>({
      query: () => ({
        url: `${controller}/student`,
        method: 'GET',
      }),
      providesTags: ['Dashboard', 'Student'],
    }),

    getYoungAdultDashboard: builder.query<YoungAdultDashboardResponse, void>({
      query: () => ({
        url: `${controller}/young-adult`,
        method: 'GET',
      }),
      providesTags: ['Dashboard', 'YoungAdult'],
    }),
  }),
  overrideExisting: false,
})

// Export hooks for components
export const {
  useGetStudentDashboardQuery,
  useGetYoungAdultDashboardQuery,
  useLazyGetStudentDashboardQuery,
  useLazyGetYoungAdultDashboardQuery,
} = dashboardApi

// Export types for use in components
export type {
  StudentDashboardResponse,
  YoungAdultDashboardResponse,
  StudentSummary,
  YoungAdultSummary,
  Transaction,
  JarDetails,
  CurrentJar,
  JarMilestone,
  ExpenseBreakdown,
  Leaderboard,
  LeaderboardUser,
  GoalProgress,
  PaymentReminder,
  FinancialTrends,
  FinancialTrend,
  Budget,
}