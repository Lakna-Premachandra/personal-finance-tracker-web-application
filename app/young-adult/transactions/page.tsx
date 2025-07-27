"use client"
//this is young adult
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { TransactionCalendar } from "@/components/transaction-calendar"
import { TransactionList } from "@/components/transaction-list"
import { ExportDialog } from "@/components/export-dialog"
import {
  Plus,
  Calendar as CalendarIcon,
  ArrowUpRight,
  ArrowDownRight,
  Calendar as CalendarViewIcon,
  List,
  Edit2,
  X,
  Settings,
  Pencil,
  Trash2,
  Edit
} from "lucide-react"
import { format } from "date-fns"

import { toast } from "sonner"
import { Category, useAddCategoryMutation, useDeleteCategoryMutation, useGetCategoriesByTypeQuery, useUpdateCategoryMutation } from "@/services/controllers/categoryController"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useGetTransactionsQuery, useCreateTransactionMutation, useUpdateTransactionMutation, useDeleteTransactionMutation, Transaction } from "@/services/controllers/transactionController"
import { useCurrency } from "@/hooks/useCurrency"

export default function YoungAdultTransactionsPage() {
  const [date, setDate] = useState<Date>()
  const [viewMode, setViewMode] = useState<"calendar" | "list">("calendar")
  const [selectedTransactionType, setSelectedTransactionType] = useState<"Income" | "Expense" | "">("")
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("")
  const [newCategoryName, setNewCategoryName] = useState("")
  const [isCustomCategoryMode, setIsCustomCategoryMode] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [editCategoryName, setEditCategoryName] = useState("")
  const [showCategoryManager, setShowCategoryManager] = useState(false)
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null)
  const [transactionToDelete, setTransactionToDelete] = useState<Transaction | null>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [showValidation, setShowValidation] = useState(false)
const { formatCurrency, getCurrencySymbol } = useCurrency();
  // Form state
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    amount: "",
  })

  // RTK Query hooks
  const { data: transactionsData, isLoading: isTransactionsLoading } = useGetTransactionsQuery()
  const [createTransaction, { isLoading: isCreatingTransaction }] = useCreateTransactionMutation()
  const [updateTransaction, { isLoading: isUpdatingTransaction }] = useUpdateTransactionMutation()
  const [deleteTransaction, { isLoading: isDeletingTransaction }] = useDeleteTransactionMutation()
  // RTK Query hooks - Get all categories for the selected type
  const { data: categoriesData, isLoading: isCategoriesLoading } = useGetCategoriesByTypeQuery(
    selectedTransactionType as "Income" | "Expense",
    {
      skip: !selectedTransactionType,
    }
  )

  const [addCategory, { isLoading: isAddingCategory }] = useAddCategoryMutation()
  const [updateCategory, { isLoading: isUpdatingCategory }] = useUpdateCategoryMutation()
  const [deleteCategory, { isLoading: isDeletingCategory }] = useDeleteCategoryMutation()

  // Use actual transactions from API or fallback to mock data
  const transactions = transactionsData?.data || []

  const totalIncome = transactions.filter((t) => t.Type === "Income").reduce((sum, t) => sum + t.Amount, 0)
  const totalExpenses = Math.abs(transactions.filter((t) => t.Type === "Expense").reduce((sum, t) => sum + t.Amount, 0))

  const handleTransactionTypeChange = (type: string) => {
    setSelectedTransactionType(type as "Income" | "Expense")
    setSelectedCategoryId("")
    setIsCustomCategoryMode(false)
    setNewCategoryName("")
    // Reset category management state
    setEditingCategory(null)
    setEditCategoryName("")
    setCategoryToDelete(null)
  }

  const handleEditTransaction = (transaction: Transaction) => {
    setEditingTransaction(transaction)
    setFormData({
      title: transaction.Title,
      description: transaction.Description,
      amount: transaction.Amount.toString(),
    })
    setSelectedTransactionType(transaction.Type)
    setSelectedCategoryId(transaction.Category_ID.toString())
    setDate(new Date(transaction.Transaction_Date))
    setIsEditDialogOpen(true)
    setShowValidation(false)
  }

  const handleUpdateTransaction = async () => {
    if (!editingTransaction) return

    setShowValidation(true)

    // Validation
    if (!formData.title.trim()) {
      toast.error("Please enter a title")
      return
    }

    if (!formData.description.trim()) {
      toast.error("Please enter a description")
      return
    }

    if (!formData.amount.trim() || parseFloat(formData.amount) <= 0) {
      toast.error("Please enter a valid amount")
      return
    }

    if (!selectedTransactionType) {
      toast.error("Please select a transaction type")
      return
    }

    if (!selectedCategoryId) {
      toast.error("Please select a category")
      return
    }

    if (!date) {
      toast.error("Please select a date")
      return
    }

    try {
      const updateData = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        amount: parseFloat(formData.amount),

        categoryId: parseInt(selectedCategoryId),
        type: selectedTransactionType as "Income" | "Expense",
        transactionDate: date.toLocaleDateString('en-CA'),
      }

      const result = await updateTransaction({
        id: editingTransaction.Transaction_ID,
        transaction: updateData
      }).unwrap()

      if (result.success) {
        toast.success("Transaction updated successfully!")
        resetForm()
        setIsEditDialogOpen(false)
        setEditingTransaction(null)
        setShowValidation(false)
      } else {
        toast.error("Failed to update transaction")
      }
    } catch (error: any) {
      console.error("Error updating transaction:", error)
      toast.error(error?.data?.message || "Failed to update transaction")
    }
  }

  const handleDeleteTransaction = async (transactionId: number, transactionType: "Income" | "Expense") => {
    try {
      // Find the transaction to get categoryId and transactionDate for expenses
      const transactionToDelete = transactions.find(t => t.Transaction_ID === transactionId);

      const deleteParams: {
        id: number;
        type: "Income" | "Expense";
        categoryId?: number;
        transactionDate?: string;
      } = {
        id: transactionId,
        type: transactionType
      };

      // Add required parameters for expense transactions
      if (transactionType === "Expense" && transactionToDelete) {
        deleteParams.categoryId = transactionToDelete.Category_ID;
        deleteParams.transactionDate = transactionToDelete.Transaction_Date;
      }

      const result = await deleteTransaction(deleteParams).unwrap();

      if (result.success) {
        toast.success("Transaction deleted successfully!");
        setTransactionToDelete(null);
      } else {
        toast.error("Failed to delete transaction");
      }
    } catch (error: any) {
      console.error("Error deleting transaction:", error);
      toast.error(error?.data?.message || "Failed to delete transaction");
    }
  };
  const handleCreateCategory = async () => {
    if (!newCategoryName.trim() || !selectedTransactionType) {
      toast.error("Please enter a category name and select a transaction type")
      return
    }

    try {
      const result = await addCategory({
        name: newCategoryName.trim(),
        type: selectedTransactionType as "Income" | "Expense",
      }).unwrap()

      toast.success("Category created successfully!")
      setNewCategoryName("")
      setIsCustomCategoryMode(false)

      // Auto-select the newly created category
      if (result?.data?.categoryId) {
        setSelectedCategoryId(result.data.categoryId.toString())
      }
    } catch (error) {
      toast.error("Failed to create category")
    }
  }

  const handleEditCategory = async () => {
    if (!editingCategory || !editCategoryName.trim()) {
      toast.error("Please enter a valid category name")
      return
    }

    try {
      await updateCategory({
        id: editingCategory.Category_ID,
        name: editCategoryName.trim(),
        type: editingCategory.Type,
        userType: "Young-Adult"
      }).unwrap()

      toast.success("Category updated successfully!")
      setEditingCategory(null)
      setEditCategoryName("")
      // Close the category manager dialog if it's open
      setShowCategoryManager(false)
    } catch (error) {
      toast.error("Failed to update category")
    }
  }

  const handleDeleteCategory = async (categoryId: number) => {
    try {
      await deleteCategory({ id: categoryId, userType: "Young-Adult" }).unwrap()
      toast.success("Category deleted successfully!")
      setCategoryToDelete(null)
      // Close the category manager dialog if it's open
      setShowCategoryManager(false)
    } catch (error) {
      toast.error("Failed to delete category")
    }
  }

  const handleEditClick = (category: Category) => {
    setEditingCategory(category)
    setEditCategoryName(category.Name)
  }

  const handleDeleteClick = (category: Category) => {
    setCategoryToDelete(category)
  }

  // Young adults get all categories (both default and custom)
  const getAvailableCategories = () => {
    if (!categoriesData?.data) return []
    return categoriesData.data
  }

  // Young adults can only edit/delete their custom categories (Is_Default: false)
  const getEditableCategories = () => {
    if (!categoriesData?.data) return []
    return categoriesData.data.filter(category => !category.Is_Default)
  }

  const handleCategorySelectChange = (value: string) => {
    if (value === "create-new") {
      setIsCustomCategoryMode(true)
      setSelectedCategoryId("")
    } else {
      setIsCustomCategoryMode(false)
      setSelectedCategoryId(value)
    }
  }

  const resetForm = () => {
    setFormData({ title: "", description: "", amount: "" })
    setSelectedTransactionType("")
    setSelectedCategoryId("")
    setDate(undefined)
    setIsCustomCategoryMode(false)
    setNewCategoryName("")
    setEditingTransaction(null)
    setShowValidation(false)
  }
  const handleFormSubmit = async () => {
    setShowValidation(true)

    // Validation
    if (!formData.title.trim()) {
      toast.error("Please enter a title")
      return
    }

    if (!formData.description.trim()) {
      toast.error("Please enter a description")
      return
    }

    if (!formData.amount.trim() || parseFloat(formData.amount) <= 0) {
      toast.error("Please enter a valid amount")
      return
    }

    if (!selectedTransactionType) {
      toast.error("Please select a transaction type")
      return
    }

    if (!selectedCategoryId && !isCustomCategoryMode) {
      toast.error("Please select a category")
      return
    }

    if (isCustomCategoryMode && !newCategoryName.trim()) {
      toast.error("Please enter a category name")
      return
    }

    if (!date) {
      toast.error("Please select a date")
      return
    }

    try {
      let categoryIdToUse = selectedCategoryId

      // If creating a new category, create it first
      if (isCustomCategoryMode && newCategoryName.trim()) {
        const categoryResult = await addCategory({
          name: newCategoryName.trim(),
          type: selectedTransactionType as "Income" | "Expense",
        }).unwrap()

        if (categoryResult?.data?.categoryId) {
          categoryIdToUse = categoryResult.data.categoryId.toString()
        } else {
          toast.error("Failed to create category")
          return
        }
      }

      // Create the transaction
      const transactionData = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        amount: parseFloat(formData.amount),
        categoryId: parseInt(categoryIdToUse),
        type: selectedTransactionType as "Income" | "Expense",
        transactionDate: date.toLocaleDateString('en-CA'), // Format as YYYY-MM-DD in local timezone
      }

      const result = await createTransaction(transactionData).unwrap()

      if (result.success) {
        toast.success("Transaction added successfully!")
        resetForm()
        setIsDialogOpen(false)
      } else {
        toast.error("Failed to add transaction")
      }
    } catch (error: any) {
      console.error("Error creating transaction:", error)
      toast.error(error?.data?.message || "Failed to add transaction")
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Transactions</h1>
          <p className="text-muted-foreground">Track and manage all your financial activities</p>
        </div>
        <div className="flex gap-2">
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

          <Dialog open={isDialogOpen} onOpenChange={(open) => {
            setIsDialogOpen(open)
            if (!open) setShowValidation(false)
          }}>
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
                  <Select value={selectedTransactionType} onValueChange={handleTransactionTypeChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Income">Income</SelectItem>
                      <SelectItem value="Expense">Expense</SelectItem>
                    </SelectContent>
                  </Select>
                  {showValidation && !selectedTransactionType && (
                    <span className="text-xs text-red-500">Required</span>
                  )}
                </div>
                <div>
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    required
                    placeholder="e.g., Monthly Salary Payment"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  />
                  {showValidation && !formData.title.trim() && (
                    <span className="text-xs text-red-500">Required</span>
                  )}
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Input
                    id="description"
                    placeholder="e.g., Grocery shopping"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />
                  {showValidation && !formData.description.trim() && (
                    <span className="text-xs text-red-500">Required</span>
                  )}
                </div>
                <div>
                  <Label htmlFor="amount">Amount ({getCurrencySymbol()})</Label>
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  />
                  {showValidation && (!formData.amount.trim() || parseFloat(formData.amount) <= 0) && (
                    <span className="text-xs text-red-500">Required</span>
                  )}
                </div>
                <div>
                  <Label htmlFor="category">Category</Label>
                  <div className="space-y-2">
                    <Select
                      value={isCustomCategoryMode ? "create-new" : selectedCategoryId}
                      onValueChange={handleCategorySelectChange}
                      disabled={!selectedTransactionType}
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
                        {getAvailableCategories().filter(cat => cat.Is_Default).map((category) => (
                          <SelectItem key={category.Category_ID} value={category.Category_ID.toString()}>
                            {category.Name} <span className="text-xs text-muted-foreground">(Default)</span>
                          </SelectItem>
                        ))}
                        {getAvailableCategories().filter(cat => !cat.Is_Default).map((category) => (
                          <SelectItem
                            key={category.Category_ID}
                            value={category.Category_ID.toString()}
                            className="flex justify-between items-center w-full flex-row"
                          >
                            <span className="flex w-full justify-between">
                              <span className="min-w-[280px] flex items-center truncate">
                                {category.Name}
                                <span className="text-xs text-blue-600 flex items-center mx-1 gap-1">
                                  (Custom)
                                </span>
                              </span>
                            </span>
                          </SelectItem>
                        ))}
                        <SelectItem value="create-new" className="text-blue-600 font-medium">
                          + Create New Category
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    {showValidation && (!selectedCategoryId && !isCustomCategoryMode) && (
                      <span className="text-xs text-red-500">Required</span>
                    )}
                    {showValidation && isCustomCategoryMode && !newCategoryName.trim() && (
                      <span className="text-xs text-red-500">Required</span>
                    )}
                    {selectedTransactionType && (
                      <div className="relative">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="outline" className="w-full justify-start" >
                              <div className="text-xs text-blue-500">
                                Edit Custom Categories
                              </div>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent className="w-72" align="start">
                            {getAvailableCategories().filter(cat => !cat.Is_Default).length === 0 ? (
                              <DropdownMenuItem disabled className="text-center text-muted-foreground">
                                No custom categories for {selectedTransactionType}
                              </DropdownMenuItem>
                            ) : (
                              getAvailableCategories().filter(cat => !cat.Is_Default).map((category) => (
                                <DropdownMenuItem
                                  key={category.Category_ID}
                                  className="flex justify-between items-center p-2"
                                  onSelect={(e) => e.preventDefault()}
                                >
                                  <span className="truncate max-w-[140px]">{category.Name}</span>
                                  <div className="flex items-center gap-2 ml-2">
                                    <button
                                      type="button"
                                      className="p-1 hover:bg-blue-100 rounded transition-colors"
                                      onClick={(e) => {
                                        e.stopPropagation()
                                        handleEditClick(category)
                                      }}
                                      title="Edit category"
                                    >
                                      <Edit2 size={12} className="text-gray-600 hover:text-blue-600" />
                                    </button>
                                    <button
                                      type="button"
                                      className="p-1 hover:bg-red-100 rounded transition-colors"
                                      onClick={(e) => {
                                        e.stopPropagation()
                                        handleDeleteClick(category)
                                      }}
                                      title="Delete category"
                                    >
                                      <Trash2 size={12} className="text-gray-600 hover:text-red-600" />
                                    </button>
                                  </div>
                                </DropdownMenuItem>
                              ))
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    )}
                    {isCustomCategoryMode && (
                      <div className="flex gap-2">
                        <Input
                          placeholder="Enter new category name"
                          value={newCategoryName}
                          onChange={(e) => setNewCategoryName(e.target.value)}
                          className="text-sm"
                        />
                        <Button
                          size="sm"
                          onClick={handleCreateCategory}
                          disabled={isAddingCategory || !newCategoryName.trim()}
                        >
                          {isAddingCategory ? "Adding..." : "Add"}
                        </Button>
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    You can select from existing categories or create new ones
                  </p>
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
                  {showValidation && !date && (
                    <span className="text-xs text-red-500">Required</span>
                  )}
                </div>
                <Button
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                  onClick={handleFormSubmit}
                  disabled={isCreatingTransaction}
                >
                  {isCreatingTransaction ? "Adding Transaction..." : "Add Transaction"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Edit Category Dialog */}
      <Dialog open={!!editingCategory} onOpenChange={() => setEditingCategory(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Category</DialogTitle>
            <DialogDescription>Update the category name</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-category-name">Category Name</Label>
              <Input
                id="edit-category-name"
                value={editCategoryName}
                onChange={(e) => setEditCategoryName(e.target.value)}
                placeholder="Enter category name"
              />
            </div>
            <div className="flex gap-2">
              <Button
                onClick={handleEditCategory}
                disabled={isUpdatingCategory || !editCategoryName.trim()}
                className="flex-1"
              >
                {isUpdatingCategory ? "Updating..." : "Update"}
              </Button>
              <Button
                variant="outline"
                onClick={() => setEditingCategory(null)}
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      <Dialog open={isEditDialogOpen} onOpenChange={(open) => {
        setIsEditDialogOpen(open)
        if (!open) setShowValidation(false)
      }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Transaction</DialogTitle>
            <DialogDescription>Update the transaction details.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-type">Transaction Type</Label>
              <Select disabled={true} value={selectedTransactionType} onValueChange={handleTransactionTypeChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Income">Income</SelectItem>
                  <SelectItem value="Expense">Expense</SelectItem>
                </SelectContent>
              </Select>
              {showValidation && !selectedTransactionType && (
                <span className="text-xs text-red-500">Required</span>
              )}
            </div>
            <div>
              <Label htmlFor="edit-title">Title</Label>
              <Input
                id="edit-title"
                placeholder="e.g., Monthly Salary Payment"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
              {showValidation && !formData.title.trim() && (
                <span className="text-xs text-red-500">Required</span>
              )}
            </div>
            <div>
              <Label htmlFor="edit-description">Description</Label>
              <Input
                id="edit-description"
                placeholder="e.g., Grocery shopping"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
              {showValidation && !formData.description.trim() && (
                <span className="text-xs text-red-500">Required</span>
              )}
            </div>
            <div>
              <Label htmlFor="edit-amount">Amount   ({getCurrencySymbol()})</Label>
              <Input
                id="edit-amount"
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              />
              {showValidation && (!formData.amount.trim() || parseFloat(formData.amount) <= 0) && (
                <span className="text-xs text-red-500">Required</span>
              )}
            </div>
            <div>
              <Label htmlFor="edit-category">Category</Label>
              <Select
                value={selectedCategoryId}
                onValueChange={(value) => setSelectedCategoryId(value)}
                disabled={!selectedTransactionType}
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
                  {getAvailableCategories().filter(cat => cat.Is_Default).map((category) => (
                    <SelectItem key={category.Category_ID} value={category.Category_ID.toString()}>
                      {category.Name} <span className="text-xs text-muted-foreground">(Default)</span>
                    </SelectItem>
                  ))}
                  {getAvailableCategories().filter(cat => !cat.Is_Default).map((category) => (
                    <SelectItem key={category.Category_ID} value={category.Category_ID.toString()}>
                      {category.Name} <span className="text-xs text-blue-600">(Custom)</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {showValidation && !selectedCategoryId && (
                <span className="text-xs text-red-500">Required</span>
              )}
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
              {showValidation && !date && (
                <span className="text-xs text-red-500">Required</span>
              )}
            </div>
            <div className="flex gap-2">
              <Button
                onClick={handleUpdateTransaction}
                disabled={isUpdatingTransaction}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
              >
                {isUpdatingTransaction ? "Updating..." : "Update Transaction"}
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

      <AlertDialog open={!!categoryToDelete} onOpenChange={() => setCategoryToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Category</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{categoryToDelete?.Name}"? This action cannot be undone and will affect all transactions using this category.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setCategoryToDelete(null)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => categoryToDelete && handleDeleteCategory(categoryToDelete.Category_ID)}
              className="bg-red-600 hover:bg-red-700 text-white"
              disabled={isDeletingCategory}
            >
              {isDeletingCategory ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
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
              disabled={isDeletingTransaction}
            >
              {isDeletingTransaction ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-600">Total Income</CardTitle>
            <ArrowUpRight className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-700">({getCurrencySymbol()}) {totalIncome.toLocaleString()}</div>
            <p className="text-xs text-green-600">All time</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-red-600">Total Expenses</CardTitle>
            <ArrowDownRight className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-700">({getCurrencySymbol()}) {totalExpenses.toLocaleString()}</div>
            <p className="text-xs text-red-600">All time</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-600">Net Balance</CardTitle>
            <CalendarIcon className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-700">({getCurrencySymbol()}) {(totalIncome - totalExpenses).toLocaleString()}</div>
            <p className="text-xs text-blue-600">All time</p>
          </CardContent>
        </Card>
      </div>

      <div className="w-full flex justify-end"> 
        <ExportDialog transactions={transactions} userType="young-adult" />
      </div>

      {viewMode === "calendar" ? (
        <TransactionCalendar transactions={transactions} userType="young-adult" />
      ) : (
        <TransactionList
          transactions={transactions}
          userType="young-adult"
          onEditTransaction={handleEditTransaction}
          onDeleteTransaction={setTransactionToDelete}
        />
      )}
    </div>
  )
}