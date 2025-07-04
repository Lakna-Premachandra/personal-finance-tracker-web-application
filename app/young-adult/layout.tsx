import type React from "react"
import { DashboardLayout } from "@/components/dashboard-layout"

export default function YoungAdultLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <DashboardLayout userType="young-adult">{children}</DashboardLayout>
}
