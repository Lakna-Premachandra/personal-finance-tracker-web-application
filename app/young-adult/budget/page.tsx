"use client"
//this is young adult
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  useCreateBudgetMutation,
  useGetMonthlySummaryQuery,
  useUpdateBudgetMutation,
  useDeleteBudgetMutation,
  BudgetData
} from "@/services/controllers/budgetController"
import { useGetCategoriesByTypeAndUserTypeQuery, UserType } from "@/services/controllers/categoryController"
import {
  BarChart3,
  Calendar,
  Loader2,
  Plus,
  Target,
  TrendingDown,
  TrendingUp,
  MoreVertical,
  Edit,
  Trash2,
  PiggyBank
} from "lucide-react"
import { useEffect, useState } from "react"
import { useGetBudgetStatusQuery } from "@/services/controllers/transactionController"
import { toast } from "sonner"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from "recharts"
import { useCurrency } from "@/hooks/useCurrency"

export default function YoungAdultBudgetPage() {
  const [selectedPeriod, setSelectedPeriod] = useState("monthly")
  const [autoAdjustEnabled, setAutoAdjustEnabled] = useState(true)
  const [isAddBudgetOpen, setIsAddBudgetOpen] = useState(false)
  const [isEditBudgetOpen, setIsEditBudgetOpen] = useState(false)
  const [editingBudget, setEditingBudget] = useState<BudgetData | null>(null)
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1)
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())
  const { formatCurrency, getCurrencySymbol } = useCurrency();


  // Form state for adding/editing budget
  const [budgetForm, setBudgetForm] = useState({
    amount: "",
    categoryId: "",
    month: selectedMonth,
    year: selectedYear
  })

  // User type - you can get this from your auth context or props
  const userType: UserType = "Young-Adult" // or get from context/props

  // Current date for fetching budgets
  const currentDate = new Date()
  const currentMonth = currentDate.getMonth() + 1
  const currentYear = currentDate.getFullYear()

  // API Hooks
  const [createBudget, { isLoading: isCreatingBudget }] = useCreateBudgetMutation()
  const [updateBudget, { isLoading: isUpdatingBudget }] = useUpdateBudgetMutation()
  const [deleteBudget, { isLoading: isDeletingBudget }] = useDeleteBudgetMutation()

  const {
    data: categoriesResponse,
    isLoading: isCategoriesLoading,
    error: categoriesError
  } = useGetCategoriesByTypeAndUserTypeQuery({
    type: 'Expense',
    userType: userType
  })

  const {
    data: budgetStatusResponse,
    isLoading: isBudgetStatusLoading,
    refetch: refetchBudgetStatus
  } = useGetBudgetStatusQuery({
    year: selectedYear,
    month: selectedMonth
  })

  console.error("Budget Status Response:", budgetStatusResponse)
  const {
    data: monthlySummaryResponse,
    isLoading: isSummaryLoading,
    refetch: refetchSummary
  } = useGetMonthlySummaryQuery({
    year: selectedYear,
    month: selectedMonth
  })

  useEffect(() => {
    refetchBudgetStatus()
    refetchSummary()
  }, [selectedYear, selectedMonth, refetchBudgetStatus, refetchSummary])

  // Reset form
  const resetForm = () => {
    setBudgetForm({
      amount: "",
      categoryId: "",
      month: selectedMonth,
      year: selectedYear
    })
    setEditingBudget(null)
  }


  // Handle form submission for creating budget
  const handleAddBudget = async () => {
    try {
      if (!budgetForm.amount || !budgetForm.categoryId) {
        toast.error("Please fill in all required fields")
        return
      }

      const result = await createBudget({
        categoryId: parseInt(budgetForm.categoryId),
        amount: parseFloat(budgetForm.amount),
        year: budgetForm.year,
        month: budgetForm.month
      }).unwrap()

      if (result.success) {
        resetForm()
        setIsAddBudgetOpen(false)
        refetchSummary()
        refetchBudgetStatus()
        toast.success("Budget added successfully!")
      }

    } catch (error) {
      console.error("Error creating budget:", error)
      toast.error("Failed to create budget. Please try again.")
    }
  }


  // Handle editing budget
  const handleEditBudget = (budget: BudgetData) => {
    console.log("Editing budget:", budget) // Add this line for debugging
    setEditingBudget(budget)
    setBudgetForm({
      amount: budget.Amount?.toString() || '',
      categoryId: budget.Category_ID?.toString() || '',
      month: budget.Month || currentMonth,
      year: budget.Year || currentYear
    })
    setIsEditBudgetOpen(true)
  }

  // Handle form submission for updating budget
  const handleUpdateBudget = async () => {
    try {
      if (!budgetForm.amount || !budgetForm.categoryId || !editingBudget) {
        toast.error("Please fill in all required fields")
        return
      }

      const result = await updateBudget({
        budgetId: editingBudget.Budget_ID,
        categoryId: parseInt(budgetForm.categoryId),
        amount: parseFloat(budgetForm.amount),
        year: budgetForm.year,
        month: budgetForm.month
      }).unwrap()

      if (result.success) {
        resetForm()
        setIsEditBudgetOpen(false)
        refetchSummary()
        refetchBudgetStatus() // Add this line
        toast.success("Budget updated successfully!")
      }
    } catch (error) {
      console.error("Error updating budget:", error)
      toast.error("Failed to update budget. Please try again.")
    }
  }

  // Handle deleting budget
  const handleDeleteBudget = async (budgetId: number, categoryName: string) => {
    try {
      const result = await deleteBudget(budgetId).unwrap()

      if (result.success) {
        refetchSummary()
        refetchBudgetStatus()
        toast.success(`Budget for ${categoryName} deleted successfully!`)
      }

    } catch (error) {
      console.error("Error deleting budget:", error)
      toast.error("Failed to delete budget. Please try again.")
    }
  }

  // Get categories for dropdown
  const expenseCategories = categoriesResponse?.data || []

  // Use API data if available, otherwise fall back to mock data
  const budgetData = monthlySummaryResponse?.data ? {
    monthly: {
      total: monthlySummaryResponse.data.summary.budgetSummary.totalBudget || 0,
      spent: monthlySummaryResponse.data.summary.budgetSummary.totalSpent || monthlySummaryResponse.data.summary.totalExpenses || 0,
      remaining: monthlySummaryResponse.data.summary.budgetSummary.remaining || 0,
      income: monthlySummaryResponse.data.summary.totalIncome || 0,
    },
    yearly: {
      total: (monthlySummaryResponse.data.summary.budgetSummary.totalBudget || 0) * 12,
      spent: (monthlySummaryResponse.data.summary.budgetSummary.totalSpent || monthlySummaryResponse.data.summary.totalExpenses || 0) * 12,
      income: (monthlySummaryResponse.data.summary.totalIncome || 0) * 12,
    },
  } : {
    monthly: { total: 0, spent: 0, remaining: 0, income: 0 },
    yearly: { total: 0, spent: 0, income: 0 },
  }

  const handleMonthChange = (value: string) => {
    setSelectedMonth(parseInt(value))
  }

  const handleYearChange = (value: string) => {
    setSelectedYear(parseInt(value))
  }

  const currentBudget = budgetData[selectedPeriod as keyof typeof budgetData]
  const remainingBudget = currentBudget.total - currentBudget.spent

  // Convert API category breakdown to display format with budget data
  const categories = budgetStatusResponse?.data?.map(budget => ({
    id: budget.Budget_ID,
    trend: budget.Percentage_Used > 100 ? "increasing" : budget.Percentage_Used < 60 ? "decreasing" : "stable",
    Budget_ID: budget.Budget_ID,
    Category_ID: budget.Category_ID,
    Amount: budget.Amount,
    Month: budget.Month,
    Year: budget.Year,
    CategoryName: budget.Category_Name,
    Status: budget.Status,
    Spent_Amount: budget.Spent_Amount,
    percentageUsed: budget.Percentage_Used,
    remainingBudget: budget.Remaining_Amount,
  })) || []

  // Prepare chart data
  const barChartData = categories.map(category => ({
    name: category.CategoryName.length > 12 ? category.CategoryName.substring(0, 12) + '...' : category.CategoryName,
    budgeted: category.Amount,
    spent: category.Spent_Amount,
    remaining: category.remainingBudget
  }))

  const pieChartData = categories.map(category => ({
    name: category.CategoryName,
    value: category.Amount,
    spent: category.Spent_Amount
  }))

  // Colors for pie chart
  const COLORS = ['#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899', '#6B7280', '#84CC16']

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "increasing":
        return <TrendingUp className="h-4 w-4 text-red-500" />
      case "decreasing":
        return <TrendingDown className="h-4 w-4 text-green-500" />
      default:
        return <BarChart3 className="h-4 w-4 text-gray-500" />
    }
  }

  const getInsightColor = (type: string) => {
    switch (type) {
      case "warning":
        return "border-yellow-200 bg-yellow-50"
      case "success":
        return "border-green-200 bg-green-50"
      case "info":
        return "border-blue-200 bg-blue-50"
      default:
        return "border-gray-200 bg-gray-50"
    }
  }
  const isPastDate =
    parseInt(selectedYear.toString()) < currentYear ||
    (parseInt(selectedYear.toString()) === currentYear &&
      parseInt(selectedMonth.toString()) < currentMonth);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            Advanced Budget Management
          </h1>
          <p className="text-gray-600">budgeting with smart insights and auto-adjustments</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2">
            {/* Month Selector */}
            <Select value={selectedMonth.toString()} onValueChange={handleMonthChange}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Select month" />
              </SelectTrigger>
              <SelectContent>
                {Array.from({ length: 12 }, (_, i) => (
                  <SelectItem key={i + 1} value={(i + 1).toString()}>
                    {new Date(2024, i, 1).toLocaleString('default', { month: 'long' })}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Year Selector */}
            <Select value={selectedYear.toString()} onValueChange={handleYearChange}>
              <SelectTrigger className="w-24">
                <SelectValue placeholder="Select year" />
              </SelectTrigger>
              <SelectContent>
                {Array.from({ length: 11 }, (_, i) => {
                  const year = 2020 + i;
                  return (
                    <SelectItem key={year} value={year.toString()}>
                      {year}
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>

          {/* Add Budget Dialog */}
          <Dialog open={isAddBudgetOpen} onOpenChange={setIsAddBudgetOpen}>
            <DialogTrigger asChild>
              <Button
                disabled={isPastDate} className="bg-blue-600 hover:bg-blue-700 text-white">
                <Plus className="mr-2 h-4 w-4" />
                Add Budget
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Budget</DialogTitle>
                <DialogDescription>Create a new budget for a category</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="amount">Amount ({getCurrencySymbol()})</Label>
                  <Input
                    id="amount"
                    type="number"
                    placeholder="15000"
                    value={budgetForm.amount}
                    onChange={(e) => setBudgetForm(prev => ({ ...prev, amount: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="category">Category</Label>
                  <Select
                    value={budgetForm.categoryId}
                    onValueChange={(value) => setBudgetForm(prev => ({ ...prev, categoryId: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={isCategoriesLoading ? "Loading categories..." : "Select category"} />
                    </SelectTrigger>
                    <SelectContent>
                      {isCategoriesLoading ? (
                        <SelectItem value="" disabled>
                          <div className="flex items-center gap-2">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Loading...
                          </div>
                        </SelectItem>
                      ) : categoriesError ? (
                        <SelectItem value="" disabled>Error loading categories</SelectItem>
                      ) : expenseCategories.length === 0 ? (
                        <SelectItem value="" disabled>No expense categories found</SelectItem>
                      ) : (
                        expenseCategories.map((category) => (
                          <SelectItem key={category.Category_ID} value={category.Category_ID.toString()}>
                            {category.Name}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex gap-4">
                  <div className="flex-1">
                    <Label htmlFor="month">Month</Label>
                    <Select
                      value={budgetForm.month?.toString() || ''}
                      onValueChange={(value) => setBudgetForm(prev => ({ ...prev, month: parseInt(value) }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select month" />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.from({ length: 12 }, (_, i) => {
                          const monthValue = i + 1
                          const monthLabel = new Date(2024, i, 1).toLocaleString('default', { month: 'long' })
                          const isDisabled = monthValue < currentMonth

                          return (
                            <SelectItem
                              key={monthValue}
                              value={monthValue.toString()}
                              disabled={isDisabled}
                            >
                              {monthLabel}
                            </SelectItem>
                          )
                        })}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex-1">
                    <Label htmlFor="year">Year</Label>
                    <Input
                      type="number"
                      id="year"
                      value={budgetForm.year}
                      onChange={(e) => setBudgetForm(prev => ({ ...prev, year: parseInt(e.target.value) || currentYear }))}
                      min={currentYear}
                    />
                  </div>
                </div>
                <Button
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                  onClick={handleAddBudget}
                  disabled={isCreatingBudget || !budgetForm.amount || !budgetForm.categoryId}
                >
                  {isCreatingBudget ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    "Add Budget"
                  )}
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          {/* Edit Budget Dialog */}
          <Dialog open={isEditBudgetOpen} onOpenChange={(open) => {
            setIsEditBudgetOpen(open)
            if (!open) resetForm()
          }}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Edit Budget</DialogTitle>
                <DialogDescription>Update the budget for {editingBudget?.CategoryName}</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="edit-amount">Amount ({getCurrencySymbol()})</Label>
                  <Input
                    id="edit-amount"
                    type="number"
                    placeholder="15000"
                    value={budgetForm.amount}
                    onChange={(e) => setBudgetForm(prev => ({ ...prev, amount: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="edit-category">Category</Label>
                  <Select
                    value={budgetForm.categoryId}
                    onValueChange={(value) => setBudgetForm(prev => ({ ...prev, categoryId: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {expenseCategories.map((category) => (
                        <SelectItem key={category.Category_ID} value={category.Category_ID.toString()}>
                          {category.Name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex gap-4">
                  <div className="flex-1">
                    <Label htmlFor="edit-month">Month</Label>
                    <Select
                      value={budgetForm.month.toString()}
                      onValueChange={(value) => setBudgetForm(prev => ({ ...prev, month: parseInt(value) }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select month" />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.from({ length: 12 }, (_, i) => {
                          const monthNumber = i + 1;
                          const isDisabled = monthNumber < currentMonth;

                          return (
                            <SelectItem
                              key={monthNumber}
                              value={monthNumber.toString()}
                              disabled={isDisabled}
                            >
                              {new Date(2024, i, 1).toLocaleString('default', { month: 'long' })}
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex-1">
                    <Label htmlFor="edit-year">Year</Label>
                    <Input
                      type="number"
                      id="edit-year"
                      value={budgetForm.year}
                      onChange={(e) => setBudgetForm(prev => ({ ...prev, year: parseInt(e.target.value) || currentYear }))}
                      min={currentYear}
                    />
                  </div>
                </div>
                <Button
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                  onClick={handleUpdateBudget}
                  disabled={isUpdatingBudget || !budgetForm.amount || !budgetForm.categoryId}
                >
                  {isUpdatingBudget ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    "Update Budget"
                  )}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Budget Overview */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-600">Total Budget</CardTitle>
            <Target className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-700">
              {isSummaryLoading ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Loading...
                </div>
              ) : (
                `${getCurrencySymbol()} ${currentBudget.total.toLocaleString()}`
              )}
            </div>
            <p className="text-xs text-blue-600 capitalize">{selectedPeriod} allocation</p>
          </CardContent>
        </Card>

        <Card className="border-yellow-200 bg-yellow-50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-yellow-600">Total Spent</CardTitle>
            <TrendingDown className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-700">
              {isSummaryLoading ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Loading...
                </div>
              ) : (
                `${getCurrencySymbol()} ${currentBudget.spent.toLocaleString()}`
              )}
            </div>
            <p className="text-xs text-yellow-600">
              {Math.round((currentBudget.spent / currentBudget.total) * 100)}% utilized
            </p>
          </CardContent>
        </Card>

        <Card className="border-green-200 bg-green-50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-600">Remaining</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-700">
              {getCurrencySymbol()} {remainingBudget.toLocaleString()}
            </div>
            <p className="text-xs text-green-600">Available balance</p>
          </CardContent>
        </Card>

        <Card className="border-gray-200 bg-gray-50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Income</CardTitle>
            <Calendar className="h-4 w-4 text-gray-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-700">
              {isSummaryLoading ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Loading...
                </div>
              ) : (
                `${getCurrencySymbol()} ${currentBudget.income.toLocaleString()}`
              )}
            </div>
            <p className="text-xs text-gray-600 capitalize">{selectedPeriod} income</p>
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
            {isBudgetStatusLoading ? (
              <div className="flex items-center justify-center  min-h-[500px]">
                {/* <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading goals...</span> */}
                <div className="relative">
                  <div className="flex h-24 w-24 items-center justify-center rounded-full bg-slate-200 shadow-sm ">
                    <PiggyBank className="h-10 w-10 text-gray-500" />
                  </div>
                  <div className="m-4 absolute inset-0 rounded-full border-4 border-transparent border-t-slate-500 border-r-slate-300 animate-spin"></div>
                </div>
              </div>
            ) : categories.length === 0 ? (
              <div className="text-center p-8 text-gray-500">
                No budget categories found. Add your first budget above!
              </div>
            ) : (
              categories.map((category: any) => {
                return (
                  <Card key={category.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="font-semibold">{category.CategoryName}</h3>
                              {getTrendIcon(category.trend)}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge
                            variant={category.Status === "Over Budget" ? "destructive" : "outline"}
                            className={
                              category.Status === "Over Budget"
                                ? "bg-red-100 text-red-800"
                                : category.Status === "Under Budget"
                                  ? "bg-green-100 text-green-800"
                                  : "bg-yellow-100 text-yellow-800"
                            }
                          >
                            {category.Status}
                          </Badge>

                          {/* Actions Dropdown */}
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={() => handleEditBudget(category)}
                                className="flex items-center gap-2"
                              >
                                <Edit className="h-4 w-4" />
                                Edit Budget
                              </DropdownMenuItem>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <DropdownMenuItem
                                    onSelect={(e) => e.preventDefault()}
                                    className="flex items-center gap-2 text-red-600 focus:text-red-600"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                    Delete Budget
                                  </DropdownMenuItem>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Delete Budget</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Are you sure you want to delete the budget for "{category.CategoryName}"?
                                      This action cannot be undone.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() => handleDeleteBudget(category.Budget_ID, category.CategoryName)}
                                      className="bg-red-600 hover:bg-red-700"
                                      disabled={isDeletingBudget}
                                    >
                                      {isDeletingBudget ? (
                                        <>
                                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                          Deleting...
                                        </>
                                      ) : (
                                        "Delete"
                                      )}
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>

                      <div className="space-y-2 mb-3 ">
                        <Progress value={Math.min(category.percentageUsed, 100)} className="h-2 bg-slate-200 border" />
                        <div className="flex justify-between text-xs ">
                          <span>{Math.round(category.percentageUsed)}% used</span>
                          <span>{getCurrencySymbol()} {Math.max(0, category.remainingBudget).toLocaleString()} remaining</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })
            )}
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Budget vs Spending Bar Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Budget vs Spending
                </CardTitle>
                <p className="text-sm text-gray-600">
                  Compare budgeted amounts with actual spending by category
                </p>
              </CardHeader>
              <CardContent>
                {isBudgetStatusLoading ? (
                  <div className="flex items-center justify-center h-64">
                    <div className="flex items-center gap-2">
                      <Loader2 className="h-6 w-6 animate-spin" />
                      Loading chart data...
                    </div>
                  </div>
                ) : barChartData.length === 0 ? (
                  <div className="flex items-center justify-center h-64 text-gray-500">
                    No budget data available for selected period
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={barChartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis
                        dataKey="name"
                        fontSize={12}
                        angle={-45}
                        textAnchor="end"
                        height={80}
                      />
                      <YAxis
                        fontSize={12}
                        tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
                      />
                      <Tooltip
                        formatter={(value, name) => [
                          `${getCurrencySymbol()} ${Number(value).toLocaleString()}`,
                          name === 'budgeted' ? 'Budgeted' : name === 'spent' ? 'Spent' : 'Remaining'
                        ]}
                        labelFormatter={(label) => `Category: ${label}`}
                      />
                      <Bar dataKey="budgeted" fill="#3B82F6" name="budgeted" />
                      <Bar dataKey="spent" fill="#EF4444" name="spent" />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>

            {/* Budget Distribution Pie Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Budget Distribution
                </CardTitle>
                <p className="text-sm text-gray-600">
                  How your total budget is allocated across categories
                </p>
              </CardHeader>
              <CardContent>
                {isBudgetStatusLoading ? (
                  <div className="flex items-center justify-center h-64">
                    <div className="flex items-center gap-2">
                      <Loader2 className="h-6 w-6 animate-spin" />
                      Loading chart data...
                    </div>
                  </div>
                ) : pieChartData.length === 0 ? (
                  <div className="flex items-center justify-center h-64 text-gray-500">
                    No budget data available for selected period
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={pieChartData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent! * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {pieChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(value) => [`${getCurrencySymbol()} ${Number(value).toLocaleString()}`, 'Budget Amount']}
                      />
                      <Legend
                        verticalAlign="bottom"
                        height={36}
                        formatter={(value) => value.length > 15 ? value.substring(0, 15) + '...' : value}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Additional Analytics Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Budget Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">
                    {categories.filter(c => c.Status === "Exact Budget").length}

                  </div>
                  <div className="text-sm text-blue-600">Exact Budgets</div>
                </div>
                <div className="text-center p-4 bg-red-50 rounded-lg">
                  <div className="text-2xl font-bold text-red-600">
                    {categories.filter(c => c.Status === "Over Budget").length}
                  </div>
                  <div className="text-sm text-red-600">Over Budget</div>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">
                    {categories.filter(c => c.Status === "Under Budget").length}
                  </div>
                  <div className="text-sm text-green-600">Under Budget</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}