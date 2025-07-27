"use client"

import { useState } from "react"
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
  CalendarIcon,
  Clock,
  DollarSign,
  Edit,
  Trash2,
  CheckCircle,
  AlertCircle,
  Smartphone,
  Wifi,
  Book,
  Car,
} from "lucide-react"
import { format } from "date-fns"
import { useCurrency } from "@/hooks/useCurrency"

export default function PaymentRemindersPage() {
  const { formatCurrency, getCurrencySymbol } = useCurrency();

  const [date, setDate] = useState<Date>()
  const [newReminder, setNewReminder] = useState({
    title: "",
    amount: "",
    dueDate: "",
    category: "",
    frequency: "monthly",
    reminderDays: "3",
    isActive: true,
  })

  const reminders = [
    {
      id: 1,
      title: "Phone Bill",
      amount: 45,
      dueDate: "2024-02-15",
      category: "Utilities",
      frequency: "monthly",
      reminderDays: 3,
      isActive: true,
      status: "upcoming",
      icon: Smartphone,
      color: "from-blue-500 to-cyan-500",
    },
    {
      id: 2,
      title: "Internet Subscription",
      amount: 29.99,
      dueDate: "2024-02-20",
      category: "Utilities",
      frequency: "monthly",
      reminderDays: 5,
      isActive: true,
      status: "upcoming",
      icon: Wifi,
      color: "from-green-500 to-emerald-500",
    },
    {
      id: 3,
      title: "School Supplies",
      amount: 75,
      dueDate: "2024-02-10",
      category: "Education",
      frequency: "monthly",
      reminderDays: 2,
      isActive: true,
      status: "overdue",
      icon: Book,
      color: "from-purple-500 to-pink-500",
    },
    {
      id: 4,
      title: "Bus Pass",
      amount: 25,
      dueDate: "2024-02-25",
      category: "Transportation",
      frequency: "monthly",
      reminderDays: 7,
      isActive: false,
      status: "upcoming",
      icon: Car,
      color: "from-orange-500 to-red-500",
    },
  ]

  const upcomingReminders = reminders.filter((r) => r.status === "upcoming" && r.isActive)
  const overdueReminders = reminders.filter((r) => r.status === "overdue" && r.isActive)
  const totalMonthlyPayments = reminders
    .filter((r) => r.isActive && r.frequency === "monthly")
    .reduce((sum, r) => sum + r.amount, 0)

  const getStatusColor = (status: string) => {
    switch (status) {
      case "upcoming":
        return "bg-blue-100 text-blue-700 border-blue-200"
      case "overdue":
        return "bg-red-100 text-red-700 border-red-200"
      case "paid":
        return "bg-green-100 text-green-700 border-green-200"
      default:
        return "bg-gray-100 text-gray-700 border-gray-200"
    }
  }

  const getDaysUntilDue = (dueDate: string) => {
    const today = new Date()
    const due = new Date(dueDate)
    const diffTime = due.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            Payment Reminders
          </h1>
          <p className="text-muted-foreground">Never miss a payment with smart reminders</p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700">
              <Plus className="mr-2 h-4 w-4" />
              Add Reminder
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Payment Reminder</DialogTitle>
              <DialogDescription>Set up a new reminder for your recurring payments.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="title">Payment Title</Label>
                <Input
                  id="title"
                  placeholder="e.g., Phone Bill"
                  value={newReminder.title}
                  onChange={(e) => setNewReminder({ ...newReminder, title: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="amount">Amount {getCurrencySymbol()}</Label>
                  <Input
                    id="amount"
                    type="number"
                    placeholder="45.00"
                    value={newReminder.amount}
                    onChange={(e) => setNewReminder({ ...newReminder, amount: e.target.value })}
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
                      <SelectItem value="utilities">Utilities</SelectItem>
                      <SelectItem value="education">Education</SelectItem>
                      <SelectItem value="transportation">Transportation</SelectItem>
                      <SelectItem value="entertainment">Entertainment</SelectItem>
                      <SelectItem value="food">Food</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
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
                    onValueChange={(value) => setNewReminder({ ...newReminder, frequency: value })}
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
                    value={newReminder.reminderDays}
                    onValueChange={(value) => setNewReminder({ ...newReminder, reminderDays: value })}
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
                  checked={newReminder.isActive}
                  onCheckedChange={(checked) => setNewReminder({ ...newReminder, isActive: checked })}
                />
                <Label htmlFor="isActive">Enable reminder</Label>
              </div>
              <Button className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700">
                Create Reminder
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Overview Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Reminders</CardTitle>
            <Bell className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-700">{reminders.filter((r) => r.isActive).length}</div>
            <p className="text-xs text-blue-600">Currently tracking</p>
          </CardContent>
        </Card>

        <Card className="">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Upcoming</CardTitle>
            <Clock className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-700">{upcomingReminders.length}</div>
            <p className="text-xs text-orange-600">Due soon</p>
          </CardContent>
        </Card>

        <Card className="">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overdue</CardTitle>
            <AlertCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-700">{overdueReminders.length}</div>
            <p className="text-xs text-red-600">Need attention</p>
          </CardContent>
        </Card>

        <Card className="">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Total</CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-700">{getCurrencySymbol()}{totalMonthlyPayments}</div>
            <p className="text-xs text-green-600">Per month</p>
          </CardContent>
        </Card>
      </div>

      {/* Overdue Reminders */}
      {overdueReminders.length > 0 && (
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="text-red-700 flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              Overdue Payments
            </CardTitle>
            <CardDescription className="text-red-600">These payments need your immediate attention</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {overdueReminders.map((reminder) => (
                <div
                  key={reminder.id}
                  className="flex items-center justify-between p-3 bg-white rounded-lg border border-red-200"
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg bg-gradient-to-r ${reminder.color} text-white`}>
                      <reminder.icon className="h-4 w-4" />
                    </div>
                    <div>
                      <h3 className="font-medium">{reminder.title}</h3>
                      <p className="text-sm text-muted-foreground">
                        Due: {format(new Date(reminder.dueDate), "MMM dd, yyyy")} •
                        {Math.abs(getDaysUntilDue(reminder.dueDate))} days overdue
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="text-right">
                      <div className="font-semibold">{getCurrencySymbol()}{reminder.amount}</div>
                      <Badge className={getStatusColor(reminder.status)}>Overdue</Badge>
                    </div>
                    <Button size="sm" className="bg-green-500 hover:bg-green-600">
                      <CheckCircle className="mr-1 h-3 w-3" />
                      Mark Paid
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* All Reminders */}
      <Card>
        <CardHeader>
          <CardTitle>All Payment Reminders</CardTitle>
          <CardDescription>Manage your recurring payment reminders</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {reminders.map((reminder) => (
              <div
                key={reminder.id}
                className={`flex items-center justify-between p-4 rounded-lg border transition-colors ${reminder.isActive ? "hover:bg-gray-50" : "opacity-60 bg-gray-50"
                  }`}
              >
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-lg bg-gradient-to-r ${reminder.color} text-white`}>
                    <reminder.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold">{reminder.title}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="secondary" className="text-xs">
                        {reminder.category}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {reminder.frequency}
                      </Badge>
                      <Badge className={getStatusColor(reminder.status)}>{reminder.status}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      Due: {format(new Date(reminder.dueDate), "MMM dd, yyyy")} • Remind {reminder.reminderDays} days
                      before
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className="text-lg font-bold">{getCurrencySymbol()}{reminder.amount}</div>
                    <div className="text-sm text-muted-foreground">
                      {getDaysUntilDue(reminder.dueDate) > 0
                        ? `${getDaysUntilDue(reminder.dueDate)} days left`
                        : `${Math.abs(getDaysUntilDue(reminder.dueDate))} days overdue`}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500 hover:text-red-700">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
