// 1. Add imports at the top (add these to existing imports)
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useMarkJarSpentMutation, useTransferToGoalMutation } from "@/services/controllers/jarsController"
import { useGetGoalsQuery } from "@/services/controllers/goalsController"
import { useCurrency } from "@/hooks/useCurrency"
import { useState } from "react"
import { Label } from "./ui/label"
import { AlertCircle, ArrowRight, Loader2, Target } from "lucide-react"
import { Button } from "./ui/button"
import { toast } from "sonner"

// 2. Replace TransferDialog interface with new shadcn dialog version
interface TransferDialogProps {
    isOpen: boolean
    onClose: () => void
    jarId: number
    jarAmount: number
    onTransfer: (goalId: number) => void
}

// 3. Add new shadcn TransferDialog component
export function TransferDialog({ isOpen, onClose, jarId, jarAmount, onTransfer }: TransferDialogProps) {
    const { formatCurrency } = useCurrency()
    const [selectedGoalId, setSelectedGoalId] = useState<string>("")
    const [errors, setErrors] = useState<{ goalId?: string }>({})

    // Get active goals from API
    const {
        data: goalsData,
        isLoading: isLoadingGoals
    } = useGetGoalsQuery()

    const activeGoals = goalsData?.data?.filter(goal => goal.Status === 'Active') || []

    const validateForm = () => {
        const newErrors: typeof errors = {}

        if (!selectedGoalId) newErrors.goalId = "Please select a goal"

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleSubmit = () => {
        if (validateForm()) {
            onTransfer(parseInt(selectedGoalId))
            // Reset form
            setSelectedGoalId("")
            setErrors({})
            onClose()
        }
        toast.success("Transfer successful!")

    }

    const handleClose = () => {
        setSelectedGoalId("")
        setErrors({})
        onClose()
    }

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="w-full max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <ArrowRight className="h-5 w-5" />
                        Transfer to Goal
                    </DialogTitle>
                    <DialogDescription>
                        Transfer {formatCurrency(jarAmount)} to one of your active goals
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                    {/* Goal Selection */}
                    <div className="space-y-2">
                        <Label>Select Goal</Label>
                        <Select
                            value={selectedGoalId}
                            onValueChange={(value) => {
                                setSelectedGoalId(value)
                                if (errors.goalId) setErrors({ ...errors, goalId: undefined })
                            }}
                        >
                            <SelectTrigger className={errors.goalId ? "border-red-500" : ""}>
                                <SelectValue placeholder="Choose a goal to transfer to" />
                            </SelectTrigger>
                            <SelectContent>
                                {isLoadingGoals ? (
                                    <SelectItem value="loading" disabled>
                                        <div className="flex items-center gap-2">
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                            Loading goals...
                                        </div>
                                    </SelectItem>
                                ) : activeGoals.length === 0 ? (
                                    <SelectItem value="no-goals" disabled>
                                        No active goals available
                                    </SelectItem>
                                ) : (
                                    activeGoals.map((goal) => (
                                        <SelectItem key={goal.Goal_ID} value={goal.Goal_ID.toString()}>
                                            <div className="flex flex-col">
                                                <span className="font-medium">{goal.Title}</span>
                                                <span className="text-xs text-secondary-600">
                                                    {formatCurrency(goal.Current_Amount)} of {formatCurrency(goal.Target_Amount)}
                                                </span>
                                            </div>
                                        </SelectItem>
                                    ))
                                )}
                            </SelectContent>
                        </Select>
                        {errors.goalId && (
                            <p className="text-sm text-red-600 flex items-center gap-1">
                                <AlertCircle className="h-3 w-3" />
                                {errors.goalId}
                            </p>
                        )}
                    </div>

                    {/* Selected Goal Preview */}
                    {selectedGoalId && activeGoals.length > 0 && (
                        <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                            {(() => {
                                const selectedGoal = activeGoals.find(goal => goal.Goal_ID.toString() === selectedGoalId)
                                if (!selectedGoal) return null

                                const newAmount = selectedGoal.Current_Amount + jarAmount
                                const newPercentage = Math.min((newAmount / selectedGoal.Target_Amount) * 100, 100)

                                return (
                                    <div>
                                        <div className="flex items-center gap-2 text-blue-700 mb-2">
                                            <Target className="h-4 w-4" />
                                            <span className="font-medium text-sm">Transfer Preview</span>
                                        </div>
                                        <div className="text-sm text-blue-600 space-y-1">
                                            <p>Goal: {selectedGoal.Title}</p>
                                            <p>Current: {formatCurrency(selectedGoal.Current_Amount)} → {formatCurrency(newAmount)}</p>
                                            <p>Progress: {selectedGoal.Completion_Percentage.toFixed(1)}% → {newPercentage.toFixed(1)}%</p>
                                        </div>
                                    </div>
                                )
                            })()}
                        </div>
                    )}

                    <div className="flex gap-2 pt-4">
                        <Button variant="outline" onClick={handleClose} className="flex-1">
                            Cancel
                        </Button>
                        <Button
                            onClick={handleSubmit}
                            className="flex-1"
                            disabled={isLoadingGoals || !selectedGoalId}
                        >
                            Transfer
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}