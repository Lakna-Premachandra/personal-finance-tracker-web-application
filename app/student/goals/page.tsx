"use client"
//this is student goals page

import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
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
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Progress } from "@/components/ui/progress"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useCurrency } from "@/hooks/useCurrency"
import { cn } from "@/lib/utils"
import { useGetCategoriesByTypeAndUserTypeQuery } from "@/services/controllers/categoryController"
import { UpdateGoalRequest, useContributeToGoalMutation, useCreateGoalMutation, useDeleteGoalMutation, useGetGoalByIdQuery, useGetGoalsQuery, useMarkGoalAsSpentMutation, useUpdateGoalMutation } from "@/services/controllers/goalsController"
import { useGetTransactionsQuery } from "@/services/controllers/transactionController"
import {
  ArchiveRestore,
  Banknote,
  BookOpen,
  Calendar as CalendarIcon,
  Car,
  CheckCircle,
  CircleDotDashed,
  Clapperboard,
  Coins,
  Cookie,
  DollarSign,
  Edit,
  GraduationCap,
  HandCoins,
  Home,
  Loader2,
  PiggyBank,
  Plus,
  ShoppingCart,
  Target,
  Trash2,
  TrendingUp
} from "lucide-react"
import { format } from "date-fns"
import { useState } from "react"
import { toast } from "sonner"

type CategoryName =
  | "Emergency"
  | "Real Estate"
  | "Transportation"
  | "Education"
  | "Travel"
  | "Healthcare"
  | "Bills & Utilities"
  | "Food & Dining"
  | "Shopping"
  | "Entertainment"
  | "Other"

// Extended UpdateGoalRequest type to include Date for targetDate
interface ExtendedUpdateGoalRequest extends Omit<UpdateGoalRequest, 'targetDate'> {
  targetDate: Date | undefined;
}

export default function GoalsPage() {
  const { formatCurrency, getCurrencySymbol } = useCurrency()
  const [selectedGoalId, setSelectedGoalId] = useState<number | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [goalToDelete, setGoalToDelete] = useState<number | null>(null)
  const [markAsSpentDialogOpen, setMarkAsSpentDialogOpen] = useState(false)
  const [goalToMarkAsSpent, setGoalToMarkAsSpent] = useState<number | null>(null)

  // API hooks
  const { data: goalsData, isLoading: goalsLoading, refetch: refetchGoals } = useGetGoalsQuery()
  const { data: categoriesData, isLoading: categoriesLoading, refetch: refetchCategories } = useGetCategoriesByTypeAndUserTypeQuery({
    type: 'Expense',
    userType: 'Student'
  })

  const [createGoal, { isLoading: createLoading }] = useCreateGoalMutation()
  const [updateGoal, { isLoading: updateLoading }] = useUpdateGoalMutation()
  const [deleteGoal, { isLoading: deleteLoading }] = useDeleteGoalMutation()
  const [contributeToGoal, { isLoading: contributeLoading }] = useContributeToGoalMutation()
  const [markGoalAsSpent, { isLoading: markAsSpentLoading }] = useMarkGoalAsSpentMutation()
  const { data: transactionsData, isLoading: isTransactionsLoading, refetch: refetchTransactions } = useGetTransactionsQuery()

  // Get goal by ID query - only runs when selectedGoalId is not null
  const { data: goalData, isLoading: goalLoading, error: goalError } = useGetGoalByIdQuery(
    selectedGoalId!,
    { skip: !selectedGoalId }
  )

  // State management
  const [newGoal, setNewGoal] = useState({
    title: "",
    description: "",
    targetAmount: "",
    targetDate: undefined as Date | undefined,
    categoryId: "",
    startDate: new Date(),
  })

  const [editGoal, setEditGoal] = useState<ExtendedUpdateGoalRequest>({
    title: "",
    description: "",
    targetAmount: 0,
    targetDate: undefined,
    categoryId: 0,
    status: 'Active' as const
  })

  const [dialogOpen, setDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [contributionAmount, setContributionAmount] = useState("")
  const [contributingToGoal, setContributingToGoal] = useState<number | null>(null)

  // Extract goals data
  const goals = goalsData?.data || []
  const categories = categoriesData?.data || []
  const summaryActiveGoals = goalsData?.summary.activeGoals || 0
  const summaryCompletedGoals = goalsData?.summary.completedGoals || 0
  const summaryTotalSaved = goalsData?.summary.totalSaved || 0
  const summaryTotalTargetAmount = goalsData?.summary.totalTargetAmount || 0

  const activeGoals = goals.filter((goal) => goal.Status === "Active")
  const completedGoals = goals.filter((goal) => goal.Status === "Completed")
  const overdueGoals = goals.filter((goal) => goal.Status === "Overdue")
  const achievedGoals = goals.filter((goal) => goal.Status === "Achieved")
  const summary = transactionsData?.summary
  const netBalance = summary?.netBalance || 0

  // Handle form submission
  const handleCreateGoal = async () => {
    if (!newGoal.title || !newGoal.targetAmount || !newGoal.targetDate || !newGoal.categoryId) {
      toast("Please fill in all required fields")
      return
    }

    try {
      const goalData = {
        title: newGoal.title,
        description: newGoal.description,
        targetAmount: parseFloat(newGoal.targetAmount),
        targetDate: format(newGoal.targetDate, "yyyy-MM-dd"),
        categoryId: parseInt(newGoal.categoryId),
        startDate: format(newGoal.startDate, "yyyy-MM-dd")
      }

      const result = await createGoal(goalData)

      if (result.data?.success) {
        toast("Goal created successfully!")
        // Reset form and close dialog
        setNewGoal({
          title: "",
          description: "",
          targetAmount: "",
          targetDate: undefined,
          categoryId: "",
          startDate: new Date(),
        })
        setDialogOpen(false)
        refetchGoals()
      }
    } catch (error) {
      toast("Failed to create goal. Please try again.")
    }
  }

  const handleEditGoal = (goal: any) => {
    setSelectedGoalId(goal.Goal_ID)
    refetchCategories()

    setEditGoal({
      title: goal.Title,
      description: goal.Description,
      targetAmount: goal.Target_Amount,
      targetDate: new Date(goal.Target_Date),
      categoryId: goal.Category_ID,
      status: goal.Status
    })

    setEditDialogOpen(true)
  }

  // Handle update goal
  const handleUpdateGoal = async () => {
    if (!editGoal.title || !editGoal.targetAmount || !editGoal.targetDate || !editGoal.categoryId || !selectedGoalId) {
      toast("Please fill in all required fields")
      return
    }

    try {
      const goalData = {
        title: editGoal.title,
        description: editGoal.description,
        targetAmount: editGoal.targetAmount,
        targetDate: format(editGoal.targetDate, "yyyy-MM-dd"),
        categoryId: editGoal.categoryId,
        status: editGoal.status
      }

      const result = await updateGoal({
        id: selectedGoalId,
        data: goalData
      })

      if (result.data?.success) {
        toast("Goal updated successfully!")
        setEditDialogOpen(false)
        refetchGoals()
      }
    } catch (error) {
      toast("Failed to update goal. Please try again.")
    }
  }

  // Handle goal deletion
  const handleDeleteGoal = async () => {
    if (!goalToDelete) return

    try {
      const result = await deleteGoal(goalToDelete)
      if (result.data?.success) {
        toast("Goal deleted successfully!")
        refetchGoals()
      }
    } catch (error) {
      toast("Failed to delete goal. Please try again.")
    } finally {
      setDeleteDialogOpen(false)
      setGoalToDelete(null)
    }
  }

  // Add this function to open delete dialog:
  const openDeleteDialog = (goalId: number) => {
    setGoalToDelete(goalId)
    setDeleteDialogOpen(true)
  }

  // Handle contribution
  const handleContribute = async (goalId: number) => {

    if (!contributionAmount || parseFloat(contributionAmount) <= 0) {
      toast("Please enter a valid contribution amount")
      return
    }


    // Find the goal to check target amount
    const currentGoal = goals.find(goal => goal.Goal_ID === goalId)
    if (!currentGoal) {
      toast("Goal not found")
      return
    }

    const contributionValue = parseFloat(contributionAmount)
    const newTotalAmount = currentGoal.Current_Amount + contributionValue
    if (contributionValue > netBalance) {
      toast(`Contribution amount exceeds available balance! You can only add ${getCurrencySymbol()} ${netBalance.toFixed(2)} more to your goal.`)
      return
    }
    // Check if contribution would exceed target amount
    if (newTotalAmount > currentGoal.Target_Amount) {
      const remainingAmount = currentGoal.Target_Amount - currentGoal.Current_Amount
      toast(`Contribution amount exceeds target! You can only add ${getCurrencySymbol()} ${remainingAmount.toFixed(2)} more to reach your goal.`)
      return
    }

    try {
      const result = await contributeToGoal({
        id: goalId,
        data: { amount: contributionValue }
      })

      if (result.data?.success) {
        toast("Contribution added successfully!")
        setContributionAmount("")
        setContributingToGoal(null)
        refetchTransactions()
        refetchGoals()
      }
      else {
        // Handle unsuccessful response but no error thrown
        const errorMessage = result.data?.message || "Failed to add contribution"
        toast(errorMessage)
      }
    } catch (error: any) {
      // Handle different types of errors
      let errorMessage = "Failed to add contribution. Please try again."

      // Check if it's an RTK Query error with data
      if (error?.data) {
        // Handle 400 Bad Request - show alert for any 400 response
        if (error.status === 400) {
          errorMessage = error.data?.error || error.data?.message || "Invalid contribution amount or insufficient balance"
          // Show alert for 400 responses
          alert(errorMessage)
          return
        } else if (error.data?.message || error.data?.error) {
          errorMessage = error.data.message || error.data.error
        }
      }
      // Check if it's a network error or other error format
      else if (error?.message) {
        errorMessage = error.message
      }
      // Handle RTK Query error format
      else if (error?.error) {
        errorMessage = error.error
      }

      toast(errorMessage)
    }
  }

  // Handle mark as spent
  const handleMarkAsSpent = async () => {
    if (!goalToMarkAsSpent) return

    try {
      const result = await markGoalAsSpent(goalToMarkAsSpent)
      if (result.data?.success) {
        toast("Goal marked as spent and moved to completed!")
        refetchGoals()
      }
    } catch (error) {
      toast("Failed to mark goal as spent. Please try again.")
    } finally {
      setMarkAsSpentDialogOpen(false)
      setGoalToMarkAsSpent(null)
    }
  }

  // Add this function to open mark as spent dialog:
  const openMarkAsSpentDialog = (goalId: number) => {
    setGoalToMarkAsSpent(goalId)
    setMarkAsSpentDialogOpen(true)
  }

  // Clean up when dialog closes
  const handleEditDialogClose = (open: boolean) => {
    setEditDialogOpen(open)
    if (!open) {
      setSelectedGoalId(null)
    }
  }

  const getIconForCategoryBest = (categoryName: string) => {
    const iconMap: Record<CategoryName, any> = {
      "Emergency": Target,
      "Real Estate": Home,
      "Transportation": Car,
      "Education": GraduationCap,
      "Travel": Target,
      "Healthcare": Target,
      "Bills & Utilities": Banknote,
      "Food & Dining": Cookie,
      "Shopping": ShoppingCart,
      "Entertainment": Clapperboard,
      "Other": CircleDotDashed
    }
    return iconMap[categoryName as CategoryName] || Target
  }

  const getPriorityColor = (completionPercentage: number) => {
    if (completionPercentage >= 75) return "bg-green-100 text-green-700 border-green-200"
    if (completionPercentage >= 50) return "bg-yellow-100 text-yellow-700 border-yellow-200"
    return "bg-red-100 text-red-700 border-red-200"
  }

  // Get today's date for comparison
  const today = new Date()
  today.setHours(0, 0, 0, 0) // Reset time to start of day for accurate comparison

  if (goalsLoading) {
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">Financial Goals</h1>
          <p className="text-muted-foreground">Set and track your savings goals to achieve your dreams</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700 text-white">
              <Plus className="mr-2 h-4 w-4" />
              Add New Goal
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Create New Goal</DialogTitle>
              <DialogDescription>Set a new financial goal to work towards.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="title">Goal Title *</Label>
                <Input
                  id="title"
                  placeholder="e.g., Emergency Fund"
                  value={newGoal.title}
                  onChange={(e) => setNewGoal({ ...newGoal, title: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  placeholder="Brief description of your goal"
                  value={newGoal.description}
                  onChange={(e) => setNewGoal({ ...newGoal, description: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="categoryId">Category *</Label>
                <Select
                  value={newGoal.categoryId}
                  onValueChange={(value) => setNewGoal({ ...newGoal, categoryId: value })}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categoriesLoading ? (
                      <SelectItem value="loading" disabled>
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        Loading categories...
                      </SelectItem>
                    ) : (
                      categories.map((category) => (
                        <SelectItem key={category.Category_ID} value={category.Category_ID.toString()}>
                          {category.Name}
                          {!category.Is_Default && " (Custom)"}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="targetAmount">Target Amount ({getCurrencySymbol()}) *</Label>
                <Input
                  id="targetAmount"
                  type="number"
                  placeholder="500"
                  value={newGoal.targetAmount}
                  onChange={(e) => setNewGoal({ ...newGoal, targetAmount: e.target.value })}
                />
              </div>

              <div>
                <Label>Start Date *</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !newGoal.startDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {newGoal.startDate ? format(newGoal.startDate, "PPP") : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={newGoal.startDate}
                      onSelect={(date) => setNewGoal({ ...newGoal, startDate: date || new Date() })}
                      disabled={(date) => date < today}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div>
                <Label>Target Date *</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !newGoal.targetDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {newGoal.targetDate ? format(newGoal.targetDate, "PPP") : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={newGoal.targetDate}
                      onSelect={(date) => setNewGoal({ ...newGoal, targetDate: date })}
                      disabled={(date) => date < today}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <Button
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                onClick={handleCreateGoal}
                disabled={createLoading}
              >
                {createLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating Goal...
                  </>
                ) : (
                  "Create Goal"
                )}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Edit Goal Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={handleEditDialogClose}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Goal</DialogTitle>
            <DialogDescription>Update your financial goal details.</DialogDescription>
          </DialogHeader>
          {goalLoading && selectedGoalId ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin mr-2" />
              <span>Loading goal details...</span>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <Label htmlFor="editTitle">Goal Title *</Label>
                <Input
                  id="editTitle"
                  placeholder="e.g., Emergency Fund"
                  value={editGoal.title}
                  onChange={(e) => setEditGoal({ ...editGoal, title: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="editDescription">Description</Label>
                <Input
                  id="editDescription"
                  placeholder="Brief description of your goal"
                  value={editGoal.description}
                  onChange={(e) => setEditGoal({ ...editGoal, description: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="editCategoryId">Category *</Label>
                <Select
                  value={editGoal.categoryId?.toString()}
                  onValueChange={(value) => setEditGoal({ ...editGoal, categoryId: parseInt(value) })}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categoriesLoading ? (
                      <SelectItem value="loading" disabled>
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        Loading categories...
                      </SelectItem>
                    ) : (
                      categories.map((category) => (
                        <SelectItem key={category.Category_ID} value={category.Category_ID.toString()}>
                          {category.Name}
                          {!category.Is_Default && " (Custom)"}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="editTargetAmount">Target Amount ({getCurrencySymbol()}) *</Label>
                <Input
                  id="editTargetAmount"
                  type="number"
                  placeholder="500"
                  value={editGoal.targetAmount}
                  onChange={(e) => setEditGoal({ ...editGoal, targetAmount: parseFloat(e.target.value) })}
                />
              </div>

              <div>
                <Label>Target Date *</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !editGoal.targetDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {editGoal.targetDate ? format(editGoal.targetDate, "PPP") : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={editGoal.targetDate}
                      onSelect={(date) => setEditGoal({ ...editGoal, targetDate: date })}
                      disabled={(date) => date < today}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div>
                <Label htmlFor="editStatus">Status *</Label>
                <Select
                  disabled
                  value={editGoal.status}
                  onValueChange={(value: any) => setEditGoal({ ...editGoal, status: value })}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Active">Active</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                onClick={handleUpdateGoal}
                disabled={updateLoading}
              >
                {updateLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Updating Goal...
                  </>
                ) : (
                  "Update Goal"
                )}
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Overview Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-600">Active Goals</CardTitle>
            <Target className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-700">{summaryActiveGoals}</div>
            <p className="text-xs text-blue-600">In progress</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-600">Total Saved</CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-700">{getCurrencySymbol()} {summaryTotalSaved}</div>
            <p className="text-xs text-green-600">Across all goals</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-purple-600">Target Amount</CardTitle>
            <TrendingUp className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-700">{getCurrencySymbol()} {summaryTotalTargetAmount}</div>
            <p className="text-xs text-purple-600">Total target</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-orange-600">Completed</CardTitle>
            <CheckCircle className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-700">{summaryCompletedGoals}</div>
            <p className="text-xs text-orange-600">Goals achieved</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabbed Goals Section */}
      <Tabs defaultValue="active" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="active" className="flex items-center gap-2">
            <Target className="h-4 w-4" />
            Active Goals ({activeGoals.length})
          </TabsTrigger>
          <TabsTrigger value="achieved" className="flex items-center gap-2">
            <ArchiveRestore className="h-4 w-4" />
            Achieved ({achievedGoals.length})
          </TabsTrigger>
          <TabsTrigger value="completed" className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4" />
            Completed Goals ({completedGoals.length})
          </TabsTrigger>
          <TabsTrigger value="overdue" className="flex items-center gap-2">
            <Coins className="h-4 w-4" />
            Overdue ({overdueGoals.length})
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
                <Button
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                  onClick={() => setDialogOpen(true)}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Create Your First Goal
                </Button>
              </div>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-3">
              {activeGoals.map((goal) => {
                const IconComponent = getIconForCategoryBest(goal.Category_Name)
                return (
                  <Card key={goal.Goal_ID} className="border-blue-200">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3">
                          <div className="p-2 rounded-lg bg-blue-600 text-white">
                            <IconComponent className="h-5 w-5" />
                          </div>
                          <div>
                            <CardTitle className="text-lg">{goal.Title}</CardTitle>
                            <CardDescription className="mt-1">{goal.Description}</CardDescription>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => handleEditGoal(goal)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-red-500 hover:text-red-700"
                            onClick={() => openDeleteDialog(goal.Goal_ID)}
                            disabled={deleteLoading}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      <div className="flex gap-2 mt-2">
                        <Badge>{goal.Category_Name}</Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <div className="flex justify-between text-sm mb-2">
                          <span>Progress</span>
                          <span>
                            {getCurrencySymbol()} {goal.Current_Amount.toLocaleString()} / {getCurrencySymbol()} {goal.Target_Amount.toLocaleString()}
                          </span>
                        </div>
                        <Progress className="h-2 bg-slate-200 border" value={goal.Completion_Percentage} />
                        <div className="text-xs text-muted-foreground mt-1">
                          {goal.Completion_Percentage.toFixed(1)}% complete
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <CalendarIcon className="h-4 w-4" />
                          <span>{goal.Days_Left} days left</span>
                        </div>
                        <div className="text-muted-foreground">
                          {getCurrencySymbol()} {goal.Remaining_Amount.toLocaleString()} remaining
                        </div>
                      </div>

                      <div className={`text-xs ${netBalance < 0 ? 'text-red-500' : 'text-green-500'}`}>
                        Net Balance: {getCurrencySymbol()} {netBalance.toFixed(2)}
                      </div>

                      <div className="text-xs text-muted-foreground">
                        Daily saving required: {getCurrencySymbol()} {goal.Daily_Saving_Required.toFixed(2)}
                      </div>

                      {contributingToGoal === goal.Goal_ID ? (
                        <div className="space-y-2">
                          <Input
                            type="number"
                            placeholder={`Max: ${getCurrencySymbol()} ${goal.Remaining_Amount.toFixed(2)}`}
                            value={contributionAmount}
                            onChange={(e) => setContributionAmount(e.target.value)}
                            max={goal.Remaining_Amount}
                          />
                          <div className="text-xs text-muted-foreground">
                            Maximum you can add: {getCurrencySymbol()} {goal.Remaining_Amount.toFixed(2)}
                          </div>

                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                              onClick={() => handleContribute(goal.Goal_ID)}
                              disabled={contributeLoading}
                            >
                              {contributeLoading ? (
                                <Loader2 className="h-4 w-4 animate-spin mr-1" />
                              ) : null}
                              Add
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setContributingToGoal(null)
                                setContributionAmount("")
                              }}
                            >
                              Cancel
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <Button
                          size="sm"
                          className="w-full text-white"
                          onClick={() => setContributingToGoal(goal.Goal_ID)}
                        >
                          Add Money to Goal
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </TabsContent>

        <TabsContent value="achieved" className="space-y-4">
          {achievedGoals.length === 0 ? (
            <Card className="p-8 text-center">
              <div className="flex flex-col items-center gap-4">
                <ArchiveRestore className="h-12 w-12 text-gray-400" />
                <div>
                  <h3 className="text-lg font-semibold">No Achieved Goals Yet</h3>
                  <p className="text-muted-foreground">Achieve your first goal to see it here!</p>
                </div>
              </div>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-3">
              {achievedGoals.map((goal) => {
                const IconComponent = getIconForCategoryBest(goal.Category_Name)
                return (
                  <Card key={goal.Goal_ID} className="bg-gradient-to-br from-orange-50 to-yellow-50 border-orange-200">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3">
                          <div className="p-2 rounded-lg bg-orange-500 text-white">
                            <IconComponent className="h-5 w-5" />
                          </div>
                          <div>
                            <CardTitle className="text-lg">{goal.Title}</CardTitle>
                            <CardDescription className="mt-1">{goal.Description}</CardDescription>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-red-500 hover:text-red-700"
                            onClick={() => openDeleteDialog(goal.Goal_ID)}
                            disabled={deleteLoading}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      <div className="flex gap-2 mt-2">
                        <Badge className="bg-orange-500">{goal.Category_Name}</Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="text-lg font-semibold text-orange-700">
                        Goal Achieved: {getCurrencySymbol()} {goal.Target_Amount.toLocaleString()}
                      </div>
                      <p className="text-sm text-orange-600">
                        Achieved on {new Date(goal.Updated_Date).toLocaleDateString()}
                      </p>
                      <p className="text-sm text-orange-600 mb-3">Congratulations on reaching your goal</p>

                      <Button
                        className="w-full bg-orange-500 hover:bg-orange-600 text-white"
                        onClick={() => openMarkAsSpentDialog(goal.Goal_ID)}
                        disabled={markAsSpentLoading}
                      >
                        {markAsSpentLoading ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Marking as Spent...
                          </>
                        ) : (
                          <>
                            <HandCoins className="mr-2 h-4 w-4" />
                            Mark as Spent
                          </>
                        )}
                      </Button>
                    </CardContent>
                  </Card>
                )
              })}
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
            <div className="grid gap-4 md:grid-cols-3">
              {completedGoals.map((goal) => {
                const IconComponent = getIconForCategoryBest(goal.Category_Name)
                return (
                  <Card key={goal.Goal_ID} className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3">
                          <div className="p-2 rounded-lg bg-green-500 text-white">
                            <IconComponent className="h-5 w-5" />
                          </div>
                          <div>
                            <CardTitle className="text-lg">{goal.Title}</CardTitle>
                            <CardDescription className="mt-1">{goal.Description}</CardDescription>
                          </div>
                        </div>
                        {/* No edit/delete buttons for completed goals */}
                      </div>
                      <div className="flex gap-2 mt-2">
                        <Badge className="bg-green-500">{goal.Category_Name}</Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="text-lg font-semibold text-green-700">
                        Goal Completed: {getCurrencySymbol()} {goal.Target_Amount.toLocaleString()}
                      </div>
                      <p className="text-sm text-green-600">
                        Completed on {new Date(goal.Updated_Date).toLocaleDateString()}
                      </p>
                      <p className="text-sm text-green-600">Goal has been marked as spent and added to expenses! </p>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </TabsContent>

        <TabsContent value="overdue" className="space-y-4">
          {overdueGoals.length === 0 ? (
            <Card className="p-8 text-center">
              <div className="flex flex-col items-center gap-4">
                <Coins className="h-12 w-12 text-gray-400" />
                <div>
                  <h3 className="text-lg font-semibold">No Overdue Goals</h3>
                  <p className="text-muted-foreground">All your goals are on track!</p>
                </div>
              </div>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-3">
              {overdueGoals.map((goal) => {
                const IconComponent = getIconForCategoryBest(goal.Category_Name)
                return (
                  <Card key={goal.Goal_ID} className="bg-gradient-to-br from-red-50 to-red-100 border-red-200">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3">
                          <div className="p-2 rounded-lg bg-red-500 text-white">
                            <IconComponent className="h-5 w-5" />
                          </div>
                          <div>
                            <CardTitle className="text-lg">{goal.Title}</CardTitle>
                            <CardDescription className="mt-1">{goal.Description}</CardDescription>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => handleEditGoal(goal)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-red-500 hover:text-red-700"
                            onClick={() => openDeleteDialog(goal.Goal_ID)}
                            disabled={deleteLoading}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      <div className="flex gap-2 mt-2">
                        <Badge className="bg-red-500">{goal.Category_Name}</Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="text-lg font-semibold text-red-700">
                        Goal Amount: {getCurrencySymbol()} {goal.Target_Amount.toLocaleString()}
                      </div>
                      <div className="text-sm text-red-600">
                        Current Amount: {getCurrencySymbol()} {goal.Current_Amount.toLocaleString()}
                      </div>
                      <p className="text-sm text-red-600">
                        Due on {new Date(goal.Target_Date).toLocaleDateString()}
                      </p>
                      <p className="text-sm text-red-600">Don't forget to check your progress!</p>

                      {contributingToGoal === goal.Goal_ID ? (
                        <div className="space-y-2 mt-3">
                          <Input
                            type="number"
                            placeholder="Enter amount"
                            value={contributionAmount}
                            onChange={(e) => setContributionAmount(e.target.value)}
                          />
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                              onClick={() => handleContribute(goal.Goal_ID)}
                              disabled={contributeLoading}
                            >
                              {contributeLoading ? (
                                <Loader2 className="h-4 w-4 animate-spin mr-1" />
                              ) : null}
                              Add
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setContributingToGoal(null)
                                setContributionAmount("")
                              }}
                            >
                              Cancel
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <Button
                          size="sm"
                          className="w-full bg-red-600 hover:bg-red-700 text-white mt-3"
                          onClick={() => setContributingToGoal(goal.Goal_ID)}
                        >
                          Add Money to Goal
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Delete Goal Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete your goal
              and remove all associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteGoal}
              disabled={deleteLoading}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {deleteLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete Goal"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Mark as Spent Dialog */}
      <AlertDialog open={markAsSpentDialogOpen} onOpenChange={setMarkAsSpentDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Mark Goal as Spent?</AlertDialogTitle>
            <AlertDialogDescription>
              This will create an expense transaction for the goal amount and mark the goal as completed.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setMarkAsSpentDialogOpen(false)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleMarkAsSpent}
              disabled={markAsSpentLoading}
              className="bg-orange-600 hover:bg-orange-700 text-white"
            >
              {markAsSpentLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Marking as Spent...
                </>
              ) : (
                <>
                  <HandCoins className="mr-2 h-4 w-4" />
                  Mark as Spent
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}