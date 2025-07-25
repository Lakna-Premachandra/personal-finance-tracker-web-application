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
import { Transaction } from "@/services/controllers/transactionController"

// React-PDF imports
import { Document, Page, Text, View, StyleSheet, PDFDownloadLink, Font } from '@react-pdf/renderer'

// PDF Styles
const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#ffffff',
    padding: 20,
    fontFamily: 'Helvetica',
  },
  header: {
    marginBottom: 20,
    textAlign: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#1f2937',
  },
  subtitle: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 5,
  },
  summaryBox: {
    backgroundColor: '#f5f5f5',
    padding: 10,
    marginBottom: 20,
    borderRadius: 4,
  },
  summaryTitle: {
    fontSize: 10,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#374151',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  summaryText: {
    fontSize: 9,
    flex: 1,
  },
  incomeText: {
    color: '#059669',
  },
  expenseText: {
    color: '#dc2626',
  },
  table: {
    marginTop: 10,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#f3f4f6',
    padding: 5,
    fontSize: 9,
    fontWeight: 'bold',
    borderBottomWidth: 1,
    borderBottomColor: '#d1d5db',
  },
  tableRow: {
    flexDirection: 'row',
    padding: 5,
    fontSize: 8,
    borderBottomWidth: 0.5,
    borderBottomColor: '#e5e7eb',
  },
  tableRowEven: {
    backgroundColor: '#f9f9f9',
  },
  col1: { flex: 1.5 }, // Date
  col2: { flex: 3 },   // Description
  col3: { flex: 1.5 }, // Type
  col4: { flex: 2 },   // Category
  col5: { flex: 2 },   // Amount
  footer: {
    position: 'absolute',
    bottom: 20,
    left: 0,
    right: 0,
    textAlign: 'center',
    fontSize: 8,
    color: '#9ca3af',
  },
})

// PDF Document Component
const TransactionsPDF = ({
  transactions,
  userType,
  dateRange
}: {
  transactions: Transaction[],
  userType: string,
  dateRange: string
}) => {
  const totalIncome = transactions.filter((t) => t.Type === "Income").reduce((sum, t) => sum + t.Amount, 0)
  const totalExpenses = Math.abs(transactions.filter((t) => t.Type === "Expense").reduce((sum, t) => sum + t.Amount, 0))
  const netBalance = totalIncome - totalExpenses

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Transaction Report</Text>
          <Text style={styles.subtitle}>Generated on {format(new Date(), "PPP")}</Text>
          <Text style={styles.subtitle}>Total Transactions: {transactions.length}</Text>
          <Text style={styles.subtitle}>Account Type: {userType === "student" ? "Student" : "Young Adult"}</Text>
          <Text style={styles.subtitle}>Date Range: {dateRange}</Text>
        </View>

        {/* Financial Summary */}
        <View style={styles.summaryBox}>
          <Text style={styles.summaryTitle}>FINANCIAL SUMMARY</Text>
          <View style={styles.summaryRow}>
            <Text style={[styles.summaryText, styles.incomeText]}>
              Total Income: LKR {totalIncome.toLocaleString()}
            </Text>
            <Text style={[styles.summaryText, styles.expenseText]}>
              Total Expenses: LKR {totalExpenses.toLocaleString()}
            </Text>
            <Text style={[styles.summaryText, netBalance >= 0 ? styles.incomeText : styles.expenseText]}>
              Net Balance: LKR {netBalance.toLocaleString()}
            </Text>
          </View>
        </View>

        {/* Table */}
        <View style={styles.table}>
          {/* Table Header */}
          <View style={styles.tableHeader}>
            <Text style={styles.col1}>Date</Text>
            <Text style={styles.col2}>Description</Text>
            <Text style={styles.col3}>Type</Text>
            <Text style={styles.col4}>Category</Text>
            <Text style={styles.col5}>Amount (LKR)</Text>
          </View>

          {/* Table Rows */}
          {transactions.map((transaction, index) => {
            const isIncome = transaction.Type === "Income"
            const description = transaction.Description && transaction.Description.length > 25
              ? transaction.Description.substring(0, 22) + "..."
              : transaction.Description || "N/A"

            const category = transaction.Category_Name && transaction.Category_Name.length > 15
              ? transaction.Category_Name.substring(0, 12) + "..."
              : transaction.Category_Name || "N/A"

            return (
              <View key={index} style={[styles.tableRow, index % 2 === 0 && styles.tableRowEven]}>
                <Text style={styles.col1}>
                  {format(new Date(transaction.Transaction_Date), "MM/dd/yyyy")}
                </Text>
                <Text style={styles.col2}>{description}</Text>
                <Text style={styles.col3}>{transaction.Type}</Text>
                <Text style={styles.col4}>{category}</Text>
                <Text style={[styles.col5, isIncome ? styles.incomeText : styles.expenseText]}>
                  {isIncome ? "+" : "-"}{Math.abs(transaction.Amount).toLocaleString()}
                </Text>
              </View>
            )
          })}
        </View>

        {/* Footer */}
        <Text style={styles.footer} render={({ pageNumber, totalPages }) =>
          `Finance Tracker - Page ${pageNumber} of ${totalPages}`
        } fixed />
      </Page>
    </Document>
  )
}

interface ExportDialogProps {
  transactions: Transaction[]
  userType: "student" | "young-adult"
}

export function ExportDialog({ transactions, userType }: ExportDialogProps) {
  const [exportFormat, setExportFormat] = useState<"csv" | "pdf">("pdf")
  const [dateRange, setDateRange] = useState<"all" | "custom" | "last30" | "last90" | "thisMonth" | "lastMonth">("all")
  const [startDate, setStartDate] = useState<Date>()
  const [endDate, setEndDate] = useState<Date>()
  const [selectedTypes, setSelectedTypes] = useState<string[]>(["income", "expense"])

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
        const transactionDate = new Date(transaction.Transaction_Date)
        return transactionDate >= filterStartDate && transactionDate <= filterEndDate
      })
    }

    // Filter by types
    filtered = filtered.filter((transaction) => selectedTypes.includes(transaction.Type.toLowerCase()))

    return filtered
  }

  const exportToCSV = (data: Transaction[]) => {
    const headers = ["Date", "Type", "Description", "Category", "Amount (LKR)"]
    const csvContent = [
      headers.join(","),
      ...data.map((transaction) =>
        [
          format(new Date(transaction.Transaction_Date), "yyyy-MM-dd"),
          transaction.Type,
          `"${transaction.Description}"`,
          transaction.Category_Name,
          transaction.Amount >= 0 ? `LKR ${transaction.Amount}` : `-LKR ${Math.abs(transaction.Amount)}`,
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

  const handleCSVExport = () => {
    const filteredData = getFilteredTransactions()
    exportToCSV(filteredData)
  }

  const getDateRangeLabel = () => {
    switch (dateRange) {
      case "all": return "All Time"
      case "last30": return "Last 30 Days"
      case "last90": return "Last 90 Days"
      case "thisMonth": return "This Month"
      case "lastMonth": return "Last Month"
      case "custom": return "Custom Range"
      default: return "All Time"
    }
  }

  const filteredTransactions = getFilteredTransactions()
  const filteredCount = filteredTransactions.length

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className="border-blue-600 text-blue-600 hover:bg-blue-50 bg-transparent">
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
              </SelectContent>
            </Select>


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

          {/* Preview */}
          <div className="bg-blue-50 p-3 rounded-lg">
            <div className="flex items-center gap-2 text-blue-700">
              <Filter className="h-4 w-4" />
              <span className="font-medium">Export Preview</span>
            </div>
            <p className="text-sm text-blue-600 mt-1">{filteredCount} transactions will be exported</p>
          </div>

          {/* Export Button */}
          {exportFormat === "csv" ? (
            <Button
              onClick={handleCSVExport}
              disabled={filteredCount === 0}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Download className="mr-2 h-4 w-4" />
              Export CSV ({filteredCount} transactions)
            </Button>
          ) : (
            <PDFDownloadLink
              document={
                <TransactionsPDF
                  transactions={filteredTransactions}
                  userType={userType}
                  dateRange={getDateRangeLabel()}
                />
              }
              fileName={`transactions_${format(new Date(), "yyyy-MM-dd")}.pdf`}
              className={`w-full inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-blue-600 hover:bg-blue-700 text-white h-10 px-4 py-2 ${filteredCount === 0 ? "opacity-50 pointer-events-none" : ""
                }`}
            >
              {({ loading }) => (
                loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Generating PDF...
                  </>
                ) : (
                  <>
                    <Download className="mr-2 h-4 w-4" />
                    Export PDF ({filteredCount} transactions)
                  </>
                )
              )}
            </PDFDownloadLink>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}