"use client"

import React from "react"
import Badge from "@/components/ui/badge/Badge"

type DifficultyBadgeProps = {
  difficulty: string | null | undefined
}

const getDifficultyColor = (
  diff: string | null | undefined
): "success" | "warning" | "error" | "light" => {
  if (!diff) return "light"
  switch (diff) {
    case "easy":
      return "success"
    case "medium":
      return "warning"
    case "hard":
      return "error"
    default:
      return "light"
  }
}

const formatDifficulty = (difficulty: string): string => {
  return difficulty.charAt(0).toUpperCase() + difficulty.slice(1)
}

export default function DifficultyBadge({ difficulty }: DifficultyBadgeProps) {
  if (!difficulty) {
    return <span>—</span>
  }

  return (
    <Badge color={getDifficultyColor(difficulty)} size="sm" variant="light">
      {formatDifficulty(difficulty)}
    </Badge>
  )
}
