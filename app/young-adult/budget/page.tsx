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
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { PiggyBank, Plus, TrendingUp, TrendingDown, Settings, Brain, Target, Calendar, BarChart3 } from "lucide-react"

export default function YoungAdultBudgetPage() {
  const [selectedPeriod, setSelectedPeriod] = useState("monthly")
  const [autoAdjustEnabled, setAutoAdjustEnabled] = useState(true)

  // Mock budget data for young adults
  const budgetData = {
    monthly: {
      total: 150000, // LKR 150,000
      spent: 127500,
      income: 180000,
    },
    quarterly: {
      total: 450000,
      spent: 382500,
      income: 540000,
    },
    yearly: {
      total: 1800000,
      spent: 1530000,
      income: 2160000,
    },
  }

  const currentBudget = budgetData[selectedPeriod as keyof typeof budgetData]
  const remainingBudget = currentBudget.total - currentBudget.spent

  const categories = [
    {
      id: 1,
      name: "Housing & Utilities",
      budgeted: 45000,
      spent: 44200,
      subcategories: [
        { name: "Rent", budgeted: 35000, spent: 35000 },
        { name: "Electricity", budgeted: 5000, spent: 4200 },
        { name: "Water", budgeted: 2500, spent: 2500 },
        { name: "Internet", budgeted: 2500, spent: 2500 },
      ],
      alertThreshold: 90,
      autoAdjust: true,
      trend: "stable",
    },
    {
      id: 2,
      name: "Transportation",
      budgeted: 15000,
      spent: 18500,
      subcategories: [
        { name: "Fuel", budgeted: 8000, spent: 10500 },
        { name: "Public Transport", budgeted: 4000, spent: 4500 },
        { name: "Maintenance", budgeted: 3000, spent: 3500 },
      ],
      alertThreshold: 85,
      autoAdjust: false,
      trend: "increasing",
    },
    {
      id: 3,
      name: "Food & Groceries",
      budgeted: 25000,
      spent: 22800,
      subcategories: [
        { name: "Groceries", budgeted: 18000, spent: 16500 },
        { name: "Dining Out", budgeted: 7000, spent: 6300 },
      ],
      alertThreshold: 80,
      autoAdjust: true,
      trend: "decreasing",
    },
    {
      id: 4,
      name: "Healthcare",
      budgeted: 8000,
      spent: 5200,
      subcategories: [
        { name: "Insurance", budgeted: 5000, spent: 5000 },
        { name: "Medical", budgeted: 3000, spent: 200 },
      ],
      alertThreshold: 75,
      autoAdjust: false,
      trend: "stable",
    },
    {
      id: 5,
      name: "Entertainment",
      budgeted: 12000,
      spent: 14300,
      subcategories: [
        { name: "Streaming", budgeted: 3000, spent: 3200 },
        { name: "Movies", budgeted: 4000, spent: 5100 },
        { name: "Hobbies", budgeted: 5000, spent: 6000 },
      ],
      alertThreshold: 85,
      autoAdjust: true,
      trend: "increasing",
    },
    {
      id: 6,
      name: "Savings & Investments",
      budgeted: 30000,
      spent: 22500,
      subcategories: [
        { name: "Emergency Fund", budgeted: 15000, spent: 15000 },
        { name: "Investments", budgeted: 10000, spent: 7500 },
        { name: "Retirement", budgeted: 5000, spent: 0 },
      ],
      alertThreshold: 70,
      autoAdjust: false,
      trend: "stable",
    },
  ]

  // AI Insights
  const aiInsights = [
    {
      type: "warning",
      title: "Transportation Overspend Alert",
      description:
        "You've exceeded your transportation budget by 23%. Consider carpooling or using public transport more.",
      action: "Adjust Budget",
      priority: "high",
    },
    {
      type: "success",
      title: "Food Budget Optimization",
      description: "Great job! You're saving 9% on food expenses. Your meal planning is working well.",
      action: "Continue",
      priority: "low",
    },
    {
      type: "info",
      title: "Investment Opportunity",
      description: "You have LKR 7,500 unallocated in savings. Consider increasing your investment allocation.",
      action: "Invest Now",
      priority: "medium",
    },
  ]

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "increasing":
        return <TrendingUp className="h-4 w-4 text-danger-500" />
      case "decreasing":
        return <TrendingDown className="h-4 w-4 text-success-500" />
      default:
        return <BarChart3 className="h-4 w-4 text-secondary-500" />
    }
  }

  const getInsightColor = (type: string) => {
    switch (type) {
      case "warning":
        return "border-warning-200 bg-warning-50"
      case "success":
        return "border-success-200 bg-success-50"
      case "info":
        return "border-primary-200 bg-primary-50"
      default:
        return "border-secondary-200 bg-secondary-50"
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            Advanced Budget Management
          </h1>
          <p className="text-muted-foreground">AI-powered budgeting with smart insights and auto-adjustments</p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="monthly">Monthly</SelectItem>
              <SelectItem value="quarterly">Quarterly</SelectItem>
              <SelectItem value="yearly">Yearly</SelectItem>
            </SelectContent>
          </Select>
          <Dialog>
            <DialogTrigger asChild>
              <Button className="bg-primary hover:bg-primary-700 text-white">
                <Plus className="mr-2 h-4 w-4" />
                Add Transaction
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Transaction</DialogTitle>
                <DialogDescription>Record a new expense or income</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="type">Type</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="expense">Expense</SelectItem>
                      <SelectItem value="income">Income</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="amount">Amount (LKR)</Label>
                  <Input id="amount" type="number" placeholder="15000" />
                </div>
                <div>
                  <Label htmlFor="category">Category</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat.id} value={cat.name}>
                          {cat.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Input id="description" placeholder="Monthly rent payment" />
                </div>
                <Button className="w-full bg-primary hover:bg-primary-700 text-white">Add Transaction</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Budget Overview */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="card-primary">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Budget</CardTitle>
            <Target className="h-4 w-4 text-primary-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary-700">LKR {currentBudget.total.toLocaleString()}</div>
            <p className="text-xs text-primary-600 capitalize">{selectedPeriod} allocation</p>
          </CardContent>
        </Card>

        <Card className="card-warning">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
            <TrendingDown className="h-4 w-4 text-warning-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-warning-700">LKR {currentBudget.spent.toLocaleString()}</div>
            <p className="text-xs text-warning-600">
              {Math.round((currentBudget.spent / currentBudget.total) * 100)}% utilized
            </p>
          </CardContent>
        </Card>

        <Card className="card-success">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Remaining</CardTitle>
            <TrendingUp className="h-4 w-4 text-success-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success-700">LKR {remainingBudget.toLocaleString()}</div>
            <p className="text-xs text-success-600">Available balance</p>
          </CardContent>
        </Card>

        <Card className="card-secondary">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Income</CardTitle>
            <Calendar className="h-4 w-4 text-secondary-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-secondary-700">LKR {currentBudget.income.toLocaleString()}</div>
            <p className="text-xs text-secondary-600 capitalize">{selectedPeriod} income</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="categories" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="categories">Categories</TabsTrigger>
         
         
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="categories" className="space-y-4">
          <div className="grid gap-4">
            {categories.map((category) => {
              const percentage = (category.spent / category.budgeted) * 100
              const isOverBudget = category.spent > category.budgeted
              const isNearThreshold = percentage >= category.alertThreshold

              return (
                <Card key={category.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold">{category.name}</h3>
                          
                          </div>
                          <p className="text-sm text-muted-foreground">
                            LKR {category.spent.toLocaleString()} / LKR {category.budgeted.toLocaleString()}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge
                          variant={isOverBudget ? "destructive" : isNearThreshold ? "secondary" : "outline"}
                          className={
                            isOverBudget
                              ? "bg-danger text-white"
                              : isNearThreshold
                                ? "bg-warning-100 text-warning-700 border-warning-300"
                                : "bg-success-100 text-success-700 border-success-300"
                          }
                        >
                          {isOverBudget ? "Over Budget" : isNearThreshold ? "Near Limit" : "On Track"}
                        </Badge>
                      </div>
                    </div>

                    <div className="space-y-2 mb-3">
                      <Progress value={Math.min(percentage, 100)} className="h-2" />
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>{Math.round(percentage)}% used</span>
                        <span>LKR {Math.max(0, category.budgeted - category.spent).toLocaleString()} remaining</span>
                      </div>
                    </div>

                  </CardContent>
                </Card>
              )
            })}
          </div>
        </TabsContent>

        <TabsContent value="insights" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5 text-primary" />
                AI-Powered Financial Insights
              </CardTitle>
              <CardDescription>
                Smart recommendations based on your spending patterns and financial goals
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {aiInsights.map((insight, index) => (
                <div key={index} className={`p-4 rounded-lg border ${getInsightColor(insight.type)}`}>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold">{insight.title}</h4>
                        <Badge
                          variant="secondary"
                          className={`text-xs ${
                            insight.priority === "high"
                              ? "bg-danger-100 text-danger-700"
                              : insight.priority === "medium"
                                ? "bg-warning-100 text-warning-700"
                                : "bg-success-100 text-success-700"
                          }`}
                        >
                          {insight.priority} priority
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">{insight.description}</p>
                      <Button size="sm" variant="outline" className="text-xs bg-transparent">
                        {insight.action}
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5 text-primary" />
                Auto-Adjust Settings
              </CardTitle>
              <CardDescription>Configure automatic budget adjustments based on your spending patterns</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Enable Auto-Adjust</h4>
                  <p className="text-sm text-muted-foreground">Automatically adjust budgets based on spending trends</p>
                </div>
                <Switch checked={autoAdjustEnabled} onCheckedChange={setAutoAdjustEnabled} />
              </div>

              {autoAdjustEnabled && (
                <div className="space-y-4 p-4 bg-secondary-50 rounded-lg">
                  <h5 className="font-medium">Auto-Adjust Rules</h5>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Increase budget when 90% used for 2 consecutive months</span>
                      <Switch defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Decrease budget when under 60% used for 3 months</span>
                      <Switch defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Reallocate unused budget to savings</span>
                      <Switch />
                    </div>
                  </div>

                  <div className="pt-3 border-t">
                    <Label htmlFor="adjustment-limit">Maximum adjustment per month (%)</Label>
                    <Input id="adjustment-limit" type="number" defaultValue="15" className="w-20 mt-1" />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Spending Trends</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">vs Last Month</span>
                    <Badge className="bg-success text-white">-5.2%</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">vs Last Quarter</span>
                    <Badge className="bg-warning text-white">+2.1%</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">vs Last Year</span>
                    <Badge className="bg-danger text-white">+12.8%</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Budget Efficiency</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Budget Utilization</span>
                    <span className="font-semibold">85%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Savings Rate</span>
                    <span className="font-semibold text-success-600">15%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Over-budget Categories</span>
                    <span className="font-semibold text-danger-600">2</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
