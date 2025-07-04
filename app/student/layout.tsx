import type React from "react"
import { DashboardLayout } from "@/components/dashboard-layout"

export default function StudentLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <DashboardLayout userType="student">{children}</DashboardLayout>
}
