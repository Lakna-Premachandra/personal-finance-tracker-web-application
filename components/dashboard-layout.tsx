"use client"

import type React from "react"
import { SidebarNav } from "@/components/sidebar-nav"
import { Avatar, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { useGetCronStatusQuery, useLazyTriggerManualCheckQuery, useStartCronServiceMutation } from "@/services/controllers/cronController"
import { 
  useGetUserNotificationsQuery, 
  useProcessNotificationMutation,
  useMarkNotificationsAsReadMutation,
  isAgeTransitionNotification,
  type Notification 
} from "@/services/controllers/notificationController"
import { logout } from "@/store/slices/authSlice"
import { Bell, LogOut, Menu, PiggyBank, Settings, Clock, Calendar, DollarSign, Gift, X } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "./ui/dialog"
import { toast } from "@/components/ui/use-toast"

// Add RootState type
export interface RootState {
  auth: {
    token: string | null
    user: {
      id: number
      username: string
      email: string
      type: 'Young-Adult' | 'Student'
      profilePicture?: string | null
    } | null
    isAuthenticated: boolean
  }
}

interface DashboardLayoutProps {
  children: React.ReactNode
  userType: "student" | "young-adult"
  userName?: string // This is now optional since we'll get it from Redux
}

export function DashboardLayout({ children, userType, userName }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [openConfirmation, setOpenConfirmation] = useState(false)
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const [selectedNotifications, setSelectedNotifications] = useState<number[]>([])
  const dispatch = useDispatch()
  const router = useRouter()

  // Get user data from Redux store
  const user = useSelector((state: RootState) => state.auth.user)

  // Get notifications for the current user with auto-refresh
  const { 
    data: notificationData, 
    isLoading: notificationsLoading, 
    refetch: refetchNotifications,
    error: notificationsError 
  } = useGetUserNotificationsQuery(
    user?.id || 0,
    { 
      skip: !user?.id,
      refetchOnFocus: true, // Refetch when window gains focus
      refetchOnReconnect: true // Refetch when network reconnects
    }
  )

  // Mutations
  const [processNotification, { isLoading: isProcessing }] = useProcessNotificationMutation()
  const [markAsRead, { isLoading: isMarkingRead }] = useMarkNotificationsAsReadMutation()

  const notifications = notificationData?.notifications || []
  const unprocessedCount = notifications.filter(n => !n.Is_Processed).length
  const hasUnprocessedNotifications = notificationData?.hasUnprocessedNotifications || false

  // Use username from Redux store, fallback to prop, then to default
  const displayName = user?.username || userName || ''
  
  // Cron service queries and mutations
  const { data: status, isLoading } = useGetCronStatusQuery(
    user?.id || 0,
    { skip: !user?.id }
  )
  const [startCron] = useStartCronServiceMutation()
  const [triggerCheck] = useLazyTriggerManualCheckQuery()

  // Auto-refresh notifications every 30 seconds
  useEffect(() => {
    if (!user?.id) return

    const interval = setInterval(() => {
      refetchNotifications()
    }, 2000) // 30 seconds

    return () => clearInterval(interval)
  }, [user?.id, refetchNotifications])

  // Start cron service
  useEffect(() => {
    const initializeCronServices = async () => {
      try {
        // Start cron service
        await startCron({}).unwrap()
        console.log('Cron service started successfully')
      } catch (error) {
        console.error('Failed to start cron service:', error)
      }

      try {
        // Trigger manual check
        await triggerCheck({}).unwrap()
        console.log('Manual birthday check triggered successfully')
        // Refetch notifications after manual check
        setTimeout(() => {
          refetchNotifications()
        }, 2000) // Wait 2 seconds then refetch
      } catch (error) {
        console.error('Failed to trigger manual birthday check:', error)
      }
    }

    // Only initialize if user is authenticated
    if (user?.id) {
      initializeCronServices()
    }
  }, [user?.id, startCron, triggerCheck, refetchNotifications])

  // Handle logout
  const handleLogout = () => {
    // Dispatch logout action to clear Redux state and localStorage
    dispatch(logout())
    // Redirect to login page
    router.push('/login') // or wherever your login page is
  }

  const handleConfirmation = () => {
    setOpenConfirmation(true)
  }

  // Handle notification actions (birthday transitions and payment reminders)
  const handleNotificationAction = async (notificationId: number, userTypeChoice?: string) => {
    if (!user?.id) return

    try {
      const result = await processNotification({
        userId: user.id,
        notificationId,
        userTypeChoice
      }).unwrap()

      // Show success message
      toast({
        title: "Success",
        description: result.message || "Notification processed successfully",
        variant: "default",
      })

      // Handle different notification types
      if (result.notificationType === "birthday" && result.transitionCompleted) {
        toast({
          title: "Account Upgraded!",
          description: result.transitionMessage || `Your account has been upgraded to ${result.newUserType}`,
          variant: "default",
        })
        
        // Optionally reload the page or update user state
        // You might want to update the Redux auth state here
        setTimeout(() => {
          window.location.reload() // Or handle state update more elegantly
        }, 2000)
      }

      // Refetch notifications after processing
      await refetchNotifications()
      
    } catch (error: any) {
      console.error('Failed to process notification:', error)
      toast({
        title: "Error",
        description: error?.data?.message || "Failed to process notification",
        variant: "destructive",
      })
    }
  }

  // Mark notifications as read
  const handleMarkAsRead = async (notificationIds: number[]) => {
    if (!user?.id || notificationIds.length === 0) return

    try {
      await markAsRead({
        userId: user.id,
        notificationIds
      }).unwrap()

      toast({
        title: "Success",
        description: `Marked ${notificationIds.length} notification(s) as read`,
        variant: "default",
      })

      setSelectedNotifications([])
      await refetchNotifications()
    } catch (error: any) {
      console.error('Failed to mark notifications as read:', error)
      toast({
        title: "Error",
        description: error?.data?.message || "Failed to mark notifications as read",
        variant: "destructive",
      })
    }
  }

  // Get notification icon based on type
  const getNotificationIcon = (notification: Notification) => {
    if (notification.type === "Birthday" || isAgeTransitionNotification(notification)) {
      return <Gift className="h-4 w-4 text-yellow-600" />
    } else if (notification.type === "PaymentReminder") {
      return <DollarSign className="h-4 w-4 text-red-600" />
    }
    return <Bell className="h-4 w-4 text-blue-600" />
  }

  // Get notification badge color based on type and status
  const getNotificationBadge = (notification: Notification) => {
    if (!notification.Is_Processed) {
      if (notification.type === "Birthday") {
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Birthday</Badge>
      } else if (notification.type === "PaymentReminder") {
        return <Badge variant="destructive" className="bg-red-100 text-red-800">Payment Due</Badge>
      }
      return <Badge variant="outline">New</Badge>
    }
    return <Badge variant="outline" className="opacity-60">Read</Badge>
  }

  // Format notification date
  const formatNotificationDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))
    
    if (diffInHours < 1) return "Just now"
    if (diffInHours < 24) return `${diffInHours}h ago`
    if (diffInHours < 48) return "Yesterday"
    return date.toLocaleDateString()
  }

  return (
    <div className="min-h-screen bg-secondary-50">  
      {/* Sidebar */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-200 ease-in-out lg:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex h-16 items-center gap-2 border-b px-6 ">
          <div className="flex h-9 w-9 items-center justify-center rounded-sm bg-primary shadow-lg">
            <PiggyBank className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-semibold">BudgetMate</h1>
            <p className="text-xs text-secondary-500 capitalize">{userType.replace("-", " ")} Mode</p>
          </div>
        </div>
        <div className="p-4">
          <SidebarNav userType={userType} />
        </div>
      </div>

      {/* Main Content */}
      <div className="lg:pl-64 ">
        {/* Header */}
        <header className="sticky top-0 z-40 bg-white border-b">
          <div className="flex h-16 items-center gap-4 px-6  justify-end">
            <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setSidebarOpen(!sidebarOpen)}>
              <Menu className="h-5 w-5" />
            </Button>

            <div className="flex justify-end items-center gap-2">
              <DropdownMenu open={notificationsOpen} onOpenChange={setNotificationsOpen}>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="relative">
                    <Bell className="h-5 w-5" />
                    {unprocessedCount > 0 && (
                      <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 rounded-full text-xs text-white flex items-center justify-center font-medium">
                        {unprocessedCount > 99 ? '99+' : unprocessedCount}
                      </span>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-96" align="end" sideOffset={8}>
                  <div className="flex items-center justify-between p-3 border-b">
                    <DropdownMenuLabel className="p-0 text-base font-semibold">
                      Notifications
                    </DropdownMenuLabel>
                    <div className="flex items-center gap-2">
                      {selectedNotifications.length > 0 && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleMarkAsRead(selectedNotifications)}
                          disabled={isMarkingRead}
                          className="h-7 px-2 text-xs"
                        >
                          {isMarkingRead ? "Marking..." : `Mark ${selectedNotifications.length} as read`}
                        </Button>
                      )}
                      {hasUnprocessedNotifications && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleMarkAsRead(notifications.filter(n => !n.Is_Processed).map(n => n.Notification_ID))}
                          disabled={isMarkingRead}
                          className="h-7 px-2 text-xs"
                        >
                          Mark all as read
                        </Button>
                      )}
                    </div>
                  </div>
                  
                  <ScrollArea className="h-80">
                    {notificationsLoading ? (
                      <div className="p-6 text-center">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto"></div>
                        <p className="text-sm text-muted-foreground mt-2">Loading notifications...</p>
                      </div>
                    ) : notificationsError ? (
                      <div className="p-6 text-center">
                        <p className="text-sm text-red-600">Failed to load notifications</p>
                        <Button size="sm" variant="outline" onClick={() => refetchNotifications()} className="mt-2">
                          Retry
                        </Button>
                      </div>
                    ) : notifications.length === 0 ? (
                      <div className="p-6 text-center">
                        <Bell className="h-12 w-12 text-muted-foreground/50 mx-auto mb-2" />
                        <p className="text-sm text-muted-foreground">No notifications yet</p>
                        <p className="text-xs text-muted-foreground mt-1">You'll see important updates here</p>
                      </div>
                    ) : (
                      <div className="p-1">
                        {notifications.map((notification) => (
                          <div 
                            key={notification.Notification_ID} 
                            className={cn(
                              "p-3 m-1 rounded-lg border transition-colors hover:bg-muted/50",
                              !notification.Is_Processed ? "bg-blue-50/50 border-blue-200" : "bg-white border-gray-200"
                            )}
                          >
                            <div className="flex items-start gap-3">
                              <div className="flex-shrink-0 mt-0.5">
                                {getNotificationIcon(notification)}
                              </div>
                              
                              <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between gap-2 mb-2">
                                  <div className="flex items-center gap-2">
                                    {getNotificationBadge(notification)}
                                    <span className="text-xs text-muted-foreground">
                                      {formatNotificationDate(notification.Sent_Date || notification.Created_At || '')}
                                    </span>
                                  </div>
                                  
                                  {!notification.Is_Processed && (
                                    <input
                                      type="checkbox"
                                      checked={selectedNotifications.includes(notification.Notification_ID)}
                                      onChange={(e) => {
                                        if (e.target.checked) {
                                          setSelectedNotifications(prev => [...prev, notification.Notification_ID])
                                        } else {
                                          setSelectedNotifications(prev => prev.filter(id => id !== notification.Notification_ID))
                                        }
                                      }}
                                      className="h-4 w-4 rounded border-gray-300"
                                    />
                                  )}
                                </div>

                                <p className="text-sm mb-2 leading-relaxed">{notification.Message}</p>

                                {/* Payment reminder specific info */}
                                {notification.type === "PaymentReminder" && (
                                  <div className="bg-red-50 p-2 rounded text-xs mb-2">
                                    <div className="flex items-center gap-2 text-red-800">
                                      <DollarSign className="h-3 w-3" />
                                      <span className="font-medium">{notification.Title}</span>
                                    </div>
                                    {notification.Amount && (
                                      <p className="mt-1 text-red-700">Amount: ${notification.Amount}</p>
                                    )}
                                    {notification.Due_Date && (
                                      <p className="text-red-700 flex items-center gap-1">
                                        <Calendar className="h-3 w-3" />
                                        Due: {new Date(notification.Due_Date).toLocaleDateString()}
                                      </p>
                                    )}
                                  </div>
                                )}

                                {/* Action buttons for unprocessed notifications */}
                                {!notification.Is_Processed && (
                                  <div className="flex gap-2 mt-3">
                                    {/* Birthday transition actions */}
                                    {isAgeTransitionNotification(notification) && (
                                      <>
                                        <Button
                                          size="sm"
                                          variant="outline"
                                          className="h-7 px-3 text-xs"
                                          onClick={() => handleNotificationAction(notification.Notification_ID, 'Student')}
                                          disabled={isProcessing}
                                        >
                                          Stay Student
                                        </Button>
                                        <Button
                                          size="sm"
                                          className="h-7 px-3 text-xs bg-primary text-white hover:bg-primary/90"
                                          onClick={() => handleNotificationAction(notification.Notification_ID, 'Young-Adult')}
                                          disabled={isProcessing}
                                        >
                                          {isProcessing ? "Processing..." : "Upgrade to Adult"}
                                        </Button>
                                      </>
                                    )}

                                    {/* Payment reminder actions */}
                                    {notification.type === "PaymentReminder" && (
                                      <Button
                                        size="sm"
                                        className="h-7 px-3 text-xs"
                                        onClick={() => handleNotificationAction(notification.Notification_ID)}
                                        disabled={isProcessing}
                                      >
                                        {isProcessing ? "Processing..." : "Mark as Paid"}
                                      </Button>
                                    )}

                                    {/* Generic dismiss action */}
                                    {!isAgeTransitionNotification(notification) && notification.type !== "PaymentReminder" && (
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        className="h-7 px-3 text-xs"
                                        onClick={() => handleNotificationAction(notification.Notification_ID)}
                                        disabled={isProcessing}
                                      >
                                        {isProcessing ? "Processing..." : "Dismiss"}
                                      </Button>
                                    )}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </ScrollArea>
                </DropdownMenuContent>
              </DropdownMenu>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-10 w-10 rounded-full hover:bg-gray-100">
                    <Avatar className="h-10 w-10 border-2 border-gray-300 flex bg-primary text-white  items-center justify-center">
                      <AvatarImage src={
                        user?.profilePicture ||
                        `https://ui-avatars.com/api/?name=${displayName}&background=random`
                      } />
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{displayName}</p>
                      <p className="text-xs leading-none text-muted-foreground capitalize">
                        {userType.replace("-", " ")}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <Settings className="mr-2 h-4 w-4" />
                    <Link href={'/young-adult/settings'} className="text-sm font-medium">
                      Settings
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleConfirmation}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>

        <Dialog open={openConfirmation} onOpenChange={setOpenConfirmation}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirm Logout</DialogTitle>
              <DialogDescription>
                Are you sure you want to log out?
              </DialogDescription>
            </DialogHeader>
            <div className="flex justify-end space-x-2">
              <Button
                onClick={() => {
                  handleLogout()
                  setOpenConfirmation(false)
                }}
              >
                Confirm
              </Button>
              <Button
                variant="outline" onClick={() => setOpenConfirmation(false)}>
                Cancel
              </Button>
            </div>
          </DialogContent>
        </Dialog>
        {/* Page Content */}
        <main className="p-6">{children}</main>
      </div>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}
    </div>
  )
}

function cn(...classes: string[]) {
  return classes.filter(Boolean).join(" ")
}