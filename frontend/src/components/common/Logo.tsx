import React from "react"
import Link from "next/link"

interface LogoProps {
  className?: string
  showText?: boolean
  onClick?: () => void
}

export default function Logo({
  className = "",
  showText = true,
  onClick,
}: LogoProps) {
  return (
    <Link
      href="/"
      className={`flex flex-shrink-0 items-center gap-2 ${className}`}
      onClick={onClick}
    >
      <span className="text-xl leading-none select-none" aria-hidden>
        📚
      </span>
      {showText && (
        <span className="text-base font-semibold tracking-tight text-gray-900 dark:text-gray-100">
          Study Assistant
        </span>
      )}
    </Link>
  )
}
