"use client"

import { ThemeToggleButton } from "@/components/common/ThemeToggleButton"
import UserDropdown from "@/components/header/UserDropdown"
import Button from "@/components/ui/button/Button"
import { useIsLoggedIn } from "@/hooks/useAuth"
import { useSidebar } from "@/context/SidebarContext"
import Link from "next/link"
import React from "react"

const AuthButtons: React.FC = () => (
  <div className="flex items-center gap-3">
    <Link href="/signin">
      <Button
        size="sm"
        variant="outline"
        className="rounded-lg px-6 py-2 text-sm font-medium hover:bg-gray-100 dark:hover:bg-gray-800"
      >
        Sign In
      </Button>
    </Link>

    <Link href="/signup">
      <Button
        size="sm"
        variant="primary"
        className="rounded-lg px-6 py-2 text-sm font-medium"
      >
        Sign Up
      </Button>
    </Link>
  </div>
)

const AppHeader: React.FC = () => {
  const isActiveLoggedIn = useIsLoggedIn()
  const { toggleMobileSidebar } = useSidebar()

  return (
    <header className="sticky top-0 z-50 flex h-16 w-full border-b border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
      <div className="flex h-full w-full items-center justify-between px-4 xl:px-6">
        {/* Left side - Mobile menu button and Logo */}
        <div className="flex items-center gap-3">
          <button
            onClick={toggleMobileSidebar}
            className="rounded-lg p-1.5 text-gray-500 hover:bg-gray-100 lg:hidden dark:text-gray-400 dark:hover:bg-gray-800"
            aria-label="Toggle menu"
          >
            <svg
              className="h-6 w-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
          {!isActiveLoggedIn && (
            <Link href="/" className="flex flex-shrink-0 items-center gap-2">
              <span className="text-xl leading-none select-none" aria-hidden>
                📚
              </span>
              <span className="text-base font-semibold tracking-tight text-gray-900 dark:text-gray-100">
                Study Assistant
              </span>
            </Link>
          )}
        </div>

        {/* Right side */}
        <div className="flex items-center gap-4">
          {!isActiveLoggedIn && <AuthButtons />}
          <ThemeToggleButton />
          {isActiveLoggedIn && <UserDropdown />}
        </div>
      </div>
    </header>
  )
}

export default AppHeader
