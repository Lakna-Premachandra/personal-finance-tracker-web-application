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
import { useGetCronStatusQuery, useLazyTriggerManualCheckQuery, useStartCronServiceMutation } from "@/services/controllers/cronController"
import { useGetUserNotificationsQuery, useProcessNotificationMutation } from "@/services/controllers/notificationController"
import { logout } from "@/store/slices/authSlice"
import { Bell, LogOut, Menu, PiggyBank, Settings } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "./ui/dialog"

// Add RootState type
interface RootState {
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
  const dispatch = useDispatch()
  const router = useRouter()

  // Get user data from Redux store
  const user = useSelector((state: RootState) => state.auth.user)

  // Get notifications for the current user with auto-refresh
  const { data: notificationData, isLoading: notificationsLoading, refetch: refetchNotifications } = useGetUserNotificationsQuery(
    user?.id || 0,
    { 
      skip: !user?.id,
      pollingInterval: 30000, // Poll every 30 seconds
      refetchOnFocus: true, // Refetch when window gains focus
      refetchOnReconnect: true // Refetch when network reconnects
    }
  )
  const [processNotification] = useProcessNotificationMutation()

  const notifications = notificationData?.notifications || []
  const unprocessedCount = notifications.filter(n => !n.Is_Processed).length

  // Use username from Redux store, fallback to prop, then to default
  const displayName = user?.username || userName || ''
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
    }, 30000) // 30 seconds

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

  // Trigger manual check
  const handleLogout = () => {
    // Dispatch logout action to clear Redux state and localStorage
    dispatch(logout())

    // Redirect to login page
    router.push('/login') // or wherever your login page is
  }

  const handleConfirmation = () => {
    setOpenConfirmation(true)
  }

  const handleNotificationAction = async (notificationId: number, userTypeChoice: string) => {
    if (!user?.id) return

    try {
      await processNotification({
        userId: user.id,
        notificationId,
        userTypeChoice
      }).unwrap()
      // Refetch notifications after processing
      await refetchNotifications()
      // Optionally show success message
      setNotificationsOpen(false)
    } catch (error) {
      console.error('Failed to process notification:', error)
    }
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
          {/* <img src="../public/184ed18a-1e6e-46af-8534-c192e71173cb.png" alt="" /> */}
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
                      <span className="absolute -top-1 -right-1 h-4 w-4 bg-danger rounded-full text-xs text-white flex items-center justify-center">
                        {unprocessedCount}
                      </span>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-80" align="end">
                  <DropdownMenuLabel>Notifications</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <ScrollArea className="h-64">
                    {notificationsLoading ? (
                      <div className="p-4 text-center text-sm text-muted-foreground">Loading...</div>
                    ) : notifications.length === 0 ? (
                      <div className="p-4 text-center text-sm text-muted-foreground">No notifications</div>
                    ) : (
                      notifications.map((notification) => (
                        <div key={notification.Notification_ID} className="p-3 border-b last:border-b-0">
                          <div className="flex justify-between items-start gap-2">
                            <div className="flex-1">
                              <p className="text-sm">{notification.Message}</p>
                              <p className="text-xs text-muted-foreground mt-1">
                                {new Date(notification.Sent_Date).toLocaleDateString()}
                              </p>
                            </div>
                            {!notification.Is_Processed && notification.Message.includes('turned 18') && (
                              <div className="flex gap-1">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="h-6 px-2 text-xs"
                                  onClick={() => handleNotificationAction(notification.Notification_ID, 'Student')}
                                >
                                  Stay Student
                                </Button>
                                <Button
                                  size="sm"
                                  className="h-6 px-2 text-xs"
                                  onClick={() => handleNotificationAction(notification.Notification_ID, 'Young-Adult')}
                                >
                                  Upgrade
                                </Button>
                              </div>
                            )}
                          </div>
                        </div>
                      ))
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
                  <DropdownMenuItem >
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