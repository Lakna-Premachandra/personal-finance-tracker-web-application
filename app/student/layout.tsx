import type React from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import ProtectedRoute from "@/components/ProtectedRoute"

export default function StudentLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <ProtectedRoute allowedUserTypes={['Student']}>
    <DashboardLayout userType="student">{children}</DashboardLayout>
  </ProtectedRoute>
}
