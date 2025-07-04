"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { AdvancedPieChart } from "@/components/charts/advanced-pie-chart"
import { SpendingTrendChart } from "@/components/charts/spending-trend-chart"
import { SimpleBarChart } from "@/components/charts/simple-bar-chart"
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Target,
  CreditCard,
  Plus,
  ArrowUpRight,
  ArrowDownRight,
  BarChart3,
  PieChart,
  Activity,
  Briefcase,
} from "lucide-react"

export default function YoungAdultDashboard() {
  const stats = [
    {
      title: "Total Balance",
      value: "LKR 345,678",
      change: "+15.2%",
      changeType: "positive" as const,
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
      changeType: "neutral" as const,
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
    { name: "Entertainment", value: 15000, color: "#7c3aed" },
    { name: "Healthcare", value: 12000, color: "#db2777" },
    { name: "Shopping", value: 20000, color: "#0891b2" },
  ]

  const investmentData = [
    { name: "Stocks", value: 850000, color: "#2563eb" },
    { name: "Bonds", value: 320000, color: "#059669" },
    { name: "ETFs", value: 480000, color: "#d97706" },
    { name: "Crypto", value: 120000, color: "#7c3aed" },
    { name: "Real Estate", value: 250000, color: "#dc2626" },
    { name: "Cash", value: 180000, color: "#64748b" },
  ]

  const trendData = [
    { month: "Jul", income: 210000, expenses: 165000, savings: 45000 },
    { month: "Aug", income: 215000, expenses: 168000, savings: 47000 },
    { month: "Sep", income: 220000, expenses: 172000, savings: 48000 },
    { month: "Oct", income: 215000, expenses: 165000, savings: 50000 },
    { month: "Nov", income: 230000, expenses: 175000, savings: 55000 },
    { month: "Dec", income: 215000, expenses: 168743, savings: 46257 },
  ]

  const categoryComparisonData = [
    { name: "Housing", value: 120000, color: "#dc2626" },
    { name: "Transport", value: 35000, color: "#ea580c" },
    { name: "Food", value: 28000, color: "#d97706" },
    { name: "Utilities", value: 18000, color: "#059669" },
    { name: "Insurance", value: 22000, color: "#2563eb" },
    { name: "Other", value: 47000, color: "#64748b" },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">Welcome back! Here's your comprehensive financial overview.</p>
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" className="border-blue-200 text-blue-700 hover:bg-blue-50 bg-transparent">
            <BarChart3 className="h-4 w-4 mr-2" />
            Analytics
          </Button>
          <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
            <Plus className="h-4 w-4 mr-2" />
            Add Transaction
          </Button>
        </div>
      </div>

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
                className={`text-xs flex items-center gap-1 ${
                  stat.changeType === "positive"
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

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        <Card className="lg:col-span-4">
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
                      className={`p-2 rounded-full ${
                        transaction.type === "income" ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600"
                      }`}
                    >
                      {transaction.type === "income" ? (
                        <ArrowUpRight className="h-4 w-4" />
                      ) : (
                        <ArrowDownRight className="h-4 w-4" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium">{transaction.description}</p>
                      <p className="text-sm text-muted-foreground">{transaction.date}</p>
                    </div>
                  </div>
                  <div className={`font-semibold ${transaction.type === "income" ? "text-green-600" : "text-red-600"}`}>
                    {transaction.type === "income" ? "+" : ""}LKR {Math.abs(transaction.amount).toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="lg:col-span-3 space-y-6">
          <Card className="bg-blue-50 border-blue-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-blue-600" />
                Credit Score
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="text-3xl font-bold text-blue-600">742</div>
                <div className="text-sm text-blue-800">Excellent Credit</div>
                <Progress value={85} className="h-2" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-green-50 border-green-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-green-600" />
                Portfolio Performance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-green-800">Total Value</span>
                  <span className="font-semibold text-green-800">LKR 2,200,000</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-green-800">Monthly Return</span>
                  <span className="font-semibold text-green-600">+8.5%</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-orange-50 border-orange-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Briefcase className="h-5 w-5 text-orange-600" />
                Career Growth
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-orange-800 mb-2">💼 Income increased 15% this year</p>
              <p className="text-xs text-orange-600">Consider increasing savings rate</p>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="h-5 w-5" />
              Monthly Expense Breakdown
            </CardTitle>
            <CardDescription>Detailed analysis of your spending patterns</CardDescription>
          </CardHeader>
          <CardContent>
            <AdvancedPieChart
              data={expenseData}
              centerText={{
                value: `LKR ${expenseData.reduce((sum, item) => sum + item.value, 0).toLocaleString()}`,
                label: "Total Expenses",
              }}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Investment Portfolio
            </CardTitle>
            <CardDescription>Your investment allocation and performance</CardDescription>
          </CardHeader>
          <CardContent>
            <AdvancedPieChart
              data={investmentData}
              centerText={{
                value: `LKR ${investmentData.reduce((sum, item) => sum + item.value, 0).toLocaleString()}`,
                label: "Total Portfolio",
              }}
            />
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Financial Trends
            </CardTitle>
            <CardDescription>6-month overview of income, expenses, and savings</CardDescription>
          </CardHeader>
          <CardContent>
            <SpendingTrendChart data={trendData} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Category Spending</CardTitle>
            <CardDescription>Monthly spending by category</CardDescription>
          </CardHeader>
          <CardContent>
            <SimpleBarChart data={categoryComparisonData} color="#2563eb" />
            <div className="mt-4 text-center">
              <p className="text-sm text-muted-foreground">
                Total:{" "}
                <span className="font-semibold text-blue-600">
                  LKR {categoryComparisonData.reduce((sum, item) => sum + item.value, 0).toLocaleString()}
                </span>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
