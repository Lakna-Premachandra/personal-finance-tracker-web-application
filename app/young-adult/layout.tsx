import type React from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import ProtectedRoute from "@/components/ProtectedRoute"

export default function YoungAdultLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <ProtectedRoute allowedUserTypes={['Young-Adult']}>
    <DashboardLayout userType="young-adult">{children}</DashboardLayout>
  </ProtectedRoute>
}
