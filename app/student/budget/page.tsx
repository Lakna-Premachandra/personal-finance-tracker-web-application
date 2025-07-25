"use client"
//this is student budget page
import { useState, useEffect } from "react"
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  useCreateBudgetMutation,
  useGetMonthlySummaryQuery,
  useUpdateBudgetMutation,
  useDeleteBudgetMutation,
  BudgetData
} from "@/services/controllers/budgetController"
import { useGetCategoriesByTypeAndUserTypeQuery, UserType } from "@/services/controllers/categoryController"
import { useGetBudgetStatusQuery } from "@/services/controllers/transactionController"
import {
  PiggyBank,
  Plus,
  TrendingUp,
  TrendingDown,
  Target,
  Lightbulb,
  Calendar,
  Loader2,
  MoreVertical,
  Edit,
  Trash2
} from "lucide-react"
import { toast } from "sonner"

export default function StudentBudgetPage() {
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1)
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())
  const [isAddBudgetOpen, setIsAddBudgetOpen] = useState(false)
  const [isEditBudgetOpen, setIsEditBudgetOpen] = useState(false)
  const [editingBudget, setEditingBudget] = useState<BudgetData | null>(null)

  const currentDate = new Date()
  const currentMonth = currentDate.getMonth() + 1
  const currentYear = currentDate.getFullYear()
  // Form state for adding/editing budget
  const [budgetForm, setBudgetForm] = useState({
    amount: "",
    categoryId: "",
    month: selectedMonth,
    year: selectedYear
  })

  // User type for students
  const userType: UserType = "Student"

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
  const isPastDate =
    parseInt(selectedYear.toString()) < currentYear ||
    (parseInt(selectedYear.toString()) === currentYear &&
      parseInt(selectedMonth.toString()) < currentMonth);


  const {
    data: budgetStatusResponse,
    isLoading: isBudgetStatusLoading,
    refetch: refetchBudgetStatus
  } = useGetBudgetStatusQuery({
    year: selectedYear,
    month: selectedMonth
  })

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
  const handleEditBudget = (budget: any) => {
    setEditingBudget(budget)
    setBudgetForm({
      amount: budget.Amount?.toString() || '',
      categoryId: budget.Category_ID?.toString() || '',
      month: budget.Month || selectedMonth,
      year: budget.Year || selectedYear
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
        refetchBudgetStatus()
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

  // Handle month/year changes
  const handleMonthChange = (value: string) => {
    setSelectedMonth(parseInt(value))
  }

  const handleYearChange = (value: string) => {
    setSelectedYear(parseInt(value))
  }

  // Get categories for dropdown
  const expenseCategories = categoriesResponse?.data || []

  // Use API data if available
  const budgetData = monthlySummaryResponse?.data ? {
    total: monthlySummaryResponse.data.summary.budgetSummary.totalBudget || 0,
    spent: monthlySummaryResponse.data.summary.budgetSummary.totalSpent || monthlySummaryResponse.data.summary.totalExpenses || 0,
    remaining: monthlySummaryResponse.data.summary.budgetSummary.remaining || 0,
  } : {
    total: 0,
    spent: 0,
    remaining: 0,
  }

  // Convert API category breakdown to display format
  const categories = budgetStatusResponse?.data?.map(budget => ({
    id: budget.Budget_ID,
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
    // Add some category icons for students
    icon: getCategoryIcon(budget.Category_Name),
    tips: getCategoryTips(budget.Category_Name, budget.Status),
  })) || []

  // Helper function to get category icons
  function getCategoryIcon(categoryName: string): string {
    const name = categoryName.toLowerCase()
    if (name.includes('food') || name.includes('dining')) return "🍕"
    if (name.includes('transport') || name.includes('travel')) return "🚌"
    if (name.includes('entertainment') || name.includes('fun')) return "🎬"
    if (name.includes('school') || name.includes('education') || name.includes('book')) return "📚"
    if (name.includes('personal') || name.includes('care') || name.includes('health')) return "🧴"
    return "🛍️"
  }

  // Helper function to get category tips
  function getCategoryTips(categoryName: string, status: string): string {
    const name = categoryName.toLowerCase()

    if (status === "Over Budget") {
      if (name.includes('food')) return "You're over budget on food! Try cooking more meals at home or look for campus meal deals."
      if (name.includes('entertainment')) return "Entertainment spending is high. Look for free campus events or student discounts!"
      if (name.includes('transport')) return "Consider walking, cycling, or using student transport passes to save money."
      return "You're over budget in this category. Try to reduce spending here for the rest of the month."
    }

    if (name.includes('food')) return "Great job managing food expenses! Try meal prepping to save even more."
    if (name.includes('transport')) return "Good transport budgeting! Consider walking for short distances to stay healthy and save money."
    if (name.includes('entertainment')) return "Nice entertainment budgeting! Look for student discounts to stretch your budget further."
    if (name.includes('school') || name.includes('education')) return "Excellent control on education expenses! Consider buying used textbooks or sharing with classmates."
    return "Great job staying within budget! Keep up the good work!"
  }

  const remainingBudget = budgetData.total - budgetData.spent

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            Student Budget
          </h1>
          <p className="text-gray-600">Simple budgeting to build good money habits</p>
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
                  <Label htmlFor="amount">Amount (LKR)</Label>
                  <Input
                    id="amount"
                    type="number"
                    placeholder="5000"
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
                      onChange={(e) => setBudgetForm(prev => ({ ...prev, year: parseInt(e.target.value) || selectedYear }))}
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
                  <Label htmlFor="edit-amount">Amount (LKR)</Label>
                  <Input
                    id="edit-amount"
                    type="number"
                    placeholder="5000"
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
                      onChange={(e) => setBudgetForm(prev => ({ ...prev, year: parseInt(e.target.value) || selectedYear }))}
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
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-600">Monthly Budget</CardTitle>
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
                `LKR ${budgetData.total.toLocaleString()}`
              )}
            </div>
            <p className="text-xs text-blue-600">Total allocated</p>
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
                `LKR ${budgetData.spent.toLocaleString()}`
              )}
            </div>
            <p className="text-xs text-yellow-600">
              {budgetData.total > 0 ? Math.round((budgetData.spent / budgetData.total) * 100) : 0}% of budget used
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
              LKR {Math.max(0, remainingBudget).toLocaleString()}
            </div>
            <p className="text-xs text-green-600">Available to spend</p>
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
            {isBudgetStatusLoading ? (
              <div className="flex items-center justify-center p-8">
                <div className="flex items-center gap-2">
                  <Loader2 className="h-6 w-6 animate-spin" />
                  Loading budget categories...
                </div>
              </div>
            ) : categories.length === 0 ? (
              <div className="text-center p-8 text-gray-500">
                No budget categories found. Add your first budget above!
              </div>
            ) : (
              categories.map((category: any) => {
                const isOverBudget = category.Status === "Over Budget"

                return (
                  <Card key={category.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{category.icon}</span>
                          <div>
                            <h3 className="font-semibold">{category.CategoryName}</h3>
                            <p className="text-sm text-gray-600">
                              LKR {category.Spent_Amount.toLocaleString()} / LKR {category.Amount.toLocaleString()}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge
                            variant={isOverBudget ? "destructive" : "secondary"}
                            className={
                              isOverBudget
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

                      <div className="space-y-2 mb-3">
                        <Progress value={Math.min(category.percentageUsed, 100)} className="h-2 bg-slate-200 border" />
                        <div className="flex justify-between text-xs text-gray-600">
                          <span>{Math.round(category.percentageUsed)}% used</span>
                          <span>LKR {Math.max(0, category.remainingBudget).toLocaleString()} left</span>
                        </div>
                      </div>

                      {/* Smart Tip */}
                      <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-start gap-2">
                          <Lightbulb className="h-4 w-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                          <p className="text-sm text-gray-700">{category.tips}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })
            )}
          </div>
        </TabsContent>

        <TabsContent value="tips" className="space-y-4">
          <div className="grid gap-4">
            {/* Smart Tips for Students */}
            <Card className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <span className="text-2xl">💡</span>
                  <div>
                    <h3 className="font-semibold mb-1">Student Discount Alert</h3>
                    <p className="text-sm text-gray-600">Many restaurants and stores offer 10-20% student discounts. Always ask and show your student ID!</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <span className="text-2xl">🎯</span>
                  <div>
                    <h3 className="font-semibold mb-1">Weekly Budget Check</h3>
                    <p className="text-sm text-gray-600">Review your spending every Sunday to stay on track. Small adjustments weekly prevent big problems monthly.</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <span className="text-2xl">📱</span>
                  <div>
                    <h3 className="font-semibold mb-1">Free Campus Entertainment</h3>
                    <p className="text-sm text-gray-600">Check your campus calendar for free events like movie nights, concerts, and workshops. Great way to have fun without spending!</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <span className="text-2xl">🛍️</span>
                  <div>
                    <h3 className="font-semibold mb-1">Buy or Rent Used Textbooks</h3>
                    <p className="text-sm text-gray-600">Textbooks can be expensive. Look for used copies online or rent them from the library to save money.</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <span className="text-2xl">🚲</span>
                  <div>
                    <h3 className="font-semibold mb-1">Walk or Bike for Short Distances</h3>
                    <p className="text-sm text-gray-600">Save on transport costs and stay healthy by walking or biking for short trips around campus.</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <span className="text-2xl">🍽️</span>
                  <div>
                    <h3 className="font-semibold mb-1">Meal Prep to Save on Food</h3>
                    <p className="text-sm text-gray-600">Cooking in batches and meal prepping can help you save money and eat healthier. Plan your meals weekly!</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <span className="text-2xl">🎓</span>
                  <div>
                    <h3 className="font-semibold mb-1">Use Student Resources</h3>
                    <p className="text-sm text-gray-600">Take advantage of free resources like tutoring, career counseling, and mental health services offered by your university.</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <span className="text-2xl">💳</span>
                  <div>
                    <h3 className="font-semibold mb-1">Use a Student Credit Card Wisely</h3>
                    <p className="text-sm text-gray-600">If you have a student credit card, use it for planned expenses and pay it off in full each month to build credit without debt.</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <span className="text-2xl">📝</span>
                  <div>
                    <h3 className="font-semibold mb-1">Track Your Spending Daily</h3>
                    <p className="text-sm text-gray-600">Use budgeting apps or a simple spreadsheet to track your daily expenses. Awareness is key to staying on budget!</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <span className="text-2xl">📊</span>
                  <div>
                    <h3 className="font-semibold mb-1">Review Your Budget Regularly</h3>
                    <p className="text-sm text-gray-600">Set aside time each month to review your budget, track your progress, and make adjustments as needed.</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <span className="text-2xl">💡</span>
                  <div>
                    <h3 className="font-semibold mb-1">Stay Informed About Financial Aid</h3>
                    <p className="text-sm text-gray-600">Keep track of scholarship opportunities, grants, and financial aid deadlines to help reduce your education costs.</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <span className="text-2xl">📅</span>
                <div>
                  <h3 className="font-semibold mb-1">Plan for Unexpected Expenses</h3>
                  <p className="text-sm text-gray-600">Set aside a small emergency fund each month to cover unexpected costs like medical bills or car repairs.</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <span className="text-2xl">🛒</span>
                <div>
                  <h3 className="font-semibold mb-1">Use Cashback Apps for Shopping</h3>
                  <p className="text-sm text-gray-600">Apps like Rakuten or Honey can help you earn cashback on online purchases, saving you money over time.</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <span className="text-2xl">💬</span>
                <div>
                  <h3 className="font-semibold mb-1">Talk to a Financial Advisor</h3>
                  <p className="text-sm text-gray-600">Many universities offer free financial counseling services. Take advantage of them to get personalized advice.</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent >

      </Tabs>
    </div>

  )
}