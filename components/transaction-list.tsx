"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { ArrowUpRight, ArrowDownRight, Search, Filter, Edit, Trash2, Calendar, Edit2 } from "lucide-react"
import { Transaction } from "@/services/controllers/transactionController"
import { useCurrency } from "@/hooks/useCurrency"

// Mock Transaction interface - replace with your actual interface


interface TransactionListProps {
  transactions: Transaction[]
  userType: "student" | "young-adult"
  onEditTransaction?: (transaction: Transaction) => void
  onDeleteTransaction?: (transaction: Transaction) => void
}

export function TransactionList({ transactions, userType, onEditTransaction, onDeleteTransaction }: TransactionListProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [filterType, setFilterType] = useState("all")
  const [filterCategory, setFilterCategory] = useState("all")
  const [sortBy, setSortBy] = useState("date-desc")
  const { formatCurrency, getCurrencySymbol } = useCurrency();
  

  const categories =
    userType === "student"
      ? ["Food", "Entertainment", "Education", "Transportation", "Allowance", "Work"]
      : ["Salary", "Freelance", "Housing", "Food", "Transportation", "Entertainment", "Utilities", "Healthcare"]

  const filteredAndSortedTransactions = transactions
    .filter((transaction) => {
      const matchesSearch =
        transaction.Description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        transaction.Category_Name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        transaction.Title.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesType = filterType === "all" || transaction.Type === filterType
      const matchesCategory = filterCategory === "all" || transaction.Category_Name === filterCategory
      return matchesSearch && matchesType && matchesCategory
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "date-desc":
          return new Date(b.Transaction_Date).getTime() - new Date(a.Transaction_Date).getTime()
        case "date-asc":
          return new Date(a.Transaction_Date).getTime() - new Date(b.Transaction_Date).getTime()
        case "amount-desc":
          return Math.abs(b.Amount) - Math.abs(a.Amount)
        case "amount-asc":
          return Math.abs(a.Amount) - Math.abs(b.Amount)
        default:
          return 0
      }
    })

  const groupTransactionsByMonth = (transactions: Transaction[]) => {
    const grouped: { [key: string]: Transaction[] } = {}
    transactions.forEach((transaction) => {
      // Parse the date correctly (assuming format is YYYY-MM-DD)
      const date = new Date(transaction.Transaction_Date)
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

  // Option 1: Always show year
  return date.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  })
}

  const getMonthlyTotals = (transactions: Transaction[]) => {
    const income = transactions.filter((t) => t.Type === "Income").reduce((sum, t) => sum + t.Amount, 0)
    const expenses = transactions.filter((t) => t.Type === "Expense").reduce((sum, t) => sum + Math.abs(t.Amount), 0)
    return { income, expenses, balance: income - expenses, transactionCount: transactions.length }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    })
  }

  // Get unique categories from transactions for filter
  const uniqueCategories = [...new Set(transactions.map(t => t.Category_Name))].sort()

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 mb-2">
          <Calendar className="h-5 w-5 text-blue-600 " />
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
              <SelectItem value="Income">Income Only</SelectItem>
              <SelectItem value="Expense">Expenses Only</SelectItem>
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
              .sort(([a], [b]) => b.localeCompare(a)) // Sort months in descending order (latest first)
              .map(([monthKey, monthTransactions ]) => {
                const { income, expenses, balance, transactionCount } = getMonthlyTotals(monthTransactions)

                return (
                  <div key={monthKey} className="space-y-4">
                    {/* Month Header with Monthly Summary */}
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-xl border border-blue-100">
                      <div className="flex items-center justify-between mb-4 ">
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
                                <p className="font-bold text-green-700">{getCurrencySymbol()} {income.toLocaleString()}</p>
                              </div>
                            </div>
                          )}
                          {expenses > 0 && (
                            <div className="flex items-center gap-2 bg-red-100 px-3 py-2 rounded-lg">
                              <ArrowDownRight className="h-4 w-4 text-red-600" />
                              <div>
                                <p className="text-xs text-red-600 font-medium">Expenses</p>
                                <p className="font-bold text-red-700">{getCurrencySymbol()} {expenses.toLocaleString()}</p>
                              </div>
                            </div>
                          )}
                          <div
                            className={`px-4 py-2 rounded-lg font-bold ${balance > 0
                              ? "bg-green-100 text-green-700"
                              : balance < 0
                                ? "bg-red-100 text-red-700"
                                : "bg-gray-100 text-gray-700"
                              }`}
                          >
                            <p className="text-xs font-medium opacity-75">Net Balance</p>
                            <p className="text-lg">
                              {balance > 0 ? "+" : ""}{getCurrencySymbol()} {balance.toLocaleString()}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Transactions for this month */}
                    <div className="space-y-3">
                      {monthTransactions
                        .sort((a, b) => new Date(b.Transaction_Date).getTime() - new Date(a.Transaction_Date).getTime())
                        .map((transaction) => (
                        <div
                          key={transaction.Transaction_ID}
                          className="flex items-center justify-between p-4 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
                        >
                          <div className="flex items-center gap-4">
                            <div
                              className={`p-3 rounded-full ${transaction.Type === "Income"
                                ? "bg-green-100 text-green-600"
                                : "bg-red-100 text-red-600"
                                }`}
                            >
                              {transaction.Type === "Income" ? (
                                <ArrowUpRight className="h-5 w-5" />
                              ) : (
                                <ArrowDownRight className="h-5 w-5" />
                              )}
                            </div>
                            <div>
                              <p className="font-semibold text-gray-800">{transaction.Title}</p>
                              <p className="text-sm text-gray-600">{transaction.Description}</p>
                              <div className="flex items-center gap-3 mt-1">
                                <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-700">
                                  {transaction.Category_Name}
                                </Badge>
                                <span className="text-sm text-gray-500 flex items-center gap-1">
                                  <Calendar className="h-3 w-3" />
                                  {formatDate(transaction.Transaction_Date)} 
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-3">
                            <div
                              className={`text-lg font-bold ${transaction.Type === "Income" ? "text-green-600" : "text-red-600"
                                }`}
                            >
                              {transaction.Type === "Income" ? "+" : "-"}{getCurrencySymbol()}{" "}
                              {Math.abs(transaction.Amount).toLocaleString()}
                            </div>
                            <div className="flex items-center gap-2">
                              {onEditTransaction && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => onEditTransaction(transaction)}
                                  className="h-8 w-8 p-0 hover:bg-blue-100 hover:text-blue-600"
                                  title="Edit transaction"
                                >
                                  <Edit2 className="h-4 w-4" />
                                </Button>
                              )}
                              {onDeleteTransaction && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => onDeleteTransaction(transaction)}
                                  className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-100"
                                  title="Delete transaction"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              )}
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