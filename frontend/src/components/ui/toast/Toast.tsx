"use client"

import React, { useEffect } from "react"
import { CloseIcon } from "@/icons"

export type ToastType = "success" | "error" | "warning" | "info"

interface ToastProps {
  message: string
  type?: ToastType
  duration?: number
  onClose: () => void
}

export default function Toast({
  message,
  type = "info",
  duration = 5000,
  onClose,
}: ToastProps) {
  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        onClose()
      }, duration)
      return () => clearTimeout(timer)
    }
  }, [duration, onClose])

  const typeStyles = {
    success:
      "bg-success-50 border-success-200 text-success-800 dark:bg-success-500/15 dark:border-success-500/30 dark:text-success-400",
    error:
      "bg-error-50 border-error-200 text-error-800 dark:bg-error-500/15 dark:border-error-500/30 dark:text-error-400",
    warning:
      "bg-warning-50 border-warning-200 text-warning-800 dark:bg-warning-500/15 dark:border-warning-500/30 dark:text-warning-400",
    info: "bg-blue-light-50 border-blue-light-200 text-blue-light-800 dark:bg-blue-light-500/15 dark:border-blue-light-500/30 dark:text-blue-light-400",
  }

  return (
    <div
      className={`flex items-center gap-3 rounded-lg border px-4 py-3 shadow-lg ${typeStyles[type]}`}
      role="alert"
    >
      <p className="flex-1 text-sm font-medium">{message}</p>
      <button
        onClick={onClose}
        className="flex-shrink-0 text-current opacity-70 hover:opacity-100"
        aria-label="Close"
      >
        <CloseIcon className="h-5 w-5" />
      </button>
    </div>
  )
}
