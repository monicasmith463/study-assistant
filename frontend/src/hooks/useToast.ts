"use client"

import { useState, useCallback } from "react"
import type { ToastItem } from "@/components/ui/toast/ToastContainer"

export function useToast() {
  const [toasts, setToasts] = useState<ToastItem[]>([])

  const showToast = useCallback(
    (message: string, type?: ToastItem["type"], duration?: number) => {
      const id = Math.random().toString(36).substring(2, 9)
      const newToast: ToastItem = { id, message, type, duration }
      setToasts((prev) => [...prev, newToast])
      return id
    },
    []
  )

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id))
  }, [])

  const showError = useCallback(
    (message: string, duration?: number) => {
      return showToast(message, "error", duration)
    },
    [showToast]
  )

  const showSuccess = useCallback(
    (message: string, duration?: number) => {
      return showToast(message, "success", duration)
    },
    [showToast]
  )

  return {
    toasts,
    showToast,
    showError,
    showSuccess,
    removeToast,
  }
}
