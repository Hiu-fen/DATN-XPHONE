"use client"
import React from "react"

import { clsx } from "clsx"
import { QueryClient, QueryClientProvider, useQuery } from "@tanstack/react-query"
import axios from "axios"
import { Trophy, Crown, Medal, Award, Star, TrendingUp, Users, Gift } from "lucide-react"

// ==== Card Components ====
const Card: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ className, children, ...props }) => (
  <div
    className={clsx(
      "rounded-2xl bg-white/80 backdrop-blur-sm border border-white/20 shadow-xl hover:shadow-2xl transition-all duration-300",
      className,
    )}
    {...props}
  >
    {children}
  </div>
)

const CardHeader: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ className, children, ...props }) => (
  <div className={clsx("flex items-center justify-between p-6 pb-4", className)} {...props}>
    {children}
  </div>
)

const CardTitle: React.FC<React.HTMLAttributes<HTMLHeadingElement>> = ({ className, children, ...props }) => (
  <h3 className={clsx("text-xl font-bold text-gray-800", className)} {...props}>
    {children}
  </h3>
)

const CardContent: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ className, children, ...props }) => (
  <div className={clsx("p-6 pt-2", className)} {...props}>
    {children}
  </div>
)

// ==== Badge Component ====
interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "success" | "destructive" | "warning" | "gold" | "silver" | "bronze"
}

const Badge: React.FC<BadgeProps> = ({ variant = "default", className, children, ...props }) => {
  const base = "inline-flex items-center rounded-full px-3 py-1 text-sm font-bold shadow-sm"
  const colors = {
    default: "bg-gradient-to-r from-blue-500 to-blue-600 text-white",
    success: "bg-gradient-to-r from-green-500 to-green-600 text-white",
    destructive: "bg-gradient-to-r from-red-500 to-red-600 text-white",
    warning: "bg-gradient-to-r from-yellow-500 to-yellow-600 text-white",
    gold: "bg-gradient-to-r from-yellow-400 to-yellow-500 text-yellow-900",
    silver: "bg-gradient-to-r from-gray-300 to-gray-400 text-gray-800",
    bronze: "bg-gradient-to-r from-amber-600 to-amber-700 text-white",
  } as const

  return (
    <span className={clsx(base, colors[variant], className)} {...props}>
      {children}
    </span>
  )
}

// ==== Main Component ====
interface RewardUser {
  email: string
  name: string
  totalPoints: number
}

function RewardsContent() {
  const user = JSON.parse(localStorage.getItem("user") || "{}")
  const myEmail: string = user.email || ""

  const { data: leaderboardRaw, isLoading } = useQuery({
    queryKey: ["reward-leaderboard"],
    queryFn: async () => {
      const res = await axios.get("http://localhost:5000/api/rewards", {
        withCredentials: true,
      })
      return res.data
    },
    staleTime: 1000 * 60 * 5,
  })

  const leaderboard: RewardUser[] = Array.isArray(leaderboardRaw) ? leaderboardRaw : []
  const myCount = leaderboard.find((u) => u.email === myEmail)?.totalPoints || 0
  const myRank = leaderboard.findIndex((u) => u.email === myEmail) + 1

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Crown className="w-8 h-8 text-yellow-500 drop-shadow-lg" />
    if (rank === 2) return <Medal className="w-8 h-8 text-gray-400 drop-shadow-lg" />
    if (rank === 3) return <Award className="w-8 h-8 text-amber-600 drop-shadow-lg" />
    return <Trophy className="w-6 h-6 text-gray-500" />
  }

  const getRankBadgeVariant = (rank: number) => {
    if (rank === 1) return "gold"
    if (rank === 2) return "silver"
    if (rank === 3) return "bronze"
    return "default"
  }

  const getRankBackground = (rank: number) => {
    if (rank === 1) return "bg-gradient-to-r from-yellow-50 to-yellow-100 border-yellow-200"
    if (rank === 2) return "bg-gradient-to-r from-gray-50 to-gray-100 border-gray-200"
    if (rank === 3) return "bg-gradient-to-r from-amber-50 to-amber-100 border-amber-200"
    return "bg-gradient-to-r from-white to-gray-50 border-gray-100 hover:from-blue-50 hover:to-indigo-50"
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100 p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4 mb-12">
          <div className="flex justify-center mb-4">
            <div className="p-4 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full shadow-lg">
              <Trophy className="w-12 h-12 text-white" />
            </div>
          </div>
          <h1 className="text-5xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
            Bảng Xếp Hạng Điểm
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Tài khoản nào có nhiều điểm nhất sẽ được vinh danh tại đây
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="text-center">
            <CardContent className="p-6">
              <div className="flex justify-center mb-3">
                <div className="p-3 bg-blue-100 rounded-full">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-gray-800">{leaderboard.length}</h3>
              <p className="text-gray-600">Tổng người tham gia</p>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardContent className="p-6">
              <div className="flex justify-center mb-3">
                <div className="p-3 bg-green-100 rounded-full">
                  <TrendingUp className="w-6 h-6 text-green-600" />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-gray-800">#{myRank || "N/A"}</h3>
              <p className="text-gray-600">Thứ hạng của bạn</p>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardContent className="p-6">
              <div className="flex justify-center mb-3">
                <div className="p-3 bg-purple-100 rounded-full">
                  <Gift className="w-6 h-6 text-purple-600" />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-gray-800">{myCount}</h3>
              <p className="text-gray-600">Điểm của bạn</p>
            </CardContent>
          </Card>
        </div>

        {/* My Stats Card */}
        <Card className="border-2 border-indigo-200 bg-gradient-to-r from-indigo-50 to-purple-50">
          <CardHeader>
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-indigo-500 rounded-lg">
                <Star className="w-6 h-6 text-white" />
              </div>
              <CardTitle className="text-indigo-800">Thành tích của bạn</CardTitle>
            </div>
            <Badge variant="success" className="text-lg px-4 py-2">
              {myCount} điểm
            </Badge>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p className="text-gray-700">
                <span className="font-semibold">Email:</span> {myEmail}
              </p>
              <p className="text-gray-700">
                <span className="font-semibold">Thứ hạng hiện tại:</span> #{myRank || "Chưa xếp hạng"}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Leaderboard */}
        <Card className="overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white">
            <CardTitle className="text-white text-2xl flex items-center space-x-3">
              <Trophy className="w-8 h-8" />
              <span>Bảng Xếp Hạng</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="space-y-1">
              {leaderboard.map((user, idx) => (
                <div
                  key={user.email}
                  className={clsx(
                    "flex items-center justify-between p-6 border-l-4 transition-all duration-200 hover:scale-[1.02] hover:shadow-md",
                    getRankBackground(idx + 1),
                    user.email === myEmail && "ring-2 ring-indigo-400 bg-indigo-50",
                  )}
                >
                  <div className="flex items-center space-x-6">
                    <div className="flex items-center space-x-3">
                      {getRankIcon(idx + 1)}
                      <div className="text-center">
                        <Badge variant={getRankBadgeVariant(idx + 1)} className="text-lg px-3 py-1">
                          #{idx + 1}
                        </Badge>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <h3 className="font-bold text-lg text-gray-800">
                        {user.name || user.email}
                        {user.email === myEmail && (
                          <span className="ml-2 text-sm bg-indigo-100 text-indigo-800 px-2 py-1 rounded-full">Bạn</span>
                        )}
                      </h3>
                      <p className="text-gray-600">
                        Đã tích lũy <span className="font-semibold text-indigo-600">{user.totalPoints}</span> điểm
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold text-gray-800">{user.totalPoints}</div>
                    <div className="text-sm text-gray-500">điểm</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center py-8">
          <p className="text-gray-500">
            Dữ liệu được cập nhật theo thời gian thực • Chúc mừng các thành viên xuất sắc! 🎉
          </p>
        </div>
      </div>
    </div>
  )
}

export default function RewardsPage() {
  // Create QueryClient only once
  const [queryClient] = React.useState(() => new QueryClient())

  return (
    <QueryClientProvider client={queryClient}>
      <RewardsContent />
    </QueryClientProvider>
  )
}
