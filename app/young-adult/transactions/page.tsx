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

export default function YoungAdultTransactionsPage() {
  const [date, setDate] = useState<Date>()
  const [viewMode, setViewMode] = useState<"calendar" | "list">("list")
  const [selectedTransactionType, setSelectedTransactionType] = useState<"Income" | "Expense" | "">("")
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("")
  const [newCategoryName, setNewCategoryName] = useState("")
  const [isCustomCategoryMode, setIsCustomCategoryMode] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [editCategoryName, setEditCategoryName] = useState("")
  const [showCategoryManager, setShowCategoryManager] = useState(false)
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null)

  // Form state
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    amount: "",
  })

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

  const transactions = [
    {
      id: 1,
      type: "income" as const,
      description: "Monthly Salary",
      amount: 215000,
      category: "Salary",
      date: "2024-01-15",
      time: "09:00 AM",
    },
    {
      id: 2,
      type: "expense" as const,
      description: "Rent Payment",
      amount: -80000,
      category: "Housing",
      date: "2024-01-15",
      time: "10:00 AM",
    },
    {
      id: 3,
      type: "expense" as const,
      description: "Grocery Shopping",
      amount: -12550,
      category: "Food",
      date: "2024-01-14",
      time: "06:30 PM",
    },
    {
      id: 4,
      type: "expense" as const,
      description: "Gas Station",
      amount: -4500,
      category: "Transportation",
      date: "2024-01-13",
      time: "08:15 AM",
    },
    {
      id: 5,
      type: "expense" as const,
      description: "Netflix Subscription",
      amount: -1599,
      category: "Entertainment",
      date: "2024-01-12",
      time: "12:00 PM",
    },
    {
      id: 6,
      type: "income" as const,
      description: "Freelance Project",
      amount: 30000,
      category: "Freelance",
      date: "2024-01-10",
      time: "02:30 PM",
    },
    {
      id: 7,
      type: "expense" as const,
      description: "Electric Bill",
      amount: -8500,
      category: "Utilities",
      date: "2024-01-10",
      time: "11:00 AM",
    },
    {
      id: 8,
      type: "expense" as const,
      description: "Coffee Shop",
      amount: -1250,
      category: "Food",
      date: "2024-12-09",
      time: "08:30 AM",
    },
    {
      id: 9,
      type: "expense" as const,
      description: "Car Insurance",
      amount: -15000,
      category: "Transportation",
      date: "2024-12-08",
      time: "03:00 PM",
    },
    {
      id: 10,
      type: "income" as const,
      description: "Investment Dividend",
      amount: 8500,
      category: "Investment",
      date: "2024-12-05",
      time: "10:00 AM",
    },
    {
      id: 11,
      type: "expense" as const,
      description: "Gym Membership",
      amount: -5000,
      category: "Healthcare",
      date: "2024-11-28",
      time: "07:00 PM",
    },
    {
      id: 12,
      type: "income" as const,
      description: "Bonus Payment",
      amount: 50000,
      category: "Salary",
      date: "2024-11-25",
      time: "02:00 PM",
    },
  ]

  const totalIncome = transactions.filter((t) => t.type === "income").reduce((sum, t) => sum + t.amount, 0)
  const totalExpenses = Math.abs(transactions.filter((t) => t.type === "expense").reduce((sum, t) => sum + t.amount, 0))

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

  const handleCreateCategory = async () => {
    if (!newCategoryName.trim() || !selectedTransactionType) {
      toast.error("Please enter a category name and select a transaction type")
      return
    }

    try {
      await addCategory({
        name: newCategoryName.trim(),
        type: selectedTransactionType as "Income" | "Expense",
      }).unwrap()

      toast.success("Category created successfully!")
      setNewCategoryName("")
      setIsCustomCategoryMode(false)
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

  const handleFormSubmit = () => {
    if (!formData.title.trim() || !formData.description.trim() || !formData.amount.trim() || !selectedTransactionType || (!selectedCategoryId && !isCustomCategoryMode)) {
      toast.error("Please fill in all required fields")
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

    // Here you would typically submit the transaction data to your API
    toast.success("Transaction added successfully!")

    // Reset form
    setFormData({ title: "", description: "", amount: "" })
    setSelectedTransactionType("")
    setSelectedCategoryId("")
    setDate(undefined)
    setIsCustomCategoryMode(false)
    setNewCategoryName("")
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Transactions</h1>
          <p className="text-muted-foreground">Track and manage all your financial activities</p>
        </div>
        <div className="flex gap-2">
          {/* Export Button */}
          <ExportDialog transactions={transactions} userType="young-adult" />

          {/* Category Manager Button */}
          <Dialog open={showCategoryManager} onOpenChange={setShowCategoryManager}>
            <DialogTrigger asChild>
              <Button variant="outline" className="bg-transparent">
                <Settings className="mr-2 h-4 w-4" />
                Manage Categories
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Manage Categories</DialogTitle>
                <DialogDescription>Edit or delete your custom categories</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Transaction Type</Label>
                  <Select value={selectedTransactionType} onValueChange={(value) => setSelectedTransactionType(value as "Income" | "Expense" | "")}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type to view categories" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Income">Income</SelectItem>
                      <SelectItem value="Expense">Expense</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {selectedTransactionType && (
                  <div className="space-y-2">
                    <Label>Your Custom Categories</Label>
                    <div className="max-h-60 overflow-y-auto space-y-2">
                      {getEditableCategories().length === 0 ? (
                        <p className="text-sm text-muted-foreground">No custom categories yet</p>
                      ) : (
                        getEditableCategories().map((category) => (
                          <div key={category.Category_ID} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 transition-colors">
                            <span className="text-sm font-medium">{category.Name}</span>
                            <div className="flex items-center gap-1">
                              {/* Edit Button with Edit2 Icon */}
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleEditClick(category)}
                                disabled={isUpdatingCategory}
                                className="h-8 w-8 p-0 hover:bg-blue-100 hover:text-blue-600"
                                title="Edit category"
                              >
                                <Edit2 className="h-4 w-4" />
                              </Button>

                              {/* Delete Button with Trash2 Icon (Bin) */}
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleDeleteClick(category)}
                                disabled={isDeletingCategory}
                                className="h-8 w-8 p-0 hover:bg-red-100 hover:text-red-600"
                                title="Delete category"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            </DialogContent>
          </Dialog>

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
                  <Select value={selectedTransactionType} onValueChange={handleTransactionTypeChange}>
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
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    placeholder="e.g., Monthly Salary Payment"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Input
                    id="description"
                    placeholder="e.g., Grocery shopping"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="amount">Amount (LKR)</Label>
                  <Input
                    id="amount"
                    type="number"
                    placeholder="0.00"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  />
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
                        {/* Default categories first */}
                        {getAvailableCategories().filter(cat => cat.Is_Default).map((category) => (
                          <SelectItem key={category.Category_ID} value={category.Category_ID.toString()}>
                            {category.Name} <span className="text-xs text-muted-foreground">(Default)</span>
                          </SelectItem>
                        ))}
                        {/* Custom categories */}
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

                    {/* Quick Edit Categories Dropdown */}
                    {selectedTransactionType && (
                      <div className="relative">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="outline" className="w-full justify-start" >
                              <div className="text-xs text-blue-500">
                                Edit Custom Categories
                              </div>                            </Button>
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
                </div>
                <Button
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                  onClick={handleFormSubmit}
                >
                  Add Transaction
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

      {/* Delete Category Alert Dialog */}
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

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Income</CardTitle>
            <ArrowUpRight className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-700">LKR {totalIncome.toLocaleString()}</div>
            <p className="text-xs text-green-600">All time</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
            <ArrowDownRight className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-700">LKR {totalExpenses.toLocaleString()}</div>
            <p className="text-xs text-red-600">All time</p>
          </CardContent>
        </Card>

        <Card>
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
        <TransactionCalendar transactions={transactions} userType="young-adult" />
      ) : (
        <TransactionList transactions={transactions} userType="young-adult" />
      )}
    </div>
  )
}