"use client"

import type React from "react"
import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Eye, EyeOff, Mail, Lock, Calendar, Phone, MapPin, ArrowRight, AlertCircle, CheckCircle, UserRound } from "lucide-react"
import { useRegisterUserMutation } from "@/services/controllers/authController"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface ValidationErrors {
  employmentStatus?: string
  guardianContactNo?: string
  username?: string
  email?: string
  dateOfBirth?: string
  password?: string
  confirmPassword?: string
  phoneNo?: string
  address?: string
  general?: string
}

const employmentStatusOptions = [
  "Full-time Employee",
  "Freelancer",
  "Part-time Employee",
  "Self-employed",
  "Unemployed",
]

export default function RegisterPage() {
  const [registerUser, { isLoading: registerLoading }] = useRegisterUserMutation()
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [errors, setErrors] = useState<ValidationErrors>({})
  const [formData, setFormData] = useState({
    employmentStatus: "",
    guardianContactNo: "",
    username: "",
    email: "",
    dateOfBirth: "",
    password: "",
    confirmPassword: "",
    phoneNo: "",
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

  const getUserType = (dateOfBirth: string): "Student" | "Young-Adult" | null => {
    const age = calculateAge(dateOfBirth)
    if (age >= 12 && age <= 17) return "Student"
    if (age >= 18 && age <= 25) return "Young-Adult"
    return null
  }

  const validateEmail = (email: string): string | undefined => {
    if (!email) return "Email is required"
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) return "Please enter a valid email address"
    return undefined
  }

  const validateUsername = (username: string): string | undefined => {
    if (!username) return "Username is required"
    if (username.length < 3) return "Username must be at least 3 characters long"
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

    const usernameError = validateUsername(formData.username)
    const emailError = validateEmail(formData.email)
    const dateOfBirthError = validateDateOfBirth(formData.dateOfBirth)
    const passwordError = validatePassword(formData.password)
    const confirmPasswordError = validateConfirmPassword(formData.confirmPassword, formData.password)
    const phoneError = validatePhone(formData.phoneNo)
    const guardianPhoneError = validatePhone(formData.guardianContactNo)

    if (usernameError) newErrors.username = usernameError
    if (emailError) newErrors.email = emailError
    if (dateOfBirthError) newErrors.dateOfBirth = dateOfBirthError
    if (passwordError) newErrors.password = passwordError
    if (confirmPasswordError) newErrors.confirmPassword = confirmPasswordError
    if (phoneError) newErrors.phoneNo = phoneError
    if (guardianPhoneError) newErrors.guardianContactNo = guardianPhoneError

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Clear previous errors
    setErrors({})

    // Validate form
    if (!validateForm()) return

    try {
      const userType = getUserType(formData.dateOfBirth)
      const age = calculateAge(formData.dateOfBirth)

      // Validate that userType is not null before sending
      if (!userType) {
        setErrors({ dateOfBirth: "Invalid age range. Must be between 12-25 years." })
        return
      }

      // Prepare payload for API
      const payload = {
        username: formData.username,
        email: formData.email,
        password: formData.password,
        confirmPassword: formData.confirmPassword,
        dateOfBirth: formData.dateOfBirth,
        age: age, // Add the calculated age
        phoneNo: formData.phoneNo || undefined,
        guardianContactNo: userType === "Student" ? formData.guardianContactNo || undefined : undefined,
        employmentStatus: userType === "Young-Adult" ? formData.employmentStatus || "Unemployed" : undefined,
        address: formData.address || undefined,
        type: userType, // This will be either "Student" or "Young-Adult"
      }

      console.log("Sending registration payload:", payload)

      // Make API call
      const response = await registerUser(payload).unwrap()

      // Handle success - you might want to redirect or show success message
      // For example:
      // router.push('/login?message=Registration successful')
      // or show a success toast

    } catch (error: any) {
      console.error("Registration failed:", error)

      // Handle different types of errors
      if (error?.data?.message) {
        setErrors({ general: error.data.message })
      } else if (error?.data?.errors) {
        // Handle validation errors from backend
        if (Array.isArray(error.data.errors)) {
          setErrors({ general: error.data.errors.join(", ") })
        } else {
          setErrors(error.data.errors)
        }
      } else if (error?.message) {
        setErrors({ general: error.message })
      } else {
        setErrors({ general: "Registration failed. Please try again later." })
      }
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
    <div className="min-h-screen flex items-center justify-center p-4">
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
            {/* Row 1: Username and Email */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="username" className="text-sm font-medium">
                  Username *
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-secondary-400" />
                  <Input
                    id="username"
                    type="text"
                    placeholder="Enter your username"
                    className={`pl-10 h-11 border-secondary-200 focus:border-primary focus:ring-primary ${errors.username ? "border-red-500 focus:border-red-500 focus:ring-red-500" : ""
                      }`}
                    value={formData.username}
                    onChange={(e) => handleInputChange("username", e.target.value)}
                    disabled={registerLoading}
                  />
                </div>
                {errors.username && (
                  <p className="text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {errors.username}
                  </p>
                )}
              </div>

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
                    className={`pl-10 h-11 border-secondary-200 focus:border-primary focus:ring-primary ${errors.email ? "border-red-500 focus:border-red-500 focus:ring-red-500" : ""
                      }`}
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    disabled={registerLoading}
                  />
                </div>
                {errors.email && (
                  <p className="text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {errors.email}
                  </p>
                )}
              </div>
            </div>

            {/* Row 2: Date of Birth and Address */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="dateOfBirth" className="text-sm font-medium">
                  Date of Birth *
                </Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-3 h-4 w-4 text-secondary-400" />
                  <Input
                    id="dateOfBirth"
                    type="date"
                    className={`pl-10 h-11 border-secondary-200 focus:border-primary focus:ring-primary ${errors.dateOfBirth ? "border-red-500 focus:border-red-500 focus:ring-red-500" : ""
                      }`}
                    value={formData.dateOfBirth}
                    onChange={(e) => handleInputChange("dateOfBirth", e.target.value)}
                    disabled={registerLoading}
                  />
                </div>
                {formData.dateOfBirth && !errors.dateOfBirth && (
                  <p className="text-xs text-green-600 flex items-center gap-1">
                    <CheckCircle className="h-3 w-3" />
                    Age: {calculateAge(formData.dateOfBirth)} years (
                    {getUserType(formData.dateOfBirth) === "Student"
                      ? "Student"
                      : getUserType(formData.dateOfBirth) === "Young-Adult"
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
                    disabled={registerLoading}
                  />
                </div>
              </div>
            </div>

            {/* Row 3: Password and Confirm Password */}
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
                    className={`pl-10 pr-10 h-11 border-secondary-200 focus:border-primary focus:ring-primary ${errors.password ? "border-red-500 focus:border-red-500 focus:ring-red-500" : ""
                      }`}
                    value={formData.password}
                    onChange={(e) => handleInputChange("password", e.target.value)}
                    disabled={registerLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-secondary-400 hover:text-secondary-600"
                    disabled={registerLoading}
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
                          className={`h-1 flex-1 rounded ${passwordStrength >= level
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
                    className={`pl-10 pr-10 h-11 border-secondary-200 focus:border-primary focus:ring-primary ${errors.confirmPassword ? "border-red-500 focus:border-red-500 focus:ring-red-500" : ""
                      }`}
                    value={formData.confirmPassword}
                    onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                    disabled={registerLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-3 text-secondary-400 hover:text-secondary-600"
                    disabled={registerLoading}
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

            {/* Row 4: Phone and Guardian Phone */}
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
                    className={`pl-10 h-11 border-secondary-200 focus:border-primary focus:ring-primary ${errors.phoneNo ? "border-red-500 focus:border-red-500 focus:ring-red-500" : ""
                      }`}
                    value={formData.phoneNo}
                    onChange={(e) => handleInputChange("phoneNo", e.target.value)}
                    disabled={registerLoading}
                  />
                </div>
                {errors.phoneNo && (
                  <p className="text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {errors.phoneNo}
                  </p>
                )}
              </div>

              {getUserType(formData.dateOfBirth) === "Student" ? (
                <div className="space-y-2">
                  <Label htmlFor="guardianPhone" className="text-sm font-medium">
                    Guardian Number (Optional)
                  </Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3 h-4 w-4 text-secondary-400" />
                    <Input
                      id="guardianPhone"
                      type="tel"
                      placeholder="Enter your guardian's phone number"
                      className={`pl-10 h-11 border-secondary-200 focus:border-primary focus:ring-primary ${errors.guardianContactNo ? "border-red-500 focus:border-red-500 focus:ring-red-500" : ""
                        }`}
                      value={formData.guardianContactNo}
                      onChange={(e) => handleInputChange("guardianContactNo", e.target.value)}
                      disabled={registerLoading}
                    />
                  </div>
                  {errors.guardianContactNo && (
                    <p className="text-sm text-red-600 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {errors.guardianContactNo}
                    </p>
                  )}
                </div>
              ) : (

                <div className="space-y-2">
                  <Label htmlFor="employmentStatus" className="text-sm font-medium">
                    Employment status (Optional)
                  </Label>
                  <div className="relative">
                    <UserRound className="absolute left-3 top-3 h-4 w-4 text-secondary-400 z-10 top-[10px]" />
                    <Select
                      value={formData.employmentStatus}
                      onValueChange={(value) => handleInputChange("employmentStatus", value)}
                      disabled={registerLoading}
                    >
                      <SelectTrigger

                        id="employmentStatus"
                        className={`pl-10 h-11 border-secondary-200 focus:border-primary focus:ring-primary ${errors.employmentStatus ? "border-red-500 focus:border-red-500 focus:ring-red-500" : ""
                          }`}
                      >
                        <SelectValue placeholder="Unemployed" />
                      </SelectTrigger>
                      <SelectContent>
                        {employmentStatusOptions.map((status) => (
                          <SelectItem key={status} value={status}>
                            {status}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  {errors.employmentStatus && (
                    <p className="text-sm text-red-600 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {errors.employmentStatus}
                    </p>
                  )}
                </div>

              )}




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
                disabled={registerLoading}
              >
                {registerLoading ? (
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