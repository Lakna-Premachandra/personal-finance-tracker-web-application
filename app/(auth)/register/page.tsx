"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Eye, EyeOff, Mail, Lock, Calendar, Phone, MapPin, ArrowRight, AlertCircle, CheckCircle } from "lucide-react"

interface ValidationErrors {
  email?: string
  dateOfBirth?: string
  password?: string
  confirmPassword?: string
  phone?: string
  address?: string
  general?: string
}

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<ValidationErrors>({})
  const [formData, setFormData] = useState({
    email: "",
    dateOfBirth: "",
    password: "",
    confirmPassword: "",
    phone: "",
    address: "",
  })

  const calculateAge = (dateOfBirth: string) => {
    const today = new Date()
    const birthDate = new Date(dateOfBirth)
    let age = today.getFullYear() - birthDate.getFullYear()
    const monthDiff = today.getMonth() - birthDate.getMonth()
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--
    }
    return age
  }

  const getUserType = (dateOfBirth: string) => {
    const age = calculateAge(dateOfBirth)
    if (age >= 12 && age <= 17) return "student"
    if (age >= 18 && age <= 25) return "young-adult"
    return null
  }

  const validateEmail = (email: string): string | undefined => {
    if (!email) return "Email is required"
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) return "Please enter a valid email address"
    return undefined
  }

  const validateDateOfBirth = (dateOfBirth: string): string | undefined => {
    if (!dateOfBirth) return "Date of birth is required"
    const age = calculateAge(dateOfBirth)
    if (age < 12) return "You must be at least 12 years old to register"
    if (age > 25) return "This app is designed for users aged 12-25 years"
    return undefined
  }

  const validatePassword = (password: string): string | undefined => {
    if (!password) return "Password is required"
    if (password.length < 8) return "Password must be at least 8 characters long"
    if (!/(?=.*[a-z])/.test(password)) return "Password must contain at least one lowercase letter"
    if (!/(?=.*[A-Z])/.test(password)) return "Password must contain at least one uppercase letter"
    if (!/(?=.*\d)/.test(password)) return "Password must contain at least one number"
    return undefined
  }

  const validateConfirmPassword = (confirmPassword: string, password: string): string | undefined => {
    if (!confirmPassword) return "Please confirm your password"
    if (confirmPassword !== password) return "Passwords do not match"
    return undefined
  }

  const validatePhone = (phone: string): string | undefined => {
    if (phone && !/^\+?[\d\s\-()]{10,}$/.test(phone)) {
      return "Please enter a valid phone number"
    }
    return undefined
  }

  const validateForm = (): boolean => {
    const newErrors: ValidationErrors = {}

    const emailError = validateEmail(formData.email)
    const dateOfBirthError = validateDateOfBirth(formData.dateOfBirth)
    const passwordError = validatePassword(formData.password)
    const confirmPasswordError = validateConfirmPassword(formData.confirmPassword, formData.password)
    const phoneError = validatePhone(formData.phone)

    if (emailError) newErrors.email = emailError
    if (dateOfBirthError) newErrors.dateOfBirth = dateOfBirthError
    if (passwordError) newErrors.password = passwordError
    if (confirmPasswordError) newErrors.confirmPassword = confirmPasswordError
    if (phoneError) newErrors.phone = phoneError

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrors({})

    if (!validateForm()) return

    setIsLoading(true)

    try {
      const userType = getUserType(formData.dateOfBirth)

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000))

      console.log("Register:", { ...formData, userType })
      // Registration success - redirect would happen here
    } catch (error) {
      setErrors({ general: "Registration failed. Please try again later." })
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData({ ...formData, [field]: value })
    // Clear field-specific error when user starts typing
    if (errors[field]) {
      setErrors({ ...errors, [field]: undefined })
    }
  }

  const getPasswordStrength = (password: string) => {
    let strength = 0
    if (password.length >= 8) strength++
    if (/(?=.*[a-z])/.test(password)) strength++
    if (/(?=.*[A-Z])/.test(password)) strength++
    if (/(?=.*\d)/.test(password)) strength++
    if (/(?=.*[!@#$%^&*])/.test(password)) strength++
    return strength
  }

  const passwordStrength = getPasswordStrength(formData.password)

  return (
    <div className="min-h-screen flex items-center justify-center p-4 ">
      <Card className="w-full max-w-4xl shadow-xl border-0 bg-white/90 backdrop-blur-sm">
        <CardHeader className="text-center pb-6">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary">
            <span className="text-2xl font-bold text-white">FT</span>
          </div>
          <CardTitle className="text-3xl font-bold">Create Account</CardTitle>
          <CardDescription className="text-lg">Join FinanceTracker and start managing your money</CardDescription>
        </CardHeader>

        <CardContent className="px-8 pb-8">
          {errors.general && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3 text-red-700">
              <AlertCircle className="h-5 w-5 flex-shrink-0" />
              <span>{errors.general}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Row 1: Email and Date of Birth */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium">
                  Email *
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-secondary-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    className={`pl-10 h-11 border-secondary-200 focus:border-primary focus:ring-primary ${
                      errors.email ? "border-red-500 focus:border-red-500 focus:ring-red-500" : ""
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
                <Label htmlFor="dateOfBirth" className="text-sm font-medium">
                  Date of Birth *
                </Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-3 h-4 w-4 text-secondary-400" />
                  <Input
                    id="dateOfBirth"
                    type="date"
                    className={`pl-10 h-11 border-secondary-200 focus:border-primary focus:ring-primary ${
                      errors.dateOfBirth ? "border-red-500 focus:border-red-500 focus:ring-red-500" : ""
                    }`}
                    value={formData.dateOfBirth}
                    onChange={(e) => handleInputChange("dateOfBirth", e.target.value)}
                    disabled={isLoading}
                  />
                </div>
                {formData.dateOfBirth && !errors.dateOfBirth && (
                  <p className="text-xs text-green-600 flex items-center gap-1">
                    <CheckCircle className="h-3 w-3" />
                    Age: {calculateAge(formData.dateOfBirth)} years (
                    {getUserType(formData.dateOfBirth) === "student"
                      ? "Student"
                      : getUserType(formData.dateOfBirth) === "young-adult"
                        ? "Young Adult"
                        : "Invalid Age"}
                    )
                  </p>
                )}
                {errors.dateOfBirth && (
                  <p className="text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {errors.dateOfBirth}
                  </p>
                )}
              </div>
            </div>

            {/* Row 2: Password and Confirm Password */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium">
                  Password *
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-secondary-400" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Create a password"
                    className={`pl-10 pr-10 h-11 border-secondary-200 focus:border-primary focus:ring-primary ${
                      errors.password ? "border-red-500 focus:border-red-500 focus:ring-red-500" : ""
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
                {formData.password && (
                  <div className="space-y-2">
                    <div className="flex gap-1">
                      {[1, 2, 3, 4].map((level) => (
                        <div
                          key={level}
                          className={`h-1 flex-1 rounded ${
                            passwordStrength >= level
                              ? passwordStrength <= 2
                                ? "bg-red-500"
                                : passwordStrength === 3
                                  ? "bg-yellow-500"
                                  : "bg-green-500"
                              : "bg-gray-200"
                          }`}
                        />
                      ))}
                    </div>
                    <p className="text-xs text-secondary-600">
                      Strength: {passwordStrength <= 2 ? "Weak" : passwordStrength === 3 ? "Medium" : "Strong"}
                    </p>
                  </div>
                )}
                {errors.password && (
                  <p className="text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {errors.password}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-sm font-medium">
                  Confirm Password *
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-secondary-400" />
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm your password"
                    className={`pl-10 pr-10 h-11 border-secondary-200 focus:border-primary focus:ring-primary ${
                      errors.confirmPassword ? "border-red-500 focus:border-red-500 focus:ring-red-500" : ""
                    }`}
                    value={formData.confirmPassword}
                    onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-3 text-secondary-400 hover:text-secondary-600"
                    disabled={isLoading}
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {formData.confirmPassword && formData.confirmPassword === formData.password && (
                  <p className="text-sm text-green-600 flex items-center gap-1">
                    <CheckCircle className="h-3 w-3" />
                    Passwords match
                  </p>
                )}
                {errors.confirmPassword && (
                  <p className="text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {errors.confirmPassword}
                  </p>
                )}
              </div>
            </div>

            {/* Row 3: Phone and Address */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="phone" className="text-sm font-medium">
                  Phone Number (Optional)
                </Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3 h-4 w-4 text-secondary-400" />
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="Enter your phone number"
                    className={`pl-10 h-11 border-secondary-200 focus:border-primary focus:ring-primary ${
                      errors.phone ? "border-red-500 focus:border-red-500 focus:ring-red-500" : ""
                    }`}
                    value={formData.phone}
                    onChange={(e) => handleInputChange("phone", e.target.value)}
                    disabled={isLoading}
                  />
                </div>
                {errors.phone && (
                  <p className="text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {errors.phone}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="address" className="text-sm font-medium">
                  Address (Optional)
                </Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 h-4 w-4 text-secondary-400" />
                  <Input
                    id="address"
                    type="text"
                    placeholder="Enter your address"
                    className="pl-10 h-11 border-secondary-200 focus:border-primary focus:ring-primary"
                    value={formData.address}
                    onChange={(e) => handleInputChange("address", e.target.value)}
                    disabled={isLoading}
                  />
                </div>
              </div>
            </div>

            {/* Password Requirements */}
            {formData.password && (
              <div className="bg-slate-50 p-4 rounded-lg">
                <p className="text-sm font-medium text-secondary-700 mb-2">Password Requirements:</p>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div
                    className={`flex items-center gap-2 ${formData.password.length >= 8 ? "text-green-600" : "text-secondary-500"}`}
                  >
                    {formData.password.length >= 8 ? (
                      <CheckCircle className="h-3 w-3" />
                    ) : (
                      <div className="w-3 h-3 rounded-full border border-secondary-300" />
                    )}
                    At least 8 characters
                  </div>
                  <div
                    className={`flex items-center gap-2 ${/(?=.*[a-z])/.test(formData.password) ? "text-green-600" : "text-secondary-500"}`}
                  >
                    {/(?=.*[a-z])/.test(formData.password) ? (
                      <CheckCircle className="h-3 w-3" />
                    ) : (
                      <div className="w-3 h-3 rounded-full border border-secondary-300" />
                    )}
                    One lowercase letter
                  </div>
                  <div
                    className={`flex items-center gap-2 ${/(?=.*[A-Z])/.test(formData.password) ? "text-green-600" : "text-secondary-500"}`}
                  >
                    {/(?=.*[A-Z])/.test(formData.password) ? (
                      <CheckCircle className="h-3 w-3" />
                    ) : (
                      <div className="w-3 h-3 rounded-full border border-secondary-300" />
                    )}
                    One uppercase letter
                  </div>
                  <div
                    className={`flex items-center gap-2 ${/(?=.*\d)/.test(formData.password) ? "text-green-600" : "text-secondary-500"}`}
                  >
                    {/(?=.*\d)/.test(formData.password) ? (
                      <CheckCircle className="h-3 w-3" />
                    ) : (
                      <div className="w-3 h-3 rounded-full border border-secondary-300" />
                    )}
                    One number
                  </div>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between pt-4">
              <p className="text-sm text-secondary-600">
                Already have an account?{" "}
                <Link href="/login" className="font-medium text-primary hover:text-primary-700">
                  Sign in
                </Link>
              </p>

              <Button
                type="submit"
                className="w-full sm:w-auto px-8 h-11 bg-primary hover:bg-primary-700 text-white disabled:opacity-50"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Creating Account...
                  </>
                ) : (
                  <>
                    Create Account
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
