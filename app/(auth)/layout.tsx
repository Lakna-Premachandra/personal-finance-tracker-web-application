import type React from "react"
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen">
      <div className="flex min-h-screen items-center justify-center p-4">{children}</div>
    </div>
  )
}
