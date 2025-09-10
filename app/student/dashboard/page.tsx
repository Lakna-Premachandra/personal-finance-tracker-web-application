"use client"
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
  Loader2,
  PiggyBank,
} from "lucide-react"
import CronInitializer from "@/components/CronInitializer"
import { useCurrency } from "@/hooks/useCurrency"
import { useGetStudentDashboardQuery } from "@/services/controllers/dashBoardController"
import Link from "next/link"

export default function StudentDashboard() {
  const { formatCurrency, getCurrencySymbol } = useCurrency()
  const { data: dashboardData, isLoading, error } = useGetStudentDashboardQuery()

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

  const { summary, recentTransactions, jarDetails, expenseBreakdown, leaderboard, goalProgress } = dashboardData.data

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
      title: "This Month Income",
      value: `${getCurrencySymbol()} ${summary.monthlyIncome.toLocaleString()}`,
      change: `${summary.incomeChangePercentage >= 0 ? '+' : ''}${summary.incomeChangePercentage.toFixed(1)}%`,
      changeType: summary.incomeChangePercentage >= 0 ? "positive" as const : "negative" as const,
      icon: TrendingUp,
      color: "text-orange-600", // 🟠 Orange
    },
    {
      title: "This Month Expenses",
      value: `${getCurrencySymbol()} ${summary.monthlyExpenses.toLocaleString()}`,
      change: `${summary.expenseChangePercentage >= 0 ? '+' : ''}${summary.expenseChangePercentage.toFixed(1)}%`,
      changeType: summary.expenseChangePercentage <= 0 ? "negative" as const : "positive" as const,
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
  const transformedTransactions = recentTransactions.slice(0, 4).map((transaction, index) => ({
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

  // Transform leaderboard data
  const leaderboardIcons = [Crown, Trophy, Medal, Award]
  const leaderboardColors = ["text-yellow-600", "text-gray-500", "text-orange-600", "text-blue-600"]

  const transformedLeaderboard = leaderboard.topUsers.slice(0, 3).map((user, index) => ({
    rank: user.rank,
    name: user.username,
    savings: user.score , // Converting score to savings amount for display
    icon: leaderboardIcons[index] || Award,
    color: leaderboardColors[index] || "text-blue-600"
  }))

  // Add current user to leaderboard if not in top 3
  if (leaderboard.currentUser.rank > 3) {
    transformedLeaderboard.push({
      rank: leaderboard.currentUser.rank,
      name: "You",
      savings: leaderboard.currentUser.score * 1000,
      icon: Medal,
      color: "text-orange-600"
    })
  } else {
    // Replace the user in top 3 with "You" label
    const userIndex = transformedLeaderboard.findIndex(user => user.rank === leaderboard.currentUser.rank)
    if (userIndex !== -1) {
      transformedLeaderboard[userIndex].name = "You"
    }
  }

  // Get current jar details
  const currentJar = jarDetails.currentJar
  const milestones = jarDetails.milestones





  // Get current goal progress
  const currentGoal = goalProgress[0] // Assuming first goal is the main one

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
              <CardTitle className={`text-sm font-medium ${stat.color}`}>
                {stat.title}
              </CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
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

        {currentJar === null ? <Card className="bg-blue-50 border-blue-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Coins className="h-5 w-5 text-blue-600" />
              Money Jar - Level 1
            </CardTitle>
            <CardDescription>Your digital savings jar</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Current Jar</span>
                  <span>{getCurrencySymbol()} {0} / {getCurrencySymbol()} {5000}</span>
                </div>
                <Progress value={0} className="h-3 bg-slate-200 border" />
                <p className="text-xs text-blue-600 mt-1">
                  {0}% complete • {getCurrencySymbol()} {5000} to next level
                </p>
              </div>
              <div className="bg-blue-100 p-3 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Trophy className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-medium text-blue-800">Jar Milestones</span>
                </div>
                <div className="text-xs text-blue-700 space-y-1">

                  <div className="flex justify-between">
                    <span>
                      {"○"} Level {1}: {getCurrencySymbol()} {5000}
                    </span>
                    <span className={"text-orange-600"}>
                      In Progress
                    </span>
                  </div>
                </div>
              </div>

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
                    <span className="text-xs text-blue-600">Next reward at Level {2}</span>
                  </div>
                  <span className="text-xs font-medium text-blue-700">Premium Badge</span>
                </div>
              </div>

              <Link href="money-jar" className="w-full">
                <Button
                  size="sm" className="w-full bg-blue-600 hover:bg-blue-700 mt-3">
                  <Plus className="h-4 w-4 mr-1" />
                  Add to Jar

                </Button>
              </Link>
            </div>
          </CardContent>
        </Card> : (
          <Card className="bg-blue-50 border-blue-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Coins className="h-5 w-5 text-blue-600" />
                Money Jar - Level {currentJar?.level}
              </CardTitle>
              <CardDescription>Your digital savings jar</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Current Jar</span>
                    <span>{getCurrencySymbol()} {currentJar?.currentAmount.toLocaleString()} / {getCurrencySymbol()} {currentJar?.targetAmount.toLocaleString()}</span>
                  </div>
                  <Progress value={currentJar?.completionPercentage} className="h-3 bg-slate-200 border" />
                  <p className="text-xs text-blue-600 mt-1">
                    {currentJar?.completionPercentage}% complete • {getCurrencySymbol()} {currentJar?.amountToNextLevel.toLocaleString()} to next level
                  </p>
                </div>
                <div className="bg-blue-100 p-3 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Trophy className="h-4 w-4 text-blue-600" />
                    <span className="text-sm font-medium text-blue-800">Jar Milestones</span>
                  </div>
                  <div className="text-xs text-blue-700 space-y-1">
                    {milestones.map((milestone) => (
                      <div key={milestone.level} className="flex justify-between">
                        <span>
                          {milestone.status === "Completed" ? "✓" : "○"} Level {milestone.level}: {getCurrencySymbol()} {milestone.targetAmount.toLocaleString()}
                        </span>
                        <span className={milestone.status === "Completed" ? "text-green-600" : milestone.status === "Active" ? "text-orange-600" : "text-gray-500"}>
                          {milestone.status === "Completed" ? "Complete" : milestone.status === "Active" ? "In Progress" : "Locked"}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

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
                      <span className="text-xs text-blue-600">Next reward at Level {currentJar?.level! + 1}</span>
                    </div>
                    <span className="text-xs font-medium text-blue-700">Premium Badge</span>
                  </div>
                </div>

                <Link href="money-jar" className="w-full">
                  <Button
                    size="sm" className="w-full bg-blue-600 hover:bg-blue-700 mt-3">
                    <Plus className="h-4 w-4 mr-1" />
                    Add to Jar

                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        )}



        {/* Expense Chart */}
        <Card className="h-fit">
          <CardHeader>
            <CardTitle>Where Your Money Goes</CardTitle>
            <CardDescription>Monthly expense breakdown</CardDescription>
          </CardHeader>
          <CardContent>
            {expenseData.length > 0 ? (
              <>
                <ExpensePieChart data={expenseData} />
                <div className="mt-4 text-center">
                  <p className="text-sm text-muted-foreground">
                    Total Expenses:{" "}
                    <span className="font-semibold text-red-600">
                      {getCurrencySymbol()}{expenseData.reduce((sum, item) => sum + item.value, 0).toLocaleString()}
                    </span>
                  </p>
                </div>
              </>
            ) : (
              <p className="text-center text-muted-foreground py-8">No expense data available</p>
            )}
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
                {transformedLeaderboard.map((user) => (
                  <div
                    key={user.rank}
                    className={`flex items-center justify-between p-4 rounded-lg transition-colors border ${user.name === "You"
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
                      <div className="font-semibold text-blue-600">
                         {user.savings.toLocaleString()} <span className="text-xs text-slate-500 font-medium">points</span>
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
                  <span className="font-medium">{leaderboard.currentUser.rank}{leaderboard.currentUser.rank === 1 ? 'st' : leaderboard.currentUser.rank === 2 ? 'nd' : leaderboard.currentUser.rank === 3 ? 'rd' : 'th'} out of {leaderboard.currentUser.totalParticipants} students</span>
                </div>
                {leaderboard.currentUser.rank > 1 && (
                  <div className="flex items-center justify-between text-sm mt-1">
                    <span className="text-muted-foreground">To reach {leaderboard.currentUser.rank === 2 ? '1st' : leaderboard.currentUser.rank === 3 ? '2nd' : '3rd'} place:</span>
                    <span className="font-medium text-orange-600">Keep saving!</span>
                  </div>
                )}
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
            <CardDescription>{currentGoal?.title || "Savings Goal"}</CardDescription>
          </CardHeader>
          <CardContent>
            {currentGoal ? (
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Progress</span>
                    <span>{getCurrencySymbol()} {currentGoal.currentAmount.toLocaleString()} / {getCurrencySymbol()} {currentGoal.targetAmount.toLocaleString()}</span>
                  </div>
                  <Progress value={currentGoal.completionPercentage} className="h-3 [&>div]:bg-green-500 bg-slate-200 border" />
                  <p className="text-xs text-green-600 mt-1">
                    {currentGoal.completionPercentage}% complete • {getCurrencySymbol()} {(currentGoal.targetAmount - currentGoal.currentAmount).toLocaleString()} remaining
                  </p>
                </div>
                <div className="bg-green-100 p-3 rounded-lg">
                  <div className="text-xs text-green-700 space-y-1">
                    <div className="flex justify-between">
                      <span>Daily target:</span>
                      <span className="font-medium">{getCurrencySymbol()} {currentGoal.dailyTargetAmount.toFixed(0)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Days remaining:</span>
                      <span className="font-medium">{currentGoal.daysLeft} days</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Timeline status:</span>
                      <span className="font-medium text-green-600">{currentGoal.timelineStatus}</span>
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
                      <span className="text-xs text-green-600">{currentGoal.timelineStatus}</span>
                    </div>
                    <CheckCircle className="h-3 w-3 text-green-600" />
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-green-600">Target date:</span>
                    <span className="text-xs font-medium text-green-700">
                      {new Date(currentGoal.targetDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                    </span>
                  </div>
                </div>


                <Link href="goals" className="w-full">
                  <Button
                    size="sm"
                    variant="outline"
                    className="w-full bg-green-600 hover:bg-green-700 text-white hover:text-white mt-3">
                    <Plus className="h-4 w-4 mr-1" />
                    Adjust Goal
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground mb-4">No active goals</p>

                <Link href="goals" className="w-full">
                  <Button
                    size="sm"
                    className="bg-green-600 hover:bg-green-700">
                    <Plus className="h-4 w-4 mr-1" />
                    Create Goal


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