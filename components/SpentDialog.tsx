import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { useCurrency } from "@/hooks/useCurrency"
import { useGetCategoriesByTypeAndUserTypeQuery } from "@/services/controllers/categoryController"
import { useMarkJarSpentMutation } from "@/services/controllers/jarsController"
import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card"
import { ShoppingCart, X, AlertCircle, Loader2 } from "lucide-react"
import { Button } from "./ui/button"
import { Label } from "./ui/label"
import { Input } from "./ui/input"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "./ui/dialog"


// 2. Add SpentDialog interface after existing interfaces
interface SpentDialogProps {
  isOpen: boolean
  onClose: () => void
  jarId: number
  jarAmount: number
  onMarkSpent: (data: { title: string; categoryId: number; description: string }) => void
}

// 3. Add SpentDialog component after TransferDialog component
function SpentDialog({ isOpen, onClose, jarId, jarAmount, onMarkSpent }: SpentDialogProps) {
  const { formatCurrency } = useCurrency()
  const [title, setTitle] = useState("")
  const [categoryId, setCategoryId] = useState<string>("")
  const [description, setDescription] = useState("")
  const [errors, setErrors] = useState<{ title?: string; categoryId?: string; description?: string }>({})

  // Get expense categories - assuming userType is available (you may need to get this from context/store)
  const userType = "Student" // Replace with actual user type from your app state
  const { 
    data: categoriesData, 
    isLoading: isLoadingCategories 
  } = useGetCategoriesByTypeAndUserTypeQuery({ 
    type: 'Expense', 
    userType 
  })

  const categories = categoriesData?.data || []

  const validateForm = () => {
    const newErrors: typeof errors = {}
    
    if (!title.trim()) newErrors.title = "Title is required"
    if (!categoryId) newErrors.categoryId = "Category is required"
    if (!description.trim()) newErrors.description = "Description is required"

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = () => {
    if (validateForm()) {
      onMarkSpent({
        title: title.trim(),
        categoryId: parseInt(categoryId),
        description: description.trim()
      })
      // Reset form
      setTitle("")
      setCategoryId("")
      setDescription("")
      setErrors({})
      onClose()
    }
  }

  const handleClose = () => {
    setTitle("")
    setCategoryId("")
    setDescription("")
    setErrors({})
    onClose()
  }

  if (!isOpen) return null

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="w-full max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" />
            Mark as Spent
          </DialogTitle>
          <DialogDescription>
            Mark {formatCurrency(jarAmount)} as spent and record the expense
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          {/* Title Input */}
          <div className="space-y-2">
            <Label htmlFor="expense-title">Expense Title</Label>
            <Input
              id="expense-title"
              placeholder="e.g., New Laptop"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value)
                if (errors.title) setErrors({ ...errors, title: undefined })
              }}
              className={errors.title ? "border-red-500" : ""}
            />
            {errors.title && (
              <p className="text-sm text-red-600 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {errors.title}
              </p>
            )}
          </div>

          {/* Category Dropdown */}
          <div className="space-y-2">
            <Label>Category</Label>
            <Select 
              value={categoryId} 
              onValueChange={(value) => {
                setCategoryId(value)
                if (errors.categoryId) setErrors({ ...errors, categoryId: undefined })
              }}
            >
              <SelectTrigger className={errors.categoryId ? "border-red-500" : ""}>
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {isLoadingCategories ? (
                  <SelectItem value="loading" disabled>
                    <div className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Loading categories...
                    </div>
                  </SelectItem>
                ) : categories.length === 0 ? (
                  <SelectItem value="no-categories" disabled>
                    No expense categories available
                  </SelectItem>
                ) : (
                  categories.map((category) => (
                    <SelectItem key={category.Category_ID} value={category.Category_ID.toString()}>
                      {category.Name}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
            {errors.categoryId && (
              <p className="text-sm text-red-600 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {errors.categoryId}
              </p>
            )}
          </div>

          {/* Description Input */}
          <div className="space-y-2">
            <Label htmlFor="expense-description">Description</Label>
            <Textarea
              id="expense-description"
              placeholder="e.g., Bought laptop for work/studies"
              value={description}
              onChange={(e) => {
                setDescription(e.target.value)
                if (errors.description) setErrors({ ...errors, description: undefined })
              }}
              className={errors.description ? "border-red-500" : ""}
              rows={3}
            />
            {errors.description && (
              <p className="text-sm text-red-600 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {errors.description}
              </p>
            )}
          </div>

          <div className="flex gap-2 pt-4">
            <Button variant="outline" onClick={handleClose} className="flex-1">
              Cancel
            </Button>
            <Button 
              onClick={handleSubmit}
              className="flex-1"
              disabled={isLoadingCategories}
            >
              Mark as Spent
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}export default SpentDialog