"use client"

import { useEffect, useState } from "react"

interface MoneyJarVisualProps {
  currentAmount: number
  targetAmount: number
  level: number
  isAnimating?: boolean
}

export function MoneyJarVisual({ currentAmount, targetAmount, level, isAnimating = false }: MoneyJarVisualProps) {
  const [displayAmount, setDisplayAmount] = useState(currentAmount)
  const fillPercentage = Math.min((displayAmount / targetAmount) * 100, 100)

  // Animate the fill when amount changes
  useEffect(() => {
    if (currentAmount !== displayAmount) {
      const duration = 1000 // 1 second animation
      const steps = 60
      const stepValue = (currentAmount - displayAmount) / steps
      let currentStep = 0

      const timer = setInterval(() => {
        currentStep++
        setDisplayAmount((prev) => {
          const newAmount = prev + stepValue
          if (currentStep >= steps) {
            clearInterval(timer)
            return currentAmount
          }
          return newAmount
        })
      }, duration / steps)

      return () => clearInterval(timer)
    }
  }, [currentAmount, displayAmount])

  // Color scheme based on level
  const getJarColors = (level: number) => {
    const colors = [
      { jar: "#2563eb", liquid: "#3b82f6", glow: "#60a5fa" }, // Blue
      { jar: "#059669", liquid: "#10b981", glow: "#34d399" }, // Green
      { jar: "#d97706", liquid: "#f59e0b", glow: "#fbbf24" }, // Orange
      { jar: "#dc2626", liquid: "#ef4444", glow: "#f87171" }, // Red
      { jar: "#7c3aed", liquid: "#8b5cf6", glow: "#a78bfa" }, // Purple
    ]
    return colors[level % colors.length]
  }

  const colors = getJarColors(level - 1)
  const isNearlyFull = fillPercentage >= 90
  const isOverflowing = fillPercentage >= 100

  return (
    <div className="relative flex items-center justify-center">
      {/* Floating money emoji during animation */}
      {isAnimating && (
        <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 animate-bounce z-20">
          <span className="text-2xl">💰</span>
        </div>
      )}

      {/* Glow effect when nearly full */}
      {isNearlyFull && (
        <div
          className="absolute inset-0 rounded-full blur-xl opacity-30 animate-pulse"
          style={{ backgroundColor: colors.glow }}
        />
      )}

      {/* SVG Jar */}
      <svg width="200" height="280" viewBox="0 0 200 280" className="relative z-10">
        {/* Jar Body */}
        <path
          d="M40 80 L40 220 Q40 240 60 240 L140 240 Q160 240 160 220 L160 80 Z"
          fill="none"
          stroke={colors.jar}
          strokeWidth="3"
          className="drop-shadow-lg"
        />

        {/* Jar Neck */}
        <rect x="70" y="60" width="60" height="25" fill="none" stroke={colors.jar} strokeWidth="3" rx="5" />

        {/* Jar Rim */}
        <rect x="65" y="55" width="70" height="10" fill={colors.jar} rx="5" />

        {/* Liquid Fill */}
        <defs>
          <clipPath id="jarClip">
            <path d="M43 83 L43 217 Q43 237 60 237 L140 237 Q157 237 157 217 L157 83 Z" />
          </clipPath>

          {/* Liquid gradient */}
          <linearGradient id="liquidGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={colors.liquid} stopOpacity="0.9" />
            <stop offset="100%" stopColor={colors.liquid} stopOpacity="1" />
          </linearGradient>

          {/* Bubble pattern */}
          <pattern id="bubbles" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
            <circle cx="5" cy="5" r="1" fill="white" opacity="0.3" />
            <circle cx="15" cy="12" r="0.8" fill="white" opacity="0.2" />
            <circle cx="10" cy="18" r="1.2" fill="white" opacity="0.25" />
          </pattern>
        </defs>

        {/* Main liquid */}
        <rect
          x="43"
          y={237 - (fillPercentage / 100) * 154}
          width="114"
          height={(fillPercentage / 100) * 154}
          fill="url(#liquidGradient)"
          clipPath="url(#jarClip)"
          className={isAnimating ? "transition-all duration-1000 ease-out" : ""}
        />

        {/* Bubbles in liquid */}
        {fillPercentage > 0 && (
          <rect
            x="43"
            y={237 - (fillPercentage / 100) * 154}
            width="114"
            height={(fillPercentage / 100) * 154}
            fill="url(#bubbles)"
            clipPath="url(#jarClip)"
            opacity="0.6"
          />
        )}

        {/* Wave effect on liquid surface */}
        {fillPercentage > 0 && (
          <path
            d={`M43 ${237 - (fillPercentage / 100) * 154} Q70 ${237 - (fillPercentage / 100) * 154 - 3} 100 ${237 - (fillPercentage / 100) * 154} T157 ${237 - (fillPercentage / 100) * 154}`}
            fill={colors.liquid}
            clipPath="url(#jarClip)"
            className="animate-pulse"
            opacity="0.8"
          />
        )}

        {/* Overflow effect */}
        {isOverflowing && (
          <>
            <path d="M43 83 Q70 80 100 83 T157 83" fill={colors.liquid} opacity="0.7" className="animate-bounce" />
            <text
              x="100"
              y="45"
              textAnchor="middle"
              className="text-sm font-bold fill-current animate-pulse"
              fill={colors.liquid}
            >
              FULL!
            </text>
          </>
        )}

        {/* Jar Label */}
        <rect
          x="60"
          y="140"
          width="80"
          height="30"
          fill="white"
          stroke={colors.jar}
          strokeWidth="1"
          rx="5"
          opacity="0.9"
        />

        <text x="100" y="152" textAnchor="middle" className="text-xs font-semibold" fill={colors.jar}>
          Level {level}
        </text>

        <text x="100" y="165" textAnchor="middle" className="text-xs" fill={colors.jar}>
          {fillPercentage.toFixed(1)}%
        </text>
      </svg>

      {/* Status message */}
      <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 text-center">
        <p className="text-sm font-medium" style={{ color: colors.jar }}>
          {fillPercentage < 25
            ? "Just getting started! 🌱"
            : fillPercentage < 50
              ? "Making progress! 📈"
              : fillPercentage < 75
                ? "Halfway there! 🎯"
                : fillPercentage < 90
                  ? "Almost full! 🔥"
                  : fillPercentage < 100
                    ? "So close! 🚀"
                    : "Jar completed! 🎉"}
        </p>
      </div>
    </div>
  )
}
