"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Plus, Target, Calendar, DollarSign, TrendingUp, Edit, Trash2, CheckCircle } from "lucide-react"
import { useCurrency } from "@/hooks/useCurrency"

export default function GoalsPage() {
      const { formatCurrency, getCurrencySymbol } = useCurrency();

  const [newGoal, setNewGoal] = useState({
    title: "",
    targetAmount: "",
    currentAmount: "",
    deadline: "",
    category: "",
  })

  const goals = [
    {
      id: 1,
      title: "Emergency Fund",
      description: "Build a safety net for unexpected expenses",
      targetAmount: 500,
      currentAmount: 180,
      deadline: "2024-06-01",
      category: "Savings",
      priority: "high",
      status: "active",
    },
    {
      id: 2,
      title: "New Laptop",
      description: "Save for a gaming laptop for school and entertainment",
      targetAmount: 1200,
      currentAmount: 340,
      deadline: "2024-08-15",
      category: "Technology",
      priority: "medium",
      status: "active",
    },
    {
      id: 3,
      title: "Summer Trip",
      description: "Family vacation to the beach",
      targetAmount: 800,
      currentAmount: 650,
      deadline: "2024-07-01",
      category: "Travel",
      priority: "high",
      status: "active",
    },
    {
      id: 4,
      title: "New Phone",
      description: "Upgrade to latest iPhone",
      targetAmount: 600,
      currentAmount: 600,
      deadline: "2024-03-01",
      category: "Technology",
      priority: "low",
      status: "completed",
      completedDate: "2024-02-28",
    },
    {
      id: 5,
      title: "School Supplies",
      description: "Books and stationery for new semester",
      targetAmount: 300,
      currentAmount: 300,
      deadline: "2024-01-15",
      category: "Education",
      priority: "high",
      status: "completed",
      completedDate: "2024-01-10",
    },
  ]

  const activeGoals = goals.filter((goal) => goal.status === "active")
  const completedGoals = goals.filter((goal) => goal.status === "completed")
  const totalTargetAmount = activeGoals.reduce((sum, goal) => sum + goal.targetAmount, 0)
  const totalCurrentAmount = activeGoals.reduce((sum, goal) => sum + goal.currentAmount, 0)
  

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-700 border-red-200"
      case "medium":
        return "bg-yellow-100 text-yellow-700 border-yellow-200"
      case "low":
        return "bg-green-100 text-green-700 border-green-200"
      default:
        return "bg-gray-100 text-gray-700 border-gray-200"
    }
  }

  const getDaysLeft = (deadline: string) => {
    const today = new Date()
    const deadlineDate = new Date(deadline)
    const diffTime = deadlineDate.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">Financial Goals</h1>
          <p className="text-muted-foreground">Set and track your savings goals to achieve your dreams</p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700 text-white">
              <Plus className="mr-2 h-4 w-4" />
              Add New Goal
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Goal</DialogTitle>
              <DialogDescription>Set a new financial goal to work towards.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="title">Goal Title</Label>
                <Input
                  id="title"
                  placeholder="e.g., Emergency Fund"
                  value={newGoal.title}
                  onChange={(e) => setNewGoal({ ...newGoal, title: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="targetAmount">Target Amount {getCurrencySymbol()}</Label>
                <Input
                  id="targetAmount"
                  type="number"
                  placeholder="500"
                  value={newGoal.targetAmount}
                  onChange={(e) => setNewGoal({ ...newGoal, targetAmount: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="currentAmount">Current Amount {getCurrencySymbol()}</Label>
                <Input
                  id="currentAmount"
                  type="number"
                  placeholder="0"
                  value={newGoal.currentAmount}
                  onChange={(e) => setNewGoal({ ...newGoal, currentAmount: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="deadline">Target Date</Label>
                <Input
                  id="deadline"
                  type="date"
                  value={newGoal.deadline}
                  onChange={(e) => setNewGoal({ ...newGoal, deadline: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="category">Category</Label>
                <Input
                  id="category"
                  placeholder="e.g., Savings, Technology, Travel"
                  value={newGoal.category}
                  onChange={(e) => setNewGoal({ ...newGoal, category: e.target.value })}
                />
              </div>
              <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">Create Goal</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Overview Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Goals</CardTitle>
            <Target className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-700">{activeGoals.length}</div>
            <p className="text-xs text-blue-600">In progress</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Saved</CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-700">{getCurrencySymbol()} {totalCurrentAmount.toLocaleString()}</div>
            <p className="text-xs text-green-600">Across all goals</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Target Amount</CardTitle>
            <TrendingUp className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-700">{getCurrencySymbol()} {totalTargetAmount.toLocaleString()}</div>
            <p className="text-xs text-purple-600">Total target</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-700">{completedGoals.length}</div>
            <p className="text-xs text-orange-600">Goals achieved</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabbed Goals Section */}
      <Tabs defaultValue="active" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="active" className="flex items-center gap-2">
            <Target className="h-4 w-4" />
            Active Goals ({activeGoals.length})
          </TabsTrigger>
          <TabsTrigger value="completed" className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4" />
            Completed Goals ({completedGoals.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="space-y-4">
          {activeGoals.length === 0 ? (
            <Card className="p-8 text-center">
              <div className="flex flex-col items-center gap-4">
                <Target className="h-12 w-12 text-gray-400" />
                <div>
                  <h3 className="text-lg font-semibold">No Active Goals</h3>
                  <p className="text-muted-foreground">Create your first goal to start saving!</p>
                </div>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                      <Plus className="mr-2 h-4 w-4" />
                      Create Your First Goal
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Create New Goal</DialogTitle>
                      <DialogDescription>Set a new financial goal to work towards.</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="title">Goal Title</Label>
                        <Input
                          id="title"
                          placeholder="e.g., Emergency Fund"
                          value={newGoal.title}
                          onChange={(e) => setNewGoal({ ...newGoal, title: e.target.value })}
                        />
                      </div>
                      <div>
                        <Label htmlFor="targetAmount">Target Amount {getCurrencySymbol()}</Label>
                        <Input
                          id="targetAmount"
                          type="number"
                          placeholder="500"
                          value={newGoal.targetAmount}
                          onChange={(e) => setNewGoal({ ...newGoal, targetAmount: e.target.value })}
                        />
                      </div>
                      <div>
                        <Label htmlFor="currentAmount">Current Amount {getCurrencySymbol()}</Label>
                        <Input
                          id="currentAmount"
                          type="number"
                          placeholder="0"
                          value={newGoal.currentAmount}
                          onChange={(e) => setNewGoal({ ...newGoal, currentAmount: e.target.value })}
                        />
                      </div>
                      <div>
                        <Label htmlFor="deadline">Target Date</Label>
                        <Input
                          id="deadline"
                          type="date"
                          value={newGoal.deadline}
                          onChange={(e) => setNewGoal({ ...newGoal, deadline: e.target.value })}
                        />
                      </div>
                      <div>
                        <Label htmlFor="category">Category</Label>
                        <Input
                          id="category"
                          placeholder="e.g., Savings, Technology, Travel"
                          value={newGoal.category}
                          onChange={(e) => setNewGoal({ ...newGoal, category: e.target.value })}
                        />
                      </div>
                      <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">Create Goal</Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {activeGoals.map((goal) => (
                <Card key={goal.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">{goal.title}</CardTitle>
                        <CardDescription className="mt-1">{goal.description}</CardDescription>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500 hover:text-red-700">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <div className="flex gap-2 mt-2">
                      <Badge variant="secondary">{goal.category}</Badge>
                      <Badge className={getPriorityColor(goal.priority)}>{goal.priority} priority</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span>Progress</span>
                        <span>
                          {getCurrencySymbol()} {goal.currentAmount.toLocaleString()} / {getCurrencySymbol()} {goal.targetAmount.toLocaleString()}
                        </span>
                      </div>
                      <Progress value={(goal.currentAmount / goal.targetAmount) * 100} className="h-3" />
                      <div className="text-xs text-muted-foreground mt-1">
                        {Math.round((goal.currentAmount / goal.targetAmount) * 100)}% complete
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        <span>{getDaysLeft(goal.deadline)} days left</span>
                      </div>
                      <div className="text-muted-foreground">
                        {getCurrencySymbol()} {(goal.targetAmount - goal.currentAmount).toLocaleString()} remaining
                      </div>
                    </div>

                    <Button size="sm" className="w-full bg-green-600 hover:bg-green-700 text-white">
                      Add Money to Goal
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="completed" className="space-y-4">
          {completedGoals.length === 0 ? (
            <Card className="p-8 text-center">
              <div className="flex flex-col items-center gap-4">
                <CheckCircle className="h-12 w-12 text-gray-400" />
                <div>
                  <h3 className="text-lg font-semibold">No Completed Goals Yet</h3>
                  <p className="text-muted-foreground">Complete your first goal to see it here!</p>
                </div>
              </div>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {completedGoals.map((goal) => (
                <Card key={goal.id} className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg flex items-center gap-2">
                          <CheckCircle className="h-5 w-5 text-green-600" />
                          {goal.title}
                        </CardTitle>
                        <CardDescription className="mt-1">{goal.description}</CardDescription>
                      </div>
                    </div>
                    <div className="flex gap-2 mt-2">
                      <Badge className="bg-green-100 text-green-700 border-green-200">Completed</Badge>
                      <Badge variant="secondary">{goal.category}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="text-lg font-semibold text-green-700">
                      Goal Achieved: {getCurrencySymbol()} {goal.targetAmount.toLocaleString()}
                    </div>
                    <p className="text-sm text-green-600">
                      Completed on {new Date(goal.completedDate || "").toLocaleDateString()}
                    </p>
                    <p className="text-sm text-green-600">Congratulations on reaching your goal! 🎉</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
