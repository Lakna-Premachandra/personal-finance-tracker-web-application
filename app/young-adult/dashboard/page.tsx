"use client"
//this is young adult dashboard - modified layout
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
} from "lucide-react"
import { useCurrency } from "@/hooks/useCurrency"
import { Cell, Legend, Pie, PieChart, Tooltip } from "recharts"

export default function YoungAdultDashboard() {
  const { formatCurrency, getCurrencySymbol } = useCurrency();

  const stats = [
    {
      title: "Total Balance",
      value: "LKR 345,678",
      change: "+15.2%",
      changeType: "positive" as "positive" | "negative" | "neutral",
      icon: DollarSign,
    },
    {
      title: "Monthly Income",
      value: "LKR 215,000",
      change: "+5.4%",
      changeType: "positive" as const,
      icon: TrendingUp,
    },
    {
      title: "Monthly Expenses",
      value: "LKR 168,743",
      change: "+2.1%",
      changeType: "positive" as const,
      icon: TrendingDown,
    },
    {
      title: "Savings Goal",
      value: "45%",
      change: "Target: LKR 1,000,000",
      changeType: "neutral" as "positive" | "negative" | "neutral",
      icon: Target,
    },
  ]

  const recentTransactions = [
    { id: 1, type: "income", description: "Monthly Salary", amount: 215000, date: "Today" },
    { id: 2, type: "expense", description: "Rent Payment", amount: -80000, date: "Today" },
    { id: 3, type: "expense", description: "Grocery Shopping", amount: -12550, date: "Yesterday" },
    { id: 4, type: "expense", description: "Fuel", amount: -4500, date: "2 days ago" },
    { id: 5, type: "income", description: "Freelance Project", amount: 25000, date: "3 days ago" },
  ]

  const expenseData = [
    { name: "Housing & Rent", value: 120000, color: "#dc2626" },
    { name: "Transportation", value: 35000, color: "#ea580c" },
    { name: "Food & Dining", value: 28000, color: "#d97706" },
    { name: "Utilities", value: 18000, color: "#059669" },
    { name: "Insurance", value: 22000, color: "#2563eb" },
  ]

  const trendData = [
    { month: "Jul", income: 210000, expenses: 165000, savings: 45000 },
    { month: "Aug", income: 215000, expenses: 168000, savings: 47000 },
    { month: "Sep", income: 220000, expenses: 172000, savings: 48000 },
    { month: "Oct", income: 215000, expenses: 165000, savings: 50000 },
    { month: "Nov", income: 230000, expenses: 175000, savings: 55000 },
    { month: "Dec", income: 215000, expenses: 168743, savings: 46257 },
  ]

  const paymentReminders = [
    { id: 1, title: "Rent Payment", amount: 80000, dueDate: "Dec 31", status: "due", priority: "high" },
    { id: 2, title: "Credit Card Bill", amount: 45000, dueDate: "Jan 5", status: "upcoming", priority: "medium" },
    { id: 3, title: "Insurance Premium", amount: 22000, dueDate: "Jan 10", status: "upcoming", priority: "medium" },
    { id: 4, title: "Utility Bills", amount: 18000, dueDate: "Jan 15", status: "scheduled", priority: "low" },
  ]

  const budgetCategories = [
    { category: "Housing", budgeted: 85000, spent: 80000, color: "bg-red-500" },
    { category: "Food", budgeted: 30000, spent: 28000, color: "bg-orange-500" },
    { category: "Transport", budgeted: 40000, spent: 35000, color: "bg-yellow-500" },
  ]

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
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
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
              {recentTransactions.map((transaction) => (
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
              ))}
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
              {paymentReminders.map((payment) => (
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
              ))}
            </div>
            <Button size="sm" className="w-full mt-4 bg-orange-600 hover:bg-orange-700">
              <Plus className="h-4 w-4 mr-1" />
              Add Reminder
            </Button>
          </CardContent>
        </Card>

        {/* Expense Chart */}
        <Card className="">
          <CardHeader className=" pb-0 mb-0">
            <CardTitle>Monthly Expenses</CardTitle>
            <CardDescription>Detailed spending breakdown</CardDescription>
          </CardHeader>
          <CardContent>
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
              <CardDescription>6-month overview of income, expenses, and savings</CardDescription>
            </CardHeader>
            <CardContent>
              <SpendingTrendChart data={trendData} />
              <div className="mt-4 grid grid-cols-3 gap-4 text-center">
                <div className="p-3 bg-green-50 rounded-lg">
                  <div className="text-sm text-green-700">Avg. Income</div>
                  <div className="font-semibold text-green-800">
                    {getCurrencySymbol()} {Math.round(trendData.reduce((sum, item) => sum + item.income, 0) / trendData.length).toLocaleString()}
                  </div>
                </div>
                <div className="p-3 bg-red-50 rounded-lg">
                  <div className="text-sm text-red-700">Avg. Expenses</div>
                  <div className="font-semibold text-red-800">
                    {getCurrencySymbol()} {Math.round(trendData.reduce((sum, item) => sum + item.expenses, 0) / trendData.length).toLocaleString()}
                  </div>
                </div>
                <div className="p-3 bg-blue-50 rounded-lg">
                  <div className="text-sm text-blue-700">Avg. Savings</div>
                  <div className="font-semibold text-blue-800">
                    {getCurrencySymbol()} {Math.round(trendData.reduce((sum, item) => sum + item.savings, 0) / trendData.length).toLocaleString()}
                  </div>
                </div>
              </div>
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
            <CardDescription>December 2024 Budget</CardDescription>
          </CardHeader>
          <CardContent>
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
                    className="h-2"
                  />
                  <div className="flex justify-between text-xs">
                    <span className={`${budget.spent <= budget.budgeted ? "text-green-600" : "text-red-600"
                      }`}>
                      {budget.spent <= budget.budgeted ? "On track" : "Over budget"}
                    </span>
                    <span className="text-muted-foreground">
                      {getCurrencySymbol()} {(budget.budgeted - budget.spent).toLocaleString()} remaining
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
                    <span className="font-medium">{getCurrencySymbol()} 190,000</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Total Spent:</span>
                    <span className="font-medium">{getCurrencySymbol()} 170,000</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Remaining:</span>
                    <span className="font-medium text-green-600">{getCurrencySymbol()} 20,000</span>
                  </div>
                </div>
              </div>

              <Button
                size="sm"
                variant="outline"
                className="w-full border-green-300 text-green-700 hover:bg-green-100 bg-transparent"
              >
                Adjust Budget
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}