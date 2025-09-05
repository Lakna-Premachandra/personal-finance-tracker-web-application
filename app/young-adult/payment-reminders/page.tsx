"use client"
//young adult payment reminders page
import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import {
  Bell,
  Plus,
  Calendar as CalendarIcon,
  Clock,
  DollarSign,
  Edit,
  Trash2,
  CheckCircle,
  AlertCircle,
  Home,
  Car,
  CreditCard,
  Zap,
  Wifi,
  Heart,
  Smartphone,
  Book,
  Coffee,
} from "lucide-react"
import {
  CreatePaymentReminderRequest,
  PaymentReminder,
  UpdatePaymentReminderRequest,
  useCreatePaymentReminderMutation,
  useDeletePaymentReminderMutation,
  useGetPaymentRemindersQuery,
  useGetPaymentReminderStatsQuery,
  useMarkPaymentPaidMutation,
  useUpdatePaymentReminderMutation
} from "@/services/controllers/paymentRemindersController"
import { useCurrency } from "@/hooks/useCurrency"

// Category icons mapping for young adults
const categoryIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  Housing: Home,
  Insurance: Heart,
  Credit: CreditCard,
  Utilities: Zap,
  Transportation: Car,
  Other: CreditCard,
  Education: Book,
  Food: Coffee,
  Entertainment: Wifi,
  housing: Home,
  insurance: Heart,
  credit: CreditCard,
  utilities: Smartphone,
  transportation: Car,
  other: CreditCard,
}

// Category colors mapping for young adults
const categoryColors: Record<string, string> = {
  Housing: "bg-blue-500",
  Insurance: "bg-pink-500",
  Credit: "bg-red-500",
  Utilities: "bg-yellow-500",
  Transportation: "bg-green-500",
  Other: "bg-purple-500",
  housing: "bg-blue-500",
  insurance: "bg-pink-500",
  credit: "bg-red-500",
  utilities: "bg-yellow-500",
  transportation: "bg-green-500",
  other: "bg-purple-500",
  Education: 'bg-indigo-500',
  Food: 'bg-amber-500',
  Entertainment: 'bg-teal-500',
}

const format = (date: Date, formatString: string) => {
  if (formatString === "yyyy-MM-dd") {
    // Use local timezone to avoid date shifting
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  } else if (formatString === "PPP") {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  } else if (formatString === "MMM dd, yyyy") {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }
  return date.toLocaleDateString();
}

// Mock toast function
const toast = {
  success: (message: string) => console.log("Success:", message),
  error: (message: string) => console.error("Error:", message)
}

export default function PaymentRemindersPage() {
  const { formatCurrency, getCurrencySymbol } = useCurrency();

  // RTK Query hooks
  const {
    data: remindersResponse,
    isLoading: isLoadingReminders,
    error: remindersError,
    refetch: refetchReminders
  } = useGetPaymentRemindersQuery();

  const {
    data: statsResponse,
    isLoading: isLoadingStats,
    error: statsError,
    refetch: refetchStats
  } = useGetPaymentReminderStatsQuery();

  const [createReminder, { isLoading: isCreating }] = useCreatePaymentReminderMutation();
  const [updateReminder, { isLoading: isUpdating }] = useUpdatePaymentReminderMutation();
  const [deleteReminder, { isLoading: isDeleting }] = useDeletePaymentReminderMutation();
  const [markPaid] = useMarkPaymentPaidMutation();

  // Local state
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingReminder, setEditingReminder] = useState<PaymentReminder | null>(null);
  const [newReminder, setNewReminder] = useState<CreatePaymentReminderRequest>({
    title: "",
    amount: 0,
    dueDate: "",
    category: "",
    frequency: "monthly",
    remindDaysBefore: 3,
    isEnabled: true,
  });

  // Extract data from responses
  const reminders = remindersResponse?.data || [];
  const stats = statsResponse?.data || {
    activeReminders: 0,
    upcomingReminders: 0,
    overdueReminders: 0,
    totalAmount: 0
  };

  const isLoading = isLoadingReminders || isLoadingStats;
  const error = remindersError || statsError;

  // Reset form when dialog closes
  useEffect(() => {
    if (!isDialogOpen) {
      setNewReminder({
        title: "",
        amount: 0,
        dueDate: "",
        category: "",
        frequency: "monthly",
        remindDaysBefore: 3,
        isEnabled: true,
      });
      setDate(undefined);
      setEditingReminder(null);
    }
  }, [isDialogOpen]);

  // Populate form when editing
  useEffect(() => {
    if (editingReminder) {
      setNewReminder({
        title: editingReminder.Title,
        amount: editingReminder.Amount,
        dueDate: editingReminder.Due_Date,
        category: editingReminder.Category,
        frequency: editingReminder.Frequency,
        remindDaysBefore: editingReminder.Remind_Days_Before as 1 | 3 | 5 | 7,
        isEnabled: editingReminder.Is_Enabled,
      });
      setDate(new Date(editingReminder.Due_Date));
      setIsDialogOpen(true);
    }
  }, [editingReminder]);

  // Filter for overdue reminders - only show ENABLED overdue reminders in the special section
  const overdueReminders = reminders.filter((r) => r.Status === "overdue" && r.Is_Enabled);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "upcoming":
      case "scheduled":
        return "bg-blue-100 text-blue-700 border-blue-200";
      case "overdue":
        return "bg-red-100 text-red-700 border-red-200";
      case "complete":
        return "bg-green-100 text-green-700 border-green-200";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  const getDaysUntilDue = (dueDate: string) => {
    if (!dueDate) return 0;
    const today = new Date();
    const due = new Date(dueDate);
    if (isNaN(due.getTime())) return 0;
    const diffTime = due.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const handleCreateOrUpdate = async () => {
    try {
      if (!date) {
        toast.error("Please select a due date");
        return;
      }

      if (!newReminder.title || !newReminder.amount || !newReminder.category) {
        toast.error("Please fill in all required fields");
        return;
      }

      const reminderData: CreatePaymentReminderRequest | UpdatePaymentReminderRequest = {
        title: newReminder.title,
        amount: newReminder.amount,
        category: newReminder.category.charAt(0).toUpperCase() + newReminder.category.slice(1),
        dueDate: format(date, "yyyy-MM-dd"),
        remindDaysBefore: newReminder.remindDaysBefore,
        frequency: newReminder.frequency,
        isEnabled: newReminder.isEnabled,
      };

      if (editingReminder) {
        // Update existing reminder
        const result = await updateReminder({
          id: editingReminder.Reminder_ID,
          data: reminderData as UpdatePaymentReminderRequest
        }).unwrap();

        if (result.success) {
          toast.success(result.message || "Payment reminder updated successfully!");
          setIsDialogOpen(false);
          refetchReminders();
          refetchStats();
        }
      } else {
        // Create new reminder
        const result = await createReminder(reminderData as CreatePaymentReminderRequest).unwrap();

        if (result.success) {
          toast.success(result.message || "Payment reminder created successfully!");
          setIsDialogOpen(false);
          refetchReminders();
          refetchStats();
        }
      }
    } catch (error: any) {
      console.error('Error creating/updating reminder:', error);
      toast.error(error?.data?.message || error?.message || "An error occurred");
    }
  };

  const handleDelete = async (id: number) => {
    try {
      const result = await deleteReminder(id).unwrap();

      if (result.success) {
        toast.success(result.message || "Payment reminder deleted successfully!");
        refetchReminders();
        refetchStats();
      }
    } catch (error: any) {
      console.error('Error deleting reminder:', error);
      toast.error(error?.data?.message || error?.message || "Failed to delete reminder");
    }
  };

  const handleMarkPaid = async (id: number, title: string) => {
    try {
      const result = await markPaid({
        id,
        data: {
          paymentDate: format(new Date(), "yyyy-MM-dd"),
          description: `Payment for ${title}`
        }
      }).unwrap();

      if (result.success) {
        toast.success(result.message || "Payment marked as paid!");
        refetchReminders();
        refetchStats();
      }
    } catch (error: any) {
      console.error('Error marking payment as paid:', error);
      toast.error(error?.data?.message || error?.message || "Failed to mark payment as paid");
    }
  };

  const getCategoryIcon = (category: string) => {
    return categoryIcons[category] || CreditCard;
  };

  const getCategoryColor = (category: string) => {
    return categoryColors[category] || "from-gray-500 to-slate-500";
  };

  const handleRetry = () => {
    refetchReminders();
    refetchStats();
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading payment reminders...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-4" />
            <p className="text-red-600 mb-2">Failed to load payment reminders</p>
            <p className="text-sm text-gray-500 mb-4">
              {(error as any)?.data?.message || (error as any)?.message || 'Unknown error occurred'}
            </p>
            <Button onClick={handleRetry} className="bg-blue-600 hover:bg-blue-700">
              Try Again
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            Payment Reminders
          </h1>
          <p className="text-muted-foreground">Stay on top of your bills and maintain good credit</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r bg-blue-600 hover:bg-blue-700">
              <Plus className="mr-2 h-4 w-4" />
              Add Reminder
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingReminder ? "Edit Payment Reminder" : "Create Payment Reminder"}</DialogTitle>
              <DialogDescription>
                {editingReminder ? "Update your payment reminder details." : "Set up a new reminder for your recurring payments."}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="title">Payment Title</Label>
                <Input
                  id="title"
                  placeholder="e.g., Rent Payment"
                  value={newReminder.title}
                  onChange={(e) => setNewReminder({ ...newReminder, title: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="amount">Amount ({getCurrencySymbol()})</Label>
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    placeholder="1200.00"
                    value={newReminder.amount || ""}
                    onChange={(e) => setNewReminder({ ...newReminder, amount: parseFloat(e.target.value) || 0 })}
                  />
                </div>
                <div>
                  <Label htmlFor="category">Category</Label>
                  <Select
                    value={newReminder.category}
                    onValueChange={(value) => setNewReminder({ ...newReminder, category: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Housing">Housing</SelectItem>
                      <SelectItem value="Utilities">Utilities</SelectItem>
                      <SelectItem value="Insurance">Insurance</SelectItem>
                      <SelectItem value="Credit">Credit Cards</SelectItem>
                      <SelectItem value="Transportation">Transportation</SelectItem>
                      <SelectItem value="Education">Education</SelectItem>
                      <SelectItem value="Food">Food</SelectItem>
                      <SelectItem value="Entertainment">Entertainment</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label>Due Date</Label>
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
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="frequency">Frequency</Label>
                  <Select
                    value={newReminder.frequency}
                    onValueChange={(value) => setNewReminder({ ...newReminder, frequency: value as "monthly" | "quarterly" | "weekly" | "yearly" })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                      <SelectItem value="quarterly">Quarterly</SelectItem>
                      <SelectItem value="yearly">Yearly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="reminderDays">Remind me (days before)</Label>
                  <Select
                    value={newReminder.remindDaysBefore.toString()}
                    onValueChange={(value) => setNewReminder({ ...newReminder, remindDaysBefore: parseInt(value) as 1 | 3 | 5 | 7 })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1 day</SelectItem>
                      <SelectItem value="3">3 days</SelectItem>
                      <SelectItem value="5">5 days</SelectItem>
                      <SelectItem value="7">7 days</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="isActive"
                  checked={newReminder.isEnabled}
                  onCheckedChange={(checked) => setNewReminder({ ...newReminder, isEnabled: checked })}
                />
                <Label htmlFor="isActive">Enable reminder</Label>
              </div>
              <Button
                onClick={handleCreateOrUpdate}
                disabled={isCreating || isUpdating}
                className="w-full bg-gradient-to-r bg-blue-600 hover:bg-blue-700"
              >
                {(isCreating || isUpdating) ? "Saving..." : editingReminder ? "Update Reminder" : "Create Reminder"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Overview Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-600">Active Reminders</CardTitle>
            <Bell className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-700">{stats.activeReminders}</div>
            <p className="text-xs text-blue-600">Currently tracking</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-orange-600">Upcoming</CardTitle>
            <Clock className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-700">{stats.upcomingReminders}</div>
            <p className="text-xs text-orange-600">Due soon</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-red-600">Overdue</CardTitle>
            <AlertCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-700">{stats.overdueReminders}</div>
            <p className="text-xs text-red-600">Need attention</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-600">Monthly Total</CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-700">{getCurrencySymbol()}{(stats.totalAmount || 0).toFixed(2)}</div>
            <p className="text-xs text-green-600">Per month</p>
          </CardContent>
        </Card>
      </div>

      {/* Overdue Reminders - Only show ENABLED overdue reminders here */}
      {overdueReminders.length > 0 && (
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="text-red-700 flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              Overdue Payments - Action Required
            </CardTitle>
            <CardDescription className="text-red-600">
              These payments are overdue and may affect your credit score
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {overdueReminders.map((reminder) => {
                const IconComponent = getCategoryIcon(reminder.Category);
                return (
                  <div
                    key={reminder.Reminder_ID}
                    className="flex items-center justify-between p-4 bg-white rounded-lg border border-red-200"
                  >
                    <div className="flex items-center gap-4">
                      <div className={`p-3 rounded-lg bg-gradient-to-r ${getCategoryColor(reminder.Category)} text-white`}>
                        <IconComponent className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="font-semibold">{reminder.Title}</h3>
                        <p className="text-sm text-muted-foreground">
                          Due: {format(new Date(reminder.Due_Date), "MMM dd, yyyy")} •
                          {Math.abs(getDaysUntilDue(reminder.Due_Date))} days overdue
                        </p>
                        <Badge className="mt-1 bg-red-100 text-red-700 border-red-200">URGENT - May affect credit</Badge>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <div className="text-xl font-bold ">{getCurrencySymbol()}{reminder.Amount}</div>
                      </div>
                      <Button
                        size="sm"
                        className="bg-green-500 hover:bg-green-600"
                        onClick={() => handleMarkPaid(reminder.Reminder_ID, reminder.Title)}
                        disabled={isDeleting}
                      >
                        <CheckCircle className="mr-1 h-4 w-4" />
                        Mark Paid
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* All Reminders - Show ALL reminders but style disabled ones differently */}
      <Card>
        <CardHeader>
          <CardTitle>All Payment Reminders</CardTitle>
          <CardDescription>Manage your recurring payment reminders and maintain good credit</CardDescription>
        </CardHeader>
        <CardContent>
          {reminders.length === 0 ? (
            <div className="text-center py-8">
              <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No payment reminders yet</h3>
              <p className="text-gray-500 mb-4">Create your first payment reminder to stay on top of your bills</p>
              <Button
                onClick={() => setIsDialogOpen(true)}
                className="bg-gradient-to-r bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Your First Reminder
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {reminders.map((reminder) => {
                const IconComponent = getCategoryIcon(reminder.Category);
                const isDisabled = !reminder.Is_Enabled;

                return (
                  <div
                    key={reminder.Reminder_ID}
                    className={`flex items-center justify-between p-4 rounded-lg border transition-colors ${isDisabled ? "bg-gray-100 border-gray-300 opacity-75" : "hover:bg-gray-50"
                      }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`p-3 rounded-lg ${isDisabled
                        ? "bg-gray-400 text-white"
                        : `bg-gradient-to-r ${getCategoryColor(reminder.Category)} text-white`
                        }`}>
                        <IconComponent className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className={`font-semibold ${isDisabled ? "text-gray-500" : ""}`}>
                          {reminder.Title}
                          {isDisabled && <span className="ml-2 text-xs text-gray-400">(Disabled)</span>}
                        </h3>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge className={"text-xs bg-primary-500 text-white"}>
                            {reminder.Category}
                          </Badge>
                          <Badge variant="outline" className={`text-xs ${isDisabled ? "border-gray-300 text-gray-500" : ""}`}>
                            {reminder.Frequency}
                          </Badge>
                          <Badge className={`${isDisabled ? "bg-gray-200 text-gray-600 border-gray-300" : getStatusColor(reminder.Status)}`}>
                            {reminder.Status}
                          </Badge>
                        </div>
                        <p className={`text-sm text-muted-foreground mt-1 ${isDisabled ? "text-gray-400" : ""}`}>
                          {reminder.Due_Date && !isNaN(new Date(reminder.Due_Date).getTime()) ? (
                            <>
                              Due: {format(new Date(reminder.Due_Date), "MMM dd, yyyy")} • Remind {reminder.Remind_Days_Before} days
                              before
                            </>
                          ) : (
                            "No due date"
                          )}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className={`text-lg font-bold ${isDisabled ? "text-gray-500" : ""}`}>
                          {getCurrencySymbol()}{reminder.Amount.toLocaleString()}
                        </div>
                        <div className={`text-sm ${isDisabled ? "text-gray-400" : "text-muted-foreground"}`}>
                          {getDaysUntilDue(reminder.Due_Date) > 0
                            ? `${getDaysUntilDue(reminder.Due_Date)} days left`
                            : `${Math.abs(getDaysUntilDue(reminder.Due_Date))} days overdue`}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          className={`h-8 w-8 ${isDisabled ? "text-gray-400 hover:text-gray-600" : ""}`}
                          onClick={() => setEditingReminder(reminder)}
                          disabled={isDeleting}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className={`h-8 w-8 ${isDisabled ? "text-gray-400 hover:text-red-500" : "text-red-500 hover:text-red-700"}`}
                          onClick={() => handleDelete(reminder.Reminder_ID)}
                          disabled={isDeleting}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}