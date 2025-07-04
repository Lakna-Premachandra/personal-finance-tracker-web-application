"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  PiggyBank,
  Plus,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  Target,
  Lightbulb,
  Trophy,
  Calendar,
} from "lucide-react"

export default function StudentBudgetPage() {
  const [selectedMonth, setSelectedMonth] = useState("January 2024")

  // Mock budget data for students
  const monthlyBudget = 25000 // LKR 25,000 monthly budget
  const totalSpent = 18500
  const remainingBudget = monthlyBudget - totalSpent

  const categories = [
    {
      id: 1,
      name: "Food & Dining",
      budgeted: 8000,
      spent: 6500,
      icon: "🍕",
      color: "success",
      tips: "Great job staying under budget! Try cooking more meals at home to save even more.",
    },
    {
      id: 2,
      name: "Transportation",
      budgeted: 4000,
      spent: 3200,
      icon: "🚌",
      color: "success",
      tips: "Consider walking or cycling for short distances to save money and stay healthy!",
    },
    {
      id: 3,
      name: "Entertainment",
      budgeted: 3000,
      spent: 3400,
      icon: "🎬",
      color: "warning",
      tips: "You're slightly over budget. Look for free campus events or student discounts!",
    },
    {
      id: 4,
      name: "School Supplies",
      budgeted: 5000,
      spent: 2800,
      icon: "📚",
      color: "success",
      tips: "Excellent! Consider buying used textbooks or sharing with classmates.",
    },
    {
      id: 5,
      name: "Personal Care",
      budgeted: 2500,
      spent: 1600,
      icon: "🧴",
      color: "success",
      tips: "Well managed! Look for student discounts at local stores.",
    },
    {
      id: 6,
      name: "Miscellaneous",
      budgeted: 2500,
      spent: 1000,
      icon: "🛍️",
      color: "success",
      tips: "Great control on miscellaneous spending! Keep it up!",
    },
  ]

  // Monthly Challenge
  const monthlyChallenge = {
    title: "No-Spend Weekend Challenge",
    description: "Try to spend LKR 0 on entertainment this weekend",
    progress: 60,
    reward: "LKR 500 bonus to next month's entertainment budget",
    daysLeft: 3,
  }

  // Smart Money Tips
  const smartTips = [
    {
      icon: "💡",
      title: "Student Discount Alert",
      description: "Many restaurants offer 10-20% student discounts. Always ask!",
    },
    {
      icon: "🎯",
      title: "Weekly Budget Check",
      description: "Review your spending every Sunday to stay on track.",
    },
    {
      icon: "📱",
      title: "Free Entertainment",
      description: "Check your campus events calendar for free movies and activities.",
    },
  ]

  const getColorClass = (color: string) => {
    switch (color) {
      case "success":
        return "text-success-600 bg-success-50 border-success-200"
      case "warning":
        return "text-warning-600 bg-warning-50 border-warning-200"
      case "danger":
        return "text-danger-600 bg-danger-50 border-danger-200"
      default:
        return "text-secondary-600 bg-secondary-50 border-secondary-200"
    }
  }

  const getProgressColor = (percentage: number) => {
    if (percentage <= 75) return "bg-success-500"
    if (percentage <= 90) return "bg-warning-500"
    return "bg-danger-500"
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            Student Budget
          </h1>
          <p className="text-muted-foreground">Simple budgeting to build good money habits</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="text-sm">
            {selectedMonth}
          </Badge>
          <Dialog>
            <DialogTrigger asChild>
              <Button className="bg-primary hover:bg-primary-700 text-white">
                <Plus className="mr-2 h-4 w-4" />
                Add Expense
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Expense</DialogTitle>
                <DialogDescription>Record a new expense to track your spending</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="amount">Amount (LKR)</Label>
                  <Input id="amount" type="number" placeholder="1500" />
                </div>
                <div>
                  <Label htmlFor="category">Category</Label>
                  <select className="w-full p-2 border rounded-md">
                    <option>Food & Dining</option>
                    <option>Transportation</option>
                    <option>Entertainment</option>
                    <option>School Supplies</option>
                    <option>Personal Care</option>
                    <option>Miscellaneous</option>
                  </select>
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Input id="description" placeholder="Lunch at campus cafeteria" />
                </div>
                <Button className="w-full bg-primary hover:bg-primary-700 text-white">Add Expense</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Budget Overview */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="card-primary">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Budget</CardTitle>
            <Target className="h-4 w-4 text-primary-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary-700">LKR {monthlyBudget.toLocaleString()}</div>
            <p className="text-xs text-primary-600">Total allocated</p>
          </CardContent>
        </Card>

        <Card className="card-warning">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
            <TrendingDown className="h-4 w-4 text-warning-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-warning-700">LKR {totalSpent.toLocaleString()}</div>
            <p className="text-xs text-warning-600">{Math.round((totalSpent / monthlyBudget) * 100)}% of budget used</p>
          </CardContent>
        </Card>

        <Card className="card-success">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Remaining</CardTitle>
            <TrendingUp className="h-4 w-4 text-success-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success-700">LKR {remainingBudget.toLocaleString()}</div>
            <p className="text-xs text-success-600">Available to spend</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="categories" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="categories">Budget Categories</TabsTrigger>
          <TabsTrigger value="tips">Smart Tips</TabsTrigger>
        </TabsList>

        <TabsContent value="categories" className="space-y-4">
          <div className="grid gap-4">
            {categories.map((category) => {
              const percentage = (category.spent / category.budgeted) * 100
              const isOverBudget = category.spent > category.budgeted

              return (
                <Card key={category.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{category.icon}</span>
                        <div>
                          <h3 className="font-semibold">{category.name}</h3>
                          <p className="text-sm text-muted-foreground">
                            LKR {category.spent.toLocaleString()} / LKR {category.budgeted.toLocaleString()}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge
                          variant={isOverBudget ? "destructive" : "secondary"}
                          className={!isOverBudget ? getColorClass(category.color) : ""}
                        >
                          {isOverBudget ? "Over Budget" : "On Track"}
                        </Badge>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Progress value={Math.min(percentage, 100)} className="h-2" />
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>{Math.round(percentage)}% used</span>
                        <span>LKR {Math.max(0, category.budgeted - category.spent).toLocaleString()} left</span>
                      </div>
                    </div>

                    {/* Smart Tip */}
                    <div className="mt-3 p-3 bg-secondary-50 rounded-lg">
                      <div className="flex items-start gap-2">
                        <Lightbulb className="h-4 w-4 text-warning-500 mt-0.5 flex-shrink-0" />
                        <p className="text-sm text-secondary-700">{category.tips}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </TabsContent>

        <TabsContent value="challenge" className="space-y-4">
          <Card className="card-warning">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-5 w-5 text-warning-500" />
                {monthlyChallenge.title}
              </CardTitle>
              <CardDescription>{monthlyChallenge.description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Challenge Progress</span>
                  <span>{monthlyChallenge.progress}% Complete</span>
                </div>
                <Progress value={monthlyChallenge.progress} className="h-3" />
              </div>

              <div className="flex items-center justify-between p-3 bg-warning-50 rounded-lg">
                <div>
                  <p className="font-medium text-warning-700">Reward</p>
                  <p className="text-sm text-warning-600">{monthlyChallenge.reward}</p>
                </div>
                <Badge className="bg-warning text-white">{monthlyChallenge.daysLeft} days left</Badge>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-success-50 rounded-lg">
                  <div className="text-lg font-bold text-success-700">2</div>
                  <div className="text-xs text-success-600">Days Completed</div>
                </div>
                <div className="text-center p-3 bg-primary-50 rounded-lg">
                  <div className="text-lg font-bold text-primary-700">LKR 0</div>
                  <div className="text-xs text-primary-600">Spent This Weekend</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tips" className="space-y-4">
          <div className="grid gap-4">
            {smartTips.map((tip, index) => (
              <Card key={index} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">{tip.icon}</span>
                    <div>
                      <h3 className="font-semibold mb-1">{tip.title}</h3>
                      <p className="text-sm text-muted-foreground">{tip.description}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Weekly Budget Tip */}
          <Card className="card-primary">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary" />
                This Week's Focus
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-3">
                You're doing great with your budget! Here's what to focus on this week:
              </p>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-success-500" />
                  <span className="text-sm">Track daily expenses in real-time</span>
                </div>
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-warning-500" />
                  <span className="text-sm">Watch entertainment spending - you're close to the limit</span>
                </div>
                <div className="flex items-center gap-2">
                  <Target className="h-4 w-4 text-primary" />
                  <span className="text-sm">Try to save LKR 1,000 from your remaining budget</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
