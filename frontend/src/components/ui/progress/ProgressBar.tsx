import React from "react"

interface ProgressBarProps {
  value: number // 0-100
  className?: string
  showLabel?: boolean
  color?: "success" | "warning" | "error"
  size?: "sm" | "md" | "lg"
}

export default function ProgressBar({
  value,
  className = "",
  showLabel = false,
  color = "success",
  size = "md",
}: ProgressBarProps) {
  // Clamp value between 0 and 100
  const percentage = Math.min(Math.max(value, 0), 100)

  // Size classes
  const sizeClasses = {
    sm: "h-1.5",
    md: "h-2.5",
    lg: "h-4",
  }

  // Color classes
  const colorClasses = {
    success: "bg-success-500",
    warning: "bg-warning-500",
    error: "bg-error-500",
  }

  // Background color classes
  const bgColorClasses = {
    success: "bg-success-500/10",
    warning: "bg-warning-500/10",
    error: "bg-error-500/10",
  }

  return (
    <div className={className}>
      {showLabel && (
        <div className="mb-2 flex items-center justify-between">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Progress
          </span>
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {Math.round(percentage)}%
          </span>
        </div>
      )}
      <div
        className={`w-full overflow-hidden rounded-full ${sizeClasses[size]} ${bgColorClasses[color]}`}
      >
        <div
          className={`h-full rounded-full transition-all duration-500 ease-out ${colorClasses[color]}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  )
}
