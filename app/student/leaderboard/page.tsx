"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { Trophy, Medal, Award, TrendingUp, Target, Coins, Star, Crown, Loader2, AlertCircle, RefreshCw, Search, PiggyBank } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Input } from "@/components/ui/input"
import { useGetEligibilityQuery, useGetLeaderboardQuery, useGetPositionQuery, useGetStatsQuery, useRefreshLeaderboardMutation } from "@/services/controllers/leaderboardController"
import { useSelector } from "react-redux"
import { RootState } from "@/components/dashboard-layout"
import { useState } from "react"
import CrownPic from '../../../public/crown.png'
import Image from "next/image"

// Map jar levels to display names
const getJarLevelName = (level: number): string => {
  const levelNames: Record<number, string> = {
    1: "Money Learner",
    2: "Saver",
    3: "Budget Pro",
    4: "Smart Spender",
    5: "Savings Master"
  }
  return levelNames[level] || `Level ${level}`
}


// Generate mock badges based on user data with colors
const generateBadges = (entry: any): Array<{ text: string, color: string }> => {
  const badges: Array<{ text: string, color: string }> = []

  if (entry.Goal_Completion_Rate === 100) {
    badges.push({ text: "Goal Crusher", color: "bg-yellow-500 text-white" })
  }

  if (entry.Goals_Completed >= 3) {
    badges.push({ text: "Consistent Saver", color: "bg-green-500 text-white" })
  }

  if (entry.Jar_Level >= 4) {
    badges.push({ text: "Budget Master", color: "bg-purple-500 text-white" })
  }

  badges.push({ text: entry.Badge_Title, color: "bg-blue-500 text-white" })

  return badges
}
// Generate user initials from username
const getUserInitials = (username: string): string => {
  return username
    .split(" ")
    .map(n => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)
}

export default function LeaderboardPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const user = useSelector((state: RootState) => state.auth.user)
  const displayName = user?.username || ''

  const {
    data: leaderboardData,
    isLoading: isLeaderboardLoading,
    error: leaderboardError
  } = useGetLeaderboardQuery()

  const {
    data: eligibilityData,
    isLoading: isEligibilityLoading
  } = useGetEligibilityQuery()

  const {
    data: statsData,
    isLoading: isStatsLoading
  } = useGetStatsQuery()

  const {
    data: positionData,
    isLoading: isPositionLoading
  } = useGetPositionQuery()

  // Add refresh mutation
  const [refreshLeaderboard, { isLoading: isRefreshing, error: refreshError }] = useRefreshLeaderboardMutation()

  // Handle refresh button click
  const handleRefresh = async () => {
    try {
      await refreshLeaderboard({ action: "refresh" }).unwrap()
    } catch (error) {
      console.error('Failed to refresh leaderboard:', error)
    }
  }

  const achievements = [
    {
      title: "First Goal Completed",
      description: "Complete your first savings goal",
      icon: Target,
      earned: (eligibilityData?.data?.Goals_Completed ?? 0) >= 1,
      points: 100,
      level: 1,
      bgColor: "bg-blue-100",
      iconColor: "bg-blue-500"
    },
    {
      title: "Streak Master",
      description: "Save money for 30 consecutive days",
      icon: Star,
      earned: (eligibilityData?.data?.Goals_Completed ?? 0) >= 3,
      points: 200,
      level: 2,
      bgColor: "bg-purple-100",
      iconColor: "bg-purple-500"
    },
    {
      title: "Budget Boss",
      description: "Stay within budget for 3 months",
      icon: Crown,
      earned: (eligibilityData?.data?.Goals_Completed ?? 0) >= 4,
      points: 300,
      level: 3,
      bgColor: "bg-green-100",
      iconColor: "bg-green-500"
    },
    {
      title: "Goal Crusher",
      description: "Complete 5 savings goals",
      icon: Trophy,
      earned: (eligibilityData?.data?.Goals_Completed ?? 0) >= 5,
      points: 500,
      level: 4,
      bgColor: "bg-yellow-100",
      iconColor: "bg-yellow-500"
    },
  ]

  const isCurrentUser = (userId: number): boolean => {
    return positionData?.data?.User_ID === userId
  }

  if (isLeaderboardLoading || isEligibilityLoading || isStatsLoading || isPositionLoading) {
    return (
      <div className="flex items-center justify-center min-h-[500px]">
        <div className="relative">
          <div className="flex h-24 w-24 items-center justify-center rounded-full bg-slate-200 shadow-sm">
            <PiggyBank className="h-10 w-10 text-gray-500" />
          </div>
          <div className="m-4 absolute inset-0 rounded-full border-4 border-transparent border-t-slate-500 border-r-slate-300 animate-spin"></div>
        </div>
      </div>
    )
  }

  if (leaderboardError) {
    return (
      <div className="space-y-6 p-6 bg-gray-50 min-h-screen">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Leaderboard</h1>
            <p className="text-muted-foreground">All representatives • Compete</p>
          </div>
          <Button variant="outline" onClick={handleRefresh} disabled={isRefreshing}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            {isRefreshing ? 'Refreshing...' : 'Refresh'}
          </Button>
        </div>

        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Failed to load leaderboard data. Please try again later.
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  const leaderboardEntries = leaderboardData?.data || []
  const topThree = leaderboardEntries.slice(0, 3)
  const remainingEntries = leaderboardEntries.slice(3)

  const filteredEntries = remainingEntries.filter(user =>
    user.Username.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-secondary-50 to-primary-50">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Leaderboard</h1>
          <p className="text-muted-foreground">All representatives • Compete</p>
        </div>
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={handleRefresh} disabled={isRefreshing}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            {isRefreshing ? 'Refreshing...' : 'Refresh'}
          </Button>
        </div>
      </div>

      {/* Show refresh error if it exists */}
      {refreshError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Failed to refresh leaderboard. Please try again.
          </AlertDescription>
        </Alert>
      )}

      {/* Show eligibility status if not eligible */}
      {eligibilityData?.data && !eligibilityData.data.Is_Eligible && (
        <Alert className="border-amber-200 bg-amber-50 shadow-sm mb-3">
          <AlertTitle className="text-amber-900 font-semibold text-base">
            Eligibility Requirements Not Met
          </AlertTitle>
          <AlertDescription className="text-amber-800 mt-2 leading-relaxed">
            <div className="space-y-2">
              <p className="text-sm">{eligibilityData.data.Progress_Message}</p>
              <div className="flex flex-col sm:flex-row gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-amber-500"></div>
                  <span className="font-medium">
                    {eligibilityData.data.Goals_Required - eligibilityData.data.Goals_Completed} more completed goals required
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-amber-500"></div>
                  <span className="font-medium">
                    Jar level {eligibilityData.data.Jar_Level_Required} needed
                  </span>
                </div>
              </div>
            </div>
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-3 space-y-6">
          {/* Top 3 Podium */}
          <Card className="bg-gradient-to-r from-blue-500 to-blue-700 text-white">
            <CardContent className="p-8 mt-6">
              <div className="flex items-end justify-center gap-8 relative">
                {/* Second Place */}
                {topThree[1] && (
                  <div className="text-center">
                    <div className="relative mb-4">
                      <Avatar className="h-16 w-16 mx-auto border-4 border-gray-300">
                        <AvatarImage src={topThree[1]?.ProfilePicture || `https://ui-avatars.com/api/?name=${topThree[1].Username}&background=random`} />
                        <AvatarFallback>{getUserInitials(topThree[1].Username)}</AvatarFallback>
                      </Avatar>
                    </div>
                    <h3 className="font-semibold">{topThree[1].Username}</h3>
                    <p className="text-sm opacity-80">{getJarLevelName(topThree[1].Jar_Level)}</p>
                    <div className="bg-white/20 rounded-lg py-4 px-3 mt-4 backdrop-blur-sm">
                      <div className="text-3xl font-bold text-yellow-300">2</div>
                    </div>
                  </div>
                )}

                {/* First Place */}
                {topThree[0] && (
                  <div className="text-center relative -mt-4">
                    <div className="relative mb-4">
                      <Avatar className="h-20 w-20 mx-auto border-4 border-yellow-400">
                        <AvatarImage src={topThree[0]?.ProfilePicture || `https://ui-avatars.com/api/?name=${topThree[0].Username}&background=random`} />
                        <AvatarFallback>{getUserInitials(topThree[0].Username)}</AvatarFallback>
                      </Avatar>
                      <Image src={CrownPic} alt="Crown" className="absolute -top-9 left-1/2 transform -translate-x-1/2 h-8 w-8" />
                    </div>
                    <h3 className="font-semibold text-lg">{topThree[0].Username}</h3>
                    <p className="text-sm opacity-80">{getJarLevelName(topThree[0].Jar_Level)}</p>
                    <div className="bg-white/20 rounded-lg py-6 px-4 mt-4 backdrop-blur-sm">
                      <div className="text-4xl font-bold text-yellow-300">1</div>
                    </div>
                  </div>
                )}

                {/* Third Place */}
                {topThree[2] && (
                  <div className="text-center">
                    <div className="relative mb-4">
                      <Avatar className="h-16 w-16 mx-auto border-4 border-amber-600">
                        <AvatarImage src={topThree[2]?.ProfilePicture || `https://ui-avatars.com/api/?name=${topThree[2].Username}&background=random`} />
                        <AvatarFallback className="text-blue-400 font-semibold text-xl">{getUserInitials(topThree[2].Username)}</AvatarFallback>
                      </Avatar>
                    </div>
                    <h3 className="font-semibold">{topThree[2].Username}</h3>
                    <p className="text-sm opacity-80">{getJarLevelName(topThree[2].Jar_Level)}</p>
                    <div className="bg-white/20 rounded-lg py-4 px-3 mt-4 backdrop-blur-sm">
                      <div className="text-3xl font-bold text-yellow-300">3</div>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Search and Rankings */}
          <Card>
            <CardContent className="p-6">
              <div className="space-y-3">
                {filteredEntries.map((user, index) => (
                  <div
                    key={user.User_ID}
                    className={`flex items-center gap-4 p-4 rounded-lg border transition-colors ${isCurrentUser(user.User_ID)
                      ? "bg-blue-50 border-blue-200"
                      : "hover:bg-gray-50"
                      }`}
                  >
                    <div className="flex items-center justify-center w-8 h-8">
                      <span className="text-lg font-bold text-muted-foreground">{index + 4}</span>
                    </div>

                    <Avatar className="h-12 w-12">
                      <AvatarImage src={user?.ProfilePicture || `https://ui-avatars.com/api/?name=${user.Username}&background=random`} />
                      <AvatarFallback>{getUserInitials(user.Username)}</AvatarFallback>
                    </Avatar>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">{user.Username}</h3>
                        {isCurrentUser(user.User_ID) && <Badge className="bg-blue-500 text-white">You</Badge>}
                      </div>
                      <p className="text-sm text-muted-foreground">{getJarLevelName(user.Jar_Level)}</p>

                      {/* Goals and Badges */}
                      <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                        <span>Goals: {user.Goals_Completed}/{user.Total_Goals}</span>
                        <span>Rate: {user.Goal_Completion_Rate}%</span>
                      </div>

                      {/* Badges */}
                      <div className="flex gap-1 mt-2">
                        {generateBadges(user).slice(0, 3).map((badge, badgeIndex) => (
                          <Badge key={badgeIndex} variant="outline" className={`text-xs ${badge.color}`}>
                            {badge.text}
                          </Badge>
                        ))}
                        {generateBadges(user).length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{generateBadges(user).length - 3}
                          </Badge>
                        )}
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-lg font-bold">{user.Score.toLocaleString()}</div>
                      <div className="text-sm text-muted-foreground">points</div>
                      <div className="text-sm text-muted-foreground mt-1">
                        <TrendingUp className="inline h-3 w-3 mr-1 text-green-500" />
                        {user.Goal_Completion_Rate}% from last month
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Sidebar */}
        <div className="space-y-6">
          {/* User Profile Card */}
          {positionData?.data && (
            <Card className="border-blue-500 border">
              <CardContent className="p-6 text-center">
                <Avatar className="h-16 w-16 mx-auto mb-4 border-2 border-blue-500">
                  <AvatarImage src={topThree[0]?.ProfilePicture || `https://ui-avatars.com/api/?name=${topThree[0].Username}&background=random`} />
                  <AvatarFallback>{getUserInitials(displayName)}</AvatarFallback>
                </Avatar>
                <h3 className="font-bold text-lg">{displayName}</h3>
                <div className="flex items-center justify-center gap-1 mb-4">
                  <Star className="h-4 w-4 text-yellow-500 fill-current" />
                  <Star className="h-4 w-4 text-yellow-500 fill-current" />
                  <Star className="h-4 w-4 text-yellow-500 fill-current" />
                  <Star className="h-4 w-4 text-gray-300" />
                  <Star className="h-4 w-4 text-gray-300" />
                </div>

                <div className="text-center mb-4">
                  <div className="text-2xl font-bold">#{positionData.data.Rank}</div>
                  <p className="text-sm text-muted-foreground">Current Rank</p>
                </div>

                <div className="space-y-3 text-left">
                  <div className="flex justify-between text-sm">
                    <span>Jar Level:</span>
                    <span className="font-medium">{positionData.data.Jar_Level}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Completion Rate:</span>
                    <span className="font-medium">{positionData.data.Goal_Completion_Rate}%</span>
                  </div>
                  <Progress value={positionData.data.Goal_Completion_Rate} className="h-2" />
                  <div className="flex justify-between text-sm">
                    <span>Total Score:</span>
                    <span className="font-medium">{positionData.data.Score} points</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Achievements */}
          <Card>
            <CardHeader>
              <CardTitle>Achievements</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {achievements.map((achievement, index) => (
                <div key={achievement.title} className="flex items-center gap-3">
                  <div className={`relative p-3 rounded-xl ${achievement.bgColor}`}>
                    <div className={`absolute -top-1 -right-1 w-5 h-5 rounded-full ${achievement.iconColor} flex items-center justify-center`}>
                      <span className="text-xs font-bold text-white">{achievement.level}</span>
                    </div>
                    <achievement.icon className={`h-6 w-6 ${achievement.earned ? 'text-gray-700' : 'text-gray-400'}`} />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-sm">{achievement.title}</h4>
                    <div className="flex items-center gap-1 mt-1">
                      <Coins className="h-3 w-3 text-yellow-500" />
                      <span className="text-xs text-muted-foreground">{achievement.points} points</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-lg font-bold">{index + 1}</span>
                  </div>
                </div>
              ))}


              {/* Progress Bar at Bottom */}
              <div className="mt-6">
                <div className="flex justify-between text-sm mb-2">
                  <span>Level 3</span>
                  <span>87% completed</span>
                </div>
                <Progress value={87} className="h-2" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}