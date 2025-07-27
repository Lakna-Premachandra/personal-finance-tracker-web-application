"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { MoneyJarVisual } from "@/components/money-jar-visual"
import { PiggyBank, Plus, Trophy, Sparkles, Target, History, AlertCircle } from "lucide-react"
import { useCurrency } from "@/hooks/useCurrency"

interface Jar {
  id: number
  level: number
  targetAmount: number
  currentAmount: number
  isCompleted: boolean
  completedDate?: string
  daysToComplete?: number
}

interface ValidationErrors {
  amount?: string
}

export default function MoneyJarPage() {
        const { formatCurrency, getCurrencySymbol } = useCurrency();
  
  const [currentJar, setCurrentJar] = useState<Jar>({
    id: 1,
    level: 1,
    targetAmount: 5000,
    currentAmount: 2750,
    isCompleted: false,
  })

  const [jarHistory, setJarHistory] = useState<Jar[]>([
    {
      id: 0,
      level: 0,
      targetAmount: 2500,
      currentAmount: 2500,
      isCompleted: true,
      completedDate: "2024-01-15",
      daysToComplete: 45,
    },
  ])

  const [addAmount, setAddAmount] = useState("")
  const [isAnimating, setIsAnimating] = useState(false)
  const [errors, setErrors] = useState<ValidationErrors>({})
  const [showSuccess, setShowSuccess] = useState(false)

  const validateAmount = (amount: string): string | undefined => {
    if (!amount) return "Please enter an amount"
    const numAmount = Number.parseFloat(amount)
    if (isNaN(numAmount)) return "Please enter a valid number"
    if (numAmount <= 0) return "Amount must be greater than 0"
    if (numAmount > 10000) return "Maximum amount per transaction is {getCurrencySymbol()} 10,000"
    return undefined
  }

  const handleAddMoney = () => {
    setErrors({})
    const amountError = validateAmount(addAmount)

    if (amountError) {
      setErrors({ amount: amountError })
      return
    }

    const amount = Number.parseFloat(addAmount)
    setIsAnimating(true)

    setTimeout(() => {
      const newAmount = currentJar.currentAmount + amount

      if (newAmount >= currentJar.targetAmount) {
        // Jar completed - move to history and create new jar
        const completedJar = {
          ...currentJar,
          currentAmount: currentJar.targetAmount,
          isCompleted: true,
          completedDate: new Date().toISOString().split("T")[0],
          daysToComplete: Math.floor(Math.random() * 60) + 30, // Simulate days
        }

        setJarHistory((prev) => [completedJar, ...prev])

        // Create new jar with carry-over
        const carryOver = newAmount - currentJar.targetAmount
        const newLevel = currentJar.level + 1
        const newTargetAmount = newLevel * 5000 // Each level increases by 5000

        setCurrentJar({
          id: currentJar.id + 1,
          level: newLevel,
          targetAmount: newTargetAmount,
          currentAmount: carryOver,
          isCompleted: false,
        })

        setShowSuccess(true)
        setTimeout(() => setShowSuccess(false), 3000)
      } else {
        setCurrentJar((prev) => ({
          ...prev,
          currentAmount: newAmount,
        }))
      }

      setAddAmount("")
      setIsAnimating(false)
    }, 500)
  }

  const handleQuickAdd = (amount: number) => {
    setAddAmount(amount.toString())
    setErrors({})
  }

  const progressPercentage = (currentJar.currentAmount / currentJar.targetAmount) * 100
  const remainingAmount = currentJar.targetAmount - currentJar.currentAmount

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Money Jar</h1>
          <p className="text-secondary-600">Save small amounts daily and watch your jar fill up!</p>
        </div>
        <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
          <PiggyBank className="w-4 h-4 mr-1" />
          Level {currentJar.level}
        </Badge>
      </div>

      {/* Success Message */}
      {showSuccess && (
        <Card className="border-green-200 bg-green-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-green-700">
              <Trophy className="h-5 w-5" />
              <span className="font-medium">Congratulations! Jar completed and new level unlocked! 🎉</span>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Visual Jar */}
        <Card className="p-6">
          <div className="text-center space-y-4">
            <MoneyJarVisual
              currentAmount={currentJar.currentAmount}
              targetAmount={currentJar.targetAmount}
              level={currentJar.level}
              isAnimating={isAnimating}
            />

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Current: {getCurrencySymbol()} {currentJar.currentAmount.toLocaleString()}</span>
                <span>Target: {getCurrencySymbol()} {currentJar.targetAmount.toLocaleString()}</span>
              </div>
              <Progress value={progressPercentage} className="h-3" />
              <p className="text-sm text-secondary-600">
                {getCurrencySymbol()} {remainingAmount.toLocaleString()} remaining to complete this jar
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
                <Button variant="outline" size="sm" onClick={() => handleQuickAdd(100)} className="flex-1">
                  {getCurrencySymbol()} 100
                </Button>
                <Button variant="outline" size="sm" onClick={() => handleQuickAdd(250)} className="flex-1">
                  {getCurrencySymbol()} 250
                </Button>
                <Button variant="outline" size="sm" onClick={() => handleQuickAdd(500)} className="flex-1">
                  {getCurrencySymbol()} 500
                </Button>
              </div>
            </div>

            {/* Custom Amount */}
            <div className="space-y-2">
              <Label htmlFor="amount">Custom Amount</Label>
              <Input
                id="amount"
                type="number"
                placeholder="Enter amount "
                value={addAmount}
                onChange={(e) => {
                  setAddAmount(e.target.value)
                  if (errors.amount) {
                    setErrors({ ...errors, amount: undefined })
                  }
                }}
                className={errors.amount ? "border-red-500 focus:border-red-500 focus:ring-red-500" : ""}
                disabled={isAnimating}
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
              disabled={!addAmount || isAnimating}
            >
              {isAnimating ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
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
                Level {currentJar.level + 1}: {getCurrencySymbol()} {((currentJar.level + 1) * 5000).toLocaleString()} target
              </p>
            </div>
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
          <CardDescription>Your completed jars and achievements</CardDescription>
        </CardHeader>
        <CardContent>
          {jarHistory.length === 0 ? (
            <div className="text-center py-8 text-secondary-500">
              <PiggyBank className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>No completed jars yet. Keep saving to see your achievements here!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {jarHistory.map((jar) => (
                <div
                  key={jar.id}
                  className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-100 rounded-full">
                      <Trophy className="h-4 w-4 text-green-600" />
                    </div>
                    <div>
                      <p className="font-medium">Level {jar.level} Jar Completed</p>
                      <p className="text-sm text-secondary-600">
                        {getCurrencySymbol()} {jar.currentAmount.toLocaleString()} saved
                        {jar.daysToComplete && ` in ${jar.daysToComplete} days`}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge variant="secondary" className="bg-green-100 text-green-700">
                      <Sparkles className="w-3 h-3 mr-1" />
                      Completed
                    </Badge>
                    {jar.completedDate && (
                      <p className="text-xs text-secondary-500 mt-1">
                        {new Date(jar.completedDate).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
