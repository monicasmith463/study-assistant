"use client"

import AppHeader from "@/layout/AppHeader"
import Backdrop from "@/layout/Backdrop"
import Sidebar from "@/components/layout/Sidebar"
import { useSidebar } from "@/context/SidebarContext"
import { useIsLoggedIn } from "@/hooks/useAuth"
import React from "react"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { isExpanded, isHovered } = useSidebar()
  const isLoggedIn = useIsLoggedIn()

  return (
    <div className="min-h-screen xl:flex">
      {/* Sidebar and Backdrop */}
      {isLoggedIn && <Sidebar />}
      {isLoggedIn && <Backdrop />}
      {/* Main Content Area */}
      <div
        className={`flex-1 transition-all duration-300 ease-in-out ${
          isLoggedIn ? (isExpanded || isHovered ? "lg:ml-64" : "lg:ml-20") : ""
        }`}
      >
        {/* Header */}
        <AppHeader />
        {/* Page Content */}
        <div className="mx-auto p-4 md:p-6">{children}</div>
      </div>
    </div>
  )
}
