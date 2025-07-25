import { redirect } from "next/navigation"


import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import {
  PiggyBank,
  Target,
  Bell,
  BarChart3,
  Shield,
  Users,
  BookOpen,
  Wallet,
  ArrowRight,
  CheckCircle,
} from "lucide-react"

export default function HomePage() {

  return (
    <div className="min-h-screen bg-gradient-to-br from-secondary-50 to-primary-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-secondary-200 sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary shadow-lg">
                <PiggyBank className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-secondary-900">Budget Mate</h1>
                <p className="text-xs text-secondary-600">Smart Money Management</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Link href="/login">
                <Button variant="ghost" className="text-secondary-700 hover:text-primary">
                  Sign In
                </Button>
              </Link>
              <Link href="/register">
                <Button className="bg-primary hover:bg-primary-700 text-white shadow-lg">Get Started</Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-6">
        <div className="container mx-auto text-center">
          <Badge className="mb-6 bg-primary-100 text-primary-700 border-primary-200">
             Now Available for Students & Young Adults
          </Badge>
          <h1 className="text-5xl md:text-6xl font-bold text-secondary-900 mb-6 leading-tight">
            Master Your Money,
            <span className="text-primary block">Shape Your Future</span>
          </h1>
          <p className="text-xl text-secondary-600 mb-8 max-w-3xl mx-auto leading-relaxed">
            Take control of your finances with our comprehensive tracking platform designed specifically for students
            and young adults. Build healthy money habits that last a lifetime.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link href="/register">
              <Button size="lg" className="bg-primary hover:bg-primary-700 text-white shadow-xl px-8 py-4 text-lg">
                Start Your Journey
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/login">
              <Button
                size="lg"
                variant="outline"
                className="border-2 border-secondary-300 hover:bg-secondary-50 px-8 py-4 text-lg bg-transparent"
              >
                Sign In
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 px-6 bg-white">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-secondary-900 mb-4">Everything You Need to Succeed</h2>
            <p className="text-xl text-secondary-600 max-w-2xl mx-auto">
              Powerful tools designed to help you track, budget, and grow your money with confidence.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="card-professional card-hover border-0 shadow-lg">
              <CardHeader className="pb-4">
                <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center mb-4">
                  <BarChart3 className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="text-xl text-secondary-900">Smart Analytics</CardTitle>
                <CardDescription className="text-secondary-600">
                  Visualize your spending patterns with interactive charts and detailed insights.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="card-professional card-hover border-0 shadow-lg">
              <CardHeader className="pb-4">
                <div className="w-12 h-12 bg-success-100 rounded-xl flex items-center justify-center mb-4">
                  <Target className="h-6 w-6 text-success" />
                </div>
                <CardTitle className="text-xl text-secondary-900">Goal Tracking</CardTitle>
                <CardDescription className="text-secondary-600">
                  Set and achieve financial goals with our intuitive progress tracking system.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="card-professional card-hover border-0 shadow-lg">
              <CardHeader className="pb-4">
                <div className="w-12 h-12 bg-warning-100 rounded-xl flex items-center justify-center mb-4">
                  <Wallet className="h-6 w-6 text-warning" />
                </div>
                <CardTitle className="text-xl text-secondary-900">Budget Management</CardTitle>
                <CardDescription className="text-secondary-600">
                  Create and manage budgets that adapt to your lifestyle and spending habits.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="card-professional card-hover border-0 shadow-lg">
              <CardHeader className="pb-4">
                <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center mb-4">
                  <PiggyBank className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="text-xl text-secondary-900">Money Jar System</CardTitle>
                <CardDescription className="text-secondary-600">
                  Visual savings tracking that makes saving money fun and engaging.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="card-professional card-hover border-0 shadow-lg">
              <CardHeader className="pb-4">
                <div className="w-12 h-12 bg-danger-100 rounded-xl flex items-center justify-center mb-4">
                  <Bell className="h-6 w-6 text-danger" />
                </div>
                <CardTitle className="text-xl text-secondary-900">Smart Reminders</CardTitle>
                <CardDescription className="text-secondary-600">
                  Never miss a payment with intelligent notifications and reminders.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="card-professional card-hover border-0 shadow-lg">
              <CardHeader className="pb-4">
                <div className="w-12 h-12 bg-success-100 rounded-xl flex items-center justify-center mb-4">
                  <Shield className="h-6 w-6 text-success" />
                </div>
                <CardTitle className="text-xl text-secondary-900">Secure & Private</CardTitle>
                <CardDescription className="text-secondary-600">
                  Your financial data is protected with bank-level security and encryption.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* User Types Section */}
      <section className="py-20 px-6 bg-secondary-50">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-secondary-900 mb-4">Designed for Your Journey</h2>
            <p className="text-xl text-secondary-600 max-w-2xl mx-auto">
              Whether you're a student or young adult, we have features tailored to your unique financial needs.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12">
            {/* Student Mode */}
            <Card className="card-professional border-0 shadow-xl overflow-hidden">
              <div className="bg-gradient-to-r from-primary to-primary-600 p-6 text-white">
                <div className="flex items-center gap-3 mb-4">
                  <BookOpen className="h-8 w-8" />
                  <h3 className="text-2xl font-bold">Student Mode</h3>
                </div>
                <p className="text-primary-100">Perfect for managing student life finances</p>
              </div>
              <CardContent className="p-6">
                <ul className="space-y-4">
                  <li className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-success mt-0.5 flex-shrink-0" />
                    <span className="text-secondary-700">Simple expense tracking for daily spending</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-success mt-0.5 flex-shrink-0" />
                    <span className="text-secondary-700">Textbook and education budget categories</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-success mt-0.5 flex-shrink-0" />
                    <span className="text-secondary-700">Money jar for saving goals</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-success mt-0.5 flex-shrink-0" />
                    <span className="text-secondary-700">Gamified leaderboard system</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-success mt-0.5 flex-shrink-0" />
                    <span className="text-secondary-700">Basic financial education resources</span>
                  </li>
                </ul>
                <Link href="/register" className="block mt-6">
                  <Button className="w-full bg-primary hover:bg-primary-700">Start as Student</Button>
                </Link>
              </CardContent>
            </Card>

            {/* Young Adult Mode */}
            <Card className="card-professional border-0 shadow-xl overflow-hidden">
              <div className="bg-gradient-to-r from-success to-success-600 p-6 text-white">
                <div className="flex items-center gap-3 mb-4">
                  <Users className="h-8 w-8" />
                  <h3 className="text-2xl font-bold">Young Adult Mode</h3>
                </div>
                <p className="text-success-100">Advanced tools for independent financial management</p>
              </div>
              <CardContent className="p-6">
                <ul className="space-y-4">
                  <li className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-success mt-0.5 flex-shrink-0" />
                    <span className="text-secondary-700">Comprehensive budget management</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-success mt-0.5 flex-shrink-0" />
                    <span className="text-secondary-700">Advanced analytics and reporting</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-success mt-0.5 flex-shrink-0" />
                    <span className="text-secondary-700">Investment and savings goal tracking</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-success mt-0.5 flex-shrink-0" />
                    <span className="text-secondary-700">Bill reminders and payment scheduling</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-success mt-0.5 flex-shrink-0" />
                    <span className="text-secondary-700">Professional financial insights</span>
                  </li>
                </ul>
                <Link href="/register" className="block mt-6">
                  <Button className="w-full bg-success hover:bg-success-700">Start as Young Adult</Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 px-6 bg-white">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-4 gap-8 text-center">
            <div className="space-y-2">
              <div className="text-4xl font-bold text-primary">10K+</div>
              <div className="text-secondary-600">Active Users</div>
            </div>
            <div className="space-y-2">
              <div className="text-4xl font-bold text-success">$2M+</div>
              <div className="text-secondary-600">Money Tracked</div>
            </div>
            <div className="space-y-2">
              <div className="text-4xl font-bold text-warning">95%</div>
              <div className="text-secondary-600">Goal Achievement</div>
            </div>
            <div className="space-y-2">
              <div className="text-4xl font-bold text-danger">4.9★</div>
              <div className="text-secondary-600">User Rating</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 bg-gradient-to-r from-primary to-primary-700">
        <div className="container mx-auto text-center">
          <h2 className="text-4xl font-bold text-white mb-6">Ready to Transform Your Financial Future?</h2>
          <p className="text-xl text-primary-100 mb-8 max-w-2xl mx-auto">
            Join thousands of students and young adults who are already building better financial habits.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register">
              <Button size="lg" className="bg-white text-primary hover:bg-secondary-50 shadow-xl px-8 py-4 text-lg">
                Get Started Free
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/login">
              <Button
                size="lg"
                variant="outline"
                className="border-2 border-white text-white hover:bg-white hover:text-primary px-8 py-4 text-lg bg-transparent"
              >
                Sign In
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-secondary-900 text-white py-12 px-6">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                  <PiggyBank className="h-5 w-5 text-white" />
                </div>
                <span className="text-lg font-bold">FinanceTracker</span>
              </div>
              <p className="text-secondary-400">
                Empowering the next generation with smart financial tools and education.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-secondary-400">
                <li>
                  <Link href="#" className="hover:text-white transition-colors">
                    Features
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white transition-colors">
                    Pricing
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white transition-colors">
                    Security
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-secondary-400">
                <li>
                  <Link href="#" className="hover:text-white transition-colors">
                    Help Center
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white transition-colors">
                    Contact Us
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white transition-colors">
                    Community
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-secondary-400">
                <li>
                  <Link href="#" className="hover:text-white transition-colors">
                    About
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white transition-colors">
                    Blog
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white transition-colors">
                    Careers
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-secondary-800 mt-8 pt-8 text-center text-secondary-400">
            <p>&copy; 2024 FinanceTracker. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
