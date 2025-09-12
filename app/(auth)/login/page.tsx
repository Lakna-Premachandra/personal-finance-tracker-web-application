"use client"
import { toast } from "sonner"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Eye, EyeOff, Mail, Lock, ArrowRight, AlertCircle, PiggyBank } from "lucide-react"
import { useRouter } from "next/navigation"
import { useLoginUserMutation } from "@/services/controllers/authController"
import { useDispatch } from "react-redux"
import { loginSuccess } from "@/store/slices/authSlice"

interface ValidationErrors {
  email?: string
  password?: string
  general?: string
}

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false)
  const dispatch = useDispatch()
  const [errors, setErrors] = useState<ValidationErrors>({})
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  })

  const [loginUser, { isLoading }] = useLoginUserMutation()
  const router = useRouter()

  const validateEmail = (email: string): string | undefined => {
    if (!email) return "Email is required"
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) return "Please enter a valid email address"
    return undefined
  }

  const validatePassword = (password: string): string | undefined => {
    if (!password) return "Password is required"
    if (password.length < 8) return "Password must be at least 8 characters long"
    return undefined
  }

  const validateForm = (): boolean => {
    const newErrors: ValidationErrors = {}

    const emailError = validateEmail(formData.email)
    const passwordError = validatePassword(formData.password)

    if (emailError) newErrors.email = emailError
    if (passwordError) newErrors.password = passwordError

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrors({})

    if (!validateForm()) return

    try {
      const result = await loginUser({
        email: formData.email,
        password: formData.password,
      }).unwrap()
      dispatch(loginSuccess({
        token: result.token!,
        user: result.user
      }))

      // Handle successful login
      console.log("Login successful:", result)
      toast.success("Login Successful!", {
        description: "Welcome back! Redirecting to your dashboard...",
      })

      // Store user data/token if needed
      // localStorage.setItem('token', result.token) // if your API returns a token
      // localStorage.setItem('user', JSON.stringify(result.user)) // if your API returns user data

      // Redirect based on user type
      const userType = result.user?.type || result.user.type || result.success // Handle different possible response structures

      if (userType === 'Student') {
        router.push("/student/dashboard")
      } else if (userType === 'Young-Adult') {
        router.push("/young-adult/dashboard")
      } else {
        // Fallback redirect if user type is not recognized
        console.warn("Unknown user type:", userType)
        router.push("/dashboard")
      }

    } catch (error: any) {
      // Show error toast instead of setting general error
      let errorMessage = "An error occurred. Please try again later."


      console.error("Login error:", error)



      // Handle different types of errors
      if (error?.status === 401) {
        errorMessage = "Invalid email or password. Please try again."
      } else if (error?.status === 400) {
        errorMessage = "Please check your email and password."
      } else if (error?.data?.message) {
        errorMessage = error.data.message
      }
      toast.error("Login Failed", {
        description: errorMessage,
      })
    }
  }

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData({ ...formData, [field]: value })
    // Clear field-specific error when user starts typing
    if (errors[field]) {
      setErrors({ ...errors, [field]: undefined })
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 w-full">
      <Card className="w-full max-w-md shadow-xl border-0 bg-white/90 backdrop-blur-sm">
        <CardHeader className="space-y-1 text-center">
          <div className="flex h-9 w-9 items-center justify-center rounded-sm bg-primary shadow-lg">
            <PiggyBank className="h-5 w-5 text-white" />
          </div>
          <CardTitle className="text-3xl font-bold">Welcome Back</CardTitle>
          <CardDescription className="text-lg">Sign in to your FinanceTracker account</CardDescription>
        </CardHeader>

        <CardContent className="px-8 pb-8">

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium">
                Email
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-secondary-400" />
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  className={`pl-10 h-11 border-secondary-200 focus:border-primary focus:ring-primary ${errors.email ? "border-red-500 focus:border-red-500 focus:ring-red-500" : ""
                    }`}
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  disabled={isLoading}
                />
              </div>
              {errors.email && (
                <p className="text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.email}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-sm font-medium">
                  Password
                </Label>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-secondary-400" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  className={`pl-10 pr-10 h-11 border-secondary-200 focus:border-primary focus:ring-primary ${errors.password ? "border-red-500 focus:border-red-500 focus:ring-red-500" : ""
                    }`}
                  value={formData.password}
                  onChange={(e) => handleInputChange("password", e.target.value)}
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-secondary-400 hover:text-secondary-600"
                  disabled={isLoading}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.password && (
                <p className="text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.password}
                </p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full h-11 bg-primary hover:bg-primary-700 text-white disabled:opacity-50"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Signing in...
                </>
              ) : (
                <>
                  Sign In
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-secondary-600">
              Don't have an account?{" "}
              <Link href="/register" className="font-medium text-primary hover:text-primary-700">
                Create account
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}