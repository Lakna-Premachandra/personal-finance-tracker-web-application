"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { LayoutDashboard, ArrowUpDown, PiggyBank, Target, Settings, Trophy, Coins, Bell } from "lucide-react"

interface SidebarNavProps {
  userType: "student" | "young-adult"
}

export function SidebarNav({ userType }: SidebarNavProps) {
  const pathname = usePathname()

  const commonItems = [
    {
      title: "Dashboard",
      href: `/${userType}/dashboard`,
      icon: LayoutDashboard,
    },
    {
      title: "Transactions",
      href: `/${userType}/transactions`,
      icon: ArrowUpDown,
    },
    {
      title: "Budget",
      href: `/${userType}/budget`,
      icon: PiggyBank,
    },
    {
      title: "Goals",
      href: `/${userType}/goals`,
      icon: Target,
    },
    {
      title: "Payment Reminders",
      href: `/${userType}/payment-reminders`,
      icon: Bell,
    },
    {
      title: userType === "student" ? "Leaderboard" : "",
      href: `/${userType}/leaderboard`,
    icon: userType === "student" ? Trophy : null,
    },
    {
      title: "Settings",
      href: `/${userType}/settings`,
      icon: Settings,
    },
  ]

  const studentItems = [
    ...commonItems.slice(0, 4), // Insert Money Jar after Goals
    {
      title: "Money Jar",
      href: `/${userType}/money-jar`,
      icon: Coins,
    },
    ...commonItems.slice(4), // Add remaining items
  ]

  const items = userType === "student" ? studentItems : commonItems

  return (
  <nav className="space-y-1">
  {items
    .filter((item) => item.title && item.icon) // filter only valid items
    .map((item) => (
      <Link
        key={item.href}
        href={item.href}
        className={cn(
          "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-secondary-100 hover:text-secondary-900",
          pathname === item.href
            ? "bg-primary-50 text-primary-700 border-r-2 border-primary-700"
            : "text-secondary-600",
        )}
      >
        <item.icon className="h-4 w-4" />
        {item.title}
      </Link>
    ))}
</nav>

  )
}
