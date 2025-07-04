"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { TransactionCalendar } from "@/components/transaction-calendar"
import { TransactionList } from "@/components/transaction-list"
import { ExportDialog } from "@/components/export-dialog"
import { Plus, CalendarIcon, ArrowUpRight, ArrowDownRight, CalendarIcon as CalendarViewIcon, List } from "lucide-react"
import { format } from "date-fns"

export default function TransactionsPage() {
  const [date, setDate] = useState<Date>()
  const [viewMode, setViewMode] = useState<"calendar" | "list">("list")

  const transactions = [
    {
      id: 1,
      type: "income" as const,
      description: "Weekly Allowance",
      amount: 5000,
      category: "Allowance",
      date: "2024-01-15",
      time: "09:00 AM",
    },
    {
      id: 2,
      type: "expense" as const,
      description: "School Lunch",
      amount: -1250,
      category: "Food",
      date: "2024-01-15",
      time: "12:30 PM",
    },
    {
      id: 3,
      type: "expense" as const,
      description: "Movie Ticket",
      amount: -1500,
      category: "Entertainment",
      date: "2024-01-14",
      time: "07:00 PM",
    },
    {
      id: 4,
      type: "income" as const,
      description: "Part-time Job",
      amount: 12000,
      category: "Work",
      date: "2024-01-13",
      time: "05:00 PM",
    },
    {
      id: 5,
      type: "expense" as const,
      description: "School Supplies",
      amount: -2599,
      category: "Education",
      date: "2024-01-12",
      time: "03:15 PM",
    },
    {
      id: 6,
      type: "expense" as const,
      description: "Bus Fare",
      amount: -350,
      category: "Transportation",
      date: "2024-01-12",
      time: "08:00 AM",
    },
    {
      id: 7,
      type: "income" as const,
      description: "Birthday Money",
      amount: 7500,
      category: "Allowance",
      date: "2024-12-10",
      time: "02:00 PM",
    },
    {
      id: 8,
      type: "expense" as const,
      description: "Snacks",
      amount: -850,
      category: "Food",
      date: "2024-12-10",
      time: "04:30 PM",
    },
    {
      id: 9,
      type: "expense" as const,
      description: "Coffee with Friends",
      amount: -600,
      category: "Entertainment",
      date: "2024-12-08",
      time: "03:00 PM",
    },
    {
      id: 10,
      type: "income" as const,
      description: "Tutoring Payment",
      amount: 8000,
      category: "Work",
      date: "2024-12-05",
      time: "06:00 PM",
    },
    {
      id: 11,
      type: "expense" as const,
      description: "Textbooks",
      amount: -4500,
      category: "Education",
      date: "2024-11-28",
      time: "10:00 AM",
    },
    {
      id: 12,
      type: "expense" as const,
      description: "Monthly Bus Pass",
      amount: -2000,
      category: "Transportation",
      date: "2024-11-25",
      time: "09:00 AM",
    },
  ]

  const totalIncome = transactions.filter((t) => t.type === "income").reduce((sum, t) => sum + t.amount, 0)
  const totalExpenses = Math.abs(transactions.filter((t) => t.type === "expense").reduce((sum, t) => sum + t.amount, 0))

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Transactions</h1>
          <p className="text-muted-foreground">Track and manage all your financial activities</p>
        </div>
        <div className="flex gap-2">
          {/* Export Button */}
          <ExportDialog transactions={transactions} userType="student" />

          {/* View Toggle */}
          <div className="flex bg-gray-100 rounded-lg p-1">
            <Button
              variant={viewMode === "list" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("list")}
              className={`h-8 ${viewMode === "list" ? "bg-blue-600 hover:bg-blue-700 text-white" : ""}`}
            >
              <List className="mr-2 h-4 w-4" />
              List
            </Button>
            <Button
              variant={viewMode === "calendar" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("calendar")}
              className={`h-8 ${viewMode === "calendar" ? "bg-blue-600 hover:bg-blue-700 text-white" : ""}`}
            >
              <CalendarViewIcon className="mr-2 h-4 w-4" />
              Calendar
            </Button>
          </div>

          <Dialog>
            <DialogTrigger asChild>
              <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                <Plus className="mr-2 h-4 w-4" />
                Add Transaction
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Add New Transaction</DialogTitle>
                <DialogDescription>Record a new income or expense transaction.</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="type">Transaction Type</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="income">Income</SelectItem>
                      <SelectItem value="expense">Expense</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="title">Title</Label>
                  <Input id="title" placeholder="e.g., Weekly Allowance" />
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Input id="description" placeholder="e.g., School lunch" />
                </div>
                <div>
                  <Label htmlFor="amount">Amount (LKR)</Label>
                  <Input id="amount" type="number" placeholder="0.00" />
                </div>
                <div>
                  <Label htmlFor="category">Category</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="food">Food</SelectItem>
                      <SelectItem value="entertainment">Entertainment</SelectItem>
                      <SelectItem value="education">Education</SelectItem>
                      <SelectItem value="transportation">Transportation</SelectItem>
                      <SelectItem value="allowance">Allowance</SelectItem>
                      <SelectItem value="work">Work</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground mt-1">Categories are pre-defined for student accounts</p>
                </div>
                <div>
                  <Label>Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-start text-left font-normal bg-transparent">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {date ? format(date, "PPP") : "Pick a date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar mode="single" selected={date} onSelect={setDate} initialFocus />
                    </PopoverContent>
                  </Popover>
                </div>
                <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">Add Transaction</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className=" ">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Income</CardTitle>
            <ArrowUpRight className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-700">LKR {totalIncome.toLocaleString()}</div>
            <p className="text-xs text-green-600">All time</p>
          </CardContent>
        </Card>

        <Card className="">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
            <ArrowDownRight className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-700">LKR {totalExpenses.toLocaleString()}</div>
            <p className="text-xs text-red-600">All time</p>
          </CardContent>
        </Card>

        <Card className=" ">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Net Balance</CardTitle>
            <CalendarIcon className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-700">LKR {(totalIncome - totalExpenses).toLocaleString()}</div>
            <p className="text-xs text-blue-600">All time</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content - Calendar or List View */}
      {viewMode === "calendar" ? (
        <TransactionCalendar transactions={transactions} userType="student" />
      ) : (
        <TransactionList transactions={transactions} userType="student" />
      )}
    </div>
  )
}
