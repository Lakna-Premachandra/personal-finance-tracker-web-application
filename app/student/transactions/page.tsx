"use client"
//this is student 
import { useEffect, useState } from "react"
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { TransactionCalendar } from "@/components/transaction-calendar"
import { TransactionList } from "@/components/transaction-list"
import { ExportDialog } from "@/components/export-dialog"
import { Plus, CalendarIcon, ArrowUpRight, ArrowDownRight, CalendarIcon as CalendarViewIcon, List, Target, PiggyBank } from "lucide-react"
import { format } from "date-fns"
import { useGetCategoriesByTypeAndUserTypeQuery } from "@/services/controllers/categoryController"
import {
  useCreateTransactionMutation,
  useGetTransactionsQuery,
  useUpdateTransactionMutation,
  useDeleteTransactionMutation,
  Transaction
} from "@/services/controllers/transactionController"
import { toast } from "@/hooks/use-toast" // Assuming you have toast setup
import { useCurrency } from "@/hooks/useCurrency"

export default function TransactionsPage() {
  const [date, setDate] = useState<Date>(new Date())
  const [viewMode, setViewMode] = useState<"calendar" | "list">("calendar")
  const [selectedTransactionType, setSelectedTransactionType] = useState<"Income" | "Expense" | "">("")
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null)
  const [transactionToDelete, setTransactionToDelete] = useState<Transaction | null>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const { formatCurrency, getCurrencySymbol } = useCurrency();


  // Form states
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    amount: "",
    categoryId: ""
  })

  // API hooks
  const { data: transactionsData, isLoading: isTransactionsLoading, refetch: refetchTransactions } = useGetTransactionsQuery()
  const { data: categoriesData, isLoading: isCategoriesLoading } = useGetCategoriesByTypeAndUserTypeQuery(
    {
      type: selectedTransactionType as "Income" | "Expense",
      userType: "Student"
    },
    {
      skip: !selectedTransactionType,
    }
  )
  const summary = transactionsData?.summary


  const [createTransaction, { isLoading: isCreating }] = useCreateTransactionMutation()
  const [updateTransaction, { isLoading: isUpdating }] = useUpdateTransactionMutation()
  const [deleteTransaction, { isLoading: isDeleting }] = useDeleteTransactionMutation()

  // Use API data if available, otherwise fallback to mock data
  const transactions = transactionsData?.data || []
  const totalIncome = summary?.totalIncome || 0
  const totalExpenses = Math.abs(summary?.totalExpenses || 0)
  const netBalance = summary?.netBalance || 0
  const totalGoalAllocations = summary?.totalGoalAllocations || 0



  const getAvailableCategories = () => {
    if (!categoriesData?.data) return []
    return categoriesData.data
  }

  useEffect(() => {
    refetchTransactions()
  }, [netBalance])
  const handleTransactionTypeChange = (type: string) => {
    setSelectedTransactionType(type as "Income" | "Expense")
    setFormData({ ...formData, categoryId: "" }) // Reset category when type changes
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value })
  }

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      amount: "",
      categoryId: ""
    })
    setSelectedTransactionType("")
    setDate(new Date())
    setEditingTransaction(null)
  }

  const handleEditTransaction = (transaction: Transaction) => {
    setEditingTransaction(transaction)
    setFormData({
      title: transaction.Title,
      description: transaction.Description,
      amount: transaction.Amount.toString(),
      categoryId: transaction.Category_ID.toString()
    })
    setSelectedTransactionType(transaction.Type)
    setDate(new Date(transaction.Transaction_Date))
    setIsEditDialogOpen(true)
  }

  const handleUpdateTransaction = async () => {
    if (!editingTransaction) return

    // Validation
    if (!selectedTransactionType || !formData.title || !formData.amount || !formData.categoryId || !date) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      })
      return
    }

    try {
      const updateData = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        amount: parseFloat(formData.amount),
        categoryId: parseInt(formData.categoryId),
        type: selectedTransactionType as "Income" | "Expense",
        transactionDate: date.toLocaleDateString('en-CA'),
      }

      const result = await updateTransaction({
        id: editingTransaction.Transaction_ID,
        transaction: updateData
      }).unwrap()

      if (result.success) {
        toast({
          title: "Success",
          description: "Transaction updated successfully",
        })
        resetForm()
        setIsEditDialogOpen(false)
        setEditingTransaction(null)
      } else {
        toast({
          title: "Error",
          description: "Failed to update transaction",
          variant: "destructive",
        })
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error?.data?.message || "Failed to update transaction",
        variant: "destructive",
      })
    }
  }

  const handleDeleteTransaction = async (
    transactionId: number,
    transactionType: "Income" | "Expense"
  ) => {
    try {
      // Find the transaction to get categoryId and transactionDate for expenses
      const transactionToDelete = transactions.find(
        (t) => t.Transaction_ID === transactionId
      );

      const deleteParams: {
        id: number;
        type: "Income" | "Expense";
        categoryId?: number;
        transactionDate?: string;
      } = {
        id: transactionId,
        type: transactionType,
      };

      // Add required parameters for expense transactions
      if (transactionType === "Expense" && transactionToDelete) {
        deleteParams.categoryId = Number(transactionToDelete.Category_ID);
        deleteParams.transactionDate = new Date(
          transactionToDelete.Transaction_Date
        ).toLocaleDateString("en-CA");
      }

      const result = await deleteTransaction(deleteParams).unwrap();

      if (result.success) {
        toast({
          title: "Success",
          description: "Transaction deleted successfully!",
        });
        setTransactionToDelete(null);
      } else {
        toast({
          title: "Error",
          description: "Failed to delete transaction",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      console.error("Error deleting transaction:", error);
      toast({
        title: "Error",
        description: error?.data?.message || "Failed to delete transaction",
        variant: "destructive",
      });
    }
  };


  const handleSubmit = async () => {
    // Validation
    if (!selectedTransactionType || !formData.title || !formData.amount || !formData.categoryId || !date) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      })
      return
    }

    try {
      const transactionData = {
        title: formData.title,
        description: formData.description,
        amount: parseFloat(formData.amount),
        categoryId: parseInt(formData.categoryId),
        type: selectedTransactionType as "Income" | "Expense",
        transactionDate: date.toLocaleDateString('en-CA'), // Format as YYYY-MM-DD in local timezone
      }

      const response = await createTransaction(transactionData).unwrap()

      if (response.success) {
        toast({
          title: "Success",
          description: "Transaction created successfully",
        })
        resetForm()
        setDialogOpen(false)
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error?.data?.message || "Failed to create transaction",
        variant: "destructive",
      })
    }
  }
 
    if (isTransactionsLoading) {
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
          <h1 className="text-3xl font-bold tracking-tight">Transactions</h1>
          <p className="text-muted-foreground">Track and manage all your financial activities</p>
        </div>
        <div className="flex gap-2">
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

          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
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
                  <Label htmlFor="type">Transaction Type *</Label>
                  <Select onValueChange={handleTransactionTypeChange} value={selectedTransactionType}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Income">Income</SelectItem>
                      <SelectItem value="Expense">Expense</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="title">Title *</Label>
                  <Input
                    id="title"
                    placeholder="e.g., Weekly Allowance"
                    value={formData.title}
                    onChange={(e) => handleInputChange("title", e.target.value)}
                  />
                </div>

                <div>
                  <Label htmlFor="description">Description</Label>
                  <Input
                    id="description"
                    placeholder="e.g., School lunch"
                    value={formData.description}
                    onChange={(e) => handleInputChange("description", e.target.value)}
                  />
                </div>

                <div>
                  <Label htmlFor="amount">Amount {getCurrencySymbol()} *</Label>
                  <Input
                    id="amount"
                    type="number"
                    placeholder="0.00"
                    value={formData.amount}
                    onChange={(e) => handleInputChange("amount", e.target.value)}
                  />
                </div>

                <div>
                  <Label htmlFor="category">Category *</Label>
                  <Select
                    disabled={!selectedTransactionType}
                    value={formData.categoryId}
                    onValueChange={(value) => handleInputChange("categoryId", value)}
                  >
                    <SelectTrigger>
                      <SelectValue
                        placeholder={
                          !selectedTransactionType
                            ? "Select transaction type first"
                            : isCategoriesLoading
                              ? "Loading categories..."
                              : "Select category"
                        }
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {getAvailableCategories().map((category) => (
                        <SelectItem key={category.Category_ID} value={category.Category_ID.toString()}>
                          {category.Name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground mt-1">
                    Categories are pre-defined for student accounts
                  </p>
                </div>

                <div>
                  <Label>Date *</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-start text-left font-normal bg-transparent">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {date ? format(date, "PPP") : "Pick a date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={date}
                        onSelect={(selectedDate) => {
                          if (selectedDate) setDate(selectedDate)
                        }}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <Button
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                  onClick={handleSubmit}
                  disabled={isCreating}
                >
                  {isCreating ? "Creating..." : "Add Transaction"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Edit Transaction Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Transaction</DialogTitle>
            <DialogDescription>Update the transaction details.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-type">Transaction Type *</Label>
              <Select disabled={true} value={selectedTransactionType} onValueChange={handleTransactionTypeChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Income">Income</SelectItem>
                  <SelectItem value="Expense">Expense</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="edit-title">Title *</Label>
              <Input
                id="edit-title"
                placeholder="e.g., Weekly Allowance"
                value={formData.title}
                onChange={(e) => handleInputChange("title", e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="edit-description">Description</Label>
              <Input
                id="edit-description"
                placeholder="e.g., School lunch"
                value={formData.description}
                onChange={(e) => handleInputChange("description", e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="edit-amount">Amount {getCurrencySymbol()} *</Label>
              <Input
                id="edit-amount"
                type="number"
                placeholder="0.00"
                value={formData.amount}
                onChange={(e) => handleInputChange("amount", e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="edit-category">Category *</Label>
              <Select
                disabled={!selectedTransactionType}
                value={formData.categoryId}
                onValueChange={(value) => handleInputChange("categoryId", value)}
              >
                <SelectTrigger>
                  <SelectValue
                    placeholder={
                      !selectedTransactionType
                        ? "Select transaction type first"
                        : isCategoriesLoading
                          ? "Loading categories..."
                          : "Select category"
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {getAvailableCategories().map((category) => (
                    <SelectItem key={category.Category_ID} value={category.Category_ID.toString()}>
                      {category.Name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Date *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left font-normal bg-transparent">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? format(date, "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={(selectedDate) => {
                      if (selectedDate) setDate(selectedDate)
                    }}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="flex gap-2">
              <Button
                onClick={handleUpdateTransaction}
                disabled={isUpdating}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
              >
                {isUpdating ? "Updating..." : "Update Transaction"}
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setIsEditDialogOpen(false)
                  setEditingTransaction(null)
                  resetForm()
                }}
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Transaction Alert Dialog */}
      <AlertDialog open={!!transactionToDelete} onOpenChange={() => setTransactionToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Transaction</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{transactionToDelete?.Title}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setTransactionToDelete(null)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() =>
                transactionToDelete &&
                handleDeleteTransaction(transactionToDelete.Transaction_ID, transactionToDelete.Type)
              }
              className="bg-red-600 hover:bg-red-700 text-white"
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-3 xs:grid-cols-2 md:grid-cols-4">
        <Card className=" ">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-600">Total Income</CardTitle>
            <ArrowUpRight className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-700">{getCurrencySymbol()} {totalIncome}</div>
            <p className="text-xs text-green-600">All time</p>
          </CardContent>
        </Card>

        <Card className="">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-red-600">Total Expenses</CardTitle>
            <ArrowDownRight className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-700">{getCurrencySymbol()} {totalExpenses}</div>
            <p className="text-xs text-red-600">All time</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-orange-600">Goal Amount</CardTitle>
            <Target className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-700">({getCurrencySymbol()}) {totalGoalAllocations}</div>
            <p className="text-xs text-orange-600">All time</p>
          </CardContent>
        </Card>

        <Card className=" ">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-600">Net Balance</CardTitle>
            <CalendarIcon className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-700">{getCurrencySymbol()} {netBalance}</div>
            <p className="text-xs text-blue-600">All time</p>
          </CardContent>
        </Card>
      </div>

      {/* Export Dialog */}
      <div className="w-full flex justify-end">
        <ExportDialog transactions={transactions} userType="student" />
      </div>

      {/* Main Content - Calendar or List View */}
      {viewMode === "calendar" ? (
        <TransactionCalendar transactions={transactions} userType="student" />
      ) : (
        <TransactionList
          transactions={transactions}
          userType="student"
          onEditTransaction={handleEditTransaction}
          onDeleteTransaction={setTransactionToDelete}
        />
      )}
    </div>
  )
}