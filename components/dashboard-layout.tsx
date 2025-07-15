"use client"

import type React from "react"

import { useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { SidebarNav } from "@/components/sidebar-nav"
import { Bell, Search, Menu, LogOut, User, Settings } from "lucide-react"
import { Input } from "@/components/ui/input"
import { logout } from "@/store/slices/authSlice"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "./ui/dialog"
import Link from "next/link"
import Router from "next/router"

// Add RootState type
interface RootState {
  auth: {
    token: string | null
    user: {
      id: number
      username: string
      email: string
      type: 'Young-Adult' | 'Student'
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
  const dispatch = useDispatch()
  const router = useRouter()

  // Get user data from Redux store
  const user = useSelector((state: RootState) => state.auth.user)

  // Use username from Redux store, fallback to prop, then to default
  const displayName = user?.username || userName || ''

  const handleLogout = () => {
    // Dispatch logout action to clear Redux state and localStorage
    dispatch(logout())

    // Redirect to login page
    router.push('/login') // or wherever your login page is
  }

  const handleConfirmation = () => {
    setOpenConfirmation(true)
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
        <div className="flex h-16 items-center gap-2 border-b px-6">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
            <span className="text-sm font-bold text-white">FT</span>
          </div>
          <div>
            <h1 className="text-lg font-semibold">FinanceTracker</h1>
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
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-5 w-5" />
                <span className="absolute -top-1 -right-1 h-4 w-4 bg-danger rounded-full text-xs text-white flex items-center justify-center">
                  3
                </span>
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-10 w-10 rounded-full hover:bg-gray-100">
                    <Avatar className="h-10 w-10 border-2 border-gray-300 flex bg-primary text-white  items-center justify-center">
                      <div>
                        {displayName && displayName.length > 0
                          ? displayName.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()
                          : "U"}
                      </div>

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