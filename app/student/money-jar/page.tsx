"use client"
//mney jar
import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { MoneyJarVisual } from "@/components/money-jar-visual"
import { PiggyBank, Plus, Trophy, Sparkles, Target, History, AlertCircle, Loader2, ArrowRight, ShoppingCart, X } from "lucide-react"
import { useCurrency } from "@/hooks/useCurrency"
import { useAddMoneyToJarMutation, useGetCurrentJarQuery, useGetJarHistoryQuery, useMarkJarSpentMutation, useTransferToGoalMutation } from "@/services/controllers/jarsController"
import SpentDialog from "@/components/SpentDialog"
import { TransferDialog } from "@/components/TransferDialog"
import { toast } from "sonner"

interface ValidationErrors {
  amount?: string
}

interface Goal {
  id: number
  title: string
  targetAmount: number
  currentAmount: number
}

interface TransferDialogProps {
  isOpen: boolean
  onClose: () => void
  jarId: number
  jarAmount: number
  onTransfer: (goalId: number) => void
}



export default function MoneyJarPage() {
  const { formatCurrency, getCurrencySymbol } = useCurrency();

  // RTK Query hooks
  const {
    data: currentJarData,
    isLoading: isLoadingCurrentJar,
    error: currentJarError,
    refetch: refetchCurrentJar
  } = useGetCurrentJarQuery()

  const {
    data: jarHistoryData,
    isLoading: isLoadingHistory,
    error: historyError
  } = useGetJarHistoryQuery()

  const completedJars = jarHistoryData?.data || []

  const [addMoneyToJar, {
    isLoading: isAddingMoney,
    error: addMoneyError
  }] = useAddMoneyToJarMutation()

  const [markJarSpent, {
    isLoading: isMarkingSpent,
    error: markSpentError
  }] = useMarkJarSpentMutation()

  const [transferToGoal, {
    isLoading: isTransferring,
    error: transferError
  }] = useTransferToGoalMutation()

  const handleTransferComplete = async (goalId: number) => {
    if (!transferDialog.jarId) return

    try {
      await transferToGoal({
        jarId: transferDialog.jarId,
        goalId: goalId
      }).unwrap()

      // Close dialog and refetch data
      setTransferDialog({ isOpen: false, jarId: null, jarAmount: 0 })
      refetchCurrentJar()

    } catch (error) {
      console.error('Failed to transfer to goal:', error)
      // Handle error - you might want to show an error message
    }
  }

  // Local state
  const [addAmount, setAddAmount] = useState("")
  const [errors, setErrors] = useState<ValidationErrors>({})
  const [showSuccess, setShowSuccess] = useState(false)
  const [transferDialog, setTransferDialog] = useState<{
    isOpen: boolean
    jarId: number | null
    jarAmount: number
  }>({
    isOpen: false,
    jarId: null,
    jarAmount: 0
  })



  const [spentDialog, setSpentDialog] = useState<{
    isOpen: boolean
    jarId: number | null
    jarAmount: number
  }>({
    isOpen: false,
    jarId: null,
    jarAmount: 0
  })
  // Extract data from API responses
  const currentJar = currentJarData?.data?.currentJar
  const stats = currentJarData?.data?.stats

  const handleMarkAsSpent = async (jarId: number, jarAmount: number) => {
    setSpentDialog({
      isOpen: true,
      jarId,
      jarAmount
    })
  }

  // 7. Add handleMarkSpentComplete function
  const handleMarkSpentComplete = async (data: { title: string; categoryId: number; description: string }) => {
    if (!spentDialog.jarId) return

    try {
      await markJarSpent({
        jarId: spentDialog.jarId,
        ...data
      }).unwrap()

      // Close dialog and refetch data
      setSpentDialog({ isOpen: false, jarId: null, jarAmount: 0 })
      refetchCurrentJar()
      toast.success("Jar marked as spent successfully!")

    } catch (error) {
      console.error('Failed to mark jar as spent:', error)
      // Handle error - you might want to show an error message
    }
  }
  // Mock completed jars for demonstration - replace with actual data
  

  // Handle API errors
  useEffect(() => {
    if (addMoneyError) {
      const errorMessage = 'data' in addMoneyError
        ? (addMoneyError.data as any)?.message || 'Failed to add money'
        : 'Network error occurred'
      setErrors({ amount: errorMessage })
    }
  }, [addMoneyError])

  const validateAmount = (amount: string): string | undefined => {
    if (!amount) return "Please enter an amount"
    const numAmount = Number.parseFloat(amount)
    if (isNaN(numAmount)) return "Please enter a valid number"
    if (numAmount <= 0) return "Amount must be greater than 0"
    if (numAmount > 10000) return `Maximum amount per transaction is ${getCurrencySymbol()}10,000`
    return undefined
  }

  const handleAddMoney = async () => {
    // Handle both existing jar and new user case
    const targetJar = currentJar || {
      Jar_ID: 0,
      Target_Amount: 5000,
      Current_Amount: 0,
      Level: 1
    }

    setErrors({})
    const amountError = validateAmount(addAmount)

    if (amountError) {
      setErrors({ amount: amountError })
      return
    }

    try {
      const amount = Number.parseFloat(addAmount)
      const result = await addMoneyToJar({ amount }).unwrap()

      // Clear form
      setAddAmount("")

      // Show success message if jar level was completed
      if (result.jarCompleted && result.newLevel) {
        setShowSuccess(true)
        setTimeout(() => setShowSuccess(false), 3000)
      }

      // Refetch current jar data to get updated information
      refetchCurrentJar()

    } catch (error) {
      // Error is handled by useEffect above
      console.error('Failed to add money:', error)
    }
  }

  const handleQuickAdd = (amount: number) => {
    setAddAmount(amount.toString())
    setErrors({})
  }

  const handleTransferToGoal = (jarId: number, jarAmount: number) => {
    setTransferDialog({
      isOpen: true,
      jarId,
      jarAmount
    })
  }





  // Loading states
  if (isLoadingCurrentJar) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
          <p className="text-secondary-600">Loading your money jar...</p>
        </div>
      </div>
    )
  }

  // Error states
  if (currentJarError) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-red-700 mb-2">Error Loading Jar</h3>
            <p className="text-red-600 mb-4">
              {'data' in currentJarError
                ? (currentJarError.data as any)?.message || 'Failed to load jar data'
                : 'Network error occurred'}
            </p>
            <Button onClick={() => refetchCurrentJar()} variant="outline">
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  // No current jar state - show default Level 1 jar for new users
  if (!currentJar) {
    // Default jar for new users
    const defaultJar = {
      Jar_ID: 0,
      User_ID: 0,
      Target_Amount: 5000,
      Current_Amount: 0,
      Level: 1,
      Status: 'Active' as const,
      Created_Date: new Date().toISOString(),
      Updated_Date: new Date().toISOString(),
      Completion_Date: null,
      Action_Taken: null,
      Goal_ID: null,
      Expense_ID: null,
    }

    const progressPercentage = (defaultJar.Current_Amount / defaultJar.Target_Amount) * 100
    const remainingAmount = defaultJar.Target_Amount - defaultJar.Current_Amount

    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Money Jar</h1>
            <p className="text-secondary-600">Start your savings journey! Save small amounts daily and watch your jar fill up!</p>
          </div>
          <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
            <PiggyBank className="w-4 h-4 mr-1" />
            Level {defaultJar.Level}
          </Badge>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Visual Jar */}
          <Card className="p-6">
            <div className="text-center space-y-4">
              <MoneyJarVisual
                currentAmount={defaultJar.Current_Amount}
                targetAmount={defaultJar.Target_Amount}
                level={defaultJar.Level}
                isAnimating={isAddingMoney}
              />

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Current: {formatCurrency(defaultJar.Current_Amount)}</span>
                  <span>Target: {formatCurrency(defaultJar.Target_Amount)}</span>
                </div>
                <Progress value={progressPercentage} className="h-2 bg-slate-200 border" />
                <p className="text-sm text-secondary-600">
                  {formatCurrency(remainingAmount)} remaining to complete this jar
                </p>
              </div>
            </div>
          </Card>

          {/* Add Money Controls */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="h-5 w-5" />
                Add Money to Jar
              </CardTitle>
              <CardDescription>Start saving! Add any amount to begin your savings journey.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Quick Add Buttons */}
              <div>
                <Label className="text-sm font-medium">Quick Add</Label>
                <div className="flex gap-2 mt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleQuickAdd(100)}
                    className="flex-1"
                    disabled={isAddingMoney}
                  >
                    {getCurrencySymbol()}100
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleQuickAdd(250)}
                    className="flex-1"
                    disabled={isAddingMoney}
                  >
                    {getCurrencySymbol()}250
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleQuickAdd(500)}
                    className="flex-1"
                    disabled={isAddingMoney}
                  >
                    {getCurrencySymbol()}500
                  </Button>
                </div>
              </div>

              {/* Custom Amount */}
              <div className="space-y-2">
                <Label htmlFor="amount">Custom Amount</Label>
                <Input
                  id="amount"
                  type="number"
                  placeholder="Enter amount"
                  value={addAmount}
                  onChange={(e) => {
                    setAddAmount(e.target.value)
                    if (errors.amount) {
                      setErrors({ ...errors, amount: undefined })
                    }
                  }}
                  className={errors.amount ? "border-red-500 focus:border-red-500 focus:ring-red-500" : ""}
                  disabled={isAddingMoney}
                />
                {errors.amount && (
                  <p className="text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {errors.amount}
                  </p>
                )}
              </div>

              <Button
                onClick={handleAddMoney}
                className="w-full bg-primary hover:bg-primary-700"
                disabled={!addAmount || isAddingMoney}
              >
                {isAddingMoney ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Adding Money...
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4 mr-2" />
                    Start Your Jar
                  </>
                )}
              </Button>

              {/* Next Level Preview */}
              <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-center gap-2 text-blue-700 mb-1">
                  <Target className="h-4 w-4" />
                  <span className="font-medium text-sm">Next Level Preview</span>
                </div>
                <p className="text-sm text-blue-600">
                  Level 2: {formatCurrency(10000)} target
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

      
      </div>
    )
  }

  const progressPercentage = (currentJar.Current_Amount / currentJar.Target_Amount) * 100
  const remainingAmount = currentJar.Target_Amount - currentJar.Current_Amount

  return (
    <div className="space-y-6">
      {/* Transfer Dialog */}
      <TransferDialog
        isOpen={transferDialog.isOpen}
        onClose={() => setTransferDialog({ isOpen: false, jarId: null, jarAmount: 0 })}
        jarId={transferDialog.jarId || 0}
        jarAmount={transferDialog.jarAmount}
        onTransfer={handleTransferComplete}
      />

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Money Jar</h1>
          <p className="text-secondary-600">Save small amounts daily and watch your jar fill up!</p>
        </div>
        <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
          <PiggyBank className="w-4 h-4 mr-1" />
          Level {currentJar.Level}
        </Badge>
      </div>

      {/* Success Message */}
      {showSuccess && (
        <Card className="border-green-200 bg-green-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-green-700">
              <Trophy className="h-5 w-5" />
              <span className="font-medium">Congratulations! Level completed and jar upgraded! 🎉</span>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Visual Jar */}
        <Card className="p-6">
          <div className="text-center space-y-4">
            <MoneyJarVisual
              currentAmount={currentJar.Current_Amount}
              targetAmount={currentJar.Target_Amount}
              level={currentJar.Level}
              isAnimating={isAddingMoney}
            />

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Current: {formatCurrency(currentJar.Current_Amount)}</span>
                <span>Target: {formatCurrency(currentJar.Target_Amount)}</span>
              </div>
              <Progress value={progressPercentage} className="h-2 bg-slate-200 border" />
              <p className="text-sm text-secondary-600">
                {formatCurrency(remainingAmount)} remaining to complete this jar
              </p>
            </div>
          </div>
        </Card>

        {/* Add Money Controls */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5" />
              Add Money to Jar
            </CardTitle>
            <CardDescription>Add any amount to your savings jar. Every little bit counts!</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Quick Add Buttons */}
            <div>
              <Label className="text-sm font-medium">Quick Add</Label>
              <div className="flex gap-2 mt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleQuickAdd(100)}
                  className="flex-1"
                  disabled={isAddingMoney}
                >
                  {getCurrencySymbol()}100
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleQuickAdd(250)}
                  className="flex-1"
                  disabled={isAddingMoney}
                >
                  {getCurrencySymbol()}250
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleQuickAdd(500)}
                  className="flex-1"
                  disabled={isAddingMoney}
                >
                  {getCurrencySymbol()}500
                </Button>
              </div>
            </div>

            {/* Custom Amount */}
            <div className="space-y-2">
              <Label htmlFor="amount">Custom Amount</Label>
              <Input
                id="amount"
                type="number"
                placeholder="Enter amount"
                value={addAmount}
                onChange={(e) => {
                  setAddAmount(e.target.value)
                  if (errors.amount) {
                    setErrors({ ...errors, amount: undefined })
                  }
                }}
                className={errors.amount ? "border-red-500 focus:border-red-500 focus:ring-red-500" : ""}
                disabled={isAddingMoney}
              />
              {errors.amount && (
                <p className="text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.amount}
                </p>
              )}
            </div>

            <Button
              onClick={handleAddMoney}
              className="w-full bg-primary hover:bg-primary-700"
              disabled={!addAmount || isAddingMoney}
            >
              {isAddingMoney ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Adding Money...
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4 mr-2" />
                  Add to Jar
                </>
              )}
            </Button>

            {/* Next Level Preview */}
            <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-center gap-2 text-blue-700 mb-1">
                <Target className="h-4 w-4" />
                <span className="font-medium text-sm">Next Level Preview</span>
              </div>
              <p className="text-sm text-blue-600">
                Level {(currentJar?.Level || 1) + 1}: {formatCurrency(((currentJar?.Level || 1) + 1) * 5000)} target
              </p>
            </div>

            {/* Current Stats */}
            {stats && (
              <div className="p-3 bg-purple-50 rounded-lg border border-purple-200">
                <div className="flex items-center gap-2 text-purple-700 mb-2">
                  <Trophy className="h-4 w-4" />
                  <span className="font-medium text-sm">Your Progress</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm text-purple-600">
                  <div>Jars Completed: {stats.totalJarsCompleted}</div>
                  <div>Total Saved: {formatCurrency(stats.totalAmountSaved)}</div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Jar History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            Jar History
          </CardTitle>
          <CardDescription>Your completed levels and achievements</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoadingHistory ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
              <span className="ml-2 text-secondary-600">Loading history...</span>
            </div>
          ) : historyError ? (
            <div className="text-center py-8 text-red-500">
              <AlertCircle className="h-8 w-8 mx-auto mb-2" />
              <p>Failed to load jar history</p>
            </div>
          ) : completedJars.length === 0 ? (
            <div className="text-center py-8 text-secondary-500">
              <PiggyBank className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>No completed jars yet. Keep saving to see your achievements here!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {completedJars.map((jar) => (
                <div
                  key={jar.Jar_ID}
                  className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-100 rounded-full">
                      <Trophy className="h-4 w-4 text-green-600" />
                    </div>
                    <div>
                      <p className="font-medium">Level {jar.Level} Jar Completed</p>
                      <p className="text-sm text-secondary-600">
                        {formatCurrency(jar.Target_Amount)} saved
                      </p>

                      {/* Show action taken status */}
                      {jar.Action_Taken === 'transferred' && jar.Goal_Title && (
                        <p className="text-xs text-blue-600 flex items-center gap-1">
                          <ArrowRight className="h-3 w-3" />
                          Transferred to: {jar.Goal_Title}
                        </p>
                      )}
                      {jar.Action_Taken === 'spent' && jar.Expense_Title && (
                        <p className="text-xs text-orange-600 flex items-center gap-1">
                          <ShoppingCart className="h-3 w-3" />
                          Spent on: {jar.Expense_Title}
                        </p>
                      )}
                      {jar.Action_Taken === 'spent' && !jar.Expense_Title && (
                        <p className="text-xs text-orange-600 flex items-center gap-1">
                          <ShoppingCart className="h-3 w-3" />
                          Marked as spent
                        </p>
                      )}

                      <p className="text-xs text-secondary-500 mt-1">
                        Completed on {new Date(jar.Completion_Date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    {/* Show action buttons only if no action has been taken */}
                    {!jar.Action_Taken ? (
                      <>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleTransferToGoal(jar.Jar_ID, jar.Target_Amount)}
                          className="text-blue-600 border-blue-200 hover:bg-blue-50"
                        >
                          <ArrowRight className="w-3 h-3 mr-1" />
                          Transfer to Goal
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleMarkAsSpent(jar.Jar_ID, jar.Target_Amount)}
                          className="text-orange-600 border-orange-200 hover:bg-orange-50"
                        >
                          <ShoppingCart className="w-3 h-3 mr-1" />
                          Mark as Spent
                        </Button>
                      </>
                    ) : (
                      <Badge
                        variant="secondary"
                        className={
                          jar.Action_Taken === 'transferred'
                            ? "bg-blue-100 text-blue-700"
                            : "bg-orange-100 text-orange-700"
                        }
                      >
                        <Sparkles className="w-3 h-3 mr-1" />
                        {jar.Action_Taken === 'transferred' ? 'Transferred' : 'Spent'}
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
      <SpentDialog
        isOpen={spentDialog.isOpen}
        onClose={() => setSpentDialog({ isOpen: false, jarId: null, jarAmount: 0 })}
        jarId={spentDialog.jarId || 0}
        jarAmount={spentDialog.jarAmount}
        onMarkSpent={handleMarkSpentComplete}
      />
    </div>
  )
}