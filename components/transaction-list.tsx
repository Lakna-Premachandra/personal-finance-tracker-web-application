"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { ArrowUpRight, ArrowDownRight, Search, Filter, Edit, Trash2, Calendar } from "lucide-react"

interface Transaction {
  id: number
  type: "income" | "expense"
  description: string
  amount: number
  category: string
  date: string
  time: string
}

interface TransactionListProps {
  transactions: Transaction[]
  userType: "student" | "young-adult"
}

export function TransactionList({ transactions, userType }: TransactionListProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [filterType, setFilterType] = useState("all")
  const [filterCategory, setFilterCategory] = useState("all")
  const [sortBy, setSortBy] = useState("date-desc")

  const categories =
    userType === "student"
      ? ["Food", "Entertainment", "Education", "Transportation", "Allowance", "Work"]
      : ["Salary", "Freelance", "Housing", "Food", "Transportation", "Entertainment", "Utilities", "Healthcare"]

  const filteredAndSortedTransactions = transactions
    .filter((transaction) => {
      const matchesSearch =
        transaction.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        transaction.category.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesType = filterType === "all" || transaction.type === filterType
      const matchesCategory = filterCategory === "all" || transaction.category === filterCategory
      return matchesSearch && matchesType && matchesCategory
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "date-desc":
          return new Date(b.date + " " + b.time).getTime() - new Date(a.date + " " + a.time).getTime()
        case "date-asc":
          return new Date(a.date + " " + a.time).getTime() - new Date(b.date + " " + b.time).getTime()
        case "amount-desc":
          return Math.abs(b.amount) - Math.abs(a.amount)
        case "amount-asc":
          return Math.abs(a.amount) - Math.abs(b.amount)
        default:
          return 0
      }
    })

  const groupTransactionsByMonth = (transactions: Transaction[]) => {
    const grouped: { [key: string]: Transaction[] } = {}
    transactions.forEach((transaction) => {
      const date = new Date(transaction.date)
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`
      if (!grouped[monthKey]) {
        grouped[monthKey] = []
      }
      grouped[monthKey].push(transaction)
    })
    return grouped
  }

  const groupedTransactions = groupTransactionsByMonth(filteredAndSortedTransactions)

  const formatMonthYear = (monthKey: string) => {
    const [year, month] = monthKey.split("-")
    const date = new Date(Number.parseInt(year), Number.parseInt(month) - 1)
    const currentYear = new Date().getFullYear()

    if (Number.parseInt(year) === currentYear) {
      return date.toLocaleDateString("en-US", {
        month: "long",
      })
    } else {
      return date.toLocaleDateString("en-US", {
        month: "long",
        year: "numeric",
      })
    }
  }

  const getMonthlyTotals = (transactions: Transaction[]) => {
    const income = transactions.filter((t) => t.type === "income").reduce((sum, t) => sum + t.amount, 0)
    const expenses = transactions.filter((t) => t.type === "expense").reduce((sum, t) => sum + Math.abs(t.amount), 0)
    return { income, expenses, balance: income - expenses, transactionCount: transactions.length }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      day: "numeric",
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5 text-blue-600" />
          Monthly Transaction History
        </CardTitle>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mt-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="Search transactions..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-full sm:w-40">
              <Filter className="mr-2 h-4 w-4" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="income">Income Only</SelectItem>
              <SelectItem value="expense">Expenses Only</SelectItem>
            </SelectContent>
          </Select>

        
        </div>
      </CardHeader>

      <CardContent>
        <div className="space-y-8">
          {Object.keys(groupedTransactions).length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p className="text-lg font-medium">No transactions found</p>
              <p className="text-sm">Try adjusting your search criteria</p>
            </div>
          ) : (
            Object.entries(groupedTransactions)
              .sort(([a], [b]) => b.localeCompare(a)) // Sort months in descending order
              .map(([monthKey, monthTransactions]) => {
                const { income, expenses, balance, transactionCount } = getMonthlyTotals(monthTransactions)

                return (
                  <div key={monthKey} className="space-y-4">
                    {/* Month Header with Monthly Summary */}
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-xl border border-blue-100">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h3 className="text-xl font-bold text-gray-800">{formatMonthYear(monthKey)}</h3>
                          <p className="text-sm text-gray-600">{transactionCount} transactions</p>
                        </div>
                        <div className="flex items-center gap-6 text-sm">
                          {income > 0 && (
                            <div className="flex items-center gap-2 bg-green-100 px-3 py-2 rounded-lg">
                              <ArrowUpRight className="h-4 w-4 text-green-600" />
                              <div>
                                <p className="text-xs text-green-600 font-medium">Income</p>
                                <p className="font-bold text-green-700">LKR {income.toLocaleString()}</p>
                              </div>
                            </div>
                          )}
                          {expenses > 0 && (
                            <div className="flex items-center gap-2 bg-red-100 px-3 py-2 rounded-lg">
                              <ArrowDownRight className="h-4 w-4 text-red-600" />
                              <div>
                                <p className="text-xs text-red-600 font-medium">Expenses</p>
                                <p className="font-bold text-red-700">LKR {expenses.toLocaleString()}</p>
                              </div>
                            </div>
                          )}
                          <div
                            className={`px-4 py-2 rounded-lg font-bold ${
                              balance > 0
                                ? "bg-green-100 text-green-700"
                                : balance < 0
                                  ? "bg-red-100 text-red-700"
                                  : "bg-gray-100 text-gray-700"
                            }`}
                          >
                            <p className="text-xs font-medium opacity-75">Net Balance</p>
                            <p className="text-lg">
                              {balance > 0 ? "+" : ""}LKR {balance.toLocaleString()}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Transactions for this month */}
                    <div className="space-y-3">
                      {monthTransactions.map((transaction) => (
                        <div
                          key={transaction.id}
                          className="flex items-center justify-between p-4 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
                        >
                          <div className="flex items-center gap-4">
                            <div
                              className={`p-3 rounded-full ${
                                transaction.type === "income"
                                  ? "bg-green-100 text-green-600"
                                  : "bg-red-100 text-red-600"
                              }`}
                            >
                              {transaction.type === "income" ? (
                                <ArrowUpRight className="h-5 w-5" />
                              ) : (
                                <ArrowDownRight className="h-5 w-5" />
                              )}
                            </div>
                            <div>
                              <p className="font-semibold text-gray-800">{transaction.description}</p>
                              <div className="flex items-center gap-3 mt-1">
                                <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-700">
                                  {transaction.category}
                                </Badge>
                                <span className="text-sm text-gray-500">
                                  {formatDate(transaction.date)} • {transaction.time}
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-3">
                            <div
                              className={`text-lg font-bold ${
                                transaction.type === "income" ? "text-green-600" : "text-red-600"
                              }`}
                            >
                              {transaction.type === "income" ? "+" : ""}LKR{" "}
                              {Math.abs(transaction.amount).toLocaleString()}
                            </div>

                            <div className="flex gap-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )
              })
          )}
        </div>
      </CardContent>
    </Card>
  )
}
