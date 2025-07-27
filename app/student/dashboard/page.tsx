"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { ExpensePieChart } from "@/components/charts/expense-pie-chart"
import { IncomeBarChart } from "@/components/charts/income-bar-chart"
import { SimpleBarChart } from "@/components/charts/simple-bar-chart"
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Target,
  Coins,
  Plus,
  ArrowUpRight,
  ArrowDownRight,
  BookOpen,
  Award,
} from "lucide-react"
import CronInitializer from "@/components/CronInitializer"
import { useCurrency } from "@/hooks/useCurrency"

export default function StudentDashboard() {
    const { formatCurrency, getCurrencySymbol } = useCurrency();
  
  const stats = [
    {
      title: "Total Balance",
      value: "LKR 123,456",
      change: "+12.5%",
      changeType: "positive" as const,
      icon: DollarSign,
    },
    {
      title: "This Month Income",
      value: "LKR 45,000",
      change: "+8.2%",
      changeType: "positive" as const,
      icon: TrendingUp,
    },
    {
      title: "This Month Expenses",
      value: "LKR 28,743",
      change: "-5.1%",
      changeType: "negative" as const,
      icon: TrendingDown,
    },
    {
      title: "Savings Goal",
      value: "68%",
      change: "Target: LKR 200,000",
      changeType: "neutral" as const,
      icon: Target,
    },
  ]

  const recentTransactions = [
    { id: 1, type: "income", description: "Monthly Allowance", amount: 5000, date: "Today" },
    { id: 2, type: "expense", description: "Lunch at Cafeteria", amount: -1250, date: "Today" },
    { id: 3, type: "expense", description: "Movie Ticket", amount: -1500, date: "Yesterday" },
    { id: 4, type: "income", description: "Part-time Job", amount: 12000, date: "2 days ago" },
    { id: 5, type: "expense", description: "Bus Fare", amount: -200, date: "2 days ago" },
  ]

  const expenseData = [
    { name: "Food & Snacks", value: 8500, color: "#dc2626" },
    { name: "Entertainment", value: 6500, color: "#ea580c" },
    { name: "Transportation", value: 4500, color: "#d97706" },
    { name: "School Supplies", value: 5500, color: "#059669" },
    { name: "Clothes", value: 3700, color: "#2563eb" },
  ]

  const incomeData = [
    { name: "Allowance", amount: 20000 },
    { name: "Part-time Job", amount: 18000 },
    { name: "Gifts", amount: 5000 },
    { name: "Chores", amount: 2000 },
  ]

  const weeklySpendingData = [
    { name: "Mon", value: 2500, color: "#2563eb" },
    { name: "Tue", value: 1800, color: "#2563eb" },
    { name: "Wed", value: 3200, color: "#2563eb" },
    { name: "Thu", value: 2100, color: "#2563eb" },
    { name: "Fri", value: 4500, color: "#dc2626" },
    { name: "Sat", value: 6800, color: "#dc2626" },
    { name: "Sun", value: 3100, color: "#059669" },
  ]

  return (
    <div className="space-y-6">

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">Welcome back! Here's your financial overview.</p>
        </div>
        <div className="flex gap-2">
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
                      <p className="font-medium">{transaction.description}</p>
                      <p className="text-sm text-muted-foreground">{transaction.date}</p>
                    </div>
                  </div>
                  <div className={`font-semibold ${transaction.type === "income" ? "text-green-600" : "text-red-600"}`}>
                    {transaction.type === "income" ? "+" : ""}{getCurrencySymbol()} {Math.abs(transaction.amount).toLocaleString()}
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
                <Coins className="h-5 w-5 text-blue-600" />
                Money Jar - Level 2
              </CardTitle>
              <CardDescription>Your digital savings jar</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Saved</span>
                    <span>{getCurrencySymbol()} 34,000 / {getCurrencySymbol()} 50,000</span>
                  </div>
                  <Progress value={68} className="h-3" />
                </div>
                <Button size="sm" className="w-full bg-blue-600 hover:bg-blue-700">
                  Add to Jar
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-green-50 border-green-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-green-600" />
                Smart Money Tip
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-green-800 mb-3">
                Try the 50/30/20 rule: 50% for needs, 30% for wants, and 20% for savings!
              </p>
              <Button
                size="sm"
                variant="outline"
                className="w-full border-green-300 text-green-700 hover:bg-green-100 bg-transparent"
              >
                Learn More
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-orange-50 border-orange-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5 text-orange-600" />
                Achievement
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-orange-800 mb-2">🎉 Saved for 7 days straight!</p>
              <p className="text-xs text-orange-600">Keep up the great work!</p>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Where Your Money Goes</CardTitle>
            <CardDescription>Monthly expense breakdown</CardDescription>
          </CardHeader>
          <CardContent>
            <ExpensePieChart data={expenseData} />
            <div className="mt-4 text-center">
              <p className="text-sm text-muted-foreground">
                Total Expenses:{" "}
                <span className="font-semibold text-red-600">
                  {getCurrencySymbol()}{expenseData.reduce((sum, item) => sum + item.value, 0).toLocaleString()}
                </span>
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Income Sources</CardTitle>
            <CardDescription>Where your money comes from</CardDescription>
          </CardHeader>
          <CardContent>
            <IncomeBarChart data={incomeData} />
            <div className="mt-4 text-center">
              <p className="text-sm text-muted-foreground">
                Total Income:{" "}
                <span className="font-semibold text-green-600">
                  {getCurrencySymbol()}{incomeData.reduce((sum, item) => sum + item.amount, 0).toLocaleString()}
                </span>
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Weekly Spending</CardTitle>
            <CardDescription>Your spending pattern this week</CardDescription>
          </CardHeader>
          <CardContent>
            <SimpleBarChart data={weeklySpendingData} />
            <div className="mt-4 text-center">
              <p className="text-sm text-muted-foreground">
                This Week:{" "}
                <span className="font-semibold text-blue-600">
                  {getCurrencySymbol()}{weeklySpendingData.reduce((sum, item) => sum + item.value, 0).toLocaleString()}
                </span>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
