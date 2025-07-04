"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ChevronLeft, ChevronRight, ArrowUpRight, ArrowDownRight } from "lucide-react"

interface Transaction {
  id: number
  type: "income" | "expense"
  description: string
  amount: number
  category: string
  date: string
  time: string
}

interface TransactionCalendarProps {
  transactions: Transaction[]
  userType: "student" | "young-adult"
}

export function TransactionCalendar({ transactions, userType }: TransactionCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date())

  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
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
    return transactions.filter((t) => t.date === dateKey)
  }

  const getDailyTotals = (year: number, month: number, day: number) => {
    const dayTransactions = getTransactionsForDate(year, month, day)
    const income = dayTransactions.filter((t) => t.type === "income").reduce((sum, t) => sum + t.amount, 0)
    const expenses = dayTransactions.filter((t) => t.type === "expense").reduce((sum, t) => sum + Math.abs(t.amount), 0)
    const balance = income - expenses

    return { income, expenses, balance, count: dayTransactions.length }
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

  const renderCalendarDay = (day: number, isEmpty = false) => {
    if (isEmpty) {
      return <div className="h-24 p-1"></div>
    }

    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()
    const { income, expenses, balance, count } = getDailyTotals(year, month, day)
    const hasTransactions = count > 0

    return (
      <div
        className={`h-24 p-1 border border-gray-100 hover:bg-gray-50 transition-colors ${
          isToday(year, month, day) ? "bg-blue-50 border-blue-200" : ""
        }`}
      >
        <div className="h-full flex flex-col">
          <div className={`text-sm font-medium mb-1 ${isToday(year, month, day) ? "text-blue-600" : "text-gray-700"}`}>
            {day}
            {isToday(year, month, day) && (
              <span className="ml-1 text-xs bg-blue-500 text-white px-1 rounded">Today</span>
            )}
          </div>

          {hasTransactions && (
            <div className="flex-1 space-y-1">
              {income > 0 && (
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1">
                    <ArrowUpRight className="h-3 w-3 text-green-600" />
                    <span className="text-green-600 font-medium">+${income}</span>
                  </div>
                </div>
              )}

              {expenses > 0 && (
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1">
                    <ArrowDownRight className="h-3 w-3 text-red-600" />
                    <span className="text-red-600 font-medium">-${expenses}</span>
                  </div>
                </div>
              )}

              <div
                className={`text-xs font-semibold ${
                  balance > 0 ? "text-green-600" : balance < 0 ? "text-red-600" : "text-gray-600"
                }`}
              >
                Net: {balance > 0 ? "+" : ""}${balance}
              </div>

              {count > 2 && (
                <Badge variant="secondary" className="text-xs px-1 py-0">
                  +{count - 2} more
                </Badge>
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
    calendarDays.push(renderCalendarDay(0, true))
  }

  // Add days of the month
  for (let day = 1; day <= daysInMonth; day++) {
    calendarDays.push(renderCalendarDay(day))
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl font-bold">
            {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
          </CardTitle>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => navigateMonth("prev")} className="h-8 w-8 p-0">
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={() => setCurrentDate(new Date())} className="text-xs px-2">
              Today
            </Button>
            <Button variant="outline" size="sm" onClick={() => navigateMonth("next")} className="h-8 w-8 p-0">
              <ChevronRight className="h-4 w-4" />
            </Button>
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
        <div className="grid grid-cols-7 gap-0 border border-gray-200 rounded-lg overflow-hidden">{calendarDays}</div>

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
            <div className="w-3 h-3 bg-blue-50 border border-blue-200 rounded"></div>
            <span>Today</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
