"use client"
import React from "react"

type Props = {
  score: number | null | undefined
  total: number
}

export default function YourScore({ score }: Props) {
  const displayScore = score ?? 0

  return (
    <div className="mb-6 rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-800 dark:bg-gray-900/50">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Your Score
        </span>
        <span className="text-2xl font-semibold text-gray-800 dark:text-white/90">
          {displayScore} %
        </span>
      </div>
    </div>
  )
}
