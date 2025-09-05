"use client"
//this is student dashboard
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { ExpensePieChart } from "@/components/charts/expense-pie-chart"
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
  Trophy,
  Medal,
  Crown,
  Users,
  Star,
  Gift,
  Zap,
  Calendar,
  TrendingUpDown,
  Clock,
  CheckCircle,
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
    { id: 4, type: "income", description: "Freelance Project", amount: 20000, date: "2 days ago" },
  ]

  const expenseData = [
    { name: "Food & Snacks", value: 8500, color: "#dc2626" },
    { name: "Entertainment", value: 6500, color: "#ea580c" },
    { name: "Transportation", value: 4500, color: "#d97706" },
    { name: "School Supplies", value: 5500, color: "#059669" },
    { name: "Clothes", value: 3700, color: "#2563eb" },
  ]

  const leaderboardData = [
    { rank: 1, name: "Alex Chen", savings: 95000, icon: Crown, color: "text-yellow-600" },
    { rank: 2, name: "Sarah Kim", savings: 87500, icon: Trophy, color: "text-gray-500" },
    { rank: 3, name: "You", savings: 68000, icon: Medal, color: "text-orange-600" },
  ]

  return (
    <div className="space-y-6">

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">Welcome back! Here's your financial overview.</p>
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

      {/* First Row - Recent Transactions, Money Jar, Expense Chart */}
      <div className="grid gap-6 lg:grid-cols-3">
        
        {/* Recent Transactions */}
        <Card className="">
          <CardHeader>
            <CardTitle>Recent Transactions</CardTitle>
            <CardDescription>Your latest activities</CardDescription>
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

        {/* Money Jar - Enhanced */}
        <Card className="bg-blue-50 border-blue-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Coins className="h-5 w-5 text-blue-600" />
              Money Jar - Level 3
            </CardTitle>
            <CardDescription>Your digital savings jar</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Current Jar</span>
                  <span>{getCurrencySymbol()} 68,000 / {getCurrencySymbol()} 100,000</span>
                </div>
                <Progress value={68} className="h-3 bg-slate-200 border" />
                <p className="text-xs text-blue-600 mt-1">68% complete • {getCurrencySymbol()} 32,000 to next level</p>
              </div>
              <div className="bg-blue-100 p-3 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Trophy className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-medium text-blue-800">Jar Milestones</span>
                </div>
                <div className="text-xs text-blue-700 space-y-1">
                  <div className="flex justify-between">
                    <span>✓ Level 1: {getCurrencySymbol()} 25,000</span>
                    <span className="text-green-600">Complete</span>
                  </div>
                  <div className="flex justify-between">
                    <span>✓ Level 2: {getCurrencySymbol()} 50,000</span>
                    <span className="text-green-600">Complete</span>
                  </div>
                  <div className="flex justify-between">
                    <span>○ Level 3: {getCurrencySymbol()} 100,000</span>
                    <span className="text-orange-600">In Progress</span>
                  </div>
                </div>
              </div>
              
              {/* Enhanced bottom section with icons */}
              <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1">
                    <Star className="h-3 w-3 text-blue-600" />
                    <span className="text-xs font-medium text-blue-700">Jar Rewards</span>
                  </div>
                  <Gift className="h-3 w-3 text-blue-500" />
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <Zap className="h-3 w-3 text-yellow-500" />
                    <span className="text-xs text-blue-600">Next reward at Level 4</span>
                  </div>
                  <span className="text-xs font-medium text-blue-700">Premium Badge</span>
                </div>
              </div>

              <Button size="sm" className="w-full bg-blue-600 hover:bg-blue-700">
                <Plus className="h-4 w-4 mr-1" />
                Add to Jar
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Expense Chart */}
        <Card className="h-fit">
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

      </div>

      {/* Second Row - Leaderboard (2 cols) and Goal Tracker (1 col) */}
      <div className="grid gap-6 lg:grid-cols-3">
        
        {/* Leaderboard - Takes 2 columns */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-5 w-5 text-yellow-600" />
                Savings Leaderboard
              </CardTitle>
              <CardDescription>Top savers in your friend group</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3">
                {leaderboardData.map((user) => (
                  <div
                    key={user.rank}
                    className={`flex items-center justify-between p-4 rounded-lg transition-colors border ${
                      user.name === "You" 
                        ? "bg-blue-50 border-blue-200 ring-2 ring-blue-300" 
                        : "border-gray-100 hover:bg-gray-50"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-full ${user.rank === 1 ? "bg-yellow-100" : user.rank === 2 ? "bg-gray-100" : user.rank === 3 ? "bg-orange-100" : "bg-blue-100"}`}>
                        <user.icon className={`h-4 w-4 ${user.color}`} />
                      </div>
                      <div>
                        <p className={`font-medium ${user.name === "You" ? "text-blue-800" : ""}`}>
                          #{user.rank} {user.name}
                          {user.name === "You" && <span className="text-blue-600 ml-1">(You)</span>}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Saved this month
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-green-600">
                        {getCurrencySymbol()} {user.savings.toLocaleString()}
                      </div>
                      {user.rank <= 3 && (
                        <div className="text-xs text-muted-foreground">
                          {user.rank === 1 ? "🥇 Champion" : user.rank === 2 ? "🥈 Runner-up" : "🥉 3rd Place"}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Your position:</span>
                  <span className="font-medium">3rd out of 12 friends</span>
                </div>
                <div className="flex items-center justify-between text-sm mt-1">
                  <span className="text-muted-foreground">To reach 2nd place:</span>
                  <span className="font-medium text-orange-600">{getCurrencySymbol()} 19,500 more</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Goal Tracker - Enhanced */}
        <Card className="bg-green-50 border-green-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-green-600" />
              Savings Goal Progress
            </CardTitle>
            <CardDescription>University Fund Goal</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Progress</span>
                  <span>{getCurrencySymbol()} 136,000 / {getCurrencySymbol()} 200,000</span>
                </div>
                <Progress value={68} className="h-3 bg-slate-200 border" />
                <p className="text-xs text-green-600 mt-1">68% complete • {getCurrencySymbol()} 64,000 remaining</p>
              </div>
              <div className="bg-green-100 p-3 rounded-lg">
                <div className="text-xs text-green-700 space-y-1">
                  <div className="flex justify-between">
                    <span>Monthly target:</span>
                    <span className="font-medium">{getCurrencySymbol()} 8,000</span>
                  </div>
                  <div className="flex justify-between">
                    <span>This month saved:</span>
                    <span className="font-medium text-green-600">{getCurrencySymbol()} 12,000</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Months to goal:</span>
                    <span className="font-medium">8 months</span>
                  </div>
                </div>
              </div>

              {/* Enhanced bottom section with icons */}
              <div className="bg-green-50 p-3 rounded-lg border border-green-200">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3 text-green-600" />
                    <span className="text-xs font-medium text-green-700">Goal Timeline</span>
                  </div>
                  <Clock className="h-3 w-3 text-green-500" />
                </div>
                <div className="flex justify-between items-center mb-1">
                  <div className="flex items-center gap-2">
                    <TrendingUpDown className="h-3 w-3 text-green-500" />
                    <span className="text-xs text-green-600">Ahead of schedule</span>
                  </div>
                  <CheckCircle className="h-3 w-3 text-green-600" />
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-green-600">Expected completion:</span>
                  <span className="text-xs font-medium text-green-700">June 2025</span>
                </div>
              </div>

              <Button
                size="sm"
                variant="outline"
                className="w-full border-green-300 text-green-700 hover:bg-green-100 bg-transparent"
              >
                Adjust Goal
              </Button>
            </div>
          </CardContent>
        </Card>

      </div>
    </div>
  )
}