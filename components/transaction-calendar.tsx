"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ChevronLeft, ChevronRight, ArrowUpRight, ArrowDownRight } from "lucide-react"
import { Transaction } from "@/services/controllers/transactionController"

interface TransactionCalendarProps {
  transactions: Transaction[]
  userType: "student" | "young-adult"
}

export function TransactionCalendar({ transactions, userType }: TransactionCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date())

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
  ]

  const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
  }

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay()
  }

  const formatDateKey = (year: number, month: number, day: number) => {
    return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`
  }

  const getTransactionsForDate = (year: number, month: number, day: number) => {
    const dateKey = formatDateKey(year, month, day)
    return transactions.filter((t) => {
      // Handle both Transaction_Date and Created_Date fields
      const transactionDate = t.Transaction_Date || t.Transaction_Date
      if (!transactionDate) return false
      
      // Extract date part from datetime string if needed
      const transactionDateOnly = transactionDate.split('T')[0] || transactionDate
      return transactionDateOnly === dateKey
    })
  }

  const getDailyTotals = (year: number, month: number, day: number) => {
    const dayTransactions = getTransactionsForDate(year, month, day)
    
    const income = dayTransactions
      .filter((t) => t.Type === "Income")
      .reduce((sum, t) => sum + Math.abs(t.Amount), 0)
    
    const expenses = dayTransactions
      .filter((t) => t.Type === "Expense")
      .reduce((sum, t) => sum + Math.abs(t.Amount), 0)
    
    const netChange = income - expenses

    return { 
      income, 
      expenses, 
      netChange, 
      count: dayTransactions.length,
      hasIncome: income > 0,
      hasExpenses: expenses > 0
    }
  }

  const navigateMonth = (direction: "prev" | "next") => {
    setCurrentDate((prev) => {
      const newDate = new Date(prev)
      if (direction === "prev") {
        newDate.setMonth(prev.getMonth() - 1)
      } else {
        newDate.setMonth(prev.getMonth() + 1)
      }
      return newDate
    })
  }

  const isToday = (year: number, month: number, day: number) => {
    const today = new Date()
    return today.getFullYear() === year && today.getMonth() === month && today.getDate() === day
  }

  const formatAmount = (amount: number) => {
    return amount.toLocaleString('en-US', { 
      minimumFractionDigits: 0,
      maximumFractionDigits: 2 
    })
  }

  const renderCalendarDay = (day: number, isEmpty = false) => {
    if (isEmpty) {
      return <div className="h-28 p-1 border border-gray-100"></div>
    }

    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()
    const { income, expenses, netChange, count, hasIncome, hasExpenses } = getDailyTotals(year, month, day)
    const hasTransactions = count > 0

    return (
      <div
        className={`h-28 p-1 border border-gray-100 hover:bg-gray-50 transition-colors ${
          isToday(year, month, day) ? "bg-blue-50 border-blue-200" : ""
        }`}
      >
        <div className="h-full flex flex-col">
          {/* Day number */}
          <div className={`text-sm font-medium mb-1 ${
            isToday(year, month, day) ? "text-blue-600" : "text-gray-700"
          }`}>
            {day}
            {isToday(year, month, day) && (
              <span className="ml-1 text-xs bg-blue-500 text-white px-1 rounded">Today</span>
            )}
          </div>

          {/* Transaction summary */}
          {hasTransactions && (
            <div className="flex-1 space-y-1 overflow-hidden">
              {/* Income */}
              {hasIncome && (
                <div className="flex items-center text-xs">
                  <ArrowUpRight className="h-3 w-3 text-green-600 mr-1 flex-shrink-0" />
                  <span className="text-green-600 font-medium truncate">
                    +{formatAmount(income)}
                  </span>
                </div>
              )}

              {/* Expenses */}
              {hasExpenses && (
                <div className="flex items-center text-xs">
                  <ArrowDownRight className="h-3 w-3 text-red-600 mr-1 flex-shrink-0" />
                  <span className="text-red-600 font-medium truncate">
                    -{formatAmount(expenses)}
                  </span>
                </div>
              )}

              {/* Net Change */}
              <div className="flex items-center text-xs">
                <div className={`w-3 h-3 rounded-full mr-1 flex-shrink-0 ${
                  netChange > 0 ? "bg-green-500" : 
                  netChange < 0 ? "bg-red-500" : "bg-gray-400"
                }`}></div>
                <span className={`font-semibold truncate ${
                  netChange > 0 ? "text-green-600" : 
                  netChange < 0 ? "text-red-600" : "text-gray-600"
                }`}>
                  {netChange >= 0 ? "+" : ""}{formatAmount(netChange)}
                </span>
              </div>

              {/* Transaction count indicator */}
              {count > 0 && (
                <div className="text-xs text-gray-500 mt-1">
                  {count} transaction{count > 1 ? "s" : ""}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    )
  }

  const daysInMonth = getDaysInMonth(currentDate)
  const firstDay = getFirstDayOfMonth(currentDate)
  const calendarDays = []

  // Add empty cells for days before the first day of the month
  for (let i = 0; i < firstDay; i++) {
    calendarDays.push(
      <div key={`empty-${i}`} className="h-28 p-1 border border-gray-100"></div>
    )
  }

  // Add days of the month
  for (let day = 1; day <= daysInMonth; day++) {
    calendarDays.push(
      <div key={day}>
        {renderCalendarDay(day)}
      </div>
    )
  }

  // Calculate monthly totals
  const monthlyTotals = {
    income: 0,
    expenses: 0,
    netChange: 0,
    totalTransactions: 0
  }

  for (let day = 1; day <= daysInMonth; day++) {
    const { income, expenses, netChange, count } = getDailyTotals(
      currentDate.getFullYear(), 
      currentDate.getMonth(), 
      day
    )
    monthlyTotals.income += income
    monthlyTotals.expenses += expenses
    monthlyTotals.netChange += netChange
    monthlyTotals.totalTransactions += count
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl font-bold">
            {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
          </CardTitle>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => navigateMonth("prev")} 
              className="h-8 w-8 p-0"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setCurrentDate(new Date())} 
              className="text-xs px-2"
            >
              Today
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => navigateMonth("next")} 
              className="h-8 w-8 p-0"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        {/* Monthly Summary */}
        <div className="grid grid-cols-4 gap-4 mt-4 text-sm">
          <div className="text-center">
            <div className="text-green-600 font-semibold">
              +{formatAmount(monthlyTotals.income)}
            </div>
            <div className="text-xs text-gray-500">Income</div>
          </div>
          <div className="text-center">
            <div className="text-red-600 font-semibold">
              -{formatAmount(monthlyTotals.expenses)}
            </div>
            <div className="text-xs text-gray-500">Expenses</div>
          </div>
          <div className="text-center">
            <div className={`font-semibold ${
              monthlyTotals.netChange >= 0 ? "text-green-600" : "text-red-600"
            }`}>
              {monthlyTotals.netChange >= 0 ? "+" : ""}{formatAmount(monthlyTotals.netChange)}
            </div>
            <div className="text-xs text-gray-500">Net Change</div>
          </div>
          <div className="text-center">
            <div className="text-blue-600 font-semibold">
              {monthlyTotals.totalTransactions}
            </div>
            <div className="text-xs text-gray-500">Transactions</div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        {/* Calendar Header */}
        <div className="grid grid-cols-7 gap-0 mb-2">
          {daysOfWeek.map((day) => (
            <div key={day} className="p-2 text-center text-sm font-medium text-gray-600 bg-gray-50">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-0 border border-gray-200 rounded-lg overflow-hidden">
          {calendarDays}
        </div>

        {/* Legend */}
        <div className="mt-4 flex flex-wrap gap-4 text-xs text-gray-600">
          <div className="flex items-center gap-1">
            <ArrowUpRight className="h-3 w-3 text-green-600" />
            <span>Income</span>
          </div>
          <div className="flex items-center gap-1">
            <ArrowDownRight className="h-3 w-3 text-red-600" />
            <span>Expenses</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span>Positive Net</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            <span>Negative Net</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-blue-50 border border-blue-200 rounded"></div>
            <span>Today</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}