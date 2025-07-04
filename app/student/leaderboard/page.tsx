"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Trophy, Medal, Award, TrendingUp, Target, Coins, Star, Crown } from "lucide-react"

export default function LeaderboardPage() {
  const leaderboardData = [
    {
      id: 1,
      rank: 1,
      name: "Emma Wilson",
      avatar: "/placeholder.svg?height=40&width=40",
      points: 2450,
      level: "Savings Master",
      badges: ["Goal Crusher", "Streak King", "Money Saver"],
      savingsGoals: 8,
      completedGoals: 5,
      streak: 45,
      totalSaved: 1250,
    },
    {
      id: 2,
      rank: 2,
      name: "Alex Johnson",
      avatar: "/placeholder.svg?height=40&width=40",
      points: 2180,
      level: "Budget Pro",
      badges: ["Consistent Saver", "Goal Achiever"],
      savingsGoals: 6,
      completedGoals: 4,
      streak: 32,
      totalSaved: 980,
      isCurrentUser: true,
    },
    {
      id: 3,
      rank: 3,
      name: "Sarah Davis",
      avatar: "/placeholder.svg?height=40&width=40",
      points: 1950,
      level: "Smart Spender",
      badges: ["Budget Master", "Tracker"],
      savingsGoals: 5,
      completedGoals: 3,
      streak: 28,
      totalSaved: 750,
    },
    {
      id: 4,
      rank: 4,
      name: "Mike Chen",
      avatar: "/placeholder.svg?height=40&width=40",
      points: 1720,
      level: "Money Learner",
      badges: ["First Goal", "Beginner"],
      savingsGoals: 4,
      completedGoals: 2,
      streak: 15,
      totalSaved: 520,
    },
    {
      id: 5,
      rank: 5,
      name: "Lisa Rodriguez",
      avatar: "/placeholder.svg?height=40&width=40",
      points: 1580,
      level: "Saver",
      badges: ["Consistent", "Tracker"],
      savingsGoals: 3,
      completedGoals: 2,
      streak: 22,
      totalSaved: 680,
    },
  ]

  const achievements = [
    {
      title: "First Goal Completed",
      description: "Complete your first savings goal",
      icon: Target,
      earned: true,
      points: 100,
    },
    {
      title: "Streak Master",
      description: "Save money for 30 consecutive days",
      icon: Star,
      earned: true,
      points: 200,
    },
    {
      title: "Budget Boss",
      description: "Stay within budget for 3 months",
      icon: Crown,
      earned: false,
      points: 300,
    },
    {
      title: "Goal Crusher",
      description: "Complete 5 savings goals",
      icon: Trophy,
      earned: false,
      points: 500,
    },
  ]

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="h-5 w-5 text-yellow-500" />
      case 2:
        return <Medal className="h-5 w-5 text-gray-400" />
      case 3:
        return <Award className="h-5 w-5 text-amber-600" />
      default:
        return <span className="text-sm font-bold text-muted-foreground">#{rank}</span>
    }
  }

  const getRankColor = (rank: number) => {
    switch (rank) {
      case 1:
        return "bg-gradient-to-r from-yellow-400 to-yellow-600"
      case 2:
        return "bg-gradient-to-r from-gray-300 to-gray-500"
      case 3:
        return "bg-gradient-to-r from-amber-400 to-amber-600"
      default:
        return "bg-gradient-to-r from-blue-500 to-purple-600"
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
          Leaderboard
        </h1>
        <p className="text-muted-foreground">Compete with other students and track your financial progress</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Leaderboard */}
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Top Savers This Month</CardTitle>
              <CardDescription>Students ranked by their savings achievements and consistency</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {leaderboardData.map((user) => (
                  <div
                    key={user.id}
                    className={`flex items-center gap-4 p-4 rounded-lg border transition-colors ${
                      user.isCurrentUser
                        ? "bg-blue-50 border-blue-200 ring-2 ring-blue-500 ring-opacity-20"
                        : "hover:bg-gray-50"
                    }`}
                  >
                    <div className="flex items-center justify-center w-8 h-8">{getRankIcon(user.rank)}</div>

                    <Avatar className="h-12 w-12">
                      <AvatarImage src={user.avatar || "/placeholder.svg"} alt={user.name} />
                      <AvatarFallback>
                        {user.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold truncate">{user.name}</h3>
                        {user.isCurrentUser && <Badge variant="secondary">You</Badge>}
                      </div>
                      <p className="text-sm text-muted-foreground">{user.level}</p>
                      <div className="flex gap-1 mt-1">
                        {user.badges.slice(0, 2).map((badge) => (
                          <Badge key={badge} variant="outline" className="text-xs">
                            {badge}
                          </Badge>
                        ))}
                        {user.badges.length > 2 && (
                          <Badge variant="outline" className="text-xs">
                            +{user.badges.length - 2}
                          </Badge>
                        )}
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-lg font-bold">{user.points.toLocaleString()}</div>
                      <div className="text-sm text-muted-foreground">points</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

        </div>

        {/* Achievements Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5 text-purple-600" />
                Achievements
              </CardTitle>
              <CardDescription>Unlock badges by reaching milestones</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {achievements.map((achievement) => (
                  <div
                    key={achievement.title}
                    className={`flex items-start gap-3 p-3 rounded-lg border ${
                      achievement.earned ? "bg-green-50 border-green-200" : "bg-gray-50 border-gray-200 opacity-60"
                    }`}
                  >
                    <div
                      className={`p-2 rounded-full ${
                        achievement.earned ? "bg-green-500 text-white" : "bg-gray-300 text-gray-500"
                      }`}
                    >
                      <achievement.icon className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-sm">{achievement.title}</h4>
                      <p className="text-xs text-muted-foreground mt-1">{achievement.description}</p>
                      <div className="flex items-center gap-1 mt-2">
                        <Coins className="h-3 w-3 text-yellow-500" />
                        <span className="text-xs font-medium">{achievement.points} points</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

      
        </div>
      </div>
    </div>
  )
}
