"use client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { AdvancedPieChart } from "@/components/charts/advanced-pie-chart"
import { SpendingTrendChart } from "@/components/charts/spending-trend-chart"
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Target,
  CreditCard,
  Plus,
  ArrowUpRight,
  ArrowDownRight,
  Bell,
  Calendar,
  AlertTriangle,
  CheckCircle,
  Clock,
  DollarSign as BudgetIcon,
  TrendingUpDown,
  Zap,
  Activity,
  Loader2,
  PiggyBank,
} from "lucide-react"
import { useCurrency } from "@/hooks/useCurrency"
import { Cell, Legend, Pie, PieChart, Tooltip } from "recharts"
import { useGetYoungAdultDashboardQuery } from "@/services/controllers/dashBoardController"
import Link from "next/link"

export default function YoungAdultDashboard() {
  const { formatCurrency, getCurrencySymbol } = useCurrency()
  const { data: dashboardData, isLoading, error } = useGetYoungAdultDashboardQuery()

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[500px]">
        <div className="relative">
          <div className="flex h-24 w-24 items-center justify-center rounded-full bg-slate-200 shadow-sm">
            <PiggyBank className="h-10 w-10 text-gray-500" />
          </div>
          <div className="m-4 absolute inset-0 rounded-full border-4 border-transparent border-t-slate-500 border-r-slate-300 animate-spin"></div>
        </div>
      </div>
    )
  }

  // Show error state
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px] text-red-600">
        <p>Error loading dashboard data. Please try again.</p>
      </div>
    )
  }

  // Ensure we have data
  if (!dashboardData?.data) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p>No dashboard data available.</p>
      </div>
    )
  }

  const { summary, recentTransactions, paymentReminders, expenseBreakdown, financialTrends, currentBudgets } = dashboardData.data

  const stats = [
    {
      title: "Total Balance",
      value: `${getCurrencySymbol()} ${summary.totalBalance.toLocaleString()}`,
      change: `${summary.balanceChangePercentage >= 0 ? '+' : ''}${summary.balanceChangePercentage.toFixed(1)}%`,
      changeType: summary.balanceChangePercentage >= 0 ? "positive" as const : "negative" as const,
      icon: DollarSign,
      color: "text-blue-600", // 🔵 Blue
    },
    {
      title: "Monthly Income",
      value: `${getCurrencySymbol()} ${summary.monthlyIncome.toLocaleString()}`,
      change: `${summary.incomeChangePercentage >= 0 ? '+' : ''}${summary.incomeChangePercentage.toFixed(1)}%`,
      changeType: summary.incomeChangePercentage >= 0 ? "positive" as const : "negative" as const,
      icon: TrendingUp,
      color: "text-orange-600", // 🟠 Orange
    },
    {
      title: "Monthly Expenses",
      value: `${getCurrencySymbol()} ${summary.monthlyExpenses.toLocaleString()}`,
      change: `${summary.expenseChangePercentage >= 0 ? '+' : ''}${summary.expenseChangePercentage.toFixed(1)}%`,
      changeType: summary.expenseChangePercentage >= 0 ? "positive" as const : "negative" as const,
      icon: TrendingDown,
      color: "text-green-600", // 🟢 Green
    },
    {
      title: "Savings Goal",
      value: `${summary.savingsGoalPercentage}%`,
      change: `Target: ${getCurrencySymbol()} ${summary.totalGoalTargetAmount.toLocaleString()}`,
      changeType: "neutral" as const,
      icon: Target,
      color: "text-red-600", // 🔴 Red
    },
  ]


  // Transform API transactions to match component format
  const transformedTransactions = recentTransactions.slice(0, 5).map((transaction, index) => ({
    id: index + 1,
    type: transaction.type.toLowerCase() as "income" | "expense",
    description: transaction.title,
    amount: transaction.amount,
    date: new Date(transaction.createdDate).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    })
  }))

  // Transform expense breakdown for pie chart
  const pieChartColors = ["#dc2626", "#ea580c", "#d97706", "#059669", "#2563eb", "#7c3aed", "#db2777"]
  const expenseData = expenseBreakdown.map((expense, index) => ({
    name: expense.categoryName,
    value: expense.totalAmount,
    color: pieChartColors[index % pieChartColors.length]
  }))

  // Transform financial trends data
  const trendData = financialTrends.trends.filter(trend => trend.income > 0 || trend.expenses > 0 || trend.savings > 0).map(trend => ({
    month: trend.monthName.slice(0, 3),
    income: trend.income,
    expenses: trend.expenses,
    savings: trend.savings
  }))

  // Transform payment reminders
  const transformedPaymentReminders = paymentReminders.slice(0, 4).map((reminder, index) => ({
    id: reminder.reminderId,
    title: reminder.title,
    amount: reminder.amount,
    dueDate: new Date(reminder.dueDate).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    }),
    status: new Date(reminder.dueDate) <= new Date() ? "due" :
      new Date(reminder.dueDate) <= new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) ? "upcoming" : "scheduled",
    priority: reminder.priority.includes('low') ? 'low' : reminder.priority.includes('high') ? 'high' : 'medium'
  }))

  // Transform budget categories
  const budgetCategories = currentBudgets.map((budget, index) => ({
    category: budget.categoryName,
    budgeted: budget.budgetAmount,
    spent: budget.spentAmount,
    color: `bg-${['red', 'orange', 'yellow', 'green', 'blue'][index % 5]}-500`
  }))

  // Calculate totals for budget summary
  const totalBudgeted = currentBudgets.reduce((sum, budget) => sum + budget.budgetAmount, 0)
  const totalSpent = currentBudgets.reduce((sum, budget) => sum + budget.spentAmount, 0)
  const totalRemaining = totalBudgeted - totalSpent

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">Welcome back! Here's your comprehensive financial overview.</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title} className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className={`text-sm font-medium ${stat.color}`}>
                {stat.title}
              </CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color}`} /> {/* icon also colored */}
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${stat.color}`}>{stat.value}</div>
              <p
                className={`text-xs flex items-center gap-1 ${stat.changeType === "positive"
                  ? "text-green-600"
                  : stat.changeType === "negative"
                    ? "text-red-600"
                    : "text-muted-foreground"
                  }`}
              >
                {stat.changeType === "positive" && <ArrowUpRight className="h-3 w-3" />}
                {stat.changeType === "negative" && <ArrowDownRight className="h-3 w-3" />}
                {stat.change}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>


      {/* First Row - Recent Transactions, Payment Reminders, Expense Chart */}
      <div className="grid gap-6 lg:grid-cols-3">

        {/* Recent Transactions */}
        <Card className="">
          <CardHeader>
            <CardTitle>Recent Transactions</CardTitle>
            <CardDescription>Your latest financial activities</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {transformedTransactions.length > 0 ? transformedTransactions.map((transaction) => (
                <div
                  key={transaction.id}
                  className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors border border-gray-100"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`p-2 rounded-full ${transaction.type === "income" ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600"
                        }`}
                    >
                      {transaction.type === "income" ? (
                        <ArrowUpRight className="h-4 w-4" />
                      ) : (
                        <ArrowDownRight className="h-4 w-4" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-sm">{transaction.description}</p>
                      <p className="text-xs text-muted-foreground">{transaction.date}</p>
                    </div>
                  </div>
                  <div className={`font-semibold text-sm ${transaction.type === "income" ? "text-green-600" : "text-red-600"}`}>
                    {transaction.type === "income" ? "+" : ""}{getCurrencySymbol()} {Math.abs(transaction.amount).toLocaleString()}
                  </div>
                </div>
              )) : (
                <p className="text-center text-muted-foreground py-4">No recent transactions</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Payment Reminders - Enhanced */}
        <Card className="bg-orange-50 border-orange-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-orange-600" />
              Payment Reminders
            </CardTitle>
            <CardDescription>Upcoming bills and payments</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {transformedPaymentReminders.length > 0 ? transformedPaymentReminders.map((payment) => (
                <div
                  key={payment.id}
                  className={`flex items-center justify-between p-3 rounded-lg transition-colors border ${payment.status === "due"
                    ? "bg-red-50 border-red-200"
                    : payment.status === "upcoming"
                      ? "bg-yellow-50 border-yellow-200"
                      : "bg-gray-50 border-gray-200"
                    }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`p-2 rounded-full ${payment.status === "due"
                        ? "bg-red-100 text-red-600"
                        : payment.status === "upcoming"
                          ? "bg-yellow-100 text-yellow-600"
                          : "bg-green-100 text-green-600"
                        }`}
                    >
                      {payment.status === "due" ? (
                        <AlertTriangle className="h-4 w-4" />
                      ) : payment.status === "upcoming" ? (
                        <Clock className="h-4 w-4" />
                      ) : (
                        <CheckCircle className="h-4 w-4" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-sm">{payment.title}</p>
                      <p className="text-xs text-muted-foreground">Due {payment.dueDate}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`font-semibold text-sm ${payment.status === "due" ? "text-red-600" : "text-gray-700"
                      }`}>
                      {getCurrencySymbol()} {payment.amount.toLocaleString()}
                    </div>
                    <div className={`text-xs ${payment.priority === "high" ? "text-red-500" :
                      payment.priority === "medium" ? "text-yellow-500" : "text-green-500"
                      }`}>
                      {payment.priority} priority
                    </div>
                  </div>
                </div>
              )) : (
                <p className="text-center text-muted-foreground py-4">No payment reminders</p>
              )}
            </div>
            <Link href="payment-reminders" className="w-full">
              <Button size="sm" className="w-full mt-4 bg-orange-600 hover:bg-orange-700">
                <Plus className="h-4 w-4 mr-1" />
                Add Reminder
              </Button>
            </Link>

          </CardContent>
        </Card>

        {/* Expense Chart */}
        <Card className="">
          <CardHeader className=" pb-0 mb-0">
            <CardTitle>Monthly Expenses</CardTitle>
            <CardDescription>Detailed spending breakdown</CardDescription>
          </CardHeader>
          <CardContent>
            {expenseData.length > 0 ? (
              <div className="flex flex-col items-center space-y-4">
                <div className="relative">
                  <PieChart width={300} height={300}>
                    <Pie
                      data={expenseData}
                      innerRadius={70}
                      outerRadius={120}
                      fill="#8884d8"
                      dataKey="value"
                      stroke="#fff"
                      strokeWidth={1}
                    >
                      {expenseData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color || `hsl(${index * 45}, 70%, 60%)`} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value) => [`${getCurrencySymbol()}${value.toLocaleString()}`, 'Amount']}
                      labelStyle={{ color: '#000' }}
                      contentStyle={{
                        backgroundColor: '#fff',
                        border: '1px solid #ccc',
                        borderRadius: '6px'
                      }}
                    />
                    <Legend
                      verticalAlign="bottom"
                      height={6}
                      iconType="circle"
                      wrapperStyle={{ fontSize: '14px' }}
                    />
                  </PieChart>

                  {/* Center text */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <div className="text-2xl font-bold text-gray-900">
                      {getCurrencySymbol()}{expenseData.reduce((sum, item) => sum + item.value, 0).toLocaleString()}
                    </div>
                    <div className="text-sm text-gray-600">
                      Total Expenses
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-8">No expense data available</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Second Row - Financial Trends (2 cols) and Budget Tracker (1 col) */}
      <div className="grid gap-6 lg:grid-cols-3">

        {/* Financial Trends - Takes 2 columns */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-blue-600" />
                Financial Trends
              </CardTitle>
              <CardDescription>Monthly overview of income, expenses, and savings</CardDescription>
            </CardHeader>
            <CardContent>
              {trendData.length > 0 ? (
                <>
                  <SpendingTrendChart data={trendData} />
                  <div className="mt-4 grid grid-cols-3 gap-4 text-center">
                    <div className="p-3 bg-green-50 rounded-lg">
                      <div className="text-sm text-green-700">Avg. Income</div>
                      <div className="font-semibold text-green-800">
                        {getCurrencySymbol()} {financialTrends.averages.avgIncome.toLocaleString()}
                      </div>
                    </div>
                    <div className="p-3 bg-red-50 rounded-lg">
                      <div className="text-sm text-red-700">Avg. Expenses</div>
                      <div className="font-semibold text-red-800">
                        {getCurrencySymbol()} {financialTrends.averages.avgExpenses.toLocaleString()}
                      </div>
                    </div>
                    <div className="p-3 bg-blue-50 rounded-lg">
                      <div className="text-sm text-blue-700">Avg. Savings</div>
                      <div className="font-semibold text-blue-800">
                        {getCurrencySymbol()} {financialTrends.averages.avgSavings.toLocaleString()}
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <p className="text-center text-muted-foreground py-8">No financial trend data available</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Budget Tracker - Enhanced */}
        <Card className="bg-green-50 border-green-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BudgetIcon className="h-5 w-5 text-green-600" />
              Budget Tracker
            </CardTitle>
            <CardDescription>Current Budget Status</CardDescription>
          </CardHeader>
          <CardContent>
            {budgetCategories.length > 0 ? (
              <div className="space-y-4">
                {budgetCategories.map((budget, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium">{budget.category}</span>
                      <span className="text-muted-foreground">
                        {getCurrencySymbol()} {budget.spent.toLocaleString()} / {getCurrencySymbol()} {budget.budgeted.toLocaleString()}
                      </span>
                    </div>
                    <Progress
                      value={(budget.spent / budget.budgeted) * 100}
                      className="h-3 [&>div]:bg-green-500 bg-slate-200 border"
                    />
                    <div className="flex justify-between text-xs">
                      <span className={`${budget.spent <= budget.budgeted ? "text-green-600" : "text-red-600"
                        }`}>
                        {budget.spent <= budget.budgeted ? "On track" : "Over budget"}
                      </span>
                      <span className="text-muted-foreground">
                        {getCurrencySymbol()} {Math.max(0, budget.budgeted - budget.spent).toLocaleString()} remaining
                      </span>
                    </div>
                  </div>
                ))}

                <div className="bg-green-100 p-3 rounded-lg mt-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-1">
                      <Zap className="h-3 w-3 text-green-600" />
                      <span className="text-xs font-medium text-green-700">Budget Summary</span>
                    </div>
                    <TrendingUpDown className="h-3 w-3 text-green-500" />
                  </div>
                  <div className="text-xs text-green-700 space-y-1">
                    <div className="flex justify-between">
                      <span>Total Budget:</span>
                      <span className="font-medium">{getCurrencySymbol()} {totalBudgeted.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Total Spent:</span>
                      <span className="font-medium">{getCurrencySymbol()} {totalSpent.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Remaining:</span>
                      <span className="font-medium text-green-600">{getCurrencySymbol()} {totalRemaining.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                <Link href="budget" className="w-full">
                  <Button
                    size="sm"
                    variant="outline"
                    className="w-full bg-green-600 hover:bg-green-700 text-white hover:text-white mt-3">
                    <Plus className="h-4 w-4 mr-1" />
                    Adjust Budget
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground mb-4">No budget data available</p>

                <Link href="budget" className="w-full">
                  <Button size="sm"
                    className="bg-green-600 hover:bg-green-700">
                    <Plus className="h-4 w-4 mr-1" />
                    Create Budget

                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}