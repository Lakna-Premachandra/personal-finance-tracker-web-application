"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
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
import { Checkbox } from "@/components/ui/checkbox"
import { Download, FileText, FileSpreadsheet, CalendarIcon, Filter } from "lucide-react"
import { format } from "date-fns"

interface Transaction {
  id: number
  type: "income" | "expense"
  description: string
  amount: number
  category: string
  date: string
  time: string
}

interface ExportDialogProps {
  transactions: Transaction[]
  userType: "student" | "young-adult"
}

export function ExportDialog({ transactions, userType }: ExportDialogProps) {
  const [exportFormat, setExportFormat] = useState<"csv" | "pdf">("csv")
  const [dateRange, setDateRange] = useState<"all" | "custom" | "last30" | "last90" | "thisMonth" | "lastMonth">("all")
  const [startDate, setStartDate] = useState<Date>()
  const [endDate, setEndDate] = useState<Date>()
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [selectedTypes, setSelectedTypes] = useState<string[]>(["income", "expense"])
  const [isExporting, setIsExporting] = useState(false)

  const categories =
    userType === "student"
      ? ["Food", "Entertainment", "Education", "Transportation", "Allowance", "Work"]
      : [
          "Salary",
          "Freelance",
          "Housing",
          "Food",
          "Transportation",
          "Entertainment",
          "Utilities",
          "Healthcare",
          "Investment",
        ]

  const handleCategoryChange = (category: string, checked: boolean) => {
    if (checked) {
      setSelectedCategories([...selectedCategories, category])
    } else {
      setSelectedCategories(selectedCategories.filter((c) => c !== category))
    }
  }

  const handleTypeChange = (type: string, checked: boolean) => {
    if (checked) {
      setSelectedTypes([...selectedTypes, type])
    } else {
      setSelectedTypes(selectedTypes.filter((t) => t !== type))
    }
  }

  const getFilteredTransactions = () => {
    let filtered = transactions

    // Filter by date range
    if (dateRange !== "all") {
      const now = new Date()
      let filterStartDate: Date
      let filterEndDate: Date = now

      switch (dateRange) {
        case "last30":
          filterStartDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
          break
        case "last90":
          filterStartDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)
          break
        case "thisMonth":
          filterStartDate = new Date(now.getFullYear(), now.getMonth(), 1)
          break
        case "lastMonth":
          filterStartDate = new Date(now.getFullYear(), now.getMonth() - 1, 1)
          filterEndDate = new Date(now.getFullYear(), now.getMonth(), 0)
          break
        case "custom":
          if (!startDate || !endDate) return filtered
          filterStartDate = startDate
          filterEndDate = endDate
          break
        default:
          return filtered
      }

      filtered = filtered.filter((transaction) => {
        const transactionDate = new Date(transaction.date)
        return transactionDate >= filterStartDate && transactionDate <= filterEndDate
      })
    }

    // Filter by categories
    if (selectedCategories.length > 0) {
      filtered = filtered.filter((transaction) => selectedCategories.includes(transaction.category))
    }

    // Filter by types
    filtered = filtered.filter((transaction) => selectedTypes.includes(transaction.type))

    return filtered
  }

  const exportToCSV = (data: Transaction[]) => {
    const headers = ["Date", "Time", "Type", "Description", "Category", "Amount (LKR)"]
    const csvContent = [
      headers.join(","),
      ...data.map((transaction) =>
        [
          transaction.date,
          transaction.time,
          transaction.type,
          `"${transaction.description}"`,
          transaction.category,
          transaction.amount,
        ].join(","),
      ),
    ].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    const url = URL.createObjectURL(blob)
    link.setAttribute("href", url)
    link.setAttribute("download", `transactions_${format(new Date(), "yyyy-MM-dd")}.csv`)
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const exportToPDF = (data: Transaction[]) => {
    // Create a simple HTML structure for PDF generation
    const totalIncome = data.filter((t) => t.type === "income").reduce((sum, t) => sum + t.amount, 0)
    const totalExpenses = Math.abs(data.filter((t) => t.type === "expense").reduce((sum, t) => sum + t.amount, 0))
    const netBalance = totalIncome - totalExpenses

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Transaction Report</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .header { text-align: center; margin-bottom: 30px; }
            .summary { background: #f5f5f5; padding: 15px; margin-bottom: 20px; border-radius: 5px; }
            .summary-item { display: inline-block; margin: 0 20px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f2f2f2; }
            .income { color: #059669; }
            .expense { color: #dc2626; }
            .footer { margin-top: 30px; text-align: center; font-size: 12px; color: #666; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Transaction Report</h1>
            <p>Generated on ${format(new Date(), "PPP")}</p>
            <p>Total Transactions: ${data.length}</p>
          </div>
          
          <div class="summary">
            <div class="summary-item">
              <strong>Total Income:</strong> <span class="income">LKR ${totalIncome.toLocaleString()}</span>
            </div>
            <div class="summary-item">
              <strong>Total Expenses:</strong> <span class="expense">LKR ${totalExpenses.toLocaleString()}</span>
            </div>
            <div class="summary-item">
              <strong>Net Balance:</strong> <span class="${netBalance >= 0 ? "income" : "expense"}">LKR ${netBalance.toLocaleString()}</span>
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Time</th>
                <th>Type</th>
                <th>Description</th>
                <th>Category</th>
                <th>Amount (LKR)</th>
              </tr>
            </thead>
            <tbody>
              ${data
                .map(
                  (transaction) => `
                <tr>
                  <td>${transaction.date}</td>
                  <td>${transaction.time}</td>
                  <td class="${transaction.type}">${transaction.type}</td>
                  <td>${transaction.description}</td>
                  <td>${transaction.category}</td>
                  <td class="${transaction.type}">${transaction.type === "income" ? "+" : ""}LKR ${Math.abs(transaction.amount).toLocaleString()}</td>
                </tr>
              `,
                )
                .join("")}
            </tbody>
          </table>

          <div class="footer">
            <p>Finance Tracker - ${userType === "student" ? "Student" : "Young Adult"} Account</p>
          </div>
        </body>
      </html>
    `

    const printWindow = window.open("", "_blank")
    if (printWindow) {
      printWindow.document.write(htmlContent)
      printWindow.document.close()
      printWindow.focus()
      setTimeout(() => {
        printWindow.print()
        printWindow.close()
      }, 250)
    }
  }

  const handleExport = async () => {
    setIsExporting(true)
    const filteredData = getFilteredTransactions()

    try {
      if (exportFormat === "csv") {
        exportToCSV(filteredData)
      } else {
        exportToPDF(filteredData)
      }
    } catch (error) {
      console.error("Export failed:", error)
    } finally {
      setIsExporting(false)
    }
  }

  const filteredCount = getFilteredTransactions().length

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="border-blue-600 text-blue-600 hover:bg-blue-50 bg-transparent">
          <Download className="mr-2 h-4 w-4" />
          Export
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Download className="h-5 w-5 text-blue-600" />
            Export Transactions
          </DialogTitle>
          <DialogDescription>Export your transaction data in CSV or PDF format with custom filters.</DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Export Format */}
          <div>
            <Label className="text-sm font-medium">Export Format</Label>
            <div className="flex gap-4 mt-2">
              <div className="flex items-center space-x-2">
                <input
                  type="radio"
                  id="csv"
                  name="format"
                  value="csv"
                  checked={exportFormat === "csv"}
                  onChange={(e) => setExportFormat(e.target.value as "csv" | "pdf")}
                  className="text-blue-600"
                />
                <label htmlFor="csv" className="flex items-center gap-2 cursor-pointer">
                  <FileSpreadsheet className="h-4 w-4 text-green-600" />
                  CSV File
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="radio"
                  id="pdf"
                  name="format"
                  value="pdf"
                  checked={exportFormat === "pdf"}
                  onChange={(e) => setExportFormat(e.target.value as "csv" | "pdf")}
                  className="text-blue-600"
                />
                <label htmlFor="pdf" className="flex items-center gap-2 cursor-pointer">
                  <FileText className="h-4 w-4 text-red-600" />
                  PDF Report
                </label>
              </div>
            </div>
          </div>

          {/* Date Range */}
          <div>
            <Label className="text-sm font-medium">Date Range</Label>
            <Select value={dateRange} onValueChange={(value: any) => setDateRange(value)}>
              <SelectTrigger className="mt-2">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Transactions</SelectItem>
                <SelectItem value="last30">Last 30 Days</SelectItem>
                <SelectItem value="last90">Last 90 Days</SelectItem>
                <SelectItem value="thisMonth">This Month</SelectItem>
                <SelectItem value="lastMonth">Last Month</SelectItem>
                <SelectItem value="custom">Custom Range</SelectItem>
              </SelectContent>
            </Select>

            {dateRange === "custom" && (
              <div className="grid grid-cols-2 gap-4 mt-4">
                <div>
                  <Label className="text-xs text-gray-600">Start Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-start text-left font-normal bg-transparent">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {startDate ? format(startDate, "PPP") : "Pick start date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar mode="single" selected={startDate} onSelect={setStartDate} initialFocus />
                    </PopoverContent>
                  </Popover>
                </div>
                <div>
                  <Label className="text-xs text-gray-600">End Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-start text-left font-normal bg-transparent">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {endDate ? format(endDate, "PPP") : "Pick end date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar mode="single" selected={endDate} onSelect={setEndDate} initialFocus />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
            )}
          </div>

          {/* Transaction Types */}
          <div>
            <Label className="text-sm font-medium">Transaction Types</Label>
            <div className="flex gap-4 mt-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="income"
                  checked={selectedTypes.includes("income")}
                  onCheckedChange={(checked) => handleTypeChange("income", checked as boolean)}
                />
                <label htmlFor="income" className="text-sm cursor-pointer">
                  Income
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="expense"
                  checked={selectedTypes.includes("expense")}
                  onCheckedChange={(checked) => handleTypeChange("expense", checked as boolean)}
                />
                <label htmlFor="expense" className="text-sm cursor-pointer">
                  Expenses
                </label>
              </div>
            </div>
          </div>

          {/* Categories */}
          <div>
            <Label className="text-sm font-medium">Categories (Optional)</Label>
            <div className="grid grid-cols-2 gap-2 mt-2 max-h-32 overflow-y-auto">
              {categories.map((category) => (
                <div key={category} className="flex items-center space-x-2">
                  <Checkbox
                    id={category}
                    checked={selectedCategories.includes(category)}
                    onCheckedChange={(checked) => handleCategoryChange(category, checked as boolean)}
                  />
                  <label htmlFor={category} className="text-sm cursor-pointer">
                    {category}
                  </label>
                </div>
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-1">Leave empty to include all categories</p>
          </div>

          {/* Preview */}
          <div className="bg-blue-50 p-3 rounded-lg">
            <div className="flex items-center gap-2 text-blue-700">
              <Filter className="h-4 w-4" />
              <span className="font-medium">Export Preview</span>
            </div>
            <p className="text-sm text-blue-600 mt-1">{filteredCount} transactions will be exported</p>
          </div>

          {/* Export Button */}
          <Button
            onClick={handleExport}
            disabled={isExporting || filteredCount === 0}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white"
          >
            {isExporting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Exporting...
              </>
            ) : (
              <>
                <Download className="mr-2 h-4 w-4" />
                Export {exportFormat.toUpperCase()} ({filteredCount} transactions)
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
